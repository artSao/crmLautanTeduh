import type {
  AdminLoginResponse,
  AntrianDetail,
  Broadcast,
  BroadcastPayload,
  CrmContact,
  CrmContactPayload,
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

const LOCAL_CRM_CONTACTS_API = "/api/crm/contacts";

export async function getCrmContacts(): Promise<CrmContact[]> {
  return fetchJson<{ success: boolean; data: CrmContact[] }>(
    LOCAL_CRM_CONTACTS_API,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then((payload) => payload.data);
}

export async function createCrmContact(
  payload: CrmContactPayload,
): Promise<CrmContact> {
  return fetchJson<{ success: boolean; data: CrmContact }>(
    LOCAL_CRM_CONTACTS_API,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  ).then((payload) => payload.data);
}

export async function deleteCrmContact(id: number): Promise<void> {
  await fetchJson<{ success: boolean; message: string }>(
    `${LOCAL_CRM_CONTACTS_API}/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
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
 * Ambil daftar kontak pelanggan dari data antrian di backend.
 * Kontak di-deduplikasi berdasarkan nomor WA/HP,
 * dan hanya menyimpan data terbaru per nomor.
 */
export async function getAntrianContacts(
  cabangId: number,
): Promise<CrmContact[]> {
  const antrians = await getAdminCabangQueue(cabangId);

  const contactMap = new Map<string, CrmContact>();
  for (const a of antrians) {
    const noWa = a.no_wa_reminder || a.no_hp;
    if (!noWa) continue;

    const existing = contactMap.get(noWa);
    if (
      !existing ||
      new Date(a.created_at) > new Date(existing.created_at)
    ) {
      contactMap.set(noWa, {
        id: a.id,
        nama: a.nama_pemilik,
        no_wa: noWa,
        created_at: a.created_at,
      });
    }
  }

  return Array.from(contactMap.values());
}
