"use client";

import { useEffect, useState } from "react";
import {
  getCustomerContacts,
  getLocalContacts,
  addLocalContact,
  deleteLocalContact,
} from "@/lib/adminApi";
import { getAdminUser } from "@/lib/auth";
import type { CrmContact } from "@/lib/types";

export default function CrmContactsPage() {
  const [dbContacts, setDbContacts] = useState<CrmContact[]>([]);
  const [localContacts, setLocalContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newNama, setNewNama] = useState("");
  const [newNoWa, setNewNoWa] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = getAdminUser();
        if (!user) {
          setError("Sesi admin tidak ditemukan. Silakan login kembali.");
          return;
        }

        const [dbData, localData] = await Promise.all([
          getCustomerContacts(),
          getLocalContacts(),
        ]);

        setDbContacts(dbData);
        setLocalContacts(localData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat kontak dari database.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const handleAddLocalContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newNoWa.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await addLocalContact({ nama: newNama.trim(), no_wa: newNoWa.trim() });
      
      const localData = await getLocalContacts();
      setLocalContacts(localData);
      
      setNewNama("");
      setNewNoWa("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah kontak manual");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocalContact = async (id: number) => {
    if (!confirm("Hapus kontak manual ini?")) return;
    try {
      await deleteLocalContact(id);
      const localData = await getLocalContacts();
      setLocalContacts(localData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kontak manual");
    }
  };

  const allContacts = [...dbContacts, ...localContacts];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-[32px] border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">
              Kelola Kontak WA
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Daftar kontak pelanggan dari database dan tambahan manual (JSON).
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Total kontak</p>
            <p className="text-3xl font-semibold text-emerald-700">
              {allContacts.length}
            </p>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Tambah Manual Form */}
        <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            Tambah Kontak Manual
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Tambahkan nomor pelanggan secara manual ke file lokal (JSON).
          </p>
          <form onSubmit={handleAddLocalContact} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Nama Pelanggan
              </label>
              <input
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Budi Santoso"
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Nomor WA
              </label>
              <input
                value={newNoWa}
                onChange={(e) => setNewNoWa(e.target.value)}
                placeholder="081234567890"
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Kontak"}
            </button>
          </form>
        </section>

        {/* Contacts List */}
        <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3">
              <svg
                className="h-6 w-6 text-emerald-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">
                Semua Kontak
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Daftar gabungan kontak dari database dan tambahan manual.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-zinc-500">Memuat kontak...</div>
            </div>
          ) : allContacts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center">
              <p className="text-sm text-zinc-500">
                Belum ada data pelanggan tersedia.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {allContacts.map((contact) => {
                const isLocal = localContacts.some((c) => c.id === contact.id);
                return (
                  <div
                    key={`contact-${contact.id}`}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isLocal ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {contact.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-950">
                          {contact.nama}
                        </p>
                        <p className="text-sm text-zinc-600">{contact.no_wa}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${isLocal ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {isLocal ? 'Manual' : 'Database'}
                      </span>
                      {isLocal && (
                        <button
                          onClick={() => handleDeleteLocalContact(contact.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
