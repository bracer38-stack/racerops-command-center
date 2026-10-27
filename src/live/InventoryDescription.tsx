import { useState } from 'react';

export function InventoryDescription({ notes }: { notes: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!notes) return null;
  return <div className="hub-description"><p className={`hub-item-notes ${expanded ? '' : 'hub-description-clamp'}`}>{notes}</p><button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Show more'}</button></div>;
}
