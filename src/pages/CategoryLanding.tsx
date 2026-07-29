import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Wheat, ChevronRight, Truck, ShieldCheck, Wallet } from 'lucide-react';
import { DELIVERY_CHARGE } from '@/lib/constants';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  pack_size: string;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
}

const BASE_URL = 'https://www.chalsodai.com';

const CategoryLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: cat } = await supabase
        .from('rice_categories')
        .select('id, name, slug, description, image_url, seo_title, seo_description')
        .eq('slug', slug || '')
        .maybeSingle();

      setCategory(cat as Category | null);

      if (cat) {
        const { data: prods } = await supabase
          .from('rice_products')
          .select('id, name, price, pack_size, description, image_url, category_id')
          .eq('category_id', cat.id)
          .eq('is_available', true)
          .order('price');
        setProducts(prods || []);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-10 pb-24 md:pb-10">
        <div className="h-9 w-64 bg-muted rounded-lg animate-pulse mb-3" />
        <div className="h-4 w-80 bg-muted rounded animate-pulse mb-8" />
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-20 text-center pb-24 md:pb-10">
        <PageHead title="চাল পাওয়া যায়নি" noindex />
        <p className="text-muted-foreground mb-4">এই ধরনের চাল পাওয়া যায়নি</p>
        <Button asChild variant="outline">
          <Link to="/categories">সব চাল দেখুন</Link>
        </Button>
      </div>
    );
  }

  const title = category.seo_title || `${category.name} চাল — ঢাকায় অনলাইনে কিনুন`;
  const description =
    category.seo_description ||
    category.description ||
    `${category.name} চাল অনলাইনে কিনুন চাল সদাই থেকে। ঢাকায় দ্রুত হোম ডেলিভারি, বিকাশ ও ক্যাশ অন ডেলিভারি, ফ্ল্যাট ৳${DELIVERY_CHARGE} ডেলিভারি চার্জ। Buy ${category.name} rice online in Dhaka.`;
  const path = `/rice/${category.slug}`;
  const prices = products.map((p) => Number(p.price));

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10">
        <PageHead
          title={title}
          description={description}
          canonicalPath={path}
          ogImage={category.image_url || undefined}
          keywords={`${category.name} চাল, ${category.name} চালের দাম, ${category.slug} rice price Dhaka, buy ${category.slug} rice online, ${category.name} চাল ডেলিভারি ঢাকা`}
          jsonLd={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'CollectionPage',
                '@id': `${BASE_URL}${path}#page`,
                name: title,
                description,
                url: `${BASE_URL}${path}`,
                isPartOf: { '@type': 'WebSite', name: 'Chal Sodai', url: BASE_URL },
                about: { '@type': 'Thing', name: `${category.name} চাল` },
              },
              {
                '@type': 'ItemList',
                name: `${category.name} চাল`,
                numberOfItems: products.length,
                itemListElement: products.map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${BASE_URL}/product/${p.id}`,
                  name: `${p.name} (${p.pack_size})`,
                })),
              },
              ...(prices.length
                ? [
                    {
                      '@type': 'Product',
                      name: `${category.name} চাল`,
                      description,
                      image: category.image_url || undefined,
                      brand: { '@type': 'Brand', name: 'Chal Sodai' },
                      offers: {
                        '@type': 'AggregateOffer',
                        priceCurrency: 'BDT',
                        lowPrice: Math.min(...prices),
                        highPrice: Math.max(...prices),
                        offerCount: prices.length,
                        availability: 'https://schema.org/InStock',
                        seller: { '@type': 'Organization', name: 'Chal Sodai' },
                      },
                    },
                  ]
                : []),
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'হোম', item: `${BASE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: 'চালের ধরণ', item: `${BASE_URL}/categories` },
                  { '@type': 'ListItem', position: 3, name: category.name, item: `${BASE_URL}${path}` },
                ],
              },
            ],
          }}
        />

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">হোম</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/categories" className="hover:text-foreground transition-colors">চালের ধরণ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <motion.header
          className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6 sm:p-8 border border-primary/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute top-4 right-4 opacity-10">
            <Wheat className="h-20 w-20 sm:h-28 sm:w-28 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{category.name} চাল</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-4 mt-5 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> ঢাকায় হোম ডেলিভারি</span>
            <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" /> বিকাশ / ক্যাশ অন ডেলিভারি</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> মান যাচাই করা চাল</span>
          </div>
        </motion.header>

        <h2 className="text-lg sm:text-xl font-semibold mb-4">{category.name} চালের প্যাক ও দাম</h2>

        {products.length === 0 ? (
          <div className="text-center py-14 border rounded-2xl">
            <Wheat className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">এই মুহূর্তে {category.name} চাল স্টকে নেই</p>
            <Button asChild variant="outline">
              <Link to="/categories">অন্যান্য চাল দেখুন</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  pack_size: p.pack_size,
                  description: p.description,
                  image_url: p.image_url,
                }}
              />
            ))}
          </div>
        )}

        <section className="mt-10 prose-sm max-w-3xl text-sm text-muted-foreground leading-relaxed space-y-3">
          <h2 className="text-lg font-semibold text-foreground">ঢাকায় {category.name} চাল কেন চাল সদাই থেকে কিনবেন?</h2>
          <p>
            চাল সদাই (Chal Sodai) ঢাকার অনলাইন চালের দোকান। {category.name} চাল আমরা যাচাই করা সরবরাহকারীর কাছ থেকে সংগ্রহ করি,
            পরিষ্কার প্যাকে ওজন ঠিক রেখে সরাসরি আপনার বাসায় পৌঁছে দেই। অর্ডার করতে অ্যাকাউন্ট খোলার দরকার নেই — নাম, ফোন ও ঠিকানা
            দিলেই হবে।
          </p>
          <p>
            পেমেন্ট করতে পারেন বিকাশে অথবা ক্যাশ অন ডেলিভারিতে। ঢাকার ভিতরে ফ্ল্যাট ৳{DELIVERY_CHARGE} ডেলিভারি চার্জ প্রযোজ্য।
            যেকোনো প্রশ্নে হোয়াটসঅ্যাপ করুন +8801777416903 নম্বরে।
          </p>
          <p>
            <Link to="/categories" className="text-primary underline underline-offset-4">সব ধরনের চাল দেখুন</Link>
            {' · '}
            <Link to="/faq" className="text-primary underline underline-offset-4">সাধারণ জিজ্ঞাসা</Link>
          </p>
        </section>
      </div>
    </PageTransition>
  );
};

export default CategoryLanding;
