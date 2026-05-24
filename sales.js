// ============================================
// SALES - Caisse, paniers, ventes, dettes
// ============================================

let salesHistory = [];
let debts = [];
let carts = [[], [], [], [], [], [], [], [], [], []];
let currentCartIndex = 0;
let cartServers = ['', '', '', '', '', '', '', '', '', ''];
let cartDates = [];
let pendingSale = null;
let currentReceiptSale = null;
let loyaltyPoints = {};
let reservations = [];
let deliveries = [];
let zones = [{ id: 1, name: "Bar", deliveryFee: 0 }, { id: 2, name: "Terrasse", deliveryFee: 0 }, { id: 3, name: "Salle", deliveryFee: 0 }];
let tables = [];
let tempDebtItems = [];

function initSales() {
    for(let i = 0; i < 10; i++) cartDates[i] = new Date().toISOString().split('T')[0];
    
    window.salesHistory = salesHistory;
    window.debts = debts;
    window.carts = carts;
    window.currentCartIndex = currentCartIndex;
    window.cartServers = cartServers;
    window.cartDates = cartDates;
    window.loyaltyPoints = loyaltyPoints;
    window.reservations = reservations;
    window.deliveries = deliveries;
    window.zones = zones;
    window.tables = tables;
    window.tempDebtItems = tempDebtItems;
    
    window.renderSaleItems = renderSaleItems;
    window.filterSaleItems = filterSaleItems;
    window.addToCart = addToCart;
    window.updateCartQty = updateCartQty;
    window.incrementVip = incrementVip;
    window.decrementVip = decrementVip;
    window.togglePaid = togglePaid;
    window.clearCart = clearCart;
    window.validateSale = validateSale;
    window.processPayment = processPayment;
    window.showReceipt = showReceipt;
    window.printReceipt = printReceipt;
    window.restoreToCart = restoreToCart;
    window.nextCart = nextCart;
    window.previousCart = previousCart;
    window.addNewCart = addNewCart;
    window.updateCart = updateCart;
    window.updateServerSelects = updateServerSelects;
    window.updateCartDate = updateCartDate;
    window.updateServerPhoto = updateServerPhoto;
    window.openDebtModal = openDebtModal;
    window.filterDebts = filterDebts;
    window.settleDebt = settleDebt;
    window.exportDebtsPDF = exportDebtsPDF;
    window.openLoyaltyModal = openLoyaltyModal;
    window.addLoyaltyPoints = addLoyaltyPoints;
    window.useLoyaltyPoints = useLoyaltyPoints;
    window.openReservationModal = openReservationModal;
    window.openDeliveryModal = openDeliveryModal;
    window.addZone = addZone;
    window.addTable = addTable;
    window.sendToKitchen = sendToKitchen;
    window.scrollToCart = scrollToCart;
    window.updateCartIndicator = updateCartIndicator;
    window.updateAllCartsTotal = updateAllCartsTotal;
    window.saveCurrentCart = saveCurrentCart;
    window.updateCartDateInput = updateCartDateInput;
    
    loadSalesTabContent();
}

function loadSalesTabContent() {
    const salesTab = document.getElementById('tab-sales');
    if(!salesTab) return;
    
    salesTab.innerHTML = `
        <div class="sale-panel">
            <div>
                <div class="search-bar">
                    <input type="text" id="saleSearch" placeholder="🔍 Rechercher un article..." oninput="filterSaleItems()">
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
                <div class="item-grid" id="saleItemGrid">
                    <div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Chargement des articles...</p></div>
                </div>
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
    `;
    
    // Initialiser les sélecteurs après avoir créé le HTML
    updateServerSelects();
    initTables();
    
    // Attendre un peu puis afficher les articles
    setTimeout(() => {
        renderSaleItems();
        updateCart();
    }, 100);
}

function initTables() {
    if(tables.length === 0) {
        for(let i = 1; i <= 20; i++) tables.push({ id: i, number: i, capacity: 4, zone: i <= 8 ? "Bar" : i <= 14 ? "Terrasse" : "Salle", status: "free" });
    }
}

