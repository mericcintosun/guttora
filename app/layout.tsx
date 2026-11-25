import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
  variable: "--font-archivo-black",
});

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-archivo",
});

const TITLE = "Guttora: count a dripping tap by ear";
// Under 160 characters, so search results and link previews show it whole.
const DESCRIPTION =
  "A dripping tap wastes thousands of litres a year unnoticed. Guttora counts the drops by ear and shows the litres, kWh and kg CO2e it costs.";

export const metadata: Metadata = {
  metadataBase: new URL("https://guttora.vercel.app"),
  title: { default: TITLE, template: "%s | Guttora" },
  description: DESCRIPTION,
  // The image comes from app/opengraph-image.tsx, resolved against metadataBase.
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", siteName: "Guttora", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${archivo.variable}`}>
      <body className="min-h-screen pb-16 antialiased md:pb-0">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <SiteFooter />
        {/* Under md the header nav hides and this solid bar takes over. No mark, no blur. */}
        <nav aria-label="Main, mobile" className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-border bg-background md:hidden">
          <SiteNav layout="bar" />
        </nav>
      </body>
    </html>
  );
}
