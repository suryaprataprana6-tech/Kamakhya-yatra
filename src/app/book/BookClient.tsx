"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, MapPin, Calendar, Users, Phone, User, Mail, MessageSquare, CheckCircle, Copy, Upload, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitBookingRequest, submitBookingPayment } from "@/app/admin/actions";

function BookingFormContent({ packages }: { packages: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageParam = searchParams.get("package") || searchParams.get("slug") || searchParams.get("dest");

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState(5000);

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    package: "",
    date: "",
    guests: "1",
    specialRequirements: "",
    termsAccepted: false
  });

  // Step 2 Form Data
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (packageParam) {
      const match = packages.find(p => p.slug === packageParam || p.title.toLowerCase().includes(packageParam.toLowerCase()));
      if (match) {
        setFormData(prev => ({ ...prev, package: match.title }));
      } else {
        setFormData(prev => ({ ...prev, package: packageParam }));
      }
    } else if (packages.length > 0) {
      setFormData(prev => ({ ...prev, package: prev.package?.trim() || packages[0].title }));
    }
  }, [packageParam, packages]);

  // Handle Step 1 details submission
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPackageName = formData.package?.trim() || packages[0]?.title || "Custom Plan";
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.date || !formData.termsAccepted) {
      alert("Please fill all required fields and accept the Terms & Conditions.");
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      alert("Please enter a valid 10-15 digit phone number.");
      return;
    }

    setIsSubmitting(true);
    const selectedPkg = packages.find(p => p.title === normalizedPackageName);

    try {
      const res = await submitBookingRequest({
        customerName: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        packageName: normalizedPackageName,
        packageId: selectedPkg ? selectedPkg.id : undefined,
        travelDate: formData.date,
        boardingPoint: "Guwahati Airport / Railway Station",
        numberOfTravellers: parseInt(formData.guests) || 1,
        specialRequirements: formData.specialRequirements.trim() || undefined,
        source: "booking_crm_form",
        pageUrl: window.location.href
      });

      if (res.success && res.id && res.booking_reference) {
        setBookingId(res.id);
        setBookingRef(res.booking_reference);
        setAdvanceAmount(res.advance_amount || 5000);
        setStep(2);
      } else {
        alert("Failed to submit request: " + (res.error || "Please try again."));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy UPI details
  const copyUPI = () => {
    navigator.clipboard.writeText("7079044000-3@ybl");
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle image preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // Handle Step 2 payment details submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !transactionId || !screenshotFile) {
      alert("Please enter the Transaction ID and upload the payment screenshot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = new FormData();
      paymentData.append("screenshot", screenshotFile);

      const res = await submitBookingPayment(bookingId, transactionId, paymentData);
      if (res.success) {
        setStep(3);
      } else {
        alert("Payment submission failed: " + (res.error || "Please verify your inputs."));
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during payment uploading.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Form Wizard Side */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-100 min-h-[500px] flex flex-col justify-between">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#0b1c3e]" : ""}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${step >= 1 ? "bg-[#0b1c3e]" : "bg-slate-200"}`}>1</span>
            <span>Travel Details</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-100" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#0b1c3e]" : ""}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${step >= 2 ? "bg-[#0b1c3e]" : "bg-slate-200"}`}>2</span>
            <span>Advance Payment</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-100" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#0b1c3e]" : ""}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${step >= 3 ? "bg-[#0b1c3e]" : "bg-slate-200"}`}>3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* STEP 1: Details Form */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-6">
            <h2 className="text-2xl font-extrabold text-[#0b1c3e] mb-2">Configure Your Journey</h2>
            <p className="text-xs text-slate-400 mb-4">Provide travel specifications to generate your unique booking request record.</p>

            <div className="bg-[#0b1c3e]/5 border border-[#0b1c3e]/10 p-4 rounded-xl flex justify-between items-center text-xs">
              <span className="font-bold text-[#0b1c3e]">Advance Booking Amount:</span>
              <strong className="text-sm font-extrabold text-[#d4af37]">₹5,000 (Advance token deposit)</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter traveler's name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter email for booking updates"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Choose Yatra Package</label>
                <select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-transparent"
                >
                  {packages.map((pkg) => (
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
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Travel Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> Number of Travellers</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-slate-400" /> Special Requirements (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention hotel preferences, dietary specifications, transport customization..."
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
              ></textarea>
            </div>

            <div className="flex items-start gap-2.5 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-0.5 accent-[#0b1c3e]" 
              />
              <label htmlFor="terms" className="cursor-pointer select-none">
                I agree to the <strong>Terms &amp; Conditions</strong> and cancellation/refund policy of Kamakhya Yatra. I verify that the travel dates and pilgrim counts supplied are correct.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition duration-200 shadow-lg shadow-[#0b1c3e]/10"
            >
              {isSubmitting ? "Generating Booking Reference..." : "Confirm & Proceed to Payment"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Payment Portal */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
            <div className="bg-[#0b1c3e]/5 p-6 rounded-2xl border border-[#0b1c3e]/10 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>BOOKING REFERENCE:</span>
                <span className="text-[#0b1c3e]">{bookingRef}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-3">
                <span className="text-sm font-bold text-[#0b1c3e]">Advance Booking Amount:</span>
                <strong className="text-xl font-extrabold text-[#d4af37]">₹{advanceAmount.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#0b1c3e] border-l-4 border-[#d4af37] pl-3">UPI Payment Instructions</h3>
            <p className="text-xs text-slate-500 leading-relaxed -mt-3">
              To lock in your booking, please scan the QR code or transfer the advance amount to the official UPI ID. Once paid, input the transaction ID and upload the receipt screenshot below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex flex-col items-center gap-2 border-r border-slate-200/60 max-sm:border-r-0 max-sm:border-b max-sm:pb-4 max-sm:mb-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Official Merchant UPI ID</span>
                <strong className="text-sm text-[#0b1c3e]">7079044000-3@ybl</strong>
                <button 
                  type="button" 
                  onClick={copyUPI} 
                  className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#b8952d] font-bold border border-[#d4af37]/20 bg-white px-3 py-1.5 rounded-lg transition"
                >
                  <Copy className="w-3 h-3" /> {copySuccess ? "Copied!" : "Copy UPI ID"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <span className="text-[11px] font-bold text-[#0b1c3e]">Secure Direct Banking</span>
                <p className="text-[10px] text-slate-400 max-w-[200px]">Direct-to-bank instant validation avoids third-party gateway gateway delays.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Screenshot Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5"><Upload className="w-4 h-4 text-slate-400" /> Payment Screenshot</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#0b1c3e] transition bg-slate-50/30 min-h-[140px]">
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={screenshotPreview} alt="Screenshot Preview" className="h-20 object-contain rounded-lg shadow" />
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{screenshotFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300" />
                      <span className="text-[10px] text-slate-400 text-center font-bold">PNG, JPG or WEBP (Max 5MB)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    required 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex flex-col justify-end gap-2">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5">Transaction ID / UTR</label>
                <input
                  type="text"
                  required
                  placeholder="Enter 12-digit UTR/Txn Number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.trim())}
                  className="p-3 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm bg-slate-50/50"
                />
                <span className="text-[9px] text-slate-400 leading-tight">Usually found in GooglePay, PhonePe, or Paytm receipt header.</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition duration-200 shadow-lg shadow-[#0b1c3e]/10"
            >
              {isSubmitting ? "Uploading Receipt Details..." : "Submit Payment for Verification"} <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="w-20 h-20 text-[#d4af37] mb-6 animate-pulse" />
            <h2 className="text-3xl font-extrabold text-[#0b1c3e] mb-3">Booking Request Submitted!</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Namaste {formData.name}, your travel booking details and payment verification are successfully recorded.
            </p>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl w-full max-w-sm mb-8 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">YOUR UNIQUE BOOKING ID:</span>
              <strong className="text-2xl font-extrabold text-[#d4af37] tracking-wider">{bookingRef}</strong>
              <span className="text-[10px] text-slate-400 mt-2 font-bold leading-normal">
                Please save this Booking ID. An email receipt confirmation has been dispatched to <strong>{formData.email}</strong>.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => router.push(`/track-booking?ref=${bookingRef}&phone=${formData.phone}`)}
                className="px-8 py-3.5 rounded-xl bg-[#0b1c3e] text-white font-extrabold text-sm hover:bg-[#1e3c72] transition"
              >
                Track Booking Status
              </button>
              <button 
                onClick={() => router.push("/")}
                className="px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Side Tips Info */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-4 border-l-4 border-[#d4af37] pl-3">Booking Helpdesk</h3>
          <ul className="flex flex-col gap-5 text-sm">
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">1. Advance Payment Setup</strong>
              <span className="text-slate-500">Every luxury tour requires a minimum ₹5,000 per booking request to trigger backend reservations.</span>
            </li>
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">2. Quick Verification</strong>
              <span className="text-slate-500">Manual transaction uploads are verified within 2 to 4 business hours by our billing accounts manager.</span>
            </li>
            <li>
              <strong className="block text-[#0b1c3e] mb-1 font-bold">3. Transparent Refund Guarantee</strong>
              <span className="text-slate-500">Full or partial cancellations are handled smoothly via your tracking portal based on active holiday policy.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-heading font-extrabold text-lg text-[#0b1c3e] mb-2 border-l-4 border-[#d4af37] pl-3">Helpline Channels</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">Need assistance during transaction submissions? Speak directly to our travel coordinator.</p>
          <div className="flex flex-col gap-3">
            <a href="tel:+917079044000" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-[#0b1c3e] transition">
              <Phone className="w-5 h-5 text-[#0b1c3e] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Call Support Desk</span>
                <strong className="text-sm font-extrabold text-[#0b1c3e]">+91 70790 44000</strong>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookTour({ initialPackages }: { initialPackages: any[] }) {
  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading mb-4">Book Your Yatra</h1>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              Plan and lock in your pilgrimage or holiday tour package instantly using our manual secure UPI checkout.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bold">Loading booking form...</div>}>
            <BookingFormContent packages={initialPackages} />
          </Suspense>
        </div>
      </div>

      <Footer />
    </div>
  );
}
