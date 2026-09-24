import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminOverview() {
  const { adminApi } = useAdmin();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/summary').then(setSummary).catch((e) => setError(e.message));
  }, [adminApi]);

  return (
    <div>
      <h1>Overview</h1>
      {error && <div className="admin-error">{error}</div>}
      {!summary ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-stats">
          <div className="admin-stat"><span>{summary.products}</span>Products</div>
          <div className="admin-stat"><span>{summary.orders}</span>Orders</div>
          <div className="admin-stat"><span>{summary.customers}</span>Customer Accounts</div>
          <div className="admin-stat"><span>{summary.appointments}</span>Appointments</div>
          <div className="admin-stat"><span>{summary.messages}</span>Messages</div>
          <div className="admin-stat"><span>{summary.subscribers}</span>Newsletter Subscribers</div>
        </div>
      )}
      <div className="admin-panel">
        <h2>Getting started</h2>
        <ul>
          <li>Add or edit products in the <strong>Products</strong> tab — changes appear on the live site immediately. Add a row under a product's Variants section for each length, colour or density you stock, each with its own price.</li>
          <li>Shoppers can create an account to see their order history, or check out as a guest — either way every order lands in the <strong>Orders</strong> tab, and registered shoppers appear in <strong>Customers</strong>.</li>
          <li>Review new orders, appointment requests and contact messages as they come in from the tabs on the left. Moving an order through Pending → Confirmed → Processing → Shipped → Delivered, and accepting or rejecting an appointment, automatically emails the customer.</li>
          <li>Turn on Bank Transfer as a payment option, and manage which payment badges the footer shows, in <strong>Settings</strong>.</li>
          <li>Card, Apple Pay, Google Pay and any other wallet or buy-now-pay-later methods are managed in your <a href="https://dashboard.stripe.com/settings/payment_methods" target="_blank" rel="noreferrer">Stripe Dashboard</a> — Stripe automatically shows whichever are enabled there.</li>
        </ul>
      </div>
    </div>
  );
}
