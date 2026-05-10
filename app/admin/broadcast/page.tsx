"use client";

import { useEffect, useState } from "react";
import { createBroadcast, getBroadcastList } from "@/lib/adminApi";
import type { Broadcast, BroadcastPayload } from "@/lib/types";

export default function AdminBroadcastPage() {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [detail, setDetail] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");
  const [tipe, setTipe] = useState<"promo" | "antrian">("promo");
  const [cabangId, setCabangId] = useState("");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setError(null);
    try {
      const data = await getBroadcastList();
      setBroadcasts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat broadcast.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const payload: BroadcastPayload = {
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        detail: detail.trim(),
        gambar_url: gambarUrl.trim() || undefined,
        tipe,
      };

      if (tipe === "antrian") {
        payload.cabang_id = cabangId ? Number(cabangId) : undefined;
      }

      await createBroadcast(payload);
      setStatus("Broadcast berhasil dikirim.");
      setJudul("");
      setDeskripsi("");
      setDetail("");
      setGambarUrl("");
      setCabangId("");
      setTipe("promo");
      fetchBroadcasts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim broadcast.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">
              Broadcast Admin
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Kirim promo global atau notifikasi khusus cabang melalui broadcast
              in-app.
            </p>
          </div>
        </div>
      </section>

      {status ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          {status}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Judul
            </label>
            <input
              value={judul}
              onChange={(event) => setJudul(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Deskripsi singkat
            </label>
            <textarea
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              className="mt-2 h-24 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Detail lengkap
            </label>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              className="mt-2 h-32 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Tipe broadcast
              </label>
              <select
                value={tipe}
                onChange={(event) =>
                  setTipe(event.target.value as "promo" | "antrian")
                }
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="promo">Promo (global)</option>
                <option value="antrian">Antrian per cabang</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Cabang ID
              </label>
              <input
                value={cabangId}
                onChange={(event) => setCabangId(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="1"
                disabled={tipe !== "antrian"}
                required={tipe === "antrian"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              URL gambar (opsional)
            </label>
            <input
              value={gambarUrl}
              onChange={(event) => setGambarUrl(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="https://example.com/promo.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim Broadcast"}
          </button>
        </form>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
                Riwayat Broadcast
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Semua broadcast
              </h2>
            </div>
          </div>
          {broadcasts.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Belum ada broadcast yang dikirim.
            </p>
          ) : (
            <div className="space-y-4">
              {broadcasts.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-950">
                        {item.judul}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        {item.deskripsi}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase text-zinc-700">
                      {item.tipe}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
                    <span>Cabang: {item.cabang_id ?? "Global"}</span>
                    <span>
                      Dikirim:{" "}
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
