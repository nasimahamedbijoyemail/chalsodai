import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Truck, Wallet, ShieldCheck, ChevronRight, Wheat, Phone } from 'lucide-react';
import { DELIVERY_CHARGE } from '@/lib/constants';

const BASE_URL = 'https://www.chalsodai.com';
const PHONE = '+8801777416903';

interface LandingConfig {
  path: string;
  h1: string;
  title: string;
  description: string;
  keywords: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  faqs: { q: string; a: string }[];
}

export const LANDING_PAGES: Record<string, LandingConfig> = {
  '/online-rice-delivery-dhaka': {
    path: '/online-rice-delivery-dhaka',
    h1: 'ঢাকায় অনলাইনে চাল অর্ডার করুন — Chal Sodai',
    title: 'ঢাকায় অনলাইনে চাল অর্ডার | Order Rice Online in Dhaka',
    description:
      'ঢাকায় অনলাইনে চাল অর্ডার করুন চাল সদাই থেকে — মিনিকেট, নাজিরশাইল, চিনিগুড়া, বাসমতি। ক্যাশ অন ডেলিভারি, ফ্ল্যাট ৳60 ডেলিভারি চার্জ, অ্যাকাউন্ট ছাড়াই অর্ডার।',
    keywords:
      'ঢাকায় অনলাইনে চাল অর্ডার, order rice online Dhaka, buy rice online Bangladesh, চাল হোম ডেলিভারি ঢাকা, online chal order, rice delivery Dhaka, চালের দাম ঢাকা',
    intro:
      'চাল সদাই (Chal Sodai) ঢাকার একটি অনলাইন চালের দোকান। ঘরে বসে মিনিকেট, নাজিরশাইল, চিনিগুড়া, বাসমতি, আটাশ বা কাটারিভোগ চাল অর্ডার করুন — ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।',
    sections: [
      {
        heading: 'ঢাকায় অনলাইনে চাল অর্ডার করার নিয়ম',
        body: [
          'চালের ধরণ ও প্যাক সাইজ (৫ কেজি, ১০ কেজি, ২৫ কেজি বা ৫০ কেজি বস্তা) বেছে নিন।',
          'কার্টে যোগ করুন অথবা সরাসরি "এখনই কিনুন" চাপুন — অ্যাকাউন্ট খোলার প্রয়োজন নেই।',
          `নাম, ফোন নম্বর ও ঢাকার ঠিকানা দিন। ঢাকার ভিতরে ফ্ল্যাট ৳${DELIVERY_CHARGE} ডেলিভারি চার্জ।`,
          'অর্ডার নম্বর (CS-YYYYMMDD-XXXX) দিয়ে যেকোনো সময় /track পেজে অর্ডার ট্র্যাক করুন।',
        ],
      },
      {
        heading: 'কোন চাল কোন রান্নার জন্য',
        body: [
          'মিনিকেট চাল — প্রতিদিনের ভাতের জন্য সবচেয়ে জনপ্রিয়, ঝরঝরে ও চিকন।',
          'নাজিরশাইল চাল — নরম ভাত পছন্দ করলে, পরিবারের নিয়মিত ব্যবহারে ভালো।',
          'চিনিগুড়া / পোলাও চাল — পোলাও, বিরিয়ানি ও খিচুড়ির জন্য সুগন্ধি চাল।',
          'বাসমতি চাল — বিরিয়ানি ও ফ্রায়েড রাইসের জন্য লম্বা দানার চাল।',
          'আটাশ (BR-28) চাল — সাশ্রয়ী দামে বেশি পরিমাণে ভাতের জন্য।',
        ],
      },
    ],
    faqs: [
      {
        q: 'ঢাকায় অনলাইনে চাল অর্ডার করলে কত সময়ে ডেলিভারি হয়?',
        a: 'ঢাকার ভিতরে সাধারণত অর্ডারের পর দ্রুততম সময়ে ডেলিভারি করা হয়। অর্ডার নম্বর দিয়ে ট্র্যাক পেজ থেকে সর্বশেষ অবস্থা দেখা যায়।',
      },
      {
        q: 'অনলাইনে চাল অর্ডারে পেমেন্ট কীভাবে করব?',
        a: 'বর্তমানে শুধুমাত্র ক্যাশ অন ডেলিভারি — চাল হাতে পাওয়ার সময় ডেলিভারি এজেন্টকে টাকা পরিশোধ করবেন।',
      },
      {
        q: 'ডেলিভারি চার্জ কত?',
        a: `ঢাকার ভিতরে ফ্ল্যাট ৳${DELIVERY_CHARGE} ডেলিভারি চার্জ প্রযোজ্য।`,
      },
      {
        q: 'অ্যাকাউন্ট ছাড়া অর্ডার করা যায়?',
        a: 'হ্যাঁ। গেস্ট চেকআউটে শুধু নাম, ফোন ও ঠিকানা দিলেই অর্ডার সম্পন্ন হয়।',
      },
    ],
  },
  '/online-grocery-delivery-dhaka': {
    path: '/online-grocery-delivery-dhaka',
    h1: 'ঢাকায় অনলাইন গ্রোসারি ডেলিভারি — চালের জন্য Chal Sodai',
    title: 'ঢাকায় অনলাইন গ্রোসারি ডেলিভারি | Online Grocery (Rice) Dhaka',
    description:
      'ঢাকায় অনলাইন গ্রোসারি ডেলিভারি খুঁজছেন? চাল সদাই ঢাকার চাল-বিশেষায়িত অনলাইন গ্রোসারি — মাসের বাজারের চাল ঘরে পৌঁছে দেয়, ক্যাশ অন ডেলিভারি।',
    keywords:
      'অনলাইন গ্রোসারি ঢাকা, online grocery Dhaka, grocery delivery Dhaka, অনলাইন বাজার ঢাকা, মাসের বাজার অনলাইন, online grocery shopping Bangladesh, চাল অনলাইন গ্রোসারি',
    intro:
      'চাল সদাই একটি চাল-বিশেষায়িত অনলাইন গ্রোসারি সার্ভিস — অর্থাৎ আমরা শুধু চাল বিক্রি করি, কিন্তু চালের ক্ষেত্রে মান, ওজন ও দামে আপস করি না। মাসের বাজারের সবচেয়ে ভারী ও গুরুত্বপূর্ণ অংশটি ঢাকায় আপনার ঘরে পৌঁছে দেই।',
    sections: [
      {
        heading: 'কেন আলাদা চালের অনলাইন গ্রোসারি?',
        body: [
          'সাধারণ গ্রোসারি অ্যাপে চাল অনেক পণ্যের একটি — মান ও ওজনে হেরফের হয়। আমরা শুধু চাল নিয়েই কাজ করি।',
          '২৫ কেজি ও ৫০ কেজি বস্তা সিঁড়ি বেয়ে বাসায় পৌঁছে দেওয়া হয় — বাজার থেকে বয়ে আনার ঝামেলা নেই।',
          'দাম ওয়েবসাইটে স্পষ্ট লেখা, কোনো লুকানো চার্জ নেই — শুধু ঢাকার ভিতরে ফ্ল্যাট ৳' + DELIVERY_CHARGE + ' ডেলিভারি চার্জ।',
        ],
      },
      {
        heading: 'অনলাইন বাজারে চাল কেনার সময় যা দেখবেন',
        body: [
          'ওজন — বস্তায় ঘোষিত ওজন ঠিক আছে কিনা।',
          'জাত — মিনিকেট, নাজিরশাইল, চিনিগুড়া, বাসমতি ও আটাশের ব্যবহার আলাদা।',
          'পেমেন্ট — ক্যাশ অন ডেলিভারি থাকলে পণ্য দেখে টাকা দেওয়া যায়, ঝুঁকি কম।',
        ],
      },
    ],
    faqs: [
      {
        q: 'চাল সদাই কি সব ধরনের গ্রোসারি ডেলিভারি করে?',
        a: 'না। চাল সদাই শুধুমাত্র চাল ডেলিভারি করে — ঢাকায় মাসের বাজারের চালের অংশটুকু আমরা সামলাই।',
      },
      {
        q: 'ঢাকার কোথায় কোথায় ডেলিভারি হয়?',
        a: 'ঢাকা শহরের ভিতরে ডেলিভারি করা হয়, ফ্ল্যাট ৳' + DELIVERY_CHARGE + ' চার্জে।',
      },
      {
        q: 'অর্ডার নিয়ে কথা বলতে চাইলে?',
        a: `ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করুন: ${PHONE}`,
      },
    ],
  },
};

