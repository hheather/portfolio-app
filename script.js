/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

(function () {
  'use strict';

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
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSection(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
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

})();
