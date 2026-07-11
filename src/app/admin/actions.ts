"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/utils/supabaseServer";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "[YAHAN APNA STRONG PASSWORD LIKHO]";

export async function loginAdmin(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }
  return { success: false, error: "Incorrect password" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function updatePackage(id: number, data: {
  price: number;
  image: string;
  overview: string;
  whats_included: string[];
  itinerary: any[];
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // Update in Supabase
  const { error } = await supabaseServer
    .from("packages")
    .update({
      price: data.price,
      image: data.image,
      overview: data.overview,
      whats_included: data.whats_included,
      itinerary: data.itinerary
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return { success: false, error: error.message };
  }

  // Revalidate cache to reflect changes instantly on the frontend
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/dharmic-yatra");
  revalidatePath("/desh-yatra");
  revalidatePath("/videsh-yatra");
  revalidatePath("/holiday-yatra");
  revalidatePath("/book");
  revalidatePath("/sitemap.xml");
  revalidatePath("/tour/[category]/[slug]", "layout");

  return { success: true };
}
