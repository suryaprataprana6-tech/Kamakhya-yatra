import type { Metadata } from "next";
import React from "react";
import CancelBookingClient from "./CancelBookingClient";

export const metadata: Metadata = {
  title: "Submit Booking Cancellation | Kamakhya Yatra",
  description: "Request tour cancellation and refund review online. Review existing refund policy and submit booking cancellation details.",
  alternates: {
    canonical: "/cancel-booking",
  },
};

export default function CancelBookingPage() {
  return <CancelBookingClient />;
}
