import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import PageHead from '@/components/PageHead';

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
    <div className="container py-10 max-w-2xl">
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
      <h1 className="text-3xl font-bold mb-2">সাধারণ জিজ্ঞাসা</h1>
      <p className="text-muted-foreground mb-8">আমাদের সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন ও উত্তর</p>

      {faqs.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো FAQ যোগ করা হয়নি</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border rounded-xl px-5">
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default FAQ;
