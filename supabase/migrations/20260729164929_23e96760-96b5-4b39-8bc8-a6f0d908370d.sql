ALTER TABLE public.rice_categories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

UPDATE public.rice_categories SET slug = 'miniket' WHERE name = 'মিনিকেট' AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'nazirshail' WHERE name IN ('নাজিরশাইল','নাজির শাইল') AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'chinigura' WHERE name IN ('চিনিগুড়া','চিনিগুঁড়া') AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'basmati' WHERE name = 'বাসমতি' AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'atash' WHERE name IN ('আটাশ','আটাশ চাল') AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'katarivog' WHERE name IN ('কাটারিভোগ','কাটারি ভোগ') AND slug IS NULL;
UPDATE public.rice_categories SET slug = 'rice-' || left(replace(id::text, '-', ''), 8) WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS rice_categories_slug_key ON public.rice_categories (slug);