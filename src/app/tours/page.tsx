"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { packagesData } from "@/data/packages";
import { Search, MapPin, Clock, Star, IndianRupee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Spiritual" | "Holiday" | "International">("All");

  const filteredPackages = useMemo(() => {
    return packagesData.filter((pkg) => {
      const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pkg.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Banner Section */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Our Complete Catalogue</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">Explore Our Yatra Packages</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
              Choose from our curated collection of spiritual pilgrimages, luxury domestic escapes, and premium international destinations.
            </p>

            {/* Premium Search and Category Filter Container */}
            <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md text-[#2d3748] rounded-2xl p-4 shadow-xl border border-white/20 flex flex-col md:flex-row gap-4 items-center">
              {/* Search input */}
              <div className="w-full flex-grow flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by destination or yatra title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-sm text-slate-800"
                />
              </div>

              {/* Category selector */}
              <div className="w-full md:w-auto shrink-0 flex gap-1.5 flex-wrap justify-center">
                {(["All", "Spiritual", "Holiday", "International"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-300 border ${
                      selectedCategory === cat
                        ? "bg-[#0b1c3e] border-[#0b1c3e] text-white shadow-md"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0b1c3e]"
                    }`}
                  >
                    {cat === "Spiritual" ? "🕉 Spiritual" : cat === "Holiday" ? "🌴 Holiday" : cat === "International" ? "✈ Videsh" : "🔍 All"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          {/* Results bar */}
          <div className="border-b border-slate-200 pb-5 mb-10 flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-[#0b1c3e]">Available Tours ({filteredPackages.length})</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Central database active
            </span>
          </div>

          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => {
                // Determine theme color based on category
                const accentColor = pkg.category === "Spiritual" ? "#e67e22" : pkg.category === "International" ? "#2980b9" : "#16a085";
                return (
                  <div 
                    key={pkg.id} 
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full"
                  >
                    {/* Image frame */}
                    <div className="relative h-[240px] bg-slate-200">
                      <Image src={pkg.image} alt={pkg.title} fill className="object-cover" />
                      <div className="absolute top-4 right-4 bg-white/95 text-slate-800 font-extrabold text-xs py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-[#d4af37] text-none" />
                        <span>{pkg.rating}</span>
                      </div>
                      {/* Category Badge overlay */}
                      <span className="absolute bottom-4 left-4 text-white text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md">
                        {pkg.category === "Spiritual" ? "🕉 Spiritual" : pkg.category === "International" ? "✈ International" : "🌴 Holiday"}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {pkg.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {pkg.duration}</span>
                      </div>

                      <h2 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-2">{pkg.title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                        {pkg.description}
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
                            style={{ borderColor: accentColor, color: accentColor }}
                          >
                            Details
                          </Link>
                          <a
                            href={`https://wa.me/917079044000?text=Hello,%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(pkg.title)}%20package.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition"
                            style={{ backgroundColor: accentColor }}
                          >
                            Book Now
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-sm text-slate-500">
              <p className="font-bold text-lg text-[#0b1c3e] mb-2">No matching packages found</p>
              <p className="text-sm text-slate-400">Try adjusting your search criteria or filters, or reach out to us for a custom travel plan.</p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
