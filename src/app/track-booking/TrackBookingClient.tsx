"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Phone, ShieldCheck, Clock, CheckCircle2, AlertTriangle, User, Mail, CreditCard, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackBookingRequest } from "@/app/admin/actions";

function TrackBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const refParam = searchParams.get("ref") || "";
  const phoneParam = searchParams.get("phone") || "";

  const [bookingRef, setBookingRef] = useState(refParam);
  const [phone, setPhone] = useState(phoneParam);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrackSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingRef.trim() || !phone.trim()) {
      setError("Please fill in both the Booking Reference and Phone Number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await trackBookingRequest(bookingRef, phone);
      if (res.success && res.data) {
        setBooking(res.data);
        // Sync URL params for sharing/refreshing
        router.replace(`/track-booking?ref=${encodeURIComponent(bookingRef)}&phone=${encodeURIComponent(phone)}`);
      } else {
        setBooking(null);
        setError(res.error || "No booking request found matching details.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tracking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically if params are supplied in the URL query
  useEffect(() => {
    if (refParam && phoneParam) {
      handleTrackSubmit();
    }
  }, [refParam, phoneParam]);

  // Steps helper for status progress bar
  const statusSteps = ["Pending", "Contacted", "Payment Awaiting", "Payment Received", "Confirmed", "Completed"];
  const currentStatusIndex = booking ? statusSteps.indexOf(booking.booking_status) : -1;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Tracker Form Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md mb-8">
        <h2 className="text-xl font-extrabold text-[#0b1c3e] mb-2 flex items-center gap-2">
          <span>🔍</span> Track Booking Status
        </h2>
        <p className="text-xs text-slate-400 mb-6">Enter your registered booking details to fetch real-time coordination updates.</p>

        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c3e]">Booking Reference</label>
            <input 
              type="text" 
              placeholder="E.g. KY-BKG-2026-000001"
              required
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value.trim().toUpperCase())}
              className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c3e]">Phone Number</label>
            <input 
              type="tel" 
              placeholder="Registered Mobile Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.trim())}
              className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl text-sm transition duration-200"
          >
            {loading ? "Searching..." : "Fetch Booking Details"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Booking Details Display */}
      {booking && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="bg-[#0b1c3e] text-white p-8 border-b border-[#d4af37]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] text-[#d4af37] font-extrabold uppercase tracking-widest">Active Reference ID</span>
              <h3 className="text-2xl font-extrabold font-heading text-white">{booking.booking_reference}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-300 font-bold">Created On:</span>
              <span className="text-xs text-slate-100 font-semibold">{new Date(booking.created_at).toLocaleDateString("en-IN")}</span>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-8">
            {/* Status Steps Progress Tracker */}
            {booking.booking_status === "Cancelled" ? (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-center gap-3 text-rose-700">
                <AlertTriangle className="w-8 h-8 shrink-0 text-rose-500" />
                <div>
                  <h4 className="font-bold text-sm">Booking Request Cancelled</h4>
                  <p className="text-xs text-rose-600/80 leading-normal mt-0.5">This booking has been cancelled. For refunds, please contact our cancellation helpdesk.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">Processing Timeline</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {statusSteps.map((stepName, idx) => {
                    const isCompleted = idx <= currentStatusIndex;
                    const isActive = idx === currentStatusIndex;
                    return (
                      <div key={stepName} className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                          isCompleted 
                            ? "bg-[#0b1c3e] border-[#0b1c3e] text-white" 
                            : "bg-white border-slate-200 text-slate-400"
                        } ${isActive ? "ring-4 ring-[#d4af37]/35" : ""}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 leading-tight ${
                          isActive ? "text-[#d4af37]" : isCompleted ? "text-[#0b1c3e]" : "text-slate-400"
                        }`}>{stepName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
              {/* Pilgrim details */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"><User className="w-4 h-4 text-[#d4af37]" /> Pilgrim Information</h4>
                
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Customer Name:</span>
                    <strong className="text-slate-700">{booking.customer_name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mobile Number:</span>
                    <strong className="text-slate-700">{booking.phone}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Email Address:</span>
                    <strong className="text-slate-700 text-xs truncate max-w-[200px]">{booking.email}</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <span className="text-slate-400">Boarding Point:</span>
                    <strong className="text-slate-700 text-xs">{booking.boarding_point}</strong>
                  </div>
                </div>
              </div>

              {/* Package & Billing details */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-[#d4af37]" /> Tour &amp; Billing Details</h4>
                
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Yatra Package:</span>
                    <strong className="text-[#0b1c3e] truncate max-w-[200px]">{booking.package_name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Travel Date:</span>
                    <strong className="text-slate-700">{new Date(booking.travel_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pilgrim Count:</span>
                    <strong className="text-slate-700">{booking.number_of_travellers} Persons</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      booking.payment_status === "Paid" 
                        ? "bg-emerald-50 text-emerald-600" 
                        : booking.payment_status === "Payment Submitted" 
                        ? "bg-amber-50 text-amber-600" 
                        : "bg-slate-100 text-slate-500"
                    }`}>{booking.payment_status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions & Admin updates */}
            {booking.special_requirements && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <strong className="text-[#0b1c3e] block mb-1">Your Special Requirements:</strong>
                <p className="text-slate-500">{booking.special_requirements}</p>
              </div>
            )}
            
            {booking.assigned_staff && (
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 p-4 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ASSIGNED COORDINATOR:</span>
                  <strong className="text-[#0b1c3e] font-extrabold">{booking.assigned_staff}</strong>
                </div>
                <span className="text-[9px] text-[#d4af37] font-extrabold tracking-wider uppercase">Direct Contact Active</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackBooking() {
  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero */}
        <div className="bg-[#0b1c3e] text-white py-12 px-6 text-center border-b border-[#d4af37]/20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-extrabold font-heading mb-2">Pilgrim Live Tracking</h1>
            <p className="text-xs md:text-sm text-slate-300">
              Check verification benchmarks, payment status, and coordinator assignments online.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bold">Loading tracking portal...</div>}>
          <TrackBookingContent />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}
