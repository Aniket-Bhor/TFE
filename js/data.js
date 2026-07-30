/**
 * js/data.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all default data and localStorage
 * keys. Shared by both the public site (index.js modules) and
 * the admin panel (admin.js).
 * ─────────────────────────────────────────────────────────────
 */

/* --- localStorage Keys --- */
const STORAGE_KEYS = {
    INFLUENCERS:   'tfe_influencers',
    FOUNDERS:      'tfe_founders',
    FACES:         'tfe_faces',
    ANNOUNCEMENTS: 'tfe_announcements',
    JOURNALS:      'tfe_journals',
    SESSION:       'tfe_admin_session',
    RESET_DONE:    'tfe_admin_reset_done'
};

/* --- Default Data --- */

function getDefaultInfluencers() {
    return [];
}

function getDefaultAnnouncements() { return []; }

function getDefaultJournals() {
    return [];
}

function getDefaultFounders() {
    return [
        {
            id: '1',
            name: 'Arya Pawar',
            title: 'Founder, The Fifth Element',
            image: 'aryapic.png'
        }
    ];
}

function getDefaultFaces() {
    return [];
}

/* --- Founder Bio Data (for modals on public site) --- */
const founderData = {
    arya: {
        name: 'Arya Pawar',
        title: 'Founder & Creative Director, The Fifth Element',
        image: 'aryapic.png',
        bio: `
            <ul class="space-y-8 text-white/70 text-lg leading-relaxed">
                <li>
                    <strong class="text-white block text-xl mb-2">• Founder, Westelle & Co.</strong>
                    Leading an event and brand collaboration venture, creating experiences backed by strong execution and creative strategy
                </li>
                <li>
                    <strong class="text-white block text-xl mb-2">• Charter President, Rotaract Club of Thane Royales</strong>
                    Built the club from the ground up, leading impactful initiatives and fostering a strong culture of leadership and service (Non profit organisation)
                </li>
                <li>
                    <strong class="text-white block text-xl mb-2">• Charter President, Rotaract Club of Hiranandani Legends</strong>
                    Played a key role in establishing the club, contributing to its vision, growth, and early-stage initiatives (Non profit organisation)
                </li>
                <li>
                    <strong class="text-white block text-xl mb-2">• Brand Collaborations & Campaigns</strong>
                    Worked with brands like Timbuckdo, HyugaLife, and Molten, executing campaigns and partnerships end-to-end
                </li>
                <li>
                    <strong class="text-white block text-xl mb-2">• Community Impact & Service</strong>
                    Organised multiple community service events, engaging and connecting with 60+ children through meaningful initiatives
                </li>
                <li>
                    <strong class="text-white block text-xl mb-2">• Execution-Driven & Systems Focused</strong>
                    Building reliable systems across events and influencer marketing to ensure consistency, clarity, and scalable impact
                </li>
            </ul>
        `
    }
};

