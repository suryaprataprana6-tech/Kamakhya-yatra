"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/utils/supabaseServer";
import nodemailer from "nodemailer";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "[YAHAN APNA STRONG PASSWORD LIKHO]";

export async function loginAdmin(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }
  return { success: false, error: "Incorrect password" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function updatePackage(id: number, data: {
  price: number;
  image: string;
  overview: string;
  whats_included: string[];
  itinerary: any[];
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // Update in Supabase
  const { error } = await supabaseServer
    .from("packages")
    .update({
      price: data.price,
      image: data.image,
      overview: data.overview,
      whats_included: data.whats_included,
      itinerary: data.itinerary
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return { success: false, error: error.message };
  }

  // Revalidate cache to reflect changes instantly on the frontend
  revalidateCache();

  return { success: true };
}

function revalidateCache() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/dharmic-yatra");
  revalidatePath("/desh-yatra");
  revalidatePath("/videsh-yatra");
  revalidatePath("/holiday-yatra");
  revalidatePath("/book");
  revalidatePath("/sitemap.xml");
  revalidatePath("/tour/[category]/[slug]", "layout");
}

export async function createPackage(data: {
  title: string;
  duration: string;
  price: number;
  category: "Spiritual" | "Holiday" | "International";
  slug: string;
  location: string;
  rating: string;
  description: string;
  overview: string;
  whats_included: string[];
  itinerary: any[];
  image: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // 1. Query current maximum ID from packages and add 1
  const { data: maxData, error: maxError } = await supabaseServer
    .from("packages")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error("Error querying max id:", maxError);
    return { success: false, error: maxError.message };
  }

  const nextId = maxData && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;

  // 2. Insert package
  const { error } = await supabaseServer
    .from("packages")
    .insert({
      id: nextId,
      title: data.title,
      duration: data.duration,
      price: data.price,
      category: data.category,
      slug: data.slug,
      location: data.location,
      rating: data.rating || "5.0",
      description: data.description,
      overview: data.overview,
      whats_included: data.whats_included,
      itinerary: data.itinerary,
      image: data.image
    });

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  revalidateCache();

  return { success: true };
}

export async function deletePackage(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabaseServer
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return { success: false, error: error.message };
  }

  revalidateCache();

  return { success: true };
}

export async function getAnalyticsData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // 1. Live Now Count (last seen within 2 minutes)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: liveSessions, error: liveSessionsError } = await supabaseServer
    .from("live_sessions")
    .select("session_id, current_page")
    .gt("last_seen_at", twoMinutesAgo);

  if (liveSessionsError) {
    console.error("Error querying live sessions:", liveSessionsError);
  }

  const liveNowCount = liveSessions ? liveSessions.length : 0;

  // 2. Today's total page views
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayISO = startOfToday.toISOString();

  const { count: todayPageViews, error: todayError } = await supabaseServer
    .from("page_visits")
    .select("id", { count: "exact", head: true })
    .gt("visited_at", startOfTodayISO);

  if (todayError) {
    console.error("Error querying today's page views:", todayError);
  }

  // 3. Fetch visits from the last 30 days to process top pages & history charts in memory
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentVisits, error: visitsError } = await supabaseServer
    .from("page_visits")
    .select("page_path, visited_at")
    .gt("visited_at", thirtyDaysAgo);

  if (visitsError) {
    console.error("Error querying recent visits:", visitsError);
  }

  // 4. Most visited pages (top 5)
  const pathCounts: Record<string, number> = {};
  (recentVisits || []).forEach((v) => {
    pathCounts[v.page_path] = (pathCounts[v.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 5. Visits over time (last 7 days)
  const visitsChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const count = (recentVisits || []).filter((v) => {
      const vDate = new Date(v.visited_at);
      return vDate >= d && vDate < nextD;
    }).length;

    visitsChart.push({ label, count });
  }

  // 6. Periodic cleanups (delete live sessions older than 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await supabaseServer
    .from("live_sessions")
    .delete()
    .lt("last_seen_at", tenMinutesAgo);

  return {
    success: true,
    data: {
      liveNowCount,
      todayPageViews: todayPageViews || 0,
      topPages,
      visitsChart,
    },
  };
}

export async function submitInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  package?: string;
  date?: string;
  guests?: string;
  message?: string;
  source?: string;
  pageUrl?: string;
  utmSource?: string;
  utmCampaign?: string;
}) {
  // Clean phone number (leave only digits, unless it's a direct WhatsApp button click)
  const isDirectWhatsApp = data.phone === "whatsapp" || data.phone.toLowerCase() === "whatsapp click";
  const cleanedPhone = isDirectWhatsApp ? "whatsapp" : data.phone.replace(/\D/g, "");
  if (!isDirectWhatsApp && cleanedPhone.length < 10) {
    return { success: false, error: "Phone number must be at least 10 digits." };
  }

  try {
    // Check if there is an inquiry with this phone number within the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    // Query supabase
    const { data: existing, error: findError } = await supabaseServer
      .from("inquiries")
      .select("id")
      .eq("phone", cleanedPhone)
      .gt("created_at", thirtyMinutesAgo)
      .order("created_at", { ascending: false })
      .limit(1);

    if (findError) {
      console.error("Error finding existing inquiry:", findError);
    }

    if (existing && existing.length > 0) {
      // Update existing inquiry
      const { error: updateError } = await supabaseServer
        .from("inquiries")
        .update({
          name: data.name,
          email: data.email || null,
          package: data.package || null,
          travel_date: data.date || null,
          guests: data.guests || null,
          message: data.message || null,
          source: data.source || null,
          page_url: data.pageUrl || null,
          utm_source: data.utmSource || null,
          utm_campaign: data.utmCampaign || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing[0].id);

      if (updateError) {
        console.error("Error updating existing inquiry:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, message: "Inquiry updated successfully", id: existing[0].id, isUpdate: true };
    } else {
      // Create new inquiry
      const { data: newRecord, error: insertError } = await supabaseServer
        .from("inquiries")
        .insert({
          name: data.name,
          phone: cleanedPhone,
          email: data.email || null,
          package: data.package || null,
          travel_date: data.date || null,
          guests: data.guests || null,
          message: data.message || null,
          source: data.source || null,
          page_url: data.pageUrl || null,
          utm_source: data.utmSource || null,
          utm_campaign: data.utmCampaign || null,
          status: "Pending"
        })
        .select("id");

      if (insertError) {
        console.error("Error inserting inquiry:", insertError);
        return { success: false, error: insertError.message };
      }

      return { 
        success: true, 
        message: "Inquiry created successfully", 
        id: newRecord && newRecord.length > 0 ? newRecord[0].id : null,
        isUpdate: false
      };
    }
  } catch (err: any) {
    console.error("Inquiry submission server error:", err);
    return { success: false, error: err.message };
  }
}

export async function getLeadsData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data: leads, error } = await supabaseServer
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      return { success: false, error: error.message };
    }

    // Calculate metrics
    const totalLeads = leads.length;
    const pendingLeads = leads.filter((l: any) => l.status === "Pending").length;
    const contactedLeads = leads.filter((l: any) => l.status === "Contacted").length;
    const resolvedLeads = leads.filter((l: any) => l.status === "Resolved").length;

    // Time boundaries (IST: UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(Date.now() + istOffset);
    
    // Start of today IST
    const todayIST = new Date(nowIST.getTime());
    todayIST.setUTCHours(0, 0, 0, 0);
    const startOfToday = new Date(todayIST.getTime() - istOffset);

    // Start of month IST
    const monthIST = new Date(nowIST.getTime());
    monthIST.setUTCDate(1);
    monthIST.setUTCHours(0, 0, 0, 0);
    const startOfMonth = new Date(monthIST.getTime() - istOffset);

    const todayLeads = leads.filter((l: any) => new Date(l.created_at) >= startOfToday).length;
    const thisMonthLeads = leads.filter((l: any) => new Date(l.created_at) >= startOfMonth).length;

    return {
      success: true,
      data: {
        leads,
        metrics: {
          totalLeads,
          pendingLeads,
          contactedLeads,
          resolvedLeads,
          todayLeads,
          thisMonthLeads,
        }
      }
    };
  } catch (err: any) {
    console.error("Error getting leads data:", err);
    return { success: false, error: err.message };
  }
}

