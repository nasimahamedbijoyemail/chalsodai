import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE_ORIGIN = "https://chalsodai.com";
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface SiteEntry {
  siteUrl: string;
  permissionLevel?: string;
}

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    const prefix = new URL(siteUrl);
    return target.href.startsWith(prefix.href);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: role } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return json({ error: "Forbidden" }, 403);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const connectionApiKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!lovableApiKey || !connectionApiKey) {
      return json({ connected: false, reason: "Google Search Console is not connected yet." });
    }

    const headers = {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": connectionApiKey,
    };

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const selectedSiteUrl: string | undefined = body?.selectedSiteUrl;
    const inspectUrls: string[] = Array.isArray(body?.inspectUrls)
      ? body.inspectUrls.slice(0, 5)
      : [`${SITE_ORIGIN}/`];

    // 1. List verified properties covering this site
    const sitesRes = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
    if (!sitesRes.ok) {
      const details = await sitesRes.text();
      console.error(`sites list failed [${sitesRes.status}]: ${details}`);
      return json({ connected: true, error: "Could not list properties", status: sitesRes.status, details }, sitesRes.status);
    }
    const { siteEntry = [] } = (await sitesRes.json()) as { siteEntry?: SiteEntry[] };
    const target = new URL(`${SITE_ORIGIN}/`);
    const matches = siteEntry.filter(
      (e) => e.permissionLevel !== "siteUnverifiedUser" && coversTarget(e.siteUrl, target),
    );

    if (matches.length === 0) {
      return json({ connected: true, status: "no_property", candidates: [] });
    }

    let siteUrl: string;
    if (selectedSiteUrl) {
      const found = matches.find((m) => m.siteUrl === selectedSiteUrl);
      if (!found) return json({ connected: true, status: "invalid_selection" }, 400);
      siteUrl = found.siteUrl;
    } else if (matches.length === 1) {
      siteUrl = matches[0].siteUrl;
    } else {
      return json({ connected: true, status: "selection_required", candidates: matches.map((m) => m.siteUrl) });
    }

    const encoded = encodeURIComponent(siteUrl);

    // 2. Submit the sitemap (idempotent)
    let sitemapSubmitted = false;
    let sitemapError: string | null = null;
    const putRes = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${encoded}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`,
      { method: "PUT", headers },
    );
    if (putRes.ok) sitemapSubmitted = true;
    else sitemapError = `[${putRes.status}] ${await putRes.text()}`;

    // 3. Read sitemap status, search analytics and URL inspections
    const [sitemapsRes, analyticsRes] = await Promise.all([
      fetch(`${GATEWAY}/webmasters/v3/sites/${encoded}/sitemaps`, { headers }),
      fetch(`${GATEWAY}/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          dimensions: ["query"],
          rowLimit: 15,
        }),
      }),
    ]);

    const sitemaps = sitemapsRes.ok ? (await sitemapsRes.json())?.sitemap ?? [] : [];
    const analytics = analyticsRes.ok ? (await analyticsRes.json())?.rows ?? [] : [];

    const inspections = await Promise.all(
      inspectUrls.map(async (u: string) => {
        const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ inspectionUrl: u, siteUrl }),
        });
        if (!res.ok) {
          return { url: u, error: `[${res.status}] ${(await res.text()).slice(0, 300)}` };
        }
        const data = await res.json();
        const idx = data?.inspectionResult?.indexStatusResult ?? {};
        return {
          url: u,
          verdict: idx.verdict ?? "UNKNOWN",
          coverageState: idx.coverageState ?? null,
          robotsTxtState: idx.robotsTxtState ?? null,
          indexingState: idx.indexingState ?? null,
          lastCrawlTime: idx.lastCrawlTime ?? null,
          pageFetchState: idx.pageFetchState ?? null,
          crawledAs: idx.crawledAs ?? null,
        };
      }),
    );

    return json({
      connected: true,
      status: "ok",
      siteUrl,
      candidates: matches.map((m) => m.siteUrl),
      sitemapUrl: SITEMAP_URL,
      sitemapSubmitted,
      sitemapError,
      sitemaps,
      analytics,
      inspections,
    });
  } catch (error) {
    console.error("seo-status error:", error);
    return json({ error: String(error) }, 500);
  }
});
