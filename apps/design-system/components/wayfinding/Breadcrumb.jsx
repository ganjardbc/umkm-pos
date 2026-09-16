import React from 'react';

export function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)' }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: 'var(--text-tertiary)', font: 'var(--text-body-sm)' }}>/</span>}
          {i === items.length - 1 ? (
            <span aria-current="page" style={{ font: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{item}</span>
          ) : (
            <a href="#" style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)', textDecoration: 'none' }}>{item}</a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
