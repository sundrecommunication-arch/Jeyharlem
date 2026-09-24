import React from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

const FALLBACK = ['Worldwide Shipping', '100% Raw Human Hair', 'Book Your Luxury Install', 'London Atelier'];

export default function Ticker() {
  const { ticker } = useSettings();
  const items = ticker && ticker.length ? ticker : FALLBACK;
  return (
    <div className="ticker">
      <div className="ticker-track">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <React.Fragment key={i}>
              {items.map((t, j) => (
                <span key={j}>{t}</span>
              ))}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
