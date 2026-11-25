import { NextResponse } from "next/server";
import { adapterMode, getAdapter } from "@/lib/adapter";
import { CoreFailure, coreError } from "@/lib/errors";
import { benchReportQuerySchema } from "@/lib/schemas";
import type { ApiResponse, BenchReport } from "@/lib/types";

// GET /api/bench-report and GET /api/bench-report?clip=<id>
// In real mode the rows are counted on the server by the drip detector; in fake mode
// every measured field is null.

export async function GET(req: Request) {
  const parsed = benchReportQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  const source = adapterMode();
  if (!parsed.success) {
    const body = { ok: false as const, source, ...coreError("invalid_input") };
    return NextResponse.json(body satisfies ApiResponse<BenchReport>, { status: 400 });
  }

  let report: BenchReport;
  try {
    report = await getAdapter().getBenchReport();
  } catch (err) {
    const code = err instanceof CoreFailure ? err.code : "compute_failed";
    const body = { ok: false as const, source, ...coreError(code) };
    return NextResponse.json(body satisfies ApiResponse<BenchReport>, { status: 500 });
  }

  const clip = parsed.data.clip;
  if (clip !== undefined) {
    const rows = report.rows.filter((r) => r.id === clip);
    if (rows.length === 0) {
      const body = { ok: false as const, source, ...coreError("invalid_input") };
      return NextResponse.json(body satisfies ApiResponse<BenchReport>, { status: 400 });
    }
    report = { ...report, rows };
  }

  const body = { ok: true as const, source, data: report };
  return NextResponse.json(body satisfies ApiResponse<BenchReport>, { status: 200 });
}
