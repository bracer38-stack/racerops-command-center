import { describe, expect, it } from 'vitest';
import { convertRowsToInventory, convertRowsToLeads, parseCSV, parseCSVRecords } from '../utils/csvParser';

describe('parseCSVRecords', () => {
  it('treats apostrophes as literal characters', () => {
    expect(parseCSVRecords("Name,Business,Value\nPat O'Brien,Kim's Closet,250")).toEqual([
      ['Name', 'Business', 'Value'],
      ["Pat O'Brien", "Kim's Closet", '250']
    ]);
  });

  it('handles quoted commas, escaped quotes, quoted newlines, CRLF and a BOM', () => {
    const csv = '\uFEFFName,Notes\r\n"Smith, Jo","Said ""call me""\nnext week"\r\n';
    expect(parseCSVRecords(csv)).toEqual([
      ['Name', 'Notes'],
      ['Smith, Jo', 'Said "call me"\nnext week']
    ]);
  });
});

describe('parseCSV', () => {
  it('keys rows by the BOM-stripped header and skips blank lines', () => {
    const preview = parseCSV('\uFEFFName,Email\n\nAna,ana@x.com\n', 'leads.csv', 'leads');
    expect(preview.headers).toEqual(['Name', 'Email']);
    expect(preview.rowCount).toBe(1);
    expect(preview.rows[0]).toEqual({ Name: 'Ana', Email: 'ana@x.com' });
  });
});

describe('convertRowsToLeads', () => {
  it('resolves business display names and does not invent deal values', () => {
    const { leads, skippedRows } = convertRowsToLeads([
      { Name: 'A', Business: "Kim's Closet", Value: '' },
      { Name: 'B', Business: 'Team Rhino', Value: '$1,200' },
      { Name: 'C', Value: '0' }
    ]);
    expect(skippedRows).toEqual([]);
    expect(leads.map(l => [l.businessId, l.value])).toEqual([
      ['kims-closet', 0],
      ['team-rhino', 1200],
      ['over50fitlife', 0]
    ]);
    expect(leads[0].email).toBe('');
  });

  it('skips rows whose Business is unrecognized and reports their spreadsheet row', () => {
    const { leads, skippedRows } = convertRowsToLeads([
      { Name: 'A', Business: 'NutriPlanPro' },
      { Name: 'B', Business: 'Acme Corp' }
    ]);
    expect(leads.map(l => l.businessId)).toEqual(['nutriplanpro']);
    expect(skippedRows).toEqual([3]);
  });

  it('gives every imported lead a unique id', () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({ Name: `L${i}` }));
    const ids = new Set(convertRowsToLeads(rows).leads.map(l => l.id));
    expect(ids.size).toBe(50);
  });
});

describe('convertRowsToInventory', () => {
  it('leaves a missing listing price at 0 instead of $100', () => {
    const [item] = convertRowsToInventory([{ Title: 'Scarf', Cost: '12.50' }]);
    expect(item.listingPrice).toBe(0);
    expect(item.cost).toBe(12.5);
  });
});
