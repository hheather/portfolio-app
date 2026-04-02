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

  // ----------------------------------------------------------
  // VIEW SWITCHING
  // ----------------------------------------------------------
  const viewEls = {
    home:     document.getElementById('view-home'),
    projects: document.getElementById('view-projects'),
    contact:  document.getElementById('view-contact'),
  };
  const navLinks = Array.from(document.querySelectorAll('.top-nav .nav-link'));
  const navDotsEl = document.querySelector('.nav-dots');
  let currentView = 'home';

  function switchView(viewName) {
    Object.values(viewEls).forEach(v => v.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    viewEls[viewName].classList.add('active');
    const activeLink = document.querySelector(`.top-nav .nav-link[data-view="${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');

    navDotsEl.classList.toggle('hidden', viewName !== 'projects');
    currentView = viewName;
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => switchView(link.dataset.view));
  });

  // ----------------------------------------------------------
  // PROJECT THUMBNAILS: click to switch to projects view + scroll
  // ----------------------------------------------------------
  document.addEventListener('click', e => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    const index = parseInt(btn.dataset.project, 10);
    switchView('projects');
    // Wait for view to become visible before scrolling
    requestAnimationFrame(() => {
      const target = sections[index];
      if (target) target.scrollIntoView({ behavior: 'instant' });
      currentIndex = index;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    });
  });

  // ----------------------------------------------------------
  // NAV DOTS: click to jump to project section
  // ----------------------------------------------------------
  const container = document.getElementById('scroll-container');
  const sections  = Array.from(document.querySelectorAll('.section.project'));
  const dots      = Array.from(document.querySelectorAll('.nav-dots .dot'));

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

      const siblingBtns = document.querySelectorAll(
        `.tab-btn[data-project="${project}"]`
      );
      siblingBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const overviewPanel = document.getElementById(`overview-${project}`);
      const processPanel  = document.getElementById(`process-${project}`);

      overviewPanel.classList.toggle('active', tab === 'overview');
      processPanel.classList.toggle('active',  tab === 'process');

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
    if (currentView !== 'projects') return;
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

  } // end init

})();
