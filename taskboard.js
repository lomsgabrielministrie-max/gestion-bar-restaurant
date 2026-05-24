// ============================================
// TASKBOARD - Tableau de bord des tâches et partage
// ============================================

let tasks = [];
let shifts = [];
let shiftRecords = [];
let taskCategories = [
    { id: 1, name: "Service", icon: "fa-concierge-bell", color: "#e67e22" },
    { id: 2, name: "Cuisine", icon: "fa-utensils", color: "#2ecc71" },
    { id: 3, name: "Bar", icon: "fa-cocktail", color: "#3498db" },
    { id: 4, name: "Nettoyage", icon: "fa-broom", color: "#9b59b6" },
    { id: 5, name: "Administration", icon: "fa-file-alt", color: "#e74c3c" },
    { id: 6, name: "Stock", icon: "fa-boxes", color: "#1abc9c" }
];

function initTaskBoard() {
    window.tasks = tasks;
    window.shifts = shifts;
    window.shiftRecords = shiftRecords;
    window.addTask = addTask;
    window.updateTaskStatus = updateTaskStatus;
    window.assignTask = assignTask;
    window.renderTaskBoard = renderTaskBoard;
    window.addShift = addShift;
    window.startShift = startShift;
    window.endShift = endShift;
    window.renderShiftBoard = renderShiftBoard;
    window.getTaskStatistics = getTaskStatistics;
    window.exportTasksPDF = exportTasksPDF;
    window.openAddTaskModal = openAddTaskModal;
    window.deleteTask = deleteTask;
    
    initializeDefaultTasks();
    initializeDefaultShifts();
}

function initializeDefaultTasks() {
    if(tasks.length === 0) {
        tasks = [
            { id: 1, title: "Nettoyer les tables", description: "Nettoyer toutes les tables du bar et terrasse", category: "Nettoyage", priority: "high", status: "pending", assignedTo: null, createdAt: new Date().toISOString() },
            { id: 2, title: "Réapprovisionner le bar", description: "Vérifier et remplir les stocks au bar", category: "Bar", priority: "high", status: "pending", assignedTo: null, createdAt: new Date().toISOString() },
            { id: 3, title: "Préparer les commandes", description: "Préparer les commandes en attente", category: "Cuisine", priority: "medium", status: "pending", assignedTo: null, createdAt: new Date().toISOString() },
            { id: 4, title: "Faire l'inventaire", description: "Compter les stocks du dépôt", category: "Stock", priority: "low", status: "pending", assignedTo: null, createdAt: new Date().toISOString() }
        ];
    }
}

function initializeDefaultShifts() {
    if(shifts.length === 0) {
        shifts = [
            { id: 1, name: "Matin", startTime: "08:00", endTime: "14:00", active: true },
            { id: 2, name: "Soir", startTime: "14:00", endTime: "22:00", active: true },
            { id: 3, name: "Nuit", startTime: "22:00", endTime: "06:00", active: false }
        ];
    }
}

function addTask(title, description, category, priority) {
    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        priority: priority || 'medium',
        status: 'pending',
        assignedTo: null,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    tasks.push(newTask);
    if(window.saveData) window.saveData();
    renderTaskBoard();
    if(window.showNotification) window.showNotification('Nouvelle tâche', `${title} ajoutée`, 'info');
    return newTask;
}

function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        task.status = newStatus;
        if(newStatus === 'completed') {
            task.completedAt = new Date().toISOString();
            if(window.showNotification) window.showNotification('Tâche terminée', task.title, 'success');
        }
        if(window.saveData) window.saveData();
        renderTaskBoard();
    }
}

function assignTask(taskId, serverId) {
    const task = tasks.find(t => t.id === taskId);
    const server = (window.servers || []).find(s => s.id == serverId);
    if(task && server) {
        task.assignedTo = { id: server.id, name: server.name };
        if(window.saveData) window.saveData();
        renderTaskBoard();
        if(window.showNotification) window.showNotification('Tâche assignée', `${task.title} assignée à ${server.name}`, 'info');
    }
}


