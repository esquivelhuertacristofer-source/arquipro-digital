/* ==========================================================================
   ARQUIPRO DIGITAL - Configuración Global de Integraciones
   ========================================================================== */

// =============================================================================
// INSTRUCCIONES DE CONFIGURACIÓN
// =============================================================================
// 1. Crea un proyecto en https://supabase.com
// 2. Ve a Settings → API → copia "Project URL" y "anon public key"
// 3. Ejecuta supabase/migrations/001_initial_schema.sql en el SQL Editor
// 4. Crea un bucket PRIVADO llamado "resources" en Supabase Storage
// 5. Sube tus archivos ZIP/XLSX al bucket con los nombres de dashboard.js
// 6. Despliega la Edge Function:
//      supabase functions deploy create-preference
//      supabase secrets set MERCADOPAGO_ACCESS_TOKEN="TEST-xxx..." SITE_URL="https://tu-dominio.com"
// 7. Crea una cuenta en https://mercadopago.com.mx/developers → obtén el Access Token
// =============================================================================

const ARQUIPRO_CONFIG = {
    // Supabase → Settings → API → Project URL
    SUPABASE_URL: "https://aqpbqoeccngqmsibohsc.supabase.co",

    // Supabase → Settings → API → anon public key
    SUPABASE_ANON_KEY: "sb_publishable_yBcxP_BkIG1_VXhttPRx4A_Jz4lRqQy",

    // Supabase → Edge Functions → create-preference → URL
    // Dejar vacío = modo demo interactivo (sin pagos reales)
    BACKEND_PREFERENCE_URL: "https://aqpbqoeccngqmsibohsc.supabase.co/functions/v1/create-preference",

    // Soporte WhatsApp — formato internacional sin + ni espacios
    WHATSAPP_NUMBER: "5215520869631",
    WHATSAPP_MESSAGE: "Hola, necesito ayuda con mi compra en ArquiPro Digital. Vengo de la tienda en línea.",

    isDemoMode: function() {
        return this.SUPABASE_URL.includes("your-supabase-project") ||
               this.SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY_PLACEHOLDER" ||
               !this.SUPABASE_URL ||
               !this.SUPABASE_ANON_KEY;
    }
};
