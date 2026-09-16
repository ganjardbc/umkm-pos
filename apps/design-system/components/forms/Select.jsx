import React from 'react';

export function Select({ label, options = [], value, onChange, placeholder }) {
  return (
    <label style={{ display: 'block', fontFamily: 'var(--font-body)' }}>
      {label && <span style={{ display: 'block', font: 'var(--text-heading-sm)', color: 'var(--text-primary)', marginBottom: 6 }}>{label}</span>}
      <select
        value={value} onChange={onChange}
        style={{
          width: '100%', appearance: 'none', background: 'var(--surface-page)', border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: '10px 12px', font: 'var(--text-body-md)', fontFamily: 'var(--font-body)',
          color: 'var(--text-primary)',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 'var(--radius-xs)', border: `1.5px solid ${checked ? 'var(--brand-solid)' : 'var(--border-strong)'}`,
        background: checked ? 'var(--brand-solid)' : 'var(--surface-page)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'var(--transition-interactive)',
      }}>
        {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
      <span style={{ font: 'var(--text-body-md)', color: 'var(--text-primary)' }}>{label}</span>
    </label>
  );
}
