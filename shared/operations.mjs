import { decode } from 'html-entities';

export const businessNames = ["Kim's Closet", 'Over50FitLife', 'NutriPlanPro', 'App Studio', 'Dual Business'];
export const decodeText = value => decode(String(value || ''), { level: 'html5' });

export function formatDate(value) {
  if (!value) return 'Not yet synced';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

const promoSender = /(?:newsletter|newsletters|marketing|promotions|offers|deals|digest|mailchimp|constantcontact|substack|beehiiv)(?:[.@+_-]|\b)/i;
const market = /\b(?:vendoo|poshmark|ebay|mercari|awin)\b/i;
const appStore = /(?:app\s*store\s*connect|google\s*play|appstoreconnect|play-developer)/i;

export function classifyAlert(alert) {
  const subject = decodeText(alert.subject), summary = decodeText(alert.summary);
  const sender = decodeText(alert.from), text = `${sender} ${subject} ${summary}`;
  const labels = String(alert.mailLabels || '').split(/[ ,]+/);
  const promotional = Boolean(alert.listUnsubscribe || labels.some(l => ['CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES'].includes(l)) || promoSender.test(sender));
  const business = appStore.test(text) ? 'NutriPlanPro' : market.test(text) ? "Kim's Closet" :
    /\b(?:tiktok|pinterest)\b/i.test(text) || String(alert.account).toLowerCase() === 'robert@over50fitlife.com' ? 'Over50FitLife' : alert.business || 'Dual Business';
  const interaction = /\b(?:direct message|sent you (?:a |an )?(?:message|comment)|new (?:direct |private )?message|new comment|commented on|replied to (?:your|you)|left (?:you )?a comment)\b/i.test(text);
  const sale = /\b(?:you (?:made a sale|sold)|(?:item|listing) (?:has )?sold|(?:new |confirmed )?order (?:received|placed|confirmed)|sale (?:confirmed|completed)|sold (?:on|to)|cha-ching)\b/i.test(text);
  const review = appStore.test(text) && /\b(?:review status|status (?:has |was )?(?:changed|updated)|status is now|in review|rejected|approved|ready for (?:sale|distribution)|pending developer release|changes? (?:requested|required))\b/i.test(text);
  const automaticAction = interaction || sale || review;
  const synced = /gmail sync/i.test(alert.source || '') && !alert.classificationOverride;
  return {
    ...alert, subject, summary, promotional,
    business: synced ? business : alert.business || business,
    actionRequired: synced ? automaticAction : alert.classificationOverride ? Boolean(alert.actionRequired) : Boolean(alert.actionRequired || automaticAction),
    priority: synced ? automaticAction ? 'High' : 'Low' : alert.priority || (automaticAction ? 'High' : 'Low'),
  };
}

export function missingFields(item) {
  return [!item.size?.trim() && 'size', !item.color?.trim() && 'color', item.price == null && 'price', !item.imageUrl?.trim() && 'photo'].filter(Boolean);
}

const colors = ['navy blue', 'royal blue', 'light blue', 'dark blue', 'off-white', 'rose gold', 'black', 'white', 'navy', 'blue', 'red', 'pink', 'purple', 'green', 'yellow', 'orange', 'brown', 'tan', 'beige', 'cream', 'ivory', 'gray', 'grey', 'silver', 'gold', 'burgundy', 'maroon', 'teal', 'olive', 'khaki', 'coral', 'lavender', 'peach', 'turquoise'];
const colorPattern = colors.join('|');
const titleCase = value => value.replace(/\b\w/g, letter => letter.toUpperCase());
export function inventorySuggestions(item) {
  const suggestions = [];
  const title = item.title || '';
  if (!item.size?.trim()) {
    const combination = title.match(/\b(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|[2-6]XL)\s*\/\s*(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|[2-6]XL)\b/i);
    const explicit = title.match(/\bsize\s*[:=-]?\s*(extra[ -](?:extra[ -])?(?:small|large)|XXXS|XXS|XXXL|XXL|XS|XL|[2-6]XL|small|medium|large|petite|one[ -]size|[SML]|\d{1,2}(?:\.5)?(?:W|P|T)?)\b/i);
    const word = title.match(/\b(extra[ -](?:extra[ -])?(?:small|large)|small|medium|large|one[ -]size)\b/i);
    const value = combination ? `${combination[1].toUpperCase()}/${combination[2].toUpperCase()}` : (explicit || word)?.[1];
    if (value) suggestions.push({ field: 'size', value: value.length <= 4 ? value.toUpperCase() : titleCase(value.toLowerCase()), previous: item.size || '' });
  }
  if (!item.color?.trim()) {
    const pair = title.match(new RegExp(`\\b(${colorPattern})\\s*[/&]\\s*(${colorPattern})\\b`, 'i'));
    const found = pair ? `${pair[1]}/${pair[2]}` : title.match(new RegExp(`\\b(${colorPattern})\\b`, 'i'))?.[1];
    if (found) suggestions.push({ field: 'color', value: titleCase(found.toLowerCase()), previous: item.color || '' });
  }
  const correctedBrand = { akaria: 'AKIRA', 'new york': 'Jones New York' }[item.brand?.trim().toLowerCase()];
  if (correctedBrand) suggestions.push({ field: 'brand', value: correctedBrand, previous: item.brand });
  return suggestions;
}

export function todayMoves({ alerts = [], inventory = [], todos = [] }) {
  const importance = { High: 0, Medium: 1, Low: 2 };
  const actions = alerts.map(classifyAlert).filter(a => a.actionRequired && !a.promotional)
    .sort((a, b) => (importance[a.priority] ?? 2) - (importance[b.priority] ?? 2) || String(a.date || a.createdAt).localeCompare(String(b.date || b.createdAt)))
    .map(a => ({ id: a.id, resource: 'alerts', business: a.business, title: a.subject, detail: 'Action-required alert', record: a }));
  const reviews = inventory.filter(i => missingFields(i).length).map(i => ({ id: i.id, resource: 'inventory', business: i.business, title: i.title, detail: `Add ${missingFields(i).join(', ')}`, record: i }));
  const tasks = todos.filter(t => !t.done).map(t => ({ id: t.id, resource: 'todos', business: t.business, title: t.text, detail: 'Open to-do', record: t }));
  const queues = [actions, reviews, tasks], result = [];
  while (result.length < 5 && queues.some(q => q.length)) {
    for (const queue of queues) if (queue.length && result.length < 5) result.push(queue.shift());
  }
  return result;
}

export function compactFiles(files) {
  const seen = new Set();
  return files.filter(file => {
    if (file.cloud !== 'Vendoo Import') return true;
    const key = JSON.stringify([file.business, file.name.trim().toLowerCase(), file.account || '', file.folder || '']);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
