import type { AdminUser } from "@/lib/types";

const STORAGE_TOKEN = "ltcrm_admin_token";
const STORAGE_USER = "ltcrm_admin_user";

export function saveAdminAuth(token: string, user: AdminUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_TOKEN, token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_TOKEN);
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Token admin tidak ditemukan. Silakan login ulang.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
