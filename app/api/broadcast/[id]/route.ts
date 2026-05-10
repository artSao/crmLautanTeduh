import { NextRequest, NextResponse } from "next/server";
import { readBroadcasts } from "../data";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const broadcasts = await readBroadcasts();
    const broadcastId = Number(params.id);
    const broadcast = broadcasts.find((item) => item.id === broadcastId);

    if (!broadcast) {
      return NextResponse.json(
        { success: false, message: "Broadcast tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: broadcast });
  } catch (error) {
    console.error("Error fetching broadcast detail:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch broadcast detail" },
      { status: 500 },
    );
  }
}
