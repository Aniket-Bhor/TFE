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
 * @param {string}   collection - e.g. 'influencers'
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

/* ── Influencers ─────────────────────────────────────────────── */

async function loadInfluencers() {
    const grid = document.getElementById('influencer-grid');
    if (!grid) return;
    const influencers = await fetchCollection('influencers', getDefaultInfluencers);
    renderInfluencers(influencers);
}

function renderInfluencers(influencers) {
    const grid = document.getElementById('influencer-grid');
    if (!grid) return;

    grid.className = influencers.length === 1
        ? 'grid grid-cols-1 max-w-[350px] md:max-w-[400px] mx-auto transition-all duration-700'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 transition-all duration-700';

    grid.innerHTML = influencers.map(inf => `
        ${inf.link ? `<a href="${inf.link}" target="_blank" class="block">` : '<div>'}
        <div class="influencer-card glass rounded-[40px] p-8 border border-white/5 flex flex-col group scroll-reveal cursor-pointer">
            <div class="relative overflow-hidden rounded-[30px] w-48 h-48 glass border border-white/10 mb-8 mx-auto hover:border-[#D4AF37]/50 transition-all duration-500">
                <img src="${inf.image || 'placeholder.jpg'}" alt="${inf.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#000B3D]/40 to-transparent"></div>
            </div>
            <div class="flex-grow text-center">
                <h3 class="text-3xl font-bold mb-2 tracking-tight uppercase">${inf.name}</h3>
                <p class="text-[#D4AF37] luxury-caption text-[11px] font-bold mb-2 tracking-[0.2em]">${inf.platform || 'Instagram'}</p>
                <p class="text-[#D4AF37] font-bold text-lg mb-4">${inf.followers} <span class="text-white/40 luxury-caption text-[10px] tracking-widest ml-1">Followers</span></p>
                <p class="text-white/40 text-sm leading-relaxed mb-8 font-medium line-clamp-2 overflow-hidden text-ellipsis">${inf.bio}</p>
            </div>
            <div class="mt-auto flex justify-center">
                ${inf.link ? `
                    <div class="btn-hover bg-[#D4AF37] text-[#000B3D] px-8 py-3 rounded-full luxury-caption text-[10px] font-extrabold flex items-center gap-2 shadow-lg">
                        <i class="bx bxl-instagram text-lg"></i> View Profile
                    </div>
                ` : ''}
            </div>
        </div>
        ${inf.link ? '</a>' : '</div>'}
    `).join('');

    observeRevealElements(grid);
    if (window.lucide) lucide.createIcons();
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

async function loadFounder() {
    localStorage.removeItem(STORAGE_KEYS.FOUNDERS); // Clear old cache
    localStorage.removeItem(STORAGE_KEYS.FACES); // Clear old faces cache too
    const founders = await fetchCollection('founders', getDefaultFounders);
    renderFounder(founders);
}

function renderFounder(founders) {
    const container = document.getElementById('founders-grid');
    if (!container) return;

    if (founders.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = founders.map(fdr => `
        <div class="group cursor-pointer flex flex-col items-center gap-8"
             onclick="openFounderModal('${fdr.id === '1' ? 'arya' : 'avanti'}')">
            <div class="relative overflow-hidden rounded-[30px] w-64 h-64 md:w-80 md:h-80 glass border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500">
                <img src="${fdr.image || 'placeholder.jpg'}" alt="${fdr.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#000B3D]/40 to-transparent"></div>
            </div>
            <div class="text-center">
                <h3 class="text-3xl font-bold mb-1">${fdr.name}</h3>
                <p class="luxury-caption text-[11px] text-[#D4AF37]">${fdr.title}</p>
            </div>
        </div>
    `).join('');
}

/* ── The Faces ───────────────────────────────────────────────── */

async function loadFaces() {
    const faces = await fetchCollection('faces', getDefaultFaces);
    renderFaces(faces);
}

function renderFaces(faces) {
    const container = document.getElementById('faces-grid');
    if (!container) return;

    if (faces.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = faces.map(f => `
        <div class="group cursor-pointer text-center md:text-left flex flex-col items-center md:items-start">
            <div class="relative overflow-hidden rounded-[30px] w-48 h-48 glass border border-white/10 mb-6 hover:border-[#D4AF37]/50 transition-all duration-500">
                <img src="${f.image || 'placeholder.jpg'}" alt="${f.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-[#000B3D]/40 to-transparent"></div>
            </div>
            <h3 class="text-3xl font-bold mb-1">${f.name}</h3>
            <p class="luxury-caption text-[11px] text-[#D4AF37]">${f.role}</p>
        </div>
    `).join('');
}

/* ── Careers ─────────────────────────────────────────────────── */

async function loadCareers() {
    const careers = await fetchCollection('careers', getDefaultCareers);
    renderCareers(careers);
}

function renderCareers(careers) {
    const container = document.getElementById('careers-grid');
    if (!container) return;

    if (careers.length === 0) {
        container.innerHTML = `
            <div class="col-span-full glass rounded-[40px] p-12 border border-white/10 text-center">
                <p class="text-xl text-white/40">No job openings right now, check back later!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = careers.map(c => `
        <div onclick="window.location.href='mailto:${c.email}?subject=Job Application: ${encodeURIComponent(c.position)}&body=Hello, I would like to apply for the ${encodeURIComponent(c.position)} position. Please find my resume attached.'"
             class="glass p-12 rounded-[40px] flex flex-col md:flex-row justify-between items-center group hover:border-[#D4AF37]/50 transition-all cursor-pointer border border-white/5">
            <h3 class="text-3xl font-bold">${c.position}</h3>
            <div class="flex items-center gap-6">
                <span class="luxury-caption text-[11px] text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all">Mail your resume</span>
                <button class="bg-white/10 p-6 rounded-full group-hover:bg-[#D4AF37] transition-all"><i data-lucide="mail"></i></button>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}




/* ── Founder & Portfolio Modals ──────────────────────────────── */

function openFounderModal(id) {
    const data  = founderData[id];
    const modal = document.getElementById('founderModal');
    const body  = document.getElementById('modalBody');
    if (!data || !modal || !body) return;

    body.innerHTML = `
        <div class="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div class="w-48 h-48 rounded-[40px] overflow-hidden shadow-2xl border-4 border-[#D4AF37]/20 flex-shrink-0">
                <img src="${data.image}" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow">
                <h2 class="text-4xl font-black uppercase mb-2">${data.name}</h2>
                <p class="text-[#D4AF37] luxury-caption text-[12px] font-bold mb-10 tracking-[0.2em]">${data.title}</p>
                <div class="h-[1px] bg-white/10 mb-10"></div>
                ${data.bio}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
}

function openPortfolioModal(id) {
    const data  = portfolioData[id];
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
