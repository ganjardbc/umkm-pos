Primary action control. Use `primary` for the single main action on a screen, `secondary` for alternatives, `ghost` for low-emphasis/inline actions, `danger` for destructive actions.

```jsx
<Button variant="primary" size="md" onClick={handleSave}>Simpan</Button>
<Button variant="secondary">Batal</Button>
<Button variant="danger" size="sm">Hapus</Button>
```

Variants: `primary` (solid brand), `secondary` (outlined neutral), `ghost` (text-only, soft hover), `danger` (destructive). Sizes: `sm`, `md`, `lg`. Supports `icon`, `disabled`, `fullWidth`.