function renderTaskBoard() {
    const container = document.getElementById('taskBoardContent');
    if(!container) return;
    
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    function escapeHtml(text) {
        if(!text) return '';
        return text.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }
    
    function renderTaskColumn(title, tasksList, status, icon, badgeColor) {
        if(tasksList.length === 0) {
            return `
                <div class="task-column">
                    <div class="task-column-header" style="background:${badgeColor};">
                        <i class="fas ${icon}"></i> ${title}
                        <span class="task-count">(0)</span>
                    </div>
                    <div class="empty-state" style="padding:1.5rem; text-align:center;">
                        <i class="fas fa-check-circle" style="font-size:1.5rem; opacity:0.3;"></i>
                        <p style="font-size:0.75rem; margin-top:0.5rem;">Aucune tâche</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="task-column">
                <div class="task-column-header" style="background:${badgeColor};">
                    <i class="fas ${icon}"></i> ${title}
                    <span class="task-count">(${tasksList.length})</span>
                </div>
                <div class="task-column-body">
                    ${tasksList.map(task => `
                        <div class="task-card" data-task-id="${task.id}">
                            <div class="task-header">
                                <span class="task-title">${escapeHtml(task.title)}</span>
                                <span class="priority-badge priority-${task.priority}">${task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>
                            </div>
                            <div class="task-category">
                                <i class="fas ${taskCategories.find(c => c.name === task.category)?.icon || 'fa-tasks'}"></i>
                                ${escapeHtml(task.category)}
                            </div>
                            <div class="task-description">${escapeHtml(task.description.substring(0, 80))}${task.description.length > 80 ? '...' : ''}</div>
                            <div class="task-assigned">
                                ${task.assignedTo ? `<i class="fas fa-user-check"></i> ${escapeHtml(task.assignedTo.name)}` : '<span class="unassigned"><i class="fas fa-user-slash"></i> Non assignée</span>'}
                            </div>
                            <div class="task-actions">
                                ${!task.assignedTo && window.servers ? `<select onchange="assignTask(${task.id}, this.value)"><option value="">Assigner</option>${window.servers.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}</select>` : ''}
                                ${status === 'pending' ? `<button class="btn btn-sm btn-info" onclick="updateTaskStatus(${task.id}, 'in_progress')"><i class="fas fa-play"></i> Démarrer</button>` : ''}
                                ${status === 'in_progress' ? `<button class="btn btn-sm btn-success" onclick="updateTaskStatus(${task.id}, 'completed')"><i class="fas fa-check"></i> Terminer</button>` : ''}
                                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <style>
            .task-board {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                margin-top: 1rem;
            }
            .task-column {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: var(--radius);
                overflow: hidden;
            }
            .task-column-header {
                padding: 0.75rem 1rem;
                color: white;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            .task-column-header .task-count {
                margin-left: auto;
                background: rgba(255,255,255,0.2);
                padding: 0.2rem 0.5rem;
                border-radius: 20px;
                font-size: 0.7rem;
            }
            .task-column-body {
                padding: 1rem;
                max-height: 400px;
                overflow-y: auto;
            }
            .task-card {
                background: var(--primary);
                border-radius: var(--radius-sm);
                padding: 0.85rem;
                margin-bottom: 0.85rem;
                border-left: 3px solid var(--accent);
                transition: var(--transition);
            }
            .task-card:last-child {
                margin-bottom: 0;
            }
            .task-card:hover {
                transform: translateX(3px);
                box-shadow: var(--shadow-sm);
            }
            .task-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                flex-wrap: wrap;
                gap: 0.3rem;
            }
            .task-title {
                font-weight: 700;
                font-size: 0.85rem;
                color: var(--text-primary);
            }
            .priority-badge {
                font-size: 0.6rem;
                padding: 0.2rem 0.5rem;
                border-radius: 20px;
                font-weight: 600;
            }
            .priority-high { background: var(--danger); color: white; }
            .priority-medium { background: var(--warning); color: white; }
            .priority-low { background: var(--success); color: white; }
            .task-category {
                font-size: 0.65rem;
                color: var(--text-muted);
                margin-bottom: 0.4rem;
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }
            .task-category i {
                color: var(--gold);
                width: 14px;
            }
            .task-description {
                font-size: 0.7rem;
                color: var(--text-muted);
                margin-bottom: 0.6rem;
                line-height: 1.4;
            }
            .task-assigned {
                font-size: 0.65rem;
                margin-bottom: 0.6rem;
                padding: 0.2rem 0.4rem;
                background: rgba(212, 160, 23, 0.1);
                border-radius: 4px;
                display: inline-block;
            }
            .task-assigned i {
                color: var(--gold);
                margin-right: 0.2rem;
            }
            .unassigned {
                color: var(--warning);
            }
            .task-actions {
                display: flex;
                gap: 0.4rem;
                flex-wrap: wrap;
                margin-top: 0.4rem;
            }
            .task-actions select, .task-actions button {
                font-size: 0.65rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }
            .task-actions select {
                background: var(--input-bg);
                border: 1px solid var(--gold);
                color: var(--text-primary);
            }
            @media (max-width: 768px) {
                .task-column-body {
                    max-height: 350px;
                }
            }
        </style>
        <div class="task-board">
            ${renderTaskColumn('📋 En attente', pendingTasks, 'pending', 'fa-clock', '#e67e22')}
            ${renderTaskColumn('⚙️ En cours', inProgressTasks, 'in_progress', 'fa-spinner fa-pulse', '#3498db')}
            ${renderTaskColumn('✅ Terminées', completedTasks, 'completed', 'fa-check-circle', '#2ecc71')}
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fas fa-plus"></i> Nouvelle tâche</button>
            <button class="btn btn-info" onclick="exportTasksPDF()"><i class="fas fa-file-pdf"></i> Exporter PDF</button>
        </div>
    `;
}


function deleteTask(taskId) {
    if(confirm('Supprimer cette tâche ?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        if(window.saveData) window.saveData();
        renderTaskBoard();
        if(window.showNotification) window.showNotification('Tâche supprimée', '', 'info');
    }
}

function openAddTaskModal() {
    const categoriesHtml = taskCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    const modalHtml = `
        <div class="modal-overlay" id="addTaskModal">
            <div class="modal">
                <h3><i class="fas fa-plus-circle" style="color:var(--gold);"></i> Nouvelle tâche</h3>
                <div class="form-group"><label>Titre</label><input type="text" id="taskTitle" placeholder="Ex: Nettoyer le bar"></div>
                <div class="form-group"><label>Description</label><textarea id="taskDescription" rows="3" placeholder="Description détaillée de la tâche..."></textarea></div>
                <div class="form-row">
                    <div class="form-group"><label>Catégorie</label><select id="taskCategory">${categoriesHtml}</select></div>
                    <div class="form-group"><label>Priorité</label><select id="taskPriority"><option value="low">Basse</option><option value="medium" selected>Moyenne</option><option value="high">Haute</option></select></div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeModal('addTaskModal')"><i class="fas fa-times"></i> Annuler</button>
                    <button class="btn btn-success" onclick="saveNewTask()"><i class="fas fa-save"></i> Ajouter</button>
                </div>
            </div>
        </div>
    `;
    if(!document.getElementById('addTaskModal')) document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('addTaskModal')?.classList.add('active');
}

function saveNewTask() {
    const title = document.getElementById('taskTitle')?.value;
    if(!title) { 
        if(window.showToast) window.showToast('Titre requis'); 
        return; 
    }
    addTask(title, document.getElementById('taskDescription')?.value || '', document.getElementById('taskCategory')?.value, document.getElementById('taskPriority')?.value);
    if(window.closeModal) window.closeModal('addTaskModal');
}

function addShift(name, startTime, endTime) {
    const newShift = {
        id: Date.now(),
        name: name,
        startTime: startTime,
        endTime: endTime,
        active: true
    };
    shifts.push(newShift);
    if(window.saveData) window.saveData();
    renderShiftBoard();
    if(window.showNotification) window.showNotification('Équipe ajoutée', `${name} (${startTime} - ${endTime})`, 'success');
}

function startShift(shiftId, serverId) {
    const shift = shifts.find(s => s.id === shiftId);
    const server = (window.servers || []).find(s => s.id == serverId);
    if(shift && server) {
        const today = new Date().toISOString().split('T')[0];
        const shiftRecord = {
            id: Date.now(),
            shiftId: shiftId,
            shiftName: shift.name,
            serverId: server.id,
            serverName: server.name,
            date: today,
            startTime: new Date().toISOString(),
            endTime: null
        };
        shiftRecords.push(shiftRecord);
        if(window.saveData) window.saveData();
        renderShiftBoard();
        if(window.showNotification) window.showNotification('Service commencé', `${server.name} a commencé son service (${shift.name})`, 'success');
        if(window.playNotificationSound) window.playNotificationSound('success');
    }
}

function endShift(recordId) {
    const record = shiftRecords.find(r => r.id === recordId);
    if(record && !record.endTime) {
        record.endTime = new Date().toISOString();
        if(window.saveData) window.saveData();
        renderShiftBoard();
        if(window.showNotification) window.showNotification('Service terminé', `${record.serverName} a terminé son service`, 'info');
    }
}

function renderShiftBoard() {
    const container = document.getElementById('shiftBoardContent');
    if(!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayShifts = shiftRecords.filter(r => r.date === today);
    
    function escapeHtml(text) {
        if(!text) return '';
        return text.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        });
    }
    
    container.innerHTML = `
        <style>
            .shift-board {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            .shift-card {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: var(--radius);
                padding: 1rem;
            }
            .shift-card h4 {
                color: var(--gold);
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .shift-time {
                font-size: 0.8rem;
                color: var(--text-muted);
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--card-border);
            }
            .shift-server {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                border-bottom: 1px solid var(--card-border);
            }
            .shift-server:last-child {
                border-bottom: none;
            }
            .server-name {
                font-weight: 500;
                font-size: 0.85rem;
            }
            .server-status {
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }
            .status-active {
                color: var(--success);
            }
            .status-inactive {
                color: var(--danger);
            }
            .shift-server button {
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
            }
        </style>
        <div class="shift-board">
            ${shifts.filter(s => s.active).map(shift => `
                <div class="shift-card">
                    <h4><i class="fas fa-clock"></i> ${escapeHtml(shift.name)}</h4>
                    <div class="shift-time">${shift.startTime} - ${shift.endTime}</div>
                    <div class="shift-servers">
                        ${(window.servers || []).map(server => {
                            const activeShift = todayShifts.find(r => r.shiftId === shift.id && r.serverId === server.id && !r.endTime);
                            const completedShift = todayShifts.find(r => r.shiftId === shift.id && r.serverId === server.id && r.endTime);
                            return `
                                <div class="shift-server">
                                    <span class="server-name">${escapeHtml(server.name)}</span>
                                    ${activeShift ? 
                                        `<span class="server-status status-active"><i class="fas fa-play-circle"></i> En service <button class="btn btn-sm btn-outline" onclick="endShift(${activeShift.id})">Terminer</button></span>` :
                                        completedShift ?
                                        `<span class="server-status status-inactive"><i class="fas fa-check-circle"></i> Service terminé</span>` :
                                        `<button class="btn btn-sm btn-success" onclick="startShift(${shift.id}, ${server.id})"><i class="fas fa-play"></i> Démarrer</button>`
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getTaskStatistics() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    const byCategory = {};
    taskCategories.forEach(cat => {
        byCategory[cat.name] = tasks.filter(t => t.category === cat.name).length;
    });
    
    const byPriority = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    
    return {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        byCategory: byCategory,
        byPriority: byPriority
    };
}

function exportTasksPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    if(companyInfo && companyInfo.logo) doc.addImage(companyInfo.logo, 'JPEG', 10, 5, 15, 15);
    doc.setFontSize(14);
    doc.text(companyInfo?.name || 'Mes Bes Extrêmes', 30, 12);
    doc.setFontSize(8);
    doc.text(`Liste des tâches - ${getCurrentDateFormatted()}`, 30, 17);
    
    const stats = getTaskStatistics();
    doc.setFontSize(10);
    doc.text(`Statistiques: Total: ${stats.total} | Terminées: ${stats.completed} | En cours: ${stats.inProgress} | En attente: ${stats.pending} | Taux: ${stats.completionRate}%`, 10, 25);
    
    doc.autoTable({
        startY: 35,
        head: [['Tâche', 'Catégorie', 'Priorité', 'Statut', 'Assigné à']],
        body: tasks.map(t => [t.title, t.category, t.priority, t.status === 'pending' ? 'En attente' : t.status === 'in_progress' ? 'En cours' : 'Terminée', t.assignedTo?.name || 'Non assigné'])
    });
    
    doc.save('taches.pdf');
    if(window.showToast) window.showToast('Liste des tâches exportée');
}

// Fonction utilitaire d'échappement HTML
function escapeHtml(text) {
    if(!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}