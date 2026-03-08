import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  pack_size: string;
  image_url: string | null;
}

const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('rice_products')
        .select('id, name, price, pack_size, image_url')
        .eq('is_available', true)
        .ilike('name', `%${query}%`)
        .limit(6);
      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/product/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>চাল খুঁজুন</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="চালের নাম লিখুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-4">খুঁজছে...</p>
        )}
        {!loading && results.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img src={r.image_url || '/placeholder.svg'} alt={r.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">৳{r.price} / {r.pack_size}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">কোনো চাল পাওয়া যায়নি</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
