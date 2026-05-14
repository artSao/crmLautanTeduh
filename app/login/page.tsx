"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/adminApi";
import { getCabangById } from "@/lib/api";
import { saveAdminAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminLogin(username.trim(), password);

      // Fetch nama cabang jika admin terikat ke cabang
      if (data.user.cabang_id) {
        try {
          const cabang = await getCabangById(data.user.cabang_id);
          data.user.cabang_nama = cabang.nama;
        } catch {
          // Tetap lanjutkan login meskipun fetch cabang gagal
        }
      }

      saveAdminAuth(data.token, data.user);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950">
      <div className="mx-auto max-w-md rounded-[32px] border border-zinc-200 bg-white p-10 shadow-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          Login Admin CRM
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Masuk dengan username dan password admin cabang untuk mengelola
          antrian, broadcast, dan CRM WA.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700">
              Username
            </label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="admin_kedaton"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk sebagai Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
