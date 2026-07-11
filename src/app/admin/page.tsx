import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import { supabaseServer } from "@/utils/supabaseServer";

export const revalidate = 0; // Disable server caching for the admin dashboard to get live data

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin/login");
  }

  // Fetch all packages directly from Supabase
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  return <AdminDashboardClient initialPackages={packages || []} />;
}
