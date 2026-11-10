# Pengelola Daftar Tugas Kuliah

Aplikasi web untuk mengelola tugas kuliah. Dibuat dengan TypeScript dan Vite.

- Aplikasi online: https://pengelola-daftar-tugas-kuliah.vercel.app/
- Halaman tugas (bukti Git dan penjelasan): https://faizmuhammadilham.my.id/week-06/

## Fitur
- Tambah, edit, hapus, dan salin tugas
- Status Belum Selesai / Selesai
- Cari, filter, dan urutkan
- Statistik, progress bar, dan pengingat deadline
- Tampilan responsif

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env`, lalu isi nilainya
3. `npm run dev` untuk development
4. `npm run build` untuk build produksi (hasil di folder `dist/`)
5. `npm run preview` untuk melihat hasil build

## Environment Variables
| Variabel | Fungsi |
|---|---|
| `VITE_APP_NAME` | Nama aplikasi |
| `VITE_APP_VERSION` | Versi aplikasi |

Hanya data non-rahasia yang boleh dimasukkan ke variabel `VITE_*`, karena nilainya
ikut tertanam di hasil build. File `.env` tidak diunggah ke GitHub. Saat online,
nilainya diisi di Environment Variables pada dashboard Vercel.

## npm
- `dependencies`: paket yang dibutuhkan saat aplikasi berjalan
- `devDependencies`: paket khusus pengembangan (TypeScript, Vite)
- Semantic versioning: MAJOR.MINOR.PATCH. Tanda `^` mengizinkan pembaruan minor
  dan patch, tidak mengizinkan naik major.

## Struktur
src/
- `types/` interface, type alias, union type
- `store/` `Store<T>` (generics) dan localStorage
- `utils/` fungsi tanggal, statistik, dan generic untuk array
- `ui/` form, daftar tugas, modal, toast, statistik
- `styles/` CSS per bagian

## TypeScript yang dipakai
Tipe primitif, array, interface (`Task`, `DetailedStats`, `Reminder`),
type alias dan union type (`Status`, `FilterStatus`, `SortBy`),
dan generics (`Store<T>`, `filterBy<T>`, `sortItems<T>`).

## Git
Pengerjaan memakai branch per fitur, Pull Request, dan merge conflict yang diselesaikan.
Buktinya: https://faizmuhammadilham.my.id/week-06/bukti-git.html