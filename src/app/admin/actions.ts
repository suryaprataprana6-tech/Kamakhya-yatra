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

  // 7. Booking Financial Metrics
  const { data: bookingsForAnalytics, error: bookingsError } = await supabaseServer
    .from("booking_requests")
    .select("package_cost, advance_amount, balance_amount, booking_status");

  if (bookingsError) {
    console.error("Error querying bookings for analytics:", bookingsError);
  }

  let totalBookingValue = 0;
  let totalAdvanceCollected = 0;
  let pendingBalanceAmount = 0;
  let confirmedBookings = 0;

  if (bookingsForAnalytics) {
    bookingsForAnalytics.forEach((b: any) => {
      // Exclude Cancelled bookings from overall sums if desired, 
      // but typically we sum based on specific logic. Let's include non-cancelled for balance.
      if (b.booking_status !== "Cancelled") {
        pendingBalanceAmount += Number(b.balance_amount) || 0;
        totalBookingValue += Number(b.package_cost) || 0;
        totalAdvanceCollected += Number(b.advance_amount) || 0;
      }
      
      if (b.booking_status === "Confirmed" || b.booking_status === "Completed") {
        confirmedBookings += 1;
      }
    });
  }

  return {
    success: true,
    data: {
      liveNowCount,
      todayPageViews: todayPageViews || 0,
      topPages,
      visitsChart,
      totalBookingValue,
      totalAdvanceCollected,
      pendingBalanceAmount,
      confirmedBookings
    }
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

    // Create admin notification
    await createAdminNotification(
      "cancellation_request",
      `Cancellation Request: ${data.bookingId.trim()}`,
      `Cancellation request submitted by ${data.customerName.trim()} for package ${data.packageName.trim()}. Reason: ${data.cancellationReason.trim()}`,
      "cancellations",
      data.bookingId.trim()
    ).catch(err => console.error("Failed to create admin cancellation notification:", err));

    // Send admin notification email
    await sendAdminCancellationNotificationEmail({
      bookingId: data.bookingId.trim(),
      customerName: data.customerName.trim(),
      phone: cleanedPhone,
      email: data.email.trim(),
      packageName: data.packageName.trim(),
      travelDate: data.travelDate.trim(),
      cancellationReason: data.cancellationReason.trim()
    }).catch(err => console.error("Failed to send admin cancellation email:", err));

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
      await sendCancellationEmailUpdate(
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
      await sendCancellationEmailUpdate(
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

// ==========================================
// ENTERPRISE BOOKING CRM SERVER ACTIONS
// ==========================================

export async function submitBookingRequest(data: {
  customerName: string;
  phone: string;
  email: string;
  packageName: string;
  packageId?: number;
  travelDate: string;
  boardingPoint: string;
  numberOfTravellers: number;
  specialRequirements?: string;
  source?: string;
  pageUrl?: string;
  utmSource?: string;
  utmCampaign?: string;
  travelClass?: string;
  packageCost?: number;
  advanceAmount?: number;
  balanceAmount?: number;
  hotelCategory?: string;
  mealCategory?: string;
  transportCategory?: string;
}) {
  try {
    // 1. Basic validation
    if (!data.customerName || !data.phone || !data.email || !data.packageName || !data.travelDate || !data.boardingPoint || !data.numberOfTravellers) {
      return { success: false, error: "Missing required fields" };
    }

    // Phone format verification (digits only, length 10-15)
    const cleanPhone = data.phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { success: false, error: "Invalid mobile number. Must contain 10-15 digits." };
    }

    // Check departure availability and allocate seats based on class
    const { data: departure } = await supabaseServer
      .from("tour_departures")
      .select("*")
      .eq("package_name", data.packageName)
      .eq("departure_date", data.travelDate)
      .maybeSingle();

    let targetTotalField = "total_seats";
    let targetBookedField = "booked_seats";
    
    if (data.travelClass === "Sleeper (SL)") { targetTotalField = "sl_total_seats"; targetBookedField = "sl_booked_seats"; }
    else if (data.travelClass === "3AC") { targetTotalField = "ac3_total_seats"; targetBookedField = "ac3_booked_seats"; }
    else if (data.travelClass === "2AC") { targetTotalField = "ac2_total_seats"; targetBookedField = "ac2_booked_seats"; }
    else if (data.travelClass === "Flight") { targetTotalField = "flight_total_seats"; targetBookedField = "flight_booked_seats"; }

    if (departure) {
      const classTotal = departure[targetTotalField] || 0;
      const classBooked = departure[targetBookedField] || 0;
      const classAvailable = classTotal - classBooked;

      // Also track overall totals to maintain backward compatibility
      const overallTotal = departure.total_seats || 0;
      const overallBooked = departure.booked_seats || 0;
      const overallAvailable = overallTotal - overallBooked;

      if (classTotal > 0 && classAvailable < data.numberOfTravellers) {
        return { success: false, error: `Seats fully booked for ${data.travelClass || 'selected class'}. Only ${classAvailable} seat(s) remaining for this date.` };
      } else if (classTotal === 0 && overallAvailable < data.numberOfTravellers) {
        // Fallback to overall seats if specific class seats are not configured
        return { success: false, error: `Seats fully booked. Only ${overallAvailable} seat(s) remaining for this date.` };
      }
      
      const newClassBooked = classBooked + data.numberOfTravellers;
      const newOverallBooked = overallBooked + data.numberOfTravellers;
      const newOverallAvailable = overallTotal - newOverallBooked;
      const newStatus = newOverallAvailable <= 0 ? "Sold Out" : departure.status;
      
      const updatePayload: any = {
        booked_seats: newOverallBooked,
        available_seats: newOverallAvailable,
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (classTotal > 0) {
        updatePayload[targetBookedField] = newClassBooked;
      }
      
      const { error: depUpdateError } = await supabaseServer
        .from("tour_departures")
        .update(updatePayload)
        .eq("id", departure.id);
        
      if (depUpdateError) {
        console.error("Failed to update departure seats:", depUpdateError);
        return { success: false, error: "Failed to allocate seats for this booking." };
      }
    } else {
      // Auto-schedule default departure with generic 40 seats
      const totalSeats = 40;
      const bookedSeats = data.numberOfTravellers;
      const availableSeats = totalSeats - bookedSeats;
      
      const insertPayload: any = {
        package_id: data.packageId || null,
        package_name: data.packageName,
        departure_date: data.travelDate,
        total_seats: totalSeats,
        booked_seats: bookedSeats,
        available_seats: availableSeats,
        status: availableSeats === 0 ? "Sold Out" : "Open"
      };

      if (data.travelClass) {
        insertPayload[targetTotalField] = totalSeats;
        insertPayload[targetBookedField] = bookedSeats;
      }
      
      const { error: depInsertError } = await supabaseServer
        .from("tour_departures")
        .insert(insertPayload);
        
      if (depInsertError) {
        console.warn("Failed to auto-create tour departure:", depInsertError);
      }
    }

    // 2. Insert record
    const { data: record, error } = await supabaseServer
      .from("booking_requests")
      .insert({
        customer_name: data.customerName,
        phone: cleanPhone,
        email: data.email,
        package_name: data.packageName,
        package_id: data.packageId || null,
        travel_date: data.travelDate,
        boarding_point: data.boardingPoint,
        number_of_travellers: data.numberOfTravellers,
        special_requirements: data.specialRequirements || null,
        booking_amount: data.packageCost || (5000.00 * data.numberOfTravellers),
        advance_amount: data.advanceAmount || 5000.00,
        package_cost: data.packageCost || 0,
        balance_amount: data.balanceAmount || 0,
        travel_class: data.travelClass || null,
        hotel_category: data.hotelCategory || null,
        meal_category: data.mealCategory || null,
        transport_category: data.transportCategory || null,
        payment_status: "Unpaid",
        booking_status: "Pending",
        source: data.source || "Direct",
        page_url: data.pageUrl || null,
        utm_source: data.utmSource || null,
        utm_campaign: data.utmCampaign || null
      })
      .select("*")
      .single();

    if (error || !record) {
      console.error("Database insert error:", error);
      return { success: false, error: error?.message || "Failed to create booking record." };
    }

    // Create admin notification in database
    await createAdminNotification(
      "new_booking",
      `New Booking: ${record.booking_reference}`,
      `New booking request submitted by ${record.customer_name} for ${record.package_name}.`,
      "bookings",
      record.booking_reference
    ).catch(err => console.error("Failed to create admin booking notification:", err));

    // Send admin notification email via SMTP
    await sendAdminBookingReceiptEmail(record).catch(err => {
      console.error("Failed to send admin booking alert email:", err);
    });

    // 3. Send receipt email via SMTP
    await sendBookingReceiptEmail(record).catch(err => {
      console.error("Failed to send booking receipt email:", err);
    });

    return { 
      success: true, 
      id: record.id, 
      booking_reference: record.booking_reference,
      advance_amount: record.advance_amount
    };
  } catch (err: any) {
    console.error("Booking request submission error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function submitBookingPayment(
  bookingId: number,
  transactionId: string,
  formData: FormData
) {
  try {
    if (!bookingId || !transactionId) {
      return { success: false, error: "Booking ID and Transaction ID are required" };
    }

    const file = formData.get("screenshot") as File;
    if (!file) {
      return { success: false, error: "Please upload the payment screenshot." };
    }

    // Validate screenshot size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size exceeds limit of 5MB." };
    }

    // Validate screenshot type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Unsupported file type. Only JPG, PNG, WEBP, and PDF files are allowed." };
    }

    // Convert file to buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic clean name for file
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `screenshots/${bookingId}_${Date.now()}_${cleanFileName}`;

    // Upload to Supabase bucket 'booking-payments'
    const { error: uploadError } = await supabaseServer.storage
      .from("booking-payments")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return { success: false, error: "Failed to upload payment screenshot: " + uploadError.message };
    }

    // Get Public URL
    const { data: publicUrlData } = supabaseServer.storage
      .from("booking-payments")
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    // Update database record
    const { error: dbError } = await supabaseServer
      .from("booking_requests")
      .update({
        transaction_id: transactionId,
        payment_screenshot: publicUrl,
        payment_status: "Payment Submitted",
        booking_status: "Payment Awaiting", // Awaiting verification
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (dbError) {
      console.error("Database update error:", dbError);
      return { success: false, error: "Failed to save payment details in database." };
    }

    // Fetch full booking details for notifications
    try {
      const { data: bookingRecord } = await supabaseServer
        .from("booking_requests")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingRecord) {
        // Create database notification
        await createAdminNotification(
          "payment_upload",
          `Payment Submitted: ${bookingRecord.booking_reference}`,
          `Payment screenshot and Transaction ID (${transactionId}) uploaded by ${bookingRecord.customer_name}. Verification pending.`,
          "bookings",
          bookingRecord.booking_reference
        );

        // Send admin notification email
        await sendAdminPaymentNotificationEmail(bookingRecord, transactionId, publicUrl);
      }
    } catch (notificationErr: any) {
      console.error("Error processing admin payment notification:", notificationErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Payment details submission error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function trackBookingRequest(bookingReference: string, phone: string) {
  try {
    const cleanRef = bookingReference.trim();
    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    if (!cleanRef || !cleanPhone) {
      return { success: false, error: "Booking Reference and Phone Number are required" };
    }

    const { data: record, error } = await supabaseServer
      .from("booking_requests")
      .select("*")
      .eq("booking_reference", cleanRef)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) {
      console.error("Error tracking booking:", error);
      return { success: false, error: error.message };
    }

    if (!record) {
      return { success: false, error: "No booking found with this reference and mobile number." };
    }

    return { success: true, data: record };
  } catch (err: any) {
    console.error("Track booking error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function getBookingsData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await supabaseServer
      .from("booking_requests")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching bookings:", err);
    return { success: false, error: err.message };
  }
}

export async function updateBookingStatus(id: number, status: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data: record, error: fetchError } = await supabaseServer
      .from("booking_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !record) {
      return { success: false, error: "Booking request not found" };
    }

    // Release seats on departure if cancelled
    if (status === "Cancelled" && record.booking_status !== "Cancelled") {
      const { data: departure } = await supabaseServer
        .from("tour_departures")
        .select("*")
        .eq("package_name", record.package_name)
        .eq("departure_date", record.travel_date)
        .maybeSingle();

      if (departure) {
        const newBooked = Math.max(0, departure.booked_seats - record.number_of_travellers);
        const newAvailable = departure.total_seats - newBooked;
        const newStatus = departure.status === "Sold Out" && newAvailable > 0 ? "Open" : departure.status;

        await supabaseServer
          .from("tour_departures")
          .update({
            booked_seats: newBooked,
            available_seats: newAvailable,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", departure.id);
      }
    }

    // Re-allocate seats if restoring a cancelled booking
    if (record.booking_status === "Cancelled" && status !== "Cancelled") {
      const { data: departure } = await supabaseServer
        .from("tour_departures")
        .select("*")
        .eq("package_name", record.package_name)
        .eq("departure_date", record.travel_date)
        .maybeSingle();

      if (departure) {
        if (departure.available_seats < record.number_of_travellers) {
          return { success: false, error: `Cannot restore booking. Departure date is fully booked. Only ${departure.available_seats} seat(s) available.` };
        }

        const newBooked = departure.booked_seats + record.number_of_travellers;
        const newAvailable = departure.total_seats - newBooked;
        const newStatus = newAvailable === 0 ? "Sold Out" : departure.status;

        await supabaseServer
          .from("tour_departures")
          .update({
            booked_seats: newBooked,
            available_seats: newAvailable,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", departure.id);
      }
    }

    const { error } = await supabaseServer
      .from("booking_requests")
      .update({
        booking_status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating booking status:", error);
      return { success: false, error: error.message };
    }

    // Send email update to customer if successful
    if (record && !fetchError) {
      await sendBookingStatusUpdateEmail(record, status).catch(e => {
        console.error("Booking status update email failed:", e);
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating booking status:", err);
    return { success: false, error: err.message };
  }
}

export async function updateBookingPaymentStatus(id: number, paymentStatus: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("booking_requests")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating booking payment status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating booking payment status:", err);
    return { success: false, error: err.message };
  }
}

export async function assignBookingStaff(id: number, staff: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("booking_requests")
      .update({
        assigned_staff: staff || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error assigning staff:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error assigning staff:", err);
    return { success: false, error: err.message };
  }
}

export async function updateBookingNotes(id: number, notes: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("booking_requests")
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating booking notes:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating booking notes:", err);
    return { success: false, error: err.message };
  }
}

// Helper: send SMTP booking confirmation email
async function sendBookingReceiptEmail(record: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS
      }
    });

    const travelDateFormatted = new Date(record.travel_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const mailOptions = {
      from: `"Kamakhya Yatra" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: record.email,
      subject: `Booking Request Received - ${record.booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #0b1c3e; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Namaste ${record.customer_name},</h2>
          <p>Thank you for choosing <strong>Kamakhya Yatra</strong>.</p>
          <p>Your booking request has been received successfully. Below are your travel details:</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Booking ID:</td>
                <td style="padding: 6px 0; color: #d4af37; font-weight: bold;">${record.booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Package Name:</td>
                <td style="padding: 6px 0;">${record.package_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Travel Date:</td>
                <td style="padding: 6px 0;">${travelDateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Boarding Point:</td>
                <td style="padding: 6px 0;">${record.boarding_point}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Travellers:</td>
                <td style="padding: 6px 0;">${record.number_of_travellers}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #0b1c3e; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Fare Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Travel Category:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">${record.travel_class || "Standard"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Package Cost:</td>
                <td style="padding: 6px 0;">₹${Number(record.package_cost || 0).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Advance Paid:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: bold;">₹${Number(record.advance_amount || 0).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Balance Due:</td>
                <td style="padding: 6px 0; color: #e11d48; font-weight: bold;">₹${Number(record.balance_amount || 0).toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #eef2f7; border-left: 4px solid #0b1c3e; padding: 12px; margin: 20px 0; border-radius: 4px;">
            <strong style="color: #0b1c3e;">Current Status:</strong> <span style="font-weight: bold;">Pending Review</span>
          </div>

          <p>Our travel specialist team will review your itinerary details and verify your payment submission (if uploaded) shortly.</p>
          <p style="font-weight: bold; color: #0b1c3e;">Please save your Booking ID for online tracking.</p>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Regards,<br/><strong>Kamakhya Yatra Team</strong></p>
            <p><a href="https://www.kamakhyayatra.com" style="color: #d4af37; text-decoration: none; font-weight: bold;">www.kamakhyayatra.com</a> | Helpline: +91 70790 44000</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`SMTP confirmation email sent successfully:`);
    console.log(`- Recipient: ${mailOptions.to}`);
    console.log(`- Subject: ${mailOptions.subject}`);
    console.log(`- SMTP Response: ${info.response}`);
  } catch (err: any) {
    console.error(`Failed to send SMTP receipt email to ${record.email} with subject: Booking Request Received - ${record.booking_reference}`);
    console.error("- SMTP Error:", err.message || err);
  }
}

// Helper: send SMTP booking status update email
async function sendBookingStatusUpdateEmail(record: any, newStatus: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"Kamakhya Yatra" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: record.email,
      subject: `Booking Status Updated - ${record.booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #0b1c3e; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Namaste ${record.customer_name},</h2>
          <p>This is an official update regarding your booking with <strong>Kamakhya Yatra</strong>.</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e; width: 120px;">Booking ID:</td>
                <td style="padding: 6px 0; color: #d4af37; font-weight: bold;">${record.booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Package:</td>
                <td style="padding: 6px 0;">${record.package_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">New Status:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #27ae60;">${newStatus}</td>
              </tr>
            </table>
          </div>

          <p>
            ${newStatus === "Confirmed" 
              ? "🎉 We are delighted to inform you that your booking has been <strong>Confirmed</strong>. Your tickets, hotel bookings, and travel coordinates are locked in. A coordinator will call you details."
              : newStatus === "Payment Received"
              ? "💳 We have successfully verified your payment transaction details. Your booking is under active confirmation."
              : newStatus === "Completed"
              ? "🌟 Thank you for travelling with Kamakhya Yatra! Your yatra is completed. We hope you had a blessed and premium experience."
              : newStatus === "Cancelled"
              ? "❌ Your booking request has been marked as <strong>Cancelled</strong>. If you had paid, any eligible refund will be processed per our policy."
              : `Your booking status is currently: <strong>${newStatus}</strong>.`
            }
          </p>

          <p>You can track the live status of your booking at any time by visiting our online tracking portal using your registered mobile number and Booking ID.</p>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Regards,<br/><strong>Kamakhya Yatra Team</strong></p>
            <p><a href="https://www.kamakhyayatra.com" style="color: #d4af37; text-decoration: none; font-weight: bold;">www.kamakhyayatra.com</a> | Helpline: +91 70790 44000</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`SMTP update email sent successfully to ${record.email} (Status: ${newStatus})`);
  } catch (err) {
    console.error("Failed to send SMTP update email:", err);
  }
}

// ==========================================
// ADMIN NOTIFICATION SYSTEM ACTIONS
// ==========================================

export async function getNotifications() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await supabaseServer
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    return { success: false, error: err.message };
  }
}

export async function markNotificationRead(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error marking notification read:", err);
    return { success: false, error: err.message };
  }
}

export async function markAllNotificationsRead() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications read:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error marking all notifications read:", err);
    return { success: false, error: err.message };
  }
}

export async function createAdminNotification(
  type: string,
  title: string,
  message: string,
  link: string,
  referenceId?: string
) {
  try {
    const { error } = await supabaseServer
      .from("admin_notifications")
      .insert({
        type,
        title,
        message,
        link,
        is_read: false,
        reference_id: referenceId || null
      });

    if (error) {
      console.error("Error inserting notification:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Error creating notification:", err);
    return { success: false, error: err.message };
  }
}

// SMTP: send admin alert email for new booking request
async function sendAdminBookingReceiptEmail(record: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS
      }
    });

    const travelDateFormatted = new Date(record.travel_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const adminEmail = "kamakhyayatra19@gmail.com";
    const mailOptions = {
      from: `"KY Booking System" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: adminEmail,
      subject: `🚨 [ADMIN ALERT] New Booking Submitted - Ref: ${record.booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #0b1c3e; border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-top: 0;">New Booking Request Received</h2>
          <p>A new tour booking request has been submitted by a client. Details below:</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e; width: 150px;">Booking Ref ID:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">${record.booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Customer Name:</td>
                <td style="padding: 6px 0;">${record.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Phone Number:</td>
                <td style="padding: 6px 0;">${record.phone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Email Address:</td>
                <td style="padding: 6px 0;">${record.email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Yatra Package:</td>
                <td style="padding: 6px 0;">${record.package_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Travel Date:</td>
                <td style="padding: 6px 0;">${travelDateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Pilgrim Count:</td>
                <td style="padding: 6px 0;">${record.number_of_travellers} travellers</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Boarding Point:</td>
                <td style="padding: 6px 0;">${record.boarding_point}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Requirements:</td>
                <td style="padding: 6px 0; color: #555; font-style: italic;">${record.special_requirements || "None"}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="https://www.kamakhyayatra.com/admin" style="background-color: #0b1c3e; color: #white; text-decoration: none; font-weight: bold; padding: 12px 30px; border-radius: 6px; display: inline-block;">
              Open Admin Dashboard
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`SMTP admin alert booking receipt email sent successfully to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send SMTP admin booking alert email:", err);
  }
}

// SMTP: send admin alert email for payment verification upload
async function sendAdminPaymentNotificationEmail(bookingRecord: any, transactionId: string, screenshotUrl: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS
      }
    });

    const adminEmail = "kamakhyayatra19@gmail.com";
    const mailOptions = {
      from: `"KY Payment System" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: adminEmail,
      subject: `💰 [ADMIN ALERT] Payment Uploaded - Ref: ${bookingRecord.booking_reference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #0b1c3e; border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-top: 0;">Payment Screenshot Submitted</h2>
          <p>A client has uploaded payment proof for their booking. Details below:</p>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e; width: 150px;">Booking Ref ID:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #d4af37;">${bookingRecord.booking_reference}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Customer Name:</td>
                <td style="padding: 6px 0;">${bookingRecord.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">UTR / Transaction ID:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Advance Amount:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #27ae60;">₹${Number(bookingRecord.advance_amount || 5000.0).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #0b1c3e;">Screenshot Proof:</td>
                <td style="padding: 6px 0;">
                  <a href="${screenshotUrl}" target="_blank" style="color: #3182ce; font-weight: bold; text-decoration: underline;">
                    View Uploaded Screenshot File
                  </a>
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="https://www.kamakhyayatra.com/admin" style="background-color: #0b1c3e; color: #white; text-decoration: none; font-weight: bold; padding: 12px 30px; border-radius: 6px; display: inline-block;">
              Open Dashboard for Verification
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`SMTP admin alert payment receipt email sent successfully to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send SMTP admin payment alert email:", err);
  }
}

// SMTP: send admin alert email for cancellation request
async function sendAdminCancellationNotificationEmail(data: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "kamakhyayatra19@gmail.com",
        pass: process.env.SMTP_PASS
      }
    });

    const adminEmail = "kamakhyayatra19@gmail.com";
    const mailOptions = {
      from: `"KY Cancellation System" <${process.env.SMTP_USER || "kamakhyayatra19@gmail.com"}>`,
      to: adminEmail,
      subject: `⚠️ [ADMIN ALERT] Booking Cancellation Request - Booking ID: ${data.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #c53030; border-bottom: 2px solid #e53e3e; padding-bottom: 10px; margin-top: 0;">Cancellation Request Submitted</h2>
          <p>A client has submitted a request to cancel their travel package booking. Details below:</p>
          
          <div style="background-color: #fffaf0; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #feebc8;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e; width: 150px;">Booking ID:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #c53030;">${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e;">Customer Name:</td>
                <td style="padding: 6px 0;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e;">Phone Number:</td>
                <td style="padding: 6px 0;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e;">Email Address:</td>
                <td style="padding: 6px 0;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e;">Yatra Package:</td>
                <td style="padding: 6px 0;">${data.packageName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e;">Travel Date:</td>
                <td style="padding: 6px 0;">${data.travelDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #7b341e; vertical-align: top;">Reason:</td>
                <td style="padding: 6px 0; color: #742a2a; font-style: italic;">${data.cancellationReason}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="https://www.kamakhyayatra.com/admin" style="background-color: #c53030; color: #white; text-decoration: none; font-weight: bold; padding: 12px 30px; border-radius: 6px; display: inline-block;">
              Open Admin cancellations Portal
            </a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`SMTP admin alert cancellation email sent successfully to ${adminEmail}`);
  } catch (err) {
    console.error("Failed to send SMTP admin cancellation email:", err);
  }
}

// ==========================================
// TOUR DEPARTURE MANAGEMENT ACTIONS
// ==========================================

export async function getDeparturesData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Fetch departures
    const { data: departures, error: depError } = await supabaseServer
      .from("tour_departures")
      .select("*")
      .order("departure_date", { ascending: true });

    if (depError) {
      console.error("Error fetching departures:", depError);
      return { success: false, error: depError.message };
    }

    // 2. Fetch packages for the dropdown selection
    const { data: packages, error: pkgError } = await supabaseServer
      .from("packages")
      .select("id, title")
      .order("title", { ascending: true });

    if (pkgError) {
      console.error("Error fetching packages for departures dropdown:", pkgError);
    }

    // 3. Compute metrics
    const totalDepartures = departures ? departures.length : 0;
    const totalSeats = (departures || []).reduce((sum, d) => sum + d.total_seats, 0);
    const bookedSeats = (departures || []).reduce((sum, d) => sum + d.booked_seats, 0);
    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
    const activeDepartures = (departures || []).filter(d => d.status === "Open" || d.status === "Guaranteed").length;
    const soldOutDepartures = (departures || []).filter(d => d.status === "Sold Out" || d.available_seats === 0).length;

    return {
      success: true,
      data: {
        departures: departures || [],
        packages: packages || [],
        metrics: {
          totalDepartures,
          totalSeats,
          bookedSeats,
          occupancyRate,
          activeDepartures,
          soldOutDepartures
        }
      }
    };
  } catch (err: any) {
    console.error("Error in getDeparturesData:", err);
    return { success: false, error: err.message };
  }
}

export async function createDeparture(data: {
  packageId?: number;
  packageName: string;
  departureDate: string;
  totalSeats: number;
  status: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // Check if unique constraint violated (already exists)
    const { data: existing } = await supabaseServer
      .from("tour_departures")
      .select("id")
      .eq("package_name", data.packageName)
      .eq("departure_date", data.departureDate)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "A departure already exists for this package and date." };
    }

    // Insert record
    const { error } = await supabaseServer
      .from("tour_departures")
      .insert({
        package_id: data.packageId || null,
        package_name: data.packageName,
        departure_date: data.departureDate,
        total_seats: data.totalSeats,
        booked_seats: 0,
        available_seats: data.totalSeats,
        status: data.status || "Open"
      });

    if (error) {
      console.error("Error creating departure:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in createDeparture:", err);
    return { success: false, error: err.message };
  }
}

export async function updateDeparture(
  id: number,
  data: {
    totalSeats: number;
    status: string;
  }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Fetch current booked seats to make sure we don't reduce total_seats below booked_seats
    const { data: current, error: fetchError } = await supabaseServer
      .from("tour_departures")
      .select("booked_seats")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return { success: false, error: "Departure not found." };
    }

    if (data.totalSeats < current.booked_seats) {
      return { success: false, error: `Cannot reduce total seats below booked seats (${current.booked_seats}).` };
    }

    const availableSeats = data.totalSeats - current.booked_seats;
    const resolvedStatus = availableSeats === 0 ? "Sold Out" : data.status;

    const { error } = await supabaseServer
      .from("tour_departures")
      .update({
        total_seats: data.totalSeats,
        available_seats: availableSeats,
        status: resolvedStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating departure:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateDeparture:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteDeparture(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    // Check if there are booked seats
    const { data: current } = await supabaseServer
      .from("tour_departures")
      .select("booked_seats")
      .eq("id", id)
      .single();

    if (current && current.booked_seats > 0) {
      return { success: false, error: "Cannot delete a departure that has bookings assigned." };
    }

    const { error } = await supabaseServer
      .from("tour_departures")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting departure:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteDeparture:", err);
    return { success: false, error: err.message };
  }
}

export async function getDepartureBookings(packageName: string, departureDate: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await supabaseServer
      .from("booking_requests")
      .select("booking_reference, customer_name, phone, email, number_of_travellers, booking_status, payment_status, created_at")
      .eq("package_name", packageName)
      .eq("travel_date", departureDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching departure bookings:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error in getDepartureBookings:", err);
    return { success: false, error: err.message };
  }
}


// ==========================================
// FARES MANAGEMENT SYSTEM ACTIONS
// ==========================================

export async function getFaresData() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await supabaseServer
      .from("package_fares")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching fares:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error fetching fares:", err);
    return { success: false, error: err.message };
  }
}

export async function createFare(data: any) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("package_fares")
      .insert({
        package_name: data.package_name,
        sl_fare: data.sl_fare || 0,
        ac3_extra_charge: data.ac3_extra_charge || 0,
        ac2_extra_charge: data.ac2_extra_charge || 0,
        flight_fare: data.flight_fare || 0,
        sl_services: data.sl_services || { hotel: "Standard", meals: "Basic", transport: "Shared Vehicle", support: "Normal" },
        ac3_services: data.ac3_services || { hotel: "Deluxe", meals: "Standard", transport: "AC Vehicle", support: "Priority" },
        ac2_services: data.ac2_services || { hotel: "Premium", meals: "Premium", transport: "AC Deluxe Vehicle", support: "Priority" },
        flight_services: data.flight_services || { hotel: "Luxury", meals: "Premium", transport: "Premium Vehicle", support: "VIP" },
        is_active: data.is_active !== undefined ? data.is_active : true,
      });

    if (error) {
      console.error("Error creating fare:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in createFare:", err);
    return { success: false, error: err.message };
  }
}

export async function updateFare(id: number, data: any) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("package_fares")
      .update({
        package_name: data.package_name,
        sl_fare: data.sl_fare,
        ac3_extra_charge: data.ac3_extra_charge,
        ac2_extra_charge: data.ac2_extra_charge,
        flight_fare: data.flight_fare,
        sl_services: data.sl_services,
        ac3_services: data.ac3_services,
        ac2_services: data.ac2_services,
        flight_services: data.flight_services,
        is_active: data.is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating fare:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateFare:", err);
    return { success: false, error: err.message };
  }
}

export async function toggleFareStatus(id: number, isActive: boolean) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabaseServer
      .from("package_fares")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling fare status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in toggleFareStatus:", err);
    return { success: false, error: err.message };
  }
}

export async function getPublicFares(packageName: string) {
  try {
    const { data, error } = await supabaseServer
      .from("package_fares")
      .select("*")
      .eq("package_name", packageName)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching public fare:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Error in getPublicFares:", err);
    return { success: false, error: err.message };
  }
}

export async function getActivePackages() {
  try {
    const { data, error } = await supabaseServer
      .from('packages')
      .select('id, title')
      .order('title', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function searchPackagesForAI(query: string) {
  try {
    const searchPattern = `%${query}%`;
    const { data: packages, error } = await supabaseServer
      .from("packages")
      .select("*")
      .or(`title.ilike.${searchPattern},location.ilike.${searchPattern},slug.ilike.${searchPattern}`);

    if (error) {
      console.error("AI Package Search Error:", error);
      return [];
    }
    
    if (!packages || packages.length === 0) return [];

    // Fetch fares for matched packages
    const packageIds = packages.map(p => p.id);
    const { data: fares } = await supabaseServer
      .from("package_fares")
      .select("*")
      .in("package_id", packageIds);

    const enrichedPackages = packages.map(pkg => {
      const fare = fares?.find(f => f.package_id === pkg.id);
      return {
        ...pkg,
        fares: fare || null
      };
    });

    return enrichedPackages;
  } catch (err) {
    console.error("AI Package Search Exception:", err);
    return [];
  }
}

