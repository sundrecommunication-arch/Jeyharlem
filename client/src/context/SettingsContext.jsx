import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const DEFAULT_TICKER = ['Worldwide Shipping', '100% Raw Human Hair', 'Book Your Luxury Install', 'London Atelier'];
const DEFAULT_SETTINGS = { bankTransfer: { enabled: false, instructions: '' }, categoryImages: {}, heroImages: ['', '', ''], logo: '', siteImages: {}, siteVideos: {}, ticker: DEFAULT_TICKER };
const SettingsContext = createContext(DEFAULT_SETTINGS);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    api('/api/settings')
      .then(setSettings)
      .catch(() => {});
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
