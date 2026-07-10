"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Camera, Film, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface GalleryItem {
  id: number;
  type: "image" | "video";
  src: string;
  alt: string;
  title: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, type: "image", src: "/happy01.jpeg", alt: "Spiritual yatra travelers posing at Kamakhya Temple", title: "Blessings at Kamakhya Temple" },
  { id: 2, type: "image", src: "/happy02.jpeg", alt: "Scenic views of Darjeeling tea gardens with our group", title: "Scenic Valleys of Darjeeling" },
  { id: 3, type: "image", src: "/happy03.jpeg", alt: "Chaar Dhaam pilgrimage family yatra", title: "Chaar Dhaam Yatra Group" },
  { id: 4, type: "image", src: "/happy04.jpeg", alt: "Devotees group climbing near Kedarnath Temple", title: "Pilgrims at Kedarnath Temple" },
  { id: 5, type: "image", src: "/happy05.jpeg", alt: "Happy tourists relaxing at a beach in Andaman", title: "Sunset at Andaman Beach" },
  { id: 6, type: "image", src: "/happy06.jpeg", alt: "Pilgrims group smile during high altitude journey", title: "Yatra Group Mountains Summit" },
  { id: 7, type: "image", src: "/happy07.jpeg", alt: "Pilgrimage traveler at sacred shrine site", title: "Sacred Shrine Blessings" },
  { id: 8, type: "video", src: "/happy08.mp4", alt: "Happy customer yatra review video testimonial", title: "Traveler Journey Testimonial" },
  { id: 9, type: "image", src: "/happy09.jpeg", alt: "Group photo in front of monastery in Gangtok", title: "Monastery Visit, Gangtok" },
  { id: 10, type: "image", src: "/happy10.jpeg", alt: "Helicopter landing yatra group at Amarnath", title: "Amarnath Holy Caves Yatra" },
  { id: 11, type: "image", src: "/happy11.jpeg", alt: "Sacred gathering of yatra group at river side", title: "Ganga Aarti Group Gathering" },
  { id: 12, type: "image", src: "/happy12.jpeg", alt: "Lush green tea meadows valleys and waterfalls", title: "Scenic Waterfalls, Kerala" },
  { id: 13, type: "image", src: "/happy13.jpeg", alt: "Happy family pilgrimage tour smiles", title: "Family Spiritual Getaway" },
  { id: 14, type: "image", src: "/happy14.jpeg", alt: "Muktinath yatra temple steps in Nepal", title: "Muktinath Yatra, Nepal" },
  { id: 15, type: "image", src: "/happy15.jpeg", alt: "Group yatra sharing warm traditional meals", title: "Traditional Meals & Fellowship" }
];

export default function GalleryPage() {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Disable body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  // Handle Keyboard Navigation (Esc, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  const handlePrev = () => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === GALLERY_ITEMS.length - 1 ? 0 : prev + 1;
    });
  };

  const activeItem = lightboxIndex !== null ? GALLERY_ITEMS[lightboxIndex] : null;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Navbar />

        {/* Page Header banner */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            {/* Back button */}
            <button 
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#d4af37] text-sm font-semibold mb-6 transition duration-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Memories of a Lifetime</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">Traveler Media Gallery</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Every yatra tells a story of faith, peace, and discovery. Explore the real travel moments captured by our yatra groups across India, Nepal, and Bhutan.
            </p>
          </div>
        </section>

        {/* Media Grid Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          {/* Section categories helper info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-10">
            <div className="flex items-center gap-2 text-[#0b1c3e]">
              <span className="font-extrabold font-heading text-lg">Traveler Shared Moments</span>
              <span className="bg-slate-200/80 text-slate-700 text-xs font-extrabold py-0.5 px-2.5 rounded-full">
                {GALLERY_ITEMS.length} Items
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold max-sm:hidden">
              💡 Tip: Hover on the video to preview, or click any item to expand!
            </p>
          </div>

          {/* Masonry / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item, idx) => (
              <div 
                key={item.id} 
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                onClick={() => setLightboxIndex(idx)}
              >
                {/* Media frame */}
                <div className="relative aspect-video sm:aspect-[4/3] bg-slate-100 flex-grow">
                  {item.type === "image" ? (
                    <Image 
                      src={item.src} 
                      alt={item.alt} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      <video 
                        src={item.src} 
                        muted 
                        playsInline 
                        loop 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                      {/* Play overlay icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#d4af37]/90 text-[#0b1c3e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Media type tag */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    {item.type === "image" ? (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>PHOTO</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-3.5 h-3.5" />
                        <span>VIDEO</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info strip */}
                <div className="p-4 bg-white border-t border-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-[#0b1c3e] group-hover:text-[#d4af37] transition duration-200 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">
                      {item.type === "image" ? "Verified Pilgrimage Photo" : "Traveler Vlog Review"}
                    </p>
                  </div>
                  <span className="text-slate-300 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition duration-200 text-sm">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox / Media Modal overlay */}
      {lightboxIndex !== null && activeItem && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex flex-col justify-between items-center p-4 transition-all duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition duration-200 z-[1000]"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous control button */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-3 bg-white/5 hover:bg-white/10 rounded-full transition duration-200 z-[1000] max-sm:p-2"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft className="w-8 h-8 max-sm:w-6 max-sm:h-6" />
          </button>

          {/* Next control button */}
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-3 bg-white/5 hover:bg-white/10 rounded-full transition duration-200 z-[1000] max-sm:p-2"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="w-8 h-8 max-sm:w-6 max-sm:h-6" />
          </button>

          {/* Content display center block */}
          <div 
            className="flex-grow flex items-center justify-center max-w-5xl w-full select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "image" ? (
              <div className="relative max-h-[75vh] aspect-[4/3] w-full max-w-3xl flex items-center justify-center p-2">
                <img 
                  src={activeItem.src} 
                  alt={activeItem.alt}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/5" 
                />
              </div>
            ) : (
              <div className="relative max-h-[75vh] w-full max-w-3xl flex items-center justify-center p-2 bg-black rounded-xl overflow-hidden">
                <video 
                  src={activeItem.src} 
                  controls 
                  autoPlay 
                  playsInline
                  className="max-w-full max-h-[75vh] rounded-xl shadow-2xl" 
                />
              </div>
            )}
          </div>

          {/* Caption strip at bottom */}
          <div 
            className="w-full text-center pb-6 px-12 z-[1000] max-w-2xl bg-gradient-to-t from-black via-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-white font-heading font-extrabold text-lg md:text-xl tracking-wide">
              {activeItem.title}
            </h4>
            <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed max-sm:hidden">
              {activeItem.alt}
            </p>
            <div className="mt-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
              Item {lightboxIndex + 1} of {GALLERY_ITEMS.length}
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
