import React from 'react';

export function Tooltip({ label, children }) {
  const [show, setShow] = React.useState(false);
  const id = React.useId();
  const trigger = React.cloneElement(children, {
    'aria-describedby': id,
    onMouseEnter: (e) => { setShow(true); children.props.onMouseEnter?.(e); },
    onMouseLeave: (e) => { setShow(false); children.props.onMouseLeave?.(e); },
    onFocus: (e) => { setShow(true); children.props.onFocus?.(e); },
    onBlur: (e) => { setShow(false); children.props.onBlur?.(e); },
  });
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {show && (
        <span role="tooltip" id={id} style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-neutral-800)', color: 'var(--color-white)', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
          font: 'var(--text-caption)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', zIndex: 20,
        }}>{label}</span>
      )}
    </span>
  );
}
