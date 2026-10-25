import { useEffect, useId, useRef, useState } from 'react';
import { ImageOff, X, ZoomIn } from 'lucide-react';

export function InventoryPhoto({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false), [open, setOpen] = useState(false), [largeFailed, setLargeFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);

  if (!url || failed) return <div className="hub-photo-placeholder"><ImageOff size={23}/><span>{failed ? 'Photo unavailable' : 'No photo yet'}</span></div>;
  return <>
    <button type="button" className="hub-photo-button" aria-label={`Enlarge photo of ${title}`} onClick={() => setOpen(true)}>
      <img src={url} alt={`${title} photo`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/>
      <span><ZoomIn size={13}/>View photo</span>
    </button>
    <dialog ref={dialog} className="hub-photo-dialog" aria-labelledby={heading} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="hub-photo-view">
        <header><h2 id={heading}>{title}</h2><button type="button" className="hub-icon" autoFocus aria-label="Close photo" onClick={() => dialog.current?.close()}><X size={20}/></button></header>
        {open && (largeFailed ? <p role="status">Photo unavailable. The link may have expired or require sign-in. Edit the item to replace its photo URL.</p> : <img src={url} alt={title} referrerPolicy="no-referrer" onError={() => setLargeFailed(true)}/>)}
        <p>Photo is loaded from the saved image link. Press Escape or use Close to return to your inventory.</p>
      </div>
    </dialog>
  </>;
}
