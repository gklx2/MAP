import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, className = '' }: {
  title: string; onClose: () => void; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);

  return <dialog ref={dialog} className={`sheet ${className}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="sheet-inner"><div className="sheet-heading"><h2 id={titleId}>{title}</h2>
      <button type="button" className="icon-button" onClick={onClose} aria-label={`${title} 닫기`} autoFocus><X size={22} /></button>
    </div>{children}</div>
  </dialog>;
}
