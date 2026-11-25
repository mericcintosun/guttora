# DEMO: Guttora

**Problem:** A tap that drips once a second loses about 7,900 litres a year at the USGS drop size of 0.25 mL, and nobody fixes it because nobody has the number.

**Trigger:** a dripping tap in a student residence, and a phone with the bench open beside it.

**Wow moment:** the phone sits by the sink, the counter ticks and the blue mark flashes on every drop with no button pressed after Start, the litres a year figure and its bar climb together, and closing the tap shows "No regular drip. Yearly loss: 0 L."

**Closing:** the repair request text, ranked by yearly loss, is copied to the clipboard and ready to paste into a maintenance ticket.

Demo start route: /

Before each take: open `/play?reset=1`.

## Steps

1. `/` (`app/page.tsx`, `components/story-intro.tsx`, `components/inline-count.tsx`, `components/drip-story.tsx`): the headline words wipe in one by one and the phone-by-the-basin frame follows. Scroll: the sentence "one drip a second is about 7,885 litres a year" (computed by `annualLitres(60, DEFAULT_ML_PER_DROP)`) counts its oversized figure up from 0. Then read the five chapters following seed tap C-214 as the pinned scene plays.
2. `/play` (`app/play/page.tsx`, `components/drip-listener.tsx`): press "Start listening". The counter ticks per drop, then the rate and the regularity badge appear. Fallback: upload a recording.
3. `/play` (`components/impact-figure.tsx`): keep the counter running. Each counted drop flashes the blue mark, and the litres a year figure and its bar climb together as the rate settles.
4. `/play` (`components/play-workbench.tsx`): press "Start spoon", then "Spoon is full". The measured mL per drop replaces the USGS default, and the figure and bar tween to the measured drop size.
5. `/play` (`components/play-workbench.tsx`): switch the heater on. kWh and kg CO2e appear, using the selected grid factor.
6. `/play` (`components/repair-list.tsx`): press "Add to repair list". The tap is ranked against the seed residence (Ayazağa Student Residence, served by `lib/adapter.ts`), then press "Copy repair request".
7. `/play` (`components/drip-listener.tsx`): close the tap. The screen reads "No regular drip. Yearly loss: 0 L."
8. `/notes` (`app/notes/page.tsx`, `components/accuracy-bench.tsx`): the synthetic accuracy bench table and the sources. It is labelled synthetic. With `ADAPTER_MODE=real` the table arrives filled from the server; in fake mode press Run the bench.

The builder records the video from the live site by walking these steps in order.
