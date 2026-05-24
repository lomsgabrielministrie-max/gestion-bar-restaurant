// ============================================
// NOTIFICATIONS - Système de notifications et alertes
// ============================================

let notificationInterval = null;
let notificationSoundEnabled = true;
let lastNotifications = [];

function initNotifications() {
    window.showNotification = showNotification;
    window.playNotificationSound = playNotificationSound;
    window.startNotificationChecker = startNotificationChecker;
    window.stopNotificationChecker = stopNotificationChecker;
    window.toggleNotificationSound = toggleNotificationSound;
    window.checkLowStockNotifications = checkLowStockNotifications;
    window.checkExpiringItems = checkExpiringItems;
    window.checkPendingDebts = checkPendingDebts;
    window.checkDailySalesTarget = checkDailySalesTarget;
    window.sendPushNotification = sendPushNotification;
    window.playCustomNotificationSound = playCustomNotificationSound;
    
    // Récupérer préférence son
    const saved = localStorage.getItem('mbe_notification_sound');
    if(saved !== null) notificationSoundEnabled = saved === 'true';
    
    // Démarrer le vérificateur toutes les 5 minutes
    startNotificationChecker(300000);
}

function showNotification(title, body, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if(!toastContainer) return;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><div><strong>${title}</strong><br><small>${body}</small></div>`;
    toastContainer.appendChild(toast);
    
    // ========== JOUER LE SON APPROPRIÉ ==========
    if(notificationSoundEnabled) {
        if(typeof playSound === 'function') {
            switch(type) {
                case 'success': 
                    playSound('success');
                    break;
                case 'error': 
                    playSound('error');
                    break;
                case 'warning': 
                    playSound('warning');
                    break;
                default: 
                    playSound('notification');
            }
        } else {
            playCustomNotificationSound(type);
        }
    }
    
    // Enregistrer la notification
    lastNotifications.unshift({ title, body, type, timestamp: new Date() });
    if(lastNotifications.length > 20) lastNotifications.pop();
    
    // Supprimer après 5 secondes
    setTimeout(() => toast.remove(), 5000);
    
    // Notification navigateur si permission accordée
    if('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: '/favicon.ico' });
    }
}

// ============================================
// SONS PERSONNALISÉS PUISSANTS POUR NOTIFICATIONS
// ============================================

function playCustomNotificationSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if(audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        switch(type) {
            case 'success':
                // Fanfare de succès (3 notes ascendantes)
                playBeepAdvanced(audioContext, 523.25, 0.12, 0.35, 0);
                playBeepAdvanced(audioContext, 659.25, 0.12, 0.35, 0.15);
                playBeepAdvanced(audioContext, 783.99, 0.25, 0.45, 0.3);
                break;
                
            case 'error':
                // Son d'erreur grave et long
                playBeepAdvanced(audioContext, 220, 0.35, 0.5, 0);
                playBeepAdvanced(audioContext, 196, 0.35, 0.5, 0.4);
                playBeepAdvanced(audioContext, 174.61, 0.4, 0.5, 0.8);
                break;
                
            case 'warning':
                // Alerte (3 bips rapides)
                playBeepAdvanced(audioContext, 880, 0.1, 0.4, 0);
                playBeepAdvanced(audioContext, 880, 0.1, 0.4, 0.2);
                playBeepAdvanced(audioContext, 880, 0.15, 0.4, 0.4);
                break;
                
            case 'info':
                // Son informatif doux
                playBeepAdvanced(audioContext, 587.33, 0.15, 0.25, 0);
                playBeepAdvanced(audioContext, 783.99, 0.2, 0.25, 0.2);
                break;
                
            case 'reminder':
                // Rappel (son descendant)
                playBeepAdvanced(audioContext, 880, 0.1, 0.3, 0);
                playBeepAdvanced(audioContext, 783.99, 0.1, 0.3, 0.15);
                playBeepAdvanced(audioContext, 698.46, 0.15, 0.3, 0.3);
                break;
                
            case 'urgent':
                // Urgent (son montant rapide)
                playBeepAdvanced(audioContext, 1046.5, 0.08, 0.5, 0);
                playBeepAdvanced(audioContext, 1174.66, 0.08, 0.5, 0.12);
                playBeepAdvanced(audioContext, 1318.52, 0.12, 0.5, 0.24);
                break;
                
            default:
                // Son par défaut
                playBeepAdvanced(audioContext, 880, 0.1, 0.3, 0);
                playBeepAdvanced(audioContext, 880, 0.1, 0.3, 0.15);
        }
    } catch(e) { 
        console.log('Lecture son impossible:', e); 
    }
}

// Version améliorée de playBeep avec plus de contrôle
function playBeepAdvanced(ctx, frequency, duration, volume = 0.35, delay = 0) {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 5;
    
    gainNode.gain.value = 0;
    
    oscillator.start(now + delay);
    
    // Attaque rapide
    gainNode.gain.setValueAtTime(0, now + delay);
    gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.015);
    
    // Release
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
    
    oscillator.stop(now + delay + duration);
}

// Version simple (compatible)
function playBeepNotification(ctx, frequency, duration, volume = 0.3, delay = 0) {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0;
    
    oscillator.start(now + delay);
    gainNode.gain.setValueAtTime(0, now + delay);
    gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
    oscillator.stop(now + delay + duration);
}

function startNotificationChecker(intervalMs = 300000) {
    if(notificationInterval) clearInterval(notificationInterval);
    
    notificationInterval = setInterval(() => {
        if(document.visibilityState === 'visible') {
            checkLowStockNotifications();
            checkExpiringItems();
            checkPendingDebts();
            checkDailySalesTarget();
        }
    }, intervalMs);
}

function stopNotificationChecker() {
    if(notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
}

function toggleNotificationSound() {
    notificationSoundEnabled = !notificationSoundEnabled;
    localStorage.setItem('mbe_notification_sound', notificationSoundEnabled);
    if(typeof showToast === 'function') {
        showNotification('Son des notifications', notificationSoundEnabled ? 'Activé' : 'Désactivé', 'info');
    }
    if(notificationSoundEnabled && typeof playSound === 'function') {
        playSound('notification');
    }
}

function checkLowStockNotifications() {
    if(!window.items) return;
    
    const lowStockItems = window.items.filter(item => {
        const totalStock = (item.depotStock || 0) + (item.comptoirStock || 0);
        const threshold = item.type === 'local' ? (window.settings?.localThreshold || 10) : (window.settings?.importeThreshold || 3);
        return totalStock <= threshold && totalStock > 0 && !item.hidden;
    });
    
    const criticalItems = window.items.filter(item => {
        const totalStock = (item.depotStock || 0) + (item.comptoirStock || 0);
        return totalStock === 0 && !item.hidden;
    });
    
    if(criticalItems.length > 0) {
        showNotification('⚠️ Rupture de stock', `${criticalItems.length} article(s) en rupture: ${criticalItems.slice(0,3).map(i=>i.name).join(', ')}${criticalItems.length>3 ? '...' : ''}`, 'error');
    } else if(lowStockItems.length > 0) {
        showNotification('📦 Stock bas', `${lowStockItems.length} article(s) en alerte: ${lowStockItems.slice(0,3).map(i=>i.name).join(', ')}${lowStockItems.length>3 ? '...' : ''}`, 'warning');
    }
}

function checkExpiringItems() {
    if(!window.items) return;
    
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 86400000);
    
    const expiringItems = window.items.filter(item => {
        if(!item.expiryDate) return false;
        const expiry = new Date(item.expiryDate);
        return expiry <= in7Days && expiry >= today && !item.hidden;
    });
    
    const expiredItems = window.items.filter(item => {
        if(!item.expiryDate) return false;
        const expiry = new Date(item.expiryDate);
        return expiry < today && !item.hidden;
    });
    
    if(expiredItems.length > 0) {
        showNotification('⚠️ Produits expirés', `${expiredItems.length} article(s) expiré(s)`, 'error');
    } else if(expiringItems.length > 0) {
        showNotification('📅 Expiration proche', `${expiringItems.length} article(s) expirent dans moins de 7 jours`, 'warning');
    }
}

function checkPendingDebts() {
    if(!window.debts) return;
    
    const pendingDebts = window.debts.filter(d => d.status === 'pending');
    const today = new Date().toISOString().split('T')[0];
    const overdueDebts = pendingDebts.filter(d => d.dueDate && d.dueDate < today);
    
    if(overdueDebts.length > 0) {
        showNotification('💰 Dettes en retard', `${overdueDebts.length} dette(s) client(s) en retard`, 'warning');
        // Son urgent pour dettes en retard
        if(notificationSoundEnabled && typeof playSound === 'function') {
            playSound('urgent');
        }
    } else if(pendingDebts.length > 0) {
        const totalValue = pendingDebts.reduce((s, d) => s + d.value, 0);
        const formattedValue = typeof formatFC === 'function' ? formatFC(totalValue) : totalValue + ' FC';
        showNotification('💳 Dettes en cours', `${pendingDebts.length} dette(s) pour un total de ${formattedValue}`, 'info');
    }
}

function checkDailySalesTarget() {
    if(!window.salesHistory) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = window.salesHistory.filter(s => s.date.split('T')[0] === today);
    const todayTotal = todaySales.reduce((s, sale) => s + sale.grandTotal, 0);
    
    const dailyTarget = localStorage.getItem('mbe_daily_target') ? parseInt(localStorage.getItem('mbe_daily_target')) : 500000;
    
    const percentage = (todayTotal / dailyTarget) * 100;
    
    if(percentage >= 100) {
        const formattedTotal = typeof formatFC === 'function' ? formatFC(todayTotal) : todayTotal + ' FC';
        const formattedTarget = typeof formatFC === 'function' ? formatFC(dailyTarget) : dailyTarget + ' FC';
        showNotification('🎉 Objectif atteint !', `Objectif quotidien atteint: ${formattedTotal} / ${formattedTarget}`, 'success');
    } else if(percentage >= 75) {
        showNotification('📈 Proche de l\'objectif', `${Math.round(percentage)}% de l'objectif quotidien atteint`, 'info');
    }
}

