import React from 'react';

export function Progress({ value = 0, tone = 'brand' }) {
  const fg = tone === 'error' ? 'var(--color-error)' : tone === 'warning' ? 'var(--color-warning)' : 'var(--brand-solid)';
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--color-neutral-100)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${clamped}%`, background: fg, borderRadius: 'var(--radius-full)', transition: 'width var(--duration-slow) var(--ease-standard)' }} />
    </div>
  );
}

export function Spinner({ size = 20, label = 'Loading' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="status" aria-label={label} style={{ animation: 'isl-spin 700ms linear infinite' }}>
      <style>{'@keyframes isl-spin{to{transform:rotate(360deg)}}'}</style>
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-neutral-200)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="var(--brand-solid)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
