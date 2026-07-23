import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/api/*", "/dashboard", "/dashboard/*"],
    },
    sitemap: "https://www.kamakhyayatra.com/sitemap.xml",
  };
}
