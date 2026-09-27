"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Send, Phone, Mail, User, Sparkles, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { getSavedUserProfile, saveUserProfile } from "@/utils/userProfile";
import { submitPopupInquiry } from "@/app/admin/actions";

export default function InquiryPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "duplicate";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    honeypot: "", // Anti-spam hidden honeypot
  });

  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    email?: string;
  }>({});

  // 3-second countdown for Skip/Close action
  const [skipCountdown, setSkipCountdown] = useState(3);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleNavigateToDetailedForm = () => {
    // Save entered values to user profile for safe prefilling
    saveUserProfile({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
    });

    // Close popup
    setIsOpen(false);
    sessionStorage.setItem("ky_inquiry_popup_dismissed", "true");

    // Construct URL with query parameters if fields are filled
    const params = new URLSearchParams();
    if (formData.name.trim()) params.set("name", formData.name.trim());
    if (formData.mobile.trim()) params.set("phone", formData.mobile.trim());
    if (formData.email.trim()) params.set("email", formData.email.trim());

    const qs = params.toString();
    router.push(qs ? `/contact-us?${qs}` : "/contact-us");
  };

  // 1. Popup Triggering: Immediate appearance on page load
  useEffect(() => {
    // Never show on admin, dashboard, booking or cancellation flows
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/book") ||
      pathname.startsWith("/cancel-booking")
    ) {
      return;
    }

    // In production, preserve session/local storage suppression
    if (process.env.NODE_ENV !== "development") {
      const isDismissed = sessionStorage.getItem("ky_inquiry_popup_dismissed");
      if (isDismissed === "true") return;

      const isSubmitted = sessionStorage.getItem("ky_inquiry_popup_submitted");
      if (isSubmitted === "true") return;

      const submittedTime = localStorage.getItem("ky_inquiry_popup_submitted_time");
      if (submittedTime) {
        const elapsed = Date.now() - parseInt(submittedTime, 10);
        // Suppress if submitted within last 24 hours
        if (elapsed < 24 * 60 * 60 * 1000) {
          return;
        }
      }
    }

    // Auto-fill logic: prefill if legitimate user details exist
    const saved = getSavedUserProfile();
    setFormData({
      name: saved.name || "",
      mobile: saved.mobile || "",
      email: saved.email || "",
      honeypot: "",
    });

    // Show popup immediately upon page load / component mount
    setSkipCountdown(3);
    setIsOpen(true);
  }, [pathname]);

  // 2. 3-Second Skip Countdown Timer
  useEffect(() => {
    if (!isOpen) return;

    setSkipCountdown(3);
    const interval = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // 3. Accessibility: Focus management & Escape key listener (disabled during countdown)
  useEffect(() => {
    if (!isOpen) return;

    // Auto focus name input when popup opens
    const focusTimer = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only allow escape to close after 3-second countdown
        if (skipCountdown === 0) {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, skipCountdown]);

  const handleClose = () => {
    if (skipCountdown > 0) return; // Prevent closing during 3-second delay
    setIsOpen(false);
    sessionStorage.setItem("ky_inquiry_popup_dismissed", "true");
  };

  // 4. Indian Mobile Number & Field Validations
  const validateForm = () => {
    const newErrors: { name?: string; mobile?: string; email?: string } = {};

    // Name validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your full name.";
    }

    // Indian 10-digit mobile validation
    const digitsOnly = formData.mobile.replace(/\D/g, "");
    let cleanMobile = digitsOnly;
    if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
      cleanMobile = cleanMobile.substring(2);
    } else if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
      cleanMobile = cleanMobile.substring(1);
    }

    if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number.";
    }

    // Standard email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    // Save profile for future legitimate auto-fill
    saveUserProfile({
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
    });

    // Capture current page and tour context
    let pageTitle = typeof document !== "undefined" ? document.title : "";
    let cleanTitle = pageTitle
      .replace(/\s*\|\s*Kamakhya Yatra.*$/i, "")
      .replace(/\s*-\s*Kamakhya Yatra.*$/i, "")
      .trim();

    let tourPackage = "";
    if (pathname && (pathname.includes("/tour/") || pathname.includes("/packages"))) {
      const h1El = document.querySelector("h1");
      if (h1El && h1El.textContent?.trim()) {
        tourPackage = h1El.textContent.trim();
      } else {
        tourPackage = cleanTitle;
      }
    } else if (pathname === "/") {
      tourPackage = "General Website Inquiry";
    } else {
      tourPackage = cleanTitle || "Website Lead";
    }

    try {
      const res = await submitPopupInquiry({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : pathname,
        pageTitle: cleanTitle || pageTitle,
        tourPackage: tourPackage,
        source: "Website Popup",
        honeypot: formData.honeypot,
      });

      if (res.success) {
        if (res.isDuplicate) {
          setStatusMessage({
            type: "duplicate",
            text: res.message || "We already received your enquiry. Our team will contact you shortly.",
          });
        } else {
          setStatusMessage({
            type: "success",
            text: res.message || "Thank you! Your enquiry has been received. Our team will contact you shortly.",
          });
        }

        // Mark as submitted in session and local storage
        sessionStorage.setItem("ky_inquiry_popup_submitted", "true");
        localStorage.setItem("ky_inquiry_popup_submitted_time", Date.now().toString());

        // Automatically close popup after 2.8 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 2800);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Unable to submit your enquiry right now. Please try again or contact us on WhatsApp.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Unable to submit your enquiry right now. Please try again or contact us on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // Close when clicking the backdrop only after countdown
        if (e.target === e.currentTarget && skipCountdown === 0) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ky-popup-title"
        aria-describedby="ky-popup-desc"
        className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-amber-200/80 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b1c3e] via-[#d4af37] to-[#0b1c3e]" />

        {/* Top-Right Close "×" Button */}
        {skipCountdown > 0 ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Close disabled"
            className="absolute top-3.5 right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full text-slate-300 opacity-40 cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close inquiry dialog"
            className="absolute top-3.5 right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="mb-4 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/70 text-[#0b1c3e] text-[11px] font-bold tracking-wide uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
              <span>Plan Your Yatra</span>
            </div>
            <h2 id="ky-popup-title" className="text-lg font-extrabold text-[#0b1c3e] tracking-tight">
              Get Instant Tour Details
            </h2>
            <p id="ky-popup-desc" className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Share your details and our team will contact you.
            </p>
          </div>

          {/* Feedback Banner (Success / Error / Duplicate) */}
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                statusMessage.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : statusMessage.type === "duplicate"
                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {statusMessage.type === "error" ? (
                <div className="flex-1">
                  <p className="font-semibold">{statusMessage.text}</p>
                  <a
                    href="https://wa.me/917079044000?text=Hello%20Kamakhya%20Yatra%2C%20I%20would%20like%20to%20inquire%20about%20a%20tour."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-[#0b1c3e] underline hover:text-[#d4af37]"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    Chat on WhatsApp (+91 70790 44000)
                  </a>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold">{statusMessage.text}</p>
                </>
              )}
            </div>
          )}

          {/* Form */}
          {!statusMessage || statusMessage.type === "error" ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Anti-spam Honeypot Field (hidden from genuine users) */}
              <input
                type="text"
                name="ky_hp_token"
                value={formData.honeypot}
                onChange={(e) => setFormData((prev) => ({ ...prev, honeypot: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden absolute -left-[9999px]"
              />

              {/* Name Field */}
              <div>
                <label htmlFor="ky-inquiry-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    ref={nameInputRef}
                    id="ky-inquiry-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-[#d4af37] focus:ring-amber-100"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label htmlFor="ky-inquiry-mobile" className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span className="text-slate-500 text-[11px]">+91</span>
                  </div>
                  <input
                    id="ky-inquiry-mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={13}
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, mobile: e.target.value }));
                      if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                    }}
                    className={`w-full pl-16 pr-3 py-2 text-xs rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.mobile
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-[#d4af37] focus:ring-amber-100"
                    }`}
                  />
                </div>
                {errors.mobile && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.mobile}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="ky-inquiry-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="ky-inquiry-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:border-[#d4af37] focus:ring-amber-100"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>}
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0b1c3e] to-[#152e61] text-[#d4af37] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                    <span>Sending Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Enquiry</span>
                  </>
                )}
              </button>

              {/* Subtle Secondary Detailed Form Link */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleNavigateToDetailedForm}
                  className="text-xs text-[#0b1c3e] hover:text-[#d4af37] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  <span>Fill Detailed Form</span>
                  <ArrowRight className="w-3 h-3 text-[#d4af37]" />
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 mt-1">
                🔒 We respect your privacy. No spam guaranteed.
              </p>

              {/* Subtle Bottom Skip Option with 3s Countdown */}
              <div className="pt-0.5 text-center">
                {skipCountdown > 0 ? (
                  <span className="text-[11px] text-slate-400 font-medium select-none">
                    Skip in {skipCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-2 transition-colors cursor-pointer focus:outline-none"
                  >
                    Skip
                  </button>
                )}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
