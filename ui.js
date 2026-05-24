// ============================================
// UI - Interface utilisateur, tabs, modals, animations
// ============================================

function initUI() {
    window.switchTab = switchTab;
    window.toggleMobileMenu = toggleMobileMenu;
    window.togglePricingPeriod = togglePricingPeriod;
    window.showLegalModal = showLegalModal;
    window.showVideoModal = showVideoModal;
    window.toggleFaq = toggleFaq;
    window.openUserProfile = openUserProfile;
    window.loadTabContent = loadTabContent;
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if(tabId) switchTab(tabId);
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if(e.target === this) this.classList.remove('active');
        });
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => observer.observe(el));
    
    window.addEventListener('beforeunload', function() { if(window.items && window.items.length > 0) saveData(); });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    if(activeTab) activeTab.classList.add('active');
    
    // Attendre que le DOM soit mis à jour avant d'appeler les rendus
    setTimeout(() => {
        if(tabId === 'dashboard' && window.renderDashboard) window.renderDashboard();
        if(tabId === 'sales') {
            if(window.renderSaleItems) window.renderSaleItems();
            if(window.updateCart) window.updateCart();
        }
        if(tabId === 'inventory' && window.renderInventory) window.renderInventory();
        if(tabId === 'stock-state') {
            if(window.renderDepotStock) window.renderDepotStock();
            if(window.renderComptoirStock) window.renderComptoirStock();
            if(window.renderMovements) window.renderMovements();
            if(window.renderLosses) window.renderLosses();
        }
        if(tabId === 'tracking' && window.renderTracking) window.renderTracking();
        if(tabId === 'history' && window.renderHistory) window.renderHistory();
        if(tabId === 'servers' && window.renderServerStatsByDate) window.renderServerStatsByDate();
        if(tabId === 'alerts' && window.renderAlerts) window.renderAlerts();
        if(tabId === 'kitchen' && window.renderKitchenOrders) window.renderKitchenOrders();
        if(tabId === 'taskboard') {
            if(typeof renderTaskBoard === 'function') renderTaskBoard();
            if(typeof renderShiftBoard === 'function') renderShiftBoard();
        }
        if(tabId === 'analytics' && typeof renderAnalyticsDashboard === 'function') renderAnalyticsDashboard();
        if(tabId === 'admin' && window.loadUsers) window.loadUsers();
        if(tabId === 'settings' && window.updateCompanyFormFields) window.updateCompanyFormFields();
    }, 50);
}
    
function toggleMobileMenu() {
    const nav = document.getElementById('landingNav');
    if(nav) nav.classList.toggle('show');
}

