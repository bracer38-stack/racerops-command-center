import { describe, expect, it } from 'vitest';
import { convertRowsToInventory } from '../utils/csvParser';
import { inventoryMetrics } from '../utils/inventoryMetrics';

describe('inventoryMetrics', () => {
  it('reports no inventory and unknown sales metrics for a blank slate', () => {
    expect(inventoryMetrics([])).toEqual({
      listedCount: 0,
      stagnantCount: 0,
      averageTurnaroundDays: null,
      grossMarginPct: null
    });
  });

  it('counts only listed items and ages greater than 60 days', () => {
    const items = convertRowsToInventory([{ DaysListed: '60' }, { DaysListed: '61' }, { DaysListed: '90' }]);
    items[2].status = 'archived';
    expect(inventoryMetrics(items)).toMatchObject({ listedCount: 2, stagnantCount: 1 });
  });

  it('weights realized margin by sale revenue and computes turnaround from sales', () => {
    const items = convertRowsToInventory([{ Cost: '20', DaysListed: '10' }, { Cost: '150', DaysListed: '30' }, { DaysListed: '99' }]);
    Object.assign(items[0], { status: 'sold', salePrice: 100 });
    Object.assign(items[1], { status: 'sold', salePrice: 200 });
    expect(inventoryMetrics(items)).toMatchObject({ listedCount: 1, averageTurnaroundDays: 20 });
    expect(inventoryMetrics(items).grossMarginPct).toBeCloseTo(43.3333);
  });

  it('does not invent sales metrics when sale price is missing or revenue is zero', () => {
    const items = convertRowsToInventory([{ Cost: '20', DaysListed: '10' }]);
    items[0].status = 'sold';
    expect(inventoryMetrics(items).averageTurnaroundDays).toBeNull();
    items[0].salePrice = 0;
    expect(inventoryMetrics(items).grossMarginPct).toBeNull();
  });
});
