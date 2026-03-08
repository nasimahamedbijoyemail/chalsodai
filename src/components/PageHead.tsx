import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown>;
}

const PageHead = ({ title, description, canonicalPath, jsonLd }: PageHeadProps) => (
  <Helmet>
    <title>{title} — চাল সদাই</title>
    {description && <meta name="description" content={description} />}
    {description && <meta property="og:description" content={description} />}
    <meta property="og:title" content={`${title} — চাল সদাই`} />
    {canonicalPath && (
      <link rel="canonical" href={`https://chalsodai.lovable.app${canonicalPath}`} />
    )}
    {jsonLd && (
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    )}
  </Helmet>
);

export default PageHead;
