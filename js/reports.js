// ============================================
// REPORTS - Statistiques, exports, historique
// ============================================

let dashboardStartDate = null;
let dashboardEndDate = null;

function initReports() {
    window.renderDashboard = renderDashboard;
    window.filterDashboard = filterDashboard;
    window.filterDashboardByDate = filterDashboardByDate;
    window.resetDashboardDateFilter = resetDashboardDateFilter;
    window.renderHistory = renderHistory;
    window.filterHistory = filterHistory;
    window.showReceiptFromHistory = showReceiptFromHistory;
    window.restoreSaleToCart = restoreSaleToCart;
    window.renderServerStatsByDate = renderServerStatsByDate;
    window.exportDashboardPDF = exportDashboardPDF;
    window.exportInventoryPDF = exportInventoryPDF;
    window.exportHistoryPDF = exportHistoryPDF;
    window.exportHistoryExcel = exportHistoryExcel;
    window.exportMovementsPDF = exportMovementsPDF;
    window.exportMovementsExcel = exportMovementsExcel;
    window.exportTrackingPDF = exportTrackingPDF;
    window.exportTrackingExcel = exportTrackingExcel;
    window.exportServersPDF = exportServersPDF;
    window.exportSalaryPDF = exportSalaryPDF;
    window.exportLossesPDF = exportLossesPDF;
    window.showDetailsModalLocal = showDetailsModalLocal;
    window.showDetailsModalImport = showDetailsModalImport;
    window.showAlertsModal = showAlertsModal;
    window.openDebtDetailsModal = openDebtDetailsModal;
    window.openLossesDetailsModal = openLossesDetailsModal;
    window.updateServerFilterSelect = updateServerFilterSelect;
    window.updateHistoryFilters = updateHistoryFilters;
    window.editServer = editServer;
    window.addNewServer = addNewServer;
    window.openAddServerModal = openAddServerModal;
    
    loadReportsTabContent();
}

function loadReportsTabContent() {
    const historyTab = document.getElementById('tab-history');
    const serversTab = document.getElementById('tab-servers');
    
    if(historyTab) {
        historyTab.innerHTML = `
            <h3 style="color:var(--gold);">Historique Ventes</h3>
            <div class="history-filters">
                <select id="historyPeriodFilter" onchange="filterHistory()"><option value="all">Tous</option><option value="day">Aujourd'hui</option><option value="week">Cette semaine</option><option value="month">Ce mois</option></select>
                <select id="historyServerFilter" onchange="filterHistory()"><option value="all">Tous les serveurs</option></select>
                <input type="text" id="historyReceiptSearch" placeholder="N° Reçu..." oninput="filterHistory()">
                <button class="btn btn-info" onclick="exportHistoryPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-success" onclick="exportHistoryExcel()"><i class="fas fa-file-excel"></i> Excel</button>
            </div>
            <div id="historyList"></div>
        `;
    }
    
    if(serversTab) {
        serversTab.innerHTML = `
            <div class="search-bar">
                <button class="btn btn-primary" onclick="openAddServerModal()"><i class="fas fa-plus"></i> Ajouter Serveur</button>
                <button class="btn btn-info" onclick="openFaceRecognitionModal()"><i class="fas fa-face-smile"></i> Reconnaissance faciale</button>
                <button class="btn btn-success" onclick="exportServersPDF()"><i class="fas fa-file-pdf"></i> Liste PDF</button>
                <button class="btn btn-warning" onclick="exportSalaryPDF()"><i class="fas fa-money-bill"></i> Salaires PDF</button>
            </div>
            <div class="date-filter-beautiful">
                <select id="serverFilterSelect" onchange="renderServerStatsByDate()"><option value="all">Tous les serveurs</option></select>
                <label><i class="fas fa-calendar"></i> Du:</label><input type="date" id="serverStatsStartDate" onchange="renderServerStatsByDate()">
                <label><i class="fas fa-calendar"></i> Au:</label><input type="date" id="serverStatsEndDate" onchange="renderServerStatsByDate()">
                <button class="btn btn-primary" onclick="renderServerStatsByDate()"><i class="fas fa-filter"></i> Filtrer</button>
            </div>
            <div class="stats-grid" id="serverSummaryStats"></div>
            <div class="table-container"><tr><thead><tr><th>Photo</th><th>Serveur</th><th>Commandes</th><th>Bouteilles</th><th>Total (FC)</th><th>Présence</th><th>Actions</th></tr></thead><tbody id="serversTableExtended"></tbody></table></div>
        `;
    }
}

