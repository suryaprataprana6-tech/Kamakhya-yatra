"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Destination {
  id: number;
  name: string;
  image: string;
  category: string;
  categoryUrl: string;
  description: string;
  highlights: string[];
}

const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Kedarnath & Char Dham",
    image: "/hero-kedarnath.png",
    category: "Spiritual Pilgrimage",
    categoryUrl: "/dharmic-yatra",
    description: "The sacred valley of the gods in Uttarakhand. Trek through majestic peaks to seek blessings at one of India's most holy shrines.",
    highlights: ["Kedarnath Temple", "Badrinath Shrine", "Mana Village", "Yamunotri & Gangotri"]
  },
  {
    id: 2,
    name: "Kashmir & Srinagar",
    image: "/hero-kashmir.png",
    category: "Domestic Holiday",
    categoryUrl: "/desh-yatra",
    description: "Paradise on Earth. Experience houseboats on Dal Lake, blooming tulip gardens, and the snowy meadows of Gulmarg.",
    highlights: ["Shikara Ride", "Gulmarg Gondola", "Shalimar Bagh", "Pahalgam Valleys"]
  },
  {
    id: 3,
    name: "Rameshwaram & Madurai",
    image: "/Rameshwaram.jpeg",
    category: "Spiritual Pilgrimage",
    categoryUrl: "/dharmic-yatra",
    description: "The holy southern Dham. Walk through corridors of a thousand pillars and bathe in the 22 sacred teerthams.",
    highlights: ["Ramanathaswamy Temple", "Dhanushkodi ruins", "Pamban Bridge", "Meenakshi Temple"]
  },
  {
    id: 4,
    name: "Nepal & Muktinath",
    image: "/Nepal.jpeg",
    category: "International Tour",
    categoryUrl: "/videsh-yatra",
    description: "A land of massive peaks and sacred shrines. Tour the Kathmandu valley and fly to high-altitude Muktinath temple.",
    highlights: ["Pashupatinath Temple", "Pokhara Lake view", "Muktinath Darshan", "Kathmandu Durbar Square"]
  },
  {
    id: 5,
    name: "Bhutan - The Land of Happiness",
    image: "/bhutan.png",
    category: "International Tour",
    categoryUrl: "/videsh-yatra",
    description: "Immerse in peaceful monasteries, fortress Dzongs, and mountain landscapes in the last remaining Himalayan Kingdom.",
    highlights: ["Tiger's Nest Monastery", "Thimphu City tour", "Paro Valley", "Punakha Dzong"]
  },
  {
    id: 6,
    name: "Andaman & Nicobar Islands",
    image: "/andaman.jpeg",
    category: "Leisure Holiday",
    categoryUrl: "/holiday-yatra",
    description: "Pristine white sand beaches, clear coral waters, and rich colonial history. The ultimate beach getaway in India.",
    highlights: ["Radhanagar Beach", "Cellular Jail light show", "Havelock Island snorkeling", "Baratang caves"]
  },
  {
    id: 7,
    name: "Kerala Backwaters & Hills",
    image: "/kerela.jpeg",
    category: "Domestic Holiday",
    categoryUrl: "/desh-yatra",
    description: "God's Own Country. Drift along tranquil houseboat channels, visit spice plantations in Munnar, and relax in Kovalam.",
    highlights: ["Alleppey Houseboat stay", "Munnar tea fields", "Athirappilly waterfalls", "Kovalam beach"]
  }
];

export default function DestinationsPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Banner */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Our Footprint</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">Dream Destinations</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Explore the iconic coordinates where we host our premium tour groups. Select any destination to see available itineraries.
            </p>
          </div>
        </section>

        {/* Grid Showcase */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DESTINATIONS.map((dest) => (
              <div 
                key={dest.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row h-full"
              >
                {/* Visual frame */}
                <div className="relative w-full sm:w-[40%] h-[240px] sm:h-auto bg-slate-100 shrink-0">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Category overlay */}
                  <span className="absolute top-4 left-4 text-white text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-[#0b1c3e]/85 backdrop-blur-md">
                    {dest.category}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                  <div className="flex flex-col gap-3">
                    <span className="flex items-center gap-1 text-slate-400 font-extrabold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> India &amp; Subcontinent
                    </span>
                    <h2 className="font-heading font-extrabold text-xl text-[#0b1c3e] group-hover:text-[#d4af37] transition duration-200">
                      {dest.name}
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Highlights list */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {dest.highlights.map((high, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200/60 font-semibold px-2 py-0.5 rounded-md">
                          ✓ {high}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Call to action redirecting to Yatra category */}
                  <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">
                      Active Route
                    </span>
                    <Link 
                      href={dest.categoryUrl}
                      className="text-xs font-bold text-[#0b1c3e] hover:text-[#d4af37] flex items-center gap-1 transition"
                    >
                      View Packages <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
