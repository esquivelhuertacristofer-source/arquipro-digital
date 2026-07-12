// Supabase Edge Function — Crea una preferencia de MercadoPago
// Despliega con: supabase functions deploy create-preference
// Variables de entorno requeridas (supabase secrets set ...):
//   MERCADOPAGO_ACCESS_TOKEN  — Access Token de MercadoPago (TEST-... o producción)
//   SITE_URL                  — URL pública del sitio (ej: https://arquipro.digital)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://arquipro.digital";
const CURRENCY_ID = Deno.env.get("CURRENCY_ID") ?? "MXN";

// Catálogo canónico de precios — el cliente nunca puede manipular el precio
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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  if (!MP_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: "MERCADOPAGO_ACCESS_TOKEN no configurado en los secrets de Supabase." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  let body: {
    productId: string;
    orderId?: string;
    payer?: { name: string; email: string; phone?: string; userId?: string };
    redirectUrls?: { success?: string; failure?: string; pending?: string };
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { productId, orderId, payer, redirectUrls } = body;

  // Validar producto contra catálogo canónico — el precio viene del servidor, no del cliente
  const product = PRODUCT_CATALOG[productId];
  if (!product) {
    return new Response(JSON.stringify({ error: "Producto no reconocido." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const canonicalPrice = product.price;
  const canonicalName  = product.name;

  const successUrl = redirectUrls?.success ?? `${SITE_URL}/pago-exitoso.html`;
  const failureUrl = redirectUrls?.failure ?? `${SITE_URL}/pago-fallido.html`;
  const pendingUrl = redirectUrls?.pending ?? `${SITE_URL}/pago-exitoso.html`;

  const preference = {
    items: [
      {
        id: productId,
        title: canonicalName,
        description: `Recurso digital profesional — ${canonicalName}`,
        category_id: "others",
        currency_id: CURRENCY_ID,
        quantity: 1,
        unit_price: canonicalPrice,
      },
    ],
    ...(payer?.email && {
      payer: {
        name: payer.name ?? "",
        email: payer.email,
        ...(payer.phone && {
          phone: {
            area_code: "52",
            number: payer.phone.replace(/\D/g, "").slice(-10),
          },
        }),
      },
    }),
    back_urls: {
      success: successUrl,
      failure: failureUrl,
      pending: pendingUrl,
    },
    auto_return: "approved",
    external_reference: orderId ?? productId,
    statement_descriptor: "ARQUIPRO DIGITAL",
    ...(payer?.userId && {
      metadata: { user_id: payer.userId },
    }),
  };

  try {
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error("MercadoPago API error:", JSON.stringify(mpData));
      return new Response(
        JSON.stringify({ error: "Error al crear la preferencia en MercadoPago. Intenta de nuevo." }),
        {
          status: mpRes.status,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    return new Response(
      JSON.stringify({
        preferenceId: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(JSON.stringify({ error: "Error interno al conectar con MercadoPago." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
});
