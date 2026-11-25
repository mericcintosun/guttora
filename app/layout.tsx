import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-header";
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

export const metadata: Metadata = {
  title: "Guttora: count a dripping tap by ear",
  description:
    "Hold your phone next to a dripping tap. Guttora counts the drops by sound, measures drop size with a teaspoon, and shows how many litres of water and kilograms of CO2e that tap wastes in a year.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${archivo.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
