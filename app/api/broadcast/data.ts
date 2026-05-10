import { promises as fs } from "fs";
import path from "path";
import type { Broadcast } from "@/lib/types";

const BROADCASTS_FILE = path.join(process.cwd(), "data", "broadcasts.json");

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function readBroadcasts(): Promise<Broadcast[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(BROADCASTS_FILE, "utf-8");
    return JSON.parse(data) as Broadcast[];
  } catch {
    return [];
  }
}

export async function writeBroadcasts(broadcasts: Broadcast[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(BROADCASTS_FILE, JSON.stringify(broadcasts, null, 2));
}
