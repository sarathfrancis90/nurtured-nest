/* ─── Mobile Bottom Nav: Appear on Load ──────────────────────────────────── */
window.addEventListener('load', () => {
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) {
    requestAnimationFrame(() => mobileNav.classList.add('nav-visible'));
  }
});

/* ─── Scroll-Based Active Nav State (Intersection Observer) ──────────────── */
const sections = document.querySelectorAll('section[id]');
const desktopLinks = document.querySelectorAll('#desktop-nav .nav-link');
const mobileItems = document.querySelectorAll('#mobile-nav .mobile-nav-item');

function setActiveNav(sectionId) {
  // Desktop nav links
  desktopLinks.forEach(link => {
    const isActive = link.dataset.section === sectionId;
    link.classList.toggle('text-primary', isActive);
    link.classList.toggle('font-bold', isActive);
    link.classList.toggle('text-on-surface-variant', !isActive);
  });

  // Mobile nav items — update color and dot indicator
  mobileItems.forEach(item => {
    const isActive = item.dataset.section === sectionId;
    item.classList.toggle('text-primary', isActive);
    item.classList.toggle('font-bold', isActive);
    item.classList.toggle('text-on-surface-variant', !isActive);

    // Dot indicator
    let dot = item.querySelector('.nav-dot');
    if (isActive) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'nav-dot w-1 h-1 rounded-full bg-primary block';
        item.appendChild(dot);
      }
    } else {
      if (dot) dot.remove();
    }
  });
}

// Default to #home on load
setActiveNav('home');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActiveNav(entry.target.id);
    }
  });
}, {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0,
});

sections.forEach(section => navObserver.observe(section));

/* ─── Scroll-Triggered Section Reveal Animations ────────────────────────── */
// Hero section is excluded — it should be visible immediately on load
const revealElements = document.querySelectorAll('.section-reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // One-time reveal — stop observing after triggered
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
});

revealElements.forEach(el => revealObserver.observe(el));

/* ─── Gentle Parallax on Decorative Blobs ────────────────────────────────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  const blobs = document.querySelectorAll('.breathe');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        blobs.forEach((blob, i) => {
          const speed = 0.03 + (i * 0.01);
          blob.style.transform = `translateY(${scrollY * speed}px) scale(${1 + Math.sin(Date.now() / 3000) * 0.15})`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ─── Nav glassmorphism: increase opacity on scroll ──────────────────────── */
const desktopNav = document.getElementById('desktop-nav');

/* ─── Scroll Progress Bar ────────────────────────────────────────────────── */
const scrollProgress = document.getElementById('scroll-progress');

/* ─── Combined Scroll Handler (perf: single listener) ───────────────────── */
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (!scrollTick) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;

      // Scroll progress bar
      if (scrollProgress) {
        scrollProgress.style.transform = `scaleX(${progress})`;
      }

      // Nav glass deepen on scroll
      if (desktopNav && !prefersReducedMotion) {
        desktopNav.style.background = scrollY > 50
          ? 'rgba(255, 251, 255, 0.88)'
          : 'rgba(255, 251, 255, 0.70)';
      }

      scrollTick = false;
    });
    scrollTick = true;
  }
});

/* ─── Image Reveal on Scroll (clip-path wipe) ────────────────────────────── */
const imageRevealElements = document.querySelectorAll('.image-reveal:not(.hero-fade)');

const imageRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      imageRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

imageRevealElements.forEach(el => imageRevealObserver.observe(el));

/* ─── Cursor Warm Glow (desktop only) ────────────────────────────────────── */
if (!prefersReducedMotion) {
  const glow = document.getElementById('cursor-glow');
  if (glow && window.matchMedia('(min-width: 1024px)').matches) {
    let glowX = 0, glowY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      glowX = e.clientX;
      glowY = e.clientY;
    });

    // Smooth follow with lerp for dreamy feel
    function animateGlow() {
      currentX += (glowX - currentX) * 0.08;
      currentY += (glowY - currentY) * 0.08;
      glow.style.left = currentX + 'px';
      glow.style.top = currentY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Fade out when cursor leaves window
    document.addEventListener('mouseleave', () => glow.style.opacity = '0');
    document.addEventListener('mouseenter', () => glow.style.opacity = '1');
  }
}
