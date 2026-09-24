import React from 'react';
import { careGuides } from '../data/content.js';
import { ImagePlaceholder, VideoPlaceholder } from '../components/Placeholder.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const GUIDE_IMAGE_KEYS = { 1: 'careGuideStyling', 2: 'careGuideStoring' };

export default function HairCareGuide() {
  const { siteImages, siteVideos } = useSettings();
  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <div className="wrap">
        <div className="page-hero" style={{ padding: '0 0 50px' }}>
          <span className="eyebrow">Client Care</span>
          <h1>Hair Care Guide</h1>
          <p>Placeholder guides — replace with IBCOCO's real styling and care advice, photos, and videos.</p>
        </div>
        <div className="guide-grid">
          {careGuides.map((g, i) => (
            <article className="guide-card" key={i}>
              {g.video ? <VideoPlaceholder label={`${g.title} — video`} src={siteVideos?.careGuideWashing} /> : <ImagePlaceholder label={`${g.title} — photo`} src={siteImages?.[GUIDE_IMAGE_KEYS[i]]} />}
              <h3>{g.title}</h3>
              <p>{g.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
