import { Metadata } from "next";
import ToursClient from "./ToursClient";

export const metadata: Metadata = {
  title: "Explore Yatra & Tour Packages | Kamakhya Yatra",
  description: "Browse our complete catalogue of spiritual pilgrimages (Char Dham, Amarnath, Rameshwaram), domestic holiday tours (Kerala, Kashmir), and premium international destinations.",
  alternates: {
    canonical: "/tours",
  },
};

export default function ToursPage() {
  return <ToursClient />;
}
