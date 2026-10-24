export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Server unavailable.' }));
    throw new ApiError(response.status, [data.error, ...(data.details || [])].join(' '));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function downloadJSON(data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `racerops-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
