import { ImageResponse } from "next/og";

export const alt = "Guttora: count a dripping tap by ear and see its yearly water and CO2e loss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colors from IDENTITY.md (D10 butter). ImageResponse cannot read CSS variables.
const GROUND = "#ffd63d";
const SURFACE = "#fff3c4";
const INK = "#141414";
const ROYAL = "#1c4fd8";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: GROUND, padding: 56 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: SURFACE,
            border: `6px solid ${INK}`,
            boxShadow: `14px 14px 0 0 ${INK}`,
            padding: 56,
            color: INK,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 72, height: 72, background: ROYAL, border: `6px solid ${INK}`, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)" }} />
            <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: -2 }}>Guttora</div>
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, maxWidth: 960 }}>
            Hold your phone to a dripping tap. Guttora counts the drops by ear and shows the litres and kg CO2e it wastes a year.
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: ROYAL }}>Green Shift Hacks 2026</div>
        </div>
      </div>
    ),
    size
  );
}
