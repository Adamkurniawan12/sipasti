# SIPASTI – Sistem Informasi Pengelolaan Data dan Informasi Konstruksi

SIPASTI adalah platform sistem informasi modern, profesional, dan responsif untuk instansi pemerintahan di bidang jasa konstruksi nasional. Sistem ini mengelola acuan **Harga Satuan Pokok Wilayah (HSPW)** (upah tenaga kerja, material bahan konstruksi, dan sewa alat berat), alur usulan & validasi bertingkat, zonasi wilayah administrasi, audit logging, serta laporan rekapitulasi dinas yang siap cetak resmi.

Sistem menggunakan **2 Tingkatan Role Pengguna: Administrator (`ADMIN`) dan User Pengguna (`USER`)**.

---

## 🛠️ Framework & Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur *full-stack modern* berstandar enterprise pemerintahan:

| Kategori | Teknologi / Framework | Versi | Peran & Kegunaan |
|---|---|---|---|
| **Framework Frontend** | **Next.js (App Router)** | `v16.4.5` | Server-Side Rendering (SSR), App Router, Layouts & Route Handlers |
| **UI Library** | **React.js** | `v19.3.0` | Antarmuka pengguna komponen reaktif modern |
| **Bahasa Pemrograman** | **TypeScript** | `v5.x` | *Type safety*, kejelasan kontrak data, meminimalisir bug saat kompilasi |
| **CSS Framework** | **Tailwind CSS** | `v4.x` | Styling utilitas responsif, tema dinas (*Navy Blue* `#12345A`, *Dark Blue* `#0B2545`) |
| **UI Polish & Animasi** | **Custom CSS Utilities** | - | `btn-animate` (efek klik interaktif), `card-hover` (elevasi kartu), `skeleton-shimmer` (efek loading berkilau) |
| **Ikon Antarmuka** | **Lucide React** | `v1.70.0` | Koleksi ikon SVG modern dan konsisten di seluruh modul |
| **Database ORM** | **Prisma ORM** | `v6.4.1` | Pemodelan relasi database, query builder type-safe, dan skema migrasi |
| **Database Utama** | **MySQL (MariaDB)** | `v10.4+ / MySQL 8.x` | Penyimpanan data relasional terstruktur (`sipasti_db` via XAMPP) |
| **Autentikasi & Keamanan** | **Auth.js / NextAuth** & **Bcryptjs** | `v5.0-beta` / `v3.0.3` | Manajemen sesi JWT, Role-Based Access Control (RBAC), enkripsi hash password |
| **Visualisasi Data** | **Recharts** | `v3.10.1` | Grafik batang distribusi kategori & diagram donat status validasi |
| **Manajemen Form** | **React Hook Form** | `v7.91.0` | Penanganan input form modal, validasi state tanpa re-render berlebih |
| **Validasi Skema** | **Zod** | `v4.6.7` | Validasi skema input frontend dan validasi payload API backend |
| **Komponen Tabel** | **TanStack Table Concepts** | `v9.3.1` | Struktur tabel data interaktif dengan pencarian, filter, dan pagination |

---

## 👥 Akun Login & Kredensial (2 Role Utama)

Sistem menggunakan 2 role dengan pembagian wewenang yang tegas:

> **Password untuk seluruh akun:** `password123`

