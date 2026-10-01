import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminNewsletter() {
  const { adminApi } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/newsletter')
      .then((d) => setRows([...d].reverse()))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminApi]);

  const exportCsv = () => {
    const csv = 'email,subscribed_at\n' + rows.map((r) => `${r.email},${r.createdAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1>Newsletter Subscribers</h1>
        {rows.length > 0 && <button className="btn ghost" onClick={exportCsv}>Export CSV</button>}
      </div>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No subscribers yet.</p>
      ) : (
        <div className="admin-table-wrap">
        <table className="admin-table mobile-cards">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Email">{r.email}</td>
                <td data-label="Subscribed">{new Date(r.createdAt).toLocaleString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
