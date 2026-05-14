"use client";

import { useEffect, useState } from "react";
import {
  createCrmContact,
  deleteCrmContact,
  getCrmContacts,
  getAntrianContacts,
} from "@/lib/adminApi";
import { getAdminUser } from "@/lib/auth";
import type { CrmContact, CrmContactPayload } from "@/lib/types";

type TabType = "backend" | "manual";

export default function CrmContactsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("backend");

  // Backend contacts (from antrian data)
  const [backendContacts, setBackendContacts] = useState<CrmContact[]>([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Local contacts (from JSON)
  const [localContacts, setLocalContacts] = useState<CrmContact[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CrmContactPayload>({
    nama: "",
    no_wa: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load backend contacts from antrian data
  useEffect(() => {
    const loadBackendContacts = async () => {
      try {
        setBackendLoading(true);
        setBackendError(null);
        const user = getAdminUser();
        if (!user?.cabang_id) {
          setBackendError(
            "Cabang ID tidak ditemukan. Pastikan akun admin terikat ke cabang.",
          );
          return;
        }
        const data = await getAntrianContacts(user.cabang_id);
        setBackendContacts(data);
      } catch (err) {
        setBackendError(
          err instanceof Error
            ? err.message
            : "Gagal memuat kontak dari backend.",
        );
      } finally {
        setBackendLoading(false);
      }
    };
    loadBackendContacts();
  }, []);

  // Load local contacts
  useEffect(() => {
    const loadLocalContacts = async () => {
      try {
        setLocalLoading(true);
        const data = await getCrmContacts();
        setLocalContacts(data);
      } catch (err) {
        console.error("Gagal memuat kontak lokal:", err);
      } finally {
        setLocalLoading(false);
      }
    };
    loadLocalContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.no_wa.trim()) {
      setError("Nama dan nomor WA harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const newContact = await createCrmContact({
        nama: formData.nama.trim(),
        no_wa: formData.no_wa.trim(),
      });

      setLocalContacts((prev) => [...prev, newContact]);
      setFormData({ nama: "", no_wa: "" });
    } catch (err) {
      setError("Gagal menambah kontak");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) {
      return;
    }

    try {
      await deleteCrmContact(id);
      setLocalContacts((prev) =>
        prev.filter((contact) => contact.id !== id),
      );
    } catch (err) {
      setError("Gagal menghapus kontak");
      console.error(err);
    }
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    {
      key: "backend",
      label: "Dari Data Antrian",
      count: backendContacts.length,
    },
    { key: "manual", label: "Kontak Manual", count: localContacts.length },
  ];

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
              Lihat kontak pelanggan dari data antrian (backend) atau tambah
              kontak manual untuk pengiriman CRM WhatsApp.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Total kontak</p>
            <p className="text-3xl font-semibold text-emerald-700">
              {backendContacts.length + localContacts.length}
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

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-emerald-950 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Backend Contacts Tab */}
      {activeTab === "backend" && (
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
                Kontak dari Data Antrian (Backend)
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Kontak pelanggan diambil otomatis dari data antrian di database
                backend. Setiap kali pelanggan mengambil antrian, nomor mereka
                otomatis tersedia di sini.
              </p>
            </div>
          </div>

          {backendLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-zinc-500">
                Memuat kontak dari backend...
              </div>
            </div>
          ) : backendError ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              {backendError}
            </div>
          ) : backendContacts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center">
              <p className="text-sm text-zinc-500">
                Belum ada data antrian di cabang ini. Kontak akan muncul
                otomatis saat pelanggan mengambil antrian.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backendContacts.map((contact) => (
                <div
                  key={`backend-${contact.no_wa}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
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
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      Backend
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(contact.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Manual Contacts Tab */}
      {activeTab === "manual" && (
        <div className="space-y-8">
          {/* Form Tambah Kontak */}
          <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">
              Tambah Kontak Manual
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Tambah kontak WA secara manual untuk pelanggan yang belum ada di
              data antrian.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nama"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Nama
                  </label>
                  <input
                    type="text"
                    id="nama"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Nama pelanggan"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="no_wa"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    id="no_wa"
                    value={formData.no_wa}
                    onChange={(e) =>
                      setFormData({ ...formData, no_wa: e.target.value })
                    }
                    className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="081234567890"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Tambah Kontak"}
              </button>
            </form>
          </section>

          {/* Daftar Kontak Manual */}
          <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-950">
              Daftar Kontak Manual ({localContacts.length})
            </h2>

            {localLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-zinc-500">
                  Memuat kontak lokal...
                </div>
              </div>
            ) : localContacts.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center">
                <p className="text-sm text-zinc-500">
                  Belum ada kontak manual yang ditambahkan.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {localContacts.map((contact) => (
                  <div
                    key={`local-${contact.id}`}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-sky-200 hover:bg-sky-50/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
                        {contact.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-950">
                          {contact.nama}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {contact.no_wa}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                        Manual
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(contact.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
                        className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