export async function updateLeadStatus(id: number, status: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("inquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating lead status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating lead status:", err);
    return { success: false, error: err.message };
  }
}

export async function submitCancellationRequest(data: {
  bookingId: string;
  customerName: string;
  phone: string;
  email: string;
  packageName: string;
  travelDate: string;
  cancellationReason: string;
  refundPolicyAccepted: boolean;
}) {
  // Input validations
  if (!data.bookingId.trim()) return { success: false, error: "Booking ID is required." };
  if (!data.customerName.trim()) return { success: false, error: "Customer name is required." };
  if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 10) {
    return { success: false, error: "A valid phone number with at least 10 digits is required." };
  }
  if (!data.email.trim() || !data.email.includes("@")) {
    return { success: false, error: "A valid email address is required." };
  }
  if (!data.packageName.trim()) return { success: false, error: "Package name is required." };
  if (!data.travelDate.trim()) return { success: false, error: "Travel date is required." };
  if (!data.cancellationReason.trim()) return { success: false, error: "Cancellation reason is required." };
  if (!data.refundPolicyAccepted) {
    return { success: false, error: "You must accept the Refund Policy." };
  }

  const cleanedPhone = data.phone.replace(/\D/g, "");

  try {
    // Spam protection: prevent duplicate submission for the same booking_id in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: existing, error: findError } = await supabaseServer
      .from("booking_cancellations")
      .select("id")
      .eq("booking_id", data.bookingId.trim())
      .gt("created_at", fifteenMinutesAgo)
      .limit(1);

    if (findError) {
      console.error("Error checking existing cancellations:", findError);
    }

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "A cancellation request for this Booking ID was already submitted recently. Please wait a few minutes or contact support.",
      };
    }

    // Insert to Supabase
    const { data: newRecord, error: insertError } = await supabaseServer
      .from("booking_cancellations")
      .insert({
        booking_id: data.bookingId.trim(),
        customer_name: data.customerName.trim(),
        phone: cleanedPhone,
        email: data.email.trim(),
        package_name: data.packageName.trim(),
        travel_date: data.travelDate.trim(),
        cancellation_reason: data.cancellationReason.trim(),
        refund_policy_accepted: data.refundPolicyAccepted,
        status: "Pending",
        refund_status: "Eligible",
        admin_notes: ""
      })
      .select("id");

    if (insertError) {
      console.error("Error inserting cancellation:", insertError);
      return { success: false, error: insertError.message };
    }

    // Send customer email notification via SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Kamakhya Yatra Team" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
        to: data.email.trim(),
        subject: "Booking Cancellation Request Received",
        text: `Namaste ${data.customerName.trim()},\n\nWe have received your booking cancellation request.\n\nBooking ID: ${data.bookingId.trim()}\nPackage: ${data.packageName.trim()}\n\nOur team will contact you within 24-72 hours.\n\nRefund eligibility will be reviewed according to the existing Refund Policy available on the website.\n\nThank you,\nKamakhya Yatra Team\nhttps://www.kamakhyayatra.com`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Failed to send cancellation email:", emailErr);
    }

    return {
      success: true,
      id: newRecord && newRecord.length > 0 ? newRecord[0].id : null,
    };
  } catch (err: any) {
    console.error("Cancellation submission error:", err);
    return { success: false, error: err.message };
  }
}

