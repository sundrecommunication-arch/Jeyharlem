import React, { useState } from 'react';
import { ImagePlaceholder } from '../components/Placeholder.jsx';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function Contact() {
  const setToast = useToast();
  const { bankTransfer, siteImages } = useSettings();
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/messages', { method: 'POST', body: JSON.stringify(f) });
      setToast('Message received. Our team will get back to you.');
      setF({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setToast(err.message);
    }
  };

  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <div className="wrap content-grid">
        <ImagePlaceholder label="IBCOCO Quality Hairs studio / atelier photo" src={siteImages?.contactAtelier} />
        <div>
          <span className="eyebrow">Get In Touch</span>
          <h1>Contact Us</h1>
          <p className="pd-desc">Questions about an order, a texture match, or booking an install? Send us a message and our team will get back to you.</p>
          <form className="contact-form" onSubmit={submit}>
            <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <textarea required placeholder="Your message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            <button className="btn gold">Send Message</button>
          </form>
          <div className="contact-info" style={{ marginTop: 30 }}>
            <div><strong>Address</strong><span>Essex, United Kingdom</span></div>
            <div><strong>Email</strong><span>Placeholder — confirm real contact email with IBCOCO</span></div>
            <div><strong>WhatsApp</strong><span>+44 7506 297286</span></div>
            <div><strong>Social</strong><span>Instagram &amp; TikTok @IBCOCO</span></div>
          </div>
          {bankTransfer.enabled && bankTransfer.instructions && (
            <div className="policy-block" style={{ marginTop: 30 }}>
              <h2>Pay By Bank Transfer</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{bankTransfer.instructions}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
