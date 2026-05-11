import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { CrmContact, CrmContactPayload } from "@/lib/types";

const CONTACTS_FILE = path.join(process.cwd(), "data", "contacts.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read contacts from file
async function readContacts(): Promise<CrmContact[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CONTACTS_FILE, "utf-8");
    return JSON.parse(data) as CrmContact[];
  } catch {
    return [];
  }
}

// Write contacts to file
async function writeContacts(contacts: CrmContact[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

// Simple auth check (skip for demo)
function checkAuth(): boolean {
  // For demo purposes, skip auth
  return true;
  // In production, verify Bearer token
  // const authHeader = request.headers.get("authorization");
  // if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  // const token = authHeader.substring(7);
  // return verifyToken(token); // Implement token verification
}

export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const contacts = await readContacts();
    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body: CrmContactPayload = await request.json();

    if (!body.nama || !body.no_wa) {
      return NextResponse.json(
        { success: false, message: "Nama and no_wa are required" },
        { status: 400 },
      );
    }

    const contacts = await readContacts();
    const newContact: CrmContact = {
      id: Date.now(),
      nama: body.nama.trim(),
      no_wa: body.no_wa.trim(),
      created_at: new Date().toISOString(),
    };

    contacts.push(newContact);
    await writeContacts(contacts);

    return NextResponse.json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create contact" },
      { status: 500 },
    );
  }
}
