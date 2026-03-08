import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import PageHead from '@/components/PageHead';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
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
        supabase.from('rice_categories').select('id, name').order('name'),
        supabase.from('rice_products').select('*, rice_categories(id, name)').eq('is_available', true).order('name'),
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
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <PageHead title="চালের ধরণ" description="চাল সদাইতে সকল ধরনের চাল দেখুন — মিনিকেট, নাজিরশাইল, বাসমতি ও আরও অনেক।" />
      <h1 className="text-3xl font-bold mb-2">চালের ধরণ</h1>
      <p className="text-muted-foreground mb-6">আমাদের সকল ধরনের চাল দেখুন এবং অর্ডার করুন</p>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="চালের নাম দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => handleFilter(null)}
          className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
            !activeCategory
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:bg-muted'
          }`}
        >
          সব
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.name)}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
              activeCategory === cat.name
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:bg-muted'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          {products.length === 0 ? 'এখনো কোনো চাল যোগ করা হয়নি' : 'এই ক্যাটাগরিতে কোনো চাল নেই'}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
