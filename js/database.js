// ============================================
// DATABASE - Supabase, IndexedDB, synchronisation
// ============================================

const SUPABASE_URL = 'https://irphsdjekxwultstxunv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DPYyHk3Ss5l9qw7MRSugOg_TOmUh3cb';
let supabaseClient = null;
let onlineStatus = navigator.onLine;
let isSyncing = false;
let saveInProgress = false;
let syncQueue = [];

function initDatabase() {
    try { 
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 
        console.log('✅ Supabase connecté'); 
    } catch(e) { 
        console.warn('⚠️ Supabase non disponible'); 
        supabaseClient = null;
    }
    
    window.addEventListener('online', async () => { 
        onlineStatus = true; 
        if(typeof showToast === 'function') showToast('🟢 Connecté à internet - Synchronisation en cours...', 'info');
        if(supabaseClient && window.currentUser && window.currentUser !== 'admin-local') {
            await processSyncQueue();
            await syncAllToSupabase();
        }
    });
    
    window.addEventListener('offline', () => { 
        onlineStatus = false; 
        if(typeof showToast === 'function') showToast('🔴 Mode hors ligne - modifications enregistrées localement', 'warning');
        if(typeof playSound === 'function') playSound('warning');
    });
    
    setInterval(() => { 
        if(window.items && window.items.length > 0 && typeof saveData === 'function') saveData(); 
    }, 30000);
    
    setInterval(async () => {
        if(onlineStatus && supabaseClient && window.currentUser && window.currentUser !== 'admin-local') {
            try {
                const { error } = await supabaseClient.from('items').select('count', { count: 'exact', head: true }).limit(1);
                if(error) {
                    console.log('⚠️ Perte de connexion Supabase détectée');
                    onlineStatus = false;
                }
            } catch(e) {
                onlineStatus = false;
            }
        }
    }, 60000);
}

