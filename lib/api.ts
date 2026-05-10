import type { Cabang } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/proxy";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Fetch error ${res.status}: ${message}`);
  }

  return res.json();
}

export async function getCabangs(): Promise<Cabang[]> {
  return fetchJson<{ success: boolean; data: Cabang[] }>(
    `${API_BASE_URL}/cabang`,
  ).then((payload) => payload.data);
}

export async function getCabangById(id: string | number): Promise<Cabang> {
  return fetchJson<{ success: boolean; data: Cabang }>(
    `${API_BASE_URL}/cabang/${id}`,
  ).then((payload) => payload.data);
}
