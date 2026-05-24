// ============================================
// AUTH - Authentification, sessions, utilisateurs
// ============================================

let currentUser = null;
let userProfile = null;
let activityLogs = [];

// ========== NOUVEAU : TIMER INACTIVITÉ ==========
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 heure

function resetInactivityTimer() {
    if (!currentUser) return;
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (currentUser) {
            if (typeof showToast === 'function') showToast("Session expirée (inactivité 1h)", "warning");
            logout();
        }
    }, INACTIVITY_TIMEOUT);
}

function bindActivityEvents() {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'mousemove'];
    events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
        window.addEventListener(event, resetInactivityTimer);
    });
}
// ========== FIN NOUVEAU ==========

function initAuth() {
    window.showAuthModal = showAuthModal;
    window.switchAuthTab = switchAuthTab;
    window.handleLogin = handleLogin;
    window.handleSignup = handleSignup;
    window.logout = logout;
    window.restoreSession = restoreSession;
    window.logActivity = logActivity;
    window.updateActivityLog = updateActivityLog;
    window.loadUsers = loadUsers;
    window.sendInvitation = sendInvitation;
}

function showAuthModal(tab) {
    const modal = document.getElementById('authModal');
    if(modal) modal.classList.add('active');
    switchAuthTab(tab);
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((b, i) => {
        b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
    });
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if(loginForm) loginForm.style.display = tab === 'login' ? 'block' : 'none';
    if(signupForm) signupForm.style.display = tab === 'signup' ? 'block' : 'none';
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if(!email || !password) { 
        if(typeof showToast === 'function') showToast('Veuillez remplir tous les champs', 'error'); 
        return; 
    }
    
    // Vérifier Supabase
    let supabaseAvailable = false;
    if(typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            await Promise.race([
                supabaseClient.from('items').select('count', { count: 'exact', head: true }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            supabaseAvailable = true;
        } catch(e) { 
            console.log('Supabase indisponible:', e.message);
        }
    }
    
    // Tentative connexion cloud
    if(supabaseAvailable && typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ 
                email: email, 
                password: password 
            });
            
            if(!error && data.user) {
                currentUser = data.user.id;
                userProfile = { 
                    fullName: data.user.user_metadata?.full_name || email.split('@')[0], 
                    role: 'admin', 
                    email: data.user.email 
                };
                
                // Sauvegarder session cloud
                localStorage.setItem('mbe_session', JSON.stringify({ 
                    email: email, 
                    password: password,
                    userId: currentUser, 
                    timestamp: Date.now(),
                    isCloud: true
                }));
                
                await onLoginSuccess();
                if(typeof playSound === 'function') playSound('success');
                return;
            }
        } catch(e) { 
            console.log('Erreur connexion Supabase:', e.message); 
        }
    }
    
    // Mode hors ligne (compte démo)
    if(email === 'admin@mesbesextremes.cd' && password === 'Admin123!') {
        currentUser = 'admin-local';
        userProfile = { 
            fullName: 'Administrateur (Hors ligne)', 
            role: 'admin', 
            email: 'admin@mesbesextremes.cd' 
        };
        
        localStorage.setItem('mbe_session', JSON.stringify({ 
            email: email,
            local: true, 
            userId: 'admin-local', 
            timestamp: Date.now() 
        }));
        
        await onLoginSuccessFallback();
        if(typeof playSound === 'function') playSound('warning');
        if(typeof showToast === 'function') showToast('⚠️ Mode hors ligne - Données locales uniquement', 'warning');
        return;
    }
    
    if(typeof showToast === 'function') showToast('Identifiants incorrects', 'error');
    if(typeof playSound === 'function') playSound('error');
}

async function onLoginSuccess() {
    const authModal = document.getElementById('authModal');
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('appContainer');
    
    if(authModal) authModal.classList.remove('active');
    if(landingPage) landingPage.style.display = 'none';
    if(appContainer) appContainer.classList.add('authenticated');
    
    // Charger les données depuis Supabase
    if(typeof loadAllFromSupabase === 'function') {
        const loaded = await loadAllFromSupabase();
        if(!loaded || (window.items && window.items.length === 0)) { 
            if(typeof initializeDefaultData === 'function') await initializeDefaultData(); 
            if(typeof syncAllToSupabase === 'function') await syncAllToSupabase(); 
        }
    } else {
        if(typeof initializeDefaultData === 'function') await initializeDefaultData();
    }
    
    // ========== AJOUT CRUCIAL : Générer l'interface des onglets ==========
    if(typeof loadTabContent === 'function') loadTabContent();
    // ====================================================================
    
    updateUserInterface();
    if(typeof renderAll === 'function') renderAll();
    
    resetInactivityTimer();
    bindActivityEvents();
    
    if(typeof showToast === 'function') showToast('Connecté au cloud ☁️ ✅');
    logActivity('Connexion', userProfile.email);
}

