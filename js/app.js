/* ==========================================================================
   ARQUIPRO DIGITAL - Lógica de Catálogo, Autenticación y Compra Directa
   ========================================================================== */

// --- Base de Datos de Productos Digitales ---
const products = [
    {
        id: "p-1",
        name: "Mega Pack de Bloques 2D Dinámicos",
        price: 19.99,
        oldPrice: 45.00,
        category: "autocad",
        categoryLabel: "AutoCAD",
        rating: 5,
        reviews: 142,
        image: "assets/autocad_pack.png",
        description: "Más de 5,000 bloques organizados por capas: vegetación, escalas humanas, autos, simbología e instalaciones."
    },
    {
        id: "p-2",
        name: "Librería Máster de Familias Paramétricas",
        price: 29.99,
        oldPrice: 79.00,
        category: "revit",
        categoryLabel: "Revit (BIM)",
        rating: 5,
        reviews: 218,
        image: "assets/revit_pack.png",
        description: "Mobiliario de oficina, cocinas configurables, puertas y ventanas paramétricas adaptables que aceleran el renderizado."
    },
    {
        id: "p-3",
        name: "Bitácora y Plantilla de Control de Obra",
        price: 14.99,
        oldPrice: 29.99,
        category: "excel",
        categoryLabel: "Excel",
        rating: 4.5,
        reviews: 95,
        image: "assets/excel_pack.png",
        description: "Formulación avanzada para flujo de caja, control de insumos, estimaciones de avance físico-financiero y compras."
    },
    {
        id: "p-4",
        name: "Pack de Materiales PBR Hormigón & Concreto",
        price: 12.50,
        oldPrice: 25.00,
        category: "texturas",
        categoryLabel: "Texturas & 3D",
        rating: 5,
        reviews: 84,
        image: "assets/textures_pack.png",
        description: "Mapas de desplazamiento, rugosidad y normales a resolución 4K. Ideales para renders de estilo brutalista y moderno."
    },
    {
        id: "p-5",
        name: "Diseño de Zapatas y Columnas de Concreto",
        price: 18.99,
        oldPrice: 38.00,
        category: "excel",
        categoryLabel: "Excel",
        rating: 5,
        reviews: 78,
        image: "assets/excel_pack.png",
        description: "Cálculo automatizado bajo normativas ACI 318. Genera reportes listos para memorias de cálculo de forma instantánea."
    },
    {
        id: "p-6",
        name: "Plantilla Planos Municipales Normalizada",
        price: 12.00,
        oldPrice: 25.00,
        category: "autocad",
        categoryLabel: "AutoCAD",
        rating: 4.5,
        reviews: 63,
        image: "assets/autocad_pack.png",
        description: "Solapas, cuadros de datos, tablas de áreas automatizadas y simbología según normativas de desarrollo urbano standard."
    },
    {
        id: "p-7",
        name: "Plantilla de Proyecto Residencial BIM (LOD 300)",
        price: 25.00,
        oldPrice: 50.00,
        category: "revit",
        categoryLabel: "Revit (BIM)",
        rating: 4.8,
        reviews: 41,
        image: "assets/revit_pack.png",
        description: "Archivo base configurado con niveles, fases de obra, tablas de planificación pre-armadas y vistas de impresión listas."
    },
    {
        id: "p-8",
        name: "Generador de Números de Acero y Concreto",
        price: 10.50,
        oldPrice: 20.00,
        category: "excel",
        categoryLabel: "Excel",
        rating: 4.5,
        reviews: 52,
        image: "assets/excel_pack.png",
        description: "Planilla optimizada para cuantificar kilos de acero por diámetro y metros cúbicos de concreto en vigas, losas y columnas."
    },
    {
        id: "p-9",
        name: "Detalles Constructivos de Cimentaciones",
        price: 15.00,
        oldPrice: 35.00,
        category: "autocad",
        categoryLabel: "AutoCAD",
        rating: 5,
        reviews: 37,
        image: "assets/autocad_pack.png",
        description: "Cortes estructurales de zapatas aisladas, corridas, losas de cimentación, trabes de liga y detalles de anclajes en DWG."
    },
    {
        id: "p-10",
        name: "Familias MEP: Instalaciones Hidrosanitarias",
        price: 18.50,
        oldPrice: 40.00,
        category: "revit",
        categoryLabel: "Revit (BIM)",
        rating: 4.5,
        reviews: 29,
        image: "assets/revit_pack.png",
        description: "Conexiones sanitarias, tuberías de PVC, cobre, CPVC, tanques de agua, calentadores y muebles de baño con conectores MEP activos."
    },
    {
        id: "p-11",
        name: "Colección de Vegetación 3D para Lumion & V-Ray",
        price: 22.00,
        oldPrice: 48.00,
        category: "texturas",
        categoryLabel: "Texturas & 3D",
        rating: 4.8,
        reviews: 33,
        image: "assets/textures_pack.png",
        description: "Árboles endémicos, arbustos y plantas trepadoras en formatos optimizados (.max, .fbx, .dae) con mapas de opacidad en hojas."
    },
    {
        id: "p-12",
        name: "Pack de Texturas de Maderas Finas y Acabados",
        price: 9.99,
        oldPrice: 22.00,
        category: "texturas",
        categoryLabel: "Texturas & 3D",
        rating: 4.5,
        reviews: 47,
        image: "assets/textures_pack.png",
        description: "Pisos tipo duela, paneles de madera acústica, texturas sin costuras (seamless) de encino, nogal y pino a alta resolución."
    },
    {
        id: "p-mega",
        name: "Mega Pack Todo en Uno ARQUIPRO MASTER",
        price: 49.99,
        oldPrice: 149.00,
        category: "texturas",
        categoryLabel: "Mega Pack",
        rating: 5,
        reviews: 512,
        image: "assets/hero_bg.png",
        description: "Obtén acceso completo e inmediato a toda nuestra librería digital. El paquete definitivo que todo arquitecto independiente necesita."
    }
];

