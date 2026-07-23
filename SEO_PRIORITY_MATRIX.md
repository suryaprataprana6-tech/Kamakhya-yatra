# SEO Priority Matrix

| Issue | URL | Target Keyword | Recommended Action | Expected SEO Benefit | UI Impact | Priority |
|---|---|---|---|---|---|---|
| Missing Sitemap Routes | `/sitemap.xml` | N/A | Add `/dharmic-yatra`, `/desh-yatra`, `/holiday-yatra`, `/videsh-yatra`, and `/blog` to `sitemap.ts`. | Better crawling and indexing of category pages. | NONE | P0 |
| Suboptimal Tour Titles | `/tour/*` | Various | Update `generateMetadata` in tour detail pages to include the search intent naturally without keyword stuffing. | Better CTR and ranking for specific tours. | NONE | P1 |
| Image ALT tags missing on Hero | `/` | Travel Agency in Ranchi | Update `Hero.tsx` and `HomeClient.tsx` images to use descriptive ALT text instead of generic ones. | Better image SEO and accessibility. | NONE | P1 |
| Internal Linking from About | `/about-us` | Tour Packages from Ranchi | Add semantic anchor links in the About page text pointing to `/tours` and `/dharmic-yatra`. | Stronger internal link graph. | NONE | P2 |
| City Page Landing /from/ranchi | `/from/ranchi` | Kamakhya Yatra Ranchi | Introduce a custom, content-rich landing page for Ranchi with local boarding info and FAQs. | High ranking for Ranchi-specific queries. | REQUIRES UI APPROVAL | P3 |
| Dedicated FAQ UI on Tours | `/tour/*` | N/A | Add an accordion FAQ section to tour pages answering common user questions. | Rich snippet eligible, improved dwell time. | REQUIRES UI APPROVAL | P3 |
