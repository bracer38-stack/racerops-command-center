import { IngestionPreview, Lead, KimClosetItem, Task, BusinessId } from '../types';

export function parseCSV(csvText: string, fileName: string, type: IngestionPreview['type']): IngestionPreview {
  const lines = csvText.trim().split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row.');
  }

  // Parse header
  const headers = splitCSVRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVRow(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, hIdx) => {
      rowObj[h] = values[hIdx] !== undefined ? values[hIdx].trim() : '';
    });
    rows.push(rowObj);
  }

  return {
    type,
    fileName,
    rowCount: rows.length,
    headers,
    rows
  };
}

function splitCSVRow(rowText: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function convertRowsToLeads(rows: Record<string, string>[]): Lead[] {
  return rows.map((r, idx) => {
    // fuzzy match keys
    const name = r.Name || r.name || r['Contact Name'] || r['Lead Name'] || `Lead #${idx + 1}`;
    const email = r.Email || r.email || r['Email Address'] || 'unknown@domain.com';
    const phone = r.Phone || r.phone || r['Phone Number'] || '';
    const businessId = (r.Business || r.business || r.BusinessId || 'over50fitlife').toLowerCase().replace(/\s+/g, '-') as BusinessId;
    const value = parseFloat((r.Value || r.value || r.Amount || r['Deal Value'] || '0').replace(/[^0-9.-]/g, '')) || 500;
    const source = r.Source || r.source || r['Lead Source'] || 'CSV Upload';
    const stage = (r.Stage || r.stage || 'new').toLowerCase() as any;
    const notes = r.Notes || r.notes || r.Description || 'Imported via CSV';

    return {
      id: `lead-csv-${Date.now()}-${idx}`,
      businessId,
      name,
      email,
      phone,
      stage: ['new', 'contacted', 'qualified', 'consultation', 'proposal', 'customer', 'lost'].includes(stage) ? stage : 'new',
      value,
      source,
      lastContact: 'Imported Today',
      nextFollowUp: 'Scheduled',
      notes
    };
  });
}

export function convertRowsToInventory(rows: Record<string, string>[]): KimClosetItem[] {
  return rows.map((r, idx) => {
    const brand = r.Brand || r.brand || 'Designer Brand';
    const title = r.Title || r.title || r.Item || r.Name || `Item #${idx + 1}`;
    const sku = r.SKU || r.sku || `KC-${1000 + idx}`;
    const category = r.Category || r.category || 'Apparel & Accessories';
    const cost = parseFloat((r.Cost || r.cost || r['Cost Basis'] || '0').replace(/[^0-9.-]/g, '')) || 0;
    const listingPrice = parseFloat((r.ListingPrice || r['Listing Price'] || r.Price || '0').replace(/[^0-9.-]/g, '')) || 100;
    const marketplace = (r.Marketplace || r.marketplace || r.Platform || 'poshmark').toLowerCase() as any;
    const daysListed = parseInt(r.DaysListed || r['Days Listed'] || '0', 10) || 0;

    let agingBucket: any = '0-14';
    if (daysListed > 90) agingBucket = '90+';
    else if (daysListed > 60) agingBucket = '61-90';
    else if (daysListed > 30) agingBucket = '31-60';
    else if (daysListed > 14) agingBucket = '15-30';

    return {
      id: `kc-csv-${Date.now()}-${idx}`,
      sku,
      brand,
      title,
      category,
      cost,
      listingPrice,
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
