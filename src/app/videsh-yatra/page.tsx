import { Metadata } from "next";
import YatraCategoryPage from "@/components/YatraCategoryPage";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Videsh Yatra - Premium International Holidays | Kamakhya Yatra",
  description: "Travel beyond borders. Experience cultural tours and scenic sightseeing packages in Nepal, Bhutan, Bali, and Sri Lanka with flight and visa support.",
  alternates: {
    canonical: "/videsh-yatra",
  },
};

export const revalidate = 60;

export default async function VideshYatra() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <YatraCategoryPage categorySlug="videsh" initialPackages={packages || []} />;
}
