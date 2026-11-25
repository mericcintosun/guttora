import { NextResponse } from "next/server";
import { adapterMode, getAdapter } from "@/lib/adapter";
import type { ApiResponse, BenchClip } from "@/lib/types";

export async function GET() {
  const body = { ok: true as const, source: adapterMode(), data: await getAdapter().getBenchClips() };
  return NextResponse.json(body satisfies ApiResponse<BenchClip[]>, { status: 200 });
}
