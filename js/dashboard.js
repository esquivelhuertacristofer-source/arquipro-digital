/* ==========================================================================
   ARQUIPRO DIGITAL - Panel de Control del Usuario (Dashboard / Mi Cuenta)
   ========================================================================== */

// --- Base de Datos de Productos (Para Referencia) ---
const productsList = {
    "p-1": { name: "Mega Pack de Bloques 2D Dinámicos", category: "AutoCAD", image: "assets/autocad_pack.png", file: "arquipro_master_blocks_2d.zip" },
    "p-2": { name: "Librería Máster de Familias Paramétricas", category: "Revit (BIM)", image: "assets/revit_pack.png", file: "arquipro_revit_families.zip" },
    "p-3": { name: "Bitácora y Plantilla de Control de Obra", category: "Excel", image: "assets/excel_pack.png", file: "arquipro_control_obra.xlsx" },
    "p-4": { name: "Pack de Materiales PBR Hormigón & Concreto", category: "Texturas & 3D", image: "assets/textures_pack.png", file: "arquipro_concrete_pbr_textures.zip" },
    "p-5": { name: "Diseño de Zapatas y Columnas de Concreto", category: "Excel", image: "assets/excel_pack.png", file: "arquipro_diseno_zapatas.xlsx" },
    "p-6": { name: "Plantilla Planos Municipales Normalizada", category: "AutoCAD", image: "assets/autocad_pack.png", file: "arquipro_planos_municipales.zip" },
    "p-7": { name: "Plantilla de Proyecto Residencial BIM (LOD 300)", category: "Revit (BIM)", image: "assets/revit_pack.png", file: "arquipro_proyecto_residencial.zip" },
    "p-8": { name: "Generador de Números de Acero y Concreto", category: "Excel", image: "assets/excel_pack.png", file: "arquipro_numeros_acero.xlsx" },
    "p-9": { name: "Detalles Constructivos de Cimentaciones", category: "AutoCAD", image: "assets/autocad_pack.png", file: "arquipro_detalles_cimentaciones.zip" },
    "p-10": { name: "Familias MEP: Instalaciones Hidrosanitarias", category: "Revit (BIM)", image: "assets/revit_pack.png", file: "arquipro_familias_mep.zip" },
    "p-11": { name: "Colección de Vegetación 3D para Lumion & V-Ray", category: "Texturas & 3D", image: "assets/textures_pack.png", file: "arquipro_vegetacion_3d.zip" },
    "p-12": { name: "Pack de Texturas de Maderas Finas y Acabados", category: "Texturas & 3D", image: "assets/textures_pack.png", file: "arquipro_maderas_pbr.zip" },
    "p-mega": { name: "Mega Pack Todo en Uno ARQUIPRO MASTER", category: "Mega Pack", image: "assets/hero_bg.png", file: "arquipro_mega_pack_todo_en_uno.zip" }
};

let currentUser = null;
let purchases = [];

// --- Elementos del DOM ---
const elements = {
    userName: document.getElementById("db-user-name"),
    userSidebarName: document.getElementById("db-user-sidebar-name"),
    userSidebarEmail: document.getElementById("db-user-sidebar-email"),
    
    // Tab buttons and sheets
    menuButtons: document.querySelectorAll(".db-menu-btn"),
    tabContents: document.querySelectorAll(".db-tab-content"),
    
    // Grid y Tablas
    downloadsGrid: document.getElementById("db-downloads-grid"),
    downloadsEmpty: document.getElementById("db-downloads-empty"),
    historyTbody: document.getElementById("db-history-tbody"),
    historyEmpty: document.getElementById("db-history-empty"),
    historyTableWrapper: document.getElementById("db-history-table-wrapper"),
    
    // Profile Form
    profileForm: document.getElementById("db-profile-form"),
    profileName: document.getElementById("profile-name"),
    profileEmail: document.getElementById("profile-email"),
    profilePhone: document.getElementById("profile-phone"),
    profileProfession: document.getElementById("profile-profession"),
    saveStatusMsg: document.getElementById("save-status-msg"),
    
    // Actions
    logoutBtn: document.getElementById("dashboard-logout-btn"),
    demoBanner: document.getElementById("demo-banner")
};