function renderSaleItems() {
    // Attendre que l'élément existe
    let container = document.getElementById('saleItemGrid');
    let attempts = 0;
    const maxAttempts = 20;
    
    function tryRender() {
        container = document.getElementById('saleItemGrid');
        
        if(!container) {
            attempts++;
            if(attempts < maxAttempts) {
                console.log(`⏳ Attente du chargement de saleItemGrid... (tentative ${attempts})`);
                setTimeout(tryRender, 200);
            } else {
                console.error('❌ saleItemGrid non trouvé après plusieurs tentatives');
            }
            return;
        }
        
        console.log('✅ saleItemGrid trouvé, affichage des articles...');
        
        // Vérifier si window.items existe
        if(!window.items) {
            console.log('⏳ window.items non disponible, réessai...');
            setTimeout(tryRender, 500);
            return;
        }
        
        if(window.items.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin empty-icon"></i><p>Chargement des articles...</p></div>';
            if(typeof initializeDefaultData === 'function') {
                initializeDefaultData().then(() => {
                    renderSaleItems();
                });
            }
            return;
        }
        
        const search = document.getElementById('saleSearch')?.value.toLowerCase() || '';
        const filter = document.getElementById('saleFilter')?.value || 'all';
        const filtered = window.items.filter(i => i.name.toLowerCase().includes(search) && (filter === 'all' || i.type === filter) && !i.hidden);
        const cart = carts[currentCartIndex] || [];
        
        if(filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-search empty-icon"></i><p>Aucun article trouvé</p></div>';
            return;
        }
        
        container.innerHTML = filtered.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            const remaining = getRemainingStock(item);
            return `<div class="item-card ${remaining <= 0 ? 'out-of-stock' : ''} ${inCart ? 'selected' : ''}" onclick="${remaining > 0 ? `addToCart(${item.id})` : ''}">
                <img src="${item.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'%3E%3Crect width=\'60\' height=\'60\' fill=\'%232a3344\'/%3E%3Ctext x=\'30\' y=\'38\' text-anchor=\'middle\' fill=\'%238a94a6\' font-size=\'20\'%3E📦%3C/text%3E%3C/svg%3E'}" class="item-photo" onclick="event.stopPropagation(); showArticleDetails(${item.id})">
                <div class="item-info">
                    <div class="item-name">${escapeHtml(item.name)}</div>
                    <div class="item-price">${formatFC(item.price)}</div>
                    <div class="item-stocks">🏠 Dépôt: ${item.depotStock || 0} | 🏪 Comptoir: ${item.comptoirStock || 0}</div>
                    ${inCart ? `<div style="color:var(--accent); margin-top:0.25rem;">🛒 x${inCart.qty}</div>` : ''}
                </div>
            </div>`;
        }).join('');
    }
    
    tryRender();
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function filterSaleItems() { renderSaleItems(); }

function addToCart(id) {
    // Utiliser window.items
    const item = window.items.find(i => i.id === id);
    if(!item) {
        console.error('Article non trouvé:', id);
        return;
    }
    const remaining = getRemainingStock(item);
    if(remaining <= 0) {
        showToast(`Stock insuffisant pour ${item.name}`, 'error');
        return;
    }
    const existing = carts[currentCartIndex].find(c => c.id === id);
    if(existing) {
        existing.qty++;
    } else {
        carts[currentCartIndex].push({ id, qty: 1, vipCount: 0, paid: true });
    }
    renderSaleItems();
    updateCart();
    showToast(`${item.name} ajouté au panier`, 'success');
}

function updateCartQty(id, delta) {
    const item = carts[currentCartIndex].find(c => c.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) carts[currentCartIndex] = carts[currentCartIndex].filter(c => c.id !== id);
        if(item.vipCount > item.qty) item.vipCount = item.qty;
        renderSaleItems();
        updateCart();
    }
}

function incrementVip(id) {
    const item = carts[currentCartIndex].find(c => c.id === id);
    if(item && item.vipCount < item.qty) { item.vipCount++; updateCart(); }
}

function decrementVip(id) {
    const item = carts[currentCartIndex].find(c => c.id === id);
    if(item && item.vipCount > 0) { item.vipCount--; updateCart(); }
}

function togglePaid(id) {
    const item = carts[currentCartIndex].find(c => c.id === id);
    if(item) { item.paid = !item.paid; updateCart(); }
}

function clearCart() {
    if(carts[currentCartIndex].length === 0) return;
    if(confirm('Annuler le panier ?')) { carts[currentCartIndex] = []; renderSaleItems(); updateCart(); showToast('Panier annulé'); }
}

function updateCart() {
    const cart = carts[currentCartIndex] || [];
    const cartEl = document.getElementById('cartItems');
    const totalsEl = document.getElementById('cartTotals');
    
    if(cartEl && cart.length === 0) {
        cartEl.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-cart empty-icon"></i><p>Panier vide</p></div>`;
        if(totalsEl) totalsEl.style.display = 'none';
        return;
    }
    
    let subtotal = 0, vipTotal = 0;
    cartEl.innerHTML = cart.map(ci => {
        const item = window.items.find(i => i.id === ci.id);
        if(!item) return '';
        const itemTotal = item.price * ci.qty;
        subtotal += itemTotal;
        const vipSurcharge = getVipSurcharge(item.price) * (ci.vipCount || 0);
        vipTotal += vipSurcharge;
        return `<div class="cart-item">
            <div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-detail">${formatFC(item.price)} x ${ci.qty}</div></div>
            <div class="cart-item-qty"><button onclick="updateCartQty(${item.id}, -1)">−</button><span>${ci.qty}</span><button onclick="updateCartQty(${item.id}, 1)">+</button></div>
            <div class="cart-item-vip"><button onclick="decrementVip(${item.id})">−</button><span>${ci.vipCount || 0}</span><button onclick="incrementVip(${item.id})">+</button></div>
            <div class="cart-item-paid"><input type="checkbox" ${ci.paid !== false ? 'checked' : ''} onchange="togglePaid(${item.id})" title="Payé"></div>
            <div class="cart-item-total">${formatFC(itemTotal + vipSurcharge)}</div>
        </div>`;
    }).join('');
    
    document.getElementById('cartSubtotal').textContent = formatFC(subtotal);
    document.getElementById('cartVipSurcharge').textContent = formatFC(vipTotal);
    document.getElementById('cartTotal').textContent = formatFC(subtotal + vipTotal);
    document.getElementById('vipSurchargeRow').style.display = vipTotal > 0 ? 'flex' : 'none';
    if(totalsEl) totalsEl.style.display = 'block';
    updateAllCartsTotal();
}

