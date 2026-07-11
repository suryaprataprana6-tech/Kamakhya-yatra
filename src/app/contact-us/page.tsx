import { Metadata } from "next";
import ContactUsClient from "./ContactUsClient";

export const metadata: Metadata = {
  title: "Contact Us | Kamakhya Yatra - Travel Agency in Ranchi",
  description: "Get in touch with Kamakhya Yatra's Ranchi office. Contact us at +91 70790 44000 or email us for custom tour packages, pricing, and queries.",
  alternates: {
    canonical: "/contact-us",
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}