async function sendPushNotification(title, body) {
    if('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body });
    } else if('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if(permission === 'granted') {
            new Notification(title, { body: body });
        }
    }
}

// ============================================
// SONS POUR NOTIFICATIONS SPÉCIFIQUES
// ============================================

function playDebtReminderSound() {
    if(!notificationSoundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if(audioContext.state === 'suspended') audioContext.resume();
        
        // Son spécifique pour rappel de dette
        playBeepAdvanced(audioContext, 659.25, 0.12, 0.4, 0);
        playBeepAdvanced(audioContext, 587.33, 0.12, 0.4, 0.18);
        playBeepAdvanced(audioContext, 523.25, 0.2, 0.4, 0.36);
    } catch(e) { console.log('Erreur son dette:', e); }
}

function playStockAlertSound() {
    if(!notificationSoundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if(audioContext.state === 'suspended') audioContext.resume();
        
        // Son spécifique pour alerte stock
        playBeepAdvanced(audioContext, 698.46, 0.1, 0.45, 0);
        playBeepAdvanced(audioContext, 698.46, 0.1, 0.45, 0.2);
        playBeepAdvanced(audioContext, 698.46, 0.15, 0.45, 0.4);
    } catch(e) { console.log('Erreur son stock:', e); }
}

function playExpiryAlertSound() {
    if(!notificationSoundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if(audioContext.state === 'suspended') audioContext.resume();
        
        // Son spécifique pour expiration
        playBeepAdvanced(audioContext, 523.25, 0.2, 0.35, 0);
        playBeepAdvanced(audioContext, 493.88, 0.2, 0.35, 0.25);
        playBeepAdvanced(audioContext, 440, 0.3, 0.35, 0.5);
    } catch(e) { console.log('Erreur son expiration:', e); }
}

// Exposer les fonctions supplémentaires
window.playDebtReminderSound = playDebtReminderSound;
window.playStockAlertSound = playStockAlertSound;
window.playExpiryAlertSound = playExpiryAlertSound;
window.playBeepAdvanced = playBeepAdvanced;

// Demander la permission pour les notifications
if('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}