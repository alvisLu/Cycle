import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { PeriodEvent } from "@/lib/period";

const DATA_FILE = path.join(process.cwd(), "datas", "period.json");

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const periods: PeriodEvent[] = JSON.parse(data);
    return NextResponse.json(periods);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const periods: PeriodEvent[] = await request.json();
    await fs.writeFile(DATA_FILE, JSON.stringify(periods, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save data", detail: String(error) },
      { status: 500 }
    );
  }
}
