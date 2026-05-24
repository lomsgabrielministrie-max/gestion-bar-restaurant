// ============================================
// INVENTORY - Gestion des stocks et articles
// ============================================

let items = [];
let stockMovements = [];
let losses = [];
let expenses = [];
let purchases = [];
let suppliers = [{ id: 1, name: "Bralima", contact: "+243 813 594 485" }, { id: 2, name: "Bracongo", contact: "+243 987 654 321" }];
let trackingData = { comptoir: {}, depot: {} };
let priceHistory = [];

// ============================================
// SERVEURS PAR DÉFAUT (9 serveurs)
// ============================================
const defaultServers = [
    { name: "Sarive Woto", position: "Gérant", startDate: "2026-01-16", fixedSalary: 220000 },
    { name: "Eva Mikato", position: "Gérant", startDate: "2026-01-04", fixedSalary: 220000 },
    { name: "Mimi Luboya", position: "Cuisinière", startDate: "2025-12-29", fixedSalary: 140000 },
    { name: "Maman Bébé", position: "Nettoyeuse", startDate: "2026-02-13", fixedSalary: 140000 },
    { name: "Admira Bakajika", position: "Réceptionniste", startDate: "2025-03-01", fixedSalary: 140000 },
    { name: "Christelle Kam's", position: "Serveuse", startDate: "2025-03-01", fixedSalary: 140000 },
    { name: "Ruth Ruthiana", position: "Serveuse", startDate: "2026-12-29", fixedSalary: 140000 },
    { name: "Darcia", position: "Serveuse", startDate: "2026-04-04", fixedSalary: 140000 },
    { name: "Sam Samsanga", position: "Barman", startDate: "2026-03-27", fixedSalary: 140000 }
];

