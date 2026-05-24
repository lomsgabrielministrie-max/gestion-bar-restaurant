// ============================================
// ANALYTICS - Analyses avancées et statistiques
// ============================================

function initAnalytics() {
    window.calculateProfitMargins = calculateProfitMargins;
    window.getTopSellingItems = getTopSellingItems;
    window.getSlowMovingItems = getSlowMovingItems;
    window.forecastSales = forecastSales;
    window.getHourlySalesDistribution = getHourlySalesDistribution;
    window.getZonePerformance = getZonePerformance;
    window.calculateServerPerformance = calculateServerPerformance;
    window.getPriceHistory = getPriceHistory;
    window.generateBusinessReport = generateBusinessReport;
    window.exportAnalyticsPDF = exportAnalyticsPDF;
}

function calculateProfitMargins() {
    if(!window.items) return [];
    
    return window.items.map(item => {
        const sellingPrice = item.price || 0;
        const purchasePrice = item.purchasePrice || 0;
        const margin = sellingPrice - purchasePrice;
        const marginPercentage = purchasePrice > 0 ? (margin / sellingPrice) * 100 : 0;
        const totalSold = item.sold || 0;
        const totalProfit = margin * totalSold;
        
        return {
            id: item.id,
            name: item.name,
            sellingPrice: sellingPrice,
            purchasePrice: purchasePrice,
            margin: margin,
            marginPercentage: Math.round(marginPercentage),
            totalSold: totalSold,
            totalProfit: totalProfit
        };
    }).sort((a, b) => b.totalProfit - a.totalProfit);
}

function getTopSellingItems(limit = 10) {
    if(!window.salesHistory) return [];
    
    const salesCount = {};
    window.salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            const name = item.item?.name || item.name;
            if(!salesCount[name]) salesCount[name] = { name: name, quantity: 0, revenue: 0 };
            salesCount[name].quantity += item.qty;
            salesCount[name].revenue += (item.item?.price || item.price) * item.qty;
        });
    });
    
    return Object.values(salesCount)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
}

function getSlowMovingItems(daysThreshold = 30) {
    if(!window.salesHistory || !window.items) return [];
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    
    const recentSales = window.salesHistory.filter(s => new Date(s.date) >= thresholdDate);
    const soldItemIds = new Set();
    
    recentSales.forEach(sale => {
        sale.items.forEach(item => {
            soldItemIds.add(item.item?.id || item.id);
        });
    });
    
    return window.items.filter(item => !soldItemIds.has(item.id) && !item.hidden)
        .map(item => ({ name: item.name, type: item.type, stock: (item.depotStock || 0) + (item.comptoirStock || 0) }));
}

function forecastSales(days = 7) {
    if(!window.salesHistory || window.salesHistory.length === 0) return [];
    
    const salesByDay = {};
    window.salesHistory.forEach(sale => {
        const day = sale.date.split('T')[0];
        if(!salesByDay[day]) salesByDay[day] = 0;
        salesByDay[day] += sale.grandTotal;
    });
    
    const dailyTotals = Object.values(salesByDay);
    if(dailyTotals.length === 0) return [];
    
    const averageDailySales = dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length;
    
    // Détection de tendance
    const recentTotals = dailyTotals.slice(-7);
    const trend = recentTotals.length > 1 ? (recentTotals[recentTotals.length - 1] - recentTotals[0]) / recentTotals[0] : 0;
    
    const forecasts = [];
    const today = new Date();
    
    for(let i = 1; i <= days; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        const dayOfWeek = forecastDate.getDay();
        
        // Facteurs jour de semaine (weekend plus élevé)
        let factor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
        
        let forecast = averageDailySales * factor * (1 + trend * (i / 30));
        forecasts.push({
            date: forecastDate.toISOString().split('T')[0],
            dayName: forecastDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
            forecastAmount: Math.round(forecast)
        });
    }
    
    return forecasts;
}

function getHourlySalesDistribution() {
    if(!window.salesHistory) return [];
    
    const hourlyData = Array(24).fill().map((_, i) => ({ hour: i, count: 0, amount: 0 }));
    
    window.salesHistory.forEach(sale => {
        const hour = parseInt(sale.date.split('T')[1]?.split(':')[0] || 12);
        if(hour >= 0 && hour < 24) {
            hourlyData[hour].count++;
            hourlyData[hour].amount += sale.grandTotal;
        }
    });
    
    return hourlyData;
}

