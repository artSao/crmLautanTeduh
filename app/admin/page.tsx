"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminUser } from "@/lib/auth";
import { getAdminCabangQueue } from "@/lib/adminApi";

export default function AdminPage() {
  const [adminName, setAdminName] = useState("");
  const [cabangId, setCabangId] = useState<number | null>(null);
  const [cabangNama, setCabangNama] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    menunggu: 0,
    dipanggil: 0,
    selesai: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getAdminUser();
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminName(user.name);
      setCabangId(user.cabang_id);
      setCabangNama(user.cabang_nama ?? null);
    }
  }, []);

  useEffect(() => {
    if (!cabangId) return;

    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminCabangQueue(cabangId);
        const counts = data.reduce(
          (agg, item) => {
            agg[item.status] += 1;
            return agg;
          },
          { menunggu: 0, dipanggil: 0, selesai: 0 },
        );
        setSummary(counts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Tidak dapat memuat ringkasan antrian.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [cabangId]);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Dashboard Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
              Selamat datang, {adminName || "Admin"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Kelola antrian cabang, kirim broadcast, dan CRM WhatsApp dari satu
              tempat.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/queue"
              className="rounded-3xl bg-zinc-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Lihat Antrian Cabang
            </Link>
            <Link
              href="/admin/broadcast"
              className="rounded-3xl border border-zinc-200 bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50"
            >
              Broadcast & Promo
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            Cabang
          </p>
          <p className="mt-4 text-2xl font-semibold text-zinc-950">
            {cabangNama ?? (cabangId ? `Cabang #${cabangId}` : "Super Admin")}
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Cabang bengkel yang sedang dikelola.
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            Antrian Menunggu
          </p>
          <p className="mt-4 text-4xl font-semibold text-emerald-700">
            {loading ? "..." : summary.menunggu}
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Jumlah antrian yang masih menunggu di cabang Anda.
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
            Dipanggil / Selesai
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-sky-700">
              {summary.dipanggil}
            </span>
            <span className="text-2xl font-semibold text-zinc-900">
              /{summary.selesai}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            Jumlah antrian yang sedang dipanggil dan selesai.
          </p>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-950">Langkah cepat</h2>
        <ul className="mt-4 space-y-3 text-sm text-zinc-600">
          <li>1. Buka halaman Antrian untuk memanggil nomor berikutnya.</li>
          <li>
            2. Gunakan Broadcast untuk mengirim promo atau peringatan cabang.
          </li>
          <li>
            3. Gunakan CRM WA untuk pengiriman manual dan pengingat otomatis.
          </li>
        </ul>
      </section>
    </div>
  );
}
