import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kamakhyayatra.com"),
  title: "Kamakhya Yatra | Tour Packages from Ranchi & Across India",
  description: "Experience divine journeys and spiritual pilgrimages across India, Nepal and Bhutan. Premium domestic and international tour packages with PAN-India boarding connectivity, offering unmatched luxury, safety, and comfort.",
  keywords: ["Kamakhya Yatra", "Tour Packages from Ranchi", "Domestic Tour Packages India", "Religious Tour Packages India", "Nepal Tour", "Bhutan Tour"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kamakhya Yatra | Tour Packages from Ranchi & Across India",
    description: "Premium domestic, international, and pilgrimage tour packages with PAN-India boarding connectivity.",
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
    title: "Kamakhya Yatra | Tour Packages from Ranchi & Across India",
    description: "Premium domestic, international, and pilgrimage tour packages with PAN-India boarding connectivity.",
    images: ["/hero-kamakhya.png"],
  },
  verification: {
    google: "g-TSdJa4MvXjFuXke3TvRsMuGsNzYpAi-6PvQpT4aSY",
  },
};

export const revalidate = 60;

export default async function Page() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <HomeClient initialPackages={packages || []} />;
}
