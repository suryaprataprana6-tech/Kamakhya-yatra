import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kamakhya Yatra - Premium Tour & Travel Company",
  description: "Experience divine journeys and spiritual pilgrimages across India, Nepal and Bhutan with unmatched luxury, safety and comfort.",
  keywords: ["Kamakhya Yatra", "Char Dham Yatra", "Amarnath Yatra", "Spiritual Tour Packages", "Nepal Muktinath Yatra", "Bhutan Tour"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans bg-slate-50 text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

