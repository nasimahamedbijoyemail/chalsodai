import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const settingsConfig = [
  { key: 'contact_phone', label: 'যোগাযোগ ফোন নম্বর', placeholder: '01XXXXXXXXX' },
  { key: 'whatsapp_number', label: 'হোয়াটসঅ্যাপ নম্বর', placeholder: '8801XXXXXXXXX' },
  { key: 'facebook_url', label: 'ফেসবুক পেজ লিংক', placeholder: 'https://facebook.com/...' },
  { key: 'youtube_url', label: 'ইউটিউব চ্যানেল লিংক', placeholder: 'https://youtube.com/...' },
  { key: 'instagram_url', label: 'ইনস্টাগ্রাম লিংক', placeholder: 'https://instagram.com/...' },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map: Record<string, string> = {};
      data?.forEach((s) => (map[s.key] = s.value));
      setSettings(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of settingsConfig) {
        await supabase
          .from('site_settings')
          .upsert({ key, value: settings[key] || '' }, { onConflict: 'key' });
      }
      toast.success('সেটিংস সেভ করা হয়েছে');
    } catch {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">সাইট সেটিংস</h1>
      <div className="max-w-lg space-y-5">
        {settingsConfig.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input
              value={settings[key] || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          সেভ করুন
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
