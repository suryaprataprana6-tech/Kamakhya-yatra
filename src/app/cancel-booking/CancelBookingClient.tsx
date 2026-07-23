"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Search,
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  FileCheck,
  Globe,
  Building2,
  Receipt,
  User,
  Phone,
  Mail,
  Users,
  CreditCard,
  Check
} from "lucide-react";
import Link from "next/link";
import {
  verifyBookingForCancellation,
  submitCancellationRequest,
  getPublicPackagesList
} from "@/app/admin/actions";

interface VerifiedBooking {
  bookingId: number;
  bookingReference: string;
  customerName: string;
  phone: string;
  email: string;
  packageName: string;
  travelDate: string;
  travelClass: string;
  packageCost: number;
  advanceAmount: number;
  balanceAmount: number;
  amountPaid: number;
  paymentStatus: string;
  bookingStatus: string;
}

export default function CancelBookingClient() {
  // Booking Source State: 'online' | 'offline'
  const [bookingSource, setBookingSource] = useState<"online" | "offline">("online");

  // Dynamic Packages List for Offline Dropdown
  const [packagesList, setPackagesList] = useState<{ id: number; title: string }[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [customPackageName, setCustomPackageName] = useState<string>("");

  // ==========================================
  // ONLINE BOOKING STATES
  // ==========================================
  const [searchBookingId, setSearchBookingId] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verifiedBooking, setVerifiedBooking] = useState<VerifiedBooking | null>(null);

  // ==========================================
  // OFFLINE BOOKING FORM STATES
  // ==========================================
  const [offlineBookingReference, setOfflineBookingReference] = useState("");
  const [offlineCustomerName, setOfflineCustomerName] = useState("");
  const [offlinePhone, setOfflinePhone] = useState("");
  const [offlineEmail, setOfflineEmail] = useState("");
  const [offlineTravelDate, setOfflineTravelDate] = useState("");
  const [offlineTravelClass, setOfflineTravelClass] = useState("3AC");
  const [offlineTravellers, setOfflineTravellers] = useState(1);
  const [offlinePackageAmount, setOfflinePackageAmount] = useState("");
  const [offlineAmountPaid, setOfflineAmountPaid] = useState("");
  const [offlinePaymentMode, setOfflinePaymentMode] = useState("Cash");
  const [offlineBookingOffice, setOfflineBookingOffice] = useState("");

  // ==========================================
  // COMMON CANCELLATION STATES
  // ==========================================
  const [cancellationReason, setCancellationReason] = useState("");
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

  // Invoice File State
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedResult, setSubmittedResult] = useState<{
    cancellationRequestId: string;
    bookingReference: string;
    bookingSource: "online" | "offline";
    customerName: string;
    packageName: string;
    travelDate: string;
    amountPaid: string;
  } | null>(null);

  // Fetch Packages on Mount
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await getPublicPackagesList();
        if (res.success && res.data) {
          setPackagesList(res.data);
        }
      } catch (err) {
        console.error("Failed to load packages for cancellation form:", err);
      }
    }
    loadPackages();
  }, []);

  // MODE SWITCHING & STATE CLEANUP
  const handleSwitchBookingSource = (newSource: "online" | "offline") => {
    if (newSource === bookingSource) return;

    setBookingSource(newSource);
    setErrorMessage("");
    setVerificationError("");
    setVerifiedBooking(null);
    setInvoiceFile(null);
    setFileError("");
    setCancellationReason("");
    setRefundPolicyAccepted(false);

    if (newSource === "online") {
      // Clear offline states
      setOfflineBookingReference("");
      setOfflineCustomerName("");
      setOfflinePhone("");
      setOfflineEmail("");
      setSelectedPackageId("");
      setCustomPackageName("");
      setOfflineTravelDate("");
      setOfflineTravelClass("3AC");
      setOfflineTravellers(1);
      setOfflinePackageAmount("");
      setOfflineAmountPaid("");
      setOfflinePaymentMode("Cash");
      setOfflineBookingOffice("");
    } else {
      // Clear online states
      setSearchBookingId("");
      setSearchContact("");
    }
  };

  // Online Verification Handler
  const handleVerifyBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError("");
    setErrorMessage("");

    if (!searchBookingId.trim()) {
      setVerificationError("Please enter your Booking ID (e.g. KY-BKG-2026-000001).");
      return;
    }
    if (!searchContact.trim()) {
      setVerificationError("Please enter the Mobile Number or Email Address associated with the booking.");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await verifyBookingForCancellation(searchBookingId.trim(), searchContact.trim());
      if (res.success && res.data) {
        setVerifiedBooking(res.data);
        setVerificationError("");
      } else {
        setVerifiedBooking(null);
        setVerificationError(res.error || "No matching booking found. Please check your Booking ID and contact info.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerifiedBooking(null);
      setVerificationError(err.message || "An unexpected error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetVerification = () => {
    setVerifiedBooking(null);
    setSearchBookingId("");
    setSearchContact("");
    setVerificationError("");
    setErrorMessage("");
    setCancellationReason("");
    setInvoiceFile(null);
    setFileError("");
    setRefundPolicyAccepted(false);
  };

  // Invoice File Selection Helper
  const validateAndSetFile = (file: File) => {
    setFileError("");
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExts = ["pdf", "jpg", "jpeg", "png"];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setFileError("Invalid file format. Please upload a PDF, JPG, JPEG, or PNG document.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5 MB limit. Please upload a smaller file.");
      return false;
    }

    setInvoiceFile(file);
    setFileError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setInvoiceFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Main Submit Handler (Supports Online and Offline)
  const handleSubmitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (bookingSource === "online") {
      if (!verifiedBooking) {
        setErrorMessage("Please verify your online booking before submitting cancellation.");
        return;
      }
      if (!cancellationReason.trim()) {
        setErrorMessage("Cancellation reason is required.");
        return;
      }
      if (!invoiceFile) {
        setErrorMessage("Please upload your original Kamakhya Yatra booking invoice/receipt before submitting.");
        return;
      }
      if (!refundPolicyAccepted) {
        setErrorMessage("You must accept the Refund Policy declaration.");
        return;
      }

      setIsSubmitting(true);

      try {
        const formDataPayload = new FormData();
        formDataPayload.append("bookingSource", "online");
        formDataPayload.append("bookingId", verifiedBooking.bookingReference);
        formDataPayload.append("phoneOrEmail", searchContact.trim());
        formDataPayload.append("cancellationReason", cancellationReason.trim());
        formDataPayload.append("refundPolicyAccepted", "true");
        formDataPayload.append("invoiceFile", invoiceFile);

        const result = await submitCancellationRequest(formDataPayload);

        if (result.success) {
          setSubmittedResult({
            cancellationRequestId: result.cancellationRequestId || `KY-CAN-2026-ONLINE`,
            bookingReference: verifiedBooking.bookingReference,
            bookingSource: "online",
            customerName: verifiedBooking.customerName,
            packageName: verifiedBooking.packageName,
            travelDate: verifiedBooking.travelDate,
            amountPaid: `₹${verifiedBooking.amountPaid.toLocaleString("en-IN")}`,
          });
          setSuccess(true);

          const waText =
            `Online Cancellation Request Received - Kamakhya Yatra\n\n` +
            `Request ID: ${result.cancellationRequestId}\n` +
            `Booking ID: ${verifiedBooking.bookingReference}\n` +
            `Customer Name: ${verifiedBooking.customerName}\n` +
            `Package: ${verifiedBooking.packageName}\n` +
            `Reason: ${cancellationReason.trim()}`;

          const whatsappUrl = `https://wa.me/917079044000?text=${encodeURIComponent(waText)}`;
          window.open(whatsappUrl, "_blank");
        } else {
          setErrorMessage(result.error || "An error occurred while submitting your request.");
        }
      } catch (err: any) {
        console.error("Submission error:", err);
        setErrorMessage(err.message || "An unexpected error occurred during submission.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // OFFLINE FORM VALIDATIONS
      if (!offlineBookingReference.trim()) {
        setErrorMessage("Offline Booking / Invoice Number is required.");
        return;
      }
      if (!offlineCustomerName.trim()) {
        setErrorMessage("Customer Full Name is required.");
        return;
      }
      if (!offlinePhone.trim() || offlinePhone.replace(/\D/g, "").length < 10) {
        setErrorMessage("A valid 10-digit mobile number is required.");
        return;
      }

      // Package Name Logic
      let finalPackageName = "";
      if (selectedPackageId === "other") {
        if (!customPackageName.trim()) {
          setErrorMessage("Please enter custom Package / Yatra Name.");
          return;
        }
        finalPackageName = customPackageName.trim();
      } else if (selectedPackageId) {
        const pkgObj = packagesList.find((p) => String(p.id) === selectedPackageId);
        finalPackageName = pkgObj ? pkgObj.title : selectedPackageId;
      } else {
        setErrorMessage("Please select Package / Yatra Name.");
        return;
      }

      if (!offlineTravelDate.trim()) {
        setErrorMessage("Travel Date is required.");
        return;
      }
      if (!offlinePackageAmount || Number(offlinePackageAmount) <= 0) {
        setErrorMessage("Total Package Amount is required.");
        return;
      }
      if (!offlineAmountPaid || Number(offlineAmountPaid) <= 0) {
        setErrorMessage("Amount Paid is required.");
        return;
      }
      if (!cancellationReason.trim()) {
        setErrorMessage("Cancellation reason is required.");
        return;
      }
      if (!invoiceFile) {
        setErrorMessage("Original booking bill/invoice is required for offline booking cancellation.");
        return;
      }
      if (!refundPolicyAccepted) {
        setErrorMessage("You must accept the Refund Policy declaration.");
        return;
      }

      setIsSubmitting(true);

      try {
        const formDataPayload = new FormData();
        formDataPayload.append("bookingSource", "offline");
        formDataPayload.append("offlineBookingReference", offlineBookingReference.trim());
        formDataPayload.append("offlineCustomerName", offlineCustomerName.trim());
        formDataPayload.append("offlinePhone", offlinePhone.trim());
        formDataPayload.append("offlineEmail", offlineEmail.trim());
        formDataPayload.append("offlinePackageName", finalPackageName);
        formDataPayload.append("offlineTravelDate", offlineTravelDate.trim());
        formDataPayload.append("offlineTravelClass", offlineTravelClass);
        formDataPayload.append("offlineTravellers", String(offlineTravellers));
        formDataPayload.append("offlinePackageAmount", String(offlinePackageAmount));
        formDataPayload.append("offlineAmountPaid", String(offlineAmountPaid));
        formDataPayload.append("offlinePaymentMode", offlinePaymentMode);
        formDataPayload.append("offlineBookingOffice", offlineBookingOffice.trim());
        formDataPayload.append("cancellationReason", cancellationReason.trim());
        formDataPayload.append("refundPolicyAccepted", "true");
        formDataPayload.append("invoiceFile", invoiceFile);

        const result = await submitCancellationRequest(formDataPayload);

        if (result.success) {
          setSubmittedResult({
            cancellationRequestId: result.cancellationRequestId || `KY-CAN-2026-OFFLINE`,
            bookingReference: offlineBookingReference.trim(),
            bookingSource: "offline",
            customerName: offlineCustomerName.trim(),
            packageName: finalPackageName,
            travelDate: offlineTravelDate.trim(),
            amountPaid: `₹${Number(offlineAmountPaid).toLocaleString("en-IN")}`,
          });
          setSuccess(true);

          const waText =
            `Offline Booking Cancellation Request Submitted - Kamakhya Yatra\n\n` +
            `Request ID: ${result.cancellationRequestId}\n` +
            `Invoice Number: ${offlineBookingReference.trim()}\n` +
            `Customer Name: ${offlineCustomerName.trim()}\n` +
            `Package: ${finalPackageName}\n` +
            `Amount Paid: ₹${offlineAmountPaid}\n` +
            `Reason: ${cancellationReason.trim()}\n` +
            `Bill Uploaded: ${invoiceFile.name}`;

          const whatsappUrl = `https://wa.me/917079044000?text=${encodeURIComponent(waText)}`;
          window.open(whatsappUrl, "_blank");
        } else {
          setErrorMessage(result.error || "An error occurred while submitting your offline request.");
        }
      } catch (err: any) {
        console.error("Submission error:", err);
        setErrorMessage(err.message || "An unexpected error occurred during offline cancellation.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Section */}
        <section className="relative py-20 bg-[#07142e] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-[#d4af37] text-xs font-extrabold tracking-[0.2em] uppercase block mb-3">
              Booking Cancellation Assistance
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">
              Request Booking Cancellation
            </h1>
            <p className="text-amber-400 font-heading text-lg md:text-xl font-semibold mb-4">
              ऑनलाइन एवं ऑफलाइन काउंटर बुकिंग रद्दीकरण अनुरोध
            </p>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Submit your cancellation request with your original booking invoice or counter receipt for official verification.
            </p>
          </div>
        </section>

        {/* Main Section */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">
            
            {/* Left Info Panel */}
            <div className="lg:col-span-5 bg-[#0b1c3e] text-white p-8 md:p-12 flex flex-col justify-between gap-10 relative">
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold w-fit">
                  <ShieldCheck className="w-4 h-4" /> Compliance & Verification
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  Cancellation Guidelines
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Both online website bookings and offline counter/office bookings are supported. Mandatory original bill/invoice upload is required for verification.
                </p>
              </div>

              {/* Guide Points */}
              <div className="flex flex-col gap-8 z-10">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Original Bill / Receipt Mandatory
                    </h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Must upload official Kamakhya Yatra invoice or physical counter receipt (PDF, JPG, PNG, max 5 MB).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Offline Counter Support
                    </h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      For offline bookings, your request starts as <strong>Pending Verification</strong>. Officers manually inspect the bill before approval.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Refund Settlement Window
                    </h3>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Approved refunds process within up to 120 calendar days subject to vendor, train & hotel settlements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#d4af37] font-bold border-t border-white/15 pt-6 flex items-center gap-2">
                <span>🕉 Assisting your spiritual journey with complete compliance.</span>
              </div>
            </div>

            {/* Right Interactive Panel */}
            <div className="lg:col-span-7 p-8 md:p-12">
              {success && submittedResult ? (
                /* SUCCESS SCREEN */
                <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <h2 className="font-heading font-extrabold text-2xl text-[#0b1c3e] mb-2">
                    Cancellation Request Submitted Successfully!
                  </h2>

                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 my-6 text-left text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Cancellation Request ID</span>
                      <span className="text-[#0b1c3e] font-extrabold text-sm">{submittedResult.cancellationRequestId}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking Type</span>
                        <span className="font-extrabold text-indigo-700 capitalize">
                          {submittedResult.bookingSource === "offline" ? "Offline / Counter Booking" : "Online Website Booking"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Invoice / Booking Ref</span>
                        <span className="font-bold text-slate-900">{submittedResult.bookingReference}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Name</span>
                        <span className="font-semibold">{submittedResult.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Travel Date</span>
                        <span className="font-semibold">{submittedResult.travelDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Package</span>
                        <span className="font-semibold line-clamp-1">{submittedResult.packageName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                        <span className="font-black text-emerald-600">{submittedResult.amountPaid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left max-w-md mb-8">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Pending Admin Verification
                    </div>
                    <p className="leading-relaxed">
                      Your offline/counter booking cancellation request has been received. Our team will verify the uploaded original booking bill/invoice before processing the cancellation. Submission of a request does not guarantee cancellation or refund approval.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        handleResetVerification();
                      }}
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
                /* MAIN FORM VIEW */
                <div className="flex flex-col gap-8">

                  {/* 1. BOOKING SOURCE SELECTOR CARDS */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-black text-[#0b1c3e] uppercase tracking-wider block">
                      HOW DID YOU BOOK YOUR YATRA? *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Online Option Card */}
                      <button
                        type="button"
                        onClick={() => handleSwitchBookingSource("online")}
                        className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 relative cursor-pointer ${
                          bookingSource === "online"
                            ? "border-[#0b1c3e] bg-blue-50/60 shadow-md"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          bookingSource === "online" ? "bg-[#0b1c3e] text-[#d4af37]" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-[#0b1c3e]">
                            Online / Website Booking
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Booked via kamakhyayatra.com website
                          </p>
                        </div>
                        {bookingSource === "online" && (
                          <span className="absolute top-3 right-3 text-[#0b1c3e]">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </span>
                        )}
                      </button>

                      {/* Offline Option Card */}
                      <button
                        type="button"
                        onClick={() => handleSwitchBookingSource("offline")}
                        className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 relative cursor-pointer ${
                          bookingSource === "offline"
                            ? "border-[#0b1c3e] bg-amber-50/60 shadow-md"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          bookingSource === "offline" ? "bg-[#0b1c3e] text-[#d4af37]" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-[#0b1c3e]">
                            Offline / Counter Booking
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Booked at counter or physical office
                          </p>
                        </div>
                        {bookingSource === "offline" && (
                          <span className="absolute top-3 right-3 text-[#0b1c3e]">
                            <CheckCircle2 className="w-5 h-5 text-amber-600" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* GLOBAL ERROR BANNER */}
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex gap-2.5 items-start">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ========================================== */}
                  {/* MODE A: ONLINE BOOKING FLOW               */}
                  {/* ========================================== */}
                  {bookingSource === "online" && (
                    <>
                      {!verifiedBooking ? (
                        /* STEP 1: ONLINE VERIFICATION */
                        <div className="flex flex-col gap-5 border-t border-slate-100 pt-6">
                          <div>
                            <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-1">
                              Verify Online Booking
                            </h3>
                            <p className="text-slate-500 text-xs">
                              Enter your Booking ID and Mobile Number/Email to fetch original online booking details.
                            </p>
                          </div>

                          {verificationError && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold flex gap-2.5 items-start">
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <span>{verificationError}</span>
                            </div>
                          )}

                          <form onSubmit={handleVerifyBooking} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              <label htmlFor="searchBookingId" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                                Booking ID / Reference *
                              </label>
                              <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  type="text"
                                  id="searchBookingId"
                                  required
                                  placeholder="E.g. KY-BKG-2026-000001"
                                  value={searchBookingId}
                                  onChange={(e) => setSearchBookingId(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label htmlFor="searchContact" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                                Mobile Number or Email *
                              </label>
                              <input
                                type="text"
                                id="searchContact"
                                required
                                placeholder="Enter 10-digit mobile number or email"
                                value={searchContact}
                                onChange={(e) => setSearchContact(e.target.value)}
                                className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isVerifying}
                              className="bg-[#0b1c3e] hover:bg-[#1e3c72] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60 text-sm shadow-md mt-2"
                            >
                              {isVerifying ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Verifying Booking...
                                </>
                              ) : (
                                <>
                                  Verify Booking <Search className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      ) : (
                        /* STEP 2: VERIFIED SUMMARY + ONLINE CANCELLATION FORM */
                        <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">

                          {/* Verified Card */}
                          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Booking Verified
                              </span>
                              <button
                                type="button"
                                onClick={handleResetVerification}
                                className="text-xs text-slate-400 hover:text-amber-400 font-bold underline transition"
                              >
                                Change Booking
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Booking ID</span>
                                <span className="text-[#d4af37] font-extrabold text-sm">{verifiedBooking.bookingReference}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Name</span>
                                <span className="text-white font-bold">{verifiedBooking.customerName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Travel Date</span>
                                <span className="text-white font-bold">{verifiedBooking.travelDate}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Package Name</span>
                                <span className="text-white font-semibold line-clamp-1">{verifiedBooking.packageName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Travel Class</span>
                                <span className="text-slate-300 font-semibold">{verifiedBooking.travelClass}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Paid</span>
                                <span className="text-emerald-400 font-black">₹{verifiedBooking.amountPaid.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>

                          <form onSubmit={handleSubmitCancellation} className="flex flex-col gap-6">

                            {/* Reason */}
                            <div className="flex flex-col gap-2">
                              <label htmlFor="cancellationReason" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                                Reason for Cancellation *
                              </label>
                              <textarea
                                id="cancellationReason"
                                required
                                rows={3}
                                placeholder="Please provide detailed reason for cancellation..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition resize-none"
                              />
                            </div>

                            {/* Invoice Upload */}
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                                Upload Original Booking Invoice / Receipt *
                              </label>
                              <p className="text-slate-500 text-xs">
                                Please upload the booking invoice/receipt issued by Kamakhya Yatra.
                              </p>

                              <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !invoiceFile && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer ${
                                  isDragging
                                    ? "border-[#0b1c3e] bg-blue-50/50"
                                    : invoiceFile
                                    ? "border-emerald-300 bg-emerald-50/30"
                                    : fileError
                                    ? "border-rose-300 bg-rose-50/20"
                                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400"
                                }`}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                />

                                {invoiceFile ? (
                                  <div className="flex flex-col items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-slate-800 text-xs max-w-xs truncate">
                                      {invoiceFile.name}
                                    </span>
                                    <span className="text-xs text-slate-400 font-semibold">
                                      {formatFileSize(invoiceFile.size)} • <strong className="text-emerald-600">Ready</strong>
                                    </span>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                                      >
                                        <RefreshCw className="w-3 h-3" /> Replace
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" /> Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-6 h-6 text-[#0b1c3e]" />
                                    <span className="font-bold text-slate-700 text-xs">
                                      Drag & drop original invoice or <span className="text-[#0b1c3e] underline font-extrabold">browse</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400">PDF, JPG, JPEG, PNG (Max 5 MB)</span>
                                  </div>
                                )}
                              </div>

                              {fileError && (
                                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> {fileError}
                                </span>
                              )}
                            </div>

                            {/* Declaration Checkbox */}
                            <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                              <input
                                type="checkbox"
                                id="refundPolicyAcceptedOnline"
                                required
                                checked={refundPolicyAccepted}
                                onChange={(e) => setRefundPolicyAccepted(e.target.checked)}
                                className="mt-1 accent-[#0b1c3e] w-4 h-4 cursor-pointer"
                              />
                              <label htmlFor="refundPolicyAcceptedOnline" className="text-xs font-semibold text-slate-700 leading-relaxed select-none cursor-pointer">
                                I hereby declare that I agree to the{" "}
                                <Link href="/refund-policy" target="_blank" className="text-[#0b1c3e] underline font-bold">
                                  Refund & Cancellation Policy
                                </Link>
                                . Customer-initiated refunds are subject to review.
                              </label>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 shadow-lg shadow-[#0b1c3e]/10 text-sm"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Submitting Online Cancellation...
                                </>
                              ) : (
                                <>
                                  Submit Online Cancellation Request <Send className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  )}

                  {/* ========================================== */}
                  {/* MODE B: OFFLINE / COUNTER BOOKING FLOW     */}
                  {/* ========================================== */}
                  {bookingSource === "offline" && (
                    <div className="flex flex-col gap-6 border-t border-slate-100 pt-6">
                      <div>
                        <h3 className="font-heading font-extrabold text-xl text-[#0b1c3e] mb-1">
                          OFFLINE / COUNTER BOOKING CANCELLATION
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Enter your physical receipt/bill details below. No online database verification is required for offline counter bookings. Uploading your original physical bill/receipt is mandatory.
                        </p>
                      </div>

                      <form onSubmit={handleSubmitCancellation} className="flex flex-col gap-5">
                        
                        {/* Offline Invoice Number */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="offlineBookingReference" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                            Original Booking / Invoice Number *
                          </label>
                          <input
                            type="text"
                            id="offlineBookingReference"
                            required
                            placeholder="E.g. OFF-TEST-2026-001 or Receipt No."
                            value={offlineBookingReference}
                            onChange={(e) => setOfflineBookingReference(e.target.value)}
                            className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition font-semibold"
                          />
                        </div>

                        {/* Customer Full Name */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="offlineCustomerName" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                            Customer Full Name *
                          </label>
                          <input
                            type="text"
                            id="offlineCustomerName"
                            required
                            placeholder="E.g. Rajesh Kumar Sharma"
                            value={offlineCustomerName}
                            onChange={(e) => setOfflineCustomerName(e.target.value)}
                            className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                          />
                        </div>

                        {/* Mobile Number & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlinePhone" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Mobile Number *
                            </label>
                            <input
                              type="tel"
                              id="offlinePhone"
                              required
                              placeholder="10-digit mobile number"
                              value={offlinePhone}
                              onChange={(e) => setOfflinePhone(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlineEmail" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Email Address (Optional)
                            </label>
                            <input
                              type="email"
                              id="offlineEmail"
                              placeholder="E.g. customer@example.com"
                              value={offlineEmail}
                              onChange={(e) => setOfflineEmail(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>
                        </div>

                        {/* Package Selection Dropdown + Custom Package Input */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="packageSelect" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                            Package / Yatra Name *
                          </label>
                          <select
                            id="packageSelect"
                            required
                            value={selectedPackageId}
                            onChange={(e) => setSelectedPackageId(e.target.value)}
                            className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                          >
                            <option value="">-- Select Package / Yatra Name --</option>
                            {packagesList.map((pkg) => (
                              <option key={pkg.id} value={String(pkg.id)}>
                                {pkg.title}
                              </option>
                            ))}
                            <option value="other">Other / Custom Package</option>
                          </select>
                        </div>

                        {selectedPackageId === "other" && (
                          <div className="flex flex-col gap-2">
                            <label htmlFor="customPackageName" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Enter Package Name *
                            </label>
                            <input
                              type="text"
                              id="customPackageName"
                              required
                              placeholder="Enter custom yatra/package name"
                              value={customPackageName}
                              onChange={(e) => setCustomPackageName(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>
                        )}

                        {/* Travel Date */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="offlineTravelDate" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                            Travel Date *
                          </label>
                          <input
                            type="text"
                            id="offlineTravelDate"
                            required
                            placeholder="E.g. DD-MM-YYYY or Oct 15, 2026"
                            value={offlineTravelDate}
                            onChange={(e) => setOfflineTravelDate(e.target.value)}
                            className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                          />
                        </div>

                        {/* Travellers & Travel Class */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlineTravellers" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Number of Travellers *
                            </label>
                            <input
                              type="number"
                              id="offlineTravellers"
                              required
                              min={1}
                              value={offlineTravellers}
                              onChange={(e) => setOfflineTravellers(Number(e.target.value))}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlineTravelClass" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Travel Class *
                            </label>
                            <select
                              id="offlineTravelClass"
                              value={offlineTravelClass}
                              onChange={(e) => setOfflineTravelClass(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition font-medium"
                            >
                              <option value="SL">SL (Sleeper)</option>
                              <option value="3AC">3AC</option>
                              <option value="2AC">2AC</option>
                              <option value="Flight">Flight</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        {/* Total Package Amount & Amount Paid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlinePackageAmount" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Total Package Amount (₹) *
                            </label>
                            <input
                              type="number"
                              id="offlinePackageAmount"
                              required
                              placeholder="E.g. 15000"
                              value={offlinePackageAmount}
                              onChange={(e) => setOfflinePackageAmount(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlineAmountPaid" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Amount Paid (₹) *
                            </label>
                            <input
                              type="number"
                              id="offlineAmountPaid"
                              required
                              placeholder="E.g. 5000"
                              value={offlineAmountPaid}
                              onChange={(e) => setOfflineAmountPaid(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>
                        </div>

                        {/* Payment Mode & Booking Office */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlinePaymentMode" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Payment Mode *
                            </label>
                            <select
                              id="offlinePaymentMode"
                              value={offlinePaymentMode}
                              onChange={(e) => setOfflinePaymentMode(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition font-medium"
                            >
                              <option value="Cash">Cash</option>
                              <option value="UPI">UPI</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Card">Card</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label htmlFor="offlineBookingOffice" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                              Booking Office / Counter (Optional)
                            </label>
                            <input
                              type="text"
                              id="offlineBookingOffice"
                              placeholder="E.g. Ranchi Counter Office"
                              value={offlineBookingOffice}
                              onChange={(e) => setOfflineBookingOffice(e.target.value)}
                              className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition"
                            />
                          </div>
                        </div>

                        {/* Cancellation Reason */}
                        <div className="flex flex-col gap-2">
                          <label htmlFor="cancellationReasonOffline" className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider">
                            Reason for Cancellation *
                          </label>
                          <textarea
                            id="cancellationReasonOffline"
                            required
                            rows={3}
                            placeholder="Please provide detailed reason for your cancellation..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#0b1c3e] rounded-xl text-sm transition resize-none"
                          />
                        </div>

                        {/* MANDATORY ORIGINAL BILL UPLOAD */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#0b1c3e] uppercase tracking-wider flex items-center gap-1">
                            Upload Original Kamakhya Yatra Bill / Invoice *
                          </label>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            Since this booking was made offline/counter, please upload the original bill or receipt issued by Kamakhya Yatra for manual verification.
                          </p>

                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !invoiceFile && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer ${
                              isDragging
                                ? "border-[#0b1c3e] bg-amber-50/60"
                                : invoiceFile
                                ? "border-emerald-300 bg-emerald-50/30"
                                : fileError
                                ? "border-rose-300 bg-rose-50/20"
                                : "border-[#d4af37]/40 bg-amber-50/20 hover:bg-amber-50/40"
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                            />

                            {invoiceFile ? (
                              <div className="flex flex-col items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <span className="font-extrabold text-slate-800 text-xs max-w-xs truncate">
                                  {invoiceFile.name}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">
                                  {formatFileSize(invoiceFile.size)} • <strong className="text-emerald-600">Attached</strong>
                                </span>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Receipt className="w-7 h-7 text-[#b8952d]" />
                                <span className="font-bold text-slate-800 text-xs">
                                  Drag & drop original bill/invoice here, or <span className="text-[#0b1c3e] underline font-extrabold">browse</span>
                                </span>
                                <span className="text-[10px] text-slate-400">PDF, JPG, JPEG, PNG (Max 5 MB)</span>
                              </div>
                            )}
                          </div>

                          {fileError && (
                            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {fileError}
                            </span>
                          )}
                        </div>

                        {/* Declaration Checkbox */}
                        <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                          <input
                            type="checkbox"
                            id="refundPolicyAcceptedOffline"
                            required
                            checked={refundPolicyAccepted}
                            onChange={(e) => setRefundPolicyAccepted(e.target.checked)}
                            className="mt-1 accent-[#0b1c3e] w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="refundPolicyAcceptedOffline" className="text-xs font-semibold text-slate-700 leading-relaxed select-none cursor-pointer">
                            I hereby declare that I agree to the{" "}
                            <Link href="/refund-policy" target="_blank" className="text-[#0b1c3e] underline font-bold">
                              Refund & Cancellation Policy
                            </Link>
                            . I understand that offline cancellation requests require manual bill inspection and are subject to verification.
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-[#0b1c3e] to-[#1e3c72] text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 shadow-lg shadow-[#0b1c3e]/10 text-sm cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting Offline Cancellation...
                            </>
                          ) : (
                            <>
                              Submit Cancellation Request <Send className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
