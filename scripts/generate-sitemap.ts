// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Includes every public route plus one entry per available product.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.chalsodai.com";

const SUPABASE_URL = "https://kowykycmdngiqxbdruuy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3lreWNtZG5naXF4YmRydXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzA0MTksImV4cCI6MjA4NjcwNjQxOX0.A3jIVK4Oo-PME-lITD1os0AlrLCh6AnfEeQvAujPG0g";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/categories", changefreq: "daily", priority: "0.9" },
  { path: "/online-rice-delivery-dhaka", changefreq: "weekly", priority: "0.9" },
  { path: "/online-grocery-delivery-dhaka", changefreq: "weekly", priority: "0.8" },
  { path: "/faq", changefreq: "weekly", priority: "0.6" },
  { path: "/track", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/install", changefreq: "monthly", priority: "0.3" },
  { path: "/auth", changefreq: "monthly", priority: "0.3" },
];

async function fetchProductEntries(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rice_products?select=id,updated_at&is_available=eq.true`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    if (!res.ok) {
      console.warn(`sitemap: could not fetch products [${res.status}]`);
      return [];
    }
    const rows = (await res.json()) as { id: string; updated_at: string }[];
    return rows.map((row) => ({
      path: `/product/${row.id}`,
      lastmod: row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : undefined,
      changefreq: "weekly" as const,
      priority: "0.8",
    }));
  } catch (error) {
    console.warn("sitemap: product fetch failed", error);
    return [];
  }
}

async function fetchCategoryEntries(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rice_categories?select=slug,updated_at`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    if (!res.ok) {
      console.warn(`sitemap: could not fetch categories [${res.status}]`);
      return [];
    }
    const rows = (await res.json()) as { slug: string | null; updated_at: string }[];
    return rows
      .filter((row) => !!row.slug)
      .map((row) => ({
        path: `/rice/${row.slug}`,
        lastmod: row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : undefined,
        changefreq: "weekly" as const,
        priority: "0.85",
      }));
  } catch (error) {
    console.warn("sitemap: category fetch failed", error);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const entries = [
  ...staticEntries,
  ...(await fetchCategoryEntries()),
  ...(await fetchProductEntries()),
];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
