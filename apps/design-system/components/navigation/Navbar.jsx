import React from 'react';

export function Navbar({ links = [], cta, onGround }) {
  const fg = 'var(--text-primary)';
  return (
    <div className={onGround ? 'on-ground' : ''} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px',
      background: onGround ? 'var(--color-primary-600)' : 'var(--surface-page)',
      borderBottom: onGround ? 'none' : '1px solid var(--border-subtle)', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, font: 'var(--text-heading-md)', color: fg, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: onGround ? 'var(--color-white)' : 'linear-gradient(135deg,#F14A2A,#FFA347)', display: 'inline-block' }} />
        insell.id
      </div>
      <nav style={{ display: 'flex', gap: 28 }}>
        {links.map((l) => <a key={l} href="#" style={{ color: fg, opacity: 0.85, font: 'var(--text-body-md)', textDecoration: 'none' }}>{l}</a>)}
      </nav>
      {cta}
    </div>
  );
}
