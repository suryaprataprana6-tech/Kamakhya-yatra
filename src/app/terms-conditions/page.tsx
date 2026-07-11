"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Scale, FileText, Globe, Landmark, AlertTriangle, Calendar } from "lucide-react";

export default function TermsConditionsPage() {
  const sections = [
    {
      title: "1. Scope & Booking Process",
      icon: Globe,
      content: "By booking a tour with Kamakhya Yatra through our website (www.kamakhyayatra.com), email, WhatsApp, or phone, you enter into a binding contract with us. All bookings are subject to availability and our confirmation. To secure a booking, the required advance payment must be made as specified at the time of reservation. You agree to provide accurate and complete personal details (such as Aadhaar card, ID proofs, names, and contact information) required for permits, ticketing, and hotel reservations."
    },
    {
      title: "2. Payment Terms",
      icon: Landmark,
      content: "All prices quoted are in Indian Rupees (INR) unless stated otherwise. Payments must be processed through company-approved payment methods (bank transfers, UPI, credit/debit cards). An advance deposit is required to confirm your booking, with the balance amount settled according to the payment schedule shared with your booking voucher. Failure to pay the balance on or before the due date may result in automatic cancellation of the booking, and any refund eligibility will be governed by our Refund Policy."
    },
    {
      title: "3. Traveler Responsibilities",
      icon: FileText,
      content: "Travelers are solely responsible for ensuring they possess all necessary legal travel documentation, including valid government-issued ID proofs, permits, and visas. You must verify that you are physically and medically fit to undertake the selected yatra, particularly high-altitude treks like Amarnath or Adi Kailash. It is the traveler's responsibility to adhere to guidelines, local laws, safety standards, and instructions issued by our tour guides, cab operators, or coordinators."
    },
    {
      title: "4. Limitations of Company Liability",
      icon: Scale,
      content: "Kamakhya Yatra acts as an intermediary coordinating with third-party vendors (airlines, railways, hoteliers, cab providers, local guides). While we curate tours with the utmost care, we are not liable for any delays, loss of baggage, injury, illness, death, accidents, or direct/indirect damages caused by vendor service failures, natural obstructions, or actions of third parties beyond our direct control."
    },
    {
      title: "5. Force Majeure & Postponements",
      icon: AlertTriangle,
      content: "We shall not be liable or held responsible for cancellations or adjustments due to force majeure events. This includes, but is not limited to, earthquakes, floods, landslides, cyclones, heavy rainfall, epidemics, pandemics, government restrictions, political unrest, military operations, transport strikes, or airport closures. The terms of postponement and rescheduled alternative dates are outlined in detail in our Refund Policy."
    },
    {
      title: "6. Cancellations & Refund Policy Reference",
      icon: AlertTriangle,
      content: "All terms regarding cancellation charges, refund timelines (up to 120 calendar days), unrecoverable expenses, vendor settlements, and non-refundable circumstances are governed exclusively by our dedicated Refund Policy. By accepting these terms, you confirm that you have read and agreed to the cancelation details. You can view the full policy here: "
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
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Legal Agreement</span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading mb-4">Terms & Conditions</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Please review these terms and conditions carefully before booking. They outline travel commitments, liability terms, and booking guidelines.
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
              <h2 className="text-lg font-extrabold text-[#0b1c3e] mb-2 font-heading">Welcome to Kamakhya Yatra</h2>
              <p>
                These Terms and Conditions govern the relationship between you (the traveler) and Kamakhya Yatra. By accessing our services, paying the booking deposit, or booking through our website (www.kamakhyayatra.com), you agree to comply with and be bound by the terms outlined below.
              </p>
            </div>

            {/* Terms Content Blocks */}
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
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {sec.content}
                        {idx === 5 && (
                          <Link href="/refund-policy" className="text-[#d4af37] font-bold hover:underline">
                            Tour Cancellation & Refund Policy
                          </Link>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Jurisdiction Clause */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 mt-6">
              <h3 className="font-heading font-extrabold text-[#0b1c3e] text-sm md:text-base uppercase tracking-wider mb-2 flex items-center gap-2">
                ⚖️ Legal Jurisdiction & Dispute Resolution
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This contract is governed by and shall be construed in accordance with the laws of the Republic of India. Any dispute, claim, disagreement, legal proceeding, or litigation arising out of the booking, terms, cancellations, or refund requests shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Ranchi, Jharkhand, India</strong>.
              </p>
            </div>

            {/* Contact Details */}
            <div className="text-center pt-8 border-t border-slate-100 text-xs text-slate-400 font-semibold flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
              <span>📧 Email: kamakhyayatra19@gmail.com</span>
              <span>📞 Phone: +91 70790 44000</span>
              <span>🌐 Web: www.kamakhyayatra.com</span>
            </div>
            
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
