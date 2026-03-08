import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

interface HeroCarouselProps {
  promotions: Promotion[];
  fallbackImage: string;
}

const HeroCarousel = ({ promotions, fallbackImage }: HeroCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (!emblaApi || promotions.length <= 1) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi, promotions.length]);

  // Track selected slide
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (promotions.length === 0) {
    return (
      <img
        src={fallbackImage}
        alt="চাল সদাই হিরো"
        width={1200}
        height={420}
        className="w-full max-h-[420px] object-cover"
      />
    );
  }

  if (promotions.length === 1) {
    return (
      <Link to={promotions[0].link_url} className="block">
        <img
          src={promotions[0].image_url}
          alt={promotions[0].title || 'প্রমোশন'}
          className="w-full max-h-[420px] object-cover transition-transform hover:scale-[1.01] duration-300"
        />
      </Link>
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {promotions.map((promo) => (
            <div key={promo.id} className="flex-[0_0_100%] min-w-0">
              <Link to={promo.link_url} className="block">
                <img
                  src={promo.image_url}
                  alt={promo.title || 'প্রমোশন'}
                  className="w-full max-h-[420px] object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
        aria-label="আগের স্লাইড"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
        aria-label="পরের স্লাইড"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {promotions.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? 'w-7 bg-primary'
                : 'w-2.5 bg-background/60 hover:bg-background/80'
            }`}
            aria-label={`স্লাইড ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
