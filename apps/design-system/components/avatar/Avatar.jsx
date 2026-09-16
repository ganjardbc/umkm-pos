import React from 'react';

const SIZES = { sm: 28, md: 36, lg: 48 };

export function Avatar({ name = '', src, size = 'md' }) {
  const px = SIZES[size] || SIZES.md;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: px, height: px, borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: src ? 'transparent' : 'var(--color-primary-100)', color: 'var(--color-primary-700)',
      font: 'var(--text-body-sm)', fontWeight: 700, fontFamily: 'var(--font-body)', flexShrink: 0,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}
