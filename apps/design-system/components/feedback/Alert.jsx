import React from 'react';

const TONES = {
  info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info-dark)', accent: 'var(--color-info)' },
  success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success-dark)', accent: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-dark)', accent: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-bg)', fg: 'var(--color-error-dark)', accent: 'var(--color-error)' },
};

export function Alert({ tone = 'info', title, children, onDismiss }) {
  const t = TONES[tone] || TONES.info;
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start', background: t.bg, borderRadius: 'var(--radius-md)',
      padding: '14px 16px', fontFamily: 'var(--font-body)',
    }}>
      <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ font: 'var(--text-heading-sm)', color: t.fg, marginBottom: 2 }}>{title}</div>}
        <div style={{ font: 'var(--text-body-sm)', color: t.fg, opacity: 0.9 }}>{children}</div>
      </div>
      {onDismiss && <button onClick={onDismiss} aria-label="Dismiss" style={{ border: 'none', background: 'transparent', color: t.fg, cursor: 'pointer', opacity: 0.6 }}>✕</button>}
    </div>
  );
}
