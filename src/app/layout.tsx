import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Tokify - Scan. Pay. Trust.",
  description: "QR Token System for small Indian businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-body">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
