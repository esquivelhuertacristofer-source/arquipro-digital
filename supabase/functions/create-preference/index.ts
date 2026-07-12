// Supabase Edge Function — Crea una preferencia de MercadoPago
// Despliega con: supabase functions deploy create-preference
// Variables de entorno requeridas (supabase secrets set ...):
//   MERCADOPAGO_ACCESS_TOKEN  — Access Token de MercadoPago (TEST-... o producción)
//   SITE_URL                  — URL pública del sitio (ej: https://arquipro.digital)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://arquipro.digital";
const CURRENCY_ID = Deno.env.get("CURRENCY_ID") ?? "MXN";

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
    productName: string;
    price: number;
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

  const { productId, productName, price, orderId, payer, redirectUrls } = body;

  if (!productId || !productName || !price || price <= 0) {
    return new Response(JSON.stringify({ error: "Datos de producto incompletos o inválidos." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const successUrl = redirectUrls?.success ?? `${SITE_URL}/pago-exitoso.html`;
  const failureUrl = redirectUrls?.failure ?? `${SITE_URL}/pago-fallido.html`;
  const pendingUrl = redirectUrls?.pending ?? `${SITE_URL}/pago-exitoso.html`;

  const preference = {
    items: [
      {
        id: productId,
        title: productName,
        description: `Recurso digital profesional — ${productName}`,
        category_id: "others",
        currency_id: CURRENCY_ID,
        quantity: 1,
        unit_price: parseFloat(String(price)),
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
    // external_reference = nuestro orderId interno para reconciliar el pago
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
        JSON.stringify({ error: "Error al crear la preferencia en MercadoPago.", details: mpData }),
        {
          status: mpRes.status,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    return new Response(
      JSON.stringify({
        preferenceId: mpData.id,
        init_point: mpData.init_point,         // URL de producción (pago real)
        sandbox_init_point: mpData.sandbox_init_point, // URL de prueba/sandbox
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