function updateAllCartsTotal() {
    let total = 0;
    carts.forEach(cart => cart.forEach(ci => {
        const item = window.items.find(i => i.id === ci.id);
        if(item) total += (item.price * ci.qty) + (getVipSurcharge(item.price) * (ci.vipCount || 0));
    }));
    const allCartsTotal = document.getElementById('allCartsTotal');
    if(allCartsTotal) allCartsTotal.textContent = formatFC(total);
}

function nextCart() {
    if(currentCartIndex < 9) { saveCurrentCart(); currentCartIndex++; renderSaleItems(); updateCart(); updateServerSelects(); updateCartDateInput(); }
    updateCartIndicator();
}

function previousCart() {
    if(currentCartIndex > 0) { saveCurrentCart(); currentCartIndex--; renderSaleItems(); updateCart(); updateServerSelects(); updateCartDateInput(); }
    updateCartIndicator();
}

function addNewCart() {
    if(carts.length < 10) {
        saveCurrentCart();
        carts.push([]); 
        cartServers.push(''); 
        cartDates.push(new Date().toISOString().split('T')[0]);
        currentCartIndex = carts.length - 1;
        renderSaleItems(); 
        updateCart(); 
        updateServerSelects(); 
        updateCartDateInput();
        updateCartIndicator();
    } else showToast('Maximum 10 paniers');
}

function saveCurrentCart() { carts[currentCartIndex] = [...(carts[currentCartIndex] || [])]; }

function updateCartIndicator() { 
    const ci = document.getElementById('cartIndicator'); 
    if(ci) ci.textContent = `${currentCartIndex + 1}/${carts.length}`; 
    updateAllCartsTotal(); 
}

function updateCartDateInput() { 
    const d = document.getElementById('cartDate'); 
    if(d) d.value = cartDates[currentCartIndex] || new Date().toISOString().split('T')[0]; 
}

function updateCartDate() { 
    cartDates[currentCartIndex] = document.getElementById('cartDate')?.value || new Date().toISOString().split('T')[0]; 
}

function updateServerPhoto() { 
    cartServers[currentCartIndex] = document.getElementById('serverSelect')?.value || ''; 
}

function updateServerSelects() {
    // Sélecteur du panier (serverSelect)
    const serverSelect = document.getElementById('serverSelect');
    if(serverSelect && window.servers) {
        serverSelect.innerHTML = '<option value="">-- Sélectionner un serveur --</option>';
        window.servers.forEach(server => {
            serverSelect.innerHTML += `<option value="${server.id}">${server.name} (${server.position || 'Serveur'})</option>`;
        });
        if(cartServers[currentCartIndex]) {
            serverSelect.value = cartServers[currentCartIndex];
        }
    }
    
    // Sélecteur dette (debtServer)
    const debtServer = document.getElementById('debtServer');
    if(debtServer && window.servers) {
        debtServer.innerHTML = '<option value="">-- Sélectionner un serveur --</option>';
        window.servers.forEach(server => {
            debtServer.innerHTML += `<option value="${server.id}">${server.name} (${server.position || 'Serveur'})</option>`;
        });
    }
    
    // Sélecteur zone réservation
    const reservationZone = document.getElementById('reservationZone');
    if(reservationZone && zones) {
        reservationZone.innerHTML = '<option value="">-- Sélectionner une zone --</option>';
        zones.forEach(z => {
            reservationZone.innerHTML += `<option value="${z.id}">${z.name}</option>`;
        });
    }
    
    // Sélecteur zone livraison
    const deliveryZone = document.getElementById('deliveryZone');
    if(deliveryZone && zones) {
        deliveryZone.innerHTML = '<option value="">-- Sélectionner une zone --</option>';
        zones.forEach(z => {
            deliveryZone.innerHTML += `<option value="${z.id}">${z.name} ${z.deliveryFee > 0 ? `(+${formatFC(z.deliveryFee)})` : ''}</option>`;
        });
    }
    
    // Tables réservation
    const tablesSelect = document.getElementById('reservationTables');
    if(tablesSelect && tables) {
        tablesSelect.innerHTML = '';
        tables.forEach(t => {
            tablesSelect.innerHTML += `<option value="${t.id}">Table ${t.number} (${t.capacity} pers.) - ${t.zone}</option>`;
        });
    }
}

