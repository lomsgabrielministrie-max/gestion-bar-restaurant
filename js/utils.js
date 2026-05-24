// ============================================
// UTILS - Fonctions utilitaires
// ============================================

let settings = { 
    localThreshold: 10, 
    importeThreshold: 3, 
    vipSurcharge1: 2000, 
    vipSurcharge2: 5000, 
    vipSurcharge3: 10000, 
    workHoursPerDay: 8, 
    workDaysPerMonth: 30, 
    autoSave: true, 
    theme: 'dark' 
};

let companyInfo = { 
    name: "Mes Bes Extrêmes", 
    slogan: "Bar & Terrasse", 
    address: "Route Kimpé, Réf. OCC, Ville de Kasumbalesa", 
    phone: "+243 813 594 485", 
    email: "contact@mesbesextremes.cd", 
    website: "www.mesbesextremes.cd", 
    facebook: "@mesbesextremes", 
    instagram: "@mesbesextremes", 
    tiktok: "@mesbesextremes", 
    logo: null, 
    rccm: "RCCM-CD/KIN/00000", 
    taxId: "IDNAT-0000000000", 
    registre: "RC-00000" 
};

function formatFC(a) { 
    return a ? a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' FC' : '0 FC'; 
}

function formatDate(d) { 
    if(!d) return ''; 
    const date = new Date(d); 
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); 
}

function getCurrentDateFormatted() { 
    const d = new Date(); 
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); 
}

function sortItems() { 
    if(window.items) window.items.sort((a, b) => a.name.localeCompare(b.name, 'fr')); 
}

function getTotalStock(i) { 
    return (i.depotStock || 0) + (i.comptoirStock || 0); 
}

function getRemainingStock(i) { 
    return getTotalStock(i); 
}

function getStockStatus(i) { 
    const r = getRemainingStock(i); 
    const t = i.type === 'local' ? settings.localThreshold : settings.importeThreshold; 
    if(r <= 0) return { class: 'stock-critical', text: 'Rupture!' }; 
    if(r <= t) return { class: 'stock-low', text: 'Stock bas!' }; 
    return { class: 'stock-ok', text: 'En stock' }; 
}

function getVipSurcharge(p) { 
    if(p < 10000) return settings.vipSurcharge1; 
    if(p <= 30000) return settings.vipSurcharge2; 
    return settings.vipSurcharge3; 
}

function showToast(m, t = 'success') { 
    const c = document.getElementById('toastContainer'); 
    if(!c) return;
    const d = document.createElement('div'); 
    d.className = 'toast ' + t; 
    d.innerHTML = `<i class="fas ${t === 'success' ? 'fa-check-circle' : t === 'error' ? 'fa-exclamation-circle' : t === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i><span>${m}</span>`;
    c.appendChild(d); 
    setTimeout(() => d.remove(), 3000); 
}

function toggleTheme() { 
    document.body.classList.toggle('light-theme'); 
    settings.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark'; 
    if(window.saveData) window.saveData(); 
    localStorage.setItem('mbe_theme', settings.theme); 
}

function closeModal(id) { 
    const modal = document.getElementById(id); 
    if(modal) modal.classList.remove('active'); 
}

function updateDate() { 
    const d = new Date(); 
    const currentDate = document.getElementById('currentDate'); 
    if(currentDate) currentDate.textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); 
}

function getCompanyLegalInfo() { 
    let legal = ''; 
    if(companyInfo.rccm) legal += `RCCM: ${companyInfo.rccm} | `; 
    if(companyInfo.taxId) legal += `N° Impôt: ${companyInfo.taxId} | `; 
    if(companyInfo.registre) legal += `RC: ${companyInfo.registre}`; 
    return legal; 
}

async function compressPhoto(file) { 
    return new Promise((resolve) => { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
            const img = new Image(); 
            img.onload = function() { 
                const canvas = document.createElement('canvas'); 
                let width = img.width, height = img.height; 
                const maxWidth = 300, maxHeight = 300; 
                if(width > height) { 
                    if(width > maxWidth) { 
                        height = Math.round(height * maxWidth / width); 
                        width = maxWidth; 
                    } 
                } else { 
                    if(height > maxHeight) { 
                        width = Math.round(width * maxHeight / height); 
                        height = maxHeight; 
                    } 
                } 
                canvas.width = width; 
                canvas.height = height; 
                const ctx = canvas.getContext('2d'); 
                ctx.drawImage(img, 0, 0, width, height); 
                resolve(canvas.toDataURL('image/jpeg', 0.5)); 
            }; 
            img.src = e.target.result; 
        }; 
        reader.readAsDataURL(file); 
    }); 
}

function loadUserPreferences() { 
    const prefs = localStorage.getItem('mbe_preferences'); 
    if(prefs) { 
        try { 
            const p = JSON.parse(prefs); 
            if(p.theme) { 
                settings.theme = p.theme; 
                if(p.theme === 'light') document.body.classList.add('light-theme'); 
                else document.body.classList.remove('light-theme'); 
            } 
            if(p.autoSave !== undefined) settings.autoSave = p.autoSave; 
            if(p.workHoursPerDay) settings.workHoursPerDay = p.workHoursPerDay; 
            if(p.workDaysPerMonth) settings.workDaysPerMonth = p.workDaysPerMonth; 
        } catch(e) {} 
    } 
}

function saveUserPreferences() { 
    const preferences = { 
        theme: settings.theme, 
        autoSave: settings.autoSave, 
        workHoursPerDay: settings.workHoursPerDay, 
        workDaysPerMonth: settings.workDaysPerMonth 
    }; 
    localStorage.setItem('mbe_preferences', JSON.stringify(preferences)); 
}

function generateProfessionalPDF(title, headers, body, orientation = 'portrait') { 
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF({ orientation: orientation }); 
    if(companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15); 
    doc.setFontSize(14); 
    doc.text(companyInfo.name, 30, 12); 
    doc.setFontSize(8); 
    doc.text(`${companyInfo.address} | ${companyInfo.phone}`, 30, 17); 
    const legalInfo = getCompanyLegalInfo(); 
    if(legalInfo) doc.text(legalInfo, 30, 22); 
    doc.text(`Généré par: ${window.userProfile?.fullName || window.currentUser} - ${getCurrentDateFormatted()}`, 30, legalInfo ? 27 : 22); 
    doc.setFontSize(12); 
    doc.text(title, 10, legalInfo ? 37 : 32); 
    doc.autoTable({ startY: legalInfo ? 43 : 38, head: [headers], body: body, styles: { fontSize: 7 } }); 
    return doc; 
}

function initUtils() { 
    loadUserPreferences(); 
    setInterval(updateDate, 60000); 
    updateDate(); 
}

// Exporter les fonctions globalement
window.formatFC = formatFC;
window.formatDate = formatDate;
window.getCurrentDateFormatted = getCurrentDateFormatted;
window.sortItems = sortItems;
window.getTotalStock = getTotalStock;
window.getRemainingStock = getRemainingStock;
window.getStockStatus = getStockStatus;
window.getVipSurcharge = getVipSurcharge;
window.showToast = showToast;
window.toggleTheme = toggleTheme;
window.closeModal = closeModal;
window.updateDate = updateDate;
window.getCompanyLegalInfo = getCompanyLegalInfo;
window.compressPhoto = compressPhoto;
window.loadUserPreferences = loadUserPreferences;
window.saveUserPreferences = saveUserPreferences;
window.generateProfessionalPDF = generateProfessionalPDF;
window.initUtils = initUtils;
window.settings = settings;
window.companyInfo = companyInfo;
