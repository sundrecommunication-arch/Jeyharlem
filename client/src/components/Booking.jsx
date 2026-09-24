import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useUI } from '../context/UIContext.jsx';

export function BookingForm({ onDone }) {
  const setToast = useToast();
  const [f, setF] = useState({ name: '', email: '', phone: '', date: '', time: '10:00', service: 'Luxury Wig Install', notes: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/appointments', { method: 'POST', body: JSON.stringify(f) });
      setToast('Appointment request received. Our team will confirm your slot.');
      onDone && onDone();
    } catch (err) {
      setToast(err.message);
    }
  };

  return (
    <form onSubmit={submit}>
      <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input required placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <label>
        <CalendarDays /> <input required type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
      </label>
      <input required type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
      <select value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>
        <option>Luxury Wig Install</option>
        <option>Frontal Install</option>
        <option>Custom Colour</option>
        <option>Wig Consultation</option>
      </select>
      <textarea placeholder="Anything we should know?" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      <button className="btn gold">Request Appointment</button>
    </form>
  );
}

export default function BookingModal() {
  const { bookOpen, setBookOpen } = useUI();
  if (!bookOpen) return null;
  return (
    <div className="modal">
      <div className="modal-shade" onClick={() => setBookOpen(false)} />
      <div className="booking">
        <button className="close" onClick={() => setBookOpen(false)}><X /></button>
        <span className="eyebrow">London Atelier</span>
        <h2>Book Your Install</h2>
        <p>Request your preferred date and service. Your appointment is confirmed by our team.</p>
        <BookingForm onDone={() => setBookOpen(false)} />
      </div>
    </div>
  );
}
