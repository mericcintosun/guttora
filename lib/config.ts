// All configuration for Guttora in one place.
//
// This file depends on no other module on purpose: scripts/proof.ts loads it directly
// with `node --experimental-strip-types`, which cannot resolve the "@/" alias.
//
// The core path makes no outbound network call. The detector, the synthetic bench
// clips and the impact math all run locally (server or browser), so there is no
// fetch timeout to configure. The only env key read here is ADAPTER_MODE.

/** "real" runs the detector over the bench clips on the server; "fake" serves seed only. */
export const ADAPTER_MODE: "fake" | "real" = process.env.ADAPTER_MODE === "real" ? "real" : "fake";

/** Prefix for every server log line on the core path. */
export const CORE_LOG_PREFIX = "[core]";

/** A bench clip passes when the count is within this many drops of the truth. */
export const BENCH_TOLERANCE_DROPS = 1;

/** Allowed bench clip ids in API input. Twin copy lives in lib/schemas.ts. */
export const BENCH_CLIP_ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Upper bound for one child process step in scripts/proof.ts. */
export const PROOF_STEP_TIMEOUT_MS = 90_000;

/** How many times scripts/proof.ts retries a step, and only after a timeout. */
export const PROOF_STEP_RETRIES = 1;
