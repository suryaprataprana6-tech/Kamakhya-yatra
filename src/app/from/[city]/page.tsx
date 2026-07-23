import { Metadata } from "next";
import { supabaseServer } from "@/utils/supabaseServer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

// Pre-define cities for static generation (optional but good for SEO)
const SUPPORTED_CITIES = [
  "ranchi", "patna", "kolkata", "bhubaneswar", "lucknow", 
  "delhi", "mumbai", "bengaluru", "chennai", "guwahati"
];

// Fallback images based on city (removed external dependencies for now)
const CITY_IMAGES: Record<string, string> = {
  "ranchi": "/logo.png",
  "patna": "/logo.png",
  "kolkata": "/logo.png",
  "delhi": "/logo.png",
};

export async function generateStaticParams() {
  return SUPPORTED_CITIES.map((city) => ({
    city: city,
  }));
}

type Props = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const title = `Tour & Pilgrimage Packages from ${formattedCity} | Kamakhya Yatra`;
  const description = `Explore premium tour and pilgrimage packages departing from ${formattedCity}. Book your Char Dham, Nepal, and International tours with PAN-India connectivity.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/from/${city.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.kamakhyayatra.com/from/${city.toLowerCase()}`,
    },
    robots: {
      index: false, // Prevent indexing until unique city content is added
    },
  };
}

export default async function CityLandingPage({ params }: Props) {
  const { city } = await params;
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const cityImage = CITY_IMAGES[city.toLowerCase()] || "/logo.png";

  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  const availablePackages = packages || [];

  return (
    <main className="bg-slate-50 min-h-screen text-slate-800">
      <Navbar />

      {/* SEO Hero */}
      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 bg-[#0b1c3e] overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#0b1c3e]">
          <Image src={cityImage} alt={`${formattedCity} City`} fill className="object-contain opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c3e] via-[#0b1c3e]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
          <span className="inline-block text-[#d4af37] text-sm font-extrabold tracking-widest uppercase mb-4 bg-[#d4af37]/10 px-4 py-1.5 rounded-full border border-[#d4af37]/30">
            Departing from {formattedCity}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading leading-tight mb-6">
            Premium Pilgrimage & Tour Packages from <span className="text-[#d4af37]">{formattedCity}</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Boarding and departure options are available from {formattedCity} depending on the selected package, scheduled departure, and flight/train connectivity.
          </p>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 text-xs text-slate-500 font-semibold">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-[#0b1c3e]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#0b1c3e]">Tours from {formattedCity}</span>
        </div>
      </div>

      {/* Available Packages */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold font-heading text-[#0b1c3e] mb-12 text-center">
            Popular Tours from {formattedCity}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availablePackages.slice(0, 9).map(pkg => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative h-[240px] bg-slate-100">
                  <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {pkg.location}</span>
                    <span>⏱ {pkg.duration}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-4 line-clamp-1">{pkg.title} from {formattedCity}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{pkg.description}</p>
                  
                  <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                      <span className="text-lg font-extrabold text-[#0b1c3e] block mt-1">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                    </div>
                    <Link href={`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`} className="text-xs font-bold text-[#d4af37] flex items-center gap-1">
                      Explore Yatra <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectivity & Info Section */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold font-heading text-[#0b1c3e] mb-6">About Boarding &amp; Connectivity from {formattedCity}</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              At Kamakhya Yatra, we understand that convenience is key to a peaceful spiritual journey. 
              Depending on the tour you select, we facilitate boarding or connecting travel arrangements from <strong>{formattedCity}</strong>. 
            </p>
            <p>
              Whether you're booking the Char Dham Yatra, 7 Jyotirlinga Tour, or an International holiday to Nepal, 
              our team ensures you receive the best possible train or flight connectivity from {formattedCity} to the tour's starting point.
            </p>
            <ul>
              <li><strong>Train Connectivity:</strong> Major express trains connecting {formattedCity} to destinations across India.</li>
              <li><strong>Flight Connectivity:</strong> Assistance with domestic flights from {formattedCity} airport where applicable.</li>
              <li><strong>Customized Options:</strong> We offer customized private tours originating directly from {formattedCity} for groups and families.</li>
            </ul>
            <p>
              <em>Please Note: Direct departure from {formattedCity} is subject to group size, scheduled departure dates, and transport availability. Additional connecting fares may apply.</em>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
