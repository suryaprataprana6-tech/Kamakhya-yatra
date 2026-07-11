"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Send, Check } from "lucide-react";
import { sendInquiryToWhatsApp } from "@/utils/whatsapp";

export default function ContactUsClient() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Inquiry about Spiritual Tour",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please enter both Name and Phone Number.");
      return;
    }

    setSubmitted(true);
    
    // Redirect to WhatsApp
    sendInquiryToWhatsApp({
      name: formData.name,
      phone: formData.phone,
      package: formData.subject,
      email: formData.email,
      message: formData.message
    });

    setTimeout(() => {
      alert("Redirecting to WhatsApp to send your inquiry... Please click 'Send' in the WhatsApp chat.");
      setSubmitted(false);
      setFormData({ name: "", phone: "", email: "", subject: "Inquiry about Spiritual Tour", message: "" });
    }, 500);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Banner */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14272de?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Connect With Us</span>
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading mb-4">Contact Our Team</h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Have questions about our yatra packages or wish to customize your itinerary? Speak with our luxury travel specialists today.
            </p>
          </div>
        </section>

        {/* Contact Info and Form Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
            {/* Info panel */}
            <div className="lg:col-span-5 bg-[#0b1c3e] text-white p-8 md:p-12 flex flex-col justify-between gap-10 relative">
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-extrabold text-2xl text-white">Get In Touch</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Our dedicated travel consultants are available 24/7 to plan, coordinate, and guide your journey.
                </p>
              </div>

              {/* Detail Items */}
              <div className="flex flex-col gap-8 z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-white">Our Office</h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      2nd Floor, Keshri Height, Opp. Manyavar Shop, Ratu Road, Ranchi, Jharkhand
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-white">Phone Number</h3>
                    <p className="text-slate-300 text-xs mt-1">
                      +91 70790 44000
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-white">Email Address</h3>
                    <p className="text-slate-300 text-xs mt-1">
                      kamakhyayatra19@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-bold border-t border-white/15 pt-6">
                👍 Over 10,000+ happy pilgrims guided since 2011.
              </div>
            </div>

            {/* Form panel */}
            <div className="lg:col-span-7 p-8 md:p-12">
              <h2 className="font-heading font-extrabold text-2xl text-[#0b1c3e] mb-2">Send a Message</h2>
              <p className="text-slate-400 text-xs font-semibold mb-8">
                Fill out the form below. We will automatically connect you to our Ranchi office support desk via WhatsApp.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    placeholder="E.g. Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone"
                    required
                    placeholder="E.g. +91 99999 99999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    placeholder="E.g. rajesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Interested Service</label>
                  <select 
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition text-slate-700 bg-transparent"
                  >
                    <option value="Inquiry about Spiritual Tour">🕉 Spiritual / Dharmic Pilgrimage</option>
                    <option value="Inquiry about Holiday Packages">🌴 Domestic / Desh Darshan Holiday</option>
                    <option value="Inquiry about International Tour">✈ International / Videsh Yatra</option>
                    <option value="Custom Itinerary Inquiry">🛠 Custom Tour Planning</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Your Message</label>
                  <textarea 
                    id="message" 
                    required
                    rows={4}
                    placeholder="Describe your travel dates, passenger count, and any custom requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitted}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-[#a0aec0] text-white font-bold py-4 mt-2 transition shadow-lg hover:shadow-xl duration-200"
                >
                  {submitted ? (
                    <>
                      <Check className="w-5 h-5" /> Connecting WhatsApp...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Inquiry Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