export async function getCancellationsData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data: cancellations, error } = await supabaseServer
      .from("booking_cancellations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cancellations:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: cancellations || [],
    };
  } catch (err: any) {
    console.error("Error getting cancellations data:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCancellationStatus(id: number, status: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Fetch details for email
    const { data: record, error: fetchError } = await supabaseServer
      .from("booking_cancellations")
      .select("customer_name, email, booking_id, package_name")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("booking_cancellations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating cancellation status:", error);
      return { success: false, error: error.message };
    }

    // 2. Send email notification asynchronously
    if (record && !fetchError) {
      sendCancellationEmailUpdate(
        record.customer_name,
        record.email,
        record.booking_id,
        record.package_name,
        "status",
        status
      ).catch(e => console.error("Email update failed:", e));
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating cancellation status:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCancellationRefundStatus(id: number, refundStatus: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Fetch details for email
    const { data: record, error: fetchError } = await supabaseServer
      .from("booking_cancellations")
      .select("customer_name, email, booking_id, package_name")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("booking_cancellations")
      .update({
        refund_status: refundStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating refund status:", error);
      return { success: false, error: error.message };
    }

    // 2. Send email notification asynchronously
    if (record && !fetchError) {
      sendCancellationEmailUpdate(
        record.customer_name,
        record.email,
        record.booking_id,
        record.package_name,
        "refund",
        refundStatus
      ).catch(e => console.error("Email update failed:", e));
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating refund status:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCancellationAdminNotes(id: number, notes: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("booking_cancellations")
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating admin notes:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating admin notes:", err);
    return { success: false, error: err.message };
  }
}

async function sendCancellationEmailUpdate(
  customerName: string,
  email: string,
  bookingId: string,
  packageName: string,
  updateType: "status" | "refund",
  newValue: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS,
      },
    });

    let subject = "";
    let messageText = "";

    if (updateType === "status") {
      subject = `Booking Cancellation Update: Request ${newValue} - Booking ID ${bookingId}`;
      messageText = `Namaste ${customerName},\n\nThis is an update regarding your booking cancellation request for Booking ID: ${bookingId} (Package: ${packageName}).\n\nThe status of your cancellation request has been updated to: ${newValue}.\n\nOur team is processing it according to our Refund Policy. If we need any further details, we will get in touch with you.\n\nThank you,\nKamakhya Yatra Team\nhttps://www.kamakhyayatra.com`;
    } else {
      subject = `Refund Status Update: ${newValue} - Booking ID ${bookingId}`;
      messageText = `Namaste ${customerName},\n\nThis is an update regarding your refund for Booking ID: ${bookingId} (Package: ${packageName}).\n\nThe refund status has been updated to: ${newValue}.\n\n` +
        (newValue === "Refund Processed" 
          ? "The refund amount has been successfully processed and credited to your original payment source or the bank account provided. Please allow 3-7 business days for it to reflect in your statement."
          : newValue === "Refund Initiated"
          ? "Your refund transaction has been initiated. It is currently being processed by our banking channels."
          : newValue === "Eligible"
          ? "Your cancellation has been reviewed and marked as eligible for refund. The refund transaction will be initiated shortly."
          : "We have reviewed your request, and per our policy guidelines, this booking is not eligible for refund.") +
        `\n\nIf you have any questions, please contact our helpline at +91 70790 44000.\n\nThank you,\nKamakhya Yatra Team\nhttps://www.kamakhyayatra.com`;
    }

    const mailOptions = {
      from: `"Kamakhya Yatra Team" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: email,
      subject: subject,
      text: messageText,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email update notification sent to ${email} successfully.`);
  } catch (err) {
    console.error("Failed to send SMTP email update notification:", err);
  }
}


