# Guttora

Hold your phone next to a dripping tap. Guttora counts the drops by sound, measures the drop size with a teaspoon, and tells you how many litres of water, and for a hot tap how many kWh and kg of CO2e, that tap wastes in a year.

> Live demo: https://guttora.vercel.app
>
> Source: https://github.com/mericcintosun/guttora

## The problem

Dripping taps stay broken for months because a single drop looks like nothing. Nobody knows what one costs, so nobody fixes it.

The numbers are not small. At the USGS drop size of 0.25 mL, a tap that drips once a second loses about 7,900 litres a year. In a student residence with a dozen tired taps, that is tens of thousands of litres of clean, often heated, water going down the drain every year.

The person who notices is usually a student or a tenant. When they file a repair request it says "tap dripping" and nothing else, so it waits behind everything with a number attached. The leak calculators that exist ask you to type the drip rate or tap along on the screen, then assume every drop is 0.25 mL. Real drops vary by a third or more.

## Who it is for

- Students in shared residences and the floor representatives who collect repair requests.
- Tenants who need a number before a landlord will act.
- Residence and campus facilities staff deciding which tap to fix first.

## The solution

Guttora is a single browser tab. No install, no account, no hardware, and the audio never leaves the device.

1. **Drip counter.** The microphone signal is high-passed at 1 kHz and cut into 1024-sample FFT windows. Positive spectral flux between windows gives an onset curve. A drop counts when the flux clears an adaptive threshold (rolling median times 1.5 plus 4 times the median absolute deviation) and at least 120 ms have passed since the last drop. If the gaps between drops vary by less than 35% (coefficient of variation), it is a regular drip and the rate is shown. If not, the screen says the room is too noisy. If the drops stop, it says "no regular drip, 0 L".
2. **Spoon calibration.** Hold a 5 mL teaspoon under the tap while the counter runs and press a button when it is full. Spoon volume divided by drops counted is this tap's real drop size. Without a spoon, Guttora falls back to the USGS assumption of 15,140 drops per gallon.
3. **Impact converter.** Litres a year = drops per minute × 525,600 × mL per drop / 1000. For a hot tap, kWh = litres × 4.186 × temperature rise / 3600 / heater efficiency, and kg CO2e uses a national grid factor (electric) or the natural gas factor (gas boiler).
4. **Repair list.** Every measured tap goes into a list ranked by yearly loss, with a total for the building and a "copy repair request" button that writes a ticket with every number attached. Fixed taps show how much water they no longer waste.
5. **Recording mode and accuracy bench.** Upload a recording instead of using the microphone. The notes page generates six synthetic recordings with a known drop count (hiss, fan hum, a voice) and shows the detector's counts, either counted on the server when the page was built or in your browser on request, so anyone can check the logic.

## Expected environmental benefit

A measured tap is a tap that gets fixed sooner. Our sample residence of ten taps (in the app) loses about 64,000 litres a year across its nine open taps, plus the electricity and gas to heat the hot ones. The repair list turns that into an ordered ticket, so the worst leak gets fixed first. Every fixed tap is shown with the litres it no longer wastes.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
- Web Audio API: getUserMedia, BiquadFilterNode, ScriptProcessorNode, decodeAudioData
- Our own radix-2 FFT and spectral flux onset detector (`lib/drip-detector.ts`), no ML model and no download
- GSAP with ScrollTrigger for the story on the home page
- localStorage for the repair list
- zod 4 (API input validation)
- Node's built-in test runner for the detector tests
- Deployed on Vercel

Audio stays in the browser; the server only counts the synthetic bench clips.

## Prize track

Guttora enters one track, the main placement prize, which needs no sponsor API and no API key.

| Bounty | Prize | Slots | Required tech | Code file | DEMO step |
| --- | --- | --- | --- | --- | --- |
| Green Shift Grand Prize | $ 125 in cash | 1 | none | `components/impact-figure.tsx`, `lib/impact.ts` | 3 |

Judging criterion, quoted: "Environmental Impact: How clearly the project reduces waste, emissions, resource use, or environmental harm."

## Quickstart

```bash
npm install
npm run dev
npm test        # detector cases on five seed bench clips, plus input validation
npm run proof   # counts the six synthetic clips and writes the results into this README
```

Open http://localhost:3000. The microphone needs HTTPS or localhost. On a phone, use the deployed URL. `npm test` and `npm run proof` need Node 22.6 or newer.

No secrets are needed (see `.env.example`). `ADAPTER_MODE=real` makes the server count the bench clips for the notes page; the default, `fake`, leaves that to your browser.

## Demo reset

1. Run `npm run demo:reset`. It rewrites the seed snapshot and prints the seed version and the reset URL.
2. Open `/play?reset=1` on the demo phone. The repair list goes back to the 10 sample taps at Ayazağa Student Residence.
3. The repair list is stored in this phone's localStorage (`lib/store.ts`), not on a server. No migration: no database, versioned localStorage shape.

## Limitations

- Echo, extractor fans and running water elsewhere can produce false counts. The regularity check catches most of them, but two taps dripping in the same room look like one noisy source.
- Without the spoon, results rely on the 0.25 mL default, which can be off by a third.
- Hot water energy uses a temperature rise you set and a fixed heater efficiency. Grid factors are approximate national yearly averages.
- Pumping and treating the water also cost energy; we do not count it yet, so our CO2e is an underestimate.
- All audio used for testing is synthetic or recorded by us. Field counts from our own taps go here as we record them.

## Detector proof

The tables below are written by `npm run proof`, not by hand. The bench clips are synthetic: `lib/synth.ts` builds each one with a known number of drops, and the same detector the phone uses counts them. They test the logic, not a real bathroom.

### Synthetic bench, counted by the detector

<!-- PROOF:BEGIN detector-bench -->
The six clips below are synthetic: generated by `lib/synth.ts` with a known drop count, not recorded at a real tap. A clip passes when the count is within 1 drop of the truth and the verdict is right.

| Clip | Conditions | True drops | Counted | Verdict | ms |
| --- | --- | ---: | ---: | --- | ---: |
| Quiet bathroom | 52 drops a minute, light hiss | 26 | 26 | pass, regular drip | 284 |
| Slow basin | 12 drops a minute, light hiss | 6 | 6 | pass, regular drip | 258 |
| Fast shower | 110 drops a minute | 54 | 54 | pass, regular drip | 270 |
| Extractor fan on | 60 drops a minute under a 100 Hz hum | 30 | 30 | pass, regular drip | 328 |
| Someone talking | 45 drops a minute under a voice | 22 | 22 | pass, regular drip | 384 |
| Tap closed | fan and voice, no drops | 0 | 0 | pass, no regular drip | 416 |

6 of 6 synthetic clips passed, with a total error of 0 drops across 138 true drops, measured on Node v22.23.3 on 2026-11-25.
<!-- PROOF:END detector-bench -->

### Unit tests (`tests/detector.test.ts`)

<!-- PROOF:BEGIN unit-tests -->
9 passed, 0 failed. `npm test` ran `tests/detector.test.ts` on Node v22.23.3 on 2026-11-25.
<!-- PROOF:END unit-tests -->

## What we would build next

- Move capture to an AudioWorklet and test on more phones, including older iPhones.
- Record twenty real taps, hand-count them, and publish the table here.
- A shared repair list per residence so a whole block sees the same ranking.
- Water utility tariffs so the yearly loss also shows up in money.

## AI use

> We used AI coding assistants for scaffolding and boilerplate. Architecture, product decisions, and final code review are our own.

(Adjust this section to match the hackathon's disclosure rules.)

## Open source used

Next.js, React, Tailwind CSS, GSAP, class-variance-authority, clsx, tailwind-merge, Radix Slot, zod. Constants from USGS, UK DESNZ and Ember, cited on the notes page.
