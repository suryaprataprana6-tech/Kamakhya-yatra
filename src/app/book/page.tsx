"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { packagesData } from "@/data/packages";
import { Send, MapPin, Calendar, Users, Phone, User, Mail, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sendInquiryToWhatsApp } from "@/utils/whatsapp";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugParam = searchParams.get("slug") || searchParams.get("dest");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    package: "",
    date: "",
    guests: "2",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slugParam) {
      // Find matches by slug or matching title
      const match = packagesData.find(p => p.slug === slugParam || p.title.toLowerCase().includes(slugParam.toLowerCase()));
      if (match) {
        setFormData(prev => ({ ...prev, package: match.title }));
      } else {
        setFormData(prev => ({ ...prev, package: slugParam }));
      }
    } else if (packagesData.length > 0) {
      setFormData(prev => ({ ...prev, package: packagesData[0].title }));
    }
  }, [slugParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please fill in your name and phone number.");
      return;
    }

    setIsSubmitting(true);

    // Redirect to WhatsApp
    sendInquiryToWhatsApp({
      name: formData.name,
      phone: formData.phone,
      package: formData.package,
      date: formData.date,
      guests: formData.guests,
      email: formData.email,
      message: formData.message
    });

    setTimeout(() => {
      alert("Redirecting to WhatsApp to send your inquiry... Please click 'Send' in the WhatsApp chat.");
      setIsSubmitting(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        package: packagesData.length > 0 ? packagesData[0].title : "",
        date: "",
        guests: "2",
        message: ""
      });
      router.push("/");
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Form Side */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-100">
        <h2 className="text-2xl font-extrabold text-[#0b1c3e] mb-6 pb-4 border-b border-slate-100">Booking Inquiry Form</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Phone Number</label>
              <input
                type="tel"
                required
                placeholder="Enter your mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email Address (Optional)</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Select Yatra Package</label>
              <select
                value={formData.package}
                onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent"
              >
                {packagesData.map((pkg) => (
                  <option key={pkg.id} value={pkg.title}>
                    {pkg.title} ({pkg.duration})
                  </option>
                ))}
                <option value="Custom Plan">Custom / Other Plan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Preferred Travel Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> Number of Guests</label>
              <input
                type="number"
                min="1"
                required
                placeholder="2 Adults"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-slate-400" /> Special Requests / Message</label>
            <textarea
              rows={4}
              placeholder="Share any details like hotel preferences, child seats, extra sightseeing..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition hover:scale-[1.01] shadow-lg shadow-[#0b1c3e]/10">
            {isSubmitting ? "Submitting Request..." : "Submit Yatra Request"} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Info/Support Side */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-4 border-l-4 border-[#d4af37] pl-3">Why Book With Us?</h3>
          <ul className="flex flex-col gap-5 text-sm">
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">Direct Coordinator Support:</strong>
              <span className="text-slate-500">You will get a dedicated manager on the ground to guide your darshan timings or travel plan.</span>
            </li>
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">Tailored Customizations:</strong>
              <span className="text-slate-500">Adjust your travel dates, hotel levels (3-Star to 5-Star), and pick-up spots freely.</span>
            </li>
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">Safe & Secure Travel:</strong>
              <span className="text-slate-500">Senior citizen care, medical emergency checkups, and certified clean drivers.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-2 border-l-4 border-[#d4af37] pl-3">Have Questions?</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">Speak directly to our travel desk coordinator. We are available 24/7 to resolve booking queries.</p>
          <div className="flex flex-col gap-3">
            <a href="tel:+917079044000" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-[#0b1c3e] transition">
              <Phone className="w-5 h-5 text-[#0b1c3e] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Call Specialist</span>
                <strong className="text-sm font-extrabold text-[#0b1c3e]">+91 70790 44000</strong>
              </div>
            </a>
            <a
              href="https://wa.me/917079044000?text=Hi,%20I'm%20planning%20a%20yatra%20and%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-emerald-100 hover:border-emerald-500 transition text-[#27ae60]"
            >
              <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Chat on WhatsApp</span>
                <strong className="text-sm font-extrabold">+91 70790 44000</strong>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookTour() {
  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading mb-4">Book Your Yatra</h1>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              Fill out the form below to plan your sacred or leisure journey. Our experts will design the perfect itinerary for you.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bold">Loading booking form...</div>}>
            <BookingFormContent />
          </Suspense>
        </div>
      </div>

      <Footer />
    </div>
  );
}
