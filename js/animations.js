
/**
 * js/animations.js
 * Premium animations for The Fifth Element
 */

// Register ScrollTrigger
if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// Initialize all animations
function initAnimations() {
  initScrollReveal();
  initTimeline();
  initMagneticButtons();
  initNavbarScroll();
  initHeroReveal();
  initParallax();
  initVideoHoverFullscreen();
}

// Scroll Reveal with Intersection Observer
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (gsap) {
          gsap.fromTo(entry.target,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
          );
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// Hero Text Reveal
function initHeroReveal() {
  if (!gsap) return;
  const heroElements = document.querySelectorAll('#hero-section .reveal');
  if (heroElements.length === 0) return;

  gsap.fromTo(heroElements,
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.3
    }
  );
}

// Parallax Background
function initParallax() {
  const heroBackground = document.querySelector('.hero-background');
  if (!heroBackground) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroBackground.style.transform = `translateY(${scrollY * 0.2}px)`;
  });
}

// Premium Timeline Animation
function initTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    const progressFill = document.getElementById('timeline-progress-fill');
    const steps = document.querySelectorAll('.timeline-step');

    if (!timelineContainer || !progressFill || steps.length === 0 || !gsap) return;

    // Kill any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === timelineContainer) {
            st.kill();
        }
    });

    // Reset initial state for all steps
    steps.forEach((step) => {
        const circle = step.querySelector('.timeline-circle');
        const glow = step.querySelector('.timeline-glow');
        const number = step.querySelector('.timeline-circle span');
        const card = step.querySelector('.timeline-card');
        const cardTitle = card ? card.querySelector('h4') : null;
        const cardDesc = card ? card.querySelector('p') : null;
        if (circle) gsap.set(circle, { scale: 1, borderColor: 'rgba(245, 243, 239, 0.4)' });
        if (glow) gsap.set(glow, { opacity: 0 });
        if (number) gsap.set(number, { color: 'rgba(245, 243, 239, 0.8)' });
        if (card) gsap.set(card, { opacity: 0.8, y: 0, boxShadow: 'none' });
        if (cardTitle) gsap.set(cardTitle, { opacity: 1, y: 0 });
        if (cardDesc) gsap.set(cardDesc, { opacity: 1, y: 0 });
    });
    gsap.set(progressFill, { width: '0%' });

    // Create main timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: timelineContainer,
            pin: true,
            start: 'center center', // Start when timeline's center reaches center of viewport
            end: '+=300%', // Even longer scroll duration for premium feel
            scrub: true, // 1:1 scrub with scroll
            anticipatePin: 1,
            onLeaveBack: () => {
                // Reset when scrolling back past the start
                gsap.set(progressFill, { width: '0%' });
                steps.forEach((step) => {
                    const circle = step.querySelector('.timeline-circle');
                    const glow = step.querySelector('.timeline-glow');
                    const number = step.querySelector('.timeline-circle span');
                    const card = step.querySelector('.timeline-card');
                    const cardTitle = card ? card.querySelector('h4') : null;
                    const cardDesc = card ? card.querySelector('p') : null;
                    if (circle) gsap.set(circle, { scale: 1, borderColor: 'rgba(245, 243, 239, 0.2)' });
                    if (glow) gsap.set(glow, { opacity: 0 });
                    if (number) gsap.set(number, { color: 'rgba(245, 243, 239, 0.6)' });
                    if (card) gsap.set(card, { opacity: 0.4, y: 0, boxShadow: 'none' });
                    if (cardTitle) gsap.set(cardTitle, { opacity: 0, y: 10 });
                    if (cardDesc) gsap.set(cardDesc, { opacity: 0, y: 10 });
                });
            }
        }
    });

    // Progress line animation (first 80% of timeline)
    tl.to(progressFill, {
        width: '100%',
        ease: 'none',
        duration: 0.8
    }, 0);

    // Animate each step
    steps.forEach((step, index) => {
        const circle = step.querySelector('.timeline-circle');
        const glow = step.querySelector('.timeline-glow');
        const number = step.querySelector('.timeline-circle span');
        const card = step.querySelector('.timeline-card');
        const cardTitle = card ? card.querySelector('h4') : null;
        const cardDesc = card ? card.querySelector('p') : null;

        if (!circle || !card) return;

        // Calculate timing for each step (spread across 0-0.8)
        const stepStart = index * 0.16; // 0, 0.16, 0.32, 0.48, 0.64
        const stepMid = stepStart + 0.08;

        // Step activation
        tl.to(circle, { scale: 1.08, borderColor: '#C8A96A', ease: 'none', duration: 0.01 }, stepStart);
        tl.to(glow, { opacity: 1, ease: 'none', duration: 0.01 }, stepStart);
        tl.to(number, { color: '#F5F3EF', ease: 'none', duration: 0.01 }, stepStart);
        tl.to(card, { opacity: 1, y: -12, boxShadow: '0 20px 40px -10px rgba(200, 169, 106, 0.12)', ease: 'power2.out', duration: 0.1 }, stepMid);
        if (cardTitle) tl.to(cardTitle, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.08 }, stepMid + 0.02);
        if (cardDesc) tl.to(cardDesc, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.08 }, stepMid + 0.04);
    });

    // Add buffer at end (last 20% of timeline, do nothing)
}

