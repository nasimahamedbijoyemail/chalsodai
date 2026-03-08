import { motion } from 'framer-motion';
import { Download, Smartphone, Share, Plus, CheckCircle, Wifi, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

const Install = () => {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();

  const features = [
    { icon: Zap, title: 'দ্রুত লোড', desc: 'ইন্সটল করলে অ্যাপ অনেক দ্রুত চালু হবে' },
    { icon: Wifi, title: 'অফলাইন সাপোর্ট', desc: 'ইন্টারনেট ছাড়াও ব্রাউজ করতে পারবেন' },
    { icon: Shield, title: 'নিরাপদ', desc: 'আপনার ডেটা সম্পূর্ণ সুরক্ষিত' },
  ];

  return (
    <PageTransition>
      <PageHead title="অ্যাপ ইন্সটল করুন - চাল সদাই" description="চাল সদাই অ্যাপ ইন্সটল করুন" />
      <div className="container mx-auto max-w-lg px-4 py-10 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">চাল সদাই অ্যাপ ইন্সটল করুন</h1>
            <p className="mt-2 text-muted-foreground">
              হোম স্ক্রিনে যোগ করুন — নেটিভ অ্যাপের মতো অভিজ্ঞতা পান
            </p>
          </div>

          {isInstalled ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-primary/5 p-6 space-y-3"
            >
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <p className="font-semibold text-lg">অ্যাপ ইতিমধ্যে ইন্সটল করা আছে!</p>
              <p className="text-sm text-muted-foreground">আপনি ইতিমধ্যে চাল সদাই অ্যাপ ব্যবহার করছেন।</p>
            </motion.div>
          ) : canInstall ? (
            <Button size="lg" className="w-full gap-2 text-lg py-6" onClick={install}>
              <Download className="h-5 w-5" />
              এখনই ইন্সটল করুন
            </Button>
          ) : isIOS ? (
            <Card className="text-left">
              <CardContent className="p-5 space-y-4">
                <p className="font-semibold">iPhone/iPad এ ইন্সটল করুন:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">১</div>
                    <p className="text-sm pt-1">Safari ব্রাউজারে এই পেজ খুলুন</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">২</div>
                    <div className="flex items-center gap-1 pt-1">
                      <p className="text-sm">নিচে</p>
                      <Share className="h-4 w-4 text-primary" />
                      <p className="text-sm">Share বাটনে ট্যাপ করুন</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">৩</div>
                    <div className="flex items-center gap-1 pt-1">
                      <Plus className="h-4 w-4 text-primary" />
                      <p className="text-sm">"Add to Home Screen" ট্যাপ করুন</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-left">
              <CardContent className="p-5 space-y-4">
                <p className="font-semibold">ইন্সটল করুন:</p>
                <p className="text-sm text-muted-foreground">
                  ব্রাউজারের মেনু (⋮) থেকে "Add to Home Screen" বা "Install App" অপশনটি ট্যাপ করুন।
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 pt-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Install;
