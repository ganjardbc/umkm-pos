(() => {
  // .buildtmp/react-shim.js
  var react_shim_default = window.React;

  // components/avatar/Avatar.jsx
  var SIZES = { sm: 28, md: 36, lg: 48 };
  function Avatar({ name = "", src, size = "md" }) {
    const px = SIZES[size] || SIZES.md;
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      width: px,
      height: px,
      borderRadius: "var(--radius-full)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: src ? "transparent" : "var(--color-primary-100)",
      color: "var(--color-primary-700)",
      font: "var(--text-body-sm)",
      fontWeight: 700,
      fontFamily: "var(--font-body)",
      flexShrink: 0
    } }, src ? /* @__PURE__ */ react_shim_default.createElement("img", { src, alt: name, style: { width: "100%", height: "100%", objectFit: "cover" } }) : initials);
  }

  // components/badge/Badge.jsx
  var TONES = {
    neutral: { bg: "var(--color-neutral-100)", fg: "var(--text-secondary)" },
    brand: { bg: "var(--brand-soft)", fg: "var(--text-brand)" },
    success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" },
    warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-dark)" },
    error: { bg: "var(--color-error-bg)", fg: "var(--color-error-dark)" },
    info: { bg: "var(--color-info-bg)", fg: "var(--color-info-dark)" }
  };
  function Badge({ tone = "neutral", dot, children }) {
    const t = TONES[tone] || TONES.neutral;
    return /* @__PURE__ */ react_shim_default.createElement("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 10px",
      borderRadius: "var(--radius-full)",
      background: t.bg,
      color: t.fg,
      font: "var(--text-caption)",
      fontFamily: "var(--font-body)",
      fontWeight: 600
    } }, dot && /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 6, height: 6, borderRadius: "var(--radius-full)", background: t.fg } }), children);
  }

  // components/button/Button.jsx
  var SIZES2 = {
    sm: { pad: "6px 12px", font: "var(--text-body-sm)", gap: 6 },
    md: { pad: "10px 16px", font: "var(--text-body-md)", gap: 8 },
    lg: { pad: "13px 22px", font: "var(--text-body-lg)", gap: 10 }
  };
  function variantStyle(variant) {
    switch (variant) {
      case "secondary":
        return { base: "var(--surface-page)", hover: "var(--color-neutral-50)", press: "var(--color-neutral-100)", text: "var(--text-primary)", border: "var(--border-default)" };
      case "ghost":
        return { base: "transparent", hover: "var(--brand-soft)", press: "var(--brand-soft-hover)", text: "var(--text-brand)", border: "transparent" };
      case "danger":
        return { base: "var(--color-error)", hover: "var(--color-error-dark)", press: "var(--color-error-dark)", text: "var(--text-on-brand)", border: "transparent" };
      default:
        return { base: "var(--brand-solid)", hover: "var(--brand-solid-hover)", press: "var(--brand-solid-press)", text: "var(--text-on-brand)", border: "transparent" };
    }
  }
  function Button({ variant = "primary", size = "md", disabled, fullWidth, icon, children, onClick }) {
    const [state, setState] = react_shim_default.useState("idle");
    const v = variantStyle(variant);
    const s = SIZES2[size] || SIZES2.md;
    const bg = disabled ? "var(--color-neutral-100)" : state === "press" ? v.press : state === "hover" ? v.hover : v.base;
    return /* @__PURE__ */ react_shim_default.createElement(
      "button",
      {
        disabled,
        onClick,
        onMouseEnter: () => setState("hover"),
        onMouseLeave: () => setState("idle"),
        onMouseDown: () => setState("press"),
        onMouseUp: () => setState("hover"),
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: s.gap,
          width: fullWidth ? "100%" : "auto",
          padding: s.pad,
          font: s.font,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          color: disabled ? "var(--text-disabled)" : v.text,
          background: bg,
          border: `1px solid ${disabled ? "var(--border-subtle)" : v.border}`,
          borderRadius: "var(--radius-sm)",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "var(--transition-interactive)",
          boxShadow: variant === "primary" && !disabled && state !== "press" ? "var(--shadow-xs)" : "none"
        }
      },
      icon,
      children
    );
  }

  // components/card/Card.jsx
  function Card({ title, subtitle, actions, footer, children, padding = "var(--space-6)" }) {
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sm)",
      fontFamily: "var(--font-body)",
      overflow: "hidden"
    } }, (title || actions) && /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)", padding: `${padding} ${padding} 0` } }, /* @__PURE__ */ react_shim_default.createElement("div", null, title && /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-heading-md)", color: "var(--text-primary)" } }, title), subtitle && /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 2 } }, subtitle)), actions), /* @__PURE__ */ react_shim_default.createElement("div", { style: { padding } }, children), footer && /* @__PURE__ */ react_shim_default.createElement("div", { style: { borderTop: "1px solid var(--border-subtle)", padding, background: "var(--surface-sunken)" } }, footer));
  }

  // components/dropdown/Dropdown.jsx
  function Dropdown({ trigger, items = [], onSelect }) {
    const [open, setOpen] = react_shim_default.useState(false);
    const ref = react_shim_default.useRef(null);
    react_shim_default.useEffect(() => {
      function onDoc(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener("mousedown", onDoc);
      return () => document.removeEventListener("mousedown", onDoc);
    }, []);
    react_shim_default.useEffect(() => {
      if (!open) return;
      function onKeyDown(e) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);
    return /* @__PURE__ */ react_shim_default.createElement("div", { ref, style: { position: "relative", display: "inline-block", fontFamily: "var(--font-body)" } }, /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        onClick: () => setOpen((o) => !o),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        },
        role: "button",
        tabIndex: 0,
        "aria-haspopup": "menu",
        "aria-expanded": open
      },
      trigger
    ), open && /* @__PURE__ */ react_shim_default.createElement("div", { role: "menu", style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      right: 0,
      minWidth: 180,
      background: "var(--surface-page)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      padding: 6,
      zIndex: 10
    } }, items.map((it) => /* @__PURE__ */ react_shim_default.createElement("button", { key: it.id, role: "menuitem", onClick: () => {
      onSelect && onSelect(it.id);
      setOpen(false);
    }, style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "8px 10px",
      border: "none",
      background: "transparent",
      borderRadius: "var(--radius-sm)",
      font: "var(--text-body-sm)",
      color: it.danger ? "var(--color-error)" : "var(--text-primary)",
      cursor: "pointer"
    }, onMouseEnter: (e) => e.currentTarget.style.background = "var(--color-neutral-50)", onMouseLeave: (e) => e.currentTarget.style.background = "transparent" }, it.label))));
  }

  // components/empty-state/EmptyState.jsx
  function EmptyState({ title, description, action, icon }) {
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 12,
      padding: "var(--space-16) var(--space-6)",
      fontFamily: "var(--font-body)"
    } }, /* @__PURE__ */ react_shim_default.createElement("div", { "aria-hidden": "true", style: { width: 56, height: 56, borderRadius: "var(--radius-lg)", background: "var(--color-neutral-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" } }, icon || /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 22, height: 22, borderRadius: "var(--radius-sm)", border: "2px dashed var(--border-strong)" } })), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-heading-md)", color: "var(--text-primary)" } }, title), description && /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-body-sm)", color: "var(--text-secondary)", marginTop: 4, maxWidth: 320 } }, description)), action);
  }

  // components/feedback/Alert.jsx
  var TONES2 = {
    info: { bg: "var(--color-info-bg)", fg: "var(--color-info-dark)", accent: "var(--color-info)" },
    success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)", accent: "var(--color-success)" },
    warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-dark)", accent: "var(--color-warning)" },
    error: { bg: "var(--color-error-bg)", fg: "var(--color-error-dark)", accent: "var(--color-error)" }
  };
  function Alert({ tone = "info", title, children, onDismiss }) {
    const t = TONES2[tone] || TONES2.info;
    const role = tone === "error" || tone === "warning" ? "alert" : "status";
    return /* @__PURE__ */ react_shim_default.createElement("div", { role, style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      background: t.bg,
      borderRadius: "var(--radius-md)",
      padding: "14px 16px",
      fontFamily: "var(--font-body)"
    } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 8, height: 8, marginTop: 6, borderRadius: "50%", background: t.accent, flexShrink: 0 } }), /* @__PURE__ */ react_shim_default.createElement("div", { style: { flex: 1 } }, title && /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-heading-sm)", color: t.fg, marginBottom: 2 } }, title), /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-body-sm)", color: t.fg, opacity: 0.9 } }, children)), onDismiss && /* @__PURE__ */ react_shim_default.createElement("button", { onClick: onDismiss, "aria-label": "Dismiss", style: { border: "none", background: "transparent", color: t.fg, cursor: "pointer", opacity: 0.6 } }, "\u2715"));
  }

  // components/feedback/Toast.jsx
  function Toast({ tone = "success", message, onClose }) {
    const accent = tone === "error" ? "var(--color-error)" : tone === "warning" ? "var(--color-warning)" : tone === "info" ? "var(--color-info)" : "var(--color-success)";
    const role = tone === "error" ? "alert" : "status";
    return /* @__PURE__ */ react_shim_default.createElement("div", { role, "aria-live": tone === "error" ? "assertive" : "polite", style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "var(--color-neutral-800)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-md)",
      padding: "12px 16px",
      boxShadow: "var(--shadow-lg)",
      fontFamily: "var(--font-body)",
      minWidth: 260
    } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 } }), /* @__PURE__ */ react_shim_default.createElement("span", { style: { flex: 1, font: "var(--text-body-sm)" } }, message), onClose && /* @__PURE__ */ react_shim_default.createElement("button", { onClick: onClose, "aria-label": "Dismiss", style: { border: "none", background: "transparent", color: "var(--color-white)", opacity: 0.6, cursor: "pointer" } }, "\u2715"));
  }

  // components/feedback/Tooltip.jsx
  function Tooltip({ label, children }) {
    const [show, setShow] = react_shim_default.useState(false);
    const id = react_shim_default.useId();
    const trigger = react_shim_default.cloneElement(children, {
      "aria-describedby": id,
      onMouseEnter: (e) => {
        setShow(true);
        children.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e) => {
        setShow(false);
        children.props.onMouseLeave?.(e);
      },
      onFocus: (e) => {
        setShow(true);
        children.props.onFocus?.(e);
      },
      onBlur: (e) => {
        setShow(false);
        children.props.onBlur?.(e);
      }
    });
    return /* @__PURE__ */ react_shim_default.createElement("span", { style: { position: "relative", display: "inline-block" } }, trigger, show && /* @__PURE__ */ react_shim_default.createElement("span", { role: "tooltip", id, style: {
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--color-neutral-800)",
      color: "var(--color-white)",
      padding: "6px 10px",
      borderRadius: "var(--radius-sm)",
      font: "var(--text-caption)",
      fontFamily: "var(--font-body)",
      whiteSpace: "nowrap",
      boxShadow: "var(--shadow-md)",
      zIndex: 20
    } }, label));
  }

  // components/forms/Input.jsx
  function Input({ label, hint, error, placeholder, prefix, disabled, type = "text", value, onChange }) {
    const [focused, setFocused] = react_shim_default.useState(false);
    const borderColor = error ? "var(--color-error)" : focused ? "var(--border-focus)" : "var(--border-default)";
    return /* @__PURE__ */ react_shim_default.createElement("label", { style: { display: "block", fontFamily: "var(--font-body)" } }, label && /* @__PURE__ */ react_shim_default.createElement("span", { style: { display: "block", font: "var(--text-heading-sm)", color: "var(--text-primary)", marginBottom: 6 } }, label), /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: disabled ? "var(--surface-sunken)" : "var(--surface-page)",
      border: `1.5px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      padding: "10px 12px",
      boxShadow: focused && !error ? "var(--shadow-focus-ring)" : "none",
      transition: "var(--transition-interactive)"
    } }, prefix && /* @__PURE__ */ react_shim_default.createElement("span", { style: { color: "var(--text-tertiary)", display: "flex" } }, prefix), /* @__PURE__ */ react_shim_default.createElement(
      "input",
      {
        type,
        placeholder,
        disabled,
        value,
        onChange,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        style: { border: "none", outline: "none", background: "transparent", width: "100%", font: "var(--text-body-md)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }
      }
    )), (hint || error) && /* @__PURE__ */ react_shim_default.createElement("span", { style: { display: "block", marginTop: 6, font: "var(--text-caption)", color: error ? "var(--color-error)" : "var(--text-tertiary)" } }, error || hint));
  }

  // components/forms/Select.jsx
  function Select({ label, options = [], value, onChange, placeholder }) {
    return /* @__PURE__ */ react_shim_default.createElement("label", { style: { display: "block", fontFamily: "var(--font-body)" } }, label && /* @__PURE__ */ react_shim_default.createElement("span", { style: { display: "block", font: "var(--text-heading-sm)", color: "var(--text-primary)", marginBottom: 6 } }, label), /* @__PURE__ */ react_shim_default.createElement(
      "select",
      {
        value,
        onChange,
        style: {
          width: "100%",
          appearance: "none",
          background: "var(--surface-page)",
          border: "1.5px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          font: "var(--text-body-md)",
          fontFamily: "var(--font-body)",
          color: "var(--text-primary)"
        }
      },
      placeholder && /* @__PURE__ */ react_shim_default.createElement("option", { value: "" }, placeholder),
      options.map((o) => /* @__PURE__ */ react_shim_default.createElement("option", { key: o.value, value: o.value }, o.label))
    ));
  }
  function Checkbox({ label, checked, onChange, disabled }) {
    return /* @__PURE__ */ react_shim_default.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: {
      width: 18,
      height: 18,
      borderRadius: "var(--radius-xs)",
      border: `1.5px solid ${checked ? "var(--brand-solid)" : "var(--border-strong)"}`,
      background: checked ? "var(--brand-solid)" : "var(--surface-page)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "var(--transition-interactive)"
    } }, checked && /* @__PURE__ */ react_shim_default.createElement("svg", { width: "11", height: "9", viewBox: "0 0 11 9", fill: "none" }, /* @__PURE__ */ react_shim_default.createElement("path", { d: "M1 4.5L4 7.5L10 1", stroke: "white", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }))), /* @__PURE__ */ react_shim_default.createElement("input", { type: "checkbox", checked, onChange, disabled, style: { position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" } }), /* @__PURE__ */ react_shim_default.createElement("span", { style: { font: "var(--text-body-md)", color: "var(--text-primary)" } }, label));
  }

  // components/modal/Modal.jsx
  function Modal({ open, title, children, footer, onClose }) {
    const dialogRef = react_shim_default.useRef(null);
    const previouslyFocused = react_shim_default.useRef(null);
    const titleId = react_shim_default.useId();
    react_shim_default.useEffect(() => {
      if (!open) return;
      previouslyFocused.current = document.activeElement;
      dialogRef.current?.focus();
      function onKeyDown(e) {
        if (e.key === "Escape") {
          onClose && onClose();
          return;
        }
        if (e.key === "Tab" && dialogRef.current) {
          const focusables = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!focusables.length) return;
          const list = Array.from(focusables);
          const first = list[0], last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        previouslyFocused.current?.focus?.();
      };
    }, [open]);
    if (!open) return null;
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      position: "fixed",
      inset: 0,
      background: "var(--surface-overlay)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      fontFamily: "var(--font-body)"
    }, onClick: onClose }, /* @__PURE__ */ react_shim_default.createElement("div", { ref: dialogRef, tabIndex: -1, role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, onClick: (e) => e.stopPropagation(), style: {
      width: 420,
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-xl)",
      overflow: "hidden"
    } }, /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)" } }, /* @__PURE__ */ react_shim_default.createElement("span", { id: titleId, style: { font: "var(--text-heading-md)", color: "var(--text-primary)" } }, title), /* @__PURE__ */ react_shim_default.createElement("button", { onClick: onClose, "aria-label": "Close", style: { border: "none", background: "transparent", color: "var(--text-tertiary)", fontSize: 18, cursor: "pointer" } }, "\u2715")), /* @__PURE__ */ react_shim_default.createElement("div", { style: { padding: 20, font: "var(--text-body-md)", color: "var(--text-secondary)" } }, children), footer && /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 20px", borderTop: "1px solid var(--border-subtle)" } }, footer)));
  }

  // components/navigation/Navbar.jsx
  function Navbar({ links = [], cta, onGround }) {
    const fg = "var(--text-primary)";
    return /* @__PURE__ */ react_shim_default.createElement("div", { className: onGround ? "on-ground" : "", style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 32px",
      background: onGround ? "var(--color-primary-600)" : "var(--surface-page)",
      borderBottom: onGround ? "none" : "1px solid var(--border-subtle)",
      fontFamily: "var(--font-body)"
    } }, /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, font: "var(--text-heading-md)", color: fg, fontFamily: "var(--font-display)", fontWeight: 800 } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 28, height: 28, borderRadius: "50%", background: onGround ? "var(--color-white)" : "linear-gradient(135deg,#F14A2A,#FFA347)", display: "inline-block" } }), "insell.id"), /* @__PURE__ */ react_shim_default.createElement("nav", { style: { display: "flex", gap: 28 } }, links.map((l) => /* @__PURE__ */ react_shim_default.createElement("a", { key: l, href: "#", style: { color: fg, opacity: 0.85, font: "var(--text-body-md)", textDecoration: "none" } }, l))), cta);
  }

  // components/navigation/Sidebar.jsx
  function Sidebar({ sections = [], activeId, onSelect, collapsed }) {
    return /* @__PURE__ */ react_shim_default.createElement("nav", { "aria-label": "Sidebar", style: {
      width: collapsed ? 64 : 232,
      background: "var(--surface-page)",
      borderRight: "1px solid var(--border-subtle)",
      padding: "16px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      fontFamily: "var(--font-body)",
      boxSizing: "border-box",
      height: "100%"
    } }, sections.map((sec) => /* @__PURE__ */ react_shim_default.createElement("div", { key: sec.title }, !collapsed && /* @__PURE__ */ react_shim_default.createElement("div", { style: { font: "var(--text-overline)", letterSpacing: "var(--tracking-overline)", color: "var(--text-tertiary)", padding: "0 10px 8px" } }, sec.title), /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, sec.items.map((item) => {
      const active = item.id === activeId;
      return /* @__PURE__ */ react_shim_default.createElement("button", { key: item.id, onClick: () => onSelect && onSelect(item.id), "aria-current": active ? "page" : void 0, "aria-label": collapsed ? item.label : void 0, style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: active ? "var(--brand-soft)" : "transparent",
        color: active ? "var(--text-brand)" : "var(--text-secondary)",
        font: "var(--text-body-md)",
        fontWeight: active ? 600 : 500,
        textAlign: "left",
        cursor: "pointer",
        width: "100%"
      } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 18, height: 18, borderRadius: "var(--radius-xs)", background: active ? "var(--color-primary-500)" : "var(--color-neutral-300)", flexShrink: 0 } }), !collapsed && item.label);
    })))));
  }

  // components/progress/Progress.jsx
  function Progress({ value = 0, tone = "brand" }) {
    const fg = tone === "error" ? "var(--color-error)" : tone === "warning" ? "var(--color-warning)" : "var(--brand-solid)";
    const clamped = Math.min(100, Math.max(0, value));
    return /* @__PURE__ */ react_shim_default.createElement("div", { role: "progressbar", "aria-valuenow": clamped, "aria-valuemin": 0, "aria-valuemax": 100, style: { height: 8, borderRadius: "var(--radius-full)", background: "var(--color-neutral-100)", overflow: "hidden" } }, /* @__PURE__ */ react_shim_default.createElement("div", { style: { height: "100%", width: `${clamped}%`, background: fg, borderRadius: "var(--radius-full)", transition: "width var(--duration-slow) var(--ease-standard)" } }));
  }
  function Spinner({ size = 20, label = "Loading" }) {
    return /* @__PURE__ */ react_shim_default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", role: "status", "aria-label": label, style: { animation: "isl-spin 700ms linear infinite" } }, /* @__PURE__ */ react_shim_default.createElement("style", null, "@keyframes isl-spin{to{transform:rotate(360deg)}}"), /* @__PURE__ */ react_shim_default.createElement("circle", { cx: "12", cy: "12", r: "9", fill: "none", stroke: "var(--color-neutral-200)", strokeWidth: "3" }), /* @__PURE__ */ react_shim_default.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", fill: "none", stroke: "var(--brand-solid)", strokeWidth: "3", strokeLinecap: "round" }));
  }

  // components/stat-card/StatCard.jsx
  function StatCard({ label, value, delta, deltaTone = "success", icon }) {
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      padding: "var(--space-5)",
      fontFamily: "var(--font-body)",
      display: "flex",
      flexDirection: "column",
      gap: 10
    } }, /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ react_shim_default.createElement("span", { style: { font: "var(--text-caption)", color: "var(--text-tertiary)" } }, label), icon && /* @__PURE__ */ react_shim_default.createElement("span", { style: { width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--brand-soft)", color: "var(--text-brand)", display: "flex", alignItems: "center", justifyContent: "center" } }, icon)), /* @__PURE__ */ react_shim_default.createElement("span", { style: { font: "var(--text-display-sm)", fontFamily: "var(--font-display)", color: "var(--text-primary)" } }, value), delta && /* @__PURE__ */ react_shim_default.createElement("span", { style: { font: "var(--text-caption)", fontWeight: 600, color: deltaTone === "error" ? "var(--color-error)" : "var(--color-success)" } }, delta));
  }

  // components/table/Table.jsx
  function Table({ columns = [], rows = [] }) {
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: { border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", fontFamily: "var(--font-body)" } }, /* @__PURE__ */ react_shim_default.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /* @__PURE__ */ react_shim_default.createElement("thead", null, /* @__PURE__ */ react_shim_default.createElement("tr", { style: { background: "var(--surface-sunken)" } }, columns.map((c) => /* @__PURE__ */ react_shim_default.createElement("th", { key: c.key, scope: "col", style: { textAlign: c.align || "left", padding: "10px 16px", font: "var(--text-overline)", letterSpacing: "var(--tracking-overline)", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-subtle)" } }, c.label)))), /* @__PURE__ */ react_shim_default.createElement("tbody", null, rows.map((row, i) => /* @__PURE__ */ react_shim_default.createElement("tr", { key: i, style: { borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" } }, columns.map((c) => /* @__PURE__ */ react_shim_default.createElement("td", { key: c.key, style: { textAlign: c.align || "left", padding: "12px 16px", font: c.mono ? "var(--text-mono-sm)" : "var(--text-body-sm)", color: "var(--text-primary)" } }, row[c.key])))))));
  }

  // components/tabs/Tabs.jsx
  function Tabs({ tabs = [], activeId, onChange }) {
    const active = activeId ?? tabs[0]?.id;
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: { fontFamily: "var(--font-body)" } }, /* @__PURE__ */ react_shim_default.createElement("div", { role: "tablist", style: { display: "flex", gap: 4, borderBottom: "1px solid var(--border-subtle)" } }, tabs.map((t) => {
      const isActive = t.id === active;
      return /* @__PURE__ */ react_shim_default.createElement("button", { key: t.id, role: "tab", "aria-selected": isActive, onClick: () => onChange && onChange(t.id), style: {
        padding: "10px 16px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        font: "var(--text-body-md)",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--text-brand)" : "var(--text-secondary)",
        borderBottom: `2px solid ${isActive ? "var(--brand-solid)" : "transparent"}`,
        marginBottom: -1
      } }, t.label);
    })));
  }

  // components/wayfinding/Breadcrumb.jsx
  function Breadcrumb({ items = [] }) {
    return /* @__PURE__ */ react_shim_default.createElement("nav", { "aria-label": "Breadcrumb", style: { display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)" } }, items.map((item, i) => /* @__PURE__ */ react_shim_default.createElement(react_shim_default.Fragment, { key: i }, i > 0 && /* @__PURE__ */ react_shim_default.createElement("span", { style: { color: "var(--text-tertiary)", font: "var(--text-body-sm)" } }, "/"), i === items.length - 1 ? /* @__PURE__ */ react_shim_default.createElement("span", { "aria-current": "page", style: { font: "var(--text-body-sm)", fontWeight: 600, color: "var(--text-primary)" } }, item) : /* @__PURE__ */ react_shim_default.createElement("a", { href: "#", style: { font: "var(--text-body-sm)", color: "var(--text-secondary)", textDecoration: "none" } }, item))));
  }

  // components/wayfinding/Pagination.jsx
  function Pagination({ page = 1, totalPages = 1, onChange }) {
    const go = (p) => p >= 1 && p <= totalPages && onChange && onChange(p);
    return /* @__PURE__ */ react_shim_default.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)" }, role: "navigation", "aria-label": "Pagination" }, /* @__PURE__ */ react_shim_default.createElement("button", { onClick: () => go(page - 1), disabled: page === 1, style: btnStyle(false, page === 1), "aria-label": "Halaman sebelumnya" }, "\u2039"), Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map((p) => /* @__PURE__ */ react_shim_default.createElement("button", { key: p, onClick: () => go(p), style: btnStyle(p === page), "aria-current": p === page ? "page" : void 0, "aria-label": "Halaman " + p }, p)), /* @__PURE__ */ react_shim_default.createElement("button", { onClick: () => go(page + 1), disabled: page === totalPages, style: btnStyle(false, page === totalPages), "aria-label": "Halaman berikutnya" }, "\u203A"));
  }
  function btnStyle(active, disabled) {
    return {
      minWidth: 32,
      height: 32,
      border: "1px solid " + (active ? "var(--brand-solid)" : "var(--border-default)"),
      borderRadius: "var(--radius-sm)",
      background: active ? "var(--brand-solid)" : "var(--surface-page)",
      color: active ? "var(--text-on-brand)" : disabled ? "var(--text-disabled)" : "var(--text-primary)",
      font: "var(--text-body-sm)",
      cursor: disabled ? "not-allowed" : "pointer"
    };
  }

  // .buildtmp/entry.js
  window.Insell = {
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    EmptyState,
    Alert,
    Toast,
    Tooltip,
    Input,
    Select,
    Checkbox,
    Modal,
    Navbar,
    Sidebar,
    Progress,
    Spinner,
    StatCard,
    Table,
    Tabs,
    Breadcrumb,
    Pagination
  };
})();
