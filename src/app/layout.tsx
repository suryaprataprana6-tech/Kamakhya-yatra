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
  metadataBase: new URL("https://www.kamakhyayatra.com"),
  title: {
    default: "Kamakhya Yatra - Premium Tour & Travel Company",
    template: "%s | Kamakhya Yatra",
  },
  description: "Experience divine journeys and spiritual pilgrimages across India, Nepal and Bhutan with unmatched luxury, safety and comfort.",
  keywords: ["Kamakhya Yatra", "Char Dham Yatra", "Amarnath Yatra", "Spiritual Tour Packages", "Nepal Muktinath Yatra", "Bhutan Tour"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kamakhya Yatra - Premium Tour & Travel Company",
    description: "Experience divine journeys and spiritual pilgrimages across India, Nepal and Bhutan with unmatched luxury, safety and comfort.",
    url: "https://www.kamakhyayatra.com",
    siteName: "Kamakhya Yatra",
    images: [
      {
        url: "/hero-kamakhya.png",
        width: 1200,
        height: 630,
        alt: "Kamakhya Yatra - Premium Tour & Travel Company",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamakhya Yatra - Premium Tour & Travel Company",
    description: "Experience divine journeys and spiritual pilgrimages across India, Nepal and Bhutan with unmatched luxury, safety and comfort.",
    images: ["/hero-kamakhya.png"],
  },
  verification: {
    google: "g-TSdJa4MvXjFuXke3TvRsMuGsNzYpAi-6PvQpT4aSY",
  },
};

import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Kamakhya Yatra",
    "image": "https://www.kamakhyayatra.com/logo-kamakhya.png",
    "@id": "https://www.kamakhyayatra.com/#agency",
    "url": "https://www.kamakhyayatra.com",
    "telephone": "+91-7079044000",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Railway Station Road",
      "addressLocality": "Guwahati",
      "addressRegion": "Assam",
      "postalCode": "781001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.1859,
      "longitude": 91.7486
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/kamakhyayatra",
      "https://www.instagram.com/kamakhyayatra"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1250"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Surya Pratap Rana"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Bahut hi behtareen anubhav raha. Darshan bina kisi pareshani ke sampann hua. Staff ka vyavhaar vinamr aur sahayak tha. Main Kamakhya Yatra ko zarur recommend karunga."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Our Kamakhya temple yatra was perfectly organized. Darshan timings, stay, and transport were all smooth. The team was caring and professional throughout."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Rahul Mehta"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Booked a Darjeeling and Gangtok holiday package. Hotels were comfortable, itinerary was well planned, and the guide knew every local highlight. Highly recommend!"
      }
    ]
  };

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans bg-slate-50 text-slate-800 antialiased min-h-screen">
        <AnalyticsTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

