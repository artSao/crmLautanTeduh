import type {
  AdminLoginResponse,
  AntrianDetail,
  Broadcast,
  BroadcastPayload,
  CrmContact,
  CrmReminderPayload,
  CrmSendPayload,
} from "@/lib/types";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE_URL = "/api/proxy";

async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
    const errorMessage =
      (payload as { message?: string })?.message ?? `Fetch error ${res.status}`;
    throw new Error(errorMessage);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  return fetchJson<{ success: boolean; data: AdminLoginResponse }>(
    `${API_BASE_URL}/auth/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  ).then((payload) => payload.data);
}

export async function getAdminCabangQueue(
  cabangId: number,
  status?: string,
): Promise<AntrianDetail[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetchJson<{ success: boolean; data: AntrianDetail[] }>(
    `${API_BASE_URL}/cabang/${cabangId}/antrian/detail${query}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  ).then((payload) => payload.data);
}

export async function callNext(): Promise<AntrianDetail> {
  return fetchJson<{ success: boolean; data: AntrianDetail }>(
    `${API_BASE_URL}/antrian/call-next`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  ).then((payload) => payload.data);
}

export async function completeQueue(antrianId: number): Promise<void> {
  await fetchJson<{ success: boolean; message: string }>(
    `${API_BASE_URL}/antrian/${antrianId}/selesai`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  );
}

export async function deleteQueue(antrianId: number): Promise<void> {
  await fetchJson<{ success: boolean; message: string }>(
    `${API_BASE_URL}/antrian/${antrianId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  );
}

export async function sendCrmMessage(payload: CrmSendPayload): Promise<string> {
  return fetchJson<{ success: boolean; message: string }>(
    `${API_BASE_URL}/crm/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
  ).then((data) => data.message);
}

export async function sendCrmReminder(
  payload: CrmReminderPayload,
): Promise<string> {
  return fetchJson<{ success: boolean; message: string }>(
    `${API_BASE_URL}/crm/reminders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
  ).then((data) => data.message);
}

export async function createBroadcast(
  payload: BroadcastPayload,
): Promise<Broadcast> {
  return fetchJson<{ success: boolean; data: Broadcast }>(
    `${API_BASE_URL}/broadcast`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
  ).then((payload) => payload.data);
}

export async function getBroadcastList(): Promise<Broadcast[]> {
  return fetchJson<{ success: boolean; data: Broadcast[] }>(
    `${API_BASE_URL}/broadcast/all`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  ).then((payload) => payload.data);
}

/**
 * Ambil kontak WhatsApp user yang sedang login
 */
export async function getUserKontak(): Promise<{ user_id: number; no_wa: string } | null> {
  try {
    const payload = await fetchJson<{ success: boolean; data: { user_id: number; no_wa: string } }>(
      `${API_BASE_URL}/users/kontak`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      },
    );
    return payload.data;
  } catch (err: any) {
    // If empty or not found
    return null;
  }
}

/**
 * Ambil daftar kontak pelanggan (user) yang sudah mendaftarkan nomor WA-nya.
 * Mengambil dari data user yang ada di database.
 */
export async function getCustomerContacts(): Promise<CrmContact[]> {
  const payload = await fetchJson<{ success: boolean; data: any[] }>(
    `${API_BASE_URL}/admin/users/kontak`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    },
  );

  const contacts = payload.data || [];
  
  return contacts
    .filter((u: any) => u.no_wa && u.no_wa.trim() !== "")
    .map((u: any) => ({
      id: u.id || u.user_id,
      nama: u.name || u.nama || "Pelanggan",
      no_wa: u.no_wa,
      created_at: u.updated_at || u.created_at || new Date().toISOString(),
    }));
}

export async function saveUserKontak(no_wa: string): Promise<void> {
  await fetchJson<{ success: boolean }>(`${API_BASE_URL}/users/kontak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ no_wa }),
  });
}

export async function updateUserKontak(no_wa: string): Promise<void> {
  await fetchJson<{ success: boolean }>(`${API_BASE_URL}/users/kontak`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ no_wa }),
  });
}

export async function deleteUserKontak(): Promise<void> {
  await fetchJson<{ success: boolean }>(`${API_BASE_URL}/users/kontak`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
}

// ==========================================
// MANUAL JSON CONTACTS API
// ==========================================

export async function getLocalContacts(): Promise<CrmContact[]> {
  const res = await fetch("/api/crm/contacts");
  if (!res.ok) return [];
  const data = await res.json();
  return data.contacts || [];
}

export async function addLocalContact(payload: { nama: string; no_wa: string }): Promise<void> {
  const res = await fetch("/api/crm/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Gagal menambah kontak manual");
  }
}

export async function deleteLocalContact(id: number): Promise<void> {
  const res = await fetch(`/api/crm/contacts?id=${id}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    throw new Error("Gagal menghapus kontak manual");
  }
}
