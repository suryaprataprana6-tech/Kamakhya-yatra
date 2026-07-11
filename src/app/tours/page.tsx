import { Metadata } from "next";
import ToursClient from "./ToursClient";

import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Explore Yatra & Tour Packages | Kamakhya Yatra",
  description: "Browse our complete catalogue of spiritual pilgrimages (Char Dham, Amarnath, Rameshwaram), domestic holiday tours (Kerala, Kashmir), and premium international destinations.",
  alternates: {
    canonical: "/tours",
  },
};

export const revalidate = 60;

export default async function ToursPage() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <ToursClient initialPackages={packages || []} />;
}
