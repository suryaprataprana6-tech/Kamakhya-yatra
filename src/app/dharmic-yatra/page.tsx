import { Metadata } from "next";
import YatraCategoryPage from "@/components/YatraCategoryPage";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Dharmic Yatra - Spiritual Pilgrimages & Holy Shrines | Kamakhya Yatra",
  description: "Embark on guided pilgrimages to India's sacred sites (Char Dham, Kedarnath, Amarnath, Rameshwaram, Jyotirlingas) with elderly support, vegetarian food, and luxury cabs.",
  alternates: {
    canonical: "/dharmic-yatra",
  },
};

export const revalidate = 60;

export default async function DharmicYatra() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <YatraCategoryPage categorySlug="dharmic" initialPackages={packages || []} />;
}
