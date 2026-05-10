export type Cabang = {
  id: number;
  nama: string;
  alamat: string;
  kota: string;
  no_telp?: string;
  latitude?: number;
  longitude?: number;
};

export type AdminUser = {
  id: number;
  name: string;
  username: string;
  role: "admin";
  cabang_id: number | null;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

export type AntrianDetail = {
  id: number;
  cabang_id: number;
  user_id: number | null;
  nomor_antrian: number;
  status: "menunggu" | "dipanggil" | "selesai";
  nama_pemilik: string;
  no_hp: string;
  merk_motor: string;
  tipe_motor: string;
  no_rangka: string;
  no_mesin: string;
  tahun_pembuatan: number;
  tanggal_kedatangan: string;
  estimasi_jam: string;
  reminder_aktif: boolean;
  no_wa_reminder?: string | null;
  catatan?: string | null;
  created_at: string;
  updated_at: string;
};

export type Broadcast = {
  id: number;
  admin_id: number;
  judul: string;
  deskripsi: string;
  detail: string;
  gambar_url: string | null;
  tipe: "promo" | "antrian";
  cabang_id: number | null;
  created_at: string;
};

export type BroadcastPayload = {
  judul: string;
  deskripsi: string;
  detail: string;
  gambar_url?: string;
  tipe: "promo" | "antrian";
  cabang_id?: number | null;
};

export type CrmSendPayload = {
  no_wa: string;
  pesan: string;
};

export type CrmReminderPayload = {
  antrian_id: number;
  pesan?: string;
};

export type CrmContact = {
  id: number;
  nama: string;
  no_wa: string;
  created_at: string;
};

export type CrmContactPayload = {
  nama: string;
  no_wa: string;
};