/* --- Portfolio / Case Study Data --- */
const portfolioData = {
    heyPesto: {
        title: 'Hey Pesto',
        subtitle: 'Transforming a pasta business through strategic marketing.',
        content: `
            <div class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="portfolio-graphic group" onclick="animateBars()">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase text-sm tracking-widest">Growth Metrics</h4>
                        <div class="space-y-6">
                            <div>
                                <div class="flex justify-between text-xs mb-1 uppercase text-white/40 font-bold"><span>Reach Growth</span><span>+300%</span></div>
                                <div class="interactive-bar"><div class="bar-fill" style="width: 85%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1 uppercase text-white/40 font-bold"><span>Engagement</span><span>7x</span></div>
                                <div class="interactive-bar"><div class="bar-fill" style="width: 80%"></div></div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1 uppercase text-white/40 font-bold"><span>Conversions</span><span>+180%</span></div>
                                <div class="interactive-bar"><div class="bar-fill" style="width: 75%"></div></div>
                            </div>
                        </div>
                        <p class="text-[10px] text-white/20 mt-4 uppercase font-bold italic">Click card to re-animate</p>
                    </div>
                    <div class="glass p-8 rounded-[30px] border border-[#C8A96A]/30 bg-[#C8A96A]/5">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">Key Results</h4>
                        <ul class="space-y-3 text-white/80">
                            <li class="flex items-center gap-2"><i class="bx bx-trending-up text-[#C8A96A]"></i> 3M+ reach across Meta & Instagram</li>
                            <li class="flex items-center gap-2"><i class="bx bx-user-plus text-[#C8A96A]"></i> 1,200+ new followers</li>
                            <li class="flex items-center gap-2"><i class="bx bx-play-circle text-[#C8A96A]"></i> 2 trending reels</li>
                        </ul>
                    </div>
                </div>
                <div class="glass p-8 rounded-[30px] border border-white/10">
                    <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">Scope of Work</h4>
                    <ul class="grid md:grid-cols-2 gap-4 text-white/40">
                        <li class="flex items-center gap-2 hover:text-white transition-all cursor-default"><i class="bx bx-chevron-right text-[#C8A96A]"></i> Complete brand refresh</li>
                        <li class="flex items-center gap-2 hover:text-white transition-all cursor-default"><i class="bx bx-chevron-right text-[#C8A96A]"></i> Content strategy & calendar</li>
                        <li class="flex items-center gap-2 hover:text-white transition-all cursor-default"><i class="bx bx-chevron-right text-[#C8A96A]"></i> UGC creator campaigns</li>
                        <li class="flex items-center gap-2 hover:text-white transition-all cursor-default"><i class="bx bx-chevron-right text-[#C8A96A]"></i> Performance marketing</li>
                    </ul>
                </div>
            </div>
        `
    },
    fashion: {
        title: 'Fashion Dekho',
        subtitle: 'Lifestyle content creation and visual storytelling.',
        content: `
            <div class="space-y-8">
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="portfolio-graphic group overflow-hidden">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase text-sm tracking-widest">Brand Aesthetic</h4>
                        <div class="flex gap-2">
                            <div class="flex-1 aspect-[3/4] glass rounded-lg group-hover:scale-105 transition-all"></div>
                            <div class="flex-1 aspect-[3/4] bg-[#C8A96A]/10 rounded-lg group-hover:scale-95 transition-all border border-[#C8A96A]/30"></div>
                            <div class="flex-1 aspect-[3/4] glass rounded-lg group-hover:scale-105 transition-all"></div>
                        </div>
                        <p class="text-[10px] text-white/20 mt-4 uppercase font-bold italic">Curated Visual Language</p>
                    </div>
                    <div class="glass p-8 rounded-[30px] border border-white/10">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">Visual Tone</h4>
                        <ul class="space-y-4 text-white/60">
                            <li class="flex items-start gap-3 hover:translate-x-2 transition-all cursor-default"><i class="bx bx-check-circle text-[#C8A96A] mt-1"></i><span><strong>Content Creation:</strong> Production tailored for lifestyle audiences.</span></li>
                            <li class="flex items-start gap-3 hover:translate-x-2 transition-all cursor-default"><i class="bx bx-check-circle text-[#C8A96A] mt-1"></i><span><strong>Brand Integrity:</strong> Maintained tone & visuals across digital.</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    },
    page_mgmt: {
        title: 'Herwa Miss & Mrs India',
        subtitle: 'Page management and high-profile brand coordination.',
        content: `
            <div class="space-y-8">
                <div class="portfolio-graphic group flex items-center justify-between">
                    <div class="space-y-2">
                        <h4 class="text-3xl font-black text-white/10 group-hover:text-[#C8A96A] transition-all leading-none">HERWA</h4>
                        <p class="text-[10px] uppercase tracking-widest text-white/20 font-bold italic">National Pageant</p>
                    </div>
                    <div class="w-16 h-16 rounded-full glass border border-white/10 flex items-center justify-center group-hover:rotate-[360deg] transition-all duration-1000">
                        <i class="bx bx-crown text-3xl text-[#C8A96A]"></i>
                    </div>
                </div>
                <div class="glass p-8 rounded-[30px] border border-white/10">
                    <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">The Impact</h4>
                    <ul class="grid md:grid-cols-2 gap-4 text-white/40">
                        <li class="flex items-center gap-2"><i class="bx bx-check text-[#C8A96A]"></i> Social visibility</li>
                        <li class="flex items-center gap-2"><i class="bx bx-check text-[#C8A96A]"></i> Content support</li>
                        <li class="flex items-center gap-2"><i class="bx bx-check text-[#C8A96A]"></i> Event coordination</li>
                        <li class="flex items-center gap-2"><i class="bx bx-check text-[#C8A96A]"></i> Cycle execution</li>
                    </ul>
                </div>
            </div>
        `
    },
    consulting: {
        title: 'Consulting & Audits',
        subtitle: 'Strategic clarity for brands that need direction.',
        content: `
            <div class="space-y-8">
                <div class="portfolio-graphic group text-center py-12">
                    <i class="bx bx-search-alt text-6xl text-[#C8A96A] mb-6 opacity-40 group-hover:scale-125 group-hover:opacity-100 transition-all"></i>
                    <h4 class="text-xl font-bold uppercase tracking-widest text-white/60">Brand Diagnosis</h4>
                    <p class="text-xs text-white/20 mt-2 font-bold italic">"We see what others miss."</p>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="glass p-8 rounded-[30px] border border-white/10 hover:border-[#C8A96A]/50 transition-all">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">Core Services</h4>
                        <ul class="space-y-3 text-white/40">
                            <li class="hover:text-white transition-all">• Brand & social audits</li>
                            <li class="hover:text-white transition-all">• 1:1 strategy sessions</li>
                            <li class="hover:text-white transition-all">• Fix-my-content</li>
                            <li class="hover:text-white transition-all">• Team workshops</li>
                        </ul>
                    </div>
                    <div class="glass p-8 rounded-[30px] border border-[#C8A96A]/20">
                        <h4 class="text-[#C8A96A] font-bold mb-4 uppercase">The Goal</h4>
                        <p class="text-white/40">To move brands away from random acts of marketing and toward a cohesive, high-performance strategy.</p>
                    </div>
                </div>
            </div>
        `
    }
};
