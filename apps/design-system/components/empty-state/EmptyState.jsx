import React from 'react';

export function EmptyState({ title, description, action, icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
      padding: 'var(--space-16) var(--space-6)', fontFamily: 'var(--font-body)',
    }}>
      <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--color-neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        {icon || <span style={{ width: 22, height: 22, borderRadius: 'var(--radius-sm)', border: '2px dashed var(--border-strong)' }} />}
      </div>
      <div>
        <div style={{ font: 'var(--text-heading-md)', color: 'var(--text-primary)' }}>{title}</div>
        {description && <div style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 320 }}>{description}</div>}
      </div>
      {action}
    </div>
  );
}
