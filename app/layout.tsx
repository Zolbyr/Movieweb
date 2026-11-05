import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { SiteHeader } from "./_components/SiteHeader";
import { ContactInfo } from "./_components/Contactinfo";
import { FilmBackground } from "./_components/FilmBackground";

const manrope = localFont({
  src: "../public/fonts/Manrope-Variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Movie Z", template: "%s | Movie Z" },
  description: "Киноны мэдээлэл, үзвэрийн хуваарь, Монголын кино театруудын байршил.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={manrope.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <FilmBackground />
          <a href="#main-content" className="skip-link">Үндсэн хэсэг рүү очих</a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <ContactInfo />
        </Providers>
      </body>
    </html>
  );
}
