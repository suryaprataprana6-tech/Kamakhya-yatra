import type { Metadata } from "next";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Eye, Database, Share2, Mail, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Kamakhya Yatra",
  description: "Learn about how Kamakhya Yatra collects, uses, stores, and protects your personal data when booking tour packages.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: Eye,
      content: "We collect personal information necessary to process your yatra bookings, customize travel plans, and maintain communication. This includes: Full Name, Phone Number, Email Address, Preferred Travel Dates, Number of Guests, and Special Travel Requests. When booking transportation, flights, train tickets, or inner-line permits, we may also collect official identification documents like Aadhaar Card, Passport, or Voter ID as required by government regulations and travel suppliers."
    },
    {
      title: "2. How We Use Your Data",
      icon: ShieldCheck,
      content: "Your data is used primarily to manage and deliver high-quality travel services. We use it to: (a) Book hotels, tickets, cabs, and obtain necessary permits on your behalf. (b) Send booking vouchers, trip itineraries, updates, and customer support messages via email or WhatsApp. (c) Plan and personalize custom itineraries based on your preferences. (d) Respond to inquiries, forms submitted, and request call backs."
    },
    {
      title: "3. Data Storage & Security",
      icon: Database,
      content: "We implement appropriate physical, technical, and administrative security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. Government-issued IDs collected for permitting and ticket bookings are deleted or securely stored after the completion of your yatra, in accordance with applicable retention rules."
    },
    {
      title: "4. Sharing Information with Third Parties",
      icon: Share2,
      content: "Kamakhya Yatra does not sell, trade, rent, or monetize your personal data to marketing agencies or third parties. We share traveler details with trusted partners and vendors (hotels, airlines, railway authorities, cab suppliers, local coordinators) strictly for booking, logistics, and permit issuance. These suppliers are authorized to use your information only as necessary to provide their respective services."
    },
    {
      title: "5. Your Rights & Choice",
      icon: ShieldCheck,
      content: "You have the right to request access to the personal data we hold about you, request corrections to incorrect details, or ask us to delete your personal data (provided it is not required to complete active travel bookings, tax records, or compliance checks). You can opt-out of promotional communications or WhatsApp alerts at any time."
    },
    {
      title: "6. Privacy Concerns & Contact Information",
      icon: Mail,
      content: "If you have any questions, comments, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please feel free to reach out to us directly. Our data compliance coordinator will address your queries. You can contact us at: kamakhyayatra19@gmail.com."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Privacy Standards</span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading mb-4">Privacy Policy</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              We respect your privacy. This policy explains how we collect, store, share, and protect your personal information when using our travel services.
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold mt-6">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span>Last Updated: July 11, 2026</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-6 max-w-4xl mx-auto">
          <div className="flex flex-col gap-8 bg-white border border-slate-200/60 shadow-xl rounded-3xl p-6 md:p-10 text-sm md:text-base leading-relaxed text-slate-600">
            
            {/* Introduction */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-lg font-extrabold text-[#0b1c3e] mb-2 font-heading">Data Protection Commitment</h2>
              <p>
                At Kamakhya Yatra (www.kamakhyayatra.com), we are committed to safeguarding your privacy. We collect only the data required to facilitate premium spiritual, holiday, and international tours, ensuring full transparency in how your credentials are handled.
              </p>
            </div>

            {/* Privacy Content Blocks */}
            <div className="flex flex-col gap-6">
              {sections.map((sec, idx) => {
                const IconComponent = sec.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#0b1c3e]/5 border border-[#0b1c3e]/10 flex items-center justify-center text-[#d4af37] shrink-0 mt-1">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-[#0b1c3e] mb-2">{sec.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{sec.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support Box */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 mt-6 text-center">
              <h3 className="font-heading font-extrabold text-[#0b1c3e] text-sm md:text-base uppercase tracking-wider mb-2">
                Have questions about your data?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Please contact our helpdesk. We will resolve your request or provide access to your records promptly.
              </p>
              <a 
                href="mailto:kamakhyayatra19@gmail.com" 
                className="inline-flex items-center gap-2 bg-[#0b1c3e] hover:bg-[#1e3c72] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow"
              >
                Email Support Team
              </a>
            </div>
            
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
