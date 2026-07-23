import type { Metadata } from "next";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Compass, Heart, Users, Target, Eye } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Kamakhya Yatra - Premium Tour & Travel Agency",
  description: "Learn about Kamakhya Yatra, a trusted travel partner in Ranchi, Jharkhand. Discover our mission, vision, and years of dedicated service in curating spiritual pilgrimages and premium holidays.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsPage() {

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Banner */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Our Identity &amp; Purpose</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">About Kamakhya Yatra</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              We guide you on physical and spiritual journeys. Discover the passion, commitment, and legacy of service that drives our agency.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          {/* Who We Are */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-extrabold text-[#d4af37] uppercase tracking-wider">Trusted Travel Partner</span>
              <h2 className="text-3xl font-extrabold text-[#0b1c3e] font-heading">Who We Are</h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Kamakhya Yatra is a premium travel agency dedicated to curating unforgettable <Link href="/dharmic-yatra" className="hover:text-[#d4af37] transition-colors">spiritual</Link>, <Link href="/desh-yatra" className="hover:text-[#d4af37] transition-colors">domestic</Link>, and <Link href="/videsh-yatra" className="hover:text-[#d4af37] transition-colors">international</Link> journeys. Based in the heart of Ranchi, Jharkhand, we blend convenience with high-end customer care to provide you with seamless travel experiences.
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Whether you seek the sacred atmosphere of Himalayan shrines (such as <Link href="/tour/spiritual/chaar-dhaam-yatra" className="hover:text-[#d4af37] transition-colors">Char Dham</Link> or <Link href="/tour/spiritual/amarnath-yatra" className="hover:text-[#d4af37] transition-colors">Amarnath</Link>), a tranquil weekend getaway in <Link href="/tour/holiday/kamakhya-darjeeling-gangtok" className="hover:text-[#d4af37] transition-colors">Darjeeling</Link>, or a luxurious international holiday in <Link href="/tour/international/nepal-muktinath-yatra" className="hover:text-[#d4af37] transition-colors">Nepal</Link> or <Link href="/tour/international/bhutan-tour" className="hover:text-[#d4af37] transition-colors">Bhutan</Link>, we arrange it all with meticulous detail.
              </p>
            </div>
            <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80" 
                alt="Pilgrims traveling with Kamakhya Yatra" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c3e]/80 via-transparent to-transparent flex items-end p-8 text-white">
                <div>
                  <span className="text-[#d4af37] font-extrabold text-2xl">15+ Years</span>
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-1">Of sacred pilgrimage services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Mission */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/60 shadow-md flex gap-6 hover:shadow-lg transition">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#0b1c3e]/5 flex items-center justify-center text-[#d4af37]">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-3">Our Mission</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our mission is to bring you closer to your spiritual goals and dream destinations without the hassle of planning. We strive to offer top-tier customer service, transparent pricing, and personalized itineraries that cater to your unique needs, ensuring safety and comfort.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/60 shadow-md flex gap-6 hover:shadow-lg transition">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#0b1c3e]/5 flex items-center justify-center text-[#d4af37]">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-3">Our Vision</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  To be recognized globally as the most trusted and customer-centric travel partner, making every journey—whether a sacred pilgrimage or a relaxing family holiday—a deeply cherished, stress-free memory for a lifetime.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="text-center mb-12">
            <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase block mb-3">Unmatched Excellence</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#0b1c3e]">Why Travelers Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="w-6 h-6 text-[#d4af37]" />, title: "Curated Safely", desc: "Every tour features certified on-ground support, trusted drivers, and premium lodging." },
              { icon: <Compass className="w-6 h-6 text-[#d4af37]" />, title: "Custom Itineraries", desc: "Adjust travel dates, vehicle choices, and hotel tiers to suit your group's preferences." },
              { icon: <Users className="w-6 h-6 text-[#d4af37]" />, title: "Dedicated Guides", desc: "English & Hindi speaking guides with profound knowledge of local heritage." },
              { icon: <Heart className="w-6 h-6 text-[#d4af37]" />, title: "Elderly Care", desc: "Special arrangements, gentle pacing, and medical support for elderly pilgrims." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-[#0b1c3e]/5 flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h4 className="font-heading font-extrabold text-base text-[#0b1c3e] mb-2">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
