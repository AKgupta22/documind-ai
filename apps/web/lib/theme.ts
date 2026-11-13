export const THEME_STORAGE_KEY = 'documind-theme';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_INIT_SCRIPT = `(function () {
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = window.localStorage.getItem(key);
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (error) {
    void error;
  }
})();`;
