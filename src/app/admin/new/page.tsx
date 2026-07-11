import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NewPackageForm from "./NewPackageForm";

export const revalidate = 0; // Disable caching

export default async function NewPackagePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin/login");
  }

  return <NewPackageForm />;
}
