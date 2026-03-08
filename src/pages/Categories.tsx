import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Search, Wheat, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  pack_size: string;
  description: string | null;
  image_url: string | null;
  rice_categories: Category | null;
}

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [activeCategory, setActiveCategory] = useState<string | null>(filterParam);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('rice_categories').select('id, name, image_url').order('name'),
        supabase.from('rice_products').select('*, rice_categories(id, name, image_url)').eq('is_available', true).order('name'),
      ]);
      
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = products
    .filter((p) => !activeCategory || p.rice_categories?.name === activeCategory)
    .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleFilter = (cat: string | null) => {
    setActiveCategory(cat);
    if (cat) {
      setSearchParams({ filter: cat });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="container py-10 pb-24 md:pb-10">
        <PageHead title="চালের ধরণ" />
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10">
        <PageHead title="চালের ধরণ" description="চাল সদাইতে সকল ধরনের চাল দেখুন — মিনিকেট, নাজিরশাইল, বাসমতি ও আরও অনেক।" canonicalPath="/categories" />

        {/* Hero Header */}
        <motion.div
          className="relative mb-8 sm:mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6 sm:p-8 border border-primary/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-4 right-4 opacity-10">
            <Wheat className="h-20 w-20 sm:h-28 sm:w-28 text-primary" />
          </div>
          <motion.h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            চালের ধরণ
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-sm sm:text-base max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            আমাদের সকল ধরনের প্রিমিয়াম চাল দেখুন এবং সহজেই অর্ডার করুন
          </motion.p>

          {/* Search inside hero */}
          <motion.div
            className="relative max-w-sm mt-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="চালের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-background/80 backdrop-blur-sm border-primary/15 focus:border-primary/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Category Filter Chips */}
        <motion.div
          className="flex gap-2 flex-wrap mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => handleFilter(null)}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium border transition-all duration-300 ${
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-card border-border hover:bg-muted hover:border-primary/30'
            }`}
          >
            সব ({products.length})
          </motion.button>
          {categories.map((cat, i) => {
            const count = products.filter(p => p.rice_categories?.name === cat.name).length;
            return (
              <motion.button
                key={cat.id}
                onClick={() => handleFilter(cat.name)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium border transition-all duration-300 ${
                  activeCategory === cat.name
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-card border-border hover:bg-muted hover:border-primary/30'
                }`}
              >
                {cat.name} ({count})
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active filter indicator */}
        <AnimatePresence>
          {(activeCategory || searchQuery) && (
            <motion.div
              className="flex items-center gap-2 mb-5 text-sm text-muted-foreground"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>
                {filtered.length}টি পণ্য পাওয়া গেছে
                {activeCategory && <> — <strong className="text-foreground">{activeCategory}</strong></>}
                {searchQuery && <> — &ldquo;<strong className="text-foreground">{searchQuery}</strong>&rdquo;</>}
              </span>
              <button
                onClick={() => { handleFilter(null); setSearchQuery(''); }}
                className="text-primary hover:underline text-xs"
              >
                সব দেখুন
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <motion.div
            className="text-center py-20 space-y-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {products.length === 0 ? 'এখনো কোনো চাল যোগ করা হয়নি' : 'এই ক্যাটাগরিতে কোনো চাল পাওয়া যায়নি'}
            </p>
            <button
              onClick={() => { handleFilter(null); setSearchQuery(''); }}
              className="text-primary text-sm hover:underline"
            >
              সব পণ্য দেখুন
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
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
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default Categories;
