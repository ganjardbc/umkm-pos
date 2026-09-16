import React from 'react';

export function Tabs({ tabs = [], activeId, onChange }) {
  const active = activeId ?? tabs[0]?.id;
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button key={t.id} role="tab" aria-selected={isActive} onClick={() => onChange && onChange(t.id)} style={{
              padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              font: 'var(--text-body-md)', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-brand)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${isActive ? 'var(--brand-solid)' : 'transparent'}`, marginBottom: -1,
            }}>{t.label}</button>
          );
        })}
      </div>
    </div>
  );
}