async function onLoginSuccessFallback() {
    const authModal = document.getElementById('authModal');
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('appContainer');
    
    if(authModal) authModal.classList.remove('active');
    if(landingPage) landingPage.style.display = 'none';
    if(appContainer) appContainer.classList.add('authenticated');
    
    if(typeof initializeDefaultData === 'function') await initializeDefaultData();
    
    // ========== AJOUT CRUCIAL : Générer l'interface des onglets ==========
    if(typeof loadTabContent === 'function') loadTabContent();
    // ====================================================================
    
    updateUserInterface();
    if(typeof renderAll === 'function') renderAll();
    
    resetInactivityTimer();
    bindActivityEvents();
    
    if(typeof showToast === 'function') showToast('Connecté (mode local) ⚠️');
}

async function handleSignup() {
    const fullName = document.getElementById('signupFullName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const username = document.getElementById('signupUsername')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    if(!fullName || !email || !username || !password) { 
        if(typeof showToast === 'function') showToast('Tous les champs sont requis', 'error'); 
        return; 
    }
    if(password !== confirmPassword) { 
        if(typeof showToast === 'function') showToast('Les mots de passe ne correspondent pas', 'error'); 
        return; 
    }
    
    if(typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({ 
                email: email, 
                password: password, 
                options: { data: { full_name: fullName, username: username } } 
            });
            
            if(!error && data.user) {
                currentUser = data.user.id;
                userProfile = { fullName: fullName, role: 'admin', email: email };
                if(typeof initializeDefaultData === 'function') await initializeDefaultData();
                if(typeof syncAllToSupabase === 'function') await syncAllToSupabase();
                await onLoginSuccess();
                if(typeof playSound === 'function') playSound('success');
                return;
            } else if(error) {
                if(typeof showToast === 'function') showToast(error.message, 'error');
                return;
            }
        } catch(err) {
            console.log('Erreur inscription:', err);
        }
    }
    if(typeof showToast === 'function') showToast('Erreur lors de la création du compte', 'error');
}

function logout() {
    if(typeof supabaseClient !== 'undefined' && supabaseClient) supabaseClient.auth.signOut().catch(() => {});
    currentUser = null;
    userProfile = null;
    localStorage.removeItem('mbe_session');
    
    if(inactivityTimer) clearTimeout(inactivityTimer);
    
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('appContainer');
    
    if(landingPage) landingPage.style.display = 'block';
    if(appContainer) appContainer.classList.remove('authenticated');
    
    if(typeof showToast === 'function') showToast('Déconnecté');
    if(typeof playSound === 'function') playSound('info');
}

