// Theme toggle, mobile menu and photo carousels.
(() => {
  const KEY = 'theme';
  const stored = () => {
    try {
      return localStorage.getItem(KEY) ?? 'auto';
    } catch {
      return 'auto';
    }
  };
  const dark = matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === 'auto' && dark.matches);
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    for (const btn of document.querySelectorAll('[data-theme-value]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeValue === theme));
    }
  }

  applyTheme(stored());
  for (const btn of document.querySelectorAll('[data-theme-value]')) {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.themeValue ?? 'auto';
      try {
        localStorage.setItem(KEY, theme);
      } catch {}
      applyTheme(theme);
    });
  }
  dark.addEventListener('change', () => {
    if (stored() === 'auto') applyTheme('auto');
  });

  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  menuBtn?.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    mobileNav?.setAttribute('aria-hidden', String(expanded));
  });

  for (const carousel of document.querySelectorAll('[data-carousel]')) {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
    if (!track) continue;
    carousel.classList.add('is-ready');
    const index = () => Math.round(track.scrollLeft / track.clientWidth);
    const go = (i) => track.scrollTo({ left: i * track.clientWidth });
    const sync = () => {
      const i = index();
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= dots.length - 1;
      dots.forEach((dot, j) => {
        dot.classList.toggle('is-active', j === i);
        dot.setAttribute('aria-current', j === i ? 'true' : 'false');
      });
    };
    prev?.addEventListener('click', () => go(index() - 1));
    next?.addEventListener('click', () => go(index() + 1));
    dots.forEach((dot, j) => dot.addEventListener('click', () => go(j)));
    track.addEventListener('scroll', sync, { passive: true });
    sync();
  }
})();
