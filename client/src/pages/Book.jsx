import React from 'react';
import { BookingForm } from '../components/Booking.jsx';

export default function Book() {
  return (
    <section className="content-section" style={{ paddingTop: 60 }}>
      <div className="wrap">
        <div className="booking" style={{ position: 'static', margin: '0 auto' }}>
          <span className="eyebrow">London Atelier</span>
          <h2>Book Your Install</h2>
          <p>Request your preferred date and service below. Your appointment is confirmed by our team within 24 hours.</p>
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