function addToSyncQueue(operation, data) {
    const queue = getSyncQueue();
    queue.push({
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        operation: operation,
        data: data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('mbe_sync_queue', JSON.stringify(queue));
    console.log(`📦 Ajouté à la file d'attente: ${operation}`);
}

function getSyncQueue() {
    const queue = localStorage.getItem('mbe_sync_queue');
    return queue ? JSON.parse(queue) : [];
}

async function processSyncQueue() {
    const queue = getSyncQueue();
    if(queue.length === 0) return;
    
    console.log(`🔄 Traitement de ${queue.length} opérations en attente...`);
    
    for(const item of queue) {
        try {
            await executeSyncOperation(item.operation, item.data);
            removeFromSyncQueue(item.id);
        } catch(e) {
            console.error(`❌ Échec sync ${item.operation}:`, e);
        }
    }
    
    if(typeof showToast === 'function') showToast('✅ Synchronisation de la file d\'attente terminée', 'success');
}

function removeFromSyncQueue(id) {
    const queue = getSyncQueue();
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem('mbe_sync_queue', JSON.stringify(newQueue));
}

async function executeSyncOperation(operation, data) {
    if(!supabaseClient || !window.currentUser || window.currentUser === 'admin-local') return;
    
    switch(operation) {
        case 'add_item':
            await supabaseClient.from('items').upsert({...data, user_id: window.currentUser});
            break;
        case 'update_item':
            await supabaseClient.from('items').upsert({...data, user_id: window.currentUser});
            break;
        case 'delete_item':
            await supabaseClient.from('items').delete().eq('id', data.id).eq('user_id', window.currentUser);
            break;
        case 'add_sale':
            await supabaseClient.from('sales').insert({...data, user_id: window.currentUser});
            break;
        case 'add_server':
            await supabaseClient.from('servers').upsert({...data, user_id: window.currentUser});
            break;
        case 'add_task':
            await supabaseClient.from('tasks').upsert({...data, user_id: window.currentUser});
            break;
        case 'update_task':
            await supabaseClient.from('tasks').upsert({...data, user_id: window.currentUser});
            break;
        case 'add_debt':
            await supabaseClient.from('debts').upsert({...data, user_id: window.currentUser});
            break;
        default:
            console.log('Opération inconnue:', operation);
    }
}

function saveData() {
    if(saveInProgress) return;
    saveInProgress = true;
    
    try {
        const persistData = {
            items: window.items || [],
            salesHistory: window.salesHistory || [],
            servers: window.servers || [],
            settings: window.settings || {},
            companyInfo: window.companyInfo || {},
            debts: window.debts || [],
            stockMovements: window.stockMovements || [],
            losses: window.losses || [],
            expenses: window.expenses || [],
            purchases: window.purchases || [],
            suppliers: window.suppliers || [],
            trackingData: window.trackingData || {},
            tasks: window.tasks || [],
            kitchenOrders: window.kitchenOrders || [],
            loyaltyPoints: window.loyaltyPoints || {},
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('mbe_app_data', JSON.stringify(persistData));
        console.log('✅ Données sauvegardées localement');
        
        saveToIndexedDB(persistData);
        
        if(supabaseClient && window.currentUser && window.currentUser !== 'admin-local' && onlineStatus) { 
            syncAllToSupabase().catch(e => console.log('Sync différée:', e));
        }
        
        if(typeof playSound === 'function' && window.lastSaveSound !== Date.now()) {
            window.lastSaveSound = Date.now();
        }
    } catch(e) { 
        console.error('❌ Erreur sauvegarde:', e); 
    } finally { 
        setTimeout(() => { saveInProgress = false; }, 100);
    }
}

function saveToIndexedDB(data) {
    // IndexedDB temporairement désactivé
    // Les données sont toujours sauvegardées dans localStorage ✅
    return;
}

function loadLocalData() {
    console.log('🔄 Chargement des données locales...');
    
    const localData = localStorage.getItem('mbe_app_data');
    if(localData) {
        try {
            const data = JSON.parse(localData);
            if(data.items && data.items.length > 0) {
                window.items = data.items;
                console.log(`✅ ${window.items.length} articles chargés depuis localStorage`);
            }
            if(data.salesHistory) window.salesHistory = data.salesHistory;
            if(data.servers && data.servers.length > 0) {
                window.servers = data.servers;
                console.log(`✅ ${window.servers.length} serveurs chargés depuis localStorage`);
            }
            if(data.settings) Object.assign(window.settings || {}, data.settings);
            if(data.companyInfo) Object.assign(window.companyInfo || {}, data.companyInfo);
            if(data.debts) window.debts = data.debts;
            if(data.tasks) window.tasks = data.tasks;
            
            if(window.sortItems) window.sortItems();
            
            return true;
        } catch(e) {
            console.error('Erreur chargement localStorage:', e);
        }
    }
    
    console.log('📭 Aucune donnée trouvée dans localStorage');
    return false;
}

async function syncAllToSupabase() {
    if(isSyncing) {
        console.log('Sync déjà en cours, ignorée');
        return;
    }
    
    if(!supabaseClient || !window.currentUser || window.currentUser === 'admin-local') {
        console.log('Sync ignorée: pas de connexion cloud');
        return false;
    }
    
    if(!onlineStatus) {
        console.log('Sync ignorée: mode hors ligne');
        return false;
    }
    
    isSyncing = true;
    if(typeof showToast === 'function') showToast('🔄 Synchronisation en cours...', 'info');
    
    try {
        const companyData = {
            user_id: window.currentUser,
            name: window.companyInfo?.name || 'Mes Bes Extrêmes',
            slogan: window.companyInfo?.slogan || 'Bar & Terrasse',
            address: window.companyInfo?.address || '',
            phone: window.companyInfo?.phone || '',
            email: window.companyInfo?.email || '',
            website: window.companyInfo?.website || '',
            facebook: window.companyInfo?.facebook || '',
            instagram: window.companyInfo?.instagram || '',
            tiktok: window.companyInfo?.tiktok || '',
            logo: window.companyInfo?.logo || null,
            rccm: window.companyInfo?.rccm || '',
            tax_id: window.companyInfo?.taxId || '',
            registre: window.companyInfo?.registre || '',
            updated_at: new Date().toISOString()
        };
        
        const { error: companyError } = await supabaseClient
            .from('company_info')
            .upsert(companyData, { onConflict: 'user_id' });
        
        if(companyError) console.error('❌ Erreur company_info:', companyError);
        else console.log('✅ Company info synchronisée');

        const settingsData = {
            user_id: window.currentUser,
            local_threshold: window.settings?.localThreshold || 10,
            importe_threshold: window.settings?.importeThreshold || 3,
            vip_surcharge1: window.settings?.vipSurcharge1 || 2000,
            vip_surcharge2: window.settings?.vipSurcharge2 || 5000,
            vip_surcharge3: window.settings?.vipSurcharge3 || 10000,
            work_hours_per_day: window.settings?.workHoursPerDay || 8,
            work_days_per_month: window.settings?.workDaysPerMonth || 30,
            auto_save: window.settings?.autoSave !== false,
            theme: window.settings?.theme || 'dark',
            updated_at: new Date().toISOString()
        };
        
        const { error: settingsError } = await supabaseClient
            .from('settings')
            .upsert(settingsData, { onConflict: 'user_id' });
        
        if(settingsError) console.error('❌ Erreur settings:', settingsError);
        else console.log('✅ Settings synchronisés');

        if(window.items && window.items.length > 0) {
            const itemsData = window.items.map(item => ({
                id: item.id,
                user_id: window.currentUser,
                name: item.name,
                price: item.price,
                purchase_price: item.purchasePrice || 0,
                type: item.type,
                depot_stock: item.depotStock || 0,
                comptoir_stock: item.comptoirStock || 0,
                sold: item.sold || 0,
                barcode: item.barcode || '',
                expiry_date: item.expiryDate || null,
                photo: item.photo || null,
                hidden: item.hidden || false
            }));
            
            for(let i = 0; i < itemsData.length; i += 100) {
                const batch = itemsData.slice(i, i + 100);
                const { error: itemsError } = await supabaseClient
                    .from('items')
                    .upsert(batch, { onConflict: 'id' });
                if(itemsError) console.error('❌ Erreur items batch:', itemsError);
            }
            console.log(`✅ ${itemsData.length} articles synchronisés`);
        }

        if(window.servers && window.servers.length > 0) {
            const serversData = window.servers.map(server => ({
                id: server.id,
                user_id: window.currentUser,
                name: server.name,
                position: server.position,
                start_date: server.startDate,
                fixed_salary: server.fixedSalary,
                daily_salary: server.dailySalary,
                hourly_salary: server.hourlySalary,
                matricule: server.matricule,
                photo: server.photo,
                present: server.present || false,
                present_days: server.presentDays || 0
            }));
            
            const { error: serversError } = await supabaseClient
                .from('servers')
                .upsert(serversData, { onConflict: 'id' });
            if(serversError) console.error('❌ Erreur servers:', serversError);
            else console.log(`✅ ${serversData.length} serveurs synchronisés`);
        }

        if(window.tasks && window.tasks.length > 0) {
            const tasksData = window.tasks.map(task => ({
                id: task.id,
                user_id: window.currentUser,
                title: task.title,
                description: task.description || '',
                category: task.category,
                priority: task.priority,
                status: task.status,
                assigned_to_name: task.assignedTo?.name || null,
                created_at: task.createdAt,
                completed_at: task.completedAt
            }));
            
            const { error: tasksError } = await supabaseClient
                .from('tasks')
                .upsert(tasksData, { onConflict: 'id' });
            if(tasksError) console.error('❌ Erreur tasks:', tasksError);
            else console.log(`✅ ${tasksData.length} tâches synchronisées`);
        }

        if(window.debts && window.debts.length > 0) {
            const debtsData = window.debts.map(debt => ({
                id: debt.id,
                user_id: window.currentUser,
                debt_type: debt.type,
                item_name: debt.itemName,
                qty: debt.qty,
                client_name: debt.clientName,
                value: debt.value,
                status: debt.status,
                debt_date: debt.date
            }));
            
            const { error: debtsError } = await supabaseClient
                .from('debts')
                .upsert(debtsData, { onConflict: 'id' });
            if(debtsError) console.error('❌ Erreur debts:', debtsError);
            else console.log(`✅ ${debtsData.length} dettes synchronisées`);
        }

        if(typeof showToast === 'function') showToast('✅ Synchronisation terminée', 'success');
        if(typeof playSound === 'function') playSound('success');
        console.log('✅ Sync Supabase terminée');
        return true;
        
    } catch(e) { 
        console.error('❌ Sync error:', e); 
        if(typeof showToast === 'function') showToast('⚠️ Erreur de synchronisation', 'error');
        if(typeof playSound === 'function') playSound('error');
        return false;
    } finally { 
        isSyncing = false; 
    }
}

async function loadAllFromSupabase() {
    if(!supabaseClient || !window.currentUser || window.currentUser === 'admin-local') {
        console.log('Chargement ignoré: pas de connexion cloud');
        return false;
    }
    
    try {
        if(typeof showToast === 'function') showToast('🔄 Chargement des données cloud...', 'info');
        
        const [
            companyResult,
            settingsResult,
            itemsResult,
            serversResult,
            tasksResult,
            debtsResult
        ] = await Promise.all([
            supabaseClient.from('company_info').select('*').eq('user_id', window.currentUser).maybeSingle(),
            supabaseClient.from('settings').select('*').eq('user_id', window.currentUser).maybeSingle(),
            supabaseClient.from('items').select('*').eq('user_id', window.currentUser),
            supabaseClient.from('servers').select('*').eq('user_id', window.currentUser),
            supabaseClient.from('tasks').select('*').eq('user_id', window.currentUser),
            supabaseClient.from('debts').select('*').eq('user_id', window.currentUser)
        ]);
        
        if(companyResult.data) {
            window.companyInfo = window.companyInfo || {};
            window.companyInfo.name = companyResult.data.name || window.companyInfo.name;
            window.companyInfo.slogan = companyResult.data.slogan || window.companyInfo.slogan;
            window.companyInfo.address = companyResult.data.address || window.companyInfo.address;
            window.companyInfo.phone = companyResult.data.phone || window.companyInfo.phone;
            window.companyInfo.email = companyResult.data.email || window.companyInfo.email;
            window.companyInfo.website = companyResult.data.website || window.companyInfo.website;
            window.companyInfo.facebook = companyResult.data.facebook || window.companyInfo.facebook;
            window.companyInfo.instagram = companyResult.data.instagram || window.companyInfo.instagram;
            window.companyInfo.tiktok = companyResult.data.tiktok || window.companyInfo.tiktok;
            window.companyInfo.logo = companyResult.data.logo || window.companyInfo.logo;
            window.companyInfo.rccm = companyResult.data.rccm || window.companyInfo.rccm;
            window.companyInfo.taxId = companyResult.data.tax_id || window.companyInfo.taxId;
            window.companyInfo.registre = companyResult.data.registre || window.companyInfo.registre;
            
            if(window.updateLogoDisplay) window.updateLogoDisplay();
            if(window.updateCompanyTexts) window.updateCompanyTexts();
            console.log('✅ Company info chargée');
        }
        
        if(settingsResult.data) {
            window.settings = window.settings || {};
            window.settings.localThreshold = settingsResult.data.local_threshold ?? 10;
            window.settings.importeThreshold = settingsResult.data.importe_threshold ?? 3;
            window.settings.vipSurcharge1 = settingsResult.data.vip_surcharge1 ?? 2000;
            window.settings.vipSurcharge2 = settingsResult.data.vip_surcharge2 ?? 5000;
            window.settings.vipSurcharge3 = settingsResult.data.vip_surcharge3 ?? 10000;
            window.settings.workHoursPerDay = settingsResult.data.work_hours_per_day ?? 8;
            window.settings.workDaysPerMonth = settingsResult.data.work_days_per_month ?? 30;
            window.settings.autoSave = settingsResult.data.auto_save !== false;
            window.settings.theme = settingsResult.data.theme || 'dark';
            console.log('✅ Settings chargés');
        }
        
        if(itemsResult.data && itemsResult.data.length > 0) {
            window.items = itemsResult.data.map(row => ({
                id: row.id,
                name: row.name,
                price: row.price,
                purchasePrice: row.purchase_price || 0,
                type: row.type,
                depotStock: row.depot_stock || 0,
                comptoirStock: row.comptoir_stock || 0,
                sold: row.sold || 0,
                barcode: row.barcode || '',
                expiryDate: row.expiry_date || '',
                photo: row.photo,
                hidden: row.hidden || false
            }));
            if(window.sortItems) window.sortItems();
            console.log(`✅ ${window.items.length} articles chargés`);
        }
        
        if(serversResult.data && serversResult.data.length > 0) {
            window.servers = serversResult.data.map(row => ({
                id: row.id,
                name: row.name,
                position: row.position,
                startDate: row.start_date,
                fixedSalary: row.fixed_salary,
                dailySalary: row.daily_salary,
                hourlySalary: row.hourly_salary,
                matricule: row.matricule,
                photo: row.photo,
                present: row.present || false,
                presentDays: row.present_days || 0
            }));
            console.log(`✅ ${window.servers.length} serveurs chargés`);
        }
        
        if(tasksResult.data && tasksResult.data.length > 0) {
            window.tasks = tasksResult.data.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                category: row.category,
                priority: row.priority,
                status: row.status,
                assignedTo: row.assigned_to_name ? { name: row.assigned_to_name } : null,
                createdAt: row.created_at,
                completedAt: row.completed_at
            }));
            console.log(`✅ ${window.tasks.length} tâches chargées`);
            if(window.renderTaskBoard) window.renderTaskBoard();
        }
        
        if(debtsResult.data && debtsResult.data.length > 0) {
            window.debts = debtsResult.data.map(row => ({
                id: row.id,
                type: row.debt_type,
                itemName: row.item_name,
                qty: row.qty,
                clientName: row.client_name,
                value: row.value,
                status: row.status,
                date: row.debt_date
            }));
            console.log(`✅ ${window.debts.length} dettes chargées`);
        }
        
        if(window.updateCompanyFormFields) window.updateCompanyFormFields();
        if(window.updateServerSelects) window.updateServerSelects();
        if(window.renderAll) window.renderAll();
        
        if(typeof saveData === 'function') saveData();
        
        if(typeof showToast === 'function') showToast('✅ Données cloud chargées', 'success');
        if(typeof playSound === 'function') playSound('success');
        return true;
        
    } catch(e) { 
        console.error('Load error:', e); 
        if(typeof showToast === 'function') showToast('⚠️ Erreur de chargement cloud', 'error');
        return false; 
    }
}