| No | Role Pengguna | Username | Email Kedinasan | Password | Hak Akses & Wewenang Utama |
|:---:|---|---|---|:---:|---|
| **1** | **Administrator** (`ADMIN`) | `admin` | `admin@sipasti.go.id` | `password123` | **Pengelola Penuh Sistem & Penelaah Utama**:<br>&bull; **Manajemen Pengguna (`/users`)**: Hak akses pengguna dipegang penuh oleh Administrator (tambah akun, ganti role Admin/User, ubah status *Active, Inactive, Suspended*, reset kata sandi, dan hapus akun).<br>&bull; **Tindak Lanjut & Validasi Usulan User**: Berwenang melakukan **ACC (Disetujui)**, **Tolak**, atau meminta **Revisi (Perlu Perbaikan)** atas seluruh usulan user, baik pada menu **Validasi Data** (`/validasi`) maupun **Pengajuan Usulan** (`/pengajuan`).<br>&bull; **Katalog Data HSPW (`/hspw`)**: Tambah, edit, detail teknis, hapus data, dan ekspor CSV.<br>&bull; **Pengelolaan Wilayah (`/wilayah`)**: Tambah, edit, dan kelola hierarki Provinsi serta Kabupaten/Kota.<br>&bull; **Laporan & Rekapitulasi (`/laporan`)**: Filter rekapitulasi, cetak dokumen resmi (*print view*), dan ekspor data dinas. |
| **2** | **User Pengguna** (`USER`) | `user` | `user@sipasti.go.id` | `password123` | **Penyedia Jasa / Instansi Daerah**:<br>&bull; **Dashboard (`/dashboard`)**: Melihat visualisasi statistik data konstruksi nasional.<br>&bull; **Data HSPW (`/hspw`)**: Melihat katalog resmi acuan harga yang telah disetujui (ACC) dan unduh CSV.<br>&bull; **Pengajuan Usulan (`/pengajuan`)**: Membuat dan mengirim usulan berkas paket data harga satuan wilayah baru.<br>&bull; **Pantau Status & Batalkan Usulan**: Melihat status usulannya (*Diajukan, Ditelaah/Revisi, Disetujui, Ditolak*) beserta catatan arahan dari Administrator, serta dapat membatalkan/menghapus usulannya sendiri jika belum disetujui.<br>&bull; **Laporan (`/laporan`)**: Melihat rekapitulasi dan mencetak lembar acuan harga.<br>&bull; **Profil Mandiri (`/profile`)**: Memperbarui informasi profil dan kata sandi akun pribadi. |

---

## 🔄 Alur Kerja Sistem (Workflow Alur Pengguna & Bisnis)

```
       ┌────────────────────────────────────────────────────────┐
       │             PORTAL PUBLIK & REGISTRASI                 │
       │    1. Landing Page (/) ──► 2. Register (/register)     │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │     LOGIN (/login)      │
                     └────────────┬────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐
   │       ROLE USER           │     │       ROLE ADMIN          │
   ├───────────────────────────┤     ├───────────────────────────┤
   │ 1. Dashboard Ringkasan    │     │ 1. Dashboard Ringkasan    │
   │ 2. Eksplorasi Data HSPW   │     │ 2. Kelola Pengguna (/users│
   │ 3. Buat Usulan (/pengajuan│     │ 3. Kelola Wilayah         │
   │    & /hspw)               │     │ 4. Tindak Lanjut Usulan:  │
   │    Status: PENDING        │     │    • ACC (Setujui)        │
   │ 4. Pantau Status &        │     │    • Minta Revisi         │
   │    Catatan Administrator  │     │    • Tolak Usulan         │
   │ 5. Cetak Laporan Rekap    │     │ 5. Validasi & Audit Log   │
   └─────────────┬─────────────┘     └─────────────┬─────────────┘
                 │                                 │
                 └────────────────►◄───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │   KATALOG RESMI HSPW AKTIF    │
                   │  (Status: Disetujui / ACC)   │
                   └───────────────────────────────┘
```

### 1. Alur Masuk & Pendaftaran Pengguna Mandiri
1. **Landing Page (`/`)**: Pengunjung mengakses portal resmi SIPASTI, membaca profil layanan dan katalog acuan konstruksi.
2. **Pendaftaran Mandiri (`/register`)**: Pengguna dinas/penyedia mendaftar dengan NIP, email, username, dan password. Sistem otomatis menetapkan role **`USER`**.
3. **Login (`/login`)**: Pengguna atau Administrator masuk menggunakan username/email dan password (`password123`).

### 2. Alur Pengajuan Usulan oleh User (`/pengajuan` & `/hspw`)
1. User masuk ke menu **Pengajuan Usulan** atau **Data HSPW**.
2. Mengisi formulir usulan harga baru (kategori, wilayah, spesifikasi teknis, satuan, nilai harga, tahun anggaran, dan catatan/dasar survei harga).
3. Saat dikirim, usulan masuk ke database MySQL dengan status awal **`MENUNGGU` / `SUBMITTED`**.
4. User dapat memantau status berkasnya secara real-time pada daftar pengajuan dan dapat membatalkan berkas usulan jika diperlukan.

