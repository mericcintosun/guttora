// Input schemas for the API routes. Imports only zod so tests can load this file
// with `node --experimental-strip-types` without the "@/" alias.

import { z } from "zod";

export const benchReportQuerySchema = z.object({
  // Twin of BENCH_CLIP_ID_PATTERN in lib/config.ts; keep the two in step.
  clip: z
    .string()
    .regex(/^[a-z0-9-]{1,40}$/)
    .optional(),
});

export type BenchReportQuery = z.infer<typeof benchReportQuerySchema>;
