import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown>;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

const BASE_URL = 'https://www.chalsodai.com';
const DEFAULT_OG_IMAGE =
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4e409550-bb40-48a8-8e70-3143c3d55a3b/id-preview-fd4af438--ee13a5bc-d993-464c-b580-d1dedc4bb99e.lovable.app-1771078027306.png';
const DEFAULT_KEYWORDS =
  'Chal Sodai, চাল সদাই, ChalSodai, chalsodai, chal sodai, চালসদাই, rice online Dhaka, চাল ডেলিভারি, chalsodai.com';

const PageHead = ({
  title,
  description,
  canonicalPath,
  jsonLd,
  keywords,
  ogImage,
  ogType = 'website',
  noindex,
}: PageHeadProps) => {
  const fullTitle = `${title} — Chal Sodai | চাল সদাই`;
  const allKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
  const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : undefined;
  const image = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${BASE_URL}${ogImage}`
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      {description && <meta name="description" content={description} />}
      <meta name="keywords" content={allKeywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:site_name" content="Chal Sodai | চাল সদাই" />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="bn_BD" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}

      {/* Canonical + hreflang (always the www.chalsodai.com form) */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="bn-BD" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="bn" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default PageHead;
