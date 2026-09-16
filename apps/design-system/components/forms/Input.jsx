import React from 'react';

export function Input({ label, hint, error, placeholder, prefix, disabled, type = 'text', value, onChange }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--border-focus)' : 'var(--border-default)';
  return (
    <label style={{ display: 'block', fontFamily: 'var(--font-body)' }}>
      {label && <span style={{ display: 'block', font: 'var(--text-heading-sm)', color: 'var(--text-primary)', marginBottom: 6 }}>{label}</span>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: disabled ? 'var(--surface-sunken)' : 'var(--surface-page)',
        border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius-md)', padding: '10px 12px',
        boxShadow: focused && !error ? 'var(--shadow-focus-ring)' : 'none', transition: 'var(--transition-interactive)',
      }}>
        {prefix && <span style={{ color: 'var(--text-tertiary)', display: 'flex' }}>{prefix}</span>}
        <input
          type={type} placeholder={placeholder} disabled={disabled} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', font: 'var(--text-body-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
        />
      </div>
      {(hint || error) && (
        <span style={{ display: 'block', marginTop: 6, font: 'var(--text-caption)', color: error ? 'var(--color-error)' : 'var(--text-tertiary)' }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
