import { useEffect, useState } from 'react';

export type HubTheme = 'light' | 'dark';
export const themeStorageKey = 'racerops:hub-theme';
export const themeColors = { light: '#f5f7fb', dark: '#090f1c' };

export function readTheme(): HubTheme {
  try { return window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function saveTheme(theme: HubTheme) {
  try { window.localStorage.setItem(themeStorageKey, theme); } catch { /* Storage can be disabled in private browsing. */ }
}

export function applyTheme(theme: HubTheme, doc: Document) {
  const root = doc.documentElement, meta = doc.querySelector('meta[name="theme-color"]');
  const previous = { theme: root.dataset.hubTheme, scheme: root.style.colorScheme, dark: root.classList.contains('dark'), chrome: meta?.getAttribute('content') };
  root.dataset.hubTheme = theme; root.style.colorScheme = theme; root.classList.toggle('dark', theme === 'dark');
  meta?.setAttribute('content', themeColors[theme]);
  return () => {
    if (previous.theme === undefined) delete root.dataset.hubTheme; else root.dataset.hubTheme = previous.theme;
    root.style.colorScheme = previous.scheme; root.classList.toggle('dark', previous.dark);
    if (previous.chrome === null) meta?.removeAttribute('content'); else if (previous.chrome !== undefined) meta?.setAttribute('content', previous.chrome);
  };
}

export function useHubTheme() {
  const [theme, setTheme] = useState<HubTheme>(readTheme);
  useEffect(() => { saveTheme(theme); return applyTheme(theme, document); }, [theme]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === themeStorageKey || event.key === null) setTheme(readTheme()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return { theme, toggleTheme: () => setTheme(current => current === 'light' ? 'dark' : 'light') };
}
