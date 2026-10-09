import { describe, expect, it } from 'vitest';
import { loadPersistedState, pickSections, savePersistedState, PersistedState, STORAGE_KEY } from '../utils/persistence';

const defaults = {
  dataMode: 'demo',
  businesses: [],
  financials: { revenueThisMonth: 0 },
  leads: []
} as unknown as PersistedState;

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v)
  };
}

describe('pickSections', () => {
  it('keeps only known sections with the expected shape', () => {
    const picked = pickSections(
      { leads: [{ id: 'l1' }], businesses: 'oops', financials: [1], dataMode: 'hacked', extra: 1 },
      defaults
    );
    expect(picked).toEqual({ leads: [{ id: 'l1' }] });
  });

  it('returns nothing for non-object input', () => {
    expect(pickSections(null, defaults)).toEqual({});
    expect(pickSections([1, 2], defaults)).toEqual({});
  });
});

describe('load/save round trip', () => {
  it('restores what was saved', () => {
    const storage = memoryStorage();
    const state = { ...defaults, dataMode: 'live', leads: [{ id: 'l1' }] } as unknown as PersistedState;
    savePersistedState(state, storage);
    expect(storage.data.has(STORAGE_KEY)).toBe(true);
    expect(loadPersistedState(defaults, storage)).toEqual(state);
  });

  it('ignores corrupt storage', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    expect(loadPersistedState(defaults, storage)).toEqual({});
  });

  it('keeps the app usable when browser storage is unavailable or full', () => {
    const storage = {
      getItem: () => { throw new Error('Storage disabled'); },
      setItem: () => { throw new Error('Quota exceeded'); }
    };
    expect(loadPersistedState(defaults, storage)).toEqual({});
    expect(() => savePersistedState(defaults, storage)).not.toThrow();
    expect(loadPersistedState(defaults, null)).toEqual({});
    expect(() => savePersistedState(defaults, null)).not.toThrow();
  });
});
