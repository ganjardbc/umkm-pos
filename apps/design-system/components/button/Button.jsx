import React from 'react';

const SIZES = {
  sm: { pad: '6px 12px', font: 'var(--text-body-sm)', gap: 6 },
  md: { pad: '10px 16px', font: 'var(--text-body-md)', gap: 8 },
  lg: { pad: '13px 22px', font: 'var(--text-body-lg)', gap: 10 },
};

function variantStyle(variant) {
  switch (variant) {
    case 'secondary':
      return { base: 'var(--surface-page)', hover: 'var(--color-neutral-50)', press: 'var(--color-neutral-100)', text: 'var(--text-primary)', border: 'var(--border-default)' };
    case 'ghost':
      return { base: 'transparent', hover: 'var(--brand-soft)', press: 'var(--brand-soft-hover)', text: 'var(--text-brand)', border: 'transparent' };
    case 'danger':
      return { base: 'var(--color-error)', hover: 'var(--color-error-dark)', press: 'var(--color-error-dark)', text: 'var(--text-on-brand)', border: 'transparent' };
    default:
      return { base: 'var(--brand-solid)', hover: 'var(--brand-solid-hover)', press: 'var(--brand-solid-press)', text: 'var(--text-on-brand)', border: 'transparent' };
  }
}

export function Button({ variant = 'primary', size = 'md', disabled, fullWidth, icon, children, onClick }) {
  const [state, setState] = React.useState('idle');
  const v = variantStyle(variant);
  const s = SIZES[size] || SIZES.md;
  const bg = disabled ? 'var(--color-neutral-100)' : state === 'press' ? v.press : state === 'hover' ? v.hover : v.base;
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setState('hover')}
      onMouseLeave={() => setState('idle')}
      onMouseDown={() => setState('press')}
      onMouseUp={() => setState('hover')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
        width: fullWidth ? '100%' : 'auto', padding: s.pad, font: s.font, fontFamily: 'var(--font-body)',
        fontWeight: 600, color: disabled ? 'var(--text-disabled)' : v.text, background: bg,
        border: `1px solid ${disabled ? 'var(--border-subtle)' : v.border}`, borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'var(--transition-interactive)',
        boxShadow: variant === 'primary' && !disabled && state !== 'press' ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {icon}
      {children}
    </button>
  );
}
