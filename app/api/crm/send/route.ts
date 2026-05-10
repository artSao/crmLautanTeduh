import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const no_wa = typeof body.no_wa === "string" ? body.no_wa.trim() : "";
    const pesan = typeof body.pesan === "string" ? body.pesan.trim() : "";

    if (!no_wa || !pesan) {
      return NextResponse.json(
        {
          success: false,
          message: "no_wa dan pesan wajib diisi",
        },
        { status: 400 },
      );
    }

    // TODO: Integrate with actual WA provider (Fonnte) here.
    console.log(`CRM WA send request: ${no_wa} - ${pesan}`);

    return NextResponse.json({
      success: true,
      message: `Pesan berhasil dikirim ke ${no_wa}`,
    });
  } catch (error) {
    console.error("Error sending CRM WA message:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pesan WA" },
      { status: 500 },
    );
  }
}
