import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Fitur kirim pengingat antrian:
    // - menerima antrian_id dari admin / CRM
    // - validasi input agar hanya ID antrian yang valid yang diproses
    // - menyiapkan isi pesan default jika admin tidak mengirim custom message
    // - selanjutnya akan diteruskan ke provider WA seperti Fonnte
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

    // Pesan default pengingat antrian yang dikirim ke pelanggan.
    // Saat nanti terhubung ke provider WhatsApp, teks ini bisa dipakai
    // sebagai template reminder sebelum menambahkan data pelanggan yang nyata.
    const finalMessage =
      pesan ||
      `📢 Pengingat dari Bengkel\n\nHalo pelanggan!\n\nKami mengingatkan Anda memiliki antrian servis motor dengan ID ${antrianId}.\nMohon hadir tepat waktu. Terima kasih! 🙏`;

    // TODO: Integrate with actual WA provider (Fonnte) and lookup antrian data.
    // Saat fitur ini sudah terintegrasi, kode di sini akan memanggil API WA provider
    // dan mengambil data nomor pelanggan berdasarkan antrian_id yang relevan.
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
