try {
  var t = localStorage.getItem('theme') || 'auto';
  if (t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches))
    document.documentElement.setAttribute('data-theme', 'dark');
} catch (e) {}
