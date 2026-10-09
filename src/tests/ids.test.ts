import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from '../utils/ids';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('newId', () => {
  it('uses native UUIDs when available', () => {
    const randomUUID = vi.fn(() => 'test-uuid');
    vi.stubGlobal('crypto', { randomUUID });
    expect(newId('lead')).toBe('lead-test-uuid');
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it('generates distinct IDs within one millisecond when UUIDs are unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    vi.spyOn(Date, 'now').mockReturnValue(123456789);
    let randomValue = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => ++randomValue / 1000);
    const ids = Array.from({ length: 50 }, () => newId('lead'));
    expect(new Set(ids).size).toBe(50);
    expect(ids.every(id => id.startsWith('lead-'))).toBe(true);
  });
});
