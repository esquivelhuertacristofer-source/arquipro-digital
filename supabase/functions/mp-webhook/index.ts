// Supabase Edge Function — Webhook de MercadoPago
// Recibe notificaciones IPN de MercadoPago y actualiza/crea órdenes en Supabase.
//
// Despliega con: supabase functions deploy mp-webhook
// Registra la URL en MercadoPago: https://www.mercadopago.com.mx/developers/panel/notifications/ipn
//   URL: https://aqpbqoeccngqmsibohsc.supabase.co/functions/v1/mp-webhook
//
// Variables de entorno requeridas (supabase secrets set ...):
//   MERCADOPAGO_ACCESS_TOKEN    — mismo token que usa create-preference
//   SUPABASE_URL                — inyectado automáticamente por Supabase
//   SUPABASE_SERVICE_ROLE_KEY   — inyectado automáticamente por Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MP_ACCESS_TOKEN      = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? "";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Mapeo canónico product_id → nombre (para registrar órdenes de invitados)
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  "p-1":    { name: "Mega Pack de Bloques 2D Dinámicos",              price: 19.99 },
  "p-2":    { name: "Librería Máster de Familias Paramétricas",       price: 29.99 },
  "p-3":    { name: "Bitácora y Plantilla de Control de Obra",        price: 14.99 },
  "p-4":    { name: "Pack de Materiales PBR Hormigón & Concreto",     price: 12.50 },
  "p-5":    { name: "Diseño de Zapatas y Columnas de Concreto",       price: 18.99 },
  "p-6":    { name: "Plantilla Planos Municipales Normalizada",        price: 12.00 },
  "p-7":    { name: "Plantilla de Proyecto Residencial BIM (LOD 300)",price: 25.00 },
  "p-8":    { name: "Generador de Números de Acero y Concreto",       price: 10.50 },
  "p-9":    { name: "Detalles Constructivos de Cimentaciones",        price: 15.00 },
  "p-10":   { name: "Familias MEP: Instalaciones Hidrosanitarias",    price: 18.50 },
  "p-11":   { name: "Colección de Vegetación 3D para Lumion & V-Ray", price: 22.00 },
  "p-12":   { name: "Pack de Texturas de Maderas Finas y Acabados",   price:  9.99 },
  "p-mega": { name: "Mega Pack Todo en Uno ARQUIPRO MASTER",          price: 49.99 },
};

// Statuses válidos para la tabla orders
const VALID_STATUSES = ["pending", "approved", "rejected", "cancelled"];

serve(async (req) => {
  // MP hace un GET inicial para validar la URL del webhook
  if (req.method === "GET") {
    return new Response("OK", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const topic = url.searchParams.get("topic");
  const type  = url.searchParams.get("type");

  // Solo procesamos notificaciones de pagos
  if (topic !== "payment" && type !== "payment") {
    return new Response("OK", { status: 200 });
  }

  // El ID del pago puede venir en query param o en el body
  let paymentId: string | null = url.searchParams.get("id");

  if (!paymentId) {
    try {
      const bodyText = await req.text();
      const body = JSON.parse(bodyText);
      paymentId = body?.data?.id
        ?? body?.resource?.toString().split("/").pop()
        ?? null;
    } catch {
      // body no parseable — ignorar
    }
  }

  if (!paymentId) {
    return new Response("OK", { status: 200 });
  }

  // Verificar el pago directamente con la API de MercadoPago
  let payment: Record<string, unknown>;
  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) {
      console.error(`MP API error fetching payment ${paymentId}: ${mpRes.status}`);
      return new Response("OK", { status: 200 }); // siempre 200 para que MP no reintente
    }
    payment = await mpRes.json();
  } catch (err) {
    console.error("Error fetching payment from MP:", err);
    return new Response("OK", { status: 200 });
  }

  const rawStatus     = String(payment.status ?? "pending");
  const dbStatus      = VALID_STATUSES.includes(rawStatus) ? rawStatus : "pending";
  const externalRef   = String(payment.external_reference ?? "");
  const mpPaymentId   = String(payment.id);
  const mpPrefId      = String(payment.preference_id ?? "");
  const userId        = (payment.metadata as Record<string, string>)?.user_id ?? null;
  const productId     = (payment.additional_info as Record<string, unknown>)?.items
                          ? ((payment.additional_info as { items: { id: string }[] }).items[0]?.id ?? null)
                          : null;
  const transactionAmount = Number(payment.transaction_amount ?? 0);

  const catalog = productId ? PRODUCT_CATALOG[productId] : null;
  const productName = catalog?.name ?? String(
    (payment.additional_info as Record<string, unknown>)?.items
      ? ((payment.additional_info as { items: { title: string }[] }).items[0]?.title ?? "Recurso")
      : "Recurso"
  );

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  if (externalRef) {
    // Buscar orden existente por external_reference (nuestro orderId interno)
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("mp_payment_id", externalRef)
      .maybeSingle();

    if (existing) {
      // Actualizar estado
      await supabase
        .from("orders")
        .update({
          status:           dbStatus,
          mp_payment_id:    mpPaymentId,
          mp_preference_id: mpPrefId || null,
        })
        .eq("id", existing.id);
    } else if (dbStatus === "approved" && productId && catalog) {
      // Primera vez que vemos este pago (compra de invitado sin pre-orden)
      await supabase.from("orders").insert({
        user_id:          userId,
        product_id:       productId,
        product_name:     productName,
        price:            transactionAmount || catalog.price,
        status:           dbStatus,
        mp_payment_id:    mpPaymentId,
        mp_preference_id: mpPrefId || null,
      });
    }
  }

  return new Response("OK", { status: 200 });
});
