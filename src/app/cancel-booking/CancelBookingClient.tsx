"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Send, CheckCircle2, AlertCircle, Calendar, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { submitCancellationRequest } from "@/app/admin/actions";

export default function CancelBookingClient() {
  const [formData, setFormData] = useState({
    bookingId: "",
    customerName: "",
    phone: "",
    email: "",
    packageName: "",
    travelDate: "",
    cancellationReason: "",
    refundPolicyAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Front-end validations
    if (!formData.bookingId.trim()) {
      setErrorMessage("Booking ID is required.");
      return;
    }
    if (!formData.customerName.trim()) {
      setErrorMessage("Customer name is required.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("A valid phone number with at least 10 digits is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("A valid email address is required.");
      return;
    }
    if (!formData.packageName.trim()) {
      setErrorMessage("Package name is required.");
      return;
    }
    if (!formData.travelDate.trim()) {
      setErrorMessage("Travel date is required.");
      return;
    }
    if (!formData.cancellationReason.trim()) {
      setErrorMessage("Cancellation reason is required.");
      return;
    }
    if (!formData.refundPolicyAccepted) {
      setErrorMessage("You must accept the Refund Policy guidelines to submit your cancellation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCancellationRequest({
        bookingId: formData.bookingId,
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        packageName: formData.packageName,
        travelDate: formData.travelDate,
        cancellationReason: formData.cancellationReason,
        refundPolicyAccepted: formData.refundPolicyAccepted,
      });

      if (result.success) {
        setSuccess(true);
        
        // Trigger Admin WhatsApp Notification workflow (visitor redirect)
        const waText = `Booking Cancellation Request - Kamakhya Yatra\n\n` +
          `Booking ID: ${formData.bookingId.trim()}\n` +
          `Customer Name: ${formData.customerName.trim()}\n` +
          `Phone: ${formData.phone.trim()}\n` +
          `Email: ${formData.email.trim()}\n` +
          `Package: ${formData.packageName.trim()}\n` +
          `Travel Date: ${formData.travelDate.trim()}\n` +
          `Reason: ${formData.cancellationReason.trim()}`;
        
        const whatsappUrl = `https://wa.me/917079044000?text=${encodeURIComponent(waText)}`;
        
        // Open WhatsApp redirect in new window
        window.open(whatsappUrl, "_blank");

        // Clear Form
        setFormData({
          bookingId: "",
          customerName: "",
          phone: "",
          email: "",
          packageName: "",
          travelDate: "",
          cancellationReason: "",
          refundPolicyAccepted: false,
        });
      } else {
        setErrorMessage(result.error || "An error occurred while submitting your request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Section */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1920&q=80')" }} />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">Booking Assistance</span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">Request Booking Cancellation</h1>
            <p className="text-amber-400 font-heading text-lg md:text-xl font-semibold mb-4">बुकिंग रद्दीकरण अनुरोध</p>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              If you wish to cancel or modify your travel plan, please submit your booking details. Your request will be reviewed under our refund policy guidelines.
            </p>
          </div>
        </section>

        {/* Form and Guide Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
            
            {/* Guide Info Panel */}
            <div className="lg:col-span-5 bg-[#0b1c3e] text-white p-8 md:p-12 flex flex-col justify-between gap-10 relative">
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col gap-6">
                <h2 className="font-heading font-extrabold text-2xl text-white">Cancellation Guidelines</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Please review the refund guidelines and requirements before submitting your cancellation.
                </p>
              </div>

              {/* Guide Points */}
              <div className="flex flex-col gap-8 z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">Refund Processing Window</h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Approved refunds may take up to 120 calendar days to process due to airline, railway, and hotel vendor settlements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">Policy Acceptance</h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      All cancellations are governed by the exclusive jurisdiction of competent courts located in Ranchi, Jharkhand.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">Support Helpdesk</h3>
                    <p className="text-slate-300 text-xs mt-1">
                      Need help? Reach out directly via +91 70790 44000 or email us at kamakhyayatra19@gmail.com.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#d4af37] font-bold border-t border-white/15 pt-6">
                🕉 Assisting your spiritual journey with complete compliance.
              </div>
            </div>

            {/* Form Input Panel */}
            <div className="lg:col-span-7 p-8 md:p-12">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl text-[#0b1c3e] mb-3">Request Received Successfully!</h2>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
                    Namaste, your booking cancellation request has been saved. A confirmation email has been dispatched. 
                  </p>
                  <p className="text-slate-400 text-xs max-w-sm mb-8">
                    We are redirecting you to WhatsApp to connect with our Ranchi travel coordinator desk. You can check the status of your refund directly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button 
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#0b1c3e] font-extrabold text-sm rounded-xl transition"
                    >
                      Submit Another Request
                    </button>
                    <a 
                      href="https://wa.me/917079044000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
                    >
                      Connect on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-heading font-extrabold text-2xl text-[#0b1c3e] mb-2">Submit Cancellation</h2>
                  <p className="text-slate-400 text-xs font-semibold mb-8">
                    All fields are mandatory. Submitting the form will automatically create a ticket and notify our support managers.
                  </p>

                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex gap-2.5 items-start">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* Booking ID */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="bookingId" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Booking ID</label>
                      <input 
                        type="text" 
                        id="bookingId"
                        required
                        placeholder="E.g. KY-2026-1049"
                        value={formData.bookingId}
                        onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                        className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                      />
                    </div>

                    {/* Customer Name */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="customerName" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Customer Name</label>
                      <input 
                        type="text" 
                        id="customerName"
                        required
                        placeholder="E.g. Ramesh Chandra"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                      />
                    </div>

                    {/* Contact Number & Email address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Mobile Number</label>
                        <input 
                          type="tel" 
                          id="phone"
                          required
                          placeholder="E.g. 99999 99999"
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
                          placeholder="E.g. ramesh@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                        />
                      </div>
                    </div>

                    {/* Package Name & Travel Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="packageName" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Package Name</label>
                        <input 
                          type="text" 
                          id="packageName"
                          required
                          placeholder="E.g. Kamakhya VIP Tour 4D3N"
                          value={formData.packageName}
                          onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                          className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="travelDate" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Travel Date</label>
                        <input 
                          type="text" 
                          id="travelDate"
                          required
                          placeholder="E.g. Oct 12, 2026 or DD-MM-YYYY"
                          value={formData.travelDate}
                          onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                          className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="cancellationReason" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Reason for Cancellation</label>
                      <textarea 
                        id="cancellationReason" 
                        required
                        rows={4}
                        placeholder="Please describe the detailed reason for your booking cancellation..."
                        value={formData.cancellationReason}
                        onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                        className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition resize-none"
                      />
                    </div>

                    {/* Refund Policy Checkbox */}
                    <div className="flex items-start gap-3 bg-amber-50/45 p-4 rounded-xl border border-amber-200/50">
                      <input 
                        type="checkbox" 
                        id="refundPolicyAccepted" 
                        required
                        checked={formData.refundPolicyAccepted}
                        onChange={(e) => setFormData({ ...formData, refundPolicyAccepted: e.target.checked })}
                        className="mt-1 accent-[#0b1c3e]"
                      />
                      <label htmlFor="refundPolicyAccepted" className="text-xs font-semibold text-slate-700 leading-relaxed select-none">
                        I hereby declare that I have read, understood and agree to be bound by the tour{" "}
                        <Link href="/refund-policy" target="_blank" className="text-[#0b1c3e] underline font-bold">
                          Refund & Cancellation Policy
                        </Link>
                        . I acknowledge that customer-initiated refunds are not automatically guaranteed and remain at the sole discretion of Kamakhya Yatra.
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 shadow-lg shadow-[#0b1c3e]/10"
                    >
                      {isSubmitting ? "Submitting Request..." : "Submit Cancellation Request"} 
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