// ==========================================================================
// 1. INICIALIZACIÓN Y SESIÓN
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    // Verificar si estamos en modo Demo
    if (typeof ARQUIPRO_CONFIG !== 'undefined' && ARQUIPRO_CONFIG.isDemoMode()) {
        if (elements.demoBanner) elements.demoBanner.style.display = "block";
    }

    // Cargar Sesión del Usuario
    currentUser = await ArquiProDB.auth.getSession();
    
    if (!currentUser) {
        // Si no hay sesión activa, redirigir a Login
        console.log("No active session found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }
    
    // Rellenar Datos del Usuario en el UI
    updateUserUI();
    
    // Rellenar Formularios
    fillProfileForm();
    
    // Consultar compras del usuario desde Supabase/localStorage
    purchases = await ArquiProDB.orders.getByUser(currentUser.id);
    
    // Renderizar Vistas
    renderDownloads();
    renderHistory();
    
    // Inicializar Widget de WhatsApp Flotante
    initWhatsAppWidget();
    
    // Manejar Navegación de Tabs
    elements.menuButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            
            // Toggle Active Classes en Botones
            elements.menuButtons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            
            // Toggle Active Classes en Paneles
            elements.tabContents.forEach(tab => {
                if (tab.id === `tab-${targetTab}`) {
                    tab.classList.add("active");
                } else {
                    tab.classList.remove("active");
                }
            });
        });
    });
    
    // Guardar Perfil
    if (elements.profileForm) {
        elements.profileForm.addEventListener("submit", handleProfileSave);
    }
    
    // Cerrar Sesión
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", async () => {
            await ArquiProDB.auth.signOut();
            window.location.href = "index.html";
        });
    }
});

// ==========================================================================
// 2. LOGICA DEL USUARIO Y PERFIL
// ==========================================================================

function updateUserUI() {
    if (elements.userName) elements.userName.textContent = currentUser.name;
    if (elements.userSidebarName) elements.userSidebarName.textContent = currentUser.name;
    if (elements.userSidebarEmail) elements.userSidebarEmail.textContent = currentUser.email;
}

function fillProfileForm() {
    if (!elements.profileForm) return;
    elements.profileName.value = currentUser.name || "";
    elements.profileEmail.value = currentUser.email || "";
    elements.profilePhone.value = currentUser.phone || "";
    if (elements.profileProfession) {
        elements.profileProfession.value = currentUser.profession || "Arquitecto";
    }
}

async function handleProfileSave(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById("profile-save-btn");
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Guardando... <i class="fa-solid fa-spinner fa-spin"></i>';

    const profileData = {
        name: elements.profileName.value.trim(),
        phone: elements.profilePhone.value.trim(),
        profession: elements.profileProfession.value
    };
    
    try {
        currentUser = await ArquiProDB.profile.update(currentUser.id, profileData);
        updateUserUI();
        
        // Mostrar mensaje de éxito
        if (elements.saveStatusMsg) {
            elements.saveStatusMsg.textContent = "¡Perfil actualizado correctamente!";
            elements.saveStatusMsg.classList.add("show");
            
            setTimeout(() => {
                elements.saveStatusMsg.classList.remove("show");
            }, 3000);
        }
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Error al actualizar el perfil: " + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Guardar Cambios <i class="fa-solid fa-floppy-disk"></i>';
    }
}

// ==========================================================================
// 3. RENDERIZADO DE DESCARGAS E HISTORIAL
// ==========================================================================

function renderDownloads() {
    if (!elements.downloadsGrid) return;
    
    // Filtrar solo las compras aprobadas para descargas
    const approvedPurchases = purchases.filter(p => p.status === 'Aprobado');

    if (approvedPurchases.length === 0) {
        elements.downloadsGrid.style.display = "none";
        elements.downloadsEmpty.style.display = "block";
        return;
    }
    
    elements.downloadsGrid.style.display = "grid";
    elements.downloadsEmpty.style.display = "none";
    elements.downloadsGrid.innerHTML = "";
    
    // Agrupar compras por producto (evitar duplicados en descargas)
    const uniqueProductIds = [...new Set(approvedPurchases.map(p => p.productId))];
    
    uniqueProductIds.forEach(prodId => {
        const prodDetails = productsList[prodId] || { name: "Recurso Adquirido", category: "Varios", image: "assets/autocad_pack.png" };
        
        const card = document.createElement("div");
        card.className = "download-card";
        card.innerHTML = `
            <div class="dl-card-img">
                <img src="${prodDetails.image}" alt="${prodDetails.name}">
            </div>
            <div class="dl-card-info">
                <span class="dl-card-cat">${prodDetails.category}</span>
                <h4 class="dl-card-title">${prodDetails.name}</h4>
                <p class="dl-card-status"><i class="fa-solid fa-circle-check text-primary"></i> Licencia Activa</p>
                <button type="button" class="btn btn-primary btn-sm btn-download-secure" data-id="${prodId}" data-name="${prodDetails.name}">
                    <i class="fa-solid fa-circle-down"></i> Descargar Recurso
                </button>
            </div>
        `;
        elements.downloadsGrid.appendChild(card);
    });
    
    // Evento de descarga
    elements.downloadsGrid.querySelectorAll(".btn-download-secure").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const name = e.currentTarget.dataset.name;
            triggerRealOrSimulatedDownload(name, id);
        });
    });
}

