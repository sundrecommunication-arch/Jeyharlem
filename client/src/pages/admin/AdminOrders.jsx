import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { money } from '../../lib/format.js';
import { ORDER_LABELS, nextAllowedOrderStatuses } from '../../lib/orderStatus.js';

function StatusUpdater({ order, onUpdated }) {
  const { adminApi } = useAdmin();
  const options = nextAllowedOrderStatuses(order.status);
  const [status, setStatus] = useState(options[0] || '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (options.length === 0) return <span className="admin-muted">No further updates</span>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const updated = await adminApi(`/api/admin/orders/${order.id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) });
      onUpdated(updated);
      setNote('');
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {options.map((s) => (
          <option key={s} value={s}>{ORDER_LABELS[s] || s}</option>
        ))}
      </select>
      <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="btn gold" type="submit" disabled={busy}>{busy ? '…' : 'Update'}</button>
      {err && <span className="admin-inline-error">{err}</span>}
    </form>
  );
}

export default function AdminOrders() {
  const { adminApi } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/orders')
      .then((d) => setOrders([...d].reverse()))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminApi]);

  const handleUpdated = (updated) => {
    setOrders((rows) => rows.map((o) => (o.id === updated.id ? updated : o)));
  };

  return (
    <div>
      <h1>Orders</h1>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer?.name}<br /><span className="admin-muted">{o.customer?.email}</span></td>
                <td>{o.items?.map((it) => `${it.qty}× ${it.name || it.productId}`).join(', ')}</td>
                <td>{money(o.total)}</td>
                <td><span className={`admin-badge admin-badge-${o.status}`}>{ORDER_LABELS[o.status] || o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleString('en-GB')}</td>
                <td><StatusUpdater order={o} onUpdated={handleUpdated} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
