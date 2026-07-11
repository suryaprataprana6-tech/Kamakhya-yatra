import { Metadata } from "next";
import TourDetailPage from "@/components/TourDetailPage";
import { supabaseServer } from "@/utils/supabaseServer";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: tour } = await supabaseServer
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!tour) {
    return {
      title: "Tour Package Not Found",
      description: "The requested tour package could not be found.",
    };
  }

  const title = `${tour.title} Package - ${tour.duration} from ₹${Number(tour.price).toLocaleString("en-IN")} | Kamakhya Yatra`;
  const includedText = Array.isArray(tour.whats_included) ? tour.whats_included.slice(0, 3).join(", ") : "";
  const description = `${tour.description} Book the perfect ${tour.title} tour package with Kamakhya Yatra. Inclusions: ${includedText}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tour/${tour.category.toLowerCase()}/${tour.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.kamakhyayatra.com/tour/${tour.category.toLowerCase()}/${tour.slug}`,
      type: "article",
      images: [
        {
          url: tour.image.startsWith("http") ? tour.image : `https://www.kamakhyayatra.com${tour.image}`,
          alt: tour.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [tour.image.startsWith("http") ? tour.image : `https://www.kamakhyayatra.com${tour.image}`],
    },
  };
}

export default async function TourDetailRoute({ params }: Props) {
  const { slug } = await params;
  
  const { data: tour } = await supabaseServer
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!tour) {
    return <TourDetailPage />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${tour.title} - ${tour.duration}`,
    "image": tour.image.startsWith("http") ? tour.image : `https://www.kamakhyayatra.com${tour.image}`,
    "description": tour.description,
    "offers": {
      "@type": "Offer",
      "price": tour.price.toString(),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://www.kamakhyayatra.com/tour/${tour.category.toLowerCase()}/${tour.slug}`
    }
  };

  const itineraryArray = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": tour.description,
    "image": tour.image.startsWith("http") ? tour.image : `https://www.kamakhyayatra.com${tour.image}`,
    "touristType": tour.category,
    "offers": {
      "@type": "Offer",
      "price": tour.price.toString(),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://www.kamakhyayatra.com/tour/${tour.category.toLowerCase()}/${tour.slug}`
    },
    "itinerary": itineraryArray.map((item: any) => ({
      "@type": "HowToStep",
      "name": item.day + ": " + item.title,
      "text": item.details || item.description
    }))
  };

  // Build a mapped tour object that aligns with the Client component expectations
  const mappedTour = {
    ...tour,
    inclusions: tour.whats_included,
    price: Number(tour.price)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
      />
      <TourDetailPage tour={mappedTour} />
    </>
  );
}
