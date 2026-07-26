import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ReciPeel | AI Recipe & Meal Planner",
  description: "AI-powered recipe import, smart dietary substitutions, and weekly meal planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {children}
      </body>
    </html>
  );
}
