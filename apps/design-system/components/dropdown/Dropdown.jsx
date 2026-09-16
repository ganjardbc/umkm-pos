import React from 'react';

export function Dropdown({ trigger, items = [], onSelect }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', fontFamily: 'var(--font-body)' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
      >{trigger}</div>
      {open && (
        <div role="menu" style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 180, background: 'var(--surface-page)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          padding: 6, zIndex: 10,
        }}>
          {items.map((it) => (
            <button key={it.id} role="menuitem" onClick={() => { onSelect && onSelect(it.id); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent',
              borderRadius: 'var(--radius-sm)', font: 'var(--text-body-sm)', color: it.danger ? 'var(--color-error)' : 'var(--text-primary)', cursor: 'pointer',
            }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
