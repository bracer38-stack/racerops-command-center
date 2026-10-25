import { Moon, Sun } from 'lucide-react';
import type { HubTheme } from './theme';

export function ThemeToggle({ theme, toggle }: { theme: HubTheme; toggle: () => void }) {
  const Icon = theme === 'light' ? Sun : Moon;
  return <button type="button" role="switch" aria-label="Dark mode" aria-checked={theme === 'dark'} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} className="hub-button hub-theme-toggle" onClick={toggle}>
    <Icon size={16} aria-hidden="true"/><span>{theme === 'light' ? 'Light' : 'Dark'}</span><span className="hub-theme-track" aria-hidden="true"><span/></span>
  </button>;
}
