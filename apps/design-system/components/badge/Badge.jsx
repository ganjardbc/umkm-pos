import React from 'react';

const TONES = {
  neutral: { bg: 'var(--color-neutral-100)', fg: 'var(--text-secondary)' },
  brand: { bg: 'var(--brand-soft)', fg: 'var(--text-brand)' },
  success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success-dark)' },
  warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-dark)' },
  error: { bg: 'var(--color-error-bg)', fg: 'var(--color-error-dark)' },
  info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info-dark)' },
};

export function Badge({ tone = 'neutral', dot, children }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: t.bg, color: t.fg, font: 'var(--text-caption)', fontFamily: 'var(--font-body)', fontWeight: 600,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-full)', background: t.fg }} />}
      {children}
    </span>
  );
}
