import { NextResponse } from "next/server";
import { adapterMode, getAdapter } from "@/lib/adapter";
import type { ApiResponse, ResidenceSnapshot } from "@/lib/types";

export async function GET() {
  const body = { ok: true as const, source: adapterMode(), data: await getAdapter().getResidence() };
  return NextResponse.json(body satisfies ApiResponse<ResidenceSnapshot>, { status: 200 });
}
