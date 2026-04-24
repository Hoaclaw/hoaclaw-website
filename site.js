(function () {
  'use strict';

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const panel = document.getElementById('mobile-nav');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function () {
      const willOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(willOpen));
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function formatDate(raw) {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function parseAnnouncements(markdown) {
    const blocks = markdown.split(/^##\s+/m).map(function (s) { return s.trim(); }).filter(Boolean);
    return blocks.map(function (chunk) {
      const lines = chunk.split('\n');
      const title = (lines[0] || '').trim();
      const date = (lines[1] || '').trim();
      const bodyMd = lines.slice(2).join('\n').trim();
      const body = (typeof marked !== 'undefined' && marked.parse)
        ? marked.parse(bodyMd)
        : '<p>' + bodyMd.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
      return { title: title, date: date, body: body };
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderCarousel(items) {
    const track = document.getElementById('announce-track');
    const dots = document.getElementById('announce-dots');
    const prev = document.getElementById('announce-prev');
    const next = document.getElementById('announce-next');
    const wrap = document.getElementById('announce-wrap');
    if (!track || !dots || !wrap) return;

    track.innerHTML = items.map(function (it) {
      return (
        '<article class="carousel-slide">' +
          '<div class="bg-white rounded-3xl border border-sage-100 shadow-soft p-8 md:p-12">' +
            '<div class="flex items-center gap-2 text-sage-700 text-sm font-semibold mb-4">' +
              '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
                '<rect x="3" y="5" width="18" height="16" rx="2"/>' +
                '<path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/>' +
              '</svg>' +
              '<time>' + escapeHtml(formatDate(it.date)) + '</time>' +
            '</div>' +
            '<h3 class="font-display text-2xl md:text-3xl text-sage-900 font-semibold mb-4 tracking-tight">' + escapeHtml(it.title) + '</h3>' +
            '<div class="announcement-body text-slate-600 leading-relaxed">' + it.body + '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    dots.innerHTML = items.map(function (_, i) {
      return (
        '<button class="carousel-dot bg-sage-200" style="width:0.625rem" data-i="' + i + '" role="tab" aria-label="Go to announcement ' + (i + 1) + '"></button>'
      );
    }).join('');

    const total = items.length;
    let idx = 0;
    let timer = null;

    function render() {
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.querySelectorAll('.carousel-dot').forEach(function (d, i) {
        if (i === idx) {
          d.classList.remove('bg-sage-200');
          d.classList.add('bg-sage-700');
          d.style.width = '1.75rem';
          d.setAttribute('aria-selected', 'true');
        } else {
          d.classList.remove('bg-sage-700');
          d.classList.add('bg-sage-200');
          d.style.width = '0.625rem';
          d.setAttribute('aria-selected', 'false');
        }
      });
    }

    function go(n) {
      idx = ((n % total) + total) % total;
      render();
      resetTimer();
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      if (total > 1) {
        timer = setInterval(function () { go(idx + 1); }, 7000);
      }
    }

    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });
    dots.querySelectorAll('.carousel-dot').forEach(function (b) {
      b.addEventListener('click', function () { go(parseInt(b.dataset.i, 10)); });
    });

    wrap.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    wrap.addEventListener('mouseleave', resetTimer);

    let touchStartX = null;
    wrap.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1);
      touchStartX = null;
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (document.activeElement && wrap.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') go(idx - 1);
        if (e.key === 'ArrowRight') go(idx + 1);
      }
    });

    if (total <= 1) {
      if (prev) prev.classList.add('invisible');
      if (next) next.classList.add('invisible');
      dots.classList.add('hidden');
    }

    render();
    resetTimer();
  }

  function showEmptyAnnouncements() {
    const wrap = document.getElementById('announce-wrap');
    const empty = document.getElementById('announce-empty');
    if (wrap) wrap.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  }

  async function loadAnnouncements() {
    const track = document.getElementById('announce-track');
    if (!track) return;

    try {
      const res = await fetch('announcements.md', { cache: 'no-cache' });
      if (!res.ok) throw new Error('not found: ' + res.status);
      const md = await res.text();
      const items = parseAnnouncements(md);
      if (!items.length) {
        showEmptyAnnouncements();
        return;
      }
      renderCarousel(items);
    } catch (err) {
      console.warn('HOAClaw announcements:', err.message || err);
      showEmptyAnnouncements();
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(function () {
    initMobileNav();
    initScrollReveal();
    loadAnnouncements();
  });
})();
