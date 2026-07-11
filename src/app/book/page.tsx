import { Metadata } from "next";
import BookClient from "./BookClient";
import { supabaseServer } from "@/utils/supabaseServer";

export const metadata: Metadata = {
  title: "Book Your Yatra | Kamakhya Yatra",
  description: "Secure your spiritual pilgrimage or holiday tour package. Send booking inquiries directly to our luxury travel specialists.",
  alternates: {
    canonical: "/book",
  },
};

export const revalidate = 60;

export default async function Page() {
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <BookClient initialPackages={packages || []} />;
}