function validateSale() {
    const cart = carts[currentCartIndex] || [];
    if(cart.length === 0) return;
    const serverId = cartServers[currentCartIndex];
    if(!serverId) { showToast('Sélectionnez un serveur'); return; }
    const server = window.servers.find(s => s.id == serverId);
    if(!server) return;
    
    const cartDate = cartDates[currentCartIndex] || new Date().toISOString().split('T')[0];
    const paidItems = cart.filter(ci => ci.paid !== false);
    const unpaidItems = cart.filter(ci => ci.paid === false);
    
    for(const ci of paidItems) {
        const item = window.items.find(i => i.id === ci.id);
        if(ci.qty > (item.comptoirStock || 0)) { showToast(`Stock insuffisant pour ${item.name}`); return; }
    }
    
    if(unpaidItems.length > 0) {
        const clientName = prompt(`Articles impayés - Nom du client:`, "Client Comptoir");
        if(!clientName) { showToast("Enregistrement annulé."); return; }
        unpaidItems.forEach(ci => {
            const item = window.items.find(i => i.id === ci.id);
            if(!item) return;
            const debtValue = (item.price * ci.qty) + (getVipSurcharge(item.price) * (ci.vipCount || 0));
            debts.push({ 
                id: Date.now() + Math.random(), 
                type: 'debt', 
                itemId: item.id, 
                itemName: item.name, 
                qty: ci.qty, 
                clientName, 
                clientPhone: "", 
                reason: `Panier impayé - ${server.name}`, 
                value: debtValue, 
                refundAmount: 0, 
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], 
                date: cartDate + 'T12:00:00', 
                status: 'pending', 
                serverName: server.name 
            });
            if(item.comptoirStock >= ci.qty) {
                item.comptoirStock -= ci.qty;
                if(window.stockMovements) window.stockMovements.push({ 
                    date: cartDate + 'T12:00:00', 
                    type: 'debt', 
                    itemId: item.id, 
                    itemName: item.name, 
                    qty: ci.qty, 
                    value: debtValue, 
                    from: 'Comptoir', 
                    to: `Dette (${clientName})`, 
                    server: server.name 
                });
            }
        });
        showToast(`${unpaidItems.length} article(s) en dette.`);
    }
    
    if(paidItems.length > 0) {
        let subtotal = 0, vipTotal = 0;
        const saleItems = [];
        for(const ci of paidItems) {
            const item = window.items.find(i => i.id === ci.id);
            const itemTotal = item.price * ci.qty;
            subtotal += itemTotal;
            const vipSurcharge = getVipSurcharge(item.price) * (ci.vipCount || 0);
            vipTotal += vipSurcharge;
            saleItems.push({ ...ci, item: item });
        }
        pendingSale = { 
            id: Date.now(), 
            items: saleItems, 
            server: server, 
            subtotal: subtotal, 
            vipSurcharge: vipTotal, 
            grandTotal: subtotal + vipTotal, 
            date: cartDate + 'T' + new Date().toTimeString().slice(0, 8) 
        };
        document.getElementById('paymentAmount').textContent = formatFC(pendingSale.grandTotal);
        document.getElementById('paymentModal')?.classList.add('active');
    } else {
        carts[currentCartIndex] = [];
        cartServers[currentCartIndex] = '';
        if(window.saveData) window.saveData();
        if(window.renderAll) window.renderAll();
        showToast('Dette(s) enregistrée(s).');
    }
}

function processPayment(method) {
    if(!pendingSale) return;
    const sale = pendingSale;
    sale.items.forEach(ci => {
        const item = window.items.find(i => i.id === ci.id);
        if(item) {
            item.comptoirStock -= ci.qty;
            item.sold = (item.sold || 0) + ci.qty;
            if(window.stockMovements) window.stockMovements.push({ 
                date: sale.date, 
                type: 'sale', 
                itemId: item.id, 
                itemName: item.name, 
                qty: ci.qty, 
                value: item.price * ci.qty + getVipSurcharge(item.price) * (ci.vipCount || 0), 
                from: 'Comptoir', 
                to: 'Client', 
                server: sale.server.name 
            });
        }
    });
    sale.paymentMethod = method;
    salesHistory.push(sale);
    
    addLoyaltyPointsForSale(sale);
    
    if(window.saveData) window.saveData();
    showReceipt(sale, method);
    carts[currentCartIndex] = [];
    cartServers[currentCartIndex] = '';
    pendingSale = null;
    document.getElementById('paymentModal')?.classList.remove('active');
    if(window.renderAll) window.renderAll();
    if(window.logActivity) window.logActivity('Vente', `N°${sale.id} - ${formatFC(sale.grandTotal)}`);
}

