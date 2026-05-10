"use client";

import { useEffect, useState } from "react";
import {
  createCrmContact,
  deleteCrmContact,
  getCrmContacts,
} from "@/lib/adminApi";
import type { CrmContact, CrmContactPayload } from "@/lib/types";

export default function CrmContactsPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CrmContactPayload>({
    nama: "",
    no_wa: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getCrmContacts();
      setContacts(data);
    } catch (err) {
      setError("Gagal memuat kontak dari database");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchContacts() {
      await loadContacts();
    }

    fetchContacts();
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

      setContacts((prev) => [...prev, newContact]);
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
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      setError("Gagal menghapus kontak");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Kelola Kontak WA</h1>

        {/* Information Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-sky-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-sky-800">
                Kontak Disimpan di Database Backend
              </h3>
              <div className="mt-2 text-sm text-sky-700">
                <p>
                  Kontak WA sekarang disimpan melalui API ke backend dan
                  dipertahankan di file `data/contacts.json`.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form Tambah Kontak */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tambah Kontak Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama kontak"
                required
              />
            </div>
            <div>
              <label
                htmlFor="no_wa"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nomor WA (contoh: 6281234567890)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Tambah Kontak"}
            </button>
          </form>
        </div>

        {/* Daftar Kontak */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Daftar Kontak ({contacts.length})
          </h2>
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada kontak yang ditambahkan
            </p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                >
                  <div>
                    <h3 className="font-medium">{contact.nama}</h3>
                    <p className="text-gray-600">{contact.no_wa}</p>
                    <p className="text-sm text-gray-500">
                      Ditambahkan:{" "}
                      {new Date(contact.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
