"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, MapPin, Calendar, Users, Phone, User, Mail, MessageSquare, CheckCircle, Copy, Upload, ArrowRight, ShieldCheck, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitBookingRequest, submitBookingPayment, getPublicFares } from "@/app/admin/actions";

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
    travelClass: "",
    date: "",
    guests: "1",
    specialRequirements: "",
    termsAccepted: false
  });

  const [fareRule, setFareRule] = useState<any>(null);
  const [packageCost, setPackageCost] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

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

  useEffect(() => {
    async function loadFares() {
      if (formData.package) {
        const res = await getPublicFares(formData.package);
        if (res.success && res.data) {
          setFareRule(res.data);
          if (!formData.travelClass) {
            setFormData(prev => ({ ...prev, travelClass: "Sleeper (SL)" }));
          }
        } else {
          setFareRule(null);
        }
      }
    }
    loadFares();
  }, [formData.package]);

  useEffect(() => {
    if (fareRule && formData.travelClass) {
      let baseCost = 0;
      if (formData.travelClass === "Sleeper (SL)") baseCost = fareRule.sl_fare;
      if (formData.travelClass === "3AC") baseCost = fareRule.sl_fare + fareRule.ac3_extra_charge;
      if (formData.travelClass === "2AC") baseCost = fareRule.sl_fare + fareRule.ac2_extra_charge;
      if (formData.travelClass === "Flight") baseCost = fareRule.flight_fare;
      
      const totalCost = baseCost * (parseInt(formData.guests) || 1);
      const adv = 5000 * (parseInt(formData.guests) || 1);
      setPackageCost(totalCost);
      setAdvanceAmount(adv);
      setBalanceAmount(totalCost - adv);
    } else {
      setAdvanceAmount(5000 * (parseInt(formData.guests) || 1));
      setPackageCost(0);
      setBalanceAmount(0);
    }
  }, [fareRule, formData.travelClass, formData.guests]);

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
        pageUrl: window.location.href,
        travelClass: formData.travelClass || undefined,
        packageCost: packageCost || undefined,
        advanceAmount: advanceAmount || undefined,
        balanceAmount: balanceAmount || undefined
      });

      if (res.success && res.id && res.booking_reference) {
        setBookingId(res.id);
        setBookingRef(res.booking_reference);
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

  const getSelectedServices = () => {
    if (!fareRule) return { hotel: "Standard", meals: "Basic", transport: "Shared Vehicle", support: "Normal" };
    switch (formData.travelClass) {
      case "SL": return fareRule.sl_services || { hotel: "Standard", meals: "Basic", transport: "Shared", support: "Normal" };
      case "3AC": return fareRule.ac3_services || { hotel: "Deluxe", meals: "Standard", transport: "AC Vehicle", support: "Priority" };
      case "2AC": return fareRule.ac2_services || { hotel: "Premium", meals: "Premium", transport: "AC Deluxe", support: "Priority" };
      case "Flight": return fareRule.flight_services || { hotel: "Luxury", meals: "Premium", transport: "Premium AC", support: "VIP" };
      default: return { hotel: "Standard", meals: "Basic", transport: "Shared Vehicle", support: "Normal" };
    }
  };

  const downloadReceipt = () => {
    const services = getSelectedServices();
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Receipt - ${bookingRef}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; padding: 40px; background-color: #f8fafc; }
          .receipt-card { max-width: 750px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
          .header { background-color: #0b1c3e; color: #ffffff; padding: 40px; text-align: center; border-bottom: 5px solid #d4af37; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px; color: #d4af37; }
          .header p { margin: 5px 0 0 0; font-size: 14px; color: #f1f5f9; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 40px; }
          .section-title { font-size: 14px; font-weight: 800; color: #0b1c3e; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; margin-bottom: 20px; }
          .section-title:first-child { margin-top: 0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .row { display: flex; flex-direction: column; gap: 4px; }
          .row-full { grid-column: span 2; display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; flex-direction: row; align-items: center; }
          .label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .value { font-size: 14px; color: #0b1c3e; font-weight: 800; }
          .highlight-row { background: #f8fafc; padding: 15px; border-radius: 12px; margin-top: 10px; }
          .notice { background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 12px; margin-top: 20px; font-size: 12px; color: #b45309; font-weight: 600; text-align: center; }
          .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #64748b; font-weight: 500; border-top: 1px solid #e2e8f0; }
          .print-btn { display: inline-block; margin-top: 30px; background-color: #d4af37; color: #0b1c3e; border: none; padding: 14px 40px; font-size: 13px; font-weight: 800; text-transform: uppercase; border-radius: 12px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.2); }
          .print-btn:hover { background-color: #b8952d; transform: translateY(-2px); }
          @media print { .print-btn { display: none; } body { background: white; padding: 0; } .receipt-card { border: none; box-shadow: none; max-width: 100%; } }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <h1>KAMAKHYA YATRA</h1>
            <p>Official Booking Invoice</p>
          </div>
          <div class="content">
            <div class="section-title">Passenger & Booking Details</div>
            <div class="grid">
              <div class="row">
                <span class="label">Booking ID</span>
                <span class="value">${bookingRef}</span>
              </div>
              <div class="row">
                <span class="label">Booking Status</span>
                <span class="value" style="color: #059669;">Pending Verification</span>
              </div>
              <div class="row">
                <span class="label">Customer Name</span>
                <span class="value">${formData.name}</span>
              </div>
              <div class="row">
                <span class="label">Phone Number</span>
                <span class="value">${formData.phone}</span>
              </div>
              <div class="row">
                <span class="label">Email Address</span>
                <span class="value">${formData.email || "N/A"}</span>
              </div>
              <div class="row">
                <span class="label">Number of Travellers</span>
                <span class="value">${formData.guests} Pax</span>
              </div>
            </div>

            <div class="section-title">Package Details</div>
            <div class="grid">
              <div class="row row-full">
                <span class="label">Package Name</span>
                <span class="value">${formData.package}</span>
              </div>
              <div class="row">
                <span class="label">Travel Class</span>
                <span class="value" style="color: #d4af37;">${formData.travelClass || "Standard"}</span>
              </div>
              <div class="row">
                <span class="label">Travel Date</span>
                <span class="value">${formData.date ? new Date(formData.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}</span>
              </div>
            </div>

            <div class="section-title">Services Included</div>
            <div class="grid">
              <div class="row">
                <span class="label">Hotel Category</span>
                <span class="value">${services.hotel}</span>
              </div>
              <div class="row">
                <span class="label">Meal Category</span>
                <span class="value">${services.meals}</span>
              </div>
              <div class="row">
                <span class="label">Transport Category</span>
                <span class="value">${services.transport}</span>
              </div>
              <div class="row">
                <span class="label">Support</span>
                <span class="value">${services.support}</span>
              </div>
            </div>

            <div class="section-title">Fare Breakdown</div>
            <div class="row row-full">
              <span class="label">Total Package Cost</span>
              <span class="value">₹${packageCost.toLocaleString("en-IN")}</span>
            </div>
            <div class="row row-full highlight-row">
              <span class="label">Advance Booking Amount Paid</span>
              <span class="value" style="color: #059669; font-size: 16px;">₹${advanceAmount.toLocaleString("en-IN")}</span>
            </div>
            <div class="row row-full">
              <span class="label">Balance Due</span>
              <span class="value" style="color: #e11d48; font-size: 16px;">₹${balanceAmount.toLocaleString("en-IN")}</span>
            </div>

            <div class="section-title">Payment Details</div>
            <div class="grid">
              <div class="row">
                <span class="label">Payment Status</span>
                <span class="value" style="color: #d97706;">Pending Verification</span>
              </div>
              <div class="row">
                <span class="label">Transaction ID / UTR</span>
                <span class="value">${transactionId || "N/A"}</span>
              </div>
            </div>

            <div class="notice">
              Remaining balance amount must be paid before journey commencement.
            </div>

            <div style="text-align: center;">
              <button class="print-btn" onclick="window.print()">Download / Print Receipt</button>
            </div>
          </div>
          <div class="footer">
            <strong>Thank you for choosing Kamakhya Yatra.</strong><br/>
            For support and queries, call +91 70790 44000 or email support@kamakhyayatra.com
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Kamakhya_Yatra_Receipt_${bookingRef}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

            {!fareRule && (
              <div className="bg-[#0b1c3e]/5 border border-[#0b1c3e]/10 p-4 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-[#0b1c3e]">Advance Booking Amount:</span>
                <strong className="text-sm font-extrabold text-[#d4af37]">₹5,000 (Advance token deposit)</strong>
              </div>
            )}

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

            {fareRule && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-[#0b1c3e] flex items-center gap-1.5">Choose Travel Category</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {['Sleeper (SL)', '3AC', '2AC', 'Flight'].map(cls => {
                    let cost = 0;
                    if (cls === 'Sleeper (SL)') cost = fareRule.sl_fare;
                    if (cls === '3AC') cost = fareRule.sl_fare + fareRule.ac3_extra_charge;
                    if (cls === '2AC') cost = fareRule.sl_fare + fareRule.ac2_extra_charge;
                    if (cls === 'Flight') cost = fareRule.flight_fare;
                    
                    if (cost === 0) return null;
                    
                    const isSelected = formData.travelClass === cls;
                    return (
                      <div 
                        key={cls}
                        onClick={() => setFormData({...formData, travelClass: cls})}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-slate-200 hover:border-[#0b1c3e]/30'}`}
                      >
                        <h4 className={`font-bold ${isSelected ? 'text-[#0b1c3e]' : 'text-slate-600'}`}>{cls}</h4>
                        <p className={`text-sm mt-1 font-extrabold ${isSelected ? 'text-[#d4af37]' : 'text-slate-400'}`}>₹{cost.toLocaleString("en-IN")}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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

            {fareRule && formData.travelClass && (
              <div className="bg-gradient-to-r from-[#0b1c3e]/5 to-transparent border border-[#0b1c3e]/10 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <h4 className="font-bold text-[#0b1c3e] flex items-center gap-2 pb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Live Fare Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Base Package Cost ({formData.guests} Pax)</span>
                      <span className="font-bold text-slate-800">₹{packageCost.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Advance Token Deposit</span>
                      <span className="font-bold text-emerald-600">₹{advanceAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:border-l border-slate-200 md:pl-4 justify-center">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#0b1c3e] font-extrabold">Balance Due</span>
                      <span className="font-extrabold text-rose-500 text-base">₹{balanceAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="text-[9px] text-slate-400">Balance is payable before departure.</span>
                  </div>
                </div>
              </div>
            )}

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
              
              {packageCost > 0 && (
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-3">
                  <span className="text-sm font-bold text-[#0b1c3e]">Total Package Cost:</span>
                  <strong className="text-sm font-extrabold text-[#0b1c3e]">₹{packageCost.toLocaleString("en-IN")}</strong>
                </div>
              )}
              
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-3">
                <span className="text-sm font-bold text-[#0b1c3e]">Advance Booking Amount:</span>
                <strong className="text-xl font-extrabold text-[#d4af37]">₹{advanceAmount.toLocaleString("en-IN")}</strong>
              </div>
              
              {balanceAmount > 0 && (
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-3">
                  <span className="text-sm font-bold text-rose-500">Balance Due:</span>
                  <strong className="text-sm font-extrabold text-rose-500">₹{balanceAmount.toLocaleString("en-IN")}</strong>
                </div>
              )}
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

            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl w-full max-w-lg mb-8 flex flex-col gap-4 text-left shadow-sm">
              <h4 className="text-sm font-black text-[#0b1c3e] border-b-2 border-slate-200 pb-2 mb-2 uppercase tracking-wide">Booking Summary</h4>
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Booking ID</span>
                  <strong className="text-sm font-extrabold text-[#0b1c3e]">{bookingRef}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Travel Date</span>
                  <strong className="text-sm font-extrabold text-slate-700">
                    {formData.date ? new Date(formData.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                  </strong>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Package Name</span>
                  <strong className="text-sm font-extrabold text-slate-700">{formData.package}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Travel Class</span>
                  <strong className="text-sm font-extrabold text-[#d4af37]">{formData.travelClass || "Standard"}</strong>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Travellers</span>
                  <strong className="text-sm font-extrabold text-slate-700">{formData.guests} Pax</strong>
                </div>
              </div>

              <h4 className="text-sm font-black text-[#0b1c3e] border-b-2 border-slate-200 pb-2 mt-2 mb-2 uppercase tracking-wide">Fare Breakdown</h4>
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-slate-500 font-extrabold">Total Package Cost:</span>
                <strong className="text-sm font-extrabold text-slate-800">₹{packageCost.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-slate-500 font-extrabold">Advance Booking Amount Paid:</span>
                <strong className="text-sm font-extrabold text-emerald-600">₹{advanceAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                <span className="text-xs text-rose-500 font-extrabold">Balance Due:</span>
                <strong className="text-sm font-extrabold text-rose-600">₹{balanceAmount.toLocaleString("en-IN")}</strong>
              </div>
              
              <div className="text-center mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-xs font-bold text-amber-700">Remaining balance amount must be paid before journey commencement.</span>
              </div>

              <button 
                onClick={downloadReceipt}
                className="w-full mt-4 py-4 bg-[#d4af37] hover:bg-[#b8952d] text-[#0b1c3e] font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Receipt
              </button>
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
