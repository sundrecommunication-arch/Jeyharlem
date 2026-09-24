import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Newsletter({ id = 'join' }) {
  const [email, setEmail] = useState('');
  const setToast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      setToast(r.message);
      setEmail('');
    } catch (err) {
      setToast(err.message);
    }
  };

  return (
    <section className="newsletter" id={id}>
      <div className="wrap news-grid">
        <div>
          <span className="eyebrow">Stay In The Loop</span>
          <h2>Join The IBCOCO Inner Circle</h2>
          <p>Be first to know about new drops, styling tips, and members-only pricing on premium hair.</p>
        </div>
        <form className="nform" onSubmit={submit}>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" />
          <button>Subscribe</button>
        </form>
      </div>
    </section>
  );
}
