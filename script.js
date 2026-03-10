/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // SECTION LOADER: fetch HTML partials and inject into DOM
  // ----------------------------------------------------------
  async function loadSections() {
    const placeholders = Array.from(
      document.querySelectorAll('[data-include]')
    );
    await Promise.all(placeholders.map(async (el) => {
      const url = el.dataset.include;
      const res = await fetch(url);
      const html = await res.text();
      el.outerHTML = html;
    }));
  }

  loadSections().then(init);

  function init() {

  const container = document.getElementById('scroll-container');
  const sections  = Array.from(document.querySelectorAll('.section'));
  const dots      = Array.from(document.querySelectorAll('.nav-dots .dot'));

  // ----------------------------------------------------------
  // NAV DOTS: click to jump to section
  // ----------------------------------------------------------
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      sections[index].scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ----------------------------------------------------------
  // NAV DOTS: update active dot as user scrolls
  // ----------------------------------------------------------
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }
      });
    },
    {
      root: container,
      threshold: 0.5,
    }
  );

  sections.forEach(section => observer.observe(section));

  // ----------------------------------------------------------
  // TAB SWITCHING (Overview / Process) per project
  // ----------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab     = btn.dataset.tab;
      const project = btn.dataset.project;

      // Deactivate sibling buttons
      const siblingBtns = document.querySelectorAll(
        `.tab-btn[data-project="${project}"]`
      );
      siblingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show correct panel
      const overviewPanel = document.getElementById(`overview-${project}`);
      const processPanel  = document.getElementById(`process-${project}`);

      overviewPanel.classList.toggle('active', tab === 'overview');
      processPanel.classList.toggle('active',  tab === 'process');

      // Toggle process-active on the project inner for left-column switching
      const projectInner = btn.closest('.project-inner');
      if (projectInner) {
        projectInner.classList.toggle('process-active', tab === 'process');
      }
    });
  });

  // ----------------------------------------------------------
  // KEYBOARD NAVIGATION (arrow keys / page up/down)
  // ----------------------------------------------------------
  let currentIndex = 0;
  let isScrolling  = false;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length || isScrolling) return;
    isScrolling = true;
    currentIndex = index;
    sections[index].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { isScrolling = false; }, 800);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSection(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSection(currentIndex - 1);
    }
  });

  // Keep currentIndex in sync with scroll observer
  const indexObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          currentIndex = sections.indexOf(entry.target);
        }
      });
    },
    { root: container, threshold: 0.5 }
  );

  sections.forEach(s => indexObserver.observe(s));

  // ----------------------------------------------------------
  // P5.JS GRID BACKGROUND: fixed behind entire site
  // ----------------------------------------------------------
  (function initGrid() {
    if (typeof p5 === 'undefined') return;

    new p5(function (p) {
      const GRID = 20;
      let dots = [];

      function buildDots() {
        dots = [];
        for (let x = 0; x <= p.width; x += GRID) {
          for (let y = 0; y <= p.height; y += GRID) {
            dots.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0 });
          }
        }
      }

      p.setup = function () {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('position', 'fixed');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '-1');
        canvas.style('pointer-events', 'none');
        canvas.parent(document.body);
        buildDots();
      };

      p.draw = function () {
        p.clear();
        p.noStroke();

        const mx = p.mouseX;
        const my = p.mouseY;

        const RADIUS = 150;

        for (const dot of dots) {
          const dx = mx - dot.x;
          const dy = my - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Attract toward mouse only within radius
          if (dist < RADIUS) {
            const strength = 1 - dist / RADIUS; // fades to 0 at edge
            dot.vx += (dx / dist) * 1.2 * strength;
            dot.vy += (dy / dist) * 1.2 * strength;
            p.fill(0, 0, 255, 180);
          } else {
            p.fill(0, 0, 0, 90);
          }

          // Spring back to home position
          dot.vx += (dot.hx - dot.x) * 0.04;
          dot.vy += (dot.hy - dot.y) * 0.04;

          // Damping
          dot.vx *= 0.92;
          dot.vy *= 0.92;

          dot.x += dot.vx;
          dot.y += dot.vy;

          p.circle(dot.x, dot.y, 1.5);
        }
      };

      p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        buildDots();
      };
    });
  })();

  // ----------------------------------------------------------
  // TOUCH SWIPE: horizontal swipe on landing navigates to next section
  // (touch-action: pan-y on landing blocks native horizontal scroll)
  // ----------------------------------------------------------
  const landing = document.querySelector('.landing');
  if (landing) {
    let touchStartX = 0;
    let touchStartY = 0;

    landing.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    landing.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        scrollToSection(dx < 0 ? currentIndex + 1 : currentIndex - 1);
      }
    }, { passive: true });
  }

  // ----------------------------------------------------------
  // HASH NAVIGATION: jump to section on page load
  // ----------------------------------------------------------
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      const index = sections.indexOf(target);
      if (index !== -1) scrollToSection(index);
    }
  }

  } // end init

})();
