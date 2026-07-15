"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { packagesData } from "../data/packages";
import { IndianRupee, Clock, MapPin, Star } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Image from "next/image";

interface YatraCategoryPageProps {
  categorySlug: "dharmic" | "desh" | "videsh" | "holiday";
  initialPackages?: any[];
}

export default function YatraCategoryPage({ categorySlug, initialPackages }: YatraCategoryPageProps) {
  // Determine category config based on URL path slug
  const config = useMemo(() => {
    switch (categorySlug) {
      case "dharmic":
        return {
          title: "Dharmic Yatra",
          subtitle: "Sacred Pilgrimages & Spiritual Journeys",
          description: "Embark on a soul-stirring pilgrimage to India's most sacred temples and holy sites. Settle your mind and find inner peace with our carefully guided tour packages.",
          bannerBg: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
          accentColor: "#e67e22"
        };
      case "desh":
        return {
          title: "Desh Yatra",
          subtitle: "Explore the Beautiful Landscapes of India",
          description: "From the majestic Himalayan peaks in the north to the tropical backwaters in the south, discover the rich heritage, vibrant cultures, and stunning natural beauty of India.",
          bannerBg: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
          accentColor: "#16a085"
        };
      case "videsh":
        return {
          title: "Videsh Yatra",
          subtitle: "Premium International Holidays",
          description: "Travel beyond borders to explore the wonders of the world. Experience local traditions, historic cities, and scenic views in Nepal, Bhutan, Bali, and Sri Lanka.",
          bannerBg: "linear-gradient(135deg, #2980b9 0%, #2c3e50 100%)",
          accentColor: "#2980b9"
        };
      case "holiday":
      default:
        return {
          title: "Holiday Yatra",
          subtitle: "Unwind, Relax & Create Lifetime Memories",
          description: "Specially curated leisure holidays. Whether you seek a romantic beach honeymoon in Maldives or an adventure getaway in Andaman, find the perfect package for your group.",
          bannerBg: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
          accentColor: "#8e44ad"
        };
    }
  }, [categorySlug]);

  const activePackages = initialPackages || packagesData;

  // Filter packages based on path configuration
  const filteredPackages = useMemo(() => {
    return activePackages.filter((pkg) => {
      if (categorySlug === "dharmic") {
        return pkg.category === "Spiritual";
      } else if (categorySlug === "videsh") {
        return pkg.category === "International";
      } else if (categorySlug === "desh") {
        // Domestic yatra (Holiday category but located in India and not Maldives/Andaman holiday-yatra)
        return pkg.category === "Holiday" && pkg.slug !== "andaman-nicobar" && pkg.slug !== "maldives-honeymoon";
      } else {
        // Holiday Yatra (Leisure packages)
        return pkg.slug === "andaman-nicobar" || pkg.slug === "maldives-honeymoon" || pkg.category === "Holiday" && (pkg.slug === "koriginal-kerala-kanyakumari" || pkg.slug === "kashmir-paradise" || pkg.slug === "rajasthan-desert-tour");
      }
    });
  }, [categorySlug, activePackages]);

  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Category Hero Banner */}
        <div className="py-20 px-6 text-white text-center relative overflow-hidden" style={{ background: config.bannerBg }}>
          <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 80%) pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
            <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
              Kamakhya Yatra Present
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4 text-white drop-shadow-md">
              {config.title}
            </h1>
            <p className="text-lg md:text-2xl font-medium mb-6 text-yellow-100">{config.subtitle}</p>
            <p className="text-sm md:text-base text-slate-100 leading-relaxed opacity-95">{config.description}</p>
          </div>
        </div>

        {/* Packages Grid Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 border-b border-slate-200 pb-5">
              <h3 className="text-2xl font-extrabold text-[#0b1c3e] mb-1">Available Packages ({filteredPackages.length})</h3>
              <div className="w-12 h-1 rounded" style={{ backgroundColor: config.accentColor }} />
            </div>

            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full">
                    <div className="relative h-[240px] bg-slate-200">
                      <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                      <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                        <span>{pkg.rating}</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {pkg.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {pkg.duration}</span>
                      </div>

                      <h2 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-2">{pkg.title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                        {pkg.description.slice(0, 100)}...
                      </p>

                      <div className="mt-auto border-t border-slate-100 pt-5 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Starting from</span>
                          <div className="flex items-center text-lg font-extrabold text-[#0b1c3e] mt-1">
                            <IndianRupee className="w-4 h-4 text-[#0b1c3e]" />
                            <span>{pkg.price.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/tour/${pkg.category.toLowerCase()}/${pkg.slug}`}
                            className="py-2.5 px-4 rounded-xl border font-bold text-xs hover:bg-slate-50 transition"
                            style={{ borderColor: config.accentColor, color: config.accentColor }}
                          >
                            Details
                          </Link>
                          <Link
                            href={`/book?package=${encodeURIComponent(pkg.title)}`}
                            className="py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center"
                            style={{ backgroundColor: config.accentColor }}
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl text-slate-500 shadow-sm">
                <p className="font-bold">No packages found under this category at the moment. Please contact us for custom bookings.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