function getZonePerformance() {
    if(!window.salesHistory) return [];
    
    const zones = window.zones || [{ id: 1, name: "Bar" }, { id: 2, name: "Terrasse" }, { id: 3, name: "Salle" }];
    const zoneSales = zones.map(zone => ({ zone: zone.name, amount: 0, count: 0 }));
    
    window.salesHistory.forEach(sale => {
        // Simuler une zone basée sur le serveur ou aléatoire
        const zoneIndex = (sale.id % zones.length);
        zoneSales[zoneIndex].amount += sale.grandTotal;
        zoneSales[zoneIndex].count++;
    });
    
    return zoneSales;
}

function calculateServerPerformance() {
    if(!window.salesHistory || !window.servers) return [];
    
    const serverStats = {};
    window.servers.forEach(server => {
        serverStats[server.name] = { name: server.name, salesCount: 0, totalAmount: 0, averagePerSale: 0 };
    });
    
    window.salesHistory.forEach(sale => {
        const serverName = sale.server?.name || sale.server;
        if(serverStats[serverName]) {
            serverStats[serverName].salesCount++;
            serverStats[serverName].totalAmount += sale.grandTotal;
        }
    });
    
    Object.values(serverStats).forEach(stat => {
        stat.averagePerSale = stat.salesCount > 0 ? Math.round(stat.totalAmount / stat.salesCount) : 0;
    });
    
    return Object.values(serverStats).sort((a, b) => b.totalAmount - a.totalAmount);
}

function getPriceHistory(itemId) {
    if(!window.priceHistory) return [];
    return window.priceHistory.filter(ph => ph.itemId === itemId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateBusinessReport(startDate, endDate) {
    if(!window.salesHistory) return null;
    
    let filteredSales = [...window.salesHistory];
    if(startDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] >= startDate);
    if(endDate) filteredSales = filteredSales.filter(s => s.date.split('T')[0] <= endDate);
    
    const totalRevenue = filteredSales.reduce((s, sale) => s + sale.grandTotal, 0);
    const totalSales = filteredSales.length;
    const totalItems = filteredSales.reduce((s, sale) => s + sale.items.reduce((sum, i) => sum + i.qty, 0), 0);
    const averageBasket = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
    
    // Calculer les bénéfices
    const profits = calculateProfitMargins();
    const totalProfit = profits.reduce((s, p) => s + p.totalProfit, 0);
    const totalCost = totalRevenue - totalProfit;
    
    // Pertes et dépenses
    const totalLosses = (window.losses || []).reduce((s, l) => s + (l.value || 0), 0);
    const totalExpenses = (window.expenses || []).reduce((s, e) => s + e.amount, 0);
    
    // Dettes
    const pendingDebts = (window.debts || []).filter(d => d.status === 'pending');
    const totalPendingDebts = pendingDebts.reduce((s, d) => s + d.value, 0);
    
    // Top produits
    const topProducts = getTopSellingItems(5);
    
    return {
        period: { startDate, endDate },
        summary: {
            totalRevenue,
            totalSales,
            totalItems,
            averageBasket,
            totalProfit,
            totalCost,
            profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0
        },
        expenses: {
            totalLosses,
            totalExpenses,
            totalCharges: totalLosses + totalExpenses
        },
        debts: {
            totalPending: totalPendingDebts,
            pendingCount: pendingDebts.length
        },
        netResult: totalRevenue - totalProfit - totalLosses - totalExpenses,
        topProducts: topProducts,
        generatedAt: new Date().toISOString()
    };
}

function exportAnalyticsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    if(companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15);
    doc.setFontSize(14);
    doc.text(companyInfo.name, 30, 12);
    doc.setFontSize(8);
    doc.text(`Rapport d'analyse - ${getCurrentDateFormatted()}`, 30, 17);
    
    const profits = calculateProfitMargins();
    const topSelling = getTopSellingItems(10);
    const serverPerformance = calculateServerPerformance();
    
    let y = 30;
    
    doc.setFontSize(12);
    doc.text("Marges bénéficiaires", 10, y);
    y += 10;
    doc.autoTable({
        startY: y,
        head: [['Article', 'Prix vente', 'Prix achat', 'Marge', 'Marge %', 'Vendus', 'Profit']],
        body: profits.slice(0, 15).map(p => [p.name, formatFC(p.sellingPrice), formatFC(p.purchasePrice), formatFC(p.margin), `${p.marginPercentage}%`, p.totalSold, formatFC(p.totalProfit)]),
        fontSize: 7
    });
    
    y = doc.lastAutoTable.finalY + 15;
    doc.text("Top ventes", 10, y);
    y += 10;
    doc.autoTable({
        startY: y,
        head: [['Article', 'Quantité vendue', 'Chiffre d\'affaires']],
        body: topSelling.map(p => [p.name, p.quantity, formatFC(p.revenue)]),
        fontSize: 7
    });
    
    doc.save('analyse_complete.pdf');
    showToast('Rapport d\'analyse exporté');
}