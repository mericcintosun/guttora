# Guttora

Hold your phone next to a dripping tap. Guttora counts the drops by sound, measures the drop size with a teaspoon, and tells you how many litres of water, and for a hot tap how many kWh and kg of CO2e, that tap wastes in a year.

> Live demo: https://guttora.vercel.app

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
5. **Recording mode and accuracy bench.** Upload a recording instead of using the microphone. The notes page generates six synthetic recordings with a known drop count (hiss, fan hum, a voice) and runs the detector on them live, so anyone can check the logic.

## Expected environmental benefit

A measured tap is a tap that gets fixed sooner. Our sample residence of ten taps (in the app) loses about 64,000 litres a year across its nine open taps, plus the electricity and gas to heat the hot ones. The repair list turns that into an ordered ticket, so the worst leak gets fixed first. Every fixed tap is shown with the litres it no longer wastes.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
- Web Audio API: getUserMedia, BiquadFilterNode, ScriptProcessorNode, decodeAudioData
- Our own radix-2 FFT and spectral flux onset detector (`lib/drip-detector.ts`), no ML model and no download
- GSAP with ScrollTrigger for the story on the home page
- localStorage for the repair list
- Deployed on Vercel

No sponsor API and no API key is involved; everything runs in the browser.

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:3000. The microphone needs HTTPS or localhost. On a phone, use the deployed URL.

No environment variables are needed (see `.env.example`).

## Limitations

- Echo, extractor fans and running water elsewhere can produce false counts. The regularity check catches most of them, but two taps dripping in the same room look like one noisy source.
- Without the spoon, results rely on the 0.25 mL default, which can be off by a third.
- Hot water energy uses a temperature rise you set and a fixed heater efficiency. Grid factors are approximate national yearly averages.
- Pumping and treating the water also cost energy; we do not count it yet, so our CO2e is an underestimate.
- All audio used for testing is synthetic or recorded by us. Field counts from our own taps go here as we record them.

## What we would build next

- Move capture to an AudioWorklet and test on more phones, including older iPhones.
- Record twenty real taps, hand-count them, and publish the table here.
- A shared repair list per residence so a whole block sees the same ranking.
- Water utility tariffs so the yearly loss also shows up in money.

## AI use

> We used AI coding assistants for scaffolding and boilerplate. Architecture, product decisions, and final code review are our own.

(Adjust this section to match the hackathon's disclosure rules.)

## Open source used

Next.js, React, Tailwind CSS, GSAP, class-variance-authority, clsx, tailwind-merge, Radix Slot. Constants from USGS, UK DESNZ and Ember, cited on the notes page.