async function restoreSession() {
    const session = localStorage.getItem('mbe_session');
    if(!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        
        // Expiration 1 heure
        if(sessionData.timestamp && (Date.now() - sessionData.timestamp) > 60 * 60 * 1000) {
            localStorage.removeItem('mbe_session');
            if(typeof showToast === 'function') showToast('Session expirée, reconnectez-vous', 'warning');
            return false;
        }
        
        // Tentative de reconnexion cloud
        if(sessionData.email && sessionData.password && typeof supabaseClient !== 'undefined' && supabaseClient && !sessionData.local) {
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ 
                    email: sessionData.email, 
                    password: sessionData.password 
                });
                
                if(data?.user) {
                    currentUser = data.user.id;
                    userProfile = { 
                        fullName: data.user.user_metadata?.full_name || sessionData.email.split('@')[0], 
                        role: 'admin', 
                        email: data.user.email 
                    };
                    
                    const landingPage = document.getElementById('landingPage');
                    const appContainer = document.getElementById('appContainer');
                    
                    if(landingPage) landingPage.style.display = 'none';
                    if(appContainer) appContainer.classList.add('authenticated');
                    
                    updateUserInterface();
                    resetInactivityTimer();
                    bindActivityEvents();
                    
                    if(typeof loadAllFromSupabase === 'function') {
                        await loadAllFromSupabase();
                    }
                    
                    // ========== AJOUT CRUCIAL ==========
                    if(typeof loadTabContent === 'function') loadTabContent();
                    // ================================
                    
                    if(typeof updateCompanyFormFields === 'function') updateCompanyFormFields();
                    if(typeof updateServerSelects === 'function') updateServerSelects();
                    if(typeof updateServerFilterSelect === 'function') updateServerFilterSelect();
                    if(typeof renderSuppliersList === 'function') renderSuppliersList();
                    if(typeof renderAll === 'function') renderAll();
                    
                    return true;
                }
            } catch(e) { 
                console.log('Erreur reconnexion Supabase:', e.message); 
            }
        }
        
        // Mode hors ligne
        if(sessionData.email === 'admin@mesbesextremes.cd' || sessionData.local) {
            currentUser = 'admin-local';
            userProfile = { 
                fullName: 'Administrateur', 
                role: 'admin', 
                email: 'admin@mesbesextremes.cd' 
            };
            
            const landingPage = document.getElementById('landingPage');
            const appContainer = document.getElementById('appContainer');
            
            if(landingPage) landingPage.style.display = 'none';
            if(appContainer) appContainer.classList.add('authenticated');
            
            updateUserInterface();
            resetInactivityTimer();
            bindActivityEvents();
            
            if(typeof initializeDefaultData === 'function') await initializeDefaultData();
            
            // ========== AJOUT CRUCIAL ==========
            if(typeof loadTabContent === 'function') loadTabContent();
            // ================================
            
            if(typeof updateCompanyFormFields === 'function') updateCompanyFormFields();
            if(typeof updateServerSelects === 'function') updateServerSelects();
            if(typeof updateServerFilterSelect === 'function') updateServerFilterSelect();
            if(typeof renderSuppliersList === 'function') renderSuppliersList();
            if(typeof renderAll === 'function') renderAll();
            
            return true;
        }
    } catch(e) { 
        console.log('Erreur session:', e.message); 
    }
    
    localStorage.removeItem('mbe_session');
    return false;
}

function updateUserInterface() {
    if(!userProfile) return;
    
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if(userName) userName.textContent = userProfile.fullName;
    if(userRole) userRole.textContent = userProfile.role === 'admin' ? 'Admin' : 'Manager';
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = userProfile.role === 'admin' ? 'flex' : 'none';
    });
}

function logActivity(action, details) {
    activityLogs.unshift({ 
        timestamp: new Date().toISOString(), 
        user: userProfile?.email || currentUser, 
        action, 
        details 
    });
    
    if(activityLogs.length > 100) activityLogs.pop();
    updateActivityLog();
}

function updateActivityLog() {
    const container = document.getElementById('activityLog');
    if(!container) return;
    
    container.innerHTML = activityLogs.slice(0, 50).map(log => 
        `<div style="padding:0.5rem; border-bottom:1px solid var(--card-border); font-size:0.8rem;">
            <strong>${typeof formatDate === 'function' ? formatDate(log.timestamp) : log.timestamp}</strong><br>
            ${log.user}: ${log.action} ${log.details || ''}
        </div>`
    ).join('');
}

function loadUsers() {
    const container = document.getElementById('adminUsersList');
    if(!container || !userProfile) return;
    
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:0.75rem; border-bottom:1px solid var(--card-border);">
            <div>
                <strong>${userProfile.fullName}</strong><br>
                <small>${userProfile.email} - ${userProfile.role === 'admin' ? 'Admin' : 'Manager'}</small>
            </div>
            <span class="badge-local">Connecté</span>
        </div>
    `;
}

function sendInvitation() {
    const email = document.getElementById('inviteEmail')?.value;
    const role = document.getElementById('inviteRole')?.value;
    
    if(email) {
        window.open(`mailto:${email}?subject=Invitation Mes Bes Extrêmes&body=Vous avez été invité comme ${role}. Connectez-vous avec vos identifiants.`);
        if(typeof showToast === 'function') showToast(`Invitation à ${email}`);
        logActivity('Invitation', `Invité ${email} comme ${role}`);
    }
}