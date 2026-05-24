// ============================================
// KITCHEN - Gestion des commandes cuisine
// ============================================

let kitchenOrders = [];
let kitchenItems = [];

const kitchenDefaultItems = [
    { id: 1001, name: "Poulet Braisé", price: 8000, type: "plat", category: "grillade", prepTime: 15, stock: 50, unit: "portion" },
    { id: 1002, name: "Poisson Frit", price: 10000, type: "plat", category: "friture", prepTime: 12, stock: 30, unit: "portion" },
    { id: 1003, name: "Frites", price: 3000, type: "plat", category: "accompagnement", prepTime: 8, stock: 100, unit: "portion" },
    { id: 1004, name: "Salade", price: 2500, type: "plat", category: "entrée", prepTime: 5, stock: 80, unit: "portion" },
    { id: 1005, name: "Glace Vanille", price: 2000, type: "dessert", category: "glace", prepTime: 2, stock: 40, unit: "boules" },
    { id: 1006, name: "Tiramisu", price: 3500, type: "dessert", category: "patisserie", prepTime: 5, stock: 20, unit: "part" },
    { id: 1007, name: "Café", price: 1500, type: "boisson_chaude", category: "café", prepTime: 3, stock: 200, unit: "tasse" },
    { id: 1008, name: "Thé à la menthe", price: 2000, type: "boisson_chaude", category: "thé", prepTime: 4, stock: 150, unit: "verre" }
];

function initKitchen() {
    window.kitchenOrders = kitchenOrders;
    window.kitchenItems = kitchenItems;
    window.renderKitchenOrders = renderKitchenOrders;
    window.addToKitchen = addToKitchen;
    window.updateKitchenOrderStatus = updateKitchenOrderStatus;
    window.renderKitchenInventory = renderKitchenInventory;
    window.addKitchenItem = addKitchenItem;
    window.updateKitchenItem = updateKitchenItem;
    window.deleteKitchenItem = deleteKitchenItem;
    window.updateKitchenBadge = updateKitchenBadge;
    
    if(kitchenItems.length === 0) kitchenItems = [...kitchenDefaultItems];
    loadKitchenTabContent();
}

function loadKitchenTabContent() {
    const kitchenTab = document.getElementById('tab-kitchen');
    if(!kitchenTab) return;
    
    kitchenTab.innerHTML = `
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
    `;
    
    renderKitchenOrders();
    renderKitchenInventory();
    renderKitchenStats();
}

function switchKitchenView(view) {
    document.querySelectorAll('.kitchen-view').forEach(v => v.style.display = 'none');
    document.getElementById(`kitchen${view.charAt(0).toUpperCase() + view.slice(1)}View`).style.display = 'block';
    document.querySelectorAll('#tab-kitchen .btn-outline, #tab-kitchen .btn-primary').forEach(btn => btn.classList.remove('active'));
    if(view === 'orders') document.querySelector('#tab-kitchen .btn-primary')?.classList.add('active');
    else document.querySelector(`#tab-kitchen .btn-outline[onclick="switchKitchenView('${view}')"]`)?.classList.add('active');
}

