import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { CrmContact } from "@/lib/types";

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
    return JSON.parse(data);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth()) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const contacts = await readContacts();
    const { id } = await params;
    const contactId = parseInt(id);
    const index = contacts.findIndex((contact) => contact.id === contactId);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 },
      );
    }

    contacts.splice(index, 1);
    await writeContacts(contacts);

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete contact" },
      { status: 500 },
    );
  }
}