function showReceipt(sale, method) {
    currentReceiptSale = sale;
    const methodNames = { mobile: 'Mobile Money', visa: 'Visa', mastercard: 'MasterCard', cash: 'Espèces', debt_settlement: 'Règlement Dette' };
    const legalInfo = getCompanyLegalInfo();
    const receiptHtml = `<div class="receipt-small">
        <div class="receipt-logo">${companyInfo.logo ? `<img src="${companyInfo.logo}">` : '🍺'}</div>
        <h3>${companyInfo.name}</h3>
        <p>${companyInfo.slogan}</p>
        <p>${companyInfo.address}</p>
        <p>${companyInfo.phone} | ${companyInfo.email}</p>
        ${legalInfo ? `<p class="company-legal">${legalInfo}</p>` : ''}
        <p>Facture N°${String(sale.id).padStart(5, '0')}</p>
        <p>Date: ${formatDate(sale.date)}</p>
        <p>Serveur: ${sale.server.name}</p>
        <p>Généré par: ${window.userProfile?.fullName || window.currentUser}</p>
        <table><thead><tr><th>Article</th><th>Qté</th><th>Prix U</th><th>Total</th></tr></thead><tbody>
        ${sale.items.map(si => `<tr><td>${si.item?.name}</td><td>${si.qty}${si.vipCount ? '👑x' + si.vipCount : ''}</td><td>${formatFC(si.item?.price)}</td><td>${formatFC((si.item?.price) * si.qty + getVipSurcharge(si.item?.price) * (si.vipCount || 0))}</td></tr>`).join('')}
        </tbody></table>
        <div class="total"><div style="display:flex; justify-content:space-between;"><span>TOTAL:</span><span>${formatFC(sale.grandTotal)}</span></div></div>
        <p class="payment-method">Paiement: ${methodNames[method] || method}</p>
        <p class="signature">Merci de votre visite !</p>
    </div>`;
    const receiptContent = document.getElementById('receiptContent');
    if(receiptContent) receiptContent.innerHTML = receiptHtml;
    document.getElementById('receiptModal')?.classList.add('active');
}

function printReceipt() {
    const printContents = document.getElementById('receiptContent')?.innerHTML;
    if(printContents) { 
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents; 
        window.print(); 
        document.body.innerHTML = originalContents;
        location.reload();
    }
}

function restoreToCart() {
    if(!currentReceiptSale) return;
    const dateStr = prompt("Entrez la date pour ce panier (AAAA-MM-JJ):", currentReceiptSale.date.split('T')[0]);
    if(!dateStr) return;
    for(const si of currentReceiptSale.items) { 
        const item = window.items.find(i => i.id === si.item.id); 
        if(item) item.comptoirStock += si.qty; 
    }
    carts.push([]); 
    cartServers.push(''); 
    cartDates.push(dateStr);
    const newIdx = carts.length - 1;
    currentReceiptSale.items.forEach(si => carts[newIdx].push({ id: si.item.id, qty: si.qty, vipCount: si.vipCount || 0, paid: true }));
    cartServers[newIdx] = currentReceiptSale.server.id;
    currentCartIndex = newIdx;
    salesHistory = salesHistory.filter(s => s.id !== currentReceiptSale.id);
    if(window.stockMovements) window.stockMovements = window.stockMovements.filter(m => !(m.type === 'sale' && m.date === currentReceiptSale.date));
    if(window.saveData) window.saveData();
    if(window.renderAll) window.renderAll();
    if(window.switchTab) window.switchTab('sales');
    showToast(`Panier restauré`);
    document.getElementById('receiptModal')?.classList.remove('active');
}

function sendToKitchen() {
    const cart = carts[currentCartIndex] || [];
    if(cart.length === 0) { showToast('Panier vide'); return; }
    const kitchenItemsList = cart.filter(ci => {
        const item = window.items.find(i => i.id === ci.id);
        return item && (item.type === 'plat' || item.type === 'dessert' || item.type === 'boisson_chaude');
    });
    if(kitchenItemsList.length === 0) { showToast('Aucun article cuisine dans ce panier'); return; }
    const tablesList = prompt("Numéro(s) de table (ex: 1,2,3):", "1");
    if(!tablesList) return;
    const tableNumbers = tablesList.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
    if(window.addToKitchen) window.addToKitchen(Date.now(), kitchenItemsList, tableNumbers);
    showToast(`${kitchenItemsList.length} article(s) envoyé(s) en cuisine`);
}

function scrollToCart() { 
    document.getElementById('cartPanel')?.scrollIntoView({ behavior: 'smooth' }); 
}