// --- Estado de la Aplicación ---
let currentCategory = "all";
let searchQuery = "";
let selectedProductForCheckout = null;
let currentUser = null;

// --- Elementos del DOM ---
const elements = {
    header: document.querySelector(".main-header"),
    searchBarHeader: document.getElementById("search-input"),
    menuToggle: document.getElementById("menu-toggle"),
    mobileNav: document.getElementById("mobile-nav"),
    closeMobileNav: document.getElementById("close-mobile-nav"),
    mobileLinks: document.querySelectorAll(".mobile-nav-link"),
    
    // Auth DOM
    headerAuthContainer: document.getElementById("header-auth-container"),
    userMenuWrapper: document.getElementById("user-menu-wrapper"),
    headerLoginBtn: document.getElementById("header-login-btn"),
    mobileLoginBtn: document.getElementById("mobile-login-btn"),
    mobileAuthLi: document.getElementById("mobile-auth-li"),
    mobileDashboardLi: document.getElementById("mobile-dashboard-li"),
    logoutBtn: document.getElementById("logout-btn"),
    
    // Direct Checkout Modal
    checkoutOverlay: document.getElementById("checkout-overlay"),
    checkoutModal: document.getElementById("checkout-modal"),
    closeCheckoutBtn: document.getElementById("close-checkout-btn"),
    checkoutProdPreview: document.getElementById("checkout-prod-preview-card"),
    checkoutAuthAlert: document.getElementById("checkout-auth-alert"),
    checkoutTriggerLogin: document.getElementById("checkout-trigger-login"),
    checkoutDirectForm: document.getElementById("checkout-direct-form"),
    
    // Form Inputs
    checkoutName: document.getElementById("checkout-name"),
    checkoutEmail: document.getElementById("checkout-email"),
    checkoutPhone: document.getElementById("checkout-phone"),
    checkoutSubmitBtn: document.getElementById("checkout-submit-btn"),
    
    // Catalog Filtering
    catalogSearchInput: document.getElementById("catalog-search-input"),
    filterButtons: document.querySelectorAll(".filter-btn"),
    catalogGrid: document.getElementById("catalog-products-grid"),
    noResultsMessage: document.getElementById("no-results-message"),
    clearFiltersBtn: document.getElementById("clear-filters-btn"),
    
    // Video Demo
    playVideoBtn: document.getElementById("play-video-btn")
};

// ==========================================================================
// 1. INICIALIZACIÓN Y EVENTOS GENERALES
// ==========================================================================

