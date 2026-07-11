import { Metadata } from "next";
import YatraCategoryPage from "@/components/YatraCategoryPage";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Holiday Yatra - Leisure & Honeymoon Travel | Kamakhya Yatra",
  description: "Curated leisure holidays and romantic beach packages. Plan your custom tour to Andaman, Maldives, Kerala, and other top holiday destinations.",
  alternates: {
    canonical: "/holiday-yatra",
  },
};

export const revalidate = 60;

export default async function HolidayYatra() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <YatraCategoryPage categorySlug="holiday" initialPackages={packages || []} />;
}
