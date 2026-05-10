import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const antrianId = Number(body.antrian_id);
    const pesan = typeof body.pesan === "string" ? body.pesan.trim() : "";

    if (!antrianId || Number.isNaN(antrianId)) {
      return NextResponse.json(
        {
          success: false,
          message: "antrian_id wajib diisi dan harus berupa angka",
        },
        { status: 400 },
      );
    }

    const finalMessage =
      pesan ||
      `📢 Pengingat dari Bengkel\n\nHalo pelanggan!\n\nKami mengingatkan Anda memiliki antrian servis motor dengan ID ${antrianId}.\nMohon hadir tepat waktu. Terima kasih! 🙏`;

    // TODO: Integrate with actual WA provider (Fonnte) and lookup antrian data.
    console.log(
      `CRM WA reminder request: antrian ${antrianId} - ${finalMessage}`,
    );

    return NextResponse.json({
      success: true,
      message: `Pengingat WA berhasil dikirim untuk antrian ${antrianId}`,
    });
  } catch (error) {
    console.error("Error sending CRM WA reminder:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pengingat WA" },
      { status: 500 },
    );
  }
}
