# Knowledge Index

> Jembatan status ke dokumen referensi Layer 1 di `docs/` — project-owned, read-only bagi CAF
> (lihat CAF.md Layer 1). File ini di-generate `caf-initiator`, tapi isi dokumen yang
> ditautkan di bawah TIDAK — itu tetap tanggung jawab tim Product/Architecture, dibaca kalau
> tersedia, tidak pernah jadi syarat wajib sebelum pipeline jalan.

**Beda dengan `.caf/discovery/{slug}/prd.md`:** dokumen di `.caf/discovery/` adalah draft
per-fitur yang ditulis PM Agent selama alur Discovery (Klaster 1), belum tentu final dan belum
tentu relevan lintas fitur. `docs/product/prd.md` di bawah ini sebaliknya: PRD produk-level,
project-owned, dipakai berulang lintas ticket. Jangan tertukar keduanya.

## Dokumen Referensi

| Dokumen | Path | Status |
|---|---|---|
| PRD | `docs/product/prd.md` | ✓ ada |
| System Overview | `docs/architecture/system-overview.md` | ✓ ada |
| ERD | `docs/schema/erd.md` | ✓ ada |
| Testing Strategy | `docs/testing-strategy.md` | ✓ ada |
| API Contract | `docs/api-contract.md` | ✓ ada |

Jalankan `caf-init reference-docs` untuk generate placeholder kosong bagi dokumen yang belum
ada (opsional — lihat catatan di atas, tidak pernah jadi syarat wajib).
