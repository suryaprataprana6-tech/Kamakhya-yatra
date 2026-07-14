import { submitInquiry } from "@/app/admin/actions";
import { sendInquiryToWhatsApp } from "./whatsapp";

// Client-side phone validation
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
}

// Global helper to submit lead data and optionally redirect to WhatsApp
export async function submitLeadAndRedirect(
  data: {
    name: string;
    phone: string;
    email?: string;
    package?: string;
    date?: string;
    guests?: string;
    message?: string;
  },
  source: string,
  shouldRedirectToWhatsApp = true
) {
  // Validate phone number
  if (!validatePhone(data.phone)) {
    alert("Please enter a valid phone number with at least 10 digits.");
    return { success: false, error: "Phone number too short" };
  }

  // Get client-side metadata
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const utmSource = typeof window !== "undefined" ? sessionStorage.getItem("ky_utm_source") || undefined : undefined;
  const utmCampaign = typeof window !== "undefined" ? sessionStorage.getItem("ky_utm_campaign") || undefined : undefined;

  // Submit via Server Action
  const response = await submitInquiry({
    ...data,
    source,
    pageUrl,
    utmSource,
    utmCampaign,
  });

  if (response.success) {
    if (shouldRedirectToWhatsApp) {
      sendInquiryToWhatsApp(data);
    }
  } else {
    console.error("Lead submission error:", response.error);
  }

  return response;
}

// Record direct WhatsApp click event as a lead
export async function recordWhatsAppClick(packageTitle?: string) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const utmSource = typeof window !== "undefined" ? sessionStorage.getItem("ky_utm_source") || undefined : undefined;
  const utmCampaign = typeof window !== "undefined" ? sessionStorage.getItem("ky_utm_campaign") || undefined : undefined;

  try {
    await submitInquiry({
      name: "WhatsApp Click Lead",
      phone: "whatsapp",
      package: packageTitle || "Direct WhatsApp",
      message: `User clicked WhatsApp chat link/button.`,
      source: "whatsapp_button",
      pageUrl,
      utmSource,
      utmCampaign,
    });
  } catch (err) {
    console.warn("Failed to log WhatsApp click lead:", err);
  }
}
