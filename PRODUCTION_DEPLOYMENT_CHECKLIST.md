# PRODUCTION DEPLOYMENT CHECKLIST

Follow this checklist to safely push the completed technical SEO improvements and new routing architecture to the live environment.

## 1. Pre-Deployment Checks
- [ ] **Review Git Diff:** Verify that the only changes made relate to SEO enhancements, metadata, schema, and `BoardingCitySelector` UI components. 
- [ ] **Verify Environment Variables:** Confirm that Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are correctly set in the production environment.
- [ ] **Check Database Parity:** Verify that the local execution did NOT modify the Supabase schema or trigger destructive migrations.
- [ ] **Run Build Locally:** Ensure `npm run build` succeeds locally without TypeScript or Next.js build errors.

## 2. Deployment
- [ ] **Push to Origin:** Merge changes to your main production branch and push.
- [ ] **Vercel / Hosting Build:** Monitor the Vercel (or preferred hosting) dashboard to ensure the build completes successfully in the production environment.
- [ ] **Test Staging/Preview (Optional):** If a preview URL is generated, verify that `/from/ranchi` and `/tour/spiritual/amarnath-yatra` render correctly.

## 3. Post-Deployment Verification
- [ ] **Check Canonical URLs:** Navigate to the live homepage, a city page, and a tour detail page. Inspect `<head>` to ensure `<link rel="canonical" href="...">` is correct and unique for each page.
- [ ] **Check robots.txt:** Visit `https://www.kamakhyayatra.com/robots.txt` and confirm `/api/*` and `/admin/*` are correctly disallowed.
- [ ] **Check sitemap.xml:** Visit `https://www.kamakhyayatra.com/sitemap.xml` and ensure the `/from/[city]` routes appear in the XML tree.
- [ ] **Test Structured Data:** Use the [Google Rich Results Test](https://search.google.com/test/rich-results) tool to validate the `BreadcrumbList`, `TravelAgency`, and `Product` schemas on live pages.

## 4. Google Search Console Tasks
- [ ] **Verify Search Console (If not done):** Ensure you are the verified owner of `https://www.kamakhyayatra.com`.
- [ ] **Submit Sitemap:** Go to Sitemaps in Google Search Console and submit `https://www.kamakhyayatra.com/sitemap.xml`.
- [ ] **Request Indexing:** Use the URL Inspection tool to request indexing for the homepage and the highest-priority `/from/[city]` routes (e.g., `/from/ranchi`, `/from/patna`).
- [ ] **Monitor Indexing:** Over the next 7-14 days, monitor the "Pages" report for discovered but not indexed pages, and verify no unexpected 404s or crawl anomalies occur.

## 5. Performance Monitoring
- [ ] **Core Web Vitals:** Monitor Core Web Vitals in Search Console over the next 28 days to ensure the newly introduced `BoardingCitySelector` and enriched metadata did not cause unexpected Layout Shifts (CLS) or Largest Contentful Paint (LCP) regressions.
