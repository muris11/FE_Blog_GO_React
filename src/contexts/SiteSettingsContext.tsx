import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface SiteSettings {
  site_name?: string;
  site_tagline?: string;
  site_description?: string;
  site_features?: string[];
  site_logo?: string;
  site_favicon?: string;
  seo_default_title?: string;
  seo_default_desc?: string;
  seo_default_ogimage?: string;
  footer_text?: string;
  social_links?: any[];
  [key: string]: any;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: {},
  loading: true,
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/public/settings');
        const data = response.data.data || {};
        setSettings(data);
        
        // Update document title dynamically
        if (data.site_name) {
          document.title = data.site_name;
        }

        // Update favicon dynamically
        if (data.site_favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.site_favicon;
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
