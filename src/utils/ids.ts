// crypto.randomUUID is unavailable on non-secure origins (e.g. the dev server opened over LAN http).
export function newId(prefix: string): string {
  const unique =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${unique}`;
}
