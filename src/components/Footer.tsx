import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MessageCircle } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map: Record<string, string> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    };
    fetch();
  }, []);

  return (
    <footer className="border-t bg-card mt-16">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-primary mb-3">🌾 চাল বাজার</h3>
            <p className="text-sm text-muted-foreground">
              ঢাকা শহরে বিশ্বস্ত চাল সরবরাহকারী। সেরা মানের চাল সরাসরি আপনার দোরগোড়ায়।
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">দ্রুত লিংক</h4>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-muted-foreground hover:text-primary">হোম</Link>
              <Link to="/categories" className="block text-muted-foreground hover:text-primary">চালের ধরণ</Link>
              <Link to="/faq" className="block text-muted-foreground hover:text-primary">সাধারণ জিজ্ঞাসা</Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary">যোগাযোগ</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">যোগাযোগ</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📍 ঢাকা, বাংলাদেশ</p>
              {settings.contact_phone && <p>📞 {settings.contact_phone}</p>}
              {settings.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block hover:text-primary">
                  💬 হোয়াটসঅ্যাপ
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="block hover:text-primary">
                  📘 ফেসবুক
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © ২০২৬ চাল বাজার। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;
