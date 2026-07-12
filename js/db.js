/* ==========================================================================
   ARQUIPRO DIGITAL - Capa de Abstracción de Datos (Supabase & Demo Fallback)
   ========================================================================== */

// Inicializar cliente de Supabase si no estamos en modo demo
let supabaseClient = null;
if (typeof ARQUIPRO_CONFIG !== 'undefined' && !ARQUIPRO_CONFIG.isDemoMode()) {
    try {
        supabaseClient = supabase.createClient(ARQUIPRO_CONFIG.SUPABASE_URL, ARQUIPRO_CONFIG.SUPABASE_ANON_KEY);
        console.log("Supabase Client initialized successfully.");
    } catch (e) {
        console.error("Error initializing Supabase client: ", e);
    }
} else {
    console.log("Running in DEMO Mode (localStorage fallback). Connect Supabase in js/config.js.");
}

const ArquiProDB = {
    // --- AUTENTICACIÓN ---
    auth: {
        async getSession() {
            if (supabaseClient) {
                const { data, error } = await supabaseClient.auth.getSession();
                if (error) {
                    console.error("Error fetching session:", error);
                    return null;
                }
                if (data && data.session) {
                    // Sincronizar datos de perfil en localStorage para facilidad del frontend
                    const user = data.session.user;
                    const profile = await ArquiProDB.profile.get(user.id);
                    const sessionUser = {
                        id: user.id,
                        email: user.email,
                        name: profile ? profile.name : (user.user_metadata?.name || "Usuario"),
                        phone: profile ? profile.phone : (user.user_metadata?.phone || ""),
                        profession: profile ? profile.profession : "Arquitecto"
                    };
                    localStorage.setItem("arquipro_user", JSON.stringify(sessionUser));
                    return sessionUser;
                }
                localStorage.removeItem("arquipro_user");
                return null;
            } else {
                // Fallback a localStorage
                const user = localStorage.getItem("arquipro_user");
                return user ? JSON.parse(user) : null;
            }
        },

        async signUp(email, password, name, phone) {
            if (supabaseClient) {
                // Registro real con Supabase
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name, phone }
                    }
                });
                
                if (error) throw error;
                
                if (data && data.user) {
                    // Crear perfil en la tabla profiles
                    const { error: profileError } = await supabaseClient
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            name: name,
                            phone: phone,
                            profession: 'Arquitecto'
                        });
                    
                    if (profileError) {
                        console.error("Error creating profile:", profileError);
                    }
                    
                    const sessionUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name,
                        phone,
                        profession: 'Arquitecto'
                    };
                    localStorage.setItem("arquipro_user", JSON.stringify(sessionUser));
                    return sessionUser;
                }
                return null;
            } else {
                // Fallback local: Guardar en lista de usuarios
                let users = JSON.parse(localStorage.getItem("arquipro_users_db")) || [];
                if (users.find(u => u.email === email)) {
                    throw new Error("El correo electrónico ya está registrado.");
                }
                
                const newUser = {
                    id: "usr-" + Math.floor(Math.random() * 1000000),
                    email,
                    password, // En producción real esto va cifrado por Supabase
                    name,
                    phone,
                    profession: "Arquitecto"
                };
                
                users.push(newUser);
                localStorage.setItem("arquipro_users_db", JSON.stringify(users));
                
                // Iniciar sesión automáticamente
                const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone, profession: newUser.profession };
                localStorage.setItem("arquipro_user", JSON.stringify(sessionUser));
                return sessionUser;
            }
        },

        async signIn(email, password) {
            if (supabaseClient) {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                
                if (data && data.user) {
                    const profile = await ArquiProDB.profile.get(data.user.id);
                    const sessionUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: profile ? profile.name : (data.user.user_metadata?.name || "Usuario"),
                        phone: profile ? profile.phone : (data.user.user_metadata?.phone || ""),
                        profession: profile ? profile.profession : "Arquitecto"
                    };
                    localStorage.setItem("arquipro_user", JSON.stringify(sessionUser));
                    return sessionUser;
                }
                return null;
            } else {
                // Fallback local
                const users = JSON.parse(localStorage.getItem("arquipro_users_db")) || [];
                const user = users.find(u => u.email === email && u.password === password);
                if (!user) {
                    throw new Error("Credenciales inválidas. Revisa tu correo y contraseña.");
                }
                const sessionUser = { id: user.id, email: user.email, name: user.name, phone: user.phone, profession: user.profession };
                localStorage.setItem("arquipro_user", JSON.stringify(sessionUser));
                return sessionUser;
            }
        },

        async signOut() {
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
            }
            localStorage.removeItem("arquipro_user");
        }
    },

    // --- PERFIL DE USUARIO ---
    profile: {
        async get(userId) {
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) {
                    console.error("Error loading profile:", error);
                    return null;
                }
                return data;
            } else {
                const user = localStorage.getItem("arquipro_user");
                return user ? JSON.parse(user) : null;
            }
        },

        async update(userId, profileData) {
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update({
                        name: profileData.name,
                        phone: profileData.phone,
                        profession: profileData.profession,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);
                
                if (error) throw error;
                
                // Actualizar sesión local
                const user = JSON.parse(localStorage.getItem("arquipro_user"));
                const updated = { ...user, ...profileData };
                localStorage.setItem("arquipro_user", JSON.stringify(updated));
                return updated;
            } else {
                // Fallback local
                const user = JSON.parse(localStorage.getItem("arquipro_user"));
                const updated = { ...user, ...profileData };
                localStorage.setItem("arquipro_user", JSON.stringify(updated));
                
                // Actualizar en la base de datos simulada
                let users = JSON.parse(localStorage.getItem("arquipro_users_db")) || [];
                const index = users.findIndex(u => u.id === userId);
                if (index !== -1) {
                    users[index] = { ...users[index], ...profileData };
                    localStorage.setItem("arquipro_users_db", JSON.stringify(users));
                }
                return updated;
            }
        }
    },

    // --- ORDENES Y COMPRAS ---
    orders: {
        async getByUser(userId) {
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.error("Error loading orders:", error);
                    return [];
                }
                // Adaptar al formato esperado por el frontend
                return data.map(o => ({
                    orderId: o.mp_payment_id || o.id.substring(0, 8).toUpperCase(),
                    date: new Date(o.created_at).toLocaleDateString(),
                    productId: o.product_id,
                    productName: o.product_name,
                    price: parseFloat(o.price),
                    status: o.status === 'approved' ? 'Aprobado' : (o.status === 'failed' ? 'Rechazado' : 'Pendiente')
                }));
            } else {
                // Fallback local
                const purchases = localStorage.getItem("arquipro_purchases");
                return purchases ? JSON.parse(purchases) : [];
            }
        },

        async create(userId, productId, productName, price) {
            const orderId = "AQ-" + Math.floor(10000 + Math.random() * 90000);
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .insert({
                        user_id: userId || null,
                        product_id: productId,
                        product_name: productName,
                        price: price,
                        status: 'pending',
                        mp_payment_id: orderId
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { id: data.id, orderId: data.mp_payment_id };
            } else {
                // Guardar orden temporal de demo
                return { id: "demo-ord-" + Math.floor(Math.random() * 1000000), orderId };
            }
        },

        async updateStatus(orderId, status, paymentId) {
            if (supabaseClient) {
                // Intentar buscar por el campo temporal o id
                const { error } = await supabaseClient
                    .from('orders')
                    .update({ status: status, mp_payment_id: paymentId })
                    .or(`mp_payment_id.eq.${orderId},id.eq.${orderId}`);
                
                if (error) {
                    console.error("Error updating order status:", error);
                }
            } else {
                // Fallback local
                // Añadir al listado de compras
                let purchases = JSON.parse(localStorage.getItem("arquipro_purchases")) || [];
                // Evitar duplicados
                if (!purchases.find(p => p.orderId === orderId)) {
                    // Encontrar detalles del producto en app.js de referencia o genérico
                    purchases.push({
                        orderId: orderId,
                        date: new Date().toLocaleDateString(),
                        productId: localStorage.getItem("arquipro_last_pending_product") || "p-1",
                        productName: localStorage.getItem("arquipro_last_pending_name") || "Recurso Adquirido",
                        price: parseFloat(localStorage.getItem("arquipro_last_pending_price") || "19.99"),
                        status: status === 'approved' ? 'Aprobado' : 'Rechazado'
                    });
                    localStorage.setItem("arquipro_purchases", JSON.stringify(purchases));
                }
            }
        }
    }
};
