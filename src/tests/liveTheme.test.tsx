/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CloudCommandHub from '../live/CloudCommandHub';
import { ThemeToggle } from '../live/ThemeToggle';
import { applyTheme, readTheme, saveTheme, themeColors, themeStorageKey } from '../live/theme';

afterEach(() => vi.unstubAllGlobals());

function storage(value?: string) {
  const values = new Map<string, string>(value === undefined ? [] : [[themeStorageKey, value]]);
  vi.stubGlobal('window', { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, next: string) => { values.set(key, next); } } });
  return values;
}

describe('hub theme preference', () => {
  it.each([undefined, '', 'LIGHT', 'system', 'unrecognized', 'light'])('defaults to light for preference %s', value => {
    storage(value); expect(readTheme()).toBe('light');
  });
  it('restores a saved dark preference and remembers both choices without changing business data', () => {
    const values = storage('dark'); values.set('racerops-legacy-data', 'private records');
    expect(readTheme()).toBe('dark');
    saveTheme('light'); expect(readTheme()).toBe('light');
    saveTheme('dark'); expect(readTheme()).toBe('dark');
    expect(values.get('racerops-legacy-data')).toBe('private records');
  });
  it('uses light on another device with no saved preference, regardless of OS color scheme', () => {
    storage('dark'); expect(readTheme()).toBe('dark');
    storage(); expect(readTheme()).toBe('light');
  });
  it('continues without persistent storage when browser access is blocked', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('Access denied'); } });
    expect(readTheme()).toBe('light'); expect(() => saveTheme('dark')).not.toThrow();
  });
  it('tolerates storage quota failures and non-browser rendering', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => 'dark', setItem: () => { throw new Error('Quota exceeded'); } } });
    expect(readTheme()).toBe('dark'); expect(() => saveTheme('light')).not.toThrow();
    vi.stubGlobal('window', undefined);
    expect(readTheme()).toBe('light'); expect(() => saveTheme('dark')).not.toThrow();
  });
  it.each(['light', 'dark'] as const)('renders accessible %s switch state and explicit next action', theme => {
    const html = renderToStaticMarkup(<ThemeToggle theme={theme} toggle={() => {}}/>);
    expect(html).toContain('type="button"'); expect(html).toContain('role="switch"');
    expect(html).toContain('aria-label="Dark mode"'); expect(html).toContain(`aria-checked="${theme === 'dark'}"`);
    expect(html).toContain(`title="Switch to ${theme === 'light' ? 'dark' : 'light'} mode"`);
  });
  it.each([undefined, 'dark'])('uses the selected palette on the first loading render (%s)', value => {
    storage(value); vi.stubGlobal('navigator', { onLine: true });
    const html = renderToStaticMarkup(<CloudCommandHub/>);
    expect(html).toContain(`data-hub-theme="${value ?? 'light'}"`);
    expect(html).toContain('Opening your command hub');
  });
  it.each(['light', 'dark'] as const)('applies %s browser chrome and native control styling, with reversible cleanup', theme => {
    const classes = new Set(['dark']);
    const root = { dataset: {} as Record<string, string>, style: { colorScheme: '' }, classList: {
      contains: (name: string) => classes.has(name),
      toggle: (name: string, active: boolean) => { if (active) classes.add(name); else classes.delete(name); },
    } };
    const attributes = new Map([['content', '#original']]);
    const meta = { getAttribute: (key: string) => attributes.get(key) ?? null, setAttribute: (key: string, value: string) => attributes.set(key, value), removeAttribute: (key: string) => attributes.delete(key) };
    const doc = { documentElement: root, querySelector: () => meta } as unknown as Document;
    const restore = applyTheme(theme, doc);
    expect(root.dataset.hubTheme).toBe(theme); expect(root.style.colorScheme).toBe(theme);
    expect(classes.has('dark')).toBe(theme === 'dark'); expect(attributes.get('content')).toBe(themeColors[theme]);
    restore(); expect(root.dataset.hubTheme).toBeUndefined(); expect(root.style.colorScheme).toBe('');
    expect(classes.has('dark')).toBe(true); expect(attributes.get('content')).toBe('#original');
  });
});

const css = readFileSync(new URL('../live/theme.css', import.meta.url), 'utf8');
const hubCss = readFileSync(new URL('../live/hub.css', import.meta.url), 'utf8');
function variables(block: string) { return Object.fromEntries([...block.matchAll(/--hub-([\w-]+):\s*(#[\da-f]+)/g)].map(match => [match[1], match[2]])); }
const [light, dark] = css.split('}').slice(0, 2).map(variables);
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

describe('hub palette coverage and contrast', () => {
  it('defines matching palettes for every token used in the hub and theme controls', () => {
    expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
    const used = [...(hubCss + css).matchAll(/var\(--hub-([\w-]+)\)/g)].map(match => match[1]);
    for (const name of used) { expect(light, name).toHaveProperty(name); expect(dark, name).toHaveProperty(name); }
  });
  for (const [name, palette] of Object.entries({ light, dark })) {
    it(`${name} text/accent pairings meet 4.5:1 contrast`, () => {
      const pairs: [string, string[]][] = [
        ['text', ['bg', 'surface', 'surface-alt', 'surface-raised', 'control', 'control-hover', 'input']],
        ['secondary', ['surface', 'surface-alt', 'surface-raised', 'input']],
        ['muted', ['bg', 'surface', 'surface-alt', 'surface-raised', 'control', 'control-hover', 'input']],
        ['accent', ['surface', 'surface-alt', 'surface-raised', 'accent-soft', 'assistant-accent', 'user-bg']],
        ['pink', ['surface', 'pink-soft']], ['violet', ['surface']], ['green', ['surface', 'surface-alt']],
        ['warning-text', ['warning-bg']], ['error-text', ['error-bg', 'surface']],
        ['primary-text', ['primary', 'primary-hover']], ['user-text', ['user-bg']],
      ];
      for (const [foreground, backgrounds] of pairs) for (const background of backgrounds) {
        expect(contrast(palette[foreground], palette[background]), `${name}: ${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast('#ffffff', palette['pink-button'])).toBeGreaterThanOrEqual(4.5);
    });
    it(`${name} control outlines meet 3:1 contrast`, () => {
      for (const surface of ['surface', 'input', 'control']) expect(contrast(palette['control-border'], palette[surface]), `${name}: control border on ${surface}`).toBeGreaterThanOrEqual(3);
    });
  }
  it('uses the light default for install metadata and browser chrome', () => {
    const manifest = JSON.parse(readFileSync(new URL('../../public/manifest.webmanifest', import.meta.url), 'utf8'));
    const indexHtml = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(manifest.theme_color).toBe(themeColors.light); expect(manifest.background_color).toBe(themeColors.light);
    expect(indexHtml).toContain(`<meta name="theme-color" content="${themeColors.light}"`);
  });
});
