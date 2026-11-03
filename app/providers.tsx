"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider, RouterProvider } from "react-aria-components";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="movie-z-theme">
    <I18nProvider locale="mn-MN">
      <RouterProvider navigate={(href) => router.push(href)}>{children}</RouterProvider>
    </I18nProvider>
  </ThemeProvider>;
}