document.addEventListener("DOMContentLoaded", async () => {
    // Renderizado Inicial del Catálogo
    renderCatalog();
    
    // Inicializar Animaciones de Scroll
    initScrollAnimations();
    
    // Cargar Sesión del Usuario
    await checkAuthSession();
    
    // Scroll Header Styling
    window.addEventListener("scroll", handleHeaderScroll);
    
    // Navegación Móvil
    if (elements.menuToggle) elements.menuToggle.addEventListener("click", openMobileNav);
    if (elements.closeMobileNav) elements.closeMobileNav.addEventListener("click", closeMobileNav);
    elements.mobileLinks.forEach(link => link.addEventListener("click", closeMobileNav));
    
    // Cerrar Sesión
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", async () => {
            await ArquiProDB.auth.signOut();
            await checkAuthSession();
        });
    }

    // Filtros de Categoría y Búsqueda
    elements.filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            elements.filterButtons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            currentCategory = e.currentTarget.dataset.filter;
            renderCatalog();
        });
    });
    
    if (elements.catalogSearchInput) {
        elements.catalogSearchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderCatalog();
        });
    }
    
    // Buscador del Header (Redirecciona al catálogo y filtra)
    if (elements.searchBarHeader) {
        elements.searchBarHeader.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                const query = e.target.value.trim();
                if (query) {
                    searchQuery = query.toLowerCase();
                    if (elements.catalogSearchInput) elements.catalogSearchInput.value = query;
                    const catSection = document.getElementById("catalog");
                    if (catSection) catSection.scrollIntoView({ behavior: "smooth" });
                    renderCatalog();
                }
            }
        });
    }
    
    // Limpiar Filtros
    if (elements.clearFiltersBtn) {
        elements.clearFiltersBtn.addEventListener("click", () => {
            currentCategory = "all";
            searchQuery = "";
            if (elements.catalogSearchInput) elements.catalogSearchInput.value = "";
            elements.filterButtons.forEach(btn => {
                if (btn.dataset.filter === "all") btn.classList.add("active");
                else btn.classList.remove("active");
            });
            renderCatalog();
        });
    }
    
    // Clicks en enlaces de categorías
    document.querySelectorAll('[data-filter]').forEach(el => {
        el.addEventListener("click", (e) => {
            const cat = e.currentTarget.getAttribute("data-filter");
            if (cat) {
                elements.filterButtons.forEach(btn => {
                    if (btn.dataset.filter === cat) btn.classList.add("active");
                    else btn.classList.remove("active");
                });
                currentCategory = cat;
                renderCatalog();
                const catSection = document.getElementById("catalog");
                if (catSection) catSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
    
    // Delegación de Evento: Compra Directa
    document.body.addEventListener("click", handleBuyNowClick);
    
    // Eventos del Modal de Checkout Directo
    if (elements.closeCheckoutBtn) elements.closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
    if (elements.checkoutOverlay) elements.checkoutOverlay.addEventListener("click", closeCheckoutModal);
    
    // Envío del Checkout Directo
    if (elements.checkoutDirectForm) {
        elements.checkoutDirectForm.addEventListener("submit", handleCheckoutSubmit);
    }
    
    // Modal "¿Cómo funciona?"
    const hiwOverlay = document.getElementById("hiw-overlay");
    const hiwModal   = document.getElementById("hiw-modal");
    const closeHiwBtn = document.getElementById("close-hiw-btn");
    const hiwCtaBtn  = document.getElementById("hiw-cta-btn");

    function openHiw() {
        hiwOverlay.classList.add("open");
        hiwModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    function closeHiw() {
        hiwOverlay.classList.remove("open");
        hiwModal.classList.remove("open");
        document.body.style.overflow = "";
    }

    if (elements.playVideoBtn) elements.playVideoBtn.addEventListener("click", openHiw);
    if (closeHiwBtn)  closeHiwBtn.addEventListener("click", closeHiw);
    if (hiwOverlay)   hiwOverlay.addEventListener("click", closeHiw);
    if (hiwCtaBtn)    hiwCtaBtn.addEventListener("click", closeHiw);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeHiw(); });

    // Inicializar WhatsApp
    initWhatsAppWidget();
});

// ==========================================================================
// 2. CONTROL DE SESIÓN DEL USUARIO
// ==========================================================================

async function checkAuthSession() {
    currentUser = await ArquiProDB.auth.getSession();
    
    if (currentUser) {
        if (elements.headerAuthContainer) elements.headerAuthContainer.style.display = "none";
        if (elements.userMenuWrapper) elements.userMenuWrapper.style.display = "flex";
        
        if (elements.mobileAuthLi) elements.mobileAuthLi.style.display = "none";
        if (elements.mobileDashboardLi) elements.mobileDashboardLi.style.display = "block";
    } else {
        if (elements.headerAuthContainer) elements.headerAuthContainer.style.display = "block";
        if (elements.userMenuWrapper) elements.userMenuWrapper.style.display = "none";
        
        if (elements.mobileAuthLi) elements.mobileAuthLi.style.display = "block";
        if (elements.mobileDashboardLi) elements.mobileDashboardLi.style.display = "none";
    }
}

// ==========================================================================
// 3. LOGICA DEL CATÁLOGO
// ==========================================================================

function renderCatalog() {
    if (!elements.catalogGrid) return;
    
    const filteredProducts = products.filter(prod => {
        if (prod.id === "p-mega") return false;
        
        const matchesCategory = currentCategory === "all" || prod.category === currentCategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || 
                              prod.description.toLowerCase().includes(searchQuery) ||
                              prod.categoryLabel.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    
    elements.catalogGrid.innerHTML = "";
    
    if (filteredProducts.length === 0) {
        if (elements.noResultsMessage) elements.noResultsMessage.style.display = "block";
        elements.catalogGrid.style.display = "none";
    } else {
        if (elements.noResultsMessage) elements.noResultsMessage.style.display = "none";
        elements.catalogGrid.style.display = "grid";
        
        filteredProducts.forEach((prod, index) => {
            const ratingStarsHTML = Array.from({ length: 5 }, (_, i) => {
                if (i < Math.floor(prod.rating)) {
                    return '<i class="fa-solid fa-star"></i>';
                } else if (i < prod.rating) {
                    return '<i class="fa-solid fa-star-half-stroke"></i>';
                } else {
                    return '<i class="fa-regular fa-star"></i>';
                }
            }).join('');
            
            const oldPriceHTML = prod.oldPrice ? `<span class="old-price">$${prod.oldPrice.toFixed(2)}</span>` : "";
            
            const card = document.createElement("article");
            card.className = "product-card animate-on-scroll";
            card.style.transitionDelay = `${(index % 4) * 0.1}s`;
            card.innerHTML = `
                <div class="card-img-holder">
                    <img src="${prod.image}" alt="${prod.name}" loading="lazy">
                </div>
                <div class="card-info">
                    <span class="prod-category">${prod.categoryLabel}</span>
                    <h3 class="prod-title">${prod.name}</h3>
                    <div class="rating">
                        ${ratingStarsHTML}
                        <span>(${prod.reviews})</span>
                    </div>
                    <p class="prod-short-desc">${prod.description}</p>
                    <div class="card-footer">
                        <span class="price">$${prod.price.toFixed(2)} ${oldPriceHTML}</span>
                        <button type="button" class="btn btn-primary btn-sm buy-now-btn" data-id="${prod.id}">
                            <i class="fa-solid fa-bolt"></i> Adquirir
                        </button>
                    </div>
                </div>
            `;
            elements.catalogGrid.appendChild(card);
        });
        
        // Re-inicializar animaciones para nuevos elementos agregados
        initScrollAnimations();
    }
}

// ==========================================================================
// 4. FLUJO DE COMPRA DIRECTA (CHECKOUT DIRECTO)
// ==========================================================================

function handleBuyNowClick(e) {
    const btn = e.target.closest(".buy-now-btn");
    if (!btn) return;
    
    const id = btn.dataset.id;
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    
    selectedProductForCheckout = prod;
    
    const ratingStarsHTML = Array.from({ length: 5 }, (_, i) => {
        return i < Math.floor(prod.rating) ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    }).join('');
    
    elements.checkoutProdPreview.innerHTML = `
        <div class="checkout-prod-flex">
            <div class="checkout-prod-img">
                <img src="${prod.image}" alt="${prod.name}">
            </div>
            <div class="checkout-prod-details">
                <span class="prod-category">${prod.categoryLabel}</span>
                <h4>${prod.name}</h4>
                <div class="rating">${ratingStarsHTML}</div>
                <div class="checkout-prod-price">
                    <strong>$${prod.price.toFixed(2)} USD</strong>
                </div>
            </div>
        </div>
    `;
    
    // Comprobar sesión activa para pre-completar
    if (currentUser) {
        elements.checkoutName.value = currentUser.name || "";
        elements.checkoutEmail.value = currentUser.email || "";
        elements.checkoutPhone.value = currentUser.phone || "";
        elements.checkoutAuthAlert.style.display = "none";
        
        elements.checkoutName.readOnly = true;
        elements.checkoutEmail.readOnly = true;
        elements.checkoutPhone.readOnly = true;
    } else {
        elements.checkoutName.value = "";
        elements.checkoutEmail.value = "";
        elements.checkoutPhone.value = "";
        elements.checkoutAuthAlert.style.display = "block";
        
        elements.checkoutName.readOnly = false;
        elements.checkoutEmail.readOnly = false;
        elements.checkoutPhone.readOnly = false;
    }
    
    elements.checkoutOverlay.classList.add("open");
    elements.checkoutModal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
    elements.checkoutOverlay.classList.remove("open");
    elements.checkoutModal.classList.remove("open");
    document.body.style.overflow = "";
    selectedProductForCheckout = null;
}

// ==========================================================================
// 5. INTEGRACIÓN DE MERCADO PAGO (PRODUCCIÓN & DEMO FALLBACK)
// ==========================================================================

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    if (!selectedProductForCheckout) return;
    
    const name = elements.checkoutName.value.trim();
    const email = elements.checkoutEmail.value.trim();
    const phone = elements.checkoutPhone.value.trim();
    
    elements.checkoutSubmitBtn.disabled = true;
    elements.checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando tu orden...`;
    
    // Guardar detalles del producto seleccionado temporalmente
    localStorage.setItem("arquipro_last_pending_product", selectedProductForCheckout.id);
    localStorage.setItem("arquipro_last_pending_name", selectedProductForCheckout.name);
    localStorage.setItem("arquipro_last_pending_price", selectedProductForCheckout.price);

    // Si el usuario no está autenticado, podemos crearle una cuenta temporal automática en demo
    // o prepararlo para que en el pago exitoso se registre de forma fluida.
    let targetUserId = currentUser ? currentUser.id : null;

    if (!currentUser) {
        // Generar un ID temporal para asociar la compra si se completa
        targetUserId = "tmp-usr-" + Math.floor(Math.random() * 1000000);
        localStorage.setItem("arquipro_temp_buyer", JSON.stringify({
            id: targetUserId,
            name,
            email,
            phone
        }));
    }

    // Crear orden en DB (demo: localStorage / producción: Supabase)
    // external_reference = orderId para poder reconciliar el pago en pago-exitoso.html
    const { orderId } = await ArquiProDB.orders.create(
        targetUserId,
        selectedProductForCheckout.id,
        selectedProductForCheckout.name,
        selectedProductForCheckout.price
    );

    // Comprobar si estamos en Modo Demo
    if (typeof ARQUIPRO_CONFIG !== 'undefined' && ARQUIPRO_CONFIG.isDemoMode()) {
        console.log("Procesando pago en modo DEMO con simulación de pasarela.");

        setTimeout(() => {
            const isSuccess = Math.random() > 0.05;
            if (isSuccess) {
                window.location.href = `pago-exitoso.html?payment_id=${orderId}&collection_status=approved&external_reference=${orderId}`;
            } else {
                window.location.href = `pago-fallido.html?collection_status=rejected&external_reference=${orderId}`;
            }
        }, 1500);
    } else {
        // MODO PRODUCCIÓN: Integración real con Mercado Pago mediante endpoint backend
        console.log("Generando preferencia de pago real mediante backend...");
        try {
            const response = await fetch(ARQUIPRO_CONFIG.BACKEND_PREFERENCE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productId: selectedProductForCheckout.id,
                    productName: selectedProductForCheckout.name,
                    price: selectedProductForCheckout.price,
                    orderId: orderId,
                    payer: {
                        name,
                        email,
                        phone,
                        userId: targetUserId
                    },
                    redirectUrls: {
                        success: window.location.origin + "/pago-exitoso.html",
                        failure: window.location.origin + "/pago-fallido.html",
                        pending: window.location.origin + "/pago-exitoso.html"
                    }
                })
            });

            if (!response.ok) throw new Error("Error al obtener preferencia del servidor.");

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else if (data.preferenceId) {
                window.location.href = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${data.preferenceId}`;
            } else {
                throw new Error("Respuesta inválida del backend de preferencia.");
            }
        } catch (error) {
            console.error("Mercado Pago Error:", error);
            alert("No se pudo iniciar el portal de pago seguro de Mercado Pago: " + error.message + "\n\nSe conmutará automáticamente a modo simulación demo para esta sesión.");

            setTimeout(() => {
                window.location.href = `pago-exitoso.html?payment_id=${orderId}&collection_status=approved&external_reference=${orderId}`;
            }, 1000);
        }
    }
}

// ==========================================================================
// 6. UI HELPERS
// ==========================================================================

function handleHeaderScroll() {
    if (!elements.header) return;
    if (window.scrollY > 50) {
        elements.header.classList.add("scrolled");
    } else {
        elements.header.classList.remove("scrolled");
    }
}

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animated");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatableElements = document.querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-slide-right');
    animatableElements.forEach(el => observer.observe(el));
}

function openMobileNav() {
    if (elements.mobileNav) elements.mobileNav.classList.add("open");
}

function closeMobileNav() {
    if (elements.mobileNav) elements.mobileNav.classList.remove("open");
}

// ==========================================================================
// 7. WIDGET DE WHATSAPP FLOTANTE
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

    // Estilos dinámicos del botón flotante
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
