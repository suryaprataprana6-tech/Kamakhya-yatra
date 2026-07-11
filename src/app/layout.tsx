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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Kamakhya Yatra",
    "image": "https://www.kamakhyayatra.com/hero-kamakhya.png",
    "logo": "https://www.kamakhyayatra.com/logo.png",
    "url": "https://www.kamakhyayatra.com",
    "telephone": "+91 70790 44000",
    "email": "kamakhyayatra19@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2nd Floor, Keshri Height, Opp. Manyavar Shop, Ratu Road",
      "addressLocality": "Ranchi",
      "addressRegion": "Jharkhand",
      "postalCode": "834001",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61562942375687",
      "https://www.instagram.com/kamakhya_yatra"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "9",
      "bestRating": "5",
      "worstRating": "1"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

