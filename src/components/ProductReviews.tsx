import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null } | null;
}

const StarRating = ({ rating, onRate, interactive = false, size = 'md' }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}) => {
  const [hover, setHover] = useState(0);
  const px = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            className={`${px} transition-colors ${
              star <= (hover || rating)
                ? 'fill-secondary text-secondary'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*, profiles!product_reviews_user_id_fkey(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    const typed = (data || []) as unknown as Review[];
    setReviews(typed);
    if (user) {
      const mine = typed.find((r) => r.user_id === user.id);
      setUserReview(mine || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const handleSubmit = async () => {
    if (!user) { toast.error('রিভিউ দিতে লগইন করুন'); return; }
    if (rating === 0) { toast.error('স্টার রেটিং দিন'); return; }
    setSubmitting(true);

    const { error } = await supabase.from('product_reviews').upsert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    }, { onConflict: 'user_id,product_id' });

    if (error) {
      toast.error('রিভিউ সেভ করা যায়নি');
    } else {
      toast.success(userReview ? 'রিভিউ আপডেট হয়েছে!' : 'রিভিউ যোগ হয়েছে!');
      setComment('');
      setRating(0);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;
    const { error } = await supabase.from('product_reviews').delete().eq('id', userReview.id);
    if (!error) {
      toast.success('রিভিউ মুছে ফেলা হয়েছে');
      setUserReview(null);
      fetchReviews();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      className="mt-12 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">রিভিউ ও রেটিং</h2>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(Number(avgRating))} />
          <span className="text-lg font-semibold text-foreground">{avgRating}</span>
          <span className="text-sm text-muted-foreground">({reviews.length}টি রিভিউ)</span>
        </div>
      </div>

      {/* Review Form */}
      {user && !userReview && (
        <div className="premium-card rounded-xl p-5 space-y-3">
          <p className="font-medium">আপনার রিভিউ দিন</p>
          <StarRating rating={rating} onRate={setRating} interactive />
          <Textarea
            placeholder="আপনার মতামত লিখুন (ঐচ্ছিক)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            রিভিউ দিন
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">রিভিউ দিতে <a href="/auth" className="text-primary underline">লগইন</a> করুন।</p>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              className="rounded-xl border bg-card p-4 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {(review.profiles?.full_name || 'U')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.profiles?.full_name || 'ব্যবহারকারী'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: bn })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {user?.id === review.user_id && (
                    <Button variant="ghost" size="icon" onClick={handleDelete} className="h-7 w-7 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <p className="text-center text-muted-foreground py-6">এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductReviews;
