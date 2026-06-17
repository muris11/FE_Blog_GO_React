import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaSelector } from '@/components/MediaSelector';
import { Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const openSelector = (field: string) => {
    setActiveField(field);
    setSelectorOpen(true);
  };

  const handleMediaSelect = (media: any) => {
    if (activeField) {
      handleChange(activeField, media.url);
    }
  };

  useEffect(() => {
    document.title = "Settings | BlogForge Admin";
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      setSettings(response.data.data || {});
    } catch (error) {
      console.error('Error fetching settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await apiClient.put('/admin/settings', settings);
      setSaveMessage('Settings saved successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings', error);
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">Site Settings</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Configure global platform options</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Identity Group */}
        <div className="border-2 border-black bg-white sharp-corners p-6">
          <h2 className="font-serif font-black text-xl uppercase tracking-tighter border-b-2 border-black pb-2 mb-4">Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Site Name</Label>
              <Input 
                value={settings.site_name || ''} 
                onChange={(e) => handleChange('site_name', e.target.value)} 
                className="sharp-corners border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Site Tagline</Label>
              <Input 
                value={settings.site_tagline || ''} 
                onChange={(e) => handleChange('site_tagline', e.target.value)} 
                className="sharp-corners border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Logo</Label>
              <div className="flex items-center gap-4">
                {settings.site_logo && (
                  <img src={settings.site_logo} alt="Logo" className="h-10 w-10 object-contain border border-black bg-neutral-100 p-1" />
                )}
                <Button type="button" variant="outline" onClick={() => openSelector('site_logo')} className="sharp-corners font-mono text-xs uppercase tracking-widest">
                  {settings.site_logo ? 'Change' : 'Select Image'}
                </Button>
                {settings.site_logo && (
                  <Button type="button" variant="ghost" onClick={() => handleChange('site_logo', '')} className="text-red-500 sharp-corners font-mono text-xs uppercase tracking-widest">
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Favicon</Label>
              <div className="flex items-center gap-4">
                {settings.site_favicon && (
                  <img src={settings.site_favicon} alt="Favicon" className="h-10 w-10 object-contain border border-black bg-neutral-100 p-1" />
                )}
                <Button type="button" variant="outline" onClick={() => openSelector('site_favicon')} className="sharp-corners font-mono text-xs uppercase tracking-widest">
                  {settings.site_favicon ? 'Change' : 'Select Image'}
                </Button>
                {settings.site_favicon && (
                  <Button type="button" variant="ghost" onClick={() => handleChange('site_favicon', '')} className="text-red-500 sharp-corners font-mono text-xs uppercase tracking-widest">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Group */}
        <div className="border-2 border-black bg-white sharp-corners p-6">
          <h2 className="font-serif font-black text-xl uppercase tracking-tighter border-b-2 border-black pb-2 mb-4">SEO Defaults</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Default Title</Label>
              <Input 
                value={settings.seo_default_title || ''} 
                onChange={(e) => handleChange('seo_default_title', e.target.value)} 
                className="sharp-corners border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Default Description</Label>
              <Input 
                value={settings.seo_default_desc || ''} 
                onChange={(e) => handleChange('seo_default_desc', e.target.value)} 
                className="sharp-corners border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Default OG Image</Label>
              <div className="flex items-center gap-4">
                {settings.seo_default_ogimage && (
                  <img src={settings.seo_default_ogimage} alt="OG Image" className="h-10 w-16 object-cover border border-black bg-neutral-100" />
                )}
                <Button type="button" variant="outline" onClick={() => openSelector('seo_default_ogimage')} className="sharp-corners font-mono text-xs uppercase tracking-widest">
                  {settings.seo_default_ogimage ? 'Change' : 'Select Image'}
                </Button>
                {settings.seo_default_ogimage && (
                  <Button type="button" variant="ghost" onClick={() => handleChange('seo_default_ogimage', '')} className="text-red-500 sharp-corners font-mono text-xs uppercase tracking-widest">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* General / Other */}
        <div className="border-2 border-black bg-white sharp-corners p-6">
          <h2 className="font-serif font-black text-xl uppercase tracking-tighter border-b-2 border-black pb-2 mb-4">General / Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Contact Email</Label>
              <Input 
                value={settings.contact_email || ''} 
                onChange={(e) => handleChange('contact_email', e.target.value)} 
                className="sharp-corners border-2 border-black font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs font-bold uppercase tracking-widest">Footer Text</Label>
              <Input 
                value={settings.footer_text || ''} 
                onChange={(e) => handleChange('footer_text', e.target.value)} 
                className="sharp-corners border-2 border-black"
              />
            </div>
            <div className="space-y-4 md:col-span-2">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <Label className="font-mono text-xs font-bold uppercase tracking-widest">Social Links</Label>
                <Button 
                  type="button" 
                  onClick={() => {
                    const current = Array.isArray(settings.social_links) ? settings.social_links : [];
                    handleChange('social_links', [...current, { platform: '', url: '' }]);
                  }}
                  variant="outline" 
                  size="sm" 
                  className="sharp-corners font-mono text-xs"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
              
              <div className="space-y-4">
                {Array.isArray(settings.social_links) && settings.social_links.length > 0 ? (
                  settings.social_links.map((link: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-1">
                        <Input 
                          placeholder="Platform (e.g. twitter)" 
                          value={link.platform || ''}
                          onChange={(e) => {
                            const newLinks = [...settings.social_links];
                            newLinks[index].platform = e.target.value;
                            handleChange('social_links', newLinks);
                          }}
                          className="sharp-corners border-2 border-black"
                        />
                      </div>
                      <div className="flex-[2]">
                        <Input 
                          placeholder="URL (e.g. https://twitter.com/...)" 
                          value={link.url || ''}
                          onChange={(e) => {
                            const newLinks = [...settings.social_links];
                            newLinks[index].url = e.target.value;
                            handleChange('social_links', newLinks);
                          }}
                          className="sharp-corners border-2 border-black"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        className="sharp-corners shrink-0"
                        onClick={() => {
                          const newLinks = [...settings.social_links];
                          newLinks.splice(index, 1);
                          handleChange('social_links', newLinks);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 border-2 border-dashed border-gray-300 sharp-corners text-gray-500 font-mono text-sm">
                    No social links added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSaving} className="sharp-corners bg-black hover:bg-accent text-white px-8">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {saveMessage && (
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              {saveMessage}
            </span>
          )}
        </div>
      </form>
      
      <MediaSelector 
        open={selectorOpen} 
        onOpenChange={setSelectorOpen} 
        onSelect={handleMediaSelect} 
      />
    </div>
  );
}