function openDebtModal() {
    const modalHtml = `
        <div class="modal-overlay" id="debtModal">
            <div class="modal">
                <h3><i class="fas fa-hand-holding-usd"></i> Dette / Garantie / Consignation</h3>
                <div class="form-group"><label>Type</label><select id="debtType" onchange="updateDebtTypeUI()"><option value="debt">💸 Dette</option><option value="guarantee">🔒 Garantie</option><option value="consign">📦 Consignation</option></select></div>
                <div class="form-group"><label>Serveur</label><select id="debtServer"></select></div>
                <div class="form-group"><label>Client</label><input type="text" id="debtClientName" placeholder="Nom du client"></div>
                <div class="form-group"><label>Téléphone</label><input type="text" id="debtClientPhone" placeholder="Téléphone"></div>
                <div class="form-group"><label>Motif</label><input type="text" id="debtReason" placeholder="Motif"></div>
                <div id="debtItemsList"></div>
                <button class="btn btn-info btn-sm" onclick="addDebtItemRow()"><i class="fas fa-plus"></i> Ajouter article</button>
                <div class="cart-total-row"><span>Total:</span><span id="debtTotalValue">0 FC</span></div>
                <div class="form-group"><label>Montant remboursé (dette)</label><input type="number" id="debtRefundAmount" value="0"></div>
                <div class="form-group"><label>Date limite</label><input type="date" id="debtDueDate"></div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal('debtModal')">Annuler</button>
                    <button class="btn btn-success" onclick="saveDebt()">Enregistrer</button>
                </div>
            </div>
        </div>
    `;
    if(!document.getElementById('debtModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    updateServerSelects();
    updateDebtTotal();
    renderDebtItemsList();
    document.getElementById('debtModal')?.classList.add('active');
}

function addDebtItemRow() {
    tempDebtItems.push({ id: null, qty: 1 });
    renderDebtItemsList();
}

function renderDebtItemsList() {
    const container = document.getElementById('debtItemsList');
    if(!container || !window.items) return;
    container.innerHTML = tempDebtItems.map((di, idx) => {
        const item = di.id ? window.items.find(i => i.id === di.id) : null;
        return `<div class="debt-item-row">
            <select onchange="updateDebtItem(${idx}, 'id', this.value)">
                <option value="">-- Sélectionner --</option>
                ${window.items.filter(i => !i.hidden).map(i => `<option value="${i.id}" ${di.id === i.id ? 'selected' : ''}>${i.name} (${formatFC(i.price)})</option>`).join('')}
            </select>
            <input type="number" value="${di.qty}" min="1" onchange="updateDebtItem(${idx}, 'qty', this.value)">
            <span>${item ? formatFC(item.price * di.qty) : '0 FC'}</span>
            <button class="btn btn-danger btn-sm" onclick="removeDebtItem(${idx})"><i class="fas fa-trash"></i></button>
        </div>`;
    }).join('');
}

function updateDebtItem(idx, field, value) {
    if(field === 'id') tempDebtItems[idx].id = parseInt(value) || null;
    else if(field === 'qty') tempDebtItems[idx].qty = parseInt(value) || 1;
    updateDebtTotal();
    renderDebtItemsList();
}

function removeDebtItem(idx) { 
    tempDebtItems.splice(idx, 1); 
    renderDebtItemsList(); 
    updateDebtTotal(); 
}

function updateDebtTotal() { 
    const total = tempDebtItems.reduce((s, di) => {
        if(!di.id) return s;
        const item = window.items.find(i => i.id === di.id);
        return s + (item?.price || 0) * di.qty;
    }, 0); 
    document.getElementById('debtTotalValue').textContent = formatFC(total); 
}

function saveDebt() {
    const type = document.getElementById('debtType')?.value;
    const serverId = document.getElementById('debtServer')?.value;
    const server = window.servers.find(s => s.id == serverId);
    const clientName = document.getElementById('debtClientName')?.value;
    if(!clientName && type === 'debt') { showToast('Nom du client requis'); return; }
    if(tempDebtItems.length === 0 || !tempDebtItems.some(di => di.id)) { showToast('Ajoutez au moins un article'); return; }
    tempDebtItems.forEach(di => {
        if(!di.id) return;
        const item = window.items.find(i => i.id === di.id);
        const value = item.price * di.qty;
        debts.push({ 
            id: Date.now() + Math.random(), 
            type, 
            itemId: item.id, 
            itemName: item.name, 
            qty: di.qty, 
            clientName: clientName || '-', 
            clientPhone: document.getElementById('debtClientPhone')?.value || '', 
            reason: document.getElementById('debtReason')?.value || (type === 'debt' ? 'Dette' : (type === 'guarantee' ? 'Garantie' : 'Consignation')), 
            value, 
            refundAmount: type === 'debt' ? parseInt(document.getElementById('debtRefundAmount')?.value) || 0 : 0, 
            dueDate: type === 'debt' ? document.getElementById('debtDueDate')?.value : null, 
            date: new Date().toISOString(), 
            status: 'pending', 
            serverName: server?.name || '-' 
        });
        if(type === 'debt' && item.comptoirStock >= di.qty) {
            item.comptoirStock -= di.qty;
            if(window.stockMovements) window.stockMovements.push({ 
                date: new Date().toISOString(), 
                type: 'debt', 
                itemId: item.id, 
                itemName: item.name, 
                qty: di.qty, 
                value, 
                from: 'Comptoir', 
                to: `Dette (${clientName})`, 
                server: server?.name 
            });
        }
    });
    if(window.saveData) window.saveData();
    closeModal('debtModal');
    if(window.renderAll) window.renderAll();
    showToast('Enregistré');
}

function filterDebts() { 
    renderDebtsList(); 
}

function renderDebtsList() {
    const container = document.getElementById('debtsList');
    if(!container) return;
    container.innerHTML = debts.map(d => `
        <div style="padding:0.5rem; border-bottom:1px solid var(--card-border); display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${d.itemName}</strong> x${d.qty} - ${d.clientName} (${formatFC(d.value)}) <span class="debt-status-badge debt-status-${d.status}">${d.status === 'pending' ? 'En attente' : 'Payé'}</span></div>
            ${d.status === 'pending' && d.type === 'debt' ? `<button class="btn btn-success btn-sm" onclick="settleDebt('${d.id}')"><i class="fas fa-check"></i> Soldé</button>` : ''}
        </div>
    `).join('');
}

function settleDebt(debtId) { 
    const debt = debts.find(d => d.id == debtId); 
    if(debt) { 
        debt.status = 'paid'; 
        debt.paidDate = new Date().toISOString(); 
        const sale = {
            id: Date.now(),
            items: [{ item: window.items.find(i => i.id === debt.itemId), qty: debt.qty, vipCount: 0 }],
            server: { name: debt.serverName },
            subtotal: debt.value,
            vipSurcharge: 0,
            grandTotal: debt.refundAmount || debt.value,
            date: new Date().toISOString(),
            paymentMethod: 'debt_settlement'
        };
        salesHistory.push(sale);
        if(window.stockMovements) window.stockMovements.push({
            date: new Date().toISOString(),
            type: 'debt_paid',
            itemId: debt.itemId,
            itemName: debt.itemName,
            qty: debt.qty,
            value: debt.refundAmount || debt.value,
            from: 'Dette',
            to: 'Encaissé',
            server: debt.serverName
        });
        if(window.saveData) window.saveData();
        if(window.renderAll) window.renderAll();
        filterDebts();
        showToast(`Dette de ${debt.clientName} soldée`); 
    } 
}

function exportDebtsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    if(companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15);
    doc.setFontSize(14); 
    doc.text(companyInfo.name, 30, 12);
    doc.setFontSize(8); 
    doc.text(`Dettes - ${getCurrentDateFormatted()}`, 30, 17);
    doc.autoTable({ startY: 25, head: [['Type', 'Article', 'Qté', 'Client', 'Valeur', 'Statut']], body: debts.map(d => [d.type, d.itemName, d.qty, d.clientName, formatFC(d.value), d.status]) });
    doc.save('dettes.pdf');
    showToast('PDF exporté');
}

function openLoyaltyModal() {
    const modalHtml = `
        <div class="modal-overlay" id="loyaltyModal">
            <div class="modal">
                <h3><i class="fas fa-gem"></i> Programme de fidélité</h3>
                <div class="form-group"><label>Client</label><input type="text" id="loyaltyClientName"></div>
                <div class="form-group"><label>Téléphone</label><input type="text" id="loyaltyClientPhone"></div>
                <div class="stats-grid" style="margin:1rem 0;"><div class="stat-card"><div class="stat-value" id="loyaltyPointsDisplay">0</div><div class="stat-label">Points</div></div></div>
                <div class="form-group"><label>Points à ajouter</label><input type="number" id="loyaltyPointsToAdd" value="0"></div>
                <button class="btn btn-success" onclick="addLoyaltyPoints()"><i class="fas fa-plus"></i> Ajouter points</button>
                <button class="btn btn-warning" onclick="useLoyaltyPoints()"><i class="fas fa-ticket-alt"></i> Utiliser points (10pts = 1000FC)</button>
                <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal('loyaltyModal')">Fermer</button></div>
            </div>
        </div>
    `;
    if(!document.getElementById('loyaltyModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('loyaltyModal')?.classList.add('active');
    document.getElementById('loyaltyPointsDisplay').textContent = '0';
}

function addLoyaltyPointsForSale(sale) { 
    addLoyaltyPointsToClient("Client Inconnu", "", Math.floor(sale.grandTotal / 100)); 
}

function addLoyaltyPoints() { 
    const clientName = document.getElementById('loyaltyClientName')?.value; 
    const phone = document.getElementById('loyaltyClientPhone')?.value; 
    const points = parseInt(document.getElementById('loyaltyPointsToAdd')?.value) || 0; 
    if(clientName) { 
        addLoyaltyPointsToClient(clientName, phone, points); 
        showToast(`${points} points ajoutés à ${clientName}`); 
        document.getElementById('loyaltyClientName').value = ''; 
        document.getElementById('loyaltyPointsToAdd').value = ''; 
    } else showToast('Nom client requis'); 
}

function addLoyaltyPointsToClient(name, phone, points) {
    const key = `${name}|${phone}`;
    if(!loyaltyPoints[key]) loyaltyPoints[key] = { name, phone, points: 0 };
    loyaltyPoints[key].points += points;
    if(window.saveData) window.saveData();
}

function useLoyaltyPoints() {
    const clientName = document.getElementById('loyaltyClientName')?.value;
    const phone = document.getElementById('loyaltyClientPhone')?.value;
    const key = `${clientName}|${phone}`;
    if(!loyaltyPoints[key] || loyaltyPoints[key].points < 10) { showToast('Points insuffisants (10 points minimum)'); return; }
    const discount = Math.floor(loyaltyPoints[key].points / 10) * 1000;
    loyaltyPoints[key].points -= Math.floor(loyaltyPoints[key].points / 10) * 10;
    showToast(`Remise de ${formatFC(discount)} appliquée`);
    if(window.saveData) window.saveData();
    document.getElementById('loyaltyPointsDisplay').textContent = loyaltyPoints[key].points;
}

function openReservationModal() {
    const modalHtml = `
        <div class="modal-overlay" id="reservationModal">
            <div class="modal">
                <h3><i class="fas fa-calendar-alt"></i> Réservation</h3>
                <div class="form-group"><label>Client</label><input type="text" id="reservationClient"></div>
                <div class="form-group"><label>Téléphone</label><input type="text" id="reservationPhone"></div>
                <div class="form-row">
                    <div class="form-group"><label>Date</label><input type="date" id="reservationDate" value="${new Date().toISOString().split('T')[0]}"></div>
                    <div class="form-group"><label>Heure</label><input type="time" id="reservationTime" value="19:00"></div>
                </div>
                <div class="form-group"><label>Nombre de personnes</label><input type="number" id="reservationGuests" value="2"></div>
                <div class="form-group"><label>Table(s)</label><select id="reservationTables" multiple></select></div>
                <div class="form-group"><label>Zone</label><select id="reservationZone"></select></div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal('reservationModal')">Annuler</button>
                    <button class="btn btn-success" onclick="saveReservation()">Réserver</button>
                </div>
            </div>
        </div>
    `;
    if(!document.getElementById('reservationModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    updateServerSelects();
    document.getElementById('reservationModal')?.classList.add('active');
}

function saveReservation() {
    const client = document.getElementById('reservationClient')?.value;
    if(!client) { showToast('Nom client requis'); return; }
    reservations.push({ 
        id: Date.now(), 
        client: client, 
        phone: document.getElementById('reservationPhone')?.value, 
        date: document.getElementById('reservationDate')?.value, 
        time: document.getElementById('reservationTime')?.value, 
        guests: parseInt(document.getElementById('reservationGuests')?.value) || 2, 
        tables: Array.from(document.getElementById('reservationTables')?.selectedOptions || []).map(o => parseInt(o.value)), 
        zone: document.getElementById('reservationZone')?.value, 
        status: 'confirmed' 
    });
    if(window.saveData) window.saveData();
    closeModal('reservationModal');
    showToast(`Réservation pour ${client} enregistrée`);
}

function openDeliveryModal() {
    const modalHtml = `
        <div class="modal-overlay" id="deliveryModal">
            <div class="modal">
                <h3><i class="fas fa-truck"></i> Livraison</h3>
                <div class="form-group"><label>Client</label><input type="text" id="deliveryClient"></div>
                <div class="form-group"><label>Téléphone</label><input type="text" id="deliveryPhone"></div>
                <div class="form-group"><label>Adresse</label><input type="text" id="deliveryAddress"></div>
                <div class="form-group"><label>Zone</label><select id="deliveryZone"></select></div>
                <div class="form-group"><label>Frais de livraison</label><input type="number" id="deliveryFee" value="0"></div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal('deliveryModal')">Annuler</button>
                    <button class="btn btn-success" onclick="saveDelivery()">Enregistrer</button>
                </div>
            </div>
        </div>
    `;
    if(!document.getElementById('deliveryModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    updateServerSelects();
    document.getElementById('deliveryModal')?.classList.add('active');
}

function saveDelivery() {
    const client = document.getElementById('deliveryClient')?.value;
    if(!client) { showToast('Nom client requis'); return; }
    deliveries.push({ 
        id: Date.now(), 
        client: client, 
        phone: document.getElementById('deliveryPhone')?.value, 
        address: document.getElementById('deliveryAddress')?.value, 
        zone: document.getElementById('deliveryZone')?.value, 
        fee: parseInt(document.getElementById('deliveryFee')?.value) || 0, 
        status: 'pending', 
        createdAt: new Date().toISOString() 
    });
    if(window.saveData) window.saveData();
    closeModal('deliveryModal');
    showToast(`Livraison pour ${client} enregistrée`);
}

function addZone() { 
    const name = prompt("Nom de la zone:"); 
    if(name) { 
        zones.push({ id: Date.now(), name: name, deliveryFee: 0 }); 
        if(window.saveData) window.saveData(); 
        updateServerSelects(); 
        showToast(`Zone ${name} ajoutée`); 
    } 
}

function addTable() { 
    const number = prompt("Numéro de table:"); 
    if(number) { 
        tables.push({ id: Date.now(), number: parseInt(number), capacity: 4, zone: "Bar", status: "free" }); 
        if(window.saveData) window.saveData(); 
        updateServerSelects(); 
        showToast(`Table ${number} ajoutée`); 
    } 
}

function updateDebtTypeUI() { 
    const type = document.getElementById('debtType')?.value; 
    document.getElementById('debtRefundAmount').disabled = type !== 'debt'; 
    document.getElementById('debtDueDate').disabled = type !== 'debt'; 
}

function openQRScannerForSale() { 
    if(window.openQRScanner) window.openQRScanner('sale'); 
}