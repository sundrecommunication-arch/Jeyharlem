import React from 'react';
import { ImagePlaceholder, VideoPlaceholder } from '../components/Placeholder.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function About() {
  const { siteImages, siteVideos } = useSettings();
  return (
    <>
      <div className="page-hero wrap">
        <span className="eyebrow">Our Story</span>
        <h1>Not Just Hair. A Standard.</h1>
        <p>IBCOCO Quality Hairs — an Essex-based wig vendor shipping premium human hair worldwide.</p>
      </div>
      <section className="content-section">
        <div className="wrap content-grid">
          <ImagePlaceholder label="IBCOCO in the atelier — portrait photo" src={siteImages?.aboutPortrait} />
          <div>
            <span className="eyebrow">What We Stand For</span>
            <h2>Luxury Is A Feeling, Not A Price Point</h2>
            {/* Placeholder narrative built from IBCOCO's own live-site copy — confirm the exact founding story, dates and location with the client before launch. */}
            <p className="pd-desc">
              We curate premium human hair for women who understand that luxury is a feeling, not a price point. Every unit is handpicked for texture, density and finish — IBCOCO delivers the same standard of excellence to your door.
            </p>
            <p className="pd-desc">
              Every unit in the collection is crafted from 100% raw human hair — unprocessed, unblended and sourced to the highest quality standard. No synthetic fibres, no shortcuts.
            </p>
            <div className="about-stats">
              <div><strong>100%</strong><span>Human Hair</span></div>
              <div><strong>4+</strong><span>Collections</span></div>
              <div><strong>Worldwide</strong><span>Shipping</span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap">
          <div className="page-hero" style={{ padding: '0 0 30px' }}>
            <span className="eyebrow">Behind The Scenes</span>
            <h2>Inside The IBCOCO Edit</h2>
          </div>
          <VideoPlaceholder label="Studio / unboxing walkthrough video" ratio="16/9" src={siteVideos?.aboutStudio} />
        </div>
      </section>
    </>
  );
}