function renderHistory() {
    if (!elements.historyTbody) return;
    
    if (purchases.length === 0) {
        elements.historyTableWrapper.style.display = "none";
        elements.historyEmpty.style.display = "block";
        return;
    }
    
    elements.historyTableWrapper.style.display = "block";
    elements.historyEmpty.style.display = "none";
    elements.historyTbody.innerHTML = "";
    
    purchases.forEach(order => {
        const row = document.createElement("tr");
        const statusClass = order.status === 'Aprobado' ? 'badge-status-ok' : 'badge-status-failed';
        const statusIcon = order.status === 'Aprobado' ? 'fa-check' : 'fa-xmark';
        
        row.innerHTML = `
            <td><code>${order.orderId}</code></td>
            <td>${order.date}</td>
            <td><strong>${order.productName}</strong></td>
            <td>$${order.price.toFixed(2)} USD</td>
            <td>
                <span class="${statusClass}">
                    <i class="fa-solid ${statusIcon}"></i> ${order.status}
                </span>
            </td>
        `;
        elements.historyTbody.appendChild(row);
    });
}

// ==========================================================================
// 4. DESCARGAS REALES PROTEGIDAS (Supabase Storage Integración)
// ==========================================================================

async function triggerRealOrSimulatedDownload(productName, productId) {
    const prodDetails = productsList[productId] || { file: "recurso_arquipro.zip" };
    const fileName = prodDetails.file;

    // Verificar si no es modo demo
    if (typeof ARQUIPRO_CONFIG !== 'undefined' && !ARQUIPRO_CONFIG.isDemoMode()) {
        try {
            console.log(`Solicitando URL firmada de descarga real para: ${fileName}`);
            // Lógica real de descarga con Supabase Storage ( signed URL )
            // Asume un bucket privado llamado 'resources' donde se alojan los packs reales
            const { data, error } = await supabaseClient
                .storage
                .from('resources')
                .createSignedUrl(fileName, 60); // Válida por 60 segundos
            
            if (error) throw error;
            
            if (data && data.signedUrl) {
                // Descarga real de la URL firmada
                const link = document.createElement("a");
                link.href = data.signedUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }
        } catch (e) {
            console.error("Error generating signed URL from Supabase Storage:", e);
            alert(`No se pudo obtener el archivo firmado desde el bucket privado de Supabase. Asegúrate de tener el bucket 'resources' y el archivo '${fileName}' configurados con las políticas de acceso correctas.\n\nFallback: Descarga simulada de prueba.`);
        }
    }

    // --- FALLBACK: DESCARGA DE ARCHIVO REAL ESTRUCTURADO (Simulación de descarga segura) ---
    // Generamos un archivo real según el formato
    let blobContent = "";
    let fileExtension = "zip";
    let mimeType = "application/zip";

    if (fileName.endsWith(".xlsx")) {
        fileExtension = "xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        // Generar un mock simple de binario de Excel o una advertencia estructurada
        blobContent = `Plantilla de Excel de ArquiPro Digital\n\nEste archivo simula tu descarga real de: ${productName}.\n\nPara conectarlo con tu bucket real, sube el archivo real de Excel en tu bucket 'resources' de Supabase con el nombre '${fileName}' y desactiva el modo demo en js/config.js.`;
    } else {
        // ZIP mock
        blobContent = `Librería de AutoCAD/Revit de ArquiPro Digital\n\nEste archivo comprimido contiene las librerías seleccionadas.\n\nPara conectarlo con tu bucket real, sube tu archivo real comprimido en tu bucket 'resources' de Supabase con el nombre '${fileName}' y desactiva el modo demo en js/config.js.`;
    }

    const blob = new Blob([blobContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ==========================================================================
// 5. INICIALIZACIÓN DEL BOTÓN FLOTANTE DE WHATSAPP
// ==========================================================================

function initWhatsAppWidget() {
    const container = document.getElementById("whatsapp-widget-container");
    if (!container) return;

    const config = typeof ARQUIPRO_CONFIG !== 'undefined' ? ARQUIPRO_CONFIG : {
        WHATSAPP_NUMBER: "525512345678",
        WHATSAPP_MESSAGE: "Hola, necesito ayuda con mi compra."
    };

    const urlMessage = encodeURIComponent(config.WHATSAPP_MESSAGE);
    const whatsappUrl = `https://wa.me/${config.WHATSAPP_NUMBER}?text=${urlMessage}`;

    container.innerHTML = `
        <a href="${whatsappUrl}" class="whatsapp-floating-btn" target="_blank" rel="noopener noreferrer" title="Soporte por WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
            <span class="whatsapp-pulse"></span>
        </a>
    `;

    // Añadir estilos para el botón de WhatsApp si no se cargaron
    if (!document.getElementById("whatsapp-btn-styles")) {
        const style = document.createElement("style");
        style.id = "whatsapp-btn-styles";
        style.innerHTML = `
            .whatsapp-floating-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: #25d366;
                color: #ffffff;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.2rem;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                z-index: 1000;
                transition: transform 0.3s ease, background-color 0.3s ease;
                text-decoration: none;
            }
            .whatsapp-floating-btn:hover {
                transform: scale(1.1);
                background-color: #128c7e;
                color: #ffffff;
            }
            .whatsapp-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                background-color: #25d366;
                border-radius: 50%;
                z-index: -1;
                opacity: 0.7;
                animation: waPulse 2s infinite;
            }
            @keyframes waPulse {
                0% {
                    transform: scale(1);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(1.6);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
