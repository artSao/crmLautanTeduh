import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CrmContact } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "crm_contacts.json");

// Helper to ensure directory and file exists
function ensureFileExists() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
}

export async function GET() {
  try {
    ensureFileExists();
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const contacts: CrmContact[] = JSON.parse(fileData);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error reading contacts:", error);
    return NextResponse.json(
      { error: "Gagal membaca kontak manual" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    ensureFileExists();
    const { nama, no_wa } = await request.json();

    if (!nama || !no_wa) {
      return NextResponse.json(
        { error: "Nama dan Nomor WA wajib diisi" },
        { status: 400 }
      );
    }

    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const contacts: CrmContact[] = JSON.parse(fileData);

    // Check duplicate
    if (contacts.some((c) => c.no_wa === no_wa)) {
      return NextResponse.json(
        { error: "Nomor WA sudah tersimpan" },
        { status: 400 }
      );
    }

    const newContact: CrmContact = {
      id: Date.now(),
      nama,
      no_wa,
      created_at: new Date().toISOString(),
    };

    contacts.push(newContact);
    fs.writeFileSync(dataFilePath, JSON.stringify(contacts, null, 2));

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error) {
    console.error("Error writing contact:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan kontak manual" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID kontak tidak valid" },
        { status: 400 }
      );
    }

    ensureFileExists();
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    let contacts: CrmContact[] = JSON.parse(fileData);

    contacts = contacts.filter((c) => c.id !== Number(id));
    fs.writeFileSync(dataFilePath, JSON.stringify(contacts, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kontak manual" },
      { status: 500 }
    );
  }
}
