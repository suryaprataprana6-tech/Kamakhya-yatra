import { Metadata } from "next";
import YatraCategoryPage from "@/components/YatraCategoryPage";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Desh Yatra - Domestic Holiday Packages | Kamakhya Yatra",
  description: "Explore the scenic landscapes of India. Book premium tour packages to Kashmir, Darjeeling, Gangtok, Kerala, Rajasthan, and more with customized itineraries.",
  alternates: {
    canonical: "/desh-yatra",
  },
};

export const revalidate = 60;

export default async function DeshYatra() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <YatraCategoryPage categorySlug="desh" initialPackages={packages || []} />;
}
