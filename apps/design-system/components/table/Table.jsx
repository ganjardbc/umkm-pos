import React from 'react';

export function Table({ columns = [], rows = [] }) {
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface-sunken)' }}>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={{ textAlign: c.align || 'left', padding: '10px 16px', font: 'var(--text-overline)', letterSpacing: 'var(--tracking-overline)', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align || 'left', padding: '12px 16px', font: c.mono ? 'var(--text-mono-sm)' : 'var(--text-body-sm)', color: 'var(--text-primary)' }}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
