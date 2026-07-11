import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/utils/supabaseServer";
import EditPackageForm from "./EditPackageForm";

type Props = {
  params: Promise<{ id: string }>;
};

export const revalidate = 0; // Disable server caching for the admin editing page

export default async function EditPage({ params }: Props) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin/login");
  }

  const { id } = await params;
  
  // Fetch the package details from Supabase
  const { data: pkg, error } = await supabaseServer
    .from("packages")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !pkg) {
    redirect("/admin");
  }

  return <EditPackageForm initialPackage={pkg} />;
}
