(function () {
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  var current = document.documentElement.dataset.theme;
  function apply(theme, persist) {
    if (theme === current) return;
    current = theme;
    document.documentElement.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem('sonzeraTheme', theme); } catch (_) { }
    }
    btn.setAttribute('aria-label',
      theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  btn.setAttribute('aria-label',
    current === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');

  btn.addEventListener('click', function () {
    apply(current === 'dark' ? 'light' : 'dark', true);
  });

  mq.addEventListener('change', function (e) {
    var stored = null;
    try { stored = localStorage.getItem('sonzeraTheme'); } catch (_) { }
    if (!stored) apply(e.matches ? 'dark' : 'light', false);
  });
})();
