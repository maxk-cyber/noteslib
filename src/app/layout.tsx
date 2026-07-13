import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const thunder = localFont({
  src: "../../public/fonts/thunder.woff2",
  variable: "--font-thunder",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noteslib",
  description: "Markdown notes with graffiti style",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${thunder.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#080808] text-white"
      >
        {children}
      </body>
    </html>
  );
}
