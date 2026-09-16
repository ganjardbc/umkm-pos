import React from 'react';

export function Sidebar({ sections = [], activeId, onSelect, collapsed }) {
  return (
    <nav aria-label="Sidebar" style={{
      width: collapsed ? 64 : 232, background: 'var(--surface-page)', borderRight: '1px solid var(--border-subtle)',
      padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'var(--font-body)', boxSizing: 'border-box', height: '100%',
    }}>
      {sections.map((sec) => (
        <div key={sec.title}>
          {!collapsed && <div style={{ font: 'var(--text-overline)', letterSpacing: 'var(--tracking-overline)', color: 'var(--text-tertiary)', padding: '0 10px 8px' }}>{sec.title}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sec.items.map((item) => {
              const active = item.id === activeId;
              return (
                <button key={item.id} onClick={() => onSelect && onSelect(item.id)} aria-current={active ? 'page' : undefined} aria-label={collapsed ? item.label : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: active ? 'var(--brand-soft)' : 'transparent', color: active ? 'var(--text-brand)' : 'var(--text-secondary)',
                  font: 'var(--text-body-md)', fontWeight: active ? 600 : 500, textAlign: 'left', cursor: 'pointer', width: '100%',
                }}>
                  <span style={{ width: 18, height: 18, borderRadius: 'var(--radius-xs)', background: active ? 'var(--color-primary-500)' : 'var(--color-neutral-300)', flexShrink: 0 }} />
                  {!collapsed && item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
