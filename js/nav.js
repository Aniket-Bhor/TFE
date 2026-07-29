/**
 * js/nav.js
 * ─────────────────────────────────────────────────────────────
 * Mobile menu toggle, navbar scroll effect, and mobile nav helper.
 * Page navigation is handled by js/router.js — showPage() is
 * defined there as a backward-compat shim.
 * ─────────────────────────────────────────────────────────────
 */

/** Toggle the full-screen mobile navigation overlay. */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menu-icon');
    if (!menu || !icon) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
        icon.setAttribute('data-lucide', 'x');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        icon.setAttribute('data-lucide', 'menu');
        document.body.style.overflow = 'auto';
    }

    if (window.lucide) lucide.createIcons();
}

/** Navigate + close the mobile menu. */
function showPageMobile(pageId) {
    router.navigate(pageId);
    toggleMobileMenu();
}

/* Navbar glass scroll effect */
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});
