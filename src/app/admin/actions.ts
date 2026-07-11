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
  revalidateCache();

  return { success: true };
}

function revalidateCache() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/dharmic-yatra");
  revalidatePath("/desh-yatra");
  revalidatePath("/videsh-yatra");
  revalidatePath("/holiday-yatra");
  revalidatePath("/book");
  revalidatePath("/sitemap.xml");
  revalidatePath("/tour/[category]/[slug]", "layout");
}

export async function createPackage(data: {
  title: string;
  duration: string;
  price: number;
  category: "Spiritual" | "Holiday" | "International";
  slug: string;
  location: string;
  rating: string;
  description: string;
  overview: string;
  whats_included: string[];
  itinerary: any[];
  image: string;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // 1. Query current maximum ID from packages and add 1
  const { data: maxData, error: maxError } = await supabaseServer
    .from("packages")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error("Error querying max id:", maxError);
    return { success: false, error: maxError.message };
  }

  const nextId = maxData && maxData.length > 0 ? Number(maxData[0].id) + 1 : 1;

  // 2. Insert package
  const { error } = await supabaseServer
    .from("packages")
    .insert({
      id: nextId,
      title: data.title,
      duration: data.duration,
      price: data.price,
      category: data.category,
      slug: data.slug,
      location: data.location,
      rating: data.rating || "5.0",
      description: data.description,
      overview: data.overview,
      whats_included: data.whats_included,
      itinerary: data.itinerary,
      image: data.image
    });

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  revalidateCache();

  return { success: true };
}

export async function deletePackage(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabaseServer
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return { success: false, error: error.message };
  }

  revalidateCache();

  return { success: true };
}
