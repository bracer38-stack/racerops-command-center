import { IngestionPreview, Lead, KimClosetItem, BusinessId } from '../types';
import { newId } from './ids';

export function parseCSV(csvText: string, fileName: string, type: IngestionPreview['type']): IngestionPreview {
  const records = parseCSVRecords(csvText).filter(fields => fields.some(f => f.trim().length > 0));
  if (records.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row.');
  }

  const headers = records[0].map(h => h.trim());
  const rows = records.slice(1).map(values => {
    const rowObj: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      rowObj[h] = values[hIdx] !== undefined ? values[hIdx].trim() : '';
    });
    return rowObj;
  });

  return {
    type,
    fileName,
    rowCount: rows.length,
    headers,
    rows
  };
}

/** RFC 4180: double quotes only, "" escapes a quote, quoted fields may contain commas and newlines. */
export function parseCSVRecords(csvText: string): string[][] {
  const text = csvText.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      fields.push(field);
      records.push(fields);
      fields = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || fields.length > 0) {
    fields.push(field);
    records.push(fields);
  }
  return records;
}

const BUSINESS_ALIASES: Record<string, BusinessId> = {
  over50fitlife: 'over50fitlife',
  nutriplanpro: 'nutriplanpro',
  kimscloset: 'kims-closet',
  teamrhino: 'team-rhino'
};

/** Matches ids or display names ("Kim's Closet", "kims-closet", "Team Rhino"); null if unrecognized. */
export function resolveBusinessId(raw: string): BusinessId | null {
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BUSINESS_ALIASES[key] ?? null;
}

function parseAmount(raw: string | undefined): number {
  const value = parseFloat((raw || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

export interface LeadConversionResult {
  leads: Lead[];
  /** Spreadsheet row numbers (header = row 1) whose Business value wasn't recognized. */
  skippedRows: number[];
}

export function convertRowsToLeads(
  rows: Record<string, string>[],
  defaultBusinessId: BusinessId = 'over50fitlife'
): LeadConversionResult {
  const leads: Lead[] = [];
  const skippedRows: number[] = [];

  rows.forEach((r, idx) => {
    const rawBusiness = r.Business || r.business || r.BusinessId || '';
    const businessId = rawBusiness ? resolveBusinessId(rawBusiness) : defaultBusinessId;
    if (!businessId) {
      skippedRows.push(idx + 2);
      return;
    }

    const stage = (r.Stage || r.stage || 'new').toLowerCase() as Lead['stage'];
    leads.push({
      id: newId('lead-csv'),
      businessId,
      name: r.Name || r.name || r['Contact Name'] || r['Lead Name'] || `Lead #${idx + 1}`,
      email: r.Email || r.email || r['Email Address'] || '',
      phone: r.Phone || r.phone || r['Phone Number'] || '',
      stage: ['new', 'contacted', 'qualified', 'consultation', 'proposal', 'customer', 'lost'].includes(stage) ? stage : 'new',
      value: parseAmount(r.Value || r.value || r.Amount || r['Deal Value']),
      source: r.Source || r.source || r['Lead Source'] || 'CSV Upload',
      lastContact: 'Imported Today',
      nextFollowUp: 'Scheduled',
      notes: r.Notes || r.notes || r.Description || 'Imported via CSV'
    });
  });

  return { leads, skippedRows };
}

export function convertRowsToInventory(rows: Record<string, string>[]): KimClosetItem[] {
  return rows.map((r, idx) => {
    const marketplace = (r.Marketplace || r.marketplace || r.Platform || 'poshmark').toLowerCase() as KimClosetItem['marketplace'];
    const daysListed = parseInt(r.DaysListed || r['Days Listed'] || '0', 10) || 0;

    let agingBucket: KimClosetItem['agingBucket'] = '0-14';
    if (daysListed > 90) agingBucket = '90+';
    else if (daysListed > 60) agingBucket = '61-90';
    else if (daysListed > 30) agingBucket = '31-60';
    else if (daysListed > 14) agingBucket = '15-30';

    return {
      id: newId('kc-csv'),
      sku: r.SKU || r.sku || `KC-${1000 + idx}`,
      brand: r.Brand || r.brand || 'Designer Brand',
      title: r.Title || r.title || r.Item || r.Name || `Item #${idx + 1}`,
      category: r.Category || r.category || 'Apparel & Accessories',
      cost: parseAmount(r.Cost || r.cost || r['Cost Basis']),
      listingPrice: parseAmount(r.ListingPrice || r['Listing Price'] || r.Price),
      status: 'listed',
      marketplace: ['poshmark', 'mercari', 'depop', 'vinted', 'whatnot', 'vestiaire', 'website'].includes(marketplace) ? marketplace : 'poshmark',
      listingDate: new Date().toISOString().split('T')[0],
      daysListed,
      agingBucket,
      views: 0,
      likes: 0,
      offers: 0,
      lastRefreshed: 'Today',
      smartRecommendation: 'leave_unchanged',
      notes: r.Notes || r.notes || 'Imported via CSV'
    };
  });
}