interface Row {
  id: string;
  name: string;
  price: number;
  pack_size: string;
}

const SeoLanding = () => {
  const { pathname } = useLocation();
  const config = LANDING_PAGES[pathname];
  const [products, setProducts] = useState<Row[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase
      .from('rice_products')
      .select('id, name, price, pack_size')
      .eq('is_available', true)
      .order('price')
      .limit(12)
      .then(({ data }) => setProducts((data as Row[]) || []));
  }, [pathname]);

  if (!config) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}${config.path}#page`,
        name: config.title,
        description: config.description,
        url: `${BASE_URL}${config.path}`,
        inLanguage: 'bn-BD',
        isPartOf: { '@type': 'WebSite', name: 'Chal Sodai', url: BASE_URL },
        about: { '@type': 'Thing', name: 'Online rice and grocery delivery in Dhaka' },
      },
      {
        '@type': 'Service',
        name: 'Online rice delivery in Dhaka',
        provider: { '@type': 'Organization', name: 'Chal Sodai', url: BASE_URL, telephone: PHONE },
        areaServed: { '@type': 'City', name: 'Dhaka' },
        serviceType: 'Online grocery (rice) delivery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BDT',
          availability: 'https://schema.org/InStock',
          acceptedPaymentMethod: { '@type': 'PaymentMethod', name: 'Cash on Delivery' },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: config.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'হোম', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: config.h1, item: `${BASE_URL}${config.path}` },
        ],
      },
    ],
  };

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10">
        <PageHead
          title={config.title}
          description={config.description}
          canonicalPath={config.path}
          keywords={config.keywords}
          jsonLd={jsonLd}
        />

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">হোম</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{config.title}</span>
        </nav>

        <motion.header
          className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6 sm:p-8 border border-primary/10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute top-4 right-4 opacity-10">
            <Wheat className="h-20 w-20 sm:h-28 sm:w-28 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{config.h1}</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">{config.intro}</p>
          <div className="flex flex-wrap gap-4 mt-5 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> ঢাকায় হোম ডেলিভারি</span>
            <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-primary" /> ক্যাশ অন ডেলিভারি</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> ওজন ও মান নিশ্চিত</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild><Link to="/categories">চাল দেখে অর্ডার করুন</Link></Button>
            <Button asChild variant="outline">
              <a href={`tel:${PHONE}`}><Phone className="h-4 w-4 mr-1.5" /> {PHONE}</a>
            </Button>
          </div>
        </motion.header>

        {products.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">আজকের চালের দাম (ঢাকা)</h2>
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 font-medium">চাল</th>
                    <th className="p-3 font-medium">প্যাক</th>
                    <th className="p-3 font-medium">দাম</th>
                    <th className="p-3 font-medium sr-only">লিংক</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.pack_size}</td>
                      <td className="p-3 font-semibold">৳{Number(p.price).toLocaleString('bn-BD')}</td>
                      <td className="p-3 text-right">
                        <Link to={`/product/${p.id}`} className="text-primary hover:underline">বিস্তারিত</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">দাম পরিবর্তনশীল — ওয়েবসাইটে দেখানো দামই সর্বশেষ।</p>
          </section>
        )}

        {config.sections.map((s) => (
          <section key={s.heading} className="mb-8 max-w-3xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-3">{s.heading}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              {s.body.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-10 max-w-3xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">সাধারণ জিজ্ঞাসা</h2>
          <div className="space-y-4">
            {config.faqs.map((f) => (
              <div key={f.q} className="rounded-xl border p-4">
                <h3 className="font-medium text-sm mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl text-sm text-muted-foreground leading-relaxed space-y-3">
          <h2 className="text-lg font-semibold text-foreground">আরও দেখুন</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/categories" className="text-primary hover:underline">সব চালের ধরণ</Link>
            <Link to="/rice/miniket" className="text-primary hover:underline">মিনিকেট চাল</Link>
            <Link to="/faq" className="text-primary hover:underline">সাধারণ জিজ্ঞাসা</Link>
            <Link to="/track" className="text-primary hover:underline">অর্ডার ট্র্যাক</Link>
            <Link to="/contact" className="text-primary hover:underline">যোগাযোগ</Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default SeoLanding;
