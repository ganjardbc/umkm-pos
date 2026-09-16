Centered overlay dialog for confirmations and short forms.
```jsx
<Modal open={open} title="Hapus produk?" onClose={close} footer={<><Button variant="secondary" onClick={close}>Batal</Button><Button variant="danger">Hapus</Button></>}>
  Produk ini akan dihapus permanen.
</Modal>
```
