import React from 'react';

export function Card({ title, subtitle, actions, footer, children, padding = 'var(--space-6)' }) {
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font-body)', overflow: 'hidden',
    }}>
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', padding: `${padding} ${padding} 0` }}>
          <div>
            {title && <div style={{ font: 'var(--text-heading-md)', color: 'var(--text-primary)' }}>{title}</div>}
            {subtitle && <div style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && <div style={{ borderTop: '1px solid var(--border-subtle)', padding, background: 'var(--surface-sunken)' }}>{footer}</div>}
    </div>
  );
}
