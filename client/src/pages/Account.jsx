import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { money } from '../lib/format.js';
import { ORDER_FLOW, ORDER_LABELS, orderStepIndex } from '../lib/orderStatus.js';

function OrderProgress({ status }) {
  if (status === 'cancelled') {
    return <div className="order-cancelled">Order cancelled</div>;
  }
  const current = orderStepIndex(status);
  return (
    <div className="order-steps">
      {ORDER_FLOW.map((step, i) => (
        <div key={step} className={`order-step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`}>
          <span className="order-step-dot" />
          <span className="order-step-label">{ORDER_LABELS[step]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, token, ready, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/account/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  if (ready && !user) return <Navigate to="/login" replace />;
  if (!user) return <div className="wrap pd"><p>Loading…</p></div>;

  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <div className="wrap">
        <div className="page-hero" style={{ padding: '0 0 40px' }}>
          <span className="eyebrow">My Account</span>
          <h1>Hi, {user.name.split(' ')[0]}</h1>
          <p>{user.email}</p>
        </div>
        <button className="btn ghost" onClick={logout} style={{ marginBottom: 30 }}>Log Out</button>
        <h3 style={{ marginBottom: 18 }}>Order History</h3>
        {loading ? (
          <p>Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p>No orders yet — once you check out, they'll show up here.</p>
        ) : (
          <div className="order-cards">
            {orders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-card-head">
                  <div>
                    <strong>{o.id}</strong>
                    <span className="admin-muted"> · {new Date(o.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="order-card-total">{money(o.total)}</div>
                </div>
                <p className="order-card-items">{o.items?.map((it) => `${it.qty}× ${it.name}`).join(', ')}</p>
                <OrderProgress status={o.status} />
                {o.statusHistory?.length > 0 && (
                  <details className="order-history">
                    <summary>Order timeline</summary>
                    <ul>
                      {[...o.statusHistory].reverse().map((h, i) => (
                        <li key={i}>
                          <strong>{ORDER_LABELS[h.status] || h.status}</strong> — {new Date(h.at).toLocaleString('en-GB')}
                          {h.note ? <span className="admin-muted"> · {h.note}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
