import React from 'react';

export function Modal({ open, title, children, footer, onClose }) {
  const dialogRef = React.useRef(null);
  const previouslyFocused = React.useRef(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    dialogRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === 'Escape') { onClose && onClose(); return; }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const list = Array.from(focusables);
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, fontFamily: 'var(--font-body)',
    }} onClick={onClose}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} style={{
        width: 420, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span id={titleId} style={{ font: 'var(--text-heading-md)', color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 20, font: 'var(--text-body-md)', color: 'var(--text-secondary)' }}>{children}</div>
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>{footer}</div>}
      </div>
    </div>
  );
}
