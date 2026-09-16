import React from 'react';

export function Toast({ tone = 'success', message, onClose }) {
  const accent = tone === 'error' ? 'var(--color-error)' : tone === 'warning' ? 'var(--color-warning)' : tone === 'info' ? 'var(--color-info)' : 'var(--color-success)';
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div role={role} aria-live={tone === 'error' ? 'assertive' : 'polite'} style={{
      display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-neutral-800)', color: 'var(--color-white)',
      borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)',
      minWidth: 260,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
      <span style={{ flex: 1, font: 'var(--text-body-sm)' }}>{message}</span>
      {onClose && <button onClick={onClose} aria-label="Dismiss" style={{ border: 'none', background: 'transparent', color: 'var(--color-white)', opacity: 0.6, cursor: 'pointer' }}>✕</button>}
    </div>
  );
}
