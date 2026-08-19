/**
 * admin.js
 * ─────────────────────────────────────────────────────────────
 * Admin panel logic: auth, CRUD for all content types, modals.
 *
 * NOTE: Default data and STORAGE_KEYS are defined in js/data.js
 * which is loaded before this file in admin.html.
 * ─────────────────────────────────────────────────────────────
 */

// Auth is handled by login.js (SHA-256 hashed comparison).
// Admin session is stored in localStorage — checked by checkAuth() below.


let founders = [];
let faces = [];
let announcements = [];
let journals = [];
let currentSection = 'founders';

function checkAuth() {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    showToast('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ── getDefault*() functions removed — sourced from js/data.js ──

/* ── API helpers ────────────────────────────────────────────── */

async function apiGet(collection, fallback) {
    let serverData = [];
    try {
        const res = await fetch(`/api/${collection}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            serverData = data;
        }
    } catch (err) {
        console.error(`apiGet(${collection}):`, err);
        showToast(`Failed to load ${collection}`, 'error');
    }
    
    if (fallback) {
        const defaults = fallback();
        const existingIds = new Set(serverData.map(item => item.id));
        const missingDefaults = defaults.filter(item => !existingIds.has(item.id));
        return [...missingDefaults, ...serverData];
    }
    return serverData;
}

async function apiPost(collection, data) {
    const res = await fetch(`/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function apiPut(collection, id, data) {
    const res = await fetch(`/api/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function apiDelete(collection, id) {
    const res = await fetch(`/api/${collection}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

/* ── Load functions (all fetch from server) ─────────────────── */

async function loadAnnouncements() {
    announcements = await apiGet('announcements', getDefaultAnnouncements);
}

async function loadJournals() {
    journals = await apiGet('journals', getDefaultJournals);
}

async function loadFounder() {
    founders = await apiGet('founders', getDefaultFounders);
}

async function loadFaces() {
    faces = await apiGet('faces', getDefaultFaces);
}

async function loadData() {
    await Promise.all([
        loadFounder(),
        loadFaces(),
        loadAnnouncements(),
        loadJournals(),
    ]);
}

/* ── Save helpers (upsert via server API) ───────────────────── */

async function saveItem(collection, data, localArray, renderFn) {
    try {
        if (data.id && localArray.some(i => i.id === data.id)) {
            await apiPut(collection, data.id, data);
        } else {
            const created = await apiPost(collection, data);
            data.id = created.id || data.id;
        }
    } catch (err) {
        console.error(`saveItem(${collection}):`, err);
        showToast(`Failed to save to ${collection}`, 'error');
    }
}

async function deleteItem(collection, id, localArray, renderFn) {
    if (!confirm(`Delete this item from ${collection}?`)) return;
    try {
        await apiDelete(collection, id);
        // Remove from local array and re-render
        const idx = localArray.findIndex(i => i.id === id || i._fbKey === id);
        if (idx !== -1) localArray.splice(idx, 1);
        renderFn();
        showToast('Deleted successfully!', 'success');
    } catch (err) {
        console.error(`deleteItem(${collection}, ${id}):`, err);
        showToast('Failed to delete item', 'error');
    }
}





function renderAnnouncements() {
    const container = document.getElementById('announcements-list');
    if (!container) return;
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass rounded-[40px] p-12 border border-white/10 text-center">
                <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <i class="bx bx-bell text-5xl text-white/30"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">No Announcements Yet</h3>
                <p class="text-white/40 mb-8">Get started by adding your first announcement</p>
                <button onclick="openModal('add-announcement')" class="btn-hover bg-[#D4AF37] text-[#000B3D] px-8 py-4 rounded-full luxury-caption text-[10px] font-extrabold">
                    Add First Announcement
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = announcements.map(ann => `
        <div class="glass rounded-[40px] p-6 border border-white/10 hover-card relative group overflow-hidden">
            <div class="relative z-10">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                            <i class="bx bx-bell text-2xl text-[#D4AF37]"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white/60 luxury-caption text-[10px] mb-1">Announcement</p>
                            <p class="text-xl font-bold">${ann.text}</p>
                        </div>
                    </div>
                </div>
                
                <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button onclick="editAnnouncement('${ann.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all backdrop-blur-md border border-white/10">
                        <i class="bx bx-edit text-lg"></i>
                    </button>
                    <button onclick="deleteAnnouncement('${ann.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all backdrop-blur-md border border-white/10">
                        <i class="bx bx-trash text-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderJournals() {
    const container = document.getElementById('journals-list');
    if (!container) return;
    
    if (journals.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass rounded-[40px] p-12 border border-white/10 text-center">
                <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <i class="bx bx-book text-5xl text-white/30"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">No Journals Yet</h3>
                <p class="text-white/40 mb-8">Get started by adding your first journal</p>
                <button onclick="openModal('add-journal')" class="btn-hover bg-[#D4AF37] text-[#000B3D] px-8 py-4 rounded-full luxury-caption text-[10px] font-extrabold">
                    Add First Journal
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = journals.map(jrn => `
        <div class="glass rounded-[40px] overflow-hidden border border-white/10 hover-card relative group">
            <div class="aspect-video bg-white/5 relative overflow-hidden">
                ${jrn.image ? `<img src="${jrn.image}" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="${jrn.title}">` : `<div class="w-full h-full bg-gradient-to-tr from-[#000B3D] via-blue-900 to-[#D4AF37]/20"></div>`}
            </div>
            <div class="p-6 relative z-10">
                <p class="text-[#D4AF37] luxury-caption text-[10px] mb-3 opacity-60">${jrn.readTime || '3 min read'}</p>
                <h3 class="text-2xl font-bold mb-2 group-hover:text-[#D4AF37] transition-all">${jrn.title}</h3>
                <p class="text-white/40 text-sm">${jrn.description}</p>
            </div>
            
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button onclick="editJournal('${jrn.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-edit text-lg"></i>
                </button>
                <button onclick="deleteJournal('${jrn.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-trash text-lg"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFounder() {
    const container = document.getElementById('founders-list');
    if (!container) return;
    
    if (founders.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass rounded-[40px] p-12 border border-white/10 text-center">
                <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <i class="bx bx-group text-5xl text-white/30"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">No Founder Yet</h3>
                <p class="text-white/40 mb-8">Get started by adding your first founder</p>
                <button onclick="openModal('add-founder')" class="btn-hover bg-[#D4AF37] text-[#000B3D] px-8 py-4 rounded-full luxury-caption text-[10px] font-extrabold">
                    Add First Founder
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = founders.map(fdr => `
        <div class="glass rounded-[40px] p-6 border border-white/10 hover-card relative overflow-hidden group">
            <div class="flex items-start gap-4 mb-6 relative z-10">
                <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 flex-shrink-0">
                    <img src="${fdr.image || 'placeholder.jpg'}" class="w-full h-full object-cover" alt="${fdr.name}">
                </div>
                <div class="flex-1 min-w-0 pr-20">
                    <h3 class="text-xl font-bold uppercase line-clamp-1 mb-1">${fdr.name}</h3>
                    <p class="text-[#D4AF37] text-sm truncate">${fdr.title}</p>
                </div>
            </div>
            
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button onclick="editFounder('${fdr.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-edit text-lg"></i>
                </button>
                <button onclick="deleteFounder('${fdr.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-trash text-lg"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFaces() {
    const container = document.getElementById('faces-list');
    if (!container) return;
    
    if (faces.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass rounded-[40px] p-12 border border-white/10 text-center">
                <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <i class="bx bx-smile text-5xl text-white/30"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">No Faces Yet</h3>
                <p class="text-white/40 mb-8">Get started by adding your first face</p>
                <button onclick="openModal('add-face')" class="btn-hover bg-[#D4AF37] text-[#000B3D] px-8 py-4 rounded-full luxury-caption text-[10px] font-extrabold">
                    Add First Face
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = faces.map(f => `
        <div class="glass rounded-[40px] p-6 border border-white/10 hover-card relative overflow-hidden group">
            <div class="flex items-start gap-4 mb-6 relative z-10">
                <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 flex-shrink-0">
                    <img src="${f.image || 'placeholder.jpg'}" class="w-full h-full object-cover" alt="${f.name}">
                </div>
                <div class="flex-1 min-w-0 pr-20">
                    <h3 class="text-xl font-bold uppercase line-clamp-1 mb-1">${f.name}</h3>
                    <p class="text-[#D4AF37] text-sm truncate">${f.role}</p>
                </div>
            </div>
            
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button onclick="editFace('${f.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-edit text-lg"></i>
                </button>
                <button onclick="deleteFace('${f.id}')" class="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all backdrop-blur-md border border-white/10">
                    <i class="bx bx-trash text-lg"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderAll() {
    renderFounder();
    renderFaces();
    renderAnnouncements();
    renderJournals();
}

function showSection(section) {
    currentSection = section;

    const contentSections = ['founders', 'faces', 'announcements', 'journals'];
    contentSections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.classList.add('hidden');
    });

    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) sectionEl.classList.remove('hidden');

    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${section}`)?.classList.add('active');
    document.getElementById(`nav-mobile-${section}`)?.classList.add('active');

    const titles = {
        founders:      { title: 'Founder',        subtitle: 'manage your founders',        btn: 'Add Founder',      action: 'add-founder' },
        faces:         { title: 'The Faces',       subtitle: 'the faces behind The Fifth Element', btn: 'Add Face',         action: 'add-face' },
        announcements: { title: 'Announcements',   subtitle: 'manage your announcements',   btn: 'Add Announcement', action: 'add-announcement' },
        journals:      { title: 'The Journal',     subtitle: 'manage your journal',         btn: 'Add Journal',      action: 'add-journal' },
    };

    const config = titles[section];
    if (!config) return;

    const titleEl    = document.getElementById('section-title');
    const subtitleEl = document.getElementById('section-subtitle');
    const addBtn     = document.getElementById('add-btn');

    if (titleEl)    titleEl.textContent    = config.title;
    if (subtitleEl) subtitleEl.textContent = config.subtitle;
    if (addBtn) {
        addBtn.innerHTML = `<i class="bx bx-plus"></i> ${config.btn}`;
        addBtn.onclick   = () => openModal(config.action);
    }
}


function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function openModal(type) {
    const modalMap = {
        'add-founder': { modal: 'founder-modal', title: 'Add Founder' },
        'edit-founder': { modal: 'founder-modal', title: 'Edit Founder' },
        'add-face': { modal: 'face-modal', title: 'Add Face' },
        'edit-face': { modal: 'face-modal', title: 'Edit Face' },
        'add-announcement': { modal: 'announcement-modal', title: 'Add Announcement' },
        'edit-announcement': { modal: 'announcement-modal', title: 'Edit Announcement' },
        'add-journal': { modal: 'journal-modal', title: 'Add Journal' },
        'edit-journal': { modal: 'journal-modal', title: 'Edit Journal' }
    };
    
    const config = modalMap[type];
    const modal = document.getElementById(config.modal);
    modal.classList.remove('hidden');
    
    if (config.modal === 'founder-modal') {
        document.getElementById('founder-modal-title').textContent = config.title;
        if (type === 'add-founder') {
            document.getElementById('founder-id').value = '';
            document.getElementById('founder-name').value = '';
            document.getElementById('founder-title').value = '';
            document.getElementById('founder-bio').value = '';
            document.getElementById('founder-image').value = '';
            const preview = document.getElementById('founder-image-preview');
            if (preview) {
                preview.classList.add('hidden');
                preview.classList.remove('flex');
            }
            renderAchievementsList('founder-achievements', []);
        }
    } else if (config.modal === 'face-modal') {
        document.getElementById('face-modal-title').textContent = config.title;
        if (type === 'add-face') {
            document.getElementById('face-id').value = '';
            document.getElementById('face-name').value = '';
            document.getElementById('face-role').value = '';
            document.getElementById('face-bio').value = '';
            document.getElementById('face-image').value = '';
            const preview = document.getElementById('face-image-preview');
            if (preview) {
                preview.classList.add('hidden');
                preview.classList.remove('flex');
            }
            renderAchievementsList('face-achievements', []);
        }
    } else if (config.modal === 'announcement-modal') {
        document.getElementById('announcement-modal-title').textContent = config.title;
    } else if (config.modal === 'journal-modal') {
        document.getElementById('journal-modal-title').textContent = config.title;
    }
}

function closeModal() {
    document.querySelectorAll('[id$="-modal"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('form').forEach(form => form.reset());
    const founderPreview = document.getElementById('founder-image-preview');
    if (founderPreview) { founderPreview.classList.add('hidden'); founderPreview.classList.remove('flex'); }
    const facePreview = document.getElementById('face-image-preview');
    if (facePreview) { facePreview.classList.add('hidden'); facePreview.classList.remove('flex'); }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* ── Dynamic Achievements Manager ───────────────────────────── */

function escapeAdminAttribute(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAdminText(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderAchievementItem(containerId, data = { title: '', description: '' }, index = 0, total = 1) {
    const item = document.createElement('div');
    item.className = 'achievement-item glass rounded-[20px] p-4 border border-white/10 space-y-3 relative group';
    item.innerHTML = `
        <div class="flex items-center justify-between gap-2">
            <span class="text-[#D4AF37] luxury-caption text-[9px] font-bold">Bullet Point #${index + 1}</span>
            <div class="flex items-center gap-1">
                <button type="button" onclick="moveAchievement('${containerId}', ${index}, -1)" class="w-7 h-7 glass rounded-full flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:bg-white/10 transition-all ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                    <i class="bx bx-chevron-up text-lg"></i>
                </button>
                <button type="button" onclick="moveAchievement('${containerId}', ${index}, 1)" class="w-7 h-7 glass rounded-full flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:bg-white/10 transition-all ${index === total - 1 ? 'opacity-30 cursor-not-allowed' : ''}" title="Move Down" ${index === total - 1 ? 'disabled' : ''}>
                    <i class="bx bx-chevron-down text-lg"></i>
                </button>
                <button type="button" onclick="deleteAchievement('${containerId}', ${index})" class="w-7 h-7 glass rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" title="Remove Bullet Point">
                    <i class="bx bx-trash text-sm"></i>
                </button>
            </div>
        </div>
        <div>
            <input type="text" class="achievement-title input-field w-full glass border border-white/10 rounded-[12px] p-3 text-sm bg-transparent text-white outline-none" placeholder="Heading / Highlight (e.g., Founder, Westelle & Co.)" value="${escapeAdminAttribute(data.title || '')}">
        </div>
        <div>
            <textarea rows="2" class="achievement-desc input-field w-full glass border border-white/10 rounded-[12px] p-3 text-sm bg-transparent text-white outline-none resize-y" placeholder="Description / Details...">${escapeAdminText(data.description || '')}</textarea>
        </div>
    `;
    return item;
}

function getAchievementsFromDOM(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const items = [];
    container.querySelectorAll('.achievement-item').forEach(el => {
        const titleEl = el.querySelector('.achievement-title');
        const descEl = el.querySelector('.achievement-desc');
        const title = titleEl ? titleEl.value.trim() : '';
        const description = descEl ? descEl.value.trim() : '';
        if (title || description) {
            items.push({ title, description });
        }
    });
    return items;
}

function renderAchievementsList(containerId, items = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="text-white/30 text-xs italic py-2">No bullet points added yet. Click "+ Add Achievement" to create one.</p>`;
        return;
    }
    items.forEach((item, index) => {
        container.appendChild(renderAchievementItem(containerId, item, index, items.length));
    });
}

function addAchievementRow(containerId) {
    const current = getAchievementsFromDOM(containerId);
    current.push({ title: '', description: '' });
    renderAchievementsList(containerId, current);
}

function moveAchievement(containerId, index, direction) {
    const current = getAchievementsFromDOM(containerId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    renderAchievementsList(containerId, current);
}

function deleteAchievement(containerId, index) {
    const current = getAchievementsFromDOM(containerId);
    current.splice(index, 1);
    renderAchievementsList(containerId, current);
}

function handleImageUpload(inputId, callback) {
    const input = document.getElementById(inputId);
    if (input && input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
                callback(compressedDataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function editAnnouncement(id) {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    
    document.getElementById('announcement-id').value = ann.id;
    document.getElementById('announcement-text').value = ann.text;
    
    openModal('edit-announcement');
    
    setTimeout(() => {
        const select = document.getElementById('announcement-event-id');
        if(select && ann.eventId) select.value = ann.eventId;
    }, 50);
}

async function deleteAnnouncement(id) {
    await deleteItem('announcements', id, announcements, renderAnnouncements);
}

function editJournal(id) {
    const jrn = journals.find(j => j.id === id);
    if (!jrn) return;
    
    document.getElementById('journal-id').value = jrn.id;
    document.getElementById('journal-title').value = jrn.title;
    document.getElementById('journal-read-time').value = jrn.readTime || '';
    document.getElementById('journal-link').value = jrn.link || '';
    document.getElementById('journal-description').value = jrn.description || '';
    
    openModal('edit-journal');
}

async function deleteJournal(id) {
    await deleteItem('journals', id, journals, renderJournals);
}

function editFounder(id) {
    const fdr = founders.find(f => f.id === id || f._fbKey === id);
    if (!fdr) return;
    
    document.getElementById('founder-id').value = fdr.id || fdr._fbKey || '';
    document.getElementById('founder-name').value = fdr.name || '';
    document.getElementById('founder-title').value = fdr.title || '';
    document.getElementById('founder-bio').value = fdr.bio || '';
    document.getElementById('founder-image').value = '';
    
    const preview = document.getElementById('founder-image-preview');
    if (preview) {
        if (fdr.image) {
            preview.querySelector('img').src = fdr.image;
            preview.classList.remove('hidden');
            preview.classList.add('flex');
        } else {
            preview.classList.add('hidden');
            preview.classList.remove('flex');
        }
    }
    
    renderAchievementsList('founder-achievements', fdr.achievements || []);
    openModal('edit-founder');
}

async function deleteFounder(id) {
    await deleteItem('founders', id, founders, renderFounder);
}

function editFace(id) {
    const f = faces.find(x => x.id === id || x._fbKey === id);
    if (!f) return;
    
    document.getElementById('face-id').value = f.id || f._fbKey || '';
    document.getElementById('face-name').value = f.name || '';
    document.getElementById('face-role').value = f.role || f.title || '';
    document.getElementById('face-bio').value = f.bio || '';
    document.getElementById('face-image').value = '';
    
    const preview = document.getElementById('face-image-preview');
    if (preview) {
        if (f.image) {
            preview.querySelector('img').src = f.image;
            preview.classList.remove('hidden');
            preview.classList.add('flex');
        } else {
            preview.classList.add('hidden');
            preview.classList.remove('flex');
        }
    }
    
    renderAchievementsList('face-achievements', f.achievements || []);
    openModal('edit-face');
}

async function deleteFace(id) {
    await deleteItem('faces', id, faces, renderFaces);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-[60] glass border ${type === 'success' ? 'border-[#D4AF37]' : 'border-red-500'} px-8 py-4 rounded-[30px] flex items-center gap-4 shadow-2xl animate-bounce`;
    toast.innerHTML = `
        <i class="bx ${type === 'success' ? 'bx-check-circle text-[#D4AF37]' : 'bx-x-circle text-red-500'} text-2xl"></i>
        <span class="font-bold">${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function initForms() {
    
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('announcement-id').value;
            
            const data = {
                id: id || generateId(),
                text: document.getElementById('announcement-text').value,
                eventId: null
            };
            
            try {
                if (id) {
                    await apiPut('announcements', id, data);
                    const idx = announcements.findIndex(a => a.id === id);
                    if (idx !== -1) announcements[idx] = data;
                    showToast('Announcement updated!', 'success');
                } else {
                    const created = await apiPost('announcements', data);
                    announcements.push(created);
                    showToast('Announcement added!', 'success');
                }
            } catch (err) { showToast('Save failed: ' + err.message, 'error'); return; }
            renderAnnouncements();
            closeModal();
        });
    }
    
    const journalForm = document.getElementById('journal-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('journal-id').value;
            let newImage = '';
            
            const finalize = async () => {
                const data = {
                    id: id || generateId(),
                    title: document.getElementById('journal-title').value,
                    readTime: document.getElementById('journal-read-time').value,
                    description: document.getElementById('journal-description').value,
                    link: document.getElementById('journal-link').value,
                    image: newImage || (id ? journals.find(j => j.id === id)?.image : '')
                };
                
                try {
                    if (id) {
                        await apiPut('journals', id, data);
                        const idx = journals.findIndex(j => j.id === id);
                        if (idx !== -1) journals[idx] = data;
                        showToast('Journal updated!', 'success');
                    } else {
                        const created = await apiPost('journals', data);
                        journals.push(created);
                        showToast('Journal added!', 'success');
                    }
                } catch (err) { showToast('Save failed: ' + err.message, 'error'); return; }
                renderJournals();
                closeModal();
            };
            
            const imageInput = document.getElementById('journal-image');
            if (imageInput.files && imageInput.files[0]) {
                handleImageUpload('journal-image', (img) => {
                    newImage = img;
                    finalize();
                });
            } else {
                finalize();
            }
        });
    }
    
    const founderForm = document.getElementById('founder-form');
    if (founderForm) {
        founderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('founder-id').value;
            let newImage = '';
            
            const finalize = async () => {
                const existing = id ? founders.find(f => f.id === id || f._fbKey === id) : null;
                const data = {
                    id: id || generateId(),
                    name: document.getElementById('founder-name').value.trim(),
                    title: document.getElementById('founder-title').value.trim(),
                    image: newImage || (existing ? existing.image : 'aryapic.png'),
                    bio: document.getElementById('founder-bio').value.trim(),
                    achievements: getAchievementsFromDOM('founder-achievements')
                };
                
                try {
                    if (id) {
                        await apiPut('founders', id, data);
                        const idx = founders.findIndex(f => f.id === id || f._fbKey === id);
                        if (idx !== -1) founders[idx] = data;
                        showToast('Founder updated!', 'success');
                    } else {
                        const created = await apiPost('founders', data);
                        founders.push(created);
                        showToast('Founder added!', 'success');
                    }
                } catch (err) { showToast('Save failed: ' + err.message, 'error'); return; }
                renderFounder();
                closeModal();
            };
            
            const imageInput = document.getElementById('founder-image');
            if (imageInput.files && imageInput.files[0]) {
                handleImageUpload('founder-image', (img) => {
                    newImage = img;
                    finalize();
                });
            } else {
                finalize();
            }
        });
    }
    
    const faceForm = document.getElementById('face-form');
    if (faceForm) {
        faceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('face-id').value;
            let newImage = '';
            
            const finalize = async () => {
                const existing = id ? faces.find(f => f.id === id || f._fbKey === id) : null;
                const roleValue = document.getElementById('face-role').value.trim();
                const data = {
                    id: id || generateId(),
                    name: document.getElementById('face-name').value.trim(),
                    role: roleValue,
                    title: roleValue,
                    image: newImage || (existing ? existing.image : ''),
                    bio: document.getElementById('face-bio').value.trim(),
                    achievements: getAchievementsFromDOM('face-achievements')
                };
                
                try {
                    if (id) {
                        await apiPut('faces', id, data);
                        const idx = faces.findIndex(f => f.id === id || f._fbKey === id);
                        if (idx !== -1) faces[idx] = data;
                        showToast('Face updated!', 'success');
                    } else {
                        const created = await apiPost('faces', data);
                        faces.push(created);
                        showToast('Face added!', 'success');
                    }
                } catch (err) { showToast('Save failed: ' + err.message, 'error'); return; }
                renderFaces();
                closeModal();
            };
            
            const imageInput = document.getElementById('face-image');
            if (imageInput.files && imageInput.files[0]) {
                handleImageUpload('face-image', (img) => {
                    newImage = img;
                    finalize();
                });
            } else {
                finalize();
            }
        });
    }
}

async function initAdminPanel() {
    showToast('Loading data from server...', 'success');
    await loadData();
    initForms();
    renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initAdminPanel();
    }
});

