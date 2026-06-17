import type { Metadata, Viewport } from "next";
import { Prompt, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Headlines / wordmarks — Prompt ExtraBold (800) + Bold (700)
const prompt = Prompt({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

// Body / UI / labels — DM Mono Regular (400) + Medium (500)
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "nomad engineers HQ",
  description: "Internal operating system for Nomad Engineers.",
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.variable} ${dmMono.variable} font-mono`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
