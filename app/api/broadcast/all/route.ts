import { NextResponse } from "next/server";
import { readBroadcasts } from "../data";

export async function GET() {
  try {
    const broadcasts = await readBroadcasts();
    return NextResponse.json({ success: true, data: broadcasts });
  } catch (error) {
    console.error("Error fetching all broadcasts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch all broadcasts" },
      { status: 500 },
    );
  }
}