// ============================================
// LISTE COMPLÈTE DES ARTICLES (75 articles) AVEC PRIX D'ACHAT
// ============================================
const fullItemsList = [
    { name: "33 Export", price: 5000, purchasePrice: 2800, type: "local", barcode: "5407010260830", depotStock: 0, comptoirStock: 0 },
    { name: "Appy", price: 2000, purchasePrice: 1100, type: "importe", barcode: "6009709821798", depotStock: 24, comptoirStock: 12 },
    { name: "Autumn", price: 12000, purchasePrice: 6500, type: "importe", barcode: "6001108036827", depotStock: 13, comptoirStock: 2 },
    { name: "Beaufort", price: 5000, purchasePrice: 2800, type: "local", barcode: "9501100003065", depotStock: 0, comptoirStock: 0 },
    { name: "Black Bencher (G)", price: 15000, purchasePrice: 8500, type: "importe", barcode: "6900705990030", depotStock: 0, comptoirStock: 0 },
    { name: "Black Bencher (P)", price: 8000, purchasePrice: 4500, type: "importe", barcode: "8906125990047", depotStock: 0, comptoirStock: 0 },
    { name: "Bony Brown", price: 20000, purchasePrice: 11000, type: "importe", barcode: "35087024", depotStock: 0, comptoirStock: 0 },
    { name: "Bony Oldman", price: 35000, purchasePrice: 19000, type: "importe", barcode: "97543605", depotStock: 0, comptoirStock: 0 },
    { name: "Bony Red", price: 20000, purchasePrice: 11000, type: "importe", barcode: "90356706", depotStock: 0, comptoirStock: 0 },
    { name: "Booster", price: 4500, purchasePrice: 2500, type: "importe", barcode: "9501100007735", depotStock: 13, comptoirStock: 0 },
    { name: "Brotters", price: 5000, purchasePrice: 2800, type: "importe", barcode: "6009715101808", depotStock: 0, comptoirStock: 0 },
    { name: "Brutal", price: 6000, purchasePrice: 3300, type: "importe", barcode: "6003326013949", depotStock: 0, comptoirStock: 0 },
    { name: "C. Lite", price: 5000, purchasePrice: 2800, type: "importe", barcode: "6003326015721", depotStock: 24, comptoirStock: 24 },
    { name: "Castel", price: 5000, purchasePrice: 2800, type: "local", barcode: "9501100002181", depotStock: 0, comptoirStock: 0 },
    { name: "Cérès", price: 10000, purchasePrice: 5500, type: "importe", barcode: "6001240240908", depotStock: 24, comptoirStock: 1 },
    { name: "Chamdor", price: 18000, purchasePrice: 9800, type: "importe", barcode: "6001495080007", depotStock: 2, comptoirStock: 1 },
    { name: "Chirpy Ananas", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Chirpy cola", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Chirpy Grenadine", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Chirpy Orange", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Chui", price: 3000, purchasePrice: 1600, type: "local", barcode: "764460896107", depotStock: 0, comptoirStock: 0 },
    { name: "Class", price: 3000, purchasePrice: 1600, type: "local", barcode: "8723567", depotStock: 9, comptoirStock: 0 },
    { name: "Club7", price: 10000, purchasePrice: 5500, type: "importe", barcode: "2497641", depotStock: 0, comptoirStock: 0 },
    { name: "Coca-Cola Plastique", price: 2500, purchasePrice: 1300, type: "importe", barcode: "644049414932", depotStock: 60, comptoirStock: 9 },
    { name: "Coca-Cola Verre", price: 2500, purchasePrice: 1300, type: "local", barcode: "87126037", depotStock: 48, comptoirStock: 12 },
    { name: "D'jino", price: 3000, purchasePrice: 1600, type: "local", barcode: "764460896022", depotStock: 20, comptoirStock: 11 },
    { name: "D'jino Tonic", price: 3500, purchasePrice: 1900, type: "local", barcode: "8234670", depotStock: 15, comptoirStock: 4 },
    { name: "Eva", price: 16000, purchasePrice: 8800, type: "importe", barcode: "8410635024043", depotStock: 2, comptoirStock: 1 },
    { name: "Exo", price: 5000, purchasePrice: 2800, type: "importe", barcode: "5909304214074", depotStock: 8, comptoirStock: 5 },
    { name: "Fanta Plastique", price: 2500, purchasePrice: 1300, type: "importe", barcode: "8623460", depotStock: 60, comptoirStock: 0 },
    { name: "Fanta Verre", price: 2500, purchasePrice: 1300, type: "local", barcode: "8024566", depotStock: 48, comptoirStock: 2 },
    { name: "Grand Amarula", price: 35000, purchasePrice: 19000, type: "importe", barcode: "6001495062508", depotStock: 1, comptoirStock: 1 },
    { name: "Grand Doppel", price: 6500, purchasePrice: 3500, type: "local", barcode: "574022", depotStock: 48, comptoirStock: 15 },
    { name: "Grand Imperial", price: 35000, purchasePrice: 19000, type: "importe", barcode: "8901522000108", depotStock: 6, comptoirStock: 4 },
    { name: "Grand Red Label", price: 35000, purchasePrice: 19000, type: "importe", barcode: "5000267190143", depotStock: 0, comptoirStock: 0 },
    { name: "Grand Reserve 7", price: 30000, purchasePrice: 16500, type: "importe", barcode: "8906125990009", depotStock: 3, comptoirStock: 4 },
    { name: "Grand Simba", price: 5000, purchasePrice: 2800, type: "local", barcode: "44300811", depotStock: 0, comptoirStock: 0 },
    { name: "Grand Tembo", price: 5000, purchasePrice: 2800, type: "local", barcode: "9700655", depotStock: 0, comptoirStock: 0 },
    { name: "Grande bouteille d'eau", price: 1000, purchasePrice: 500, type: "importe", barcode: "6009643610427", depotStock: 144, comptoirStock: 6 },
    { name: "Grant's", price: 30000, purchasePrice: 16500, type: "importe", barcode: "5010327000046", depotStock: 0, comptoirStock: 0 },
    { name: "Guinness", price: 5000, purchasePrice: 2800, type: "local", barcode: "5000213012642", depotStock: 48, comptoirStock: 6 },
    { name: "Harrier", price: 16000, purchasePrice: 8800, type: "importe", barcode: "6001495020003", depotStock: 4, comptoirStock: 1 },
    { name: "Heineken", price: 5000, purchasePrice: 2800, type: "importe", barcode: "6001108055187", depotStock: 24, comptoirStock: 23 },
    { name: "Hunters", price: 5000, purchasePrice: 2800, type: "importe", barcode: "6001108055187", depotStock: 0, comptoirStock: 0 },
    { name: "Kung-fu", price: 2500, purchasePrice: 1300, type: "importe", barcode: "013530015956", depotStock: 36, comptoirStock: 6 },
    { name: "LeRoux", price: 15000, purchasePrice: 8200, type: "importe", barcode: "6001497114007", depotStock: 1, comptoirStock: 1 },
    { name: "Muscad'or", price: 35000, purchasePrice: 19000, type: "importe", barcode: "3438931016062", depotStock: 1, comptoirStock: 2 },
    { name: "Ntay", price: 4000, purchasePrice: 2200, type: "local", barcode: "7500310", depotStock: 12, comptoirStock: 3 },
    { name: "Papier mouchoirs blanc", price: 1000, purchasePrice: 500, type: "importe", barcode: "55262009", depotStock: 0, comptoirStock: 0 },
    { name: "Papier mouchoirs vert", price: 500, purchasePrice: 250, type: "importe", barcode: "89262211", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Amarula", price: 25000, purchasePrice: 13500, type: "importe", barcode: "6001495062478", depotStock: 2, comptoirStock: 1 },
    { name: "Petit Cola PL", price: 1500, purchasePrice: 800, type: "importe", barcode: "8663022", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Doppel", price: 5000, purchasePrice: 2800, type: "importe", barcode: "5407010260250", depotStock: 12, comptoirStock: 20 },
    { name: "Petit Fanta PL", price: 1500, purchasePrice: 800, type: "importe", barcode: "5520777", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Imperial", price: 10000, purchasePrice: 5500, type: "importe", barcode: "8901522001105", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Red Label", price: 25000, purchasePrice: 13500, type: "importe", barcode: "5000267014609", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Reserve 7", price: 18000, purchasePrice: 9800, type: "importe", barcode: "8906125990016", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Simba", price: 2500, purchasePrice: 1300, type: "local", barcode: "5272200", depotStock: 0, comptoirStock: 0 },
    { name: "Petit Tembo", price: 2500, purchasePrice: 1300, type: "local", barcode: "2670775", depotStock: 0, comptoirStock: 0 },
    { name: "Petite bouteille d'eau", price: 500, purchasePrice: 250, type: "local", barcode: "622288", depotStock: 120, comptoirStock: 32 },
    { name: "PM8", price: 12000, purchasePrice: 6500, type: "importe", barcode: "8902147010930", depotStock: 1, comptoirStock: 1 },
    { name: "Powers", price: 5000, purchasePrice: 2800, type: "importe", barcode: "6161109780867", depotStock: 0, comptoirStock: 0 },
    { name: "Racine", price: 3500, purchasePrice: 1900, type: "local", barcode: "3738389", depotStock: 11, comptoirStock: 0 },
    { name: "Red Bull", price: 5000, purchasePrice: 2800, type: "importe", barcode: "9002490100070", depotStock: 0, comptoirStock: 0 },
    { name: "Savana", price: 5000, purchasePrice: 2800, type: "importe", barcode: "91844330", depotStock: 12, comptoirStock: 5 },
    { name: "Sprite", price: 3000, purchasePrice: 1600, type: "local", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Tonic Bralima", price: 2500, purchasePrice: 1300, type: "local", barcode: "", depotStock: 0, comptoirStock: 0 },
    { name: "Turbo", price: 5000, purchasePrice: 2800, type: "local", barcode: "", depotStock: 40, comptoirStock: 1 },
    { name: "Vin J&B", price: 30000, purchasePrice: 16500, type: "importe", barcode: "5010103800303", depotStock: 0, comptoirStock: 0 },
    { name: "Vintana", price: 1000, purchasePrice: 500, type: "importe", barcode: "9272620", depotStock: 0, comptoirStock: 0 },
    { name: "XXL", price: 3500, purchasePrice: 1900, type: "local", barcode: "9501100002723", depotStock: 0, comptoirStock: 22 },
    { name: "Yes Cola", price: 500, purchasePrice: 250, type: "importe", barcode: "07517189", depotStock: 0, comptoirStock: 0 },
    { name: "Yes Energy", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 19, comptoirStock: 0 },
    { name: "Yes Orange", price: 500, purchasePrice: 250, type: "importe", barcode: "1951640", depotStock: 0, comptoirStock: 0 },
    { name: "Yes Pomme", price: 500, purchasePrice: 250, type: "importe", barcode: "", depotStock: 19, comptoirStock: 0 }
];

function initInventory() {
    window.items = items;
    window.stockMovements = stockMovements;
    window.losses = losses;
    window.expenses = expenses;
    window.purchases = purchases;
    window.suppliers = suppliers;
    window.trackingData = trackingData;
    window.priceHistory = priceHistory;
    window.defaultServers = defaultServers;
    
    window.openAddItemModal = openAddItemModal;
    window.openEditItemModal = openEditItemModal;
    window.addNewItem = addNewItem;
    window.saveEditItem = saveEditItem;
    window.deleteItem = deleteItem;
    window.toggleHideItem = toggleHideItem;
    window.showArticleDetails = showArticleDetails;
    window.renderInventory = renderInventory;
    window.renderDepotStock = renderDepotStock;
    window.renderComptoirStock = renderComptoirStock;
    window.renderMovements = renderMovements;
    window.renderLosses = renderLosses;
    window.renderTracking = renderTracking;
    window.renderAlerts = renderAlerts;
    window.updateAlertBadge = updateAlertBadge;
    window.quickTransfer = quickTransfer;
    window.quickReturn = quickReturn;
    window.openBulkTransferModal = openBulkTransferModal;
    window.executeBulkTransfer = executeBulkTransfer;
    window.openBulkReturnModal = openBulkReturnModal;
    window.executeBulkReturn = executeBulkReturn;
    window.reportLoss = reportLoss;
    window.addExpense = addExpense;
    window.filterLossesAndExpenses = filterLossesAndExpenses;
    window.addSupplier = addSupplier;
    window.removeSupplier = removeSupplier;
    window.renderSuppliersList = renderSuppliersList;
    window.generateBarcodeLabels = generateBarcodeLabels;
    window.openPurchaseModal = openPurchaseModal;
    window.processPurchase = processPurchase;
    window.updatePurchaseTotal = updatePurchaseTotal;
    window.openQRScanner = openQRScanner;
    window.generateRandomBarcode = generateRandomBarcode;
    window.closeQRScanner = closeQRScanner;
    window.switchCamera = switchCamera;
    window.updateTrackingComptage = updateTrackingComptage;
    window.switchStockView = switchStockView;
    window.exportMovementsPDF = exportMovementsPDF;
    window.exportMovementsExcel = exportMovementsExcel;
    window.exportLossesPDF = exportLossesPDF;
    window.exportTrackingPDF = exportTrackingPDF;
    window.exportTrackingExcel = exportTrackingExcel;
    window.exportBulkTransferPDF = exportBulkTransferPDF;
    window.exportBulkReturnPDF = exportBulkReturnPDF;
    window.toggleAutoSave = toggleAutoSave;
    window.updateCompanyFormFields = updateCompanyFormFields;
    window.saveCompanyInfo = saveCompanyInfo;
    window.updateLogoDisplay = updateLogoDisplay;
    window.updateCompanyTexts = updateCompanyTexts;
    window.uploadLogo = uploadLogo;
    window.resetDefaultLogo = resetDefaultLogo;
    window.transferLocalToCloud = transferLocalToCloud;
    
    initTrackingData();
}

async function initializeDefaultData() {
    console.log('🔄 Initialisation des données par défaut...');
    
    items = fullItemsList.map((item, idx) => ({ 
        ...item, 
        id: Date.now() + idx + 1, 
        sold: 0, 
        photo: null, 
        expiryDate: '', 
        hidden: false 
    }));
    
    window.servers = defaultServers.map((s, idx) => ({ 
        ...s, 
        id: Date.now() + idx + 100,
        dailySalary: Math.round(s.fixedSalary / (settings.workDaysPerMonth || 30)),
        hourlySalary: Math.round(s.fixedSalary / (settings.workDaysPerMonth || 30) / (settings.workHoursPerDay || 8)),
        matricule: Math.random().toString(36).substring(2, 14).toUpperCase(),
        photo: null,
        present: false,
        presentDays: 0
    }));
    
    window.items = items;
    
    sortItems();
    initTrackingData();
    if(typeof saveData === 'function') saveData();
    
    console.log(`✅ ${items.length} articles initialisés`);
    console.log(`✅ ${window.servers.length} serveurs initialisés`);
}

function initTrackingData() {
    if(!trackingData.comptoir) trackingData.comptoir = {};
    if(!trackingData.depot) trackingData.depot = {};
    const today = new Date().toISOString().split('T')[0];
    if(!trackingData.comptoir[today]) {
        trackingData.comptoir[today] = {};
        items.forEach(item => {
            trackingData.comptoir[today][item.id] = { 
                resteHier: item.comptoirStock || 0, 
                transfert: 0, 
                comptageManuel: item.comptoirStock || 0, 
                sold: 0, 
                offers: 0, 
                losses: 0, 
                surplus: 0, 
                reste: item.comptoirStock || 0 
            };
        });
    }
    if(typeof saveData === 'function') saveData();
}

function renderInventory() {
    const container = document.getElementById('inventoryTable');
    if(!container) return;
    const search = document.getElementById('inventorySearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('inventoryFilter')?.value || 'all';
    let filtered = items.filter(i => i.name.toLowerCase().includes(search));
    if(filter === 'local') filtered = filtered.filter(i => i.type === 'local');
    else if(filter === 'importe') filtered = filtered.filter(i => i.type === 'importe');
    else if(filter === 'rupture') filtered = filtered.filter(i => getRemainingStock(i) <= 0);
    else if(filter === 'expired') filtered = filtered.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date());
    
    container.innerHTML = filtered.map((item, idx) => {
        const status = getStockStatus(item);
        return `<tr class="${item.hidden ? 'hidden-item' : ''}">
            <td style="text-align:center;">${idx + 1}</td>
            <td style="text-align:center;"><img src="${item.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'%232a3344\'/%3E%3Ctext x=\'20\' y=\'28\' text-anchor=\'middle\' fill=\'%238a94a6\' font-size=\'16\'%3E📦%3C/text%3E%3C/svg%3E'}" class="article-photo" onclick="showArticleDetails(${item.id})" style="width:40px; height:40px; border-radius:6px; object-fit:cover; cursor:pointer;"></td>
            <td style="text-align:left; font-weight:500;"><strong>${item.name}</strong>${item.hidden ? ' <span style="color:var(--warning);font-size:11px;">[Masqué]</span>' : ''}</td>
            <td style="text-align:left; font-family:monospace; font-size:12px;">${item.barcode || '-'}</td>
            <td style="text-align:center;"><span class="badge-${item.type}">${item.type === 'local' ? '🟢 Local' : '🔵 Importé'}</span></td>
            <td style="text-align:right; font-weight:600; color:var(--gold);">${formatFC(item.price)}</td>
            <td style="text-align:right;">${item.depotStock || 0}</td>
            <td style="text-align:right;">${item.comptoirStock || 0}</td>
            <td style="text-align:right; font-weight:600;" class="${status.class}">${getRemainingStock(item)}</td>
            <td style="text-align:center; font-size:12px;">${item.expiryDate || '-'}</td>
            <td style="text-align:center; white-space:nowrap;">
                <button class="btn btn-info btn-sm" onclick="openEditItemModal(${item.id})" title="Modifier" style="padding:4px 8px;"><i class="fas fa-edit"></i></button>
                <button class="btn btn-warning btn-sm" onclick="toggleHideItem(${item.id})" title="${item.hidden ? 'Afficher' : 'Masquer'}" style="padding:4px 8px;"><i class="fas ${item.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})" title="Supprimer" style="padding:4px 8px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function renderDepotStock() {
    const container = document.getElementById('depotStockTable');
    const stats = document.getElementById('depotStats');
    if(!container) return;
    const search = document.getElementById('depotSearch')?.value.toLowerCase() || '';
    const filtered = items.filter(i => i.name.toLowerCase().includes(search) && !i.hidden);
    const totalValue = filtered.reduce((s, i) => s + ((i.depotStock || 0) * i.price), 0);
    if(stats) stats.innerHTML = `<div class="stat-card"><i class="fas fa-box"></i><div class="stat-value">${filtered.reduce((s, i) => s + (i.depotStock || 0), 0)}</div><div class="stat-label">Articles</div></div><div class="stat-card"><i class="fas fa-money-bill"></i><div class="stat-value">${formatFC(totalValue)}</div><div class="stat-label">Valeur</div></div>`;
    container.innerHTML = filtered.map(i => `<tr><td style="text-align:left;">${i.name}</td><td style="text-align:left;">${i.barcode || '-'}</td><td style="text-align:center;">${i.depotStock || 0}</td><td style="text-align:right;">${formatFC((i.depotStock || 0) * i.price)}</td><td style="text-align:center;"><button class="btn btn-info btn-sm" onclick="quickTransfer(${i.id})"><i class="fas fa-exchange-alt"></i></button></td></tr>`).join('');
}

function renderComptoirStock() {
    const container = document.getElementById('comptoirStockTable');
    const stats = document.getElementById('comptoirStats');
    if(!container) return;
    const search = document.getElementById('comptoirSearch')?.value.toLowerCase() || '';
    const filtered = items.filter(i => i.name.toLowerCase().includes(search) && !i.hidden);
    const totalValue = filtered.reduce((s, i) => s + ((i.comptoirStock || 0) * i.price), 0);
    if(stats) stats.innerHTML = `<div class="stat-card"><i class="fas fa-box"></i><div class="stat-value">${filtered.reduce((s, i) => s + (i.comptoirStock || 0), 0)}</div><div class="stat-label">Articles</div></div><div class="stat-card"><i class="fas fa-money-bill"></i><div class="stat-value">${formatFC(totalValue)}</div><div class="stat-label">Valeur</div></div>`;
    container.innerHTML = filtered.map(i => `<td><td style="text-align:left;">${i.name}</td><td style="text-align:left;">${i.barcode || '-'}</td><td style="text-align:center;">${i.comptoirStock || 0}</td><td style="text-align:right;">${formatFC((i.comptoirStock || 0) * i.price)}</td><td style="text-align:center;"><button class="btn btn-warning btn-sm" onclick="quickReturn(${i.id})"><i class="fas fa-undo-alt"></i></button></td></tr>`).join('');
}

function renderMovements() {
    const container = document.getElementById('movementsTable');
    if(!container) return;
    const startDate = document.getElementById('movementDate')?.value;
    const endDate = document.getElementById('movementDateEnd')?.value;
    const type = document.getElementById('movementTypeFilter')?.value || 'all';
    let filtered = [...stockMovements].reverse();
    if(startDate) filtered = filtered.filter(m => m.date.split('T')[0] >= startDate);
    if(endDate) filtered = filtered.filter(m => m.date.split('T')[0] <= endDate);
    if(type !== 'all') filtered = filtered.filter(m => m.type === type);
    container.innerHTML = filtered.map(m => `<tr><td style="text-align:left;">${formatDate(m.date)}</td><td style="text-align:center;">${m.type}</td><td style="text-align:left;">${m.itemName}</td><td style="text-align:center;">${m.qty}</td><td style="text-align:center;">${m.from || '-'}</td><td style="text-align:center;">${m.to || '-'}</td><td style="text-align:right;">${formatFC(m.value || 0)}</td><td style="text-align:left;">${m.reason || '-'}</td></tr>`).join('');
}

function renderLosses(startDate = '', endDate = '') {
    const container = document.getElementById('lossesTable');
    if(!container) return;
    let all = [...losses.map(l => ({ ...l, type: 'Perte' })), ...expenses.map(e => ({ ...e, type: 'Dépense', value: e.amount }))].sort((a, b) => new Date(b.date) - new Date(a.date));
    if(startDate) all = all.filter(l => l.date.split('T')[0] >= startDate);
    if(endDate) all = all.filter(l => l.date.split('T')[0] <= endDate);
    container.innerHTML = all.map(i => `<tr><td style="text-align:left;">${formatDate(i.date)}</td><td style="text-align:center;">${i.type}</td><td style="text-align:left;">${i.itemName || i.description}</td><td style="text-align:right;">${formatFC(i.value || 0)}</td><td style="text-align:left;">${i.reason || '-'}</td></tr>`).join('');
}

function renderTracking() {
    const container = document.getElementById('trackingComptoirTable');
    if(!container) return;
    const date = document.getElementById('trackingDate')?.value || new Date().toISOString().split('T')[0];
    const transfers = stockMovements.filter(m => m.date.startsWith(date) && m.type === 'transfer');
    const sales = stockMovements.filter(m => m.date.startsWith(date) && m.type === 'sale');
    const offers = stockMovements.filter(m => m.date.startsWith(date) && m.type === 'offer');
    const yesterday = new Date(new Date(date).getTime() - 86400000).toISOString().split('T')[0];
    
    container.innerHTML = items.filter(i => !i.hidden).map(item => {
        const prev = trackingData.comptoir[yesterday]?.[item.id]?.resteHier || (item.comptoirStock || 0);
        const transferQty = transfers.filter(tr => tr.itemId === item.id).reduce((s, tr) => s + tr.qty, 0);
        const total = prev + transferQty;
        let comptage = trackingData.comptoir[date]?.[item.id]?.comptageManuel;
        if(comptage === undefined) comptage = total;
        const soldQty = sales.filter(sa => sa.itemId === item.id).reduce((s, sa) => s + sa.qty, 0);
        const offerQty = offers.filter(o => o.itemId === item.id).reduce((s, o) => s + o.qty, 0);
        const pertes = Math.max(0, total - comptage - soldQty - offerQty);
        const surplus = Math.max(0, comptage + soldQty + offerQty - total);
        const reste = comptage - soldQty - offerQty;
        
        if(reste >= 0) item.comptoirStock = reste;
        else item.comptoirStock = 0;
        
        trackingData.comptoir[date] = trackingData.comptoir[date] || {};
        trackingData.comptoir[date][item.id] = { resteHier: prev, transfert: transferQty, comptageManuel: comptage, sold: soldQty, offers: offerQty, losses: pertes, surplus: surplus, reste: reste };
        
        return `<tr>
            <td style="text-align:left; font-size:0.8rem;">${item.name}${item.hidden ? ' [Masqué]' : ''}</td>
            <td style="text-align:center;">${prev}</td>
            <td style="text-align:center;">${transferQty}</td>
            <td style="text-align:center;">${total}</td>
            <td style="text-align:center;"><input type="number" class="editable-input" value="${comptage}" onchange="updateTrackingComptage('${date}',${item.id},this.value)" style="width:70px;"></td>
            <td style="text-align:center;">${soldQty}</td>
            <td style="text-align:center;">${offerQty}</td>
            <td style="text-align:center;" class="${pertes > 0 ? 'stock-critical' : ''}">${pertes}</td>
            <td style="text-align:center;" class="${surplus > 0 ? 'stock-ok' : ''}">${surplus}</td>
            <td style="text-align:center;">${reste}</td>
        </tr>`;
    }).join('');
    if(typeof saveData === 'function') saveData();
}

function updateTrackingComptage(date, id, value) {
    if(!trackingData.comptoir[date]) trackingData.comptoir[date] = {};
    if(!trackingData.comptoir[date][id]) trackingData.comptoir[date][id] = {};
    trackingData.comptoir[date][id].comptageManuel = parseInt(value) || 0;
    renderTracking();
    if(typeof saveData === 'function') saveData();
}

function renderAlerts() {
    const container = document.getElementById('alertsList');
    if(!container) return;
    const alertItems = items.filter(i => getRemainingStock(i) <= (i.type === 'local' ? settings.localThreshold : settings.importeThreshold) && !i.hidden);
    if(alertItems.length === 0) { container.innerHTML = '<div class="empty-state">✅ Aucune alerte</div>'; return; }
    container.innerHTML = alertItems.map(i => `<div class="alert-card ${getRemainingStock(i) <= 0 ? 'critical' : ''}">
        <img src="${i.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'45\' height=\'45\'%3E%3Crect width=\'45\' height=\'45\' fill=\'%232a3344\'/%3E%3C/svg%3E'}" class="alert-photo">
        <div class="alert-info"><div class="alert-title">${i.name}</div><div class="alert-detail">Dépôt: ${i.depotStock || 0} | Comptoir: ${i.comptoirStock || 0} | Total: ${getRemainingStock(i)}</div></div>
    </div>`).join('');
}

function updateAlertBadge() {
    const count = items.filter(i => getRemainingStock(i) <= (i.type === 'local' ? settings.localThreshold : settings.importeThreshold) && !i.hidden).length;
    const badge = document.getElementById('alertBadge');
    if(badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline' : 'none'; }
}

function openAddItemModal() { document.getElementById('addItemModal')?.classList.add('active'); }
function openEditItemModal(id) { const item = items.find(i => i.id === id); if(!item) return; document.getElementById('editItemId').value = id; document.getElementById('editName').value = item.name; document.getElementById('editPrice').value = item.price; document.getElementById('editPurchasePrice').value = item.purchasePrice || 0; document.getElementById('editType').value = item.type; document.getElementById('editDepotStock').value = item.depotStock || 0; document.getElementById('editComptoirStock').value = item.comptoirStock || 0; document.getElementById('editExpiryDate').value = item.expiryDate || ''; document.getElementById('editBarcode').value = item.barcode || ''; document.getElementById('editItemModal')?.classList.add('active'); }

async function addNewItem() {
    const name = document.getElementById('addName')?.value.trim();
    if(!name) { if(typeof showToast === 'function') showToast('Nom requis'); return; }
    const photoFile = document.getElementById('addPhoto')?.files[0];
    let photoData = null;
    if(photoFile) photoData = await compressPhoto(photoFile);
    const newItem = { id: Date.now(), name: name, price: parseInt(document.getElementById('addPrice')?.value) || 0, purchasePrice: parseInt(document.getElementById('addPurchasePrice')?.value) || 0, type: document.getElementById('addType')?.value || 'local', depotStock: parseInt(document.getElementById('addDepotStock')?.value) || 0, comptoirStock: parseInt(document.getElementById('addComptoirStock')?.value) || 0, expiryDate: document.getElementById('addExpiryDate')?.value || '', sold: 0, photo: photoData, barcode: document.getElementById('addBarcode')?.value || '', hidden: false };
    items.push(newItem);
    sortItems();
    if(typeof saveData === 'function') saveData();
    if(typeof closeModal === 'function') closeModal('addItemModal');
    if(typeof renderAll === 'function') renderAll();
    if(typeof showToast === 'function') showToast(`${name} ajouté`);
    if(typeof playSound === 'function') playSound('add_cart');
}

async function saveEditItem() {
    const id = parseInt(document.getElementById('editItemId')?.value);
    const item = items.find(i => i.id === id);
    if(!item) return;
    item.name = document.getElementById('editName')?.value || item.name;
    item.price = parseInt(document.getElementById('editPrice')?.value) || 0;
    item.purchasePrice = parseInt(document.getElementById('editPurchasePrice')?.value) || 0;
    item.type = document.getElementById('editType')?.value || item.type;
    item.depotStock = parseInt(document.getElementById('editDepotStock')?.value) || 0;
    item.comptoirStock = parseInt(document.getElementById('editComptoirStock')?.value) || 0;
    item.expiryDate = document.getElementById('editExpiryDate')?.value || '';
    item.barcode = document.getElementById('editBarcode')?.value || '';
    const photo = document.getElementById('editPhoto')?.files[0];
    if(photo) item.photo = await compressPhoto(photo);
    sortItems();
    if(typeof saveData === 'function') saveData();
    if(typeof closeModal === 'function') closeModal('editItemModal');
    if(typeof renderAll === 'function') renderAll();
    if(typeof showToast === 'function') showToast('Article modifié');
    if(typeof playSound === 'function') playSound('success');
}

function deleteItem(id) { 
    const item = items.find(i => i.id === id); 
    if(!item) return; 
    if(confirm(`Supprimer définitivement "${item.name}" ?`)) { 
        items = items.filter(i => i.id !== id); 
        stockMovements = stockMovements.filter(m => m.itemId !== id); 
        if(window.carts) window.carts.forEach(c => { for(let i = c.length - 1; i >= 0; i--) if(c[i].id === id) c.splice(i, 1); }); 
        if(typeof saveData === 'function') saveData(); 
        if(typeof renderAll === 'function') renderAll(); 
        if(typeof showToast === 'function') showToast(`${item.name} supprimé`); 
        if(typeof playSound === 'function') playSound('remove_cart');
    } 
}
function toggleHideItem(id) { const item = items.find(i => i.id === id); if(item) { item.hidden = !item.hidden; if(typeof saveData === 'function') saveData(); if(typeof renderAll === 'function') renderAll(); if(typeof showToast === 'function') showToast(item.hidden ? `${item.name} masqué` : `${item.name} visible`); } }
function showArticleDetails(id) { const item = items.find(i => i.id === id); if(item) alert(`${item.name}\nCode: ${item.barcode || '-'}\nType: ${item.type}\nPrix: ${formatFC(item.price)}\nDépôt: ${item.depotStock || 0}\nComptoir: ${item.comptoirStock || 0}`); }
function quickTransfer(id) { const qty = prompt('Quantité à transférer:'); if(qty && parseInt(qty) > 0) { const item = items.find(i => i.id === id); if(parseInt(qty) <= (item.depotStock || 0)) { const transferDate = prompt('Date du transfert (AAAA-MM-JJ):', new Date().toISOString().split('T')[0]); if(!transferDate) return; item.depotStock -= parseInt(qty); item.comptoirStock = (item.comptoirStock || 0) + parseInt(qty); stockMovements.push({ date: transferDate + 'T12:00:00', type: 'transfer', itemId: id, itemName: item.name, qty: parseInt(qty), value: parseInt(qty) * item.price, from: 'Dépôt', to: 'Comptoir' }); if(typeof saveData === 'function') saveData(); if(typeof renderAll === 'function') renderAll(); if(typeof showToast === 'function') showToast(`${qty} transféré(s)`); 
    if(typeof playSound === 'function') playSound('transfer');
} else if(typeof showToast === 'function') showToast('Stock insuffisant'); } }
function quickReturn(id) { const qty = prompt('Quantité à retourner:'); if(qty && parseInt(qty) > 0) { const item = items.find(i => i.id === id); if(parseInt(qty) <= (item.comptoirStock || 0)) { const returnDate = prompt('Date du retour (AAAA-MM-JJ):', new Date().toISOString().split('T')[0]); if(!returnDate) return; item.comptoirStock -= parseInt(qty); item.depotStock = (item.depotStock || 0) + parseInt(qty); stockMovements.push({ date: returnDate + 'T12:00:00', type: 'return', itemId: id, itemName: item.name, qty: parseInt(qty), value: parseInt(qty) * item.price, from: 'Comptoir', to: 'Dépôt' }); if(typeof saveData === 'function') saveData(); if(typeof renderAll === 'function') renderAll(); if(typeof showToast === 'function') showToast(`${qty} retourné(s)`); 
    if(typeof playSound === 'function') playSound('transfer');
} } }

function openBulkTransferModal() {
    const itemsHtml = items.filter(i => (i.depotStock || 0) > 0 && !i.hidden).map(i => `
        <div class="bulk-item-row">
            <span>${escapeHtml(i.name)} (${i.depotStock})</span>
            <input type="number" id="bulkQty_${i.id}" min="0" max="${i.depotStock}" value="0">
            <span>max ${i.depotStock}</span>
        </div>
    `).join('');
    
    const modalHtml = `
        <div class="modal-overlay" id="bulkTransferModal">
            <div class="modal large">
                <h3><i class="fas fa-exchange-alt" style="color:var(--gold);"></i> Transfert en masse</h3>
                <p style="color:var(--text-muted); margin-bottom:1rem; font-size:0.8rem;">
                    <i class="fas fa-info-circle"></i> Sélectionnez les quantités à transférer du dépôt vers le comptoir
                </p>
                <div class="bulk-transfer-content">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Date du transfert</label>
                        <input type="date" id="bulkTransferDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div id="bulkTransferItems" style="max-height:350px; overflow-y:auto;">
                        ${itemsHtml || '<div class="empty-state">Aucun article en stock</div>'}
                    </div>
                </div>
                <div class="bulk-transfer-actions">
                    <button class="btn btn-outline" onclick="if(typeof closeModal === 'function') closeModal('bulkTransferModal')"><i class="fas fa-times"></i> Annuler</button>
                    <button class="btn btn-primary" onclick="executeBulkTransfer()"><i class="fas fa-exchange-alt"></i> Transférer</button>
                    <button class="btn btn-info" onclick="exportBulkTransferPDF()"><i class="fas fa-file-pdf"></i> Exporter PDF</button>
                </div>
            </div>
        </div>
    `;
    
    if(!document.getElementById('bulkTransferModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    document.getElementById('bulkTransferModal')?.classList.add('active');
}

function openBulkReturnModal() {
    const itemsHtml = items.filter(i => (i.comptoirStock || 0) > 0).map(i => `
        <div class="bulk-item-row">
            <span>${escapeHtml(i.name)} (${i.comptoirStock})</span>
            <input type="number" id="returnQty_${i.id}" min="0" max="${i.comptoirStock}" value="0">
            <span>max ${i.comptoirStock}</span>
        </div>
    `).join('');
    
    const modalHtml = `
        <div class="modal-overlay" id="bulkReturnModal">
            <div class="modal large">
                <h3><i class="fas fa-undo-alt" style="color:var(--gold);"></i> Retour en masse</h3>
                <p style="color:var(--text-muted); margin-bottom:1rem; font-size:0.8rem;">
                    <i class="fas fa-info-circle"></i> Sélectionnez les quantités à retourner du comptoir vers le dépôt
                </p>
                <div class="bulk-transfer-content">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Date du retour</label>
                        <input type="date" id="bulkReturnDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div id="bulkReturnItems" style="max-height:350px; overflow-y:auto;">
                        ${itemsHtml || '<div class="empty-state">Aucun article au comptoir</div>'}
                    </div>
                </div>
                <div class="bulk-transfer-actions">
                    <button class="btn btn-outline" onclick="if(typeof closeModal === 'function') closeModal('bulkReturnModal')"><i class="fas fa-times"></i> Annuler</button>
                    <button class="btn btn-warning" onclick="executeBulkReturn()"><i class="fas fa-undo-alt"></i> Retourner</button>
                    <button class="btn btn-info" onclick="exportBulkReturnPDF()"><i class="fas fa-file-pdf"></i> Exporter PDF</button>
                </div>
            </div>
        </div>
    `;
    
    if(!document.getElementById('bulkReturnModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    document.getElementById('bulkReturnModal')?.classList.add('active');
}

function executeBulkTransfer() { 
    let count = 0; 
    const transferDate = document.getElementById('bulkTransferDate')?.value; 
    if(!transferDate) { if(typeof showToast === 'function') showToast('Sélectionnez une date'); return; } 
    items.forEach(i => { 
        const qty = parseInt(document.getElementById(`bulkQty_${i.id}`)?.value) || 0; 
        if(qty > 0 && qty <= (i.depotStock || 0)) { 
            i.depotStock -= qty; 
            i.comptoirStock = (i.comptoirStock || 0) + qty; 
            stockMovements.push({ date: transferDate + 'T12:00:00', type: 'transfer', itemId: i.id, itemName: i.name, qty: qty, value: qty * i.price, from: 'Dépôt', to: 'Comptoir' }); 
            count++; 
        } 
    }); 
    if(typeof saveData === 'function') saveData(); 
    if(typeof renderAll === 'function') renderAll(); 
    if(typeof closeModal === 'function') closeModal('bulkTransferModal'); 
    if(typeof showToast === 'function') showToast(`${count} article(s) transféré(s)`); 
    if(typeof playSound === 'function') playSound('transfer');
}

function executeBulkReturn() { 
    let count = 0; 
    const returnDate = document.getElementById('bulkReturnDate')?.value; 
    if(!returnDate) { if(typeof showToast === 'function') showToast('Sélectionnez une date'); return; } 
    items.forEach(i => { 
        const qty = parseInt(document.getElementById(`returnQty_${i.id}`)?.value) || 0; 
        if(qty > 0 && qty <= (i.comptoirStock || 0)) { 
            i.comptoirStock -= qty; 
            i.depotStock = (i.depotStock || 0) + qty; 
            stockMovements.push({ date: returnDate + 'T12:00:00', type: 'return', itemId: i.id, itemName: i.name, qty: qty, value: qty * i.price, from: 'Comptoir', to: 'Dépôt' }); 
            count++; 
        } 
    }); 
    if(typeof saveData === 'function') saveData(); 
    if(typeof renderAll === 'function') renderAll(); 
    if(typeof closeModal === 'function') closeModal('bulkReturnModal'); 
    if(typeof showToast === 'function') showToast(`${count} article(s) retourné(s)`); 
    if(typeof playSound === 'function') playSound('transfer');
}

function reportLoss() { 
    const location = document.getElementById('lossLocation')?.value; 
    const itemId = parseInt(document.getElementById('lossItem')?.value); 
    const qty = parseInt(document.getElementById('lossQty')?.value); 
    const reason = document.getElementById('lossReason')?.value || 'Non spécifié'; 
    let lossDate = document.getElementById('lossDate')?.value || new Date().toISOString().split('T')[0]; 
    const item = items.find(i => i.id === itemId); 
    if(!item || qty <= 0) return; 
    const field = location === 'depot' ? 'depotStock' : 'comptoirStock'; 
    if(qty > (item[field] || 0)) { if(typeof showToast === 'function') showToast('Stock insuffisant'); return; } 
    item[field] -= qty; 
    losses.push({ date: lossDate + 'T12:00:00', location: location, itemName: item.name, qty: qty, value: qty * item.price, reason: reason }); 
    stockMovements.push({ date: lossDate + 'T12:00:00', type: 'loss', itemId: itemId, itemName: item.name, qty: qty, value: qty * item.price, from: location === 'depot' ? 'Dépôt' : 'Comptoir', to: 'Perte', reason: reason }); 
    if(typeof saveData === 'function') saveData(); 
    if(typeof renderAll === 'function') renderAll(); 
    if(typeof showToast === 'function') showToast('Perte signalée'); 
    if(typeof playSound === 'function') playSound('warning');
}
function addExpense() { 
    const description = document.getElementById('expenseDesc')?.value; 
    const amount = parseInt(document.getElementById('expenseAmount')?.value); 
    let expenseDate = document.getElementById('expenseDate')?.value || new Date().toISOString().split('T')[0]; 
    if(!description || amount <= 0) { if(typeof showToast === 'function') showToast('Description et montant requis'); return; } 
    expenses.push({ date: expenseDate + 'T12:00:00', description: description, amount: amount }); 
    if(typeof saveData === 'function') saveData(); 
    renderLosses(); 
    if(typeof showToast === 'function') showToast('Dépense ajoutée'); 
    if(typeof playSound === 'function') playSound('info');
}
function filterLossesAndExpenses() { const startDate = document.getElementById('lossesFilterStart')?.value; const endDate = document.getElementById('lossesFilterEnd')?.value; renderLosses(startDate, endDate); }
function addSupplier() { const name = document.getElementById('newSupplierName')?.value; const contact = document.getElementById('newSupplierContact')?.value; if(name) { suppliers.push({ id: Date.now(), name: name, contact: contact }); if(typeof saveData === 'function') saveData(); renderSuppliersList(); document.getElementById('newSupplierName').value = ''; document.getElementById('newSupplierContact').value = ''; if(typeof showToast === 'function') showToast('Fournisseur ajouté'); } }
function removeSupplier(id) { suppliers = suppliers.filter(s => s.id !== id); if(typeof saveData === 'function') saveData(); renderSuppliersList(); }
function renderSuppliersList() { const container = document.getElementById('suppliersList'); if(container) container.innerHTML = suppliers.map(s => `<div style="display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid var(--card-border);"><span>${s.name} - ${s.contact}</span><button class="btn btn-danger btn-sm" onclick="removeSupplier(${s.id})"><i class="fas fa-trash"></i></button></div>`).join(''); }
function generateBarcodeLabels() { 
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF(); 
    let y = 20; 
    items.filter(i => i.barcode).forEach((item) => { 
        doc.setFontSize(10); 
        doc.text(item.name, 10, y); 
        doc.setFontSize(8); 
        doc.text(item.barcode, 10, y + 5); 
        doc.text(formatFC(item.price), 10, y + 10); 
        y += 20; 
        if(y > 270) { doc.addPage(); y = 20; } 
    }); 
    doc.save('etiquettes.pdf'); 
    if(typeof showToast === 'function') showToast('Étiquettes générées'); 
    if(typeof playSound === 'function') playSound('success');
}

function openPurchaseModal() {
    const modalHtml = `
        <div class="modal-overlay" id="purchaseModal">
            <div class="modal large">
                <h3><i class="fas fa-shopping-cart" style="color:var(--gold);"></i> Achat de boissons</h3>
                <div class="purchase-modal-content">
                    <div class="form-group">
                        <label><i class="fas fa-truck"></i> Fournisseur</label>
                        <select id="purchaseSupplier" class="form-control">
                            <option value="">-- Sélectionner un fournisseur --</option>
                            ${suppliers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-file-invoice"></i> N° Facture</label>
                        <input type="text" id="purchaseInvoice" placeholder="Facultatif">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Date</label>
                        <input type="date" id="purchaseDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div id="purchaseItems" style="max-height:350px; overflow-y:auto;">
                        ${items.filter(i => !i.hidden).map(item => `
                            <div class="purchase-item-row">
                                <span>${escapeHtml(item.name)}</span>
                                <span>${formatFC(item.purchasePrice || 0)}</span>
                                <input type="number" id="purchaseQty_${item.id}" min="0" value="0" oninput="updatePurchaseTotal()">
                                <span id="purchaseSubtotal_${item.id}">0 FC</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="purchase-total">
                        <span>Total à payer :</span>
                        <span id="purchaseTotal">0 FC</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="if(typeof closeModal === 'function') closeModal('purchaseModal')"><i class="fas fa-times"></i> Annuler</button>
                    <button class="btn btn-success" onclick="processPurchase()"><i class="fas fa-check"></i> Enregistrer l'achat</button>
                </div>
            </div>
        </div>
    `;
    
    if(!document.getElementById('purchaseModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    document.getElementById('purchaseModal')?.classList.add('active');
}

function updatePurchaseTotal() { 
    let total = 0; 
    items.forEach(item => { 
        const qty = parseInt(document.getElementById(`purchaseQty_${item.id}`)?.value) || 0; 
        const subtotal = qty * (item.purchasePrice || 0); 
        total += subtotal; 
        const span = document.getElementById(`purchaseSubtotal_${item.id}`); 
        if(span) span.textContent = formatFC(subtotal); 
    }); 
    const purchaseTotal = document.getElementById('purchaseTotal'); 
    if(purchaseTotal) purchaseTotal.textContent = formatFC(total); 
}
function processPurchase() { 
    const supplierId = document.getElementById('purchaseSupplier')?.value; 
    if(!supplierId) { if(typeof showToast === 'function') showToast('Sélectionnez un fournisseur'); return; } 
    const supplier = suppliers.find(s => s.id == supplierId); 
    const invoice = document.getElementById('purchaseInvoice')?.value || ''; 
    const purchaseDate = document.getElementById('purchaseDate')?.value; 
    if(!purchaseDate) { if(typeof showToast === 'function') showToast('Sélectionnez une date'); return; } 
    let total = 0; 
    const purchasedItems = []; 
    items.forEach(item => { 
        const qty = parseInt(document.getElementById(`purchaseQty_${item.id}`)?.value) || 0; 
        if(qty > 0) { 
            item.depotStock = (item.depotStock || 0) + qty; 
            const subtotal = qty * (item.purchasePrice || 0); 
            total += subtotal; 
            purchasedItems.push({ name: item.name, qty, price: item.purchasePrice || 0, subtotal }); 
            stockMovements.push({ date: purchaseDate + 'T12:00:00', type: 'purchase', itemId: item.id, itemName: item.name, qty: qty, value: subtotal, from: supplier.name, to: 'Dépôt', invoice: invoice }); 
            if(item.purchasePrice) { 
                priceHistory.push({ itemId: item.id, itemName: item.name, oldPrice: item.price, newPrice: item.price, purchasePrice: item.purchasePrice, date: purchaseDate + 'T12:00:00', type: 'purchase' }); 
            } 
        } 
    }); 
    if(purchasedItems.length === 0) { if(typeof showToast === 'function') showToast('Aucun article sélectionné'); return; } 
    purchases.push({ date: purchaseDate + 'T12:00:00', supplier: supplier.name, items: purchasedItems, total: total, invoice: invoice }); 
    if(typeof saveData === 'function') saveData(); 
    if(typeof closeModal === 'function') closeModal('purchaseModal'); 
    if(typeof renderAll === 'function') renderAll(); 
    if(typeof showToast === 'function') showToast(`Achat de ${formatFC(total)} effectué`); 
    if(typeof playSound === 'function') playSound('success');
}

let html5QrCode = null, qrScanMode = null, isScannerRunning = false, currentCameraFacing = "environment";
function openQRScanner(mode) { 
    qrScanMode = mode; 
    const scannerModal = document.getElementById('qrScannerModal'); 
    if(scannerModal) scannerModal.classList.add('active'); 
    currentCameraFacing = "environment"; 
    if(html5QrCode) { 
        if(isScannerRunning) html5QrCode.stop().catch(() => {}); 
        html5QrCode = null; 
        isScannerRunning = false; 
    } 
    startQRScanner(); 
    if(typeof playSound === 'function') playSound('scan');
}
function startQRScanner() { const qrReader = document.getElementById('qr-reader'); if(!qrReader) return; qrReader.innerHTML = ''; if(html5QrCode && isScannerRunning) html5QrCode.stop().catch(() => {}); html5QrCode = null; isScannerRunning = false; try { html5QrCode = new Html5Qrcode("qr-reader"); const config = { fps: 10, qrbox: { width: 250, height: 250 } }; html5QrCode.start({ facingMode: currentCameraFacing }, config, (decodedText) => { if(qrScanMode === 'add') document.getElementById('addBarcode').value = decodedText; else if(qrScanMode === 'edit') document.getElementById('editBarcode').value = decodedText; else if(qrScanMode === 'sale') { const item = items.find(i => i.barcode === decodedText); if(item && window.addToCart) window.addToCart(item.id); else if(typeof showToast === 'function') showToast('Article non trouvé', 'error'); } closeQRScanner(); }, (error) => {}).then(() => { isScannerRunning = true; }).catch(err => { console.log('Erreur démarrage scanner:', err); }); } catch(e) { console.log('Erreur init scanner:', e); } }
function closeQRScanner() { if(html5QrCode && isScannerRunning) { html5QrCode.stop().then(() => { html5QrCode = null; isScannerRunning = false; }).catch(() => { html5QrCode = null; isScannerRunning = false; }); } const scannerModal = document.getElementById('qrScannerModal'); if(scannerModal) scannerModal.classList.remove('active'); }
function switchCamera() { currentCameraFacing = currentCameraFacing === "environment" ? "user" : "environment"; if(html5QrCode && isScannerRunning) { closeQRScanner(); setTimeout(() => startQRScanner(), 300); } else startQRScanner(); }
function generateRandomBarcode(target) { const barcodeInput = document.getElementById(target === 'add' ? 'addBarcode' : 'editBarcode'); if(barcodeInput) { const generated = Math.random().toString(36).substring(2, 15).toUpperCase(); barcodeInput.value = generated; if(typeof showToast === 'function') showToast('Code généré: ' + generated); 
    if(typeof playSound === 'function') playSound('scan');
} }
function exportBulkTransferPDF() { const { jsPDF } = window.jspdf; const doc = new jsPDF(); if(companyInfo.logo && companyInfo.logo.startsWith('data:image')) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15); doc.setFontSize(14); doc.text(companyInfo.name, 30, 12); doc.setFontSize(8); doc.text(`Bon de transfert - ${getCurrentDateFormatted()}`, 30, 17); const transferDate = document.getElementById('bulkTransferDate')?.value || new Date().toISOString().split('T')[0]; const transfers = []; items.forEach(item => { const qty = parseInt(document.getElementById(`bulkQty_${item.id}`)?.value) || 0; if(qty > 0) transfers.push([item.name, qty, formatFC(item.price), formatFC(qty * item.price)]); }); doc.text(`Date: ${transferDate}`, 10, 25); doc.autoTable({ startY: 32, head: [['Article', 'Quantité', 'Prix unitaire', 'Total']], body: transfers.length ? transfers : [['Aucun article', '0', '0 FC', '0 FC']] }); doc.save('bon_transfert.pdf'); if(typeof showToast === 'function') showToast('PDF exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportBulkReturnPDF() { const { jsPDF } = window.jspdf; const doc = new jsPDF(); if(companyInfo.logo && companyInfo.logo.startsWith('data:image')) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15); doc.setFontSize(14); doc.text(companyInfo.name, 30, 12); doc.setFontSize(8); doc.text(`Bon de retour - ${getCurrentDateFormatted()}`, 30, 17); const returnDate = document.getElementById('bulkReturnDate')?.value || new Date().toISOString().split('T')[0]; const returns = []; items.forEach(item => { const qty = parseInt(document.getElementById(`returnQty_${item.id}`)?.value) || 0; if(qty > 0) returns.push([item.name, qty, formatFC(item.price), formatFC(qty * item.price)]); }); doc.text(`Date: ${returnDate}`, 10, 25); doc.autoTable({ startY: 32, head: [['Article', 'Quantité', 'Prix unitaire', 'Total']], body: returns.length ? returns : [['Aucun article', '0', '0 FC', '0 FC']] }); doc.save('bon_retour.pdf'); if(typeof showToast === 'function') showToast('PDF exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportMovementsPDF() { const startDate = document.getElementById('movementDate')?.value; const endDate = document.getElementById('movementDateEnd')?.value; const type = document.getElementById('movementTypeFilter')?.value || 'all'; let filtered = [...stockMovements].reverse(); if(startDate) filtered = filtered.filter(m => m.date.split('T')[0] >= startDate); if(endDate) filtered = filtered.filter(m => m.date.split('T')[0] <= endDate); if(type !== 'all') filtered = filtered.filter(m => m.type === type); const doc = generateProfessionalPDF('Mouvements de stock', ['Date', 'Type', 'Article', 'Qté', 'De', 'Vers', 'Valeur'], filtered.slice(0, 100).map(m => [formatDate(m.date), m.type, m.itemName, m.qty, m.from || '-', m.to || '-', formatFC(m.value || 0)])); doc.save('mouvements_stock.pdf'); if(typeof showToast === 'function') showToast('PDF exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportMovementsExcel() { const startDate = document.getElementById('movementDate')?.value; const endDate = document.getElementById('movementDateEnd')?.value; const type = document.getElementById('movementTypeFilter')?.value || 'all'; let filtered = [...stockMovements]; if(startDate) filtered = filtered.filter(m => m.date.split('T')[0] >= startDate); if(endDate) filtered = filtered.filter(m => m.date.split('T')[0] <= endDate); if(type !== 'all') filtered = filtered.filter(m => m.type === type); const wsData = [['Date', 'Type', 'Article', 'Qté', 'De', 'Vers', 'Valeur']]; filtered.forEach(m => wsData.push([formatDate(m.date), m.type, m.itemName, m.qty, m.from || '-', m.to || '-', formatFC(m.value || 0)])); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), 'Mouvements'); XLSX.writeFile(wb, 'mouvements_stock.xlsx'); if(typeof showToast === 'function') showToast('Excel exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportLossesPDF() { const startDate = document.getElementById('lossesFilterStart')?.value; const endDate = document.getElementById('lossesFilterEnd')?.value; let all = [...losses.map(l => ({ ...l, type: 'Perte' })), ...expenses.map(e => ({ ...e, type: 'Dépense', value: e.amount }))]; if(startDate) all = all.filter(l => l.date.split('T')[0] >= startDate); if(endDate) all = all.filter(l => l.date.split('T')[0] <= endDate); all.sort((a, b) => new Date(b.date) - new Date(a.date)); const doc = generateProfessionalPDF('Pertes et dépenses', ['Date', 'Type', 'Description', 'Valeur'], all.map(l => [formatDate(l.date), l.type, l.itemName || l.description, formatFC(l.value || 0)])); doc.save('pertes_depenses.pdf'); if(typeof showToast === 'function') showToast('PDF exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportTrackingPDF() { const date = document.getElementById('trackingDate')?.value || new Date().toISOString().split('T')[0]; const wsData = items.filter(i => !i.hidden).map(item => { const dt = trackingData.comptoir[date]?.[item.id] || {}; return [item.name, dt.resteHier || 0, dt.transfert || 0, (dt.resteHier || 0) + (dt.transfert || 0), dt.comptageManuel || '', dt.sold || 0, dt.offers || 0, dt.losses || 0, dt.surplus || 0, dt.reste || 0]; }); const doc = generateProfessionalPDF(`Suivi Stock Comptoir - ${date}`, ['Article', 'Reste hier', 'Transfert', 'Total', 'Comptage', 'Vendus', 'Offerts', 'Pertes', 'Surplus', 'Reste'], wsData, 'landscape'); doc.save(`suivi_${date}.pdf`); if(typeof showToast === 'function') showToast('PDF exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function exportTrackingExcel() { const date = document.getElementById('trackingDate')?.value || new Date().toISOString().split('T')[0]; const wsData = [['Article', 'Reste hier', 'Transfert', 'Total', 'Comptage', 'Vendus', 'Offerts', 'Pertes', 'Surplus', 'Reste']]; items.filter(i => !i.hidden).forEach(item => { const dt = trackingData.comptoir[date]?.[item.id] || {}; wsData.push([item.name, dt.resteHier || 0, dt.transfert || 0, (dt.resteHier || 0) + (dt.transfert || 0), dt.comptageManuel || '', dt.sold || 0, dt.offers || 0, dt.losses || 0, dt.surplus || 0, dt.reste || 0]); }); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), 'Suivi'); XLSX.writeFile(wb, `suivi_${date}.xlsx`); if(typeof showToast === 'function') showToast('Excel exporté'); 
    if(typeof playSound === 'function') playSound('success');
}
function switchStockView(view) { document.querySelectorAll('.stock-view').forEach(v => v.style.display = 'none'); const targetView = document.getElementById(`stock-view-${view}`); if(targetView) targetView.style.display = 'block'; document.querySelectorAll('#tab-stock-state .btn-outline').forEach(btn => btn.classList.remove('active')); const activeBtn = document.querySelector(`#tab-stock-state .btn-outline[onclick*="${view}"]`); if(activeBtn) activeBtn.classList.add('active'); if(view === 'depot') renderDepotStock(); else if(view === 'comptoir') renderComptoirStock(); else if(view === 'movements') renderMovements(); else if(view === 'losses') renderLosses(); }
function toggleAutoSave() { settings.autoSave = document.getElementById('autoSave')?.checked; if(typeof saveData === 'function') saveData(); if(typeof showToast === 'function') showToast(settings.autoSave ? 'Sauvegarde auto activée' : 'Sauvegarde auto désactivée'); }
function updateCompanyFormFields() { const companyFields = ['companyName', 'companySlogan', 'companyAddress', 'companyPhone', 'companyEmail', 'companyWebsite', 'companyFb', 'companyIg', 'companyTt', 'companyRccm', 'companyTaxId', 'companyRegistre']; companyFields.forEach(fieldId => { const element = document.getElementById(fieldId); if(element) { const key = fieldId.replace('company', '').toLowerCase(); element.value = companyInfo[key] || ''; } }); const settingsFields = ['localThreshold', 'importeThreshold', 'vipSurcharge1', 'vipSurcharge2', 'vipSurcharge3', 'workHoursPerDay', 'workDaysPerMonth']; settingsFields.forEach(fieldId => { const element = document.getElementById(fieldId); if(element) element.value = settings[fieldId] || ''; }); const autoSaveCheckbox = document.getElementById('autoSave'); if(autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave !== false; }

function saveCompanyInfo() { 
    const oldLogo = companyInfo.logo;
    
    companyInfo = {
        name: document.getElementById('companyName')?.value || companyInfo.name,
        slogan: document.getElementById('companySlogan')?.value || companyInfo.slogan,
        address: document.getElementById('companyAddress')?.value || companyInfo.address,
        phone: document.getElementById('companyPhone')?.value || companyInfo.phone,
        email: document.getElementById('companyEmail')?.value || companyInfo.email,
        website: document.getElementById('companyWebsite')?.value || companyInfo.website,
        facebook: document.getElementById('companyFb')?.value || companyInfo.facebook,
        instagram: document.getElementById('companyIg')?.value || companyInfo.instagram,
        tiktok: document.getElementById('companyTt')?.value || companyInfo.tiktok,
        rccm: document.getElementById('companyRccm')?.value || companyInfo.rccm,
        taxId: document.getElementById('companyTaxId')?.value || companyInfo.taxId,
        registre: document.getElementById('companyRegistre')?.value || companyInfo.registre,
        logo: oldLogo
    };
    
    updateLogoDisplay();
    updateCompanyTexts();
    if(typeof saveData === 'function') saveData();
    if(typeof showToast === 'function') showToast('Informations enregistrées');
    
    if(supabaseClient && currentUser && currentUser !== 'admin-local') {
        setTimeout(() => {
            if(window.syncAllToSupabase) window.syncAllToSupabase();
        }, 500);
    }
    if(typeof playSound === 'function') playSound('success');
}
function updateLogoDisplay() { 
    const preview = document.getElementById('logoPreview'); 
    const headerLogo = document.getElementById('headerLogoImg'); 
    const landingLogo = document.getElementById('landingLogoImg');
    
    const defaultLogoSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23d4a017'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='%230a0e17'%3E🍺%3C/text%3E%3C/svg%3E";
    
    let logoToUse = defaultLogoSvg;
    if(companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
        logoToUse = companyInfo.logo;
    }
    
    if(preview) preview.innerHTML = `<img src="${logoToUse}" style="width:100%; height:100%; object-fit:cover;">`;
    if(headerLogo) headerLogo.src = logoToUse;
    if(landingLogo) landingLogo.src = logoToUse;
}

function updateCompanyTexts() { 
    const appName = document.getElementById('appCompanyName'); 
    const appSlogan = document.getElementById('appCompanySlogan'); 
    const landingName = document.getElementById('landingCompanyName'); 
    const footerName = document.getElementById('footerCompanyName'); 
    if(appName) appName.textContent = companyInfo.name; 
    if(appSlogan) appSlogan.textContent = companyInfo.slogan; 
    if(landingName) landingName.textContent = companyInfo.name; 
    if(footerName) footerName.textContent = companyInfo.name; 
}

function uploadLogo(event) { 
    const file = event.target.files[0]; 
    if(!file) return;
    
    if(!file.type.startsWith('image/')) {
        if(typeof showToast === 'function') showToast('Veuillez sélectionner une image', 'error');
        return;
    }
    
    if(file.size > 500 * 1024) {
        if(typeof showToast === 'function') showToast('L\'image est trop lourde (max 500KB)', 'error');
        return;
    }
    
    const reader = new FileReader(); 
    reader.onload = function(ev) { 
        companyInfo.logo = ev.target.result; 
        updateLogoDisplay(); 
        if(typeof saveData === 'function') saveData(); 
        if(typeof showToast === 'function') showToast('Logo mis à jour avec succès');
        
        if(supabaseClient && currentUser && currentUser !== 'admin-local') {
            setTimeout(() => {
                if(window.syncAllToSupabase) window.syncAllToSupabase();
            }, 500);
        }
        if(typeof playSound === 'function') playSound('success');
    }; 
    reader.onerror = function() {
        if(typeof showToast === 'function') showToast('Erreur lors du chargement de l\'image', 'error');
    };
    reader.readAsDataURL(file); 
}

function resetDefaultLogo() {
    if(confirm('Restaurer le logo par défaut ?')) {
        companyInfo.logo = null;
        updateLogoDisplay();
        if(typeof saveData === 'function') saveData();
        if(typeof showToast === 'function') showToast('Logo par défaut restauré');
        
        if(supabaseClient && currentUser && currentUser !== 'admin-local') {
            setTimeout(() => {
                if(window.syncAllToSupabase) window.syncAllToSupabase();
            }, 500);
        }
    }
}

function transferLocalToCloud() { 
    const statusEl = document.getElementById('transferStatus'); 
    if(!statusEl) return; 
    statusEl.textContent = '⏳ Transfert en cours...'; 
    statusEl.style.color = 'var(--warning)'; 
    const keys = ['mbe_web_v8', 'mbe_web_v7', 'mbe_web_v6', 'mbe_web_v5', 'mbe_web_v4', 'mbe_web_v3']; 
    let found = null; 
    for(const key of keys) { 
        const data = localStorage.getItem(key); 
        if(data) { 
            try { found = JSON.parse(data); statusEl.textContent = '✅ Données trouvées dans : ' + key; break; } catch(e) {} 
        } 
    } 
    if(!found) { 
        statusEl.textContent = '❌ Aucune donnée locale trouvée.'; 
        statusEl.style.color = 'var(--danger)'; 
        return; 
    } 
    if(found.items) items = found.items; 
    if(found.salesHistory && window.salesHistory) window.salesHistory = found.salesHistory; 
    if(found.servers && window.servers) window.servers = found.servers; 
    if(found.settings) Object.assign(settings, found.settings); 
    if(found.companyInfo) Object.assign(companyInfo, found.companyInfo); 
    if(found.debts && window.debts) window.debts = found.debts; 
    if(found.stockMovements) stockMovements = found.stockMovements; 
    if(found.attendanceRecords && window.attendanceRecords) window.attendanceRecords = found.attendanceRecords; 
    if(found.losses) losses = found.losses; 
    if(found.expenses) expenses = found.expenses; 
    if(supabaseClient && currentUser && currentUser !== 'admin-local') { 
        syncAllToSupabase().then(() => { 
            statusEl.textContent = '✅ Transfert réussi ! Vos données sont maintenant dans le cloud.'; 
            statusEl.style.color = 'var(--success)'; 
            sortItems(); 
            renderAll(); 
        }).catch(() => { 
            statusEl.textContent = '❌ Erreur de connexion au cloud.'; 
            statusEl.style.color = 'var(--danger)'; 
        }); 
    } else { 
        statusEl.textContent = '❌ Connectez-vous d\'abord avec un compte Supabase.'; 
        statusEl.style.color = 'var(--danger)'; 
    } 
}

function renderAll() { 
    if(window.renderDashboard) window.renderDashboard(); 
    if(window.renderSaleItems) window.renderSaleItems(); 
    renderInventory(); 
    renderDepotStock(); 
    renderComptoirStock(); 
    renderMovements(); 
    renderTracking(); 
    if(window.renderHistory) window.renderHistory(); 
    renderAlerts(); 
    if(window.renderServerStatsByDate) window.renderServerStatsByDate(); 
    updateAlertBadge(); 
    if(window.updateServerSelects) window.updateServerSelects(); 
    if(window.updateHistoryFilters) window.updateHistoryFilters(); 
    if(window.updateDebtFilters) window.updateDebtFilters(); 
    if(window.updateCartDateInput) window.updateCartDateInput(); 
    if(window.loadUsers) window.loadUsers(); 
    renderSuppliersList(); 
}

function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}