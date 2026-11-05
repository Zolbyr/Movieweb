import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { SiteHeader } from "./_components/SiteHeader";
import { ContactInfo } from "./_components/Contactinfo";
import { FilmBackground } from "./_components/FilmBackground";

const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  weight: "100 900",
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
    <html lang="mn" className={inter.variable} suppressHydrationWarning>
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
