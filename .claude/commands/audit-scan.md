---
allowed-tools: Read, Grep, Glob, Bash
description: Jalankan Auditor Agent scan read-only terhadap scope tertentu, hasilkan dokumen temuan (tidak membuat ticket)
argument-hint: [scope, contoh: "apps/api/src/modules/rbac" atau "semua modul"]
---

# Audit Scan

**PENTING: Ini command READ-ONLY. Jangan edit/tulis file kode apapun. Jangan
buat ticket — itu tugas command terpisah `/audit-to-ticket`.**

Ikuti scope dan aturan yang sama seperti agent definition di
`.claude/agents/auditor.md` — kalau file itu ada, baca dan patuhi isinya
sebagai sumber kebenaran utama. Kalau tidak ada, gunakan prinsip default:
tools terbatas ke Read/Grep/Glob/Bash, tidak ada akses tulis ke sistem
eksternal (Linear, GitHub, dst).

## Scope

Target audit: $ARGUMENTS

Kalau argument kosong atau berisi "semua modul", lakukan full-scan terhadap
seluruh modul aplikasi (deteksi struktur dulu dari package.json/workspace
config sebelum mulai — jangan asumsi nama folder tanpa verifikasi).

## Yang Dicari

Fokus pada pola-pola berikut (sesuaikan/tambah berdasarkan konteks project
yang terdeteksi):
- Query/endpoint yang tidak melakukan validasi scope tenant/outlet/merchant
  (pola yang sudah terbukti jadi masalah nyata di project ini — lihat
  riwayat HOTFIX-RBAC-CROSS-TENANT)
- Guard/middleware permission yang di-comment atau dinonaktifkan sementara
- Secret atau credential yang ter-hardcode di source
- Raw SQL query tanpa parameterization
- Endpoint publik yang seharusnya butuh autentikasi tapi tidak ada guard
- Pola lain yang relevan dengan domain project — gunakan penilaian, tapi
  JANGAN buat asumsi soal severity tanpa menyertakan bukti baris kode

## Format Output

Untuk setiap temuan, WAJIB sertakan:
- **Lokasi**: `path/to/file.ext:baris`
- **Kategori**: (misal: cross-tenant-scope, guard-disabled, secret-exposure, dst)
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Deskripsi**: apa masalahnya, kenapa ini masalah
- **Rekomendasi singkat**: arah perbaikan (bukan implementasi lengkap)

Kelompokkan temuan per modul/area. Jangan buat rekomendasi implementasi detail
di command ini — itu keluar dari scope read-only audit.

## Setelah Selesai

Sarankan ke user untuk menjalankan `/audit-to-ticket` kalau mau convert
temuan ini jadi ticket Linear (dengan approval per-item, bukan auto-create).
