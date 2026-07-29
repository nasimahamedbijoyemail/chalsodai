import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Phone, Star, Quote, Sparkles, ChevronRight } from 'lucide-react';
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
  image_url: string | null;
}

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

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
        supabase.from('rice_categories').select('id, name, image_url').order('name'),
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
          title="ঢাকার সেরা অনলাইন চালের দোকান"
          description="Chal Sodai (চাল সদাই) — ঢাকার সেরা অনলাইন চালের দোকান। মিনিকেট, নাজিরশাইল, চিনিগুড়া ও বাসমতি চাল ঘরে পৌঁছে দেই। বিকাশ বা ক্যাশ অন ডেলিভারি, ফ্ল্যাট ৳৬০ ডেলিভারি চার্জ। Buy premium rice online in Dhaka — chalsodai.com"
          canonicalPath="/"
          keywords="চাল কিনুন অনলাইন, ঢাকার সেরা চালের দোকান, best online rice shop Dhaka, buy rice online Bangladesh, বাসমতি চাল, মিনিকেট চাল, নাজিরশাইল, চিনিগুড়া, rice home delivery Bangladesh"
          jsonLd={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'OnlineStore',
                '@id': 'https://www.chalsodai.com/#store',
                name: 'Chal Sodai',
                alternateName: ['চাল সদাই', 'ChalSodai', 'chalsodai', 'চালসদাই'],
                url: 'https://www.chalsodai.com',
                image: 'https://www.chalsodai.com/favicon.png',
                telephone: '+8801777416903',
                currenciesAccepted: 'BDT',
                paymentAccepted: 'bKash, Cash on Delivery',
                priceRange: '৳৳',
                description:
                  'Chal Sodai (চাল সদাই) — the online rice shop for Dhaka, Bangladesh. Premium Miniket, Nazirshail, Chinigura and Basmati rice delivered home with bKash or cash on delivery.',
                areaServed: { '@type': 'City', name: 'Dhaka' },
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Dhaka',
                  addressCountry: 'BD',
                },
                hasOfferCatalog: {
                  '@type': 'OfferCatalog',
                  name: 'চালের ধরণ',
                  itemListElement: [
                    'মিনিকেট চাল',
                    'নাজিরশাইল চাল',
                    'চিনিগুড়া চাল',
                    'বাসমতি চাল',
                    'আটাশ চাল',
                    'কাটারিভোগ চাল',
                  ].map((name) => ({
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Product', name, brand: { '@type': 'Brand', name: 'Chal Sodai' } },
                  })),
                },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://www.chalsodai.com/categories?filter={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'FAQPage',
                '@id': 'https://www.chalsodai.com/#homefaq',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'ঢাকায় অনলাইনে চাল কোথা থেকে কিনব?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Chal Sodai (চাল সদাই, chalsodai.com) থেকে ঢাকায় অনলাইনে প্রিমিয়াম মানের চাল অর্ডার করতে পারেন — মিনিকেট, নাজিরশাইল, চিনিগুড়া ও বাসমতি চাল সরাসরি ঘরে পৌঁছে দেওয়া হয়।',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'চাল সদাই কী কী পেমেন্ট নেয়?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'বিকাশ (bKash) এবং ক্যাশ অন ডেলিভারি — দুইভাবেই পেমেন্ট করা যায়।',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'ডেলিভারি চার্জ কত?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'ঢাকার ভিতরে ফ্ল্যাট ৳৬০ ডেলিভারি চার্জ।',
                    },
                  },
                ],
              },
            ],
          }}
        />

        {/* Hero Section */}
        <section className="overflow-hidden">
          <HeroCarousel promotions={promotions} fallbackImage={heroImage} />
          <div className="relative bg-primary py-8 md:py-10 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="container relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    <span className="text-xs sm:text-sm font-medium text-secondary tracking-wide uppercase">CHAL SODAI — প্রিমিয়াম চাল</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary leading-tight">
                    সেরা মানের চাল, সরাসরি আপনার ঘরে
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-primary-foreground/80 max-w-lg">
                    ঢাকা শহরে দ্রুত ডেলিভারি। বিশ্বস্ত মানের চাল সাশ্রয়ী মূল্যে। বিকাশে সহজ পেমেন্ট।
                  </p>
                </motion.div>
                <motion.div
                  className="shrink-0 flex gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <Button asChild size="lg" className="text-sm sm:text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20">
                    <Link to="/categories">
                      চাল দেখুন <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Trust Badges */}
        <section className="py-10 sm:py-14 bg-section-warm">
          <div className="container">
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3">
              {[
                { icon: Truck, title: 'দ্রুত ডেলিভারি', desc: 'ঢাকায় মাত্র ২৪ ঘণ্টার মধ্যে ডেলিভারি', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Shield, title: 'মান নিশ্চিত', desc: '১০০% খাঁটি ও পরীক্ষিত চাল গ্যারান্টি', color: 'text-secondary', bg: 'bg-secondary/10' },
                { icon: Phone, title: 'সহজ অর্ডার', desc: 'অনলাইনে অর্ডার, বিকাশ বা ক্যাশে পেমেন্ট', color: 'text-accent', bg: 'bg-accent/10' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  className="group flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ y: -3 }}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${f.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container py-14 sm:py-16">
          <motion.div
            className="flex items-end justify-between mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">ক্যাটাগরি</span>
              <h2 className="text-2xl md:text-3xl font-bold">চালের ধরণ</h2>
            </div>
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
              <Link to="/categories">
                সব দেখুন <ChevronRight className="ml-0.5 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Category chips */}
          <div className="flex gap-2.5 flex-wrap mb-10">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Link
                  to={`/categories?filter=${encodeURIComponent(cat.name)}`}
                  className="group/chip rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/15 hover:border-primary inline-flex items-center gap-2"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover/chip:opacity-100 group-hover/chip:translate-x-0 transition-all duration-200" />
                </Link>
              </motion.div>
            ))}
            {categories.length === 0 && !loading && (
              <p className="text-muted-foreground">এখনো কোনো ক্যাটাগরি যোগ করা হয়নি</p>
            )}
          </div>

          {/* Featured Products */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h3 className="font-bold text-lg">জনপ্রিয় চাল</h3>
            </div>
          </motion.div>

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
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
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

          {products.length > 0 && (
            <motion.div
              className="text-center mt-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Link to="/categories">
                  সব চাল দেখুন <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </section>

        {/* Testimonials */}
        <section className="bg-section-warm py-14 sm:py-16 overflow-hidden">
          <div className="container">
            <motion.div
              className="text-center mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">কাস্টমার রিভিউ</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">আমাদের কাস্টমাররা যা বলেন</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">হাজারো সন্তুষ্ট কাস্টমারদের বিশ্বস্ত মতামত</p>
            </motion.div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'রাহেলা বেগম', location: 'মিরপুর, ঢাকা', text: 'চাল সদাই থেকে প্রথমবার অর্ডার করেছিলাম। চালের মান অসাধারণ, সময়মতো ডেলিভারি পেয়েছি। খুবই সন্তুষ্ট!', rating: 5 },
                { name: 'মোঃ করিম উদ্দিন', location: 'উত্তরা, ঢাকা', text: 'বাজারে গিয়ে চাল কেনার ঝামেলা থেকে মুক্তি পেলাম। দাম যুক্তিসংগত এবং চালের গুণগত মান চমৎকার।', rating: 5 },
                { name: 'ফারজানা আক্তার', location: 'ধানমন্ডি, ঢাকা', text: 'বিকাশে পেমেন্ট করা যায় বলে খুবই সুবিধা। ৩ মাস ধরে নিয়মিত অর্ডার করছি, কখনো হতাশ হইনি।', rating: 5 },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  className="group relative rounded-2xl border border-border/50 bg-background p-5 sm:p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ y: -4 }}
                >
                  <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/[0.07] group-hover:text-primary/[0.12] transition-colors duration-300" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          className="relative bg-primary text-primary-foreground py-16 sm:py-20 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="container relative text-center space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-secondary opacity-80" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">আজই অর্ডার করুন!</h2>
              <p className="text-primary-foreground/75 max-w-lg mx-auto mt-3 text-sm sm:text-base">
                বিকাশে সহজ পেমেন্ট। ঢাকা শহরে দ্রুত হোম ডেলিভারি। ১০০% মান নিশ্চিত।
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex gap-3 justify-center flex-wrap"
            >
              <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg shadow-secondary/20">
                <Link to="/categories">এখনই কিনুন <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">যোগাযোগ করুন</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
};

export default Index;
