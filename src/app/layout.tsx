import type { Metadata } from "next";

import { RootProviders } from "@/components/providers/root-providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "NetVerse",
  description: "Build. Break. Fix. Master networks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
