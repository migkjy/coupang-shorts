import { NextResponse } from "next/server";
import { sampleLogs } from "../../pipeline/logs/data";

export async function GET() {
  return NextResponse.json({ logs: sampleLogs });
}
