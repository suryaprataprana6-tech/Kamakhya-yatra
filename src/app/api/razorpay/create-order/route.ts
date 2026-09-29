import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount, currency } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Missing bookingId or amount" },
        { status: 400 }
      );
    }

    // Validate the booking exists and is in correct state
    const { data: booking, error: bookingError } = await supabaseServer
      .from("booking_requests")
      .select("id, booking_reference, customer_name, email, phone, payment_status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Don't allow duplicate payments for already-paid bookings
    if (booking.payment_status === "Paid" || booking.payment_status === "Verified") {
      return NextResponse.json(
        { error: "Payment already completed for this booking" },
        { status: 400 }
      );
    }

    const rawKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const keyId = rawKeyId.replace(/^["']|["']$/g, "").trim();
    const keySecret = rawKeySecret.replace(/^["']|["']$/g, "").trim();

    if (!keyId || !keySecret) {
      console.error("[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars");
      return NextResponse.json(
        { error: "Payment gateway configuration error. Contact support." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Amount must be in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: `booking_${bookingId}`,
      notes: {
        booking_id: String(bookingId),
        booking_reference: booking.booking_reference || "",
        customer_name: booking.customer_name || "",
      },
    });

    // Store the Razorpay order ID on the booking record for later verification
    await supabaseServer
      .from("booking_requests")
      .update({
        transaction_id: `rzp_order_${order.id}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (err: any) {
    console.error("[Razorpay] Order creation error:", err);
    return NextResponse.json(
      { error: err?.error?.description || err?.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
