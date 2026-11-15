(() => {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    btn?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-hidden', String(!open));
    menu?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  };
  btn?.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('click', (e) => {
    if (menu?.classList.contains('open') && !menu.contains(e.target) && !btn?.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('open')) setMenu(false);
  });

  const KEY = 'theme';
  const stored = () => {
    try {
      return localStorage.getItem(KEY) ?? 'auto';
    } catch {
      return 'auto';
    }
  };
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const apply = (theme) => {
    const isDark = theme === 'dark' || (theme === 'auto' && dark.matches);
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    for (const b of document.querySelectorAll('[data-theme-value]')) {
      b.setAttribute('aria-pressed', String(b.dataset.themeValue === theme));
    }
  };
  for (const group of document.querySelectorAll('.theme-toggle')) group.hidden = false;
  apply(stored());
  for (const b of document.querySelectorAll('[data-theme-value]')) {
    b.addEventListener('click', () => {
      const theme = b.dataset.themeValue ?? 'auto';
      try {
        localStorage.setItem(KEY, theme);
      } catch {}
      apply(theme);
    });
  }
  dark.addEventListener('change', () => {
    if (stored() === 'auto') apply('auto');
  });
})();
