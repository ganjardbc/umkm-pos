import React from 'react';

export function StatCard({ label, value, delta, deltaTone = 'success', icon }) {
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', padding: 'var(--space-5)', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ font: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>{label}</span>
        {icon && <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--brand-soft)', color: 'var(--text-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>}
      </div>
      <span style={{ font: 'var(--text-display-sm)', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{value}</span>
      {delta && (
        <span style={{ font: 'var(--text-caption)', fontWeight: 600, color: deltaTone === 'error' ? 'var(--color-error)' : 'var(--color-success)' }}>
          {delta}
        </span>
      )}
    </div>
  );
}
