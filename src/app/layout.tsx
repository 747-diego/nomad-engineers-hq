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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Applies the saved theme before first paint to avoid a flash. Default = light
// (Nomad Cream); only an explicit "dark" preference removes the class.
const themeScript = `(function(){try{var t=localStorage.getItem('nomad-theme');var c=document.documentElement.classList;if(t==='dark'){c.remove('nomad-light')}else{c.add('nomad-light')}}catch(e){c=document.documentElement.classList;c.add('nomad-light')}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="nomad-light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${prompt.variable} ${dmMono.variable} font-mono`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
