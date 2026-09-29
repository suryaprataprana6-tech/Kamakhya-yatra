import { Metadata } from "next";
import BookClient from "./BookClient";
import { supabaseServer } from "@/utils/supabaseServer";

import { packagesData } from "@/data/packages";

export const metadata: Metadata = {
  title: "Book Your Yatra | Kamakhya Yatra",
  description: "Secure your spiritual pilgrimage or holiday tour package. Send booking inquiries directly to our luxury travel specialists.",
  alternates: {
    canonical: "/book",
  },
};

export const revalidate = 60;

export default async function Page() {
  const { data: dbPackages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  const packages = dbPackages && dbPackages.length > 0 ? dbPackages : packagesData;

  return <BookClient initialPackages={packages} />;
}