function addToKitchen(saleId, items, tables) {
    const newOrder = {
        id: Date.now(),
        saleId: saleId,
        tables: tables || [1],
        items: items.map(i => ({ ...i, status: 'pending' })),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    kitchenOrders.unshift(newOrder);
    saveData();
    renderKitchenOrders();
    updateKitchenBadge();
    showToast(`Commande cuisine #${newOrder.id} reçue`);
}

function renderKitchenOrders() {
    const container = document.getElementById('kitchenOrdersList');
    if(!container) return;
    
    const statusFilter = document.getElementById('kitchenStatusFilter')?.value || 'all';
    const dateFilter = document.getElementById('kitchenDateFilter')?.value;
    
    let filtered = [...kitchenOrders];
    if(statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    if(dateFilter) filtered = filtered.filter(o => o.createdAt.split('T')[0] === dateFilter);
    
    if(filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucune commande cuisine</div>';
        return;
    }
    
    container.innerHTML = filtered.map(order => `
        <div class="kitchen-order-card status-${order.status}">
            <div class="kitchen-order-header">
                <span><i class="fas fa-receipt"></i> Commande #${order.id}</span>
                <span class="badge-${order.status === 'pending' ? 'warning' : order.status === 'preparing' ? 'info' : order.status === 'ready' ? 'success' : 'muted'}">
                    ${order.status === 'pending' ? 'En attente' : order.status === 'preparing' ? 'En préparation' : order.status === 'ready' ? 'Prêt' : 'Servi'}
                </span>
            </div>
            <div class="kitchen-order-header">
                <small><i class="fas fa-clock"></i> ${formatDate(order.createdAt)}</small>
                <small><i class="fas fa-table"></i> Tables: ${order.tables.join(', ')}</small>
            </div>
            <ul class="kitchen-order-items">
                ${order.items.map(item => `<li>${item.qty}x ${item.name} ${item.note ? `(${item.note})` : ''}</li>`).join('')}
            </ul>
            <div class="kitchen-order-actions">
                ${order.status === 'pending' ? `<button class="btn btn-info btn-sm" onclick="updateKitchenOrderStatus(${order.id}, 'preparing')"><i class="fas fa-fire"></i> Préparer</button>` : ''}
                ${order.status === 'preparing' ? `<button class="btn btn-success btn-sm" onclick="updateKitchenOrderStatus(${order.id}, 'ready')"><i class="fas fa-check"></i> Prêt</button>` : ''}
                ${order.status === 'ready' ? `<button class="btn btn-primary btn-sm" onclick="updateKitchenOrderStatus(${order.id}, 'served')"><i class="fas fa-hand-peace"></i> Servi</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteKitchenOrder(${order.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function updateKitchenOrderStatus(orderId, newStatus) {
    const order = kitchenOrders.find(o => o.id === orderId);
    if(order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        saveData();
        renderKitchenOrders();
        updateKitchenBadge();
        showToast(`Commande #${orderId} ${newStatus === 'preparing' ? 'en préparation' : newStatus === 'ready' ? 'prête' : 'servie'}`);
        logActivity('Cuisine', `Commande #${orderId} → ${newStatus}`);
    }
}

function deleteKitchenOrder(orderId) {
    if(confirm('Supprimer cette commande cuisine ?')) {
        kitchenOrders = kitchenOrders.filter(o => o.id !== orderId);
        saveData();
        renderKitchenOrders();
        updateKitchenBadge();
        showToast('Commande supprimée');
    }
}

function filterKitchenOrders() { renderKitchenOrders(); }

function updateKitchenBadge() {
    const pendingCount = kitchenOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const badge = document.getElementById('kitchenBadge');
    if(badge) { badge.textContent = pendingCount; badge.style.display = pendingCount > 0 ? 'inline' : 'none'; }
}

function renderKitchenInventory() {
    const container = document.getElementById('kitchenInventoryTable');
    if(!container) return;
    const search = document.getElementById('kitchenInventorySearch')?.value.toLowerCase() || '';
    const filtered = kitchenItems.filter(i => i.name.toLowerCase().includes(search));
    
    container.innerHTML = filtered.map(item => `
        <tr>
            <td><strong>${item.name}</strong><br><small>${item.type}</small></td>
            <td>${item.category}</td>
            <td>${formatFC(item.price)}</td>
            <td>${item.prepTime} min</td>
            <td>${item.stock || 0} ${item.unit}</td>
            <td>${item.unit}</td>
            <td><button class="btn btn-info btn-sm" onclick="openEditKitchenItemModal(${item.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteKitchenItem(${item.id})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function addKitchenItem(item) {
    kitchenItems.push({ ...item, id: Date.now() });
    saveData();
    renderKitchenInventory();
    showToast(`${item.name} ajouté à la cuisine`);
}

function updateKitchenItem(id, updates) {
    const index = kitchenItems.findIndex(i => i.id === id);
    if(index !== -1) { kitchenItems[index] = { ...kitchenItems[index], ...updates }; saveData(); renderKitchenInventory(); showToast('Article modifié'); }
}

function deleteKitchenItem(id) {
    if(confirm('Supprimer cet article de cuisine ?')) {
        kitchenItems = kitchenItems.filter(i => i.id !== id);
        saveData();
        renderKitchenInventory();
        showToast('Article supprimé');
    }
}

function openAddKitchenItemModal() {
    const modalHtml = `<div class="modal-overlay" id="addKitchenItemModal"><div class="modal"><h3>Ajouter article cuisine</h3>
        <div class="form-group"><label>Nom</label><input type="text" id="kitchenItemName"></div>
        <div class="form-row"><div class="form-group"><label>Prix</label><input type="number" id="kitchenItemPrice"></div><div class="form-group"><label>Type</label><select id="kitchenItemType"><option value="plat">Plat</option><option value="dessert">Dessert</option><option value="boisson_chaude">Boisson chaude</option></select></div></div>
        <div class="form-row"><div class="form-group"><label>Catégorie</label><input type="text" id="kitchenItemCategory" placeholder="grillade, friture..."></div><div class="form-group"><label>Temps prép. (min)</label><input type="number" id="kitchenItemPrepTime" value="10"></div></div>
        <div class="form-row"><div class="form-group"><label>Stock initial</label><input type="number" id="kitchenItemStock" value="0"></div><div class="form-group"><label>Unité</label><input type="text" id="kitchenItemUnit" value="portion"></div></div>
        <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('addKitchenItemModal')">Annuler</button><button class="btn btn-success" onclick="saveNewKitchenItem()">Ajouter</button></div></div></div>`;
    if(!document.getElementById('addKitchenItemModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('addKitchenItemModal')?.classList.add('active');
}

function saveNewKitchenItem() {
    const name = document.getElementById('kitchenItemName')?.value;
    if(!name) { showToast('Nom requis'); return; }
    addKitchenItem({
        name: name, price: parseInt(document.getElementById('kitchenItemPrice')?.value) || 0,
        type: document.getElementById('kitchenItemType')?.value || 'plat',
        category: document.getElementById('kitchenItemCategory')?.value || 'autre',
        prepTime: parseInt(document.getElementById('kitchenItemPrepTime')?.value) || 10,
        stock: parseInt(document.getElementById('kitchenItemStock')?.value) || 0,
        unit: document.getElementById('kitchenItemUnit')?.value || 'portion'
    });
    closeModal('addKitchenItemModal');
}

function openEditKitchenItemModal(id) {
    const item = kitchenItems.find(i => i.id === id);
    if(!item) return;
    const modalHtml = `<div class="modal-overlay" id="editKitchenItemModal"><div class="modal"><h3>Modifier article cuisine</h3><input type="hidden" id="editKitchenItemId" value="${id}">
        <div class="form-group"><label>Nom</label><input type="text" id="editKitchenItemName" value="${item.name}"></div>
        <div class="form-row"><div class="form-group"><label>Prix</label><input type="number" id="editKitchenItemPrice" value="${item.price}"></div><div class="form-group"><label>Type</label><select id="editKitchenItemType"><option value="plat" ${item.type === 'plat' ? 'selected' : ''}>Plat</option><option value="dessert" ${item.type === 'dessert' ? 'selected' : ''}>Dessert</option><option value="boisson_chaude" ${item.type === 'boisson_chaude' ? 'selected' : ''}>Boisson chaude</option></select></div></div>
        <div class="form-row"><div class="form-group"><label>Catégorie</label><input type="text" id="editKitchenItemCategory" value="${item.category}"></div><div class="form-group"><label>Temps prép. (min)</label><input type="number" id="editKitchenItemPrepTime" value="${item.prepTime}"></div></div>
        <div class="form-row"><div class="form-group"><label>Stock</label><input type="number" id="editKitchenItemStock" value="${item.stock}"></div><div class="form-group"><label>Unité</label><input type="text" id="editKitchenItemUnit" value="${item.unit}"></div></div>
        <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('editKitchenItemModal')">Annuler</button><button class="btn btn-success" onclick="updateExistingKitchenItem()">Enregistrer</button></div></div></div>`;
    if(!document.getElementById('editKitchenItemModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('editKitchenItemModal')?.classList.add('active');
}

function updateExistingKitchenItem() {
    const id = parseInt(document.getElementById('editKitchenItemId')?.value);
    updateKitchenItem(id, {
        name: document.getElementById('editKitchenItemName')?.value,
        price: parseInt(document.getElementById('editKitchenItemPrice')?.value) || 0,
        type: document.getElementById('editKitchenItemType')?.value,
        category: document.getElementById('editKitchenItemCategory')?.value,
        prepTime: parseInt(document.getElementById('editKitchenItemPrepTime')?.value) || 10,
        stock: parseInt(document.getElementById('editKitchenItemStock')?.value) || 0,
        unit: document.getElementById('editKitchenItemUnit')?.value
    });
    closeModal('editKitchenItemModal');
}

function renderKitchenStats() {
    const statsGrid = document.getElementById('kitchenStatsGrid');
    const statsTable = document.getElementById('kitchenStatsTable');
    if(!statsGrid) return;
    
    const completedOrders = kitchenOrders.filter(o => o.status === 'served');
    const totalOrders = completedOrders.length;
    const totalValue = completedOrders.reduce((sum, order) => sum + order.items.reduce((s, i) => s + (i.price || 0) * i.qty, 0), 0);
    
    let totalPrepTime = 0;
    completedOrders.forEach(order => {
        const orderTime = order.items.reduce((max, item) => Math.max(max, item.prepTime || 10), 0);
        totalPrepTime += orderTime;
    });
    const avgPrepTime = totalOrders > 0 ? Math.round(totalPrepTime / totalOrders) : 0;
    
    statsGrid.innerHTML = `
        <div class="stat-card"><i class="fas fa-receipt"></i><div class="stat-value">${totalOrders}</div><div class="stat-label">Commandes servies</div></div>
        <div class="stat-card"><i class="fas fa-clock"></i><div class="stat-value">${avgPrepTime} min</div><div class="stat-label">Temps moyen</div></div>
        <div class="stat-card"><i class="fas fa-chart-line"></i><div class="stat-value">${formatFC(totalValue)}</div><div class="stat-label">Chiffre d'affaires</div></div>
    `;
    
    const last7Days = [];
    for(let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7Days.push(d.toISOString().split('T')[0]); }
    const statsData = last7Days.map(date => {
        const dayOrders = kitchenOrders.filter(o => o.createdAt.split('T')[0] === date && o.status === 'served');
        const dayTotal = dayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.price || 0) * i.qty, 0), 0);
        let dayPrepTime = 0;
        dayOrders.forEach(o => { const maxPrep = o.items.reduce((max, i) => Math.max(max, i.prepTime || 10), 0); dayPrepTime += maxPrep; });
        return [date, dayOrders.length, dayOrders.length > 0 ? Math.round(dayPrepTime / dayOrders.length) : 0, formatFC(dayTotal)];
    });
    statsTable.innerHTML = statsData.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
}

function exportKitchenOrdersPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    if(companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15);
    doc.setFontSize(14); doc.text(companyInfo.name, 30, 12);
    doc.setFontSize(8); doc.text(`Commandes cuisine - ${getCurrentDateFormatted()}`, 30, 17);
    
    const statusFilter = document.getElementById('kitchenStatusFilter')?.value || 'all';
    const dateFilter = document.getElementById('kitchenDateFilter')?.value;
    let filtered = [...kitchenOrders];
    if(statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    if(dateFilter) filtered = filtered.filter(o => o.createdAt.split('T')[0] === dateFilter);
    
    doc.autoTable({ startY: 25, head: [['ID', 'Date', 'Tables', 'Statut', 'Articles']], body: filtered.map(o => [o.id, formatDate(o.createdAt), o.tables.join(', '), o.status, o.items.map(i => `${i.qty}x ${i.name}`).join(', ')]) });
    doc.save('commandes_cuisine.pdf');
    showToast('PDF exporté');
}