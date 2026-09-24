import React, { useEffect } from 'react';
import { faqs } from '../data/content.js';

const PAGE_TITLE = 'FAQs — Human Hair Wigs & Delivery, UK | IBCOCO Quality Hairs';
const PAGE_DESC =
  'Answers to common questions about IBCOCO Quality Hairs: 100% raw human hair wigs, UK delivery times, worldwide shipping from Essex, textures, pricing, care, returns and payment.';

// FAQPage structured data (schema.org) — this is what search engines' rich-result
// panels, voice/answer engines (AEO) and generative/AI answer engines (GEO) read
// directly, so the on-page copy above and this JSON-LD must always match 1:1.
function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export default function FAQs() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const prevDesc = meta.getAttribute('content');
    meta.setAttribute('content', PAGE_DESC);
    return () => {
      document.title = prevTitle;
      if (created) meta.remove();
      else if (prevDesc !== null) meta.setAttribute('content', prevDesc);
    };
  }, []);

  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <script type="application/ld+json">{JSON.stringify(faqSchema())}</script>
      <div className="wrap">
        <div className="page-hero" style={{ padding: '0 0 50px' }}>
          <span className="eyebrow">Support</span>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about IBCOCO Quality Hairs — 100% raw human hair, UK &amp; worldwide delivery, textures, pricing, care and returns.</p>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <details className="faq-item" key={i}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