let currentPeriod = 'monthly';
function togglePricingPeriod(period) {
    currentPeriod = period;
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.period-btn[onclick="togglePricingPeriod('${period}')"]`)?.classList.add('active');
    
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const yearlyPrices = document.querySelectorAll('.price.yearly');
    
    if(period === 'monthly') {
        monthlyPrices.forEach(p => p.style.display = 'block');
        yearlyPrices.forEach(p => p.style.display = 'none');
    } else {
        monthlyPrices.forEach(p => p.style.display = 'none');
        yearlyPrices.forEach(p => p.style.display = 'block');
    }
}

function showLegalModal() {
    const modal = document.getElementById('legalModal');
    if(modal) modal.classList.add('active');
}

function showVideoModal() {
    const modal = document.getElementById('videoModal');
    if(modal) modal.classList.add('active');
}

function toggleFaq(element) {
    const faqItem = element.closest('.faq-item');
    if(faqItem) faqItem.classList.toggle('open');
}

function openUserProfile() {
    showToast(`👤 ${userProfile?.fullName || currentUser}\n📧 ${userProfile?.email || 'local'}\n👑 Rôle: ${userProfile?.role || 'Admin'}`);
}

function loadTabContent() {
    const mainContent = document.getElementById('mainContent');
    if(!mainContent) return;
    
    mainContent.innerHTML = `
        <!-- DASHBOARD -->
        <div class="tab-content active" id="tab-dashboard">
            <div class="date-filter-beautiful">
                <label><i class="fas fa-calendar"></i> Du:</label>
                <input type="date" id="dashboardStartDate" onchange="filterDashboardByDate()">
                <label><i class="fas fa-calendar"></i> Au:</label>
                <input type="date" id="dashboardEndDate" onchange="filterDashboardByDate()">
                <button class="btn btn-primary" onclick="filterDashboardByDate()"><i class="fas fa-filter"></i> Filtrer</button>
                <button class="btn btn-outline" onclick="resetDashboardDateFilter()"><i class="fas fa-eye"></i> Tout voir</button>
            </div>
            <div class="stats-grid" id="statsGrid"></div>
            <div class="search-bar">
                <input type="text" id="dashboardSearch" placeholder="🔍 Rechercher..." oninput="filterDashboard()">
                <select id="dashboardFilter" onchange="filterDashboard()">
                    <option value="all">Tous</option>
                    <option value="local">Locaux</option>
                    <option value="importe">Importés</option>
                </select>
            </div>
            <div class="table-container">
                <div class="table-header"><h3><i class="fas fa-box"></i> Stock Global</h3><button class="btn btn-info" onclick="exportDashboardPDF()"><i class="fas fa-file-pdf"></i> PDF</button></div>
                <div style="overflow-x:auto;">
                    <table class="inventory-table">
                        <thead><tr><th>N°</th><th></th><th>Article</th><th>Code Barre</th><th>Type</th><th>Prix</th><th>Dépôt</th><th>Comptoir</th><th>Total</th><th>Statut</th></tr></thead>
                        <tbody id="dashboardTable"></tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- NOUVELLE VENTE -->
        <div class="tab-content" id="tab-sales">
            <div class="sale-panel">
                <div>
                    <div class="search-bar">
                        <input type="text" id="saleSearch" placeholder="🔍 Rechercher..." oninput="filterSaleItems()">
                        <select id="saleFilter" onchange="filterSaleItems()">
                            <option value="all">Tous</option>
                            <option value="local">Locaux</option>
                            <option value="importe">Importés</option>
                        </select>
                        <button class="btn btn-info" onclick="openQRScannerForSale()"><i class="fas fa-qrcode"></i> Scanner</button>
                        <button class="btn btn-warning" onclick="openDebtModal()"><i class="fas fa-hand-holding-usd"></i> Dette/Garantie</button>
                        <button class="btn btn-primary" onclick="openLoyaltyModal()"><i class="fas fa-gem"></i> Fidélité</button>
                        <button class="btn btn-secondary" onclick="openReservationModal()"><i class="fas fa-calendar-alt"></i> Réservation</button>
                        <button class="cart-icon-btn" onclick="scrollToCart()"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                    <div class="item-grid" id="saleItemGrid"></div>
                </div>
                <div class="cart-panel" id="cartPanel">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> Panier <span id="cartIndicator" class="cart-indicator">1/10</span></h3>
                        <div class="cart-navigation">
                            <button class="cart-nav-btn" onclick="previousCart()"><i class="fas fa-chevron-left"></i></button>
                            <button class="cart-nav-btn" onclick="nextCart()"><i class="fas fa-chevron-right"></i></button>
                            <button class="cart-nav-btn" onclick="addNewCart()"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="server-selector">
                        <label><i class="fas fa-user-tie"></i> Serveur:</label>
                        <select id="serverSelect" onchange="updateServerPhoto()"><option value="">-- Sélectionner --</option></select>
                    </div>
                    <div class="cart-date-selector">
                        <label><i class="fas fa-calendar"></i> Date du panier:</label>
                        <input type="date" id="cartDate" onchange="updateCartDate()">
                    </div>
                    <div class="cart-items-container">
                        <div id="cartItems"><div class="empty-state"><i class="fas fa-shopping-cart empty-icon"></i><p>Panier vide</p></div></div>
                    </div>
                    <div class="cart-totals" id="cartTotals" style="display:none;">
                        <div class="cart-total-row"><span>Sous-total:</span><span id="cartSubtotal">0 FC</span></div>
                        <div class="cart-total-row" id="vipSurchargeRow" style="display:none;"><span>Suppl. VIP:</span><span id="cartVipSurcharge">0 FC</span></div>
                        <div class="cart-total-row grand-total"><span>TOTAL Panier:</span><span id="cartTotal">0 FC</span></div>
                        <div class="cart-total-all" id="cartTotalAll" style="display:none;">
                            <div class="cart-total-row"><span><i class="fas fa-cart-plus"></i> TOTAL TOUS PANIERS:</span><span id="allCartsTotal">0 FC</span></div>
                        </div>
                        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                            <button class="btn btn-warning" onclick="clearCart()"><i class="fas fa-trash"></i> Annuler</button>
                            <button class="btn btn-success" onclick="validateSale()"><i class="fas fa-check"></i> Valider</button>
                            <button class="btn btn-info" onclick="sendToKitchen()"><i class="fas fa-utensils"></i> En cuisine</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- INVENTAIRE -->
        <div class="tab-content" id="tab-inventory">
            <div class="search-bar">
                <input type="text" id="inventorySearch" placeholder="🔍 Rechercher..." oninput="renderInventory()">
                <select id="inventoryFilter" onchange="renderInventory()">
                    <option value="all">Tous</option>
                    <option value="local">Locaux</option>
                    <option value="importe">Importés</option>
                    <option value="rupture">Rupture de stock</option>
                    <option value="expired">Articles expirés</option>
                </select>
                <button class="btn btn-primary" onclick="openAddItemModal()"><i class="fas fa-plus"></i> Ajouter</button>
                <button class="btn btn-info" onclick="exportInventoryPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-success" onclick="generateBarcodeLabels()"><i class="fas fa-barcode"></i> Étiquettes</button>
                <button class="btn btn-warning" onclick="openInventoryCalculationModal()"><i class="fas fa-calculator"></i> Calcul d'inventaire</button>
            </div>
            <div class="table-container">
                <div style="overflow-x:auto;">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th style="text-align:center;">N°</th>
                                <th style="text-align:center;"></th>
                                <th style="text-align:left;">ARTICLE</th>
                                <th style="text-align:left;">CODE BARRE</th>
                                <th style="text-align:center;">TYPE</th>
                                <th style="text-align:right;">PRIX</th>
                                <th style="text-align:right;">DÉPÔT</th>
                                <th style="text-align:right;">COMPTOIR</th>
                                <th style="text-align:right;">TOTAL</th>
                                <th style="text-align:center;">EXPIRATION</th>
                                <th style="text-align:center;">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTable"></tbody>
                    </table>
                </div>
            </div>
        </div>
        
        
        <!-- ÉTAT DE STOCK -->
<div class="tab-content" id="tab-stock-state">
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
        <button class="btn btn-outline active" onclick="switchStockView('depot')"><i class="fas fa-warehouse"></i> DÉPÔT</button>
        <button class="btn btn-outline" onclick="switchStockView('comptoir')"><i class="fas fa-store"></i> COMPTOIR</button>
        <button class="btn btn-outline" onclick="switchStockView('movements')"><i class="fas fa-exchange-alt"></i> MOUVEMENTS</button>
        <button class="btn btn-outline" onclick="switchStockView('losses')"><i class="fas fa-exclamation-circle"></i> PERTES & DÉPENSES</button>
    </div>
    
    <!-- Vue Dépôt -->
    <div id="stock-view-depot" class="stock-view">
        <h4 style="color:var(--gold); margin-bottom:1rem;">Stock Dépôt</h4>
        <div id="depotStats" class="stats-grid"></div>
        <input type="text" id="depotSearch" placeholder="🔍 Rechercher un article..." oninput="renderDepotStock()" style="margin-bottom:1rem; padding:0.6rem; width:100%; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
        <div class="table-container">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Code Barre</th>
                        <th>Stock</th>
                        <th>Valeur</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="depotStockTable"></tbody>
            </table>
        </div>
        <div style="display:flex; gap:1rem; margin-top:1rem; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="openBulkTransferModal()"><i class="fas fa-exchange-alt"></i> Transfert en masse</button>
            <button class="btn btn-success" onclick="openPurchaseModal()"><i class="fas fa-shopping-cart"></i> Achats boissons</button>
        </div>
    </div>
    
    <!-- Vue Comptoir -->
    <div id="stock-view-comptoir" class="stock-view" style="display:none;">
        <h4 style="color:var(--gold); margin-bottom:1rem;">Stock Comptoir</h4>
        <div id="comptoirStats" class="stats-grid"></div>
        <input type="text" id="comptoirSearch" placeholder="🔍 Rechercher un article..." oninput="renderComptoirStock()" style="margin-bottom:1rem; padding:0.6rem; width:100%; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
        <div class="table-container">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Code Barre</th>
                        <th>Stock</th>
                        <th>Valeur</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="comptoirStockTable"></tbody>
            </table>
        </div>
        <button class="btn btn-warning" onclick="openBulkReturnModal()" style="margin-top:1rem;"><i class="fas fa-undo-alt"></i> Transfert retour vers Dépôt</button>
    </div>
    
    <!-- Vue Mouvements -->
    <div id="stock-view-movements" class="stock-view" style="display:none;">
        <h4 style="color:var(--gold); margin-bottom:1rem;">Mouvements de stock</h4>
        <div class="date-filter-beautiful">
            <input type="date" id="movementDate" placeholder="Date début">
            <input type="date" id="movementDateEnd" placeholder="Date fin">
            <select id="movementTypeFilter">
                <option value="all">Tous</option>
                <option value="transfer">Transferts</option>
                <option value="restock">Réapprovisionnements</option>
                <option value="sale">Ventes</option>
                <option value="return">Retours</option>
                <option value="loss">Pertes</option>
                <option value="purchase">Achats</option>
                <option value="offer">Offerts</option>
                <option value="consign">Consignations</option>
                <option value="debt">Dettes</option>
            </select>
            <button class="btn btn-primary" onclick="renderMovements()"><i class="fas fa-filter"></i> Filtrer</button>
            <button class="btn btn-info" onclick="exportMovementsPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
            <button class="btn btn-success" onclick="exportMovementsExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
        <div class="table-container">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Article</th>
                        <th>Qté</th>
                        <th>De</th>
                        <th>Vers</th>
                        <th>Valeur</th>
                        <th>Motif</th>
                    </tr>
                </thead>
                <tbody id="movementsTable"></tbody>
            </table>
        </div>
    </div>
    
    <!-- Vue Pertes et Dépenses -->
    <div id="stock-view-losses" class="stock-view" style="display:none;">
        <h4 style="color:var(--gold); margin-bottom:1rem;">Pertes & Dépenses</h4>
        <div class="date-filter-beautiful" style="margin-bottom:1rem;">
            <label>Du:</label><input type="date" id="lossesFilterStart">
            <label>Au:</label><input type="date" id="lossesFilterEnd">
            <button class="btn btn-info" onclick="filterLossesAndExpenses()"><i class="fas fa-search"></i> Filtrer</button>
            <button class="btn btn-primary" onclick="exportLossesPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
            <div class="settings-card">
                <h5><i class="fas fa-exclamation-triangle"></i> Signaler une perte</h5>
                <div class="form-group"><label>Date</label><input type="date" id="lossDate" value=""></div>
                <select id="lossLocation" class="form-control" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
                    <option value="depot">Dépôt</option>
                    <option value="comptoir">Comptoir</option>
                </select>
                <select id="lossItem" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);"></select>
                <input type="number" id="lossQty" value="1" min="1" placeholder="Quantité" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
                <input type="text" id="lossReason" placeholder="Motif de la perte" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
                <button class="btn btn-danger" onclick="reportLoss()" style="width:100%;"><i class="fas fa-trash-alt"></i> Signaler</button>
            </div>
            <div class="settings-card">
                <h5><i class="fas fa-coins"></i> Ajouter une dépense</h5>
                <div class="form-group"><label>Date</label><input type="date" id="expenseDate" value=""></div>
                <input type="text" id="expenseDesc" placeholder="Description de la dépense" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
                <input type="number" id="expenseAmount" placeholder="Montant (FC)" style="width:100%; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:var(--input-bg); border:1px solid var(--gold); color:var(--text-primary);">
                <button class="btn btn-warning" onclick="addExpense()" style="width:100%;"><i class="fas fa-plus-circle"></i> Ajouter</button>
            </div>
        </div>
        <div class="table-container">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Valeur</th>
                        <th>Motif</th>
                    </tr>
                </thead>
                <tbody id="lossesTable"></tbody>
            </table>
        </div>
    </div>
