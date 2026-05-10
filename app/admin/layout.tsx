"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAdminAuth, getAdminToken, getAdminUser } from "@/lib/auth";
import type { AdminUser } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/broadcast", label: "Broadcast" },
  { href: "/admin/crm", label: "CRM WA" },
  { href: "/admin/crm/contacts", label: "Kontak WA" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const user = getAdminUser();
    setAdmin(user);
    setReady(true);
  }, [router]);

  const openLogoutModal = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    clearAdminAuth();
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
        <div className="mx-auto max-w-xl rounded-[32px] border border-zinc-200 bg-white p-10 shadow-lg text-center">
          <p className="text-sm text-zinc-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Admin CRM Lautan Teduh
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {admin
                ? `Halo, ${admin.name} — Cabang ${admin.cabang_id ?? "tidak tersedia"}`
                : "Admin tidak ditemukan"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${pathname === item.href ? "bg-emerald-950 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openLogoutModal}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {showLogoutModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-950">
              Apakah Anda yakin ingin logout?
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Logout akan mengakhiri sesi admin Anda. Pilih “Logout” untuk
              melanjutkan atau “Cancel” untuk tetap di halaman ini.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={confirmLogout}
                className="w-full rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 sm:w-auto"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={cancelLogout}
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
