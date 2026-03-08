import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, HelpCircle } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from('faqs')
        .select('id, question, answer')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      setFaqs(data || []);
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10 max-w-2xl">
        <PageHead
          title="সাধারণ জিজ্ঞাসা"
          description="চাল সদাই সম্পর্কে সাধারণ জিজ্ঞাসা ও উত্তর।"
          canonicalPath="/faq"
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">সাধারণ জিজ্ঞাসা</h1>
        <p className="text-muted-foreground mb-6 sm:mb-8">আমাদের সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন ও উত্তর</p>

        {faqs.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">কোনো FAQ যোগ করা হয়নি</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <AccordionItem value={faq.id} className="border rounded-xl px-4 sm:px-5 premium-card">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        )}
      </div>
    </PageTransition>
  );
};

export default FAQ;
