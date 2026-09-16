import React from 'react';

export function Pagination({ page = 1, totalPages = 1, onChange }) {
  const go = (p) => p >= 1 && p <= totalPages && onChange && onChange(p);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)' }} role="navigation" aria-label="Pagination">
      <button onClick={() => go(page - 1)} disabled={page === 1} style={btnStyle(false, page === 1)} aria-label="Halaman sebelumnya">‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map((p) => (
        <button key={p} onClick={() => go(p)} style={btnStyle(p === page)} aria-current={p === page ? 'page' : undefined} aria-label={'Halaman ' + p}>{p}</button>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === totalPages} style={btnStyle(false, page === totalPages)} aria-label="Halaman berikutnya">›</button>
    </div>
  );
}

function btnStyle(active, disabled) {
  return {
    minWidth: 32, height: 32, border: '1px solid ' + (active ? 'var(--brand-solid)' : 'var(--border-default)'),
    borderRadius: 'var(--radius-sm)', background: active ? 'var(--brand-solid)' : 'var(--surface-page)',
    color: active ? 'var(--text-on-brand)' : disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
    font: 'var(--text-body-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
