"use client";

import { useEffect, useState } from "react";
import {
  sendCrmMessage,
  sendCrmReminder,
  getCrmContacts,
} from "@/lib/adminApi";
import type { CrmContact } from "@/lib/types";

export default function AdminCrmPage() {
  const [waNumber, setWaNumber] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [antrianId, setAntrianId] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bulk send states
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await getCrmContacts();
      setContacts(data);
    } catch (err) {
      console.error("Gagal memuat kontak:", err);
      setError("Gagal memuat kontak dari database.");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleBulkSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedContacts.length === 0) {
      setError("Pilih minimal satu kontak untuk mengirim pesan.");
      return;
    }
    if (!bulkMessage.trim()) {
      setError("Pesan tidak boleh kosong.");
      return;
    }

    setError(null);
    setStatus(null);
    setBulkLoading(true);

    try {
      const selectedNumbers = contacts
        .filter((contact) => selectedContacts.includes(contact.id))
        .map((contact) => contact.no_wa);

      for (const number of selectedNumbers) {
        await sendCrmMessage({
          no_wa: number,
          pesan: bulkMessage.trim(),
        });
      }

      setStatus(`Pesan berhasil dikirim ke ${selectedContacts.length} kontak`);
      setSelectedContacts([]);
      setBulkMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim pesan bulk.",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleContactSelection = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  const selectAllContacts = () => {
    setSelectedContacts(contacts.map((contact) => contact.id));
  };

  const clearSelection = () => {
    setSelectedContacts([]);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const message = await sendCrmMessage({
        no_wa: waNumber.trim(),
        pesan: waMessage.trim(),
      });
      setStatus(message);
      setWaNumber("");
      setWaMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan WA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const payload = {
        antrian_id: Number(antrianId),
        pesan: reminderMessage.trim() || undefined,
      };
      const message = await sendCrmReminder(payload);
      setStatus(message);
      setAntrianId("");
      setReminderMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim pengingat WA.",
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
              CRM WhatsApp
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Kirim pesan WA manual atau pengingat otomatis berdasarkan data
              antrian.
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

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            Kirim WA Manual
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Kirim notifikasi atau promo WA secara langsung ke nomor pelanggan.
          </p>
          <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Nomor WA
              </label>
              <input
                value={waNumber}
                onChange={(event) => setWaNumber(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="081234567890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Pesan
              </label>
              <textarea
                value={waMessage}
                onChange={(event) => setWaMessage(event.target.value)}
                className="mt-2 h-32 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Isi pesan WA..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim Pesan WA"}
            </button>
          </form>
        </section>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            Kirim WA ke Banyak Kontak
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Kirim pesan WA ke beberapa kontak sekaligus dari daftar kontak
            tersimpan.
          </p>

          {/* Warning Banner */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
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
                <div className="text-sm text-yellow-700">
                  <p>
                    Kontak WA diambil dari database backend. Pastikan kontak
                    sudah ditambahkan di halaman{" "}
                    <a
                      href="/admin/crm/contacts"
                      className="underline hover:no-underline font-medium"
                    >
                      Kelola Kontak WA
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Belum ada kontak tersimpan.{" "}
                <a
                  href="/admin/crm/contacts"
                  className="underline hover:no-underline"
                >
                  Kelola kontak WA
                </a>{" "}
                untuk menambah kontak baru.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBulkSend} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    Pilih Kontak ({selectedContacts.length} dipilih)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={selectAllContacts}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      Hapus Pilihan
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center space-x-3 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm">
                        {contact.nama} ({contact.no_wa})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Pesan
                </label>
                <textarea
                  value={bulkMessage}
                  onChange={(event) => setBulkMessage(event.target.value)}
                  className="mt-2 h-32 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Isi pesan WA untuk dikirim ke semua kontak terpilih..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={bulkLoading || selectedContacts.length === 0}
                className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {bulkLoading
                  ? "Mengirim..."
                  : `Kirim ke ${selectedContacts.length} Kontak`}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-950">
            Kirim Pengingat Antrian
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Gunakan antrian ID untuk mengirim pesan pengingat WA melalui
            backend.
          </p>
          <form onSubmit={handleSendReminder} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                ID Antrian
              </label>
              <input
                value={antrianId}
                onChange={(event) => setAntrianId(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Pesan (opsional)
              </label>
              <textarea
                value={reminderMessage}
                onChange={(event) => setReminderMessage(event.target.value)}
                className="mt-2 h-32 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Isi jika ingin menggunakan pesan khusus."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-sky-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim Pengingat WA"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
