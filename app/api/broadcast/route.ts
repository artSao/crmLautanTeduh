import { NextRequest, NextResponse } from "next/server";
import type { Broadcast, BroadcastPayload } from "@/lib/types";
import { readBroadcasts, writeBroadcasts } from "./data";

function checkAuth(): boolean {
  // For demo purpose, auth is skipped here.
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const broadcasts = await readBroadcasts();
    const cabangIdParam = request.nextUrl.searchParams.get("cabang_id");

    if (cabangIdParam) {
      const cabangId = Number(cabangIdParam);
      const filtered = broadcasts.filter(
        (broadcast) =>
          broadcast.tipe === "promo" || broadcast.cabang_id === cabangId,
      );
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: broadcasts });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch broadcasts" },
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
    const body = (await request.json()) as BroadcastPayload;

    if (
      !body.judul ||
      !body.deskripsi ||
      !body.detail ||
      !body.tipe ||
      (body.tipe === "antrian" && !body.cabang_id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Field wajib tidak lengkap. Pastikan judul, deskripsi, detail, tipe, dan cabang_id (jika tipe antrian) diisi.",
        },
        { status: 400 },
      );
    }

    const broadcasts = await readBroadcasts();
    const newBroadcast: Broadcast = {
      id: Date.now(),
      admin_id: 1,
      judul: body.judul.trim(),
      deskripsi: body.deskripsi.trim(),
      detail: body.detail.trim(),
      gambar_url: body.gambar_url?.trim() || null,
      tipe: body.tipe,
      cabang_id: body.tipe === "antrian" ? (body.cabang_id ?? null) : null,
      created_at: new Date().toISOString(),
    };

    broadcasts.unshift(newBroadcast);
    await writeBroadcasts(broadcasts);

    return NextResponse.json(
      {
        success: true,
        message: "Broadcast berhasil dikirim",
        data: newBroadcast,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create broadcast" },
      { status: 500 },
    );
  }
}