// Magnetic Buttons
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (gsap) {
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (gsap) {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  });
}

// Navbar scroll effect
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Easter Eggs
let logoClickCount = 0;

function handleLogoClick() {
  logoClickCount++;
  if (logoClickCount === 3) {
    document.body.classList.add('gold-mode');
    setTimeout(() => {
      document.body.classList.remove('gold-mode');
      logoClickCount = 0;
    }, 3000);
  }
}

// Click to gold dot effect
window.addEventListener('click', (e) => {
  const dot = document.createElement('div');
  dot.className = 'fifth-element-point';
  dot.style.left = (e.clientX - 4) + 'px';
  dot.style.top = (e.clientY - 4) + 'px';
  document.body.appendChild(dot);
  dot.offsetHeight;
  setTimeout(() => dot.remove(), 800);
});

// Konami Code
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiBuffer = [];
let warpActive = false;
let warpPoints = [];
let warpCanvas, warpCtx;

function initWarp() {
  warpCanvas = document.getElementById('warpCanvas');
  if (!warpCanvas) return;
  warpCtx = warpCanvas.getContext('2d');
  warpCanvas.width = window.innerWidth;
  warpCanvas.height = window.innerHeight;
  warpPoints = [];
  for (let i = 0; i < 500; i++) {
    warpPoints.push({
      x: Math.random() * warpCanvas.width - warpCanvas.width / 2,
      y: Math.random() * warpCanvas.height - warpCanvas.height / 2,
      z: Math.random() * warpCanvas.width
    });
  }
}

function drawWarp() {
  if (!warpActive) return;
  warpCtx.fillStyle = 'rgba(11, 11, 11, 0.2)';
  warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);
  warpCtx.translate(warpCanvas.width / 2, warpCanvas.height / 2);

  warpPoints.forEach(p => {
    p.z -= 15;
    if (p.z <= 0) p.z = warpCanvas.width;
    const x = p.x * (warpCanvas.width / p.z);
    const y = p.y * (warpCanvas.width / p.z);
    const s = Math.min(10, 500 / p.z);
    warpCtx.fillStyle = `rgba(200, 169, 106, ${1 - p.z / warpCanvas.width})`;
    if (Math.random() > 0.5) {
      warpCtx.beginPath();
      warpCtx.arc(x, y, s / 2, 0, Math.PI * 2);
      warpCtx.fill();
    } else {
      warpCtx.font = `${s * 2}px Inter`;
      warpCtx.fillText('!', x, y);
    }
  });

  warpCtx.setTransform(1, 0, 0, 1, 0, 0);
  requestAnimationFrame(drawWarp);
}

function closeKonami() {
  const overlay = document.getElementById('konamiOverlay');
  if (overlay) overlay.style.display = 'none';
  warpActive = false;
}

window.addEventListener('keydown', (e) => {
  konamiBuffer.push(e.key);
  konamiBuffer = konamiBuffer.slice(-10);

  if (JSON.stringify(konamiBuffer) === JSON.stringify(KONAMI_CODE)) {
    const overlay = document.getElementById('konamiOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      warpActive = true;
      initWarp();
      drawWarp();
    }
  }
});

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  // Initialize animations
  initAnimations();
  
  // Styled console signature
  console.log('%cTHE FIFTH ELEMENT.', 'color:#C8A96A;font-size:50px;font-weight:900;font-family:Inter,sans-serif;text-shadow:2px 2px 0px #0B0B0B;');
});

function initVideoHoverFullscreen() {
  const overlay = document.getElementById('videoHoverOverlay');
  const overlayPlayer = document.getElementById('videoHoverOverlayPlayer');
  if (!overlay || !overlayPlayer) return;

  let activeVideo = null;
  let activeContainerRect = null;

  document.addEventListener('mouseover', (e) => {
    const container = e.target.closest('.luxury-image-container');
    if (!container) return;

    const video = container.querySelector('video');
    if (!video) return;

    if (activeVideo === video) return;

    activeVideo = video;
    activeContainerRect = container.getBoundingClientRect();

    overlayPlayer.src = video.src;
    overlayPlayer.currentTime = video.currentTime;
    
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    overlayPlayer.play().catch(() => {});
  });

  window.addEventListener('mousemove', (e) => {
    if (!activeVideo || !activeContainerRect) return;

    const { clientX, clientY } = e;
    const rect = activeContainerRect;
    const buffer = 20;
    
    const isOutside = (
      clientX < rect.left - buffer ||
      clientX > rect.right + buffer ||
      clientY < rect.top - buffer ||
      clientY > rect.bottom + buffer
    );

    if (isOutside) {
      if (activeVideo) {
        activeVideo.currentTime = overlayPlayer.currentTime;
      }
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlayPlayer.pause();
      overlayPlayer.removeAttribute('src');
      overlayPlayer.load();
      activeVideo = null;
      activeContainerRect = null;
    }
  });
}

// Expose functions globally
window.initTimelineAnimation = initTimeline;
window.handleLogoClick = handleLogoClick;
window.closeKonami = closeKonami;
