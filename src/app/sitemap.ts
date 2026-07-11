import { MetadataRoute } from "next";
import { supabaseServer } from "@/utils/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.kamakhyayatra.com";

  // Fetch all packages dynamically from Supabase
  const { data: packages } = await supabaseServer
    .from("packages")
    .select("slug, category")
    .order("id", { ascending: true });

  // Static routes
  const staticRoutes = [
    "",
    "/tours",
    "/destinations",
    "/gallery",
    "/about-us",
    "/contact-us",
    "/refund-policy",
    "/terms-conditions",
    "/privacy-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic tour package routes
  const tourRoutes = (packages || []).map((pkg) => ({
    url: `${baseUrl}/tour/${pkg.category.toLowerCase()}/${pkg.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...tourRoutes];
}
