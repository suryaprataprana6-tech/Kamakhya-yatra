"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPackageBySlug, Package } from "../data/packages";
import { Check, Clock, MapPin, Star, IndianRupee, MessageCircle, Phone, ArrowLeft, Send } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { submitLeadAndRedirect, recordWhatsAppClick } from "@/utils/leads";

export default function TourDetailPage({ tour: initialTour }: { tour?: Package }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [activeDay, setActiveDay] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    date: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve the selected package
  const tour = useMemo(() => {
    if (initialTour) return initialTour;
    return getPackageBySlug(slug);
  }, [slug, initialTour]);

  if (!tour) {
    return (
      <div className="bg-[#f7fafc] min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-24 px-6 text-center">
          <h2 className="text-3xl font-extrabold text-[#0b1c3e] mb-4">Tour Package Not Found</h2>
          <p className="text-slate-500 mb-8">The tour package you are looking for does not exist or has been moved.</p>
          <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 bg-[#0b1c3e] text-white px-8 py-3 rounded-full font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleWhatsAppInquiry = async () => {
    // Record WhatsApp button click lead
    await recordWhatsAppClick(tour.title);
    
    const text = `Hello Kamakhya Yatra, I am interested in booking the "${tour.title}" (${tour.duration}) package. Please share details.`;
    const url = `https://wa.me/917079044000?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name.trim() || !bookingForm.phone.trim()) {
      alert("Please fill in your name and phone number.");
      return;
    }

    setIsSubmitting(true);

    // Save lead in Supabase and redirect to WhatsApp
    const res = await submitLeadAndRedirect(
      {
        name: bookingForm.name,
        phone: bookingForm.phone,
        package: tour.title,
        date: bookingForm.date
      },
      "package_page"
    );

    setIsSubmitting(false);

    if (res && res.success) {
      alert("Redirecting to WhatsApp to send your inquiry... Please click 'Send' in the WhatsApp chat.");
      setBookingForm({ name: "", phone: "", date: "" });
    }
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Detail Hero Header */}
        <div 
          className="relative h-[480px] bg-cover bg-center flex items-end text-white" 
          style={{ backgroundImage: `url(${tour.image})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c3e]/90 via-[#0b1c3e]/40 to-transparent z-1" />
          
          <div className="max-w-7xl mx-auto w-full px-6 pb-12 relative z-10">
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-white/30 transition mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            
            <div className="flex flex-col gap-3">
              <span className="self-start bg-[#d4af37] text-[#0b1c3e] font-extrabold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-full">
                {tour.category} Yatra
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white drop-shadow-md">{tour.title}</h1>
              
              <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-200 mt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#d4af37]" /> {tour.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#d4af37]" /> {tour.duration}</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" /> {tour.rating} (Verified Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side details */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Overview */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#0b1c3e] mb-2">Overview</h2>
                <div className="w-10 h-1 bg-[#d4af37] rounded mb-5" />
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">{tour.description}</p>
              </div>

              {/* Inclusions */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#0b1c3e] mb-2">What's Included</h2>
                <div className="w-10 h-1 bg-[#d4af37] rounded mb-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-3 font-semibold text-slate-700 text-sm">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#0b1c3e] mb-2">Day-by-Day Itinerary</h2>
                <div className="w-10 h-1 bg-[#d4af37] rounded mb-5" />
                
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-100">
                  {tour.itinerary.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDay(idx)}
                      className={`py-2 px-5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
                        activeDay === idx 
                          ? "bg-[#0b1c3e] text-white" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Day {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-[#d4af37]">
                  <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-2">
                    {tour.itinerary[activeDay].title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {tour.itinerary[activeDay].details}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side floating cards */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
              {/* Pricing details */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Starting Price</span>
                <div className="flex items-center justify-center text-3xl font-extrabold text-[#0b1c3e]">
                  <IndianRupee className="w-6 h-6 text-[#0b1c3e]" />
                  <span>{tour.price.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-1">/ person</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">All taxes, basic hotels & transportation included</p>

                <div className="flex flex-col gap-3 mt-6">
                  <button onClick={handleWhatsAppInquiry} className="w-full py-3.5 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition">
                    <MessageCircle className="w-4 h-4 fill-white" /> Chat on WhatsApp
                  </button>
                  <a href="tel:+917079044000" className="w-full py-3.5 rounded-xl border-2 border-[#0b1c3e] text-[#0b1c3e] hover:bg-[#0b1c3e] hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition">
                    <Phone className="w-4 h-4" /> Call Specialist
                  </a>
                </div>
              </div>

              {/* Quick Inquiry Form */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-slate-800">
                <h3 className="font-heading font-extrabold text-base text-[#0b1c3e] mb-1">Inquire About This Tour</h3>
                <p className="text-xs text-slate-400 mb-5">Share travel dates to get details & pricing.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0b1c3e]">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Priya Sharma"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0b1c3e]">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="E.g. +91 99999 99999"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0b1c3e]">Preferred Travel Date</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition shadow-lg">
                    {isSubmitting ? "Sending..." : "Request Call Back"} <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
