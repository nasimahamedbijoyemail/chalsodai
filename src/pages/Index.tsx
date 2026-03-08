import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Phone, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import PageHead from '@/components/PageHead';
import HeroCarousel from '@/components/HeroCarousel';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-rice.jpg';

interface Product {
  id: string;
  name: string;
  price: number;
  pack_size: string;
  description: string | null;
  image_url: string | null;
  rice_categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes, promoRes] = await Promise.all([
        supabase
          .from('rice_products')
          .select('id, name, price, pack_size, description, image_url, rice_categories(name)')
          .eq('is_available', true)
          .limit(4),
        supabase.from('rice_categories').select('id, name').order('name'),
        supabase
          .from('promotions')
          .select('id, title, image_url, link_url')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);
      
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setPromotions(promoRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <PageTransition>
      <div>
        <PageHead
          title="হোম"
          description="চাল সদাই — ঢাকা শহরে সেরা মানের চাল সরাসরি আপনার ঘরে। বিকাশে পেমেন্ট, দ্রুত ডেলিভারি।"
          canonicalPath="/"
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'চাল সদাই',
            url: 'https://chalsodai.lovable.app',
            description: 'ঢাকায় সেরা মানের চাল সরাসরি আপনার ঘরে। দ্রুত ডেলিভারি।',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://chalsodai.lovable.app/categories?filter={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }}
        />

        {/* Hero Section */}
        <section className="overflow-hidden">
          <HeroCarousel promotions={promotions} fallbackImage={heroImage} />
          <div className="bg-primary py-6 md:py-8">
            <div className="container">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary leading-tight">
                    সেরা মানের চাল, সরাসরি আপনার ঘরে
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-primary-foreground/80">
                    ঢাকা শহরে দ্রুত ডেলিভারি। বিশ্বস্ত মানের চাল সাশ্রয়ী মূল্যে।
                  </p>
                </motion.div>
                <motion.div
                  className="shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Button asChild size="lg" className="text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
                    <Link to="/categories">
                      চাল দেখুন <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-section-warm py-12">
          <div className="container grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
            {[
              { icon: Truck, title: 'দ্রুত ডেলিভারি', desc: 'মাত্র ২৪ ঘণ্টার মধ্যে' },
              { icon: Shield, title: 'মান নিশ্চিত', desc: 'সেরা মানের চাল গ্যারান্টি' },
              { icon: Phone, title: 'সহজ অর্ডার', desc: 'অনলাইনে অর্ডার, বিকাশে পেমেন্ট' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                className="flex items-start gap-4 p-6 rounded-xl bg-background shadow-sm premium-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">চালের ধরণ</h2>
            <Button variant="ghost" asChild>
              <Link to="/categories" className="text-primary">
                সব দেখুন <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex gap-3 flex-wrap mb-10">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/categories?filter=${encodeURIComponent(cat.name)}`}
                  className="rounded-full border bg-card px-5 py-2 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md inline-block"
                >
                  {cat.name}
                </Link>
              </motion.div>
            ))}
            {categories.length === 0 && !loading && (
              <p className="text-muted-foreground">এখনো কোনো ক্যাটাগরি যোগ করা হয়নি</p>
            )}
          </div>

          {/* Featured Products */}
          {loading ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      category: product.rice_categories?.name || '',
                      price: Number(product.price),
                      packSize: product.pack_size,
                      description: product.description || '',
                      image: product.image_url || '/placeholder.svg',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              এখনো কোনো চাল যোগ করা হয়নি। অ্যাডমিন প্যানেল থেকে চাল যোগ করুন।
            </p>
          )}
        </section>

        {/* Testimonials */}
        <section className="bg-section-warm py-16">
          <div className="container">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">আমাদের কাস্টমাররা যা বলেন</h2>
              <p className="text-muted-foreground text-sm sm:text-base">হাজারো সন্তুষ্ট কাস্টমারদের মতামত</p>
            </motion.div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'রাহেলা বেগম', location: 'মিরপুর, ঢাকা', text: 'চাল সদাই থেকে প্রথমবার অর্ডার করেছিলাম। চালের মান অসাধারণ, সময়মতো ডেলিভারি পেয়েছি। খুবই সন্তুষ্ট!', rating: 5 },
                { name: 'মোঃ করিম উদ্দিন', location: 'উত্তরা, ঢাকা', text: 'বাজারে গিয়ে চাল কেনার ঝামেলা থেকে মুক্তি পেলাম। দাম যুক্তিসংগত এবং চালের গুণগত মান চমৎকার।', rating: 5 },
                { name: 'ফারজানা আক্তার', location: 'ধানমন্ডি, ঢাকা', text: 'বিকাশে পেমেন্ট করা যায় বলে খুবই সুবিধা। ৩ মাস ধরে নিয়মিত অর্ডার করছি, কখনো হতাশ হইনি।', rating: 5 },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  className="relative rounded-2xl border bg-background p-5 sm:p-6 premium-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                >
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          className="bg-primary text-primary-foreground py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">আজই অর্ডার করুন!</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto">
              বিকাশে সহজ পেমেন্ট। ঢাকা শহরে দ্রুত হোম ডেলিভারি। মান নিশ্চিত।
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/categories">এখনই কিনুন</Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
};

export default Index;
