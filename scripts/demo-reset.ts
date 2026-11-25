// Prints what a demo reset means for Guttora. Run with: npm run demo:reset
// (npm run seed first rewrites fixtures/seed-snapshot.json, then this file runs).
//
// The server holds no state: the repair list lives in each phone's localStorage
// (lib/store.ts), so the reset that matters is opening /play?reset=1 on the phone.
// There is no database and no chain, so there is nothing to migrate or redeploy.

import { SEED_VERSION, residenceName, taps } from "../lib/data/seed.ts";

const lines = [
  "demo:reset: the server holds no state, so there is nothing to clear on it.",
  `demo:reset: seed version ${SEED_VERSION}, ${taps.length} taps at ${residenceName}.`,
  "demo:reset: open one of these on the demo phone before each take:",
  "  https://guttora.vercel.app/play?reset=1",
  "  http://localhost:3000/play?reset=1",
];

for (const line of lines) console.log(line);
process.exitCode = 0;
