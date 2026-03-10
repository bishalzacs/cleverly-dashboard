import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PointSix Dialer | Premium Dashboard",
  description: "High-end dialer and lead management dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark selection:bg-brand-accent/30 selection:text-white">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-base text-text-primary custom-scrollbar min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
