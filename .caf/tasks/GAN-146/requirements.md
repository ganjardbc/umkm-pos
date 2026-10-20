# Ubah default limit audit log dari 10 menjadi 20
Status: DRAFT
Source: GAN-146

## 1. Outcome
Saat pengambilan audit log sebuah shift dipanggil tanpa `limit`, layanan memakai 20 entri per halaman (bukan 10). Default `offset` tetap 0.

## 2. Scope
In:
- Ubah nilai default `limit` pada layanan audit log menjadi 20.
- Tambah test baru untuk pemanggilan tanpa `limit`.

Out:
- Controller, DTO, modul lain.
- Test yang sudah ada.

## 3. Constraints and Assumptions
- Constraint: hanya dua file yang boleh diubah: `apps/api/src/audit-logs/audit-logs.service.ts` dan `apps/api/src/audit-logs/audit-logs.service.spec.ts`.
- Finding: `apps/api/src/audit-logs/audit-logs.service.ts` mendeklarasikan `limit: number = 10, offset: number = 0` pada `getAuditLogs`; `limit` dan `offset` diteruskan ke `findMany` sebagai `take` dan `skip`, dan dikembalikan di hasil.
- Finding: `apps/api/src/audit-logs/audit-logs.service.spec.ts` memanggil `getAuditLogs` dengan `limit` eksplisit di semua test lama (`10, 0` dan `20, 5`); tidak ada test yang memakai default.
- Finding: satu-satunya pemanggil di luar spec adalah `apps/api/src/audit-logs/audit-logs.controller.ts`. Controller selalu menghitung `limitNum = limit ? parseInt(limit, 10) : 10` sendiri dan meneruskannya, jadi default service tidak pernah dipakai lewat HTTP. Akibatnya perubahan ini tidak mengubah perilaku endpoint (tetap default 10 di controller).
- Finding: grep `getAuditLogs` di `apps/` hanya menemukan service, spec, dan controller tersebut (AC-6 terpenuhi).
- Finding: ADR di `.caf/knowledge/decisions/` (adr-008 s.d. adr-015) mengenai pemilihan tool/framework; tidak ada yang terkait default paginasi.
- Assumption A-1: ketidaksesuaian default 10 di controller (dan contoh Swagger `example: 10`) dibiarkan karena controller di luar scope tiket; didasarkan pada bagian "Ruang lingkup" tiket.

## 4. Decisions Already Made
- Controller tidak diubah, sesuai tiket.

## 5. Open Questions
Tidak ada

## 6. Acceptance Criteria
- AC-1: When audit log sebuah shift diambil tanpa `limit`, then hasil mengembalikan `limit` bernilai 20. Verify: automated test — test baru di `apps/api/src/audit-logs/audit-logs.service.spec.ts` (dibuat oleh task 1 di `tasks.md`); `command: pnpm --filter umkm-pos-api run test -- src/audit-logs/audit-logs.service.spec.ts | expect: exit code 0`
- AC-2: When audit log diambil tanpa `limit`, then query data dipanggil dengan `take: 20` dan `skip: 0`. Verify: automated test — test baru di `apps/api/src/audit-logs/audit-logs.service.spec.ts` (task 1); `command: pnpm --filter umkm-pos-api run test -- src/audit-logs/audit-logs.service.spec.ts | expect: exit code 0`
- AC-3: When seluruh test lama di `audit-logs.service.spec.ts` dijalankan tanpa diubah, then semuanya lulus, termasuk `should return paginated audit logs` dan `should support custom limit and offset`. Verify: command: pnpm --filter umkm-pos-api run test -- src/audit-logs/audit-logs.service.spec.ts | expect: exit code 0
- AC-4: When lint dijalankan pada API, then lolos tanpa peringatan. Verify: command: pnpm --filter umkm-pos-api run lint:ci | expect: exit code 0
- AC-5: When API di-build, then build sukses. Verify: command: pnpm --filter umkm-pos-api run build | expect: exit code 0
- AC-6: When pemanggil `getAuditLogs` di luar spec ditinjau, then tidak ada yang bergantung pada default 10. Verify: manual: reviewer menjalankan grep `getAuditLogs` di `apps/` dan memastikan hanya `audit-logs.controller.ts` yang memanggil, dengan `limit` selalu eksplisit.
