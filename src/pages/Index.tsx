import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import PageHead from '@/components/PageHead';
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

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('rice_products')
          .select('id, name, price, pack_size, description, image_url, rice_categories(name)')
          .eq('is_available', true)
          .limit(4),
        supabase.from('rice_categories').select('id, name').order('name'),
      ]);
      
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      <PageHead title="হোম" description="চাল সদাই — ঢাকা শহরে সেরা মানের চাল সরাসরি আপনার ঘরে। বিকাশে পেমেন্ট, দ্রুত ডেলিভারি।" />

      {/* Hero Section */}
      <section className="overflow-hidden">
        <img
          src={heroImage}
          alt="চাল সদাই হিরো"
          className="w-full max-h-[420px] object-cover"
        />
        <div className="bg-primary py-6 md:py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary leading-tight">
                  সেরা মানের চাল, সরাসরি আপনার ঘরে
                </h1>
                <p className="text-sm md:text-base text-primary-foreground/80">
                  ঢাকা শহরে দ্রুত ডেলিভারি। বিশ্বস্ত মানের চাল সাশ্রয়ী মূল্যে।
                </p>
              </div>
              <div className="shrink-0">
                <Button asChild size="lg" className="text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold">
                  <Link to="/categories">
                    চাল দেখুন <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-section-warm py-12">
        <div className="container grid gap-6 md:grid-cols-3">
          {[
            { icon: Truck, title: 'দ্রুত ডেলিভারি', desc: 'মাত্র ২৪ ঘণ্টার মধ্যে' },
            { icon: Shield, title: 'মান নিশ্চিত', desc: 'সেরা মানের চাল গ্যারান্টি' },
            { icon: Phone, title: 'সহজ অর্ডার', desc: 'অনলাইনে অর্ডার, বিকাশে পেমেন্ট' },
          ].map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-6 rounded-xl bg-background shadow-sm opacity-0 animate-slide-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
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
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories?filter=${encodeURIComponent(cat.name)}`}
              className="rounded-full border bg-card px-5 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {cat.name}
            </Link>
          ))}
          {categories.length === 0 && !loading && (
            <p className="text-muted-foreground">এখনো কোনো ক্যাটাগরি যোগ করা হয়নি</p>
          )}
        </div>

        {/* Featured Products */}
        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
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
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            এখনো কোনো চাল যোগ করা হয়নি। অ্যাডমিন প্যানেল থেকে চাল যোগ করুন।
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16 animate-fade-in">
        <div className="container text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">আজই অর্ডার করুন!</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto">
            বিকাশে সহজ পেমেন্ট। ঢাকা শহরে দ্রুত হোম ডেলিভারি। মান নিশ্চিত।
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/categories">এখনই কিনুন</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