### 3. Alur Tindak Lanjut oleh Administrator (`/validasi` & `/pengajuan`)
1. Administrator membuka modul **Validasi Data** atau **Pengajuan Usulan**.
2. Administrator meninjau rincian teknis, spesifikasi, dan kewajaran harga usulan.
3. Administrator memilih salah satu tindakan resmi disertai catatan telaah teknis:
   - 🟢 **Setujui (ACC)**: Status berubah menjadi `DISETUJUI` / `APPROVED`. Item otomatis diterbitkan ke katalog resmi HSPW aktif dan indikator dashboard bertambah.
   - 🟡 **Minta Revisi**: Status berubah menjadi `PERLU_PERBAIKAN` / `IN_REVIEW`. User menerima catatan hal-hal yang perlu disempurnakan (misal: faktur survei distributor).
   - 🔴 **Tolak Usulan**: Status berubah menjadi `DITOLAK` / `REJECTED` disertai alasan penolakan yang tercatat permanen di audit log.
4. Notifikasi otomatis dikirimkan ke pemohon usulan.

### 4. Alur Manajemen Pengguna oleh Administrator (`/users`)
1. Hak akses modul pengguna berada penuh di tangan **Administrator**.
2. Administrator dapat:
   - Mendaftarkan akun dinas baru (menentukan role `ADMIN` atau `USER`).
   - Mengubah status akun (*Active*, *Inactive*, *Suspended*).
   - Melakukan reset password instan bagi pengguna yang lupa kata sandi.
   - Menghapus akun pengguna yang sudah tidak bertugas.

### 5. Alur Tata Kelola Wilayah & Laporan Dinas (`/wilayah` & `/laporan`)
1. Administrator mengelola master wilayah (Provinsi dan Kabupaten/Kota) dengan proteksi integritas data (*foreign key*).
2. Seluruh pengguna dapat mengakses **Laporan & Rekapitulasi**:
   - Filter agregat per wilayah, kategori, dan tahun anggaran.
   - **Tombol Ekspor CSV**: Unduh berkas format spreadsheet.
   - **Tombol Cetak Dokumen Dinas**: Menghasilkan lembar laporan formal berstandar instansi lengkap dengan **Kop Surat Kementerian** dan **Kolom Tanda Tangan Pejabat Pengesah**.

---

## 💻 Panduan Instalasi & Menjalankan Proyek

### 1. Persiapan Database MySQL (XAMPP)
Nyalakan Apache & MySQL di **XAMPP Control Panel**, lalu pastikan database dibuat:
```sql
CREATE DATABASE IF NOT EXISTS sipasti_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi Environment Variable (`.env`)
Pastikan file `.env` di folder `sipasti-web` terisi:
```env
DATABASE_URL="mysql://root:@localhost:3306/sipasti_db"
AUTH_SECRET="sipasti-secret-key-super-secure-production-ready-2025"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SIPASTI"
NEXT_PUBLIC_APP_DESC="Sistem Informasi Pengelolaan Data dan Informasi Konstruksi"
```

### 3. Instalasi & Sinkronisasi Database
```bash
# Masuk ke folder proyek
cd c:\xampp\htdocs\sipasti-web

# Instalasi dependensi
npm install

# Sinkronkan skema Prisma ke database MySQL
npx prisma db push

# Jalankan Seeding (Akun Admin & User, Wilayah, Kategori, Contoh HSPW)
npm run seed
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di: 👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏛️ Struktur Menu Halaman

- `/` : Landing Page Portal Publik SIPASTI
- `/login` : Halaman Masuk Akun Pengguna
- `/register` : Pendaftaran Akun Baru Mandiri
- `/dashboard` : Dashboard Statistik KPI & Grafik Recharts
- `/hspw` : Katalog Data Harga Satuan Pokok Wilayah (CRUD & Ekspor CSV)
- `/pengajuan` : Berkas Usulan Data (User Mengajukan; Admin Menindaklanjuti)
- `/validasi` : Modul Telaah Teknis & Validasi (ACC / Revisi / Tolak oleh Admin)
- `/wilayah` : Pengelolaan Master Wilayah Provinsi dan Kota/Kabupaten
- `/laporan` : Rekapitulasi Data, Ekspor CSV, dan Format Cetak Dokumen Dinas
- `/users` : Manajemen Pengguna & Hak Akses (Khusus Administrator)
- `/profile` : Pengaturan Profil Akun & Pembaruan Password Mandiri

---

## 📚 Dokumen Teknis Resmi (SRS, SDD, UAT & Evaluasi Komprehensif)

Tersedia dokumen spesifikasi dan laporan evaluasi standar kedinasan dalam format Microsoft Word (`.docx`) di folder `docs/`:

