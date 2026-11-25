import { NextResponse } from "next/server";
import { adapterMode, getAdapter } from "@/lib/adapter";
import type { ApiResponse, GridFactor } from "@/lib/types";

export async function GET() {
  const body = { ok: true as const, source: adapterMode(), data: await getAdapter().getGridFactors() };
  return NextResponse.json(body satisfies ApiResponse<GridFactor[]>, { status: 200 });
}
