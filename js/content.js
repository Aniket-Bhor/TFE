/**
 * js/content.js
 * ─────────────────────────────────────────────────────────────
 * Dynamic content — fetches data from the server API (/api/*).
 * Falls back to built-in defaults if the server is unreachable.
 * Default data is sourced from js/data.js.
 * ─────────────────────────────────────────────────────────────
 */

/* ── Shared IntersectionObserver for scroll-reveal ─────────── */
const scrollObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    },
    { threshold: 0.2 }
);

function observeRevealElements(root = document) {
    root.querySelectorAll('.scroll-reveal').forEach(el => scrollObserver.observe(el));
}

/* ── API helper ──────────────────────────────────────────────── */

/**
 * Fetch a collection from the server API with a default fallback.
 * @param {string}   collection - e.g. 'announcements'
 * @param {Function} fallback   - getDefault*() from data.js
 * @returns {Promise<Array>}
 */
async function fetchCollection(collection, fallback) {
    let serverData = [];
    try {
        const res = await fetch(`/api/${collection}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            serverData = data;
        }
    } catch (err) {
        console.warn(`[content] /api/${collection} unreachable:`, err.message);
    }
    
    // If no server data, use fallback; otherwise use only server data
    if (serverData.length === 0 && fallback) {
        return fallback();
    }
    return serverData;
}


/* ── Announcements ───────────────────────────────────────────── */

async function loadAnnouncements() {
    const announcements = await fetchCollection('announcements', getDefaultAnnouncements);
    renderAnnouncements(announcements);
}

function renderAnnouncements(announcements) {
    const banner = document.getElementById('notification-banner');
    const navbar = document.getElementById('navbar');
    if (!banner) return;

    if (announcements.length > 0) {
        const latest = announcements[announcements.length - 1];
        const textEl = banner.querySelector('p');
        if (textEl) textEl.textContent = latest.text;
        
        if (latest.link) {
            banner.onclick = () => window.open(latest.link, '_blank');
        } else {
            banner.onclick = () => { if (window.router) router.navigate('home'); };
        }
        
        banner.classList.remove('hidden');
        banner.style.display = 'flex';
        if (navbar) {
            navbar.classList.remove('top-0');
            navbar.classList.add('top-[32px]');
        }
    } else {
        banner.classList.add('hidden');
        banner.style.display = 'none';
        if (navbar) {
            navbar.classList.remove('top-[32px]');
            navbar.classList.add('top-0');
        }
    }
}




/* ── Journals ────────────────────────────────────────────────── */

async function loadJournals() {
    const journals = await fetchCollection('journals', getDefaultJournals);
    renderJournals(journals);
}

function renderJournals(journals) {
    const container = document.getElementById('journal-grid');
    if (!container) return;

    if (journals.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = journals.map(jrn => `
        <a href="${jrn.link || '#'}" class="group cursor-pointer text-left block">
            <div class="aspect-video bg-white/5 rounded-[30px] mb-8 overflow-hidden border border-white/5 hover-card">
                ${jrn.image
                    ? `<img src="${jrn.image}" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="${jrn.title}">`
                    : `<div class="w-full h-full bg-gradient-to-tr from-[#000B3D] via-blue-900 to-[#D4AF37]/20 group-hover:scale-110 transition-all duration-700"></div>`
                }
            </div>
            <span class="text-[#D4AF37] luxury-caption text-[10px] mb-2 block opacity-60">${jrn.readTime || '3 min read'}</span>
            <h3 class="text-2xl font-bold mb-2 group-hover:text-[#D4AF37] transition-all">${jrn.title}</h3>
            <p class="text-white/40 text-sm">${jrn.description || ''}</p>
        </a>
    `).join('');
}

/* ── Founder ────────────────────────────────────────────────── */

let cachedFounders = [];

async function loadFounder() {
    localStorage.removeItem(STORAGE_KEYS.FOUNDERS); // Clear old cache
    const founders = await fetchCollection('founders', getDefaultFounders);
    cachedFounders = founders || [];
    renderFounder(cachedFounders);
}

function renderFounder(founders) {
    const container = document.getElementById('founders-grid');
    if (!container) return;

    if (!founders || founders.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = founders.map(fdr => {
        const id = fdr.id || fdr._fbKey || '1';
        return `
        <div class="group cursor-pointer flex flex-col items-center gap-8"
             onclick="openFounderModal('${id}')">
            <div class="relative overflow-hidden rounded-[30px] w-64 h-64 md:w-80 md:h-80 glass border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500">
                <img src="${fdr.image || 'aryapic.png'}" alt="${fdr.name || 'Founder'}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#000B3D]/40 to-transparent"></div>
            </div>
            <div class="text-center">
                <h3 class="text-3xl font-bold mb-1 uppercase">${(fdr.name || '').toUpperCase()}</h3>
                <p class="luxury-caption text-[11px] text-[#D4AF37]">${fdr.title || ''}</p>
            </div>
        </div>
    `;
    }).join('');
}

/* ── The Faces ───────────────────────────────────────────────── */

let cachedFaces = [];

async function loadFaces() {
    localStorage.removeItem(STORAGE_KEYS.FACES); // Clear old cache
    const faces = await fetchCollection('faces', getDefaultFaces);
    cachedFaces = faces || [];
    renderFaces(cachedFaces);
}

function renderFaces(faces) {
    const container = document.getElementById('faces-grid');
    if (!container) return;

    if (faces.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = faces.map(f => {
        const id = f.id || f._fbKey || '';
        return `
        <div class="group cursor-pointer text-center md:text-left flex flex-col items-center md:items-start"
             onclick="openFaceModal('${id}')">
            <div class="relative overflow-hidden rounded-[30px] w-48 h-48 glass border border-white/10 mb-6 hover:border-[#D4AF37]/50 transition-all duration-500">
                <img src="${f.image || 'placeholder.jpg'}" alt="${f.name || 'Team member'}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#000B3D]/40 to-transparent"></div>
            </div>
            <h3 class="text-3xl font-bold mb-1">${f.name || ''}</h3>
            <p class="luxury-caption text-[11px] text-[#D4AF37]">${f.role || f.title || ''}</p>
        </div>
    `;
    }).join('');
}

/* ── Founder & Portfolio Modals ──────────────────────────────── */

function escapeModalHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function openProfileModal(data) {
    const modal = document.getElementById('founderModal');
    const body  = document.getElementById('modalBody');
    if (!data || !modal || !body) return;

    const name = data.name || '';
    const title = data.title || data.role || '';
    const image = data.image || 'aryapic.png';
    const bio = data.bio ? data.bio.trim() : '';
    const achievements = Array.isArray(data.achievements)
        ? data.achievements.filter(a => a && ((a.title && a.title.trim()) || (a.description && a.description.trim())))
        : [];

    const hasExtraContent = Boolean(bio || achievements.length > 0);

    const bioHtml = bio
        ? `<div class="text-white/80 text-base md:text-lg leading-relaxed ${achievements.length > 0 ? 'mb-8' : ''} whitespace-pre-line">${escapeModalHtml(bio)}</div>`
        : '';

    const achievementsHtml = achievements.length > 0
        ? `
            <ul class="space-y-6 text-white/70 text-base md:text-lg leading-relaxed text-left">
                ${achievements.map(a => {
                    const itemTitle = a.title ? a.title.trim() : '';
                    const itemDesc = a.description ? a.description.trim() : '';
                    return `
                        <li class="relative pl-6">
                            <span class="absolute left-0 top-1 text-[#D4AF37] text-lg font-bold">•</span>
                            ${itemTitle ? `<strong class="text-white block text-lg md:text-xl mb-1">${escapeModalHtml(itemTitle)}</strong>` : ''}
                            ${itemDesc ? `<p class="text-white/70 text-sm md:text-base leading-relaxed">${escapeModalHtml(itemDesc)}</p>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `
        : '';

    body.innerHTML = `
        <div class="flex flex-col md:flex-row gap-10 md:gap-12 items-center md:items-start">
            <div class="w-40 h-40 md:w-48 md:h-48 rounded-[36px] overflow-hidden shadow-2xl border-2 border-[#D4AF37]/30 flex-shrink-0 bg-white/5">
                <img src="${escapeModalHtml(image)}" class="w-full h-full object-cover" alt="${escapeModalHtml(name)}">
            </div>
            <div class="flex-grow text-center md:text-left w-full">
                <h2 class="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tight">${escapeModalHtml(name)}</h2>
                <p class="text-[#D4AF37] luxury-caption text-[11px] md:text-[12px] font-bold ${hasExtraContent ? 'mb-6' : 'mb-2'} tracking-[0.2em] uppercase">${escapeModalHtml(title)}</p>
                ${hasExtraContent ? '<div class="h-[1px] bg-white/10 mb-8"></div>' : ''}
                ${bioHtml}
                ${achievementsHtml}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
}

function openFounderModal(id) {
    let data = cachedFounders.find(f => f.id === id || f._fbKey === id || (f.name && f.name.toLowerCase().includes(id)));
    if (!data && cachedFounders.length > 0) {
        data = cachedFounders[0];
    }
    if (data) {
        openProfileModal(data);
    }
}

function openFaceModal(id) {
    let data = cachedFaces.find(f => f.id === id || f._fbKey === id || (f.name && f.name.toLowerCase().includes(id)));
    if (data) {
        openProfileModal(data);
    }
}

function openPortfolioModal(id) {
    const data  = typeof portfolioData !== 'undefined' ? portfolioData[id] : null;
    const modal = document.getElementById('founderModal');
    const body  = document.getElementById('modalBody');
    if (!data || !modal || !body) return;

    body.innerHTML = `
        <div class="mb-12">
            <h2 class="text-5xl font-black uppercase mb-4 leading-tight">${data.title}</h2>
            <p class="text-[#D4AF37] luxury-caption text-[14px] font-bold tracking-[0.2em]">${data.subtitle}</p>
        </div>
        <div class="h-[1px] bg-white/10 mb-12"></div>
        ${data.content}
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
    setTimeout(animateBars, 500);
}

function closeFounderModal() {
    const modal = document.getElementById('founderModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFounderModal();
    }
});

function animateBars() {
    document.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = width; }, 100);
    });
}

/* ── Bootstrap ───────────────────────────────────────────────── */
// Announcements load on startup (they affect the navbar height).
document.addEventListener('DOMContentLoaded', () => {
    // Clear old cached founder/faces data
    localStorage.removeItem('punktuate_founders');
    localStorage.removeItem('punktuate_faces');
    localStorage.removeItem('tfe_founders');
    localStorage.removeItem('tfe_faces');
    
    loadAnnouncements();
});
