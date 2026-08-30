import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MapPin, MessageCircle, Facebook, ShoppingBag, HelpCircle, Home, Mail, Wheat, ArrowUpRight, PackageSearch } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map: Record<string, string> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
    };
    fetchSettings();
  }, []);

  const quickLinks = [
    { to: '/', label: 'হোম', icon: Home },
    { to: '/categories', label: 'চালের ধরণ', icon: ShoppingBag },
    { to: '/online-rice-delivery-dhaka', label: 'ঢাকায় অনলাইনে চাল অর্ডার', icon: ShoppingBag },
    { to: '/online-grocery-delivery-dhaka', label: 'অনলাইন গ্রোসারি ডেলিভারি', icon: ShoppingBag },
    { to: '/track', label: 'অর্ডার ট্র্যাক', icon: PackageSearch },
    { to: '/faq', label: 'সাধারণ জিজ্ঞাসা', icon: HelpCircle },
    { to: '/contact', label: 'যোগাযোগ', icon: Mail },
  ];

  return (
    <footer className="relative border-t bg-card mt-16 pb-20 md:pb-0 overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Subtle background decoration */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/[0.04] blur-3xl pointer-events-none" />

      <div className="container relative py-12 sm:py-14">
        <div className="grid gap-10 sm:gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wheat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">CHAL SODAI</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">চাল সদাই</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              ঢাকা শহরে বিশ্বস্ত প্রিমিয়াম চাল সরবরাহকারী। সেরা মানের চাল সরাসরি আপনার দোরগোড়ায়, সাশ্রয়ী মূল্যে।
            </p>

            {/* Social / Contact icons row */}
            <div className="flex gap-2 pt-1">
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.contact_phone && (
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  aria-label="Phone"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">দ্রুত লিংক</h4>
            <div className="space-y-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <link.icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">যোগাযোগ</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" />
                  <span>{settings.contact_phone}</span>
                </a>
              )}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" />
                  <span>হোয়াটসঅ্যাপে মেসেজ করুন</span>
                </a>
              )}

              {/* Business hours */}
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-xs font-semibold text-foreground mb-1">🕐 কাজের সময়</p>
                <p className="text-xs text-muted-foreground">সকাল ৯টা — রাত ১০টা (প্রতিদিন)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
            <p>© ২০২৫ CHAL SODAI (চাল সদাই)। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
