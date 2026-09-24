import React from 'react';

export default function ShippingReturns() {
  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <div className="wrap">
        <div className="page-hero" style={{ padding: '0 0 50px' }}>
          <span className="eyebrow">Client Care</span>
          <h1>Shipping & Returns</h1>
          <p>Pulled from the current jeyharlem.com policy — confirm wording still matches before launch.</p>
        </div>
        <div className="policy-block">
          <h2>Shipping</h2>
          <p>Standard delivery typically takes 3–5 working days. Express options are available at checkout for faster dispatch. You'll receive a tracking number as soon as your order is confirmed.</p>
          <p>IBCOCO ships worldwide.</p>
        </div>
        <div className="policy-block">
          <h2>Returns & Exchanges</h2>
          <p>We accept returns within 7 days of delivery provided the item is unworn, unaltered and in its original packaging. Due to hygiene reasons we are unable to accept returns on worn units.</p>
          <p>If you receive a damaged or incorrect item, please contact us within 48 hours and we will make it right.</p>
        </div>
        <div className="policy-block">
          <h2>Warranty</h2>
          <p>[Placeholder — outline any care warranty or install guarantee IBCOCO offers.]</p>
        </div>
      </div>
    </section>
  );
}