</div>
        
        <!-- SUIVI STOCK -->
        <div class="tab-content" id="tab-tracking">
            <h3 style="color:var(--gold); margin-bottom:1rem;">Suivi Stock Comptoir</h3>
            <div class="date-filter-beautiful">
                <label><i class="fas fa-calendar"></i> Date:</label>
                <input type="date" id="trackingDate" onchange="renderTracking()" value="">
                <button class="btn btn-info" onclick="exportTrackingExcel()"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-primary" onclick="exportTrackingPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Article</th><th>Reste hier</th><th>Transfert</th><th>Total</th><th>Comptage</th><th>Vendus</th><th>Offerts</th><th>Pertes</th><th>Surplus</th><th>Reste</th></tr></thead>
                    <tbody id="trackingComptoirTable"></tbody>
                </table>
            </div>
            <div id="trackingHelp" style="margin-top:1rem; padding:1rem; background:var(--card-bg); border-radius:var(--radius); border-left:4px solid var(--accent);">
                <small><i class="fas fa-info-circle"></i> <strong>Comment ça marche?</strong><br>
                • <strong>Reste hier</strong> = Stock comptoir de la veille<br>
                • <strong>Transfert</strong> = Quantité transférée du dépôt vers comptoir aujourd'hui<br>
                • <strong>Total</strong> = Reste hier + Transfert<br>
                • <strong>Comptage</strong> = Saisissez le nombre réel d'articles dans votre comptoir (modifiable)<br>
                • <strong>Vendus/Offerts</strong> = Calculés automatiquement à partir des ventes du jour<br>
                • <strong>Pertes</strong> = Total - Comptage - Vendus - Offerts<br>
                • <strong>Surplus</strong> = Comptage + Vendus + Offerts - Total<br>
                • <strong>Reste</strong> = Comptage - Vendus - Offerts</small>
            </div>
        </div>
        
        <!-- HISTORIQUE VENTES -->
        <div class="tab-content" id="tab-history">
            <h3 style="color:var(--gold); margin-bottom:1rem;">Historique Ventes</h3>
            <div class="history-filters">
                <select id="historyPeriodFilter" onchange="filterHistory()">
                    <option value="all">Tous</option>
                    <option value="day">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                </select>
                <select id="historyServerFilter" onchange="filterHistory()">
                    <option value="all">Tous les serveurs</option>
                </select>
                <input type="text" id="historyReceiptSearch" placeholder="N° Reçu..." oninput="filterHistory()">
                <button class="btn btn-info" onclick="exportHistoryPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-success" onclick="exportHistoryExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
            <div id="historyList"></div>
        </div>
        
        <!-- SERVEURS -->
        <div class="tab-content" id="tab-servers">
            <div class="search-bar">
                <button class="btn btn-primary" onclick="openAddServerModal()"><i class="fas fa-plus"></i> Ajouter Serveur</button>
                <button class="btn btn-info" onclick="openFaceRecognitionModal()"><i class="fas fa-face-smile"></i> Reconnaissance faciale</button>
                <button class="btn btn-success" onclick="exportServersPDF()"><i class="fas fa-file-pdf"></i> Liste PDF</button>
                <button class="btn btn-warning" onclick="exportSalaryPDF()"><i class="fas fa-money-bill"></i> Salaires PDF</button>
            </div>
            <div class="date-filter-beautiful">
                <select id="serverFilterSelect" onchange="renderServerStatsByDate()"><option value="all">Tous les serveurs</option></select>
                <label><i class="fas fa-calendar"></i> Du:</label>
                <input type="date" id="serverStatsStartDate" onchange="renderServerStatsByDate()">
                <label><i class="fas fa-calendar"></i> Au:</label>
                <input type="date" id="serverStatsEndDate" onchange="renderServerStatsByDate()">
                <button class="btn btn-primary" onclick="renderServerStatsByDate()"><i class="fas fa-filter"></i> Filtrer</button>
            </div>
            <div class="stats-grid" id="serverSummaryStats"></div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Profil</th><th>Serveur</th><th>Commandes</th><th>Bouteilles</th><th>Total</th><th>Présence</th><th></th></tr></thead>
                    <tbody id="serversTableExtended"></tbody>
                </table>
            </div>
        </div>
        
        <!-- ALERTES -->
        <div class="tab-content" id="tab-alerts">
            <h3 style="color:var(--gold); margin-bottom:1rem;"><i class="fas fa-exclamation-triangle"></i> Alertes Stock Bas</h3>
            <div class="alerts-grid" id="alertsList"></div>
        </div>
        
        <!-- CUISINE -->
        <div class="tab-content" id="tab-kitchen">
            <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="switchKitchenView('orders')"><i class="fas fa-list"></i> Commandes</button>
                <button class="btn btn-outline" onclick="switchKitchenView('inventory')"><i class="fas fa-utensils"></i> Inventaire Cuisine</button>
                <button class="btn btn-outline" onclick="switchKitchenView('stats')"><i class="fas fa-chart-line"></i> Statistiques</button>
            </div>
            <div id="kitchenOrdersView" class="kitchen-view">
                <h3 style="color:var(--gold); margin-bottom:1rem;"><i class="fas fa-receipt"></i> Commandes en attente</h3>
                <div class="kitchen-filters" style="display:flex; gap:0.5rem; margin-bottom:1rem;">
                    <select id="kitchenStatusFilter" onchange="filterKitchenOrders()">
                        <option value="all">Tous</option>
                        <option value="pending">En attente</option>
                        <option value="preparing">En préparation</option>
                        <option value="ready">Prêt</option>
                        <option value="served">Servi</option>
                    </select>
                    <input type="date" id="kitchenDateFilter" onchange="filterKitchenOrders()" value="${new Date().toISOString().split('T')[0]}">
                    <button class="btn btn-info" onclick="exportKitchenOrdersPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                </div>
                <div id="kitchenOrdersList" class="kitchen-orders-grid"></div>
            </div>
            <div id="kitchenInventoryView" class="kitchen-view" style="display:none;">
                <div class="search-bar">
                    <button class="btn btn-primary" onclick="openAddKitchenItemModal()"><i class="fas fa-plus"></i> Ajouter article</button>
                    <input type="text" id="kitchenInventorySearch" placeholder="🔍 Rechercher..." oninput="renderKitchenInventory()">
                </div>
                <div class="table-container">
                    <table><thead><tr><th>Article</th><th>Catégorie</th><th>Prix</th><th>Temps prép.</th><th>Stock</th><th>Unité</th><th>Actions</th></tr></thead><tbody id="kitchenInventoryTable"></tbody></table>
                </div>
            </div>
            <div id="kitchenStatsView" class="kitchen-view" style="display:none;">
                <div class="stats-grid" id="kitchenStatsGrid"></div>
                <div class="table-container">
                    <table><thead><tr><th>Période</th><th>Commandes</th><th>Temps moyen</th><th>Valeur totale</th></tr></thead><tbody id="kitchenStatsTable"></tbody></table>
                </div>
            </div>
        </div>
        
        <!-- TÂCHES -->
        <div class="tab-content" id="tab-taskboard">
            <div class="search-bar">
                <button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Nouvelle tâche</button>
                <button class="btn btn-info" onclick="exportTasksPDF()"><i class="fas fa-file-pdf"></i> Exporter PDF</button>
            </div>
            <div id="taskBoardContent"></div>
            <div id="shiftBoardContent" style="margin-top: 2rem;"></div>
        </div>
        
        <!-- ANALYSES -->
        <div class="tab-content" id="tab-analytics">
            <div class="stats-grid" id="analyticsStatsGrid"></div>
            <div class="table-container">
                <div class="table-header"><h3>Top produits</h3><button class="btn btn-info" onclick="exportAnalyticsPDF()">Exporter PDF</button></div>
                <div id="topProductsTable"></div>
            </div>
            <div class="table-container">
                <div class="table-header"><h3>Performance serveurs</h3></div>
                <div id="serverPerformanceTable"></div>
            </div>
            <div class="table-container">
                <div class="table-header"><h3>Prévisions de ventes (7j)</h3></div>
                <div id="salesForecastTable"></div>
            </div>
        </div>
        
        <!-- ADMINISTRATION -->
        <div class="tab-content" id="tab-admin">
            <h3 style="color:var(--gold); margin-bottom:1rem;"><i class="fas fa-crown"></i> Administration</h3>
            <div class="settings-grid">
                <div class="settings-card">
                    <h3>Inviter un administrateur</h3>
                    <div class="form-group"><label>Email</label><input type="email" id="inviteEmail" placeholder="admin@exemple.com"></div>
                    <div class="form-group"><label>Rôle</label><select id="inviteRole"><option value="admin">Admin</option><option value="manager">Manager</option><option value="viewer">Observateur</option></select></div>
                    <button class="btn btn-primary" onclick="sendInvitation()"><i class="fas fa-envelope"></i> Envoyer</button>
                </div>
                <div class="settings-card">
                    <h3>Administrateurs</h3>
                    <div id="adminUsersList"></div>
                </div>
            </div>
            <div class="settings-card" style="margin-top:1.5rem;">
                <h3>Journal d'activité</h3>
                <div id="activityLog" style="max-height:300px; overflow-y:auto;"></div>
            </div>
        </div>
        
        <!-- PARAMÈTRES -->
        <div class="tab-content" id="tab-settings">
            <div class="settings-grid">
                <div class="settings-card">
                    <h3><i class="fas fa-building"></i> Entreprise</h3>
                    <div class="form-group"><label>Nom</label><input type="text" id="companyName" value="Mes Bes Extrêmes"></div>
                    <div class="form-group"><label>Slogan</label><input type="text" id="companySlogan" value="Bar & Terrasse"></div>
                    <div class="form-group"><label>Adresse</label><input type="text" id="companyAddress" value="Route Kimpé, Réf. OCC, Ville de Kasumbalesa"></div>
                    <div class="form-group"><label>Téléphone</label><input type="text" id="companyPhone" value="+243 813 594 485"></div>
                    <div class="form-group"><label>Email</label><input type="email" id="companyEmail" value="contact@mesbesextremes.cd"></div>
                    <div class="form-group"><label>Site Web</label><input type="text" id="companyWebsite" value="www.mesbesextremes.cd"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Facebook</label><input type="text" id="companyFb" value="@mesbesextremes"></div>
                        <div class="form-group"><label>Instagram</label><input type="text" id="companyIg" value="@mesbesextremes"></div>
                    </div>
                    <div class="form-group"><label>TikTok</label><input type="text" id="companyTt" value="@mesbesextremes"></div>
                    <div class="form-group"><label>RCCM</label><input type="text" id="companyRccm" value="RCCM-CD/KIN/00000"></div>
                    <div class="form-group"><label>N° Impôt</label><input type="text" id="companyTaxId" value="IDNAT-0000000000"></div>
                    <div class="form-group"><label>N° Registre Commerce</label><input type="text" id="companyRegistre" value="RC-00000"></div>
                    <div class="logo-preview" id="logoPreview"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23d4a017'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='%230a0e17'%3E🍺%3C/text%3E%3C/svg%3E" alt="Logo"></div>
                    <input type="file" id="logoUpload" accept="image/*" onchange="uploadLogo(event)">
                    <button class="btn btn-success" onclick="saveCompanyInfo()">Enregistrer</button>
                </div>
                <div class="settings-card">
                    <h3>Seuils d'alerte</h3>
                    <div class="setting-row"><span>Locaux:</span><input type="number" id="localThreshold" value="10"></div>
                    <div class="setting-row"><span>Importés:</span><input type="number" id="importeThreshold" value="3"></div>
                </div>
                <div class="settings-card">
                    <h3>Suppléments VIP</h3>
                    <div class="setting-row"><span>&lt;10k:</span><input type="number" id="vipSurcharge1" value="2000"></div>
                    <div class="setting-row"><span>10-30k:</span><input type="number" id="vipSurcharge2" value="5000"></div>
                    <div class="setting-row"><span>&gt;30k:</span><input type="number" id="vipSurcharge3" value="10000"></div>
                </div>
                <div class="settings-card">
                    <h3>Configuration travail</h3>
                    <div class="setting-row"><span>Heures/jour:</span><input type="number" id="workHoursPerDay" value="8"></div>
                    <div class="setting-row"><span>Jours/mois:</span><input type="number" id="workDaysPerMonth" value="30"></div>
                </div>
                <div class="settings-card">
                    <h3>Sauvegarde auto</h3>
                    <div class="setting-row"><span>Activer</span><input type="checkbox" id="autoSave" checked onchange="toggleAutoSave()"></div>
                </div>
                <div class="settings-card">
                    <h3>Fournisseurs</h3>
                    <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;">
                        <input type="text" id="newSupplierName" placeholder="Nom" style="flex:1;">
                        <input type="text" id="newSupplierContact" placeholder="Contact" style="flex:1;">
                        <button class="btn btn-success" onclick="addSupplier()"><i class="fas fa-plus"></i></button>
                    </div>
                    <div id="suppliersList" style="max-height:150px; overflow-y:auto;"></div>
                </div>
                <div class="settings-card">
                    <h3>Transfert des données</h3>
                    <p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:0.75rem;">Transférez vos données locales vers le cloud.</p>
                    <button class="btn btn-warning" onclick="transferLocalToCloud()"><i class="fas fa-cloud-upload-alt"></i> Transférer vers le Cloud</button>
                    <p id="transferStatus" style="margin-top:0.5rem;font-size:0.8rem"></p>
                </div>
                <div class="settings-card">
                    <h3>Données</h3>
                    <div style="display:flex; flex-direction:column; gap:0.75rem;">
                        <button class="btn btn-info" onclick="exportData()"><i class="fas fa-download"></i> Exporter</button>
                        <button class="btn btn-warning" onclick="document.getElementById('importFile').click()"><i class="fas fa-upload"></i> Importer</button>
                        <input type="file" id="importFile" accept=".json" style="display:none;" onchange="importData(event)">
                        <button class="btn btn-danger" onclick="confirmResetAllData()"><i class="fas fa-exclamation-triangle"></i> Réinitialiser</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialiser les sélecteurs et les listes
    if(window.updateServerSelects) window.updateServerSelects();
    if(window.renderSuppliersList) window.renderSuppliersList();
    if(window.updateHistoryFilters) window.updateHistoryFilters();
    if(window.updateDebtFilters) window.updateDebtFilters();
    
    // Remplir le select des pertes
    const lossItemSelect = document.getElementById('lossItem');
    if(lossItemSelect && window.items) {
        lossItemSelect.innerHTML = window.items.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
    }
    
    // Remplir la date courante
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = ['lossDate', 'expenseDate', 'trackingDate'];
    dateInputs.forEach(id => {
        const input = document.getElementById(id);
        if(input && !input.value) input.value = today;
    });
}

function restoreLogoAfterSync() {
    const headerLogo = document.getElementById('headerLogoImg');
    const landingLogo = document.getElementById('landingLogoImg');
    
    if(companyInfo.logo && companyInfo.logo !== '[COMPANY_LOGO]') {
        if(headerLogo) headerLogo.src = companyInfo.logo;
        if(landingLogo) landingLogo.src = companyInfo.logo;
    }
    
    const logoPreview = document.getElementById('logoPreview');
    if(logoPreview && companyInfo.logo && companyInfo.logo !== '[COMPANY_LOGO]') {
        logoPreview.innerHTML = `<img src="${companyInfo.logo}">`;
    }
}

window.restoreLogoAfterSync = restoreLogoAfterSync;



