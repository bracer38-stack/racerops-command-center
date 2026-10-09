import { KimClosetItem } from '../types';

export function inventoryMetrics(items: KimClosetItem[]) {
  const listed = items.filter(item => item.status === 'listed');
  const sold = items.filter(item => item.status === 'sold' && Number.isFinite(item.salePrice));
  const revenue = sold.reduce((total, item) => total + item.salePrice!, 0);
  const cost = sold.reduce((total, item) => total + item.cost, 0);
  return {
    listedCount: listed.length,
    stagnantCount: listed.filter(item => item.daysListed > 60).length,
    averageTurnaroundDays: sold.length
      ? sold.reduce((total, item) => total + item.daysListed, 0) / sold.length
      : null,
    grossMarginPct: revenue > 0 ? ((revenue - cost) / revenue) * 100 : null
  };
}
