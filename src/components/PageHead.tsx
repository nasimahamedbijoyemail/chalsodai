import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown>;
  keywords?: string;
}

const BASE_URL = 'https://www.chalsodai.com';
const DEFAULT_KEYWORDS = 'Chal Sodai, চাল সদাই, ChalSodai, chalsodai, chal sodai, চালসদাই, rice online Dhaka, চাল ডেলিভারি, chalsodai.com';

const PageHead = ({ title, description, canonicalPath, jsonLd, keywords }: PageHeadProps) => {
  const fullTitle = `${title} — Chal Sodai | চাল সদাই`;
  const allKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:site_name" content="Chal Sodai | চাল সদাই" />
      <meta property="og:type" content="website" />
      <meta name="keywords" content={allKeywords} />
      {canonicalPath && (
        <link rel="canonical" href={`${BASE_URL}${canonicalPath}`} />
      )}
      {canonicalPath && (
        <meta property="og:url" content={`${BASE_URL}${canonicalPath}`} />
      )}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default PageHead;
