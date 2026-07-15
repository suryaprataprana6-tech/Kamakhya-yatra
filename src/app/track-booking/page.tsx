import { Metadata } from "next";
import TrackBookingClient from "./TrackBookingClient";

export const metadata: Metadata = {
  title: "Track Booking | Kamakhya Yatra",
  description: "Track your spiritual travel booking request status, verify payments, and coordinate with your yatra supervisor.",
  alternates: {
    canonical: "/track-booking",
  },
};

export const revalidate = 0; // Dynamic tracking values need up-to-date lookups

export default function Page() {
  return <TrackBookingClient />;
}