function renderDashboard() {
    const sold = items.reduce((s, i) => s + (i.sold || 0), 0);
    let filteredSales = [...salesHistory];
    if(dashboardStartDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] >= dashboardStartDate);
    if(dashboardEndDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] <= dashboardEndDate);
    const revenue = filteredSales.reduce((s, sale) => s + (sale.grandTotal || 0), 0);
    const alertCount = items.filter(i => getRemainingStock(i) <= (i.type === 'local' ? settings.localThreshold : settings.importeThreshold)).length;
    const depotValue = items.reduce((s, i) => s + ((i.depotStock || 0) * i.price), 0);
    const comptoirValue = items.reduce((s, i) => s + ((i.comptoirStock || 0) * i.price), 0);
    let revLocal = 0, revImporte = 0, revVIP = 0;
    const localItems = [], importItems = [];
    filteredSales.forEach(sale => {
        sale.items.forEach(si => {
            const item = si.item;
            if(item) {
                const itemTotal = (item.price * si.qty) + (getVipSurcharge(item.price) * (si.vipCount || 0));
                if(item.type === 'local') { revLocal += itemTotal; localItems.push({ name: item.name, qty: si.qty, price: item.price, total: itemTotal }); }
                else if(item.type === 'importe') { revImporte += itemTotal; importItems.push({ name: item.name, qty: si.qty, price: item.price, total: itemTotal }); }
            }
        });
        revVIP += sale.vipSurcharge || 0;
    });
    const totalDebts = debts.filter(d => d.status === 'pending').reduce((s, d) => s + d.value, 0);
    const totalLosses = losses.reduce((s, l) => s + l.value, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    
    window._dashboardLocalItems = localItems;
    window._dashboardImportItems = importItems;
    
    const statsGrid = document.getElementById('statsGrid');
    if(statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card clickable-stat" onclick='showDetailsModalLocal()'><i class="fas fa-flag"></i><div class="stat-value">${formatFC(revLocal)}</div><div class="stat-label">Local</div></div>
            <div class="stat-card clickable-stat" onclick='showDetailsModalImport()'><i class="fas fa-globe"></i><div class="stat-value">${formatFC(revImporte)}</div><div class="stat-label">Import</div></div>
            <div class="stat-card clickable-stat" onclick='showAlertsModal()'><i class="fas fa-exclamation-triangle"></i><div class="stat-value">${alertCount}</div><div class="stat-label">Alertes</div></div>
            <div class="stat-card"><i class="fas fa-money-bill"></i><div class="stat-value">${formatFC(revenue)}</div><div class="stat-label">CA Total</div><div class="stat-detail">VIP: ${formatFC(revVIP)}</div></div>
            <div class="stat-card clickable-stat" onclick='openDebtDetailsModal()'><i class="fas fa-hand-holding-usd"></i><div class="stat-value">${formatFC(totalDebts)}</div><div class="stat-label">Dettes</div></div>
            <div class="stat-card clickable-stat" onclick='openLossesDetailsModal()'><i class="fas fa-exclamation-triangle"></i><div class="stat-value">${formatFC(totalLosses + totalExpenses)}</div><div class="stat-label">Pertes & Dépenses</div></div>
            <div class="stat-card"><i class="fas fa-box"></i><div class="stat-value">${sold}</div><div class="stat-label">Vendus</div></div>
            <div class="stat-card"><i class="fas fa-warehouse"></i><div class="stat-value">${formatFC(depotValue)}</div><div class="stat-label">Dépôt</div></div>
            <div class="stat-card"><i class="fas fa-store"></i><div class="stat-value">${formatFC(comptoirValue)}</div><div class="stat-label">Comptoir</div></div>
        `;
    }
    filterDashboard();
}

function filterDashboard() {
    const search = document.getElementById('dashboardSearch')?.value.toLowerCase() || '';
    const filter = document.getElementById('dashboardFilter')?.value || 'all';
    const filtered = items.filter(i => i.name.toLowerCase().includes(search) && (filter === 'all' || i.type === filter) && !i.hidden);
    const tbody = document.getElementById('dashboardTable');
    if(tbody) {
        tbody.innerHTML = filtered.map((item, idx) => {
            const status = getStockStatus(item);
            return `<tr class="${item.hidden ? 'hidden-item' : ''}">
                <td>${idx + 1}</td>
                <td><img src="${item.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\'%3E%3Crect width=\'48\' height=\'48\' fill=\'%232a3344\'/%3E%3Ctext x=\'24\' y=\'30\' text-anchor=\'middle\' fill=\'%238a94a6\' font-size=\'16\'%3E📦%3C/text%3E%3C/svg%3E'}" class="article-photo" onclick="showArticleDetails(${item.id})"></td>
                <td><strong>${item.name}</strong>${item.hidden ? ' <span style="color:var(--warning);">[Masqué]</span>' : ''}</td>
                <td>${item.barcode || '-'}</td><td><span class="badge-${item.type}">${item.type === 'local' ? '🟢' : '🔵'}</span></td>
                <td>${formatFC(item.price)}</td><td>${item.depotStock || 0}</td><td>${item.comptoirStock || 0}</td>
                <td class="${status.class}">${getRemainingStock(item)}</td><td class="${status.class}">${status.text}</td>
              </tr>`;
        }).join('');
    }
}

function filterDashboardByDate() { dashboardStartDate = document.getElementById('dashboardStartDate')?.value; dashboardEndDate = document.getElementById('dashboardEndDate')?.value; renderDashboard(); }
function resetDashboardDateFilter() { dashboardStartDate = null; dashboardEndDate = null; if(document.getElementById('dashboardStartDate')) document.getElementById('dashboardStartDate').value = ''; if(document.getElementById('dashboardEndDate')) document.getElementById('dashboardEndDate').value = ''; renderDashboard(); }
function renderHistory() { const sorted = [...salesHistory].sort((a, b) => b.id - a.id); renderHistoryList(sorted); }
function renderHistoryList(list) { const container = document.getElementById('historyList'); if(!container) return; if(list.length === 0) { container.innerHTML = '<div class="empty-state">Aucune vente</div>'; return; } container.innerHTML = list.map(s => `<div class="history-sale"><div style="cursor:pointer;" onclick="showReceiptFromHistory(${s.id})"><span><strong>N°${String(s.id).padStart(5, '0')}</strong> - ${formatDate(s.date)}</span><br><small>Serveur: ${s.server?.name || s.server} | ${formatFC(s.grandTotal)}</small></div><div class="history-sale-actions"><button class="btn btn-info btn-sm" onclick="showReceiptFromHistory(${s.id})"><i class="fas fa-receipt"></i></button><button class="btn btn-warning btn-sm" onclick="restoreSaleToCart(${s.id})"><i class="fas fa-undo-alt"></i> Restaurer</button></div></div>`).join(''); }
function filterHistory() { const period = document.getElementById('historyPeriodFilter')?.value || 'all'; const server = document.getElementById('historyServerFilter')?.value || 'all'; const receipt = document.getElementById('historyReceiptSearch')?.value || ''; let filtered = [...salesHistory]; if(period !== 'all') { const now = new Date(); filtered = filtered.filter(s => { const d = new Date(s.date); if(period === 'day') return d.toDateString() === now.toDateString(); if(period === 'week') { const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return d >= weekAgo; } if(period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); return true; }); } if(server !== 'all') filtered = filtered.filter(s => (s.server?.name || s.server) === server); if(receipt) filtered = filtered.filter(s => String(s.id).includes(receipt) || String(s.id).padStart(5, '0').includes(receipt)); renderHistoryList(filtered); }
function showReceiptFromHistory(id) { const sale = salesHistory.find(s => s.id === id); if(sale) showReceipt(sale, sale.paymentMethod || 'cash'); }
function restoreSaleToCart(id) { const sale = salesHistory.find(s => s.id === id); if(!sale) return; const dateStr = prompt("Entrez la date pour ce panier (AAAA-MM-JJ):", sale.date.split('T')[0]); if(!dateStr) return; for(const si of sale.items) { const item = items.find(i => i.id === si.item.id); if(item) item.comptoirStock += si.qty; } carts.push([]); cartServers.push(''); cartDates.push(dateStr); const newIdx = carts.length - 1; sale.items.forEach(si => carts[newIdx].push({ id: si.item.id, qty: si.qty, vipCount: si.vipCount || 0, paid: true })); cartServers[newIdx] = sale.server.id; currentCartIndex = newIdx; salesHistory = salesHistory.filter(s => s.id !== id); stockMovements = stockMovements.filter(m => !(m.type === 'sale' && m.date === sale.date)); saveData(); renderAll(); switchTab('sales'); showToast(`Panier restauré`); }

function renderServerStatsByDate() {
    const startDate = document.getElementById('serverStatsStartDate')?.value;
    const endDate = document.getElementById('serverStatsEndDate')?.value;
    const serverFilter = document.getElementById('serverFilterSelect')?.value || 'all';
    let filteredSales = [...salesHistory];
    if(startDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] >= startDate);
    if(endDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] <= endDate);
    let displayServers = [...window.servers];
    if(serverFilter !== 'all' && serverFilter !== 'all' && window.servers) displayServers = window.servers.filter(s => s.id == serverFilter);
    const serverStats = {};
    filteredSales.forEach(s => { const srv = s.server?.name || s.server; if(!srv) return; if(!serverStats[srv]) serverStats[srv] = { orders: 0, bottles: 0, revenue: 0 }; serverStats[srv].orders++; serverStats[srv].bottles += s.items.reduce((sum, i) => sum + i.qty, 0); serverStats[srv].revenue += s.grandTotal; });
    const totalOrders = filteredSales.length;
    const totalBottles = filteredSales.reduce((s, sa) => s + sa.items.reduce((sum, i) => sum + i.qty, 0), 0);
    const totalRev = filteredSales.reduce((s, sa) => s + sa.grandTotal, 0);
    const serverSummaryStats = document.getElementById('serverSummaryStats');
    if(serverSummaryStats) serverSummaryStats.innerHTML = `<div class="stat-card"><i class="fas fa-shopping-cart"></i><div class="stat-value">${totalOrders}</div><div class="stat-label">Cmd</div></div><div class="stat-card"><i class="fas fa-wine-bottle"></i><div class="stat-value">${totalBottles}</div><div class="stat-label">Bout.</div></div><div class="stat-card"><i class="fas fa-money-bill"></i><div class="stat-value">${formatFC(totalRev)}</div><div class="stat-label">Total</div></div>`;
    const serversTable = document.getElementById('serversTableExtended');
    if(serversTable && window.servers) {
        serversTable.innerHTML = displayServers.map(s => {
            const stats = serverStats[s.name] || { orders: 0, bottles: 0, revenue: 0 };
            const workDays = settings.workDaysPerMonth || 30;
            const presentDays = s.presentDays || 0;
            const earnedSalary = (s.dailySalary || 0) * presentDays;
            return `<tr>
                <td style="text-align:center;"><img src="${s.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'%3E%3Crect width=\'50\' height=\'50\' fill=\'%232a3344\'/%3E%3Ctext x=\'25\' y=\'33\' text-anchor=\'middle\' fill=\'%238a94a6\' font-size=\'20\'%3E👤%3C/text%3E%3C/svg%3E'}" style="width:45px; height:45px; border-radius:10px; object-fit:cover;"></td>
                <td><strong>${s.name}</strong><br><small>${s.position || 'Serveur'}</small><br><small>Mat: ${s.matricule || '-'}</small></td>
                <td style="text-align:center">${stats.orders}</td>
                <td style="text-align:center">${stats.bottles}</td>
                <td style="text-align:right">${formatFC(stats.revenue)}</td>
                <td>${s.present ? '✅ Présent' : '❌ Absent'}<br><small>${presentDays}/${workDays} jours</small><br><small>Salaire: ${formatFC(earnedSalary)}</small></td>
                <td><button class="btn btn-sm btn-info" onclick="editServer(${s.id})"><i class="fas fa-edit"></i></button></td>
            </tr>`;
        }).join('');
    }
}

function updateServerFilterSelect() { const select = document.getElementById('serverFilterSelect'); if(select && window.servers) { select.innerHTML = '<option value="all">Tous les serveurs</option>'; window.servers.forEach(s => select.innerHTML += `<option value="${s.id}">${s.name}</option>`); } }
function updateHistoryFilters() { const select = document.getElementById('historyServerFilter'); if(select && window.servers) { select.innerHTML = '<option value="all">Tous les serveurs</option>'; window.servers.forEach(s => select.innerHTML += `<option value="${s.name}">${s.name}</option>`); } }

function openAddServerModal() { const modalHtml = `<div class="modal-overlay" id="addServerModal"><div class="modal"><h3>Ajouter un serveur</h3><div class="form-group"><label>Nom complet</label><input type="text" id="serverFullName"></div><div class="form-group"><label>Poste</label><input type="text" id="serverPosition" value="Serveur"></div><div class="form-group"><label>Date début</label><input type="date" id="serverStartDate" value="${new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Salaire fixe / mois</label><input type="number" id="serverFixedSalary" oninput="calculateServerSalary()"></div><div class="form-row"><div class="form-group"><label>Salaire / jour</label><input type="number" id="serverDailySalary" readonly></div><div class="form-group"><label>Salaire / heure</label><input type="number" id="serverHourlySalary" readonly></div></div><div class="form-group"><label>Matricule</label><input type="text" id="serverMatricule" readonly></div><div class="form-group"><label>Photo</label><input type="file" id="serverPhoto" accept="image/*"></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('addServerModal')">Annuler</button><button class="btn btn-success" onclick="addNewServer()">Ajouter</button></div></div></div>`; if(!document.getElementById('addServerModal')) document.body.insertAdjacentHTML('beforeend', modalHtml); document.getElementById('addServerModal')?.classList.add('active'); calculateServerSalary(); }
function calculateServerSalary() { const fixed = parseInt(document.getElementById('serverFixedSalary')?.value) || 0; const days = settings.workDaysPerMonth || 30; const hours = settings.workHoursPerDay || 8; const dailySalary = document.getElementById('serverDailySalary'); const hourlySalary = document.getElementById('serverHourlySalary'); const matricule = document.getElementById('serverMatricule'); if(dailySalary) dailySalary.value = Math.round(fixed / days); if(hourlySalary) hourlySalary.value = Math.round(fixed / days / hours); if(matricule && !matricule.value) matricule.value = Math.random().toString(36).substring(2, 14).toUpperCase(); }
async function addNewServer() { const name = document.getElementById('serverFullName')?.value; if(!name) { showToast('Nom requis'); return; } const photoFile = document.getElementById('serverPhoto')?.files[0]; let photoData = null; if(photoFile) photoData = await compressPhoto(photoFile); window.servers.push({ id: Date.now(), name: name, position: document.getElementById('serverPosition')?.value || 'Serveur', startDate: document.getElementById('serverStartDate')?.value || '', fixedSalary: parseInt(document.getElementById('serverFixedSalary')?.value) || 0, dailySalary: parseInt(document.getElementById('serverDailySalary')?.value) || 0, hourlySalary: parseInt(document.getElementById('serverHourlySalary')?.value) || 0, matricule: document.getElementById('serverMatricule')?.value || '', photo: photoData, present: false, presentDays: 0 }); saveData(); updateServerSelects(); renderServerStatsByDate(); closeModal('addServerModal'); showToast(`${name} ajouté`); }
function editServer(id) { const server = window.servers.find(s => s.id == id); if(!server) return; const modalHtml = `<div class="modal-overlay" id="editServerModal"><div class="modal"><h3>Modifier serveur</h3><input type="hidden" id="editServerId" value="${id}"><div class="form-group"><label>Nom complet</label><input type="text" id="editServerFullName" value="${server.name}"></div><div class="form-group"><label>Poste</label><input type="text" id="editServerPosition" value="${server.position}"></div><div class="form-group"><label>Date début</label><input type="date" id="editServerStartDate" value="${server.startDate || ''}"></div><div class="form-group"><label>Salaire fixe / mois</label><input type="number" id="editServerFixedSalary" value="${server.fixedSalary || 0}" oninput="calculateEditServerSalary()"></div><div class="form-row"><div class="form-group"><label>Salaire / jour</label><input type="number" id="editServerDailySalary" value="${server.dailySalary || 0}" readonly></div><div class="form-group"><label>Salaire / heure</label><input type="number" id="editServerHourlySalary" value="${server.hourlySalary || 0}" readonly></div></div><div class="form-group"><label>Matricule</label><input type="text" id="editServerMatricule" value="${server.matricule || ''}"></div><div class="form-group"><label>Photo</label><input type="file" id="editServerPhoto" accept="image/*"></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('editServerModal')">Annuler</button><button class="btn btn-success" onclick="saveEditServer()">Enregistrer</button></div></div></div>`; if(!document.getElementById('editServerModal')) document.body.insertAdjacentHTML('beforeend', modalHtml); document.getElementById('editServerModal')?.classList.add('active'); calculateEditServerSalary(); }
function calculateEditServerSalary() { const fixed = parseInt(document.getElementById('editServerFixedSalary')?.value) || 0; const days = settings.workDaysPerMonth || 30; const hours = settings.workHoursPerDay || 8; const dailySalary = document.getElementById('editServerDailySalary'); const hourlySalary = document.getElementById('editServerHourlySalary'); if(dailySalary) dailySalary.value = Math.round(fixed / days); if(hourlySalary) hourlySalary.value = Math.round(fixed / days / hours); }
async function saveEditServer() { const id = parseInt(document.getElementById('editServerId')?.value); const server = window.servers.find(s => s.id === id); if(!server) return; server.name = document.getElementById('editServerFullName')?.value || server.name; server.position = document.getElementById('editServerPosition')?.value || server.position; server.startDate = document.getElementById('editServerStartDate')?.value || server.startDate; server.fixedSalary = parseInt(document.getElementById('editServerFixedSalary')?.value) || 0; server.dailySalary = parseInt(document.getElementById('editServerDailySalary')?.value) || 0; server.hourlySalary = parseInt(document.getElementById('editServerHourlySalary')?.value) || 0; server.matricule = document.getElementById('editServerMatricule')?.value || server.matricule; const photoFile = document.getElementById('editServerPhoto')?.files[0]; if(photoFile) server.photo = await compressPhoto(photoFile); saveData(); updateServerSelects(); renderServerStatsByDate(); closeModal('editServerModal'); showToast('Serveur modifié'); }

function exportDashboardPDF() { const doc = generateProfessionalPDF('État du Stock', ['N°', 'Article', 'Code', 'Type', 'Prix', 'Dépôt', 'Comptoir', 'Total'], items.filter(i => !i.hidden).map((i, idx) => [idx + 1, i.name, i.barcode || '-', i.type, formatFC(i.price), i.depotStock || 0, i.comptoirStock || 0, getRemainingStock(i)])); doc.save('dashboard.pdf'); showToast('PDF exporté'); }
function exportInventoryPDF() { const doc = generateProfessionalPDF('Inventaire', ['N°', 'Article', 'Code', 'Type', 'Prix', 'Dépôt', 'Comptoir', 'Total'], items.filter(i => !i.hidden).map((i, idx) => [idx + 1, i.name, i.barcode || '-', i.type, formatFC(i.price), i.depotStock || 0, i.comptoirStock || 0, getRemainingStock(i)])); doc.save('inventaire.pdf'); showToast('PDF exporté'); }
function exportHistoryPDF() { const doc = generateProfessionalPDF('Historique des ventes', ['N°', 'Date', 'Serveur', 'Total'], salesHistory.slice(-50).map(s => [`N°${String(s.id).padStart(5, '0')}`, formatDate(s.date), s.server.name || s.server, formatFC(s.grandTotal)])); doc.save('historique.pdf'); showToast('PDF exporté'); }
function exportHistoryExcel() { const wsData = [['N°', 'Date', 'Serveur', 'Total']]; salesHistory.slice(-100).forEach(s => wsData.push([`N°${String(s.id).padStart(5, '0')}`, formatDate(s.date), s.server.name || s.server, formatFC(s.grandTotal)])); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), 'Historique'); XLSX.writeFile(wb, 'historique.xlsx'); showToast('Excel exporté'); }
function exportServersPDF() { const doc = generateProfessionalPDF('Liste des serveurs', ['Nom', 'Poste', 'Début', 'Salaire/jour', 'Présences'], window.servers.map(s => [s.name, s.position, s.startDate, formatFC(s.dailySalary || 0), `${s.presentDays || 0}/${settings.workDaysPerMonth}`])); doc.save('serveurs.pdf'); showToast('PDF exporté'); }
function exportSalaryPDF() { const doc = generateProfessionalPDF('Salaires', ['Serveur', 'Jours prés.', 'Salaire/jour', 'Gagné', 'En entente'], window.servers.map(s => { const earned = (s.dailySalary || 0) * (s.presentDays || 0); const monthly = (s.dailySalary || 0) * settings.workDaysPerMonth; return [s.name, `${s.presentDays || 0}/${settings.workDaysPerMonth}`, formatFC(s.dailySalary || 0), formatFC(earned), formatFC(monthly - earned)]; })); doc.save('salaires.pdf'); showToast('PDF exporté'); }
function generateProfessionalPDF(title, headers, body, orientation = 'portrait') { const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation: orientation }); if(companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15); doc.setFontSize(14); doc.text(companyInfo.name, 30, 12); doc.setFontSize(8); doc.text(`${companyInfo.address} | ${companyInfo.phone}`, 30, 17); const legalInfo = getCompanyLegalInfo(); if(legalInfo) doc.text(legalInfo, 30, 22); doc.text(`Généré par: ${userProfile?.fullName || currentUser} - ${getCurrentDateFormatted()}`, 30, legalInfo ? 27 : 22); doc.setFontSize(12); doc.text(title, 10, legalInfo ? 37 : 32); doc.autoTable({ startY: legalInfo ? 43 : 38, head: [headers], body: body, styles: { fontSize: 7 } }); return doc; }
function showDetailsModalLocal() { showDetailsModal('Ventes Locales', window._dashboardLocalItems || []); }
function showDetailsModalImport() { showDetailsModal('Ventes Importées', window._dashboardImportItems || []); }
function showAlertsModal() { const alertItems = items.filter(i => getRemainingStock(i) <= (i.type === 'local' ? settings.localThreshold : settings.importeThreshold) && !i.hidden); showDetailsModal('Alertes Stock Bas', alertItems.map(i => ({ name: i.name, type: i.type, depot: i.depotStock || 0, comptoir: i.comptoirStock || 0, total: getRemainingStock(i), seuil: i.type === 'local' ? settings.localThreshold : settings.importeThreshold })), ['Article', 'Type', 'Dépôt', 'Comptoir', 'Total', 'Seuil']); }
function openDebtDetailsModal() { const pendingDebts = debts.filter(d => d.status === 'pending'); showDetailsModal('Dettes en cours', pendingDebts.map(d => ({ client: d.clientName, article: d.itemName, qty: d.qty, valeur: formatFC(d.value), dateLimite: d.dueDate || '-', serveur: d.serverName || '-' })), ['Client', 'Article', 'Qté', 'Valeur', 'Date limite', 'Serveur']); }
function openLossesDetailsModal() { const all = [...losses.map(l => ({ ...l, type: 'Perte' })), ...expenses.map(e => ({ ...e, type: 'Dépense' }))].slice(-20); showDetailsModal('Pertes et Dépenses', all.map(l => ({ date: formatDate(l.date), type: l.type, description: l.itemName || l.description, valeur: formatFC(l.value || l.amount || 0) })), ['Date', 'Type', 'Description', 'Valeur']); }
function showDetailsModal(title, data, customHeaders = null) { if(!data || data.length === 0) { showToast('Aucune donnée'); return; } const headers = customHeaders || Object.keys(data[0]); let html = `<h4>${title}</h4><table style="width:100%"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`; data.forEach(item => { html += '<tr>'; headers.forEach(h => { let value = item[h]; if(typeof value === 'number' && !h.toLowerCase().includes('date')) value = formatFC(value); html += `<td style="text-align:left">${value || '-'}</td>`; }); html += '</tr>'; }); html += '</tbody></table>'; document.getElementById('detailsModalTitle').textContent = title; document.getElementById('detailsModalContent').innerHTML = html; document.getElementById('detailsModal').classList.add('active'); }

let attendanceRecords = [], faceStream = null, faceApiLoaded = false, faceCameraFacing = "user";
async function openFaceRecognitionModal() { const modalHtml = `<div class="modal-overlay" id="faceModal"><div class="modal"><h3><i class="fas fa-face-smile"></i> Reconnaissance faciale</h3><div class="face-recognition-container"><video id="faceVideo" class="face-video" autoplay playsinline></video><button class="camera-switch-btn" onclick="switchFaceCamera()"><i class="fas fa-sync-alt"></i></button></div><div class="face-result" id="faceResult"></div><div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('faceModal'); stopFaceRecognition()">Fermer</button><button class="btn btn-success" onclick="markAttendance()">Pointer</button></div></div></div>`; if(!document.getElementById('faceModal')) document.body.insertAdjacentHTML('beforeend', modalHtml); document.getElementById('faceModal')?.classList.add('active'); faceCameraFacing = "user"; try { faceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: faceCameraFacing } }); const video = document.getElementById('faceVideo'); if(video) video.srcObject = faceStream; if(!faceApiLoaded) { await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'); await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'); await faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'); faceApiLoaded = true; } } catch(e) { showToast('Erreur caméra: ' + e.message, 'error'); } }
async function switchFaceCamera() { if(faceStream) { faceStream.getTracks().forEach(t => t.stop()); faceStream = null; } faceCameraFacing = faceCameraFacing === "user" ? "environment" : "user"; try { faceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: faceCameraFacing } }); const video = document.getElementById('faceVideo'); if(video) video.srcObject = faceStream; } catch(e) { showToast('Erreur caméra: ' + e.message, 'error'); } }
function stopFaceRecognition() { if(faceStream) { faceStream.getTracks().forEach(t => t.stop()); faceStream = null; } }
function findServerByName(input) { const search = input.toLowerCase().trim(); return window.servers.find(s => s.name.toLowerCase().includes(search) || s.name.split(' ')[0].toLowerCase().includes(search) || s.name.split(' ').slice(-1)[0].toLowerCase().includes(search)); }
async function markAttendance() { const video = document.getElementById('faceVideo'); if(!video || !faceStream) { showToast('Caméra non disponible'); return; } const name = prompt('Entrez votre nom pour le pointage:'); if(!name) return; const server = findServerByName(name); if(!server) { showToast('Serveur non trouvé', 'error'); return; } const today = new Date().toISOString().split('T')[0]; const alreadyChecked = attendanceRecords.some(r => r.serverId === server.id && r.date === today && r.type === 'in'); if(alreadyChecked) { showToast(`${server.name} déjà pointé aujourd'hui`, 'warning'); closeModal('faceModal'); stopFaceRecognition(); return; } server.present = true; server.presentDays = (server.presentDays || 0) + 1; attendanceRecords.push({ serverId: server.id, serverName: server.name, type: 'in', date: today, time: new Date().toISOString() }); saveData(); renderServerStatsByDate(); showToast(`${server.name} pointé avec succès`); closeModal('faceModal'); stopFaceRecognition(); }
