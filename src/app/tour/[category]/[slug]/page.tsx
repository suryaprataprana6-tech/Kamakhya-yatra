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

  let baseTitle = tour.title.trim();
  const lowerTitle = baseTitle.toLowerCase();
  const isSpiritual = tour.category.toLowerCase() === "spiritual" || lowerTitle.includes("dham") || lowerTitle.includes("jyotirlinga");
  
  if (!lowerTitle.includes("package")) {
     if (isSpiritual && !lowerTitle.includes("yatra")) {
        baseTitle += " Yatra Package";
     } else if (!isSpiritual && !lowerTitle.includes("tour")) {
        baseTitle += " Tour Package";
     } else {
        baseTitle += " Package";
     }
  }

  const title = `${baseTitle} | Kamakhya Yatra`;
  
  const includedText = Array.isArray(tour.whats_included) ? tour.whats_included.slice(0, 3).join(", ") : "Sightseeing, Accommodation";
  const shortDesc = tour.description ? tour.description.substring(0, 100).trim() + "..." : "";
  const description = `Book your ${baseTitle} with Kamakhya Yatra. Verified ${tour.duration} itinerary including ${includedText}. ${shortDesc}`;

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.kamakhyayatra.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tours",
        "item": "https://www.kamakhyayatra.com/tours"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tour.title,
        "item": `https://www.kamakhyayatra.com/tour/${tour.category.toLowerCase()}/${tour.slug}`
      }
    ]
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TourDetailPage tour={mappedTour} />
    </>
  );
}