1. **[Dokumen Komprehensif: aplikasi sipasti.docx](file:///c:/xampp/htdocs/sipasti-web/docs/aplikasi%20sipasti.docx)** ⭐  
   *Dokumen Utama Mencakup Seluruh Bobot Penilaian (100%):*  
   - **SDLC & SRS (30%):** Definisi aplikasi, Use Case Diagram, Use Case Scenario lengkap (UC-01 s/d UC-10), Activity Diagram, Entity Relational Diagram (ERD 12 entitas), Class Diagram, dan Sequence Diagram penelaahan berkas usulan.  
   - **Quality Assurance & UAT (25%):** Strategi pengujian, matriks 20 kasus uji (*TC-01 s/d TC-20*), pelacakan cacat (*Defect Resolution*), dan lembar pengesahan tanda tangan (*Sign-Off*).  
   - **Data Analyst (25%):** Statistik deskriptif acuan harga (Mean, Median, Std Dev), disparitas wilayah regional (Indeks Kemahalan Konstruksi), rasio persetujuan (*Approval Rate* 68.2%), dan rekomendasi kebijakan strategis.  
   - **Front End (10%):** Arsitektur Next.js 16 App Router, React 19, Tailwind CSS v4, tema kedinasan *Navy Blue*, Lucide Icons, dan visualisasi Recharts.  
   - **Back End & SDD (10%):** RESTful API Handlers, Prisma ORM v6, basis data MySQL `sipasti_db`, keamanan sesi JWT Auth.js v5, hashing Bcrypt, dan validasi skema Zod.

2. **[Software Requirement Specification (SRS)](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_SRS_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-SRS-SIPASTI-2026-V1.0`*

3. **[Software Definition & Design (SDD)](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_SDD_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-SDD-SIPASTI-2026-V1.0`*

4. **[User Acceptance Test (UAT) Report](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_UAT_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-UAT-SIPASTI-2026-V1.0`*

---

## 📚 Dokumen Teknis Resmi (SRS, SDD, UAT & Evaluasi Komprehensif)

Tersedia dokumen spesifikasi dan laporan evaluasi standar kedinasan dalam format Microsoft Word (`.docx`) di folder `docs/`:

1. **[Dokumen Komprehensif: aplikasi sipasti.docx](file:///c:/xampp/htdocs/sipasti-web/docs/aplikasi%20sipasti.docx)** ⭐  
   *Dokumen Utama Mencakup Seluruh Bobot Penilaian (100%):*  
   - **SDLC & SRS (30%):** Definisi aplikasi, Use Case Diagram, Use Case Scenario lengkap (UC-01 s/d UC-10), Activity Diagram, Entity Relational Diagram (ERD 12 entitas), Class Diagram, dan Sequence Diagram penelaahan berkas usulan.  
   - **Quality Assurance & UAT (25%):** Strategi pengujian, matriks 20 kasus uji (*TC-01 s/d TC-20*), pelacakan cacat (*Defect Resolution*), dan lembar pengesahan tanda tangan (*Sign-Off*).  
   - **Data Analyst (25%):** Statistik deskriptif acuan harga (Mean, Median, Std Dev), disparitas wilayah regional (Indeks Kemahalan Konstruksi), rasio persetujuan (*Approval Rate* 68.2%), dan rekomendasi kebijakan strategis.  
   - **Front End (10%):** Arsitektur Next.js 16 App Router, React 19, Tailwind CSS v4, tema kedinasan *Navy Blue*, Lucide Icons, dan visualisasi Recharts.  
   - **Back End & SDD (10%):** RESTful API Handlers, Prisma ORM v6, basis data MySQL `sipasti_db`, keamanan sesi JWT Auth.js v5, hashing Bcrypt, dan validasi skema Zod.

2. **[Software Requirement Specification (SRS)](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_SRS_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-SRS-SIPASTI-2026-V1.0`*

3. **[Software Definition & Design (SDD)](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_SDD_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-SDD-SIPASTI-2026-V1.0`*

4. **[User Acceptance Test (UAT) Report](file:///c:/xampp/htdocs/sipasti-web/docs/DOKUMEN_UAT_SIPASTI.docx)**  
   *Kode: `PUPR-DJBK-UAT-SIPASTI-2026-V1.0`*

---

&copy; SIPASTI – Sistem Informasi Pengelolaan Data dan Informasi Konstruksi. Hak Cipta Dilindungi Undang-Undang.
