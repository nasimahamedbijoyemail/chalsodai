import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Search,
} from 'lucide-react';

interface Inspection {
  url: string;
  verdict?: string;
  coverageState?: string | null;
  robotsTxtState?: string | null;
  indexingState?: string | null;
  lastCrawlTime?: string | null;
  pageFetchState?: string | null;
  crawledAs?: string | null;
  error?: string;
}

interface SitemapInfo {
  path?: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  warnings?: string;
  errors?: string;
  contents?: { submitted?: string; indexed?: string; type?: string }[];
}

interface SeoStatus {
  connected: boolean;
  reason?: string;
  status?: string;
  siteUrl?: string;
  candidates?: string[];
  sitemapUrl?: string;
  sitemapSubmitted?: boolean;
  sitemapError?: string | null;
  sitemaps?: SitemapInfo[];
  analytics?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
  inspections?: Inspection[];
  error?: string;
  details?: string;
}

const verdictBadge = (verdict?: string) => {
  if (verdict === 'PASS') return <Badge className="bg-green-600 hover:bg-green-600">ইনডেক্সড</Badge>;
  if (verdict === 'NEUTRAL') return <Badge variant="secondary">প্রক্রিয়াধীন</Badge>;
  if (verdict === 'FAIL') return <Badge variant="destructive">সমস্যা</Badge>;
  return <Badge variant="outline">{verdict || 'অজানা'}</Badge>;
};

const AdminSEO = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<SeoStatus | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | undefined>();

  const load = async (siteUrl?: string) => {
    const { data: res, error } = await supabase.functions.invoke('seo-status', {
      body: { selectedSiteUrl: siteUrl, inspectUrls: ['https://www.chalsodai.com/', 'https://www.chalsodai.com/categories'] },
    });
    if (error) {
      toast.error('SEO স্ট্যাটাস আনতে সমস্যা হয়েছে');
      setData({ connected: false, reason: error.message });
    } else {
      setData(res as SeoStatus);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">SEO স্ট্যাটাস</h1>
          <p className="text-sm text-muted-foreground">Google Search Console — ইনডেক্সিং, ক্রলিং ও সাইটম্যাপ</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setRefreshing(true);
            load(selectedSite);
          }}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          রিফ্রেশ ও সাইটম্যাপ জমা দিন
        </Button>
      </div>

      {!data?.connected && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Google Search Console সংযুক্ত নয়
          </div>
          <p className="text-sm text-muted-foreground">
            {data?.reason || 'সংযোগ দেওয়ার পর এখানে ইনডেক্সিং ও ক্রলিং রিপোর্ট দেখা যাবে।'}
          </p>
        </div>
      )}

      {data?.connected && data.status === 'no_property' && (
        <div className="rounded-xl border p-5 text-sm text-muted-foreground">
          এই অ্যাকাউন্টে www.chalsodai.com এর কোনো ভেরিফায়েড প্রপার্টি পাওয়া যায়নি।
        </div>
      )}

      {data?.connected && data.status === 'selection_required' && (
        <div className="rounded-xl border p-5 space-y-3">
          <p className="text-sm">একাধিক প্রপার্টি পাওয়া গেছে — একটি বেছে নিন:</p>
          <div className="flex flex-wrap gap-2">
            {data.candidates?.map((c) => (
              <Button
                key={c}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSite(c);
                  setRefreshing(true);
                  load(c);
                }}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      )}

      {data?.connected && data.status === 'ok' && (
        <div className="space-y-6">
          {/* Sitemap */}
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              {data.sitemapSubmitted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              সাইটম্যাপ
            </h2>
            <p className="text-sm text-muted-foreground break-all mb-3">
              {data.sitemapUrl} — প্রপার্টি: {data.siteUrl}
            </p>
            {data.sitemapError && (
              <p className="text-sm text-destructive mb-3 break-all">{data.sitemapError}</p>
            )}
            <div className="space-y-2">
              {(data.sitemaps || []).map((s) => (
                <div key={s.path} className="text-sm border rounded-lg p-3">
                  <div className="break-all font-medium">{s.path}</div>
                  <div className="text-muted-foreground text-xs mt-1 space-x-3">
                    <span>জমা: {s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString() : '—'}</span>
                    <span>ডাউনলোড: {s.lastDownloaded ? new Date(s.lastDownloaded).toLocaleDateString() : '—'}</span>
                    <span>URL: {s.contents?.[0]?.submitted ?? '—'}</span>
                    <span className={Number(s.errors) > 0 ? 'text-destructive' : ''}>ত্রুটি: {s.errors ?? 0}</span>
                    <span>সতর্কতা: {s.warnings ?? 0}</span>
                  </div>
                </div>
              ))}
              {(data.sitemaps || []).length === 0 && (
                <p className="text-sm text-muted-foreground">এখনো কোনো সাইটম্যাপ রেকর্ড নেই।</p>
              )}
            </div>
          </section>

          {/* Indexing */}
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold mb-3">ইনডেক্সিং ও ক্রলিং</h2>
            <div className="space-y-3">
              {(data.inspections || []).map((ins) => (
                <div key={ins.url} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <a
                      href={ins.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium break-all hover:underline flex items-center gap-1"
                    >
                      {ins.url} <ExternalLink className="h-3 w-3" />
                    </a>
                    {ins.error ? <Badge variant="destructive">ত্রুটি</Badge> : verdictBadge(ins.verdict)}
                  </div>
                  {ins.error ? (
                    <p className="text-xs text-destructive mt-2 break-all">{ins.error}</p>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-2 grid gap-1 sm:grid-cols-2">
                      <span>কভারেজ: {ins.coverageState || '—'}</span>
                      <span>robots.txt: {ins.robotsTxtState || '—'}</span>
                      <span>ফেচ: {ins.pageFetchState || '—'}</span>
                      <span>
                        শেষ ক্রল: {ins.lastCrawlTime ? new Date(ins.lastCrawlTime).toLocaleString() : '—'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Search queries */}
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" /> গত ২৮ দিনের সার্চ কোয়েরি
            </h2>
            {(data.analytics || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">এখনো কোনো সার্চ ডেটা নেই।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground text-xs">
                    <tr className="text-left">
                      <th className="py-2">কোয়েরি</th>
                      <th className="py-2">ক্লিক</th>
                      <th className="py-2">ইম্প্রেশন</th>
                      <th className="py-2">পজিশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analytics?.map((row) => (
                      <tr key={row.keys?.[0]} className="border-t">
                        <td className="py-2">{row.keys?.[0]}</td>
                        <td className="py-2">{row.clicks}</td>
                        <td className="py-2">{row.impressions}</td>
                        <td className="py-2">{row.position?.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {data?.error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm break-all">
          {data.error} {data.details}
        </div>
      )}
    </div>
  );
};

export default AdminSEO;
