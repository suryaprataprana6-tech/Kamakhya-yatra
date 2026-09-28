import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[Razorpay] Missing RAZORPAY_KEY_SECRET env var");
      return NextResponse.json(
        { error: "Payment gateway configuration error. Contact support." },
        { status: 500 }
      );
    }

    // Verify signature using HMAC SHA256
    // signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("[Razorpay] Signature verification failed for booking:", bookingId);

      // Update booking with failed payment status
      await supabaseServer
        .from("booking_requests")
        .update({
          payment_status: "Payment Failed",
          booking_status: "Payment Failed",
          transaction_id: `rzp_failed_${razorpay_payment_id}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Signature is valid — update the booking record
    let { error: dbError } = await supabaseServer
      .from("booking_requests")
      .update({
        transaction_id: razorpay_payment_id,
        payment_status: "Payment Submitted",
        booking_status: "Payment Awaiting",
        booking_verification_status: "Pending Verification",
        payment_verification_status: "Pending Verification",
        customer_submitted_amount: null, // Will be resolved by admin verification
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Fallback if verification columns don't exist yet
    if (dbError && (dbError.message?.includes("Could not find the") || dbError.code === "PGRST204")) {
      console.warn("[Razorpay] Verification columns not found. Using legacy update fallback.");
      const legacyResult = await supabaseServer
        .from("booking_requests")
        .update({
          transaction_id: razorpay_payment_id,
          payment_status: "Payment Submitted",
          booking_status: "Payment Awaiting",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);
      dbError = legacyResult.error;
    }

    if (dbError) {
      console.error("[Razorpay] Database update error after successful payment:", dbError);
      return NextResponse.json(
        { error: "Payment verified but failed to update booking. Contact support with payment ID: " + razorpay_payment_id },
        { status: 500 }
      );
    }

    // Fetch full booking for notifications
    try {
      const { data: bookingRecord } = await supabaseServer
        .from("booking_requests")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingRecord) {
        // Create admin notification (import not needed - inline Supabase call)
        const { error: notifError } = await supabaseServer
          .from("admin_notifications")
          .insert({
            type: "payment_upload",
            title: `Razorpay Payment: ${bookingRecord.booking_reference}`,
            message: `Online payment received via Razorpay (${razorpay_payment_id}) from ${bookingRecord.customer_name}. Verification pending.`,
            category: "bookings",
            reference_id: bookingRecord.booking_reference,
          });
        if (notifError) {
          console.warn("[Razorpay] Admin notification insert warning:", notifError);
        }
      }
    } catch (notifErr: any) {
      console.warn("[Razorpay] Notification error (non-fatal):", notifErr);
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    console.error("[Razorpay] Payment verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
