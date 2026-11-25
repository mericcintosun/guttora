// Input schemas for the API routes, the stored repair list and the /play query.
// Imports only zod so tests can load this file with `node --experimental-strip-types`
// without the "@/" alias.

import { z } from "zod";

export const benchReportQuerySchema = z.object({
  // Twin of BENCH_CLIP_ID_PATTERN in lib/config.ts; keep the two in step.
  clip: z
    .string()
    .regex(/^[a-z0-9-]{1,40}$/)
    .optional(),
});

export type BenchReportQuery = z.infer<typeof benchReportQuerySchema>;

/** Mirrors every field of Tap in lib/types.ts. Keep the two in step. */
export const storedTapSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  place: z.string(),
  dripsPerMinute: z.number().nonnegative(),
  spoonDrops: z.number().int().positive().nullable(),
  spoonMl: z.number().positive(),
  heater: z.enum(["none", "electric", "gas"]),
  deltaT: z.number().nonnegative(),
  cv: z.number().nonnegative(),
  status: z.enum(["dripping", "reported", "fixed"]),
  measuredAt: z.string(),
  measuredBy: z.string(),
});

/** The repair list as lib/store.ts writes it to localStorage. */
export const storedRepairListSchema = z.object({
  v: z.literal(1),
  seedVersion: z.number().int(),
  taps: z.array(storedTapSchema).max(200),
});

export type StoredRepairList = z.infer<typeof storedRepairListSchema>;

/** Query on /play. reset=1 clears the stored repair list; any other value is ignored. */
export const playQuerySchema = z.object({
  reset: z.enum(["1"]).optional(),
});

export type PlayQuery = z.infer<typeof playQuerySchema>;