function exportData() {
    const data = { 
        items: window.items || [], 
        salesHistory: window.salesHistory || [], 
        settings: window.settings || {}, 
        servers: window.servers || [], 
        companyInfo: window.companyInfo || {}, 
        debts: window.debts || [], 
        tasks: window.tasks || [],
        stockMovements: window.stockMovements || [],
        losses: window.losses || [],
        expenses: window.expenses || [],
        purchases: window.purchases || [],
        suppliers: window.suppliers || []
    };
    const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `backup_mesbesextremes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    if(typeof showToast === 'function') showToast('Exporté avec succès', 'success');
    if(typeof playSound === 'function') playSound('success');
}

function importData(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if(data.items) window.items = data.items;
            if(data.salesHistory) window.salesHistory = data.salesHistory;
            if(data.servers) window.servers = data.servers;
            if(data.settings) Object.assign(window.settings || {}, data.settings);
            if(data.companyInfo) Object.assign(window.companyInfo || {}, data.companyInfo);
            if(data.debts) window.debts = data.debts;
            if(data.tasks) window.tasks = data.tasks;
            if(data.stockMovements) window.stockMovements = data.stockMovements;
            if(data.losses) window.losses = data.losses;
            if(data.expenses) window.expenses = data.expenses;
            if(data.purchases) window.purchases = data.purchases;
            if(data.suppliers) window.suppliers = data.suppliers;
            if(typeof saveData === 'function') saveData();
            if(window.renderAll) window.renderAll();
            if(window.updateLogoDisplay) window.updateLogoDisplay();
            if(typeof showToast === 'function') showToast('Importé avec succès', 'success');
            if(typeof playSound === 'function') playSound('success');
        } catch(e) {
            if(typeof showToast === 'function') showToast('Erreur lors de l\'import', 'error');
            if(typeof playSound === 'function') playSound('error');
        }
    };
    reader.readAsText(file);
}

function confirmResetAllData() {
    if(confirm('⚠️ RÉINITIALISATION TOTALE ⚠️\n\nCette action supprimera TOUTES les données.\n\nÊtes-vous sûr ?')) {
        if(confirm('CONFIRMATION : Tapez "RESET" pour valider')) {
            const confirmation = prompt('Tapez "RESET" :');
            if(confirmation === 'RESET') {
                localStorage.clear();
                indexedDB.deleteDatabase('MesBesExtremesOffline');
                
                if(supabaseClient && window.currentUser && window.currentUser !== 'admin-local') {
                    Promise.all([
                        supabaseClient.from('items').delete().eq('user_id', window.currentUser),
                        supabaseClient.from('servers').delete().eq('user_id', window.currentUser),
                        supabaseClient.from('settings').delete().eq('user_id', window.currentUser),
                        supabaseClient.from('company_info').delete().eq('user_id', window.currentUser),
                        supabaseClient.from('tasks').delete().eq('user_id', window.currentUser),
                        supabaseClient.from('debts').delete().eq('user_id', window.currentUser)
                    ]).catch(e => console.log('Erreur nettoyage cloud:', e));
                }
                
                if(typeof showToast === 'function') showToast('Réinitialisation complète, redémarrage...', 'warning');
                setTimeout(() => location.reload(), 1500);
            }
        }
    }
}

window.forceSync = async function() {
    if(!supabaseClient || !window.currentUser || window.currentUser === 'admin-local') {
        if(typeof showToast === 'function') showToast('Connectez-vous au cloud d\'abord', 'warning');
        return;
    }
    if(!onlineStatus) {
        if(typeof showToast === 'function') showToast('Mode hors ligne - impossible de synchroniser', 'error');
        return;
    }
    await syncAllToSupabase();
};

// Exposer les fonctions globalement
window.initDatabase = initDatabase;
window.saveData = saveData;
window.loadLocalData = loadLocalData;
window.syncAllToSupabase = syncAllToSupabase;
window.loadAllFromSupabase = loadAllFromSupabase;
window.exportData = exportData;
window.importData = importData;
window.confirmResetAllData = confirmResetAllData;
window.processSyncQueue = processSyncQueue;
window.addToSyncQueue = addToSyncQueue;
