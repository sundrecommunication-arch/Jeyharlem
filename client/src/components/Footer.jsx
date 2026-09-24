import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';

function FooterCol({ title, links }) {
  return (
    <div className="foot-col">
      <h5>{title}</h5>
      <ul>
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { bankTransfer, logo } = useSettings();
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            {logo ? <img src={logo} alt="IBCOCO Quality Hairs" /> : <span className="logo-word">IBCOCO<span className="logo-sub">Quality Hairs</span></span>}
            <p>A luxury wig house where every unit feels bespoke, elegant and confidence-transforming — shipping worldwide from Essex, United Kingdom.</p>
            <div className="foot-social">
              <a href="https://www.instagram.com/imbycoco" target="_blank" rel="noreferrer">IG</a>
              <a href="https://www.tiktok.com/@cocohairboss" target="_blank" rel="noreferrer">TT</a>
              <a href="https://www.snapchat.com/add/imbycoco" target="_blank" rel="noreferrer">SC</a>
            </div>
          </div>
          <FooterCol
            title="Shop"
            links={[
              ['All Products', '/shop'],
              ['Wigs', '/shop?category=wigs'],
              ['Lace Fronts', '/shop?category=closures'],
              ['Hair Bundles', '/shop?category=bundles'],
              ['Hair Products', '/shop?category=care'],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ['Our Story', '/about'],
              ['My Account', '/account'],
              ['Returns Policy', '/shipping-returns'],
              ['FAQs', '/faqs'],
            ]}
          />
          <div className="foot-col">
            <h5>Get In Touch</h5>
            <Link className="btn ghost small" to="/contact">Contact Us</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 IBCOCO Quality Hairs. All Rights Reserved.</span>
          <div className="pay-icons">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Apple Pay</span>
            <span>Stripe</span>
            {bankTransfer.enabled && <span>Bank Transfer</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}
