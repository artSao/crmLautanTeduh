# Lautan Teduh CRM & Broadcast System

Aplikasi web berbasis **Next.js** yang dikhususkan untuk Manajemen Hubungan Pelanggan (CRM) dan pengiriman pesan promosi/informasi massal (Broadcast) via WhatsApp untuk bengkel Lautan Teduh.

Proyek ini merupakan bagian dari Tugas Akhir, berfokus pada integrasi *Frontend* dengan *Backend API* eksternal dan *WhatsApp Gateway*.

---

## 🚀 Fitur Utama

- **Manajemen Kontak Pelanggan (CRM)**: Menambahkan, melihat, dan mengelola daftar nomor WhatsApp pelanggan langsung dari database server.
- **Direct Message (Kirim Pesan Langsung)**: Mengirimkan pesan pengingat (reminder) atau pesan kustom ke WhatsApp pelanggan secara satuan.
- **Broadcast Promosi**: Membuat dan menyebarkan pesan massal (Teks & Gambar) ke seluruh kontak pelanggan yang terdaftar untuk keperluan promosi atau pemberitahuan bengkel.
- **Admin Dashboard**: Antarmuka responsif dan aman untuk admin cabang mengelola data operasional.
- **API Proxy Integration**: Menggunakan mekanisme internal *Next.js Route Handlers* (`/api/proxy/...`) untuk mengamankan Token JWT dan menghindari isu CORS saat berkomunikasi dengan *Backend Server*.

---

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) / React Icons
- **HTTP Client**: Native `fetch` API terintegrasi dengan Next.js Proxy.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan proyek ini, pastikan sistem Anda telah terinstal:
- **Node.js**: Versi 18.x atau yang lebih baru.
- **NPM** (Node Package Manager) atau **Yarn**.
- Akses ke Backend API (`rakaascode.site`).

---

## ⚙️ Instalasi & Konfigurasi

1. **Clone Repositori (Jika belum)**
   ```bash
   git clone <url-repositori-anda>
   cd lautteduhcrm
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Konfigurasi Environment Variables**
   Buat file bernama `.env.local` di *root* direktori proyek (sejajar dengan `package.json`). Anda bisa menyalin formatnya dari `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Isi nilai variabel di `.env.local` dengan konfigurasi yang benar:
   ```env
   # URL Backend API Utama
   NEXT_PUBLIC_API_URL=https://rakaascode.site/api
   
   # Konfigurasi lain jika ada (misalnya secret key)
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Akses Aplikasi**
   Buka browser dan kunjungi: [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Direktori Penting

- `app/admin/crm/`: Berisi halaman *user interface* (UI) untuk fitur CRM, pengiriman pesan, dan manajemen kontak.
- `app/admin/broadcast/`: Berisi halaman untuk fitur pengiriman pesan massal (Broadcast).
- `app/api/proxy/`: Layanan internal Next.js yang bertindak sebagai jembatan (proxy) aman antara Frontend dan Backend eksternal.
- `lib/types.ts`: Definisi struktur data (*TypeScript Interfaces*) untuk entitas seperti `CrmContact`, `Broadcast`, dan `AdminUser`.
- `lib/api.ts` & `lib/adminApi.ts`: Fungsi-fungsi *helper* untuk melakukan pemanggilan *HTTP Request* ke backend.

---

## 🤝 Penulis

Dikembangkan untuk keperluan **Tugas Akhir**.
*Fokus modul: CRM dan Broadcast WhatsApp.*
