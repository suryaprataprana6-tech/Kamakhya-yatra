import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Travel Gallery & Testimonials | Kamakhya Yatra",
  description: "See happy moments and memories from our travelers on their spiritual pilgrimages and holidays. View photos and video reviews from our clients.",
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
