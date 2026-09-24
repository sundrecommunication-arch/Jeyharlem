import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminMessages() {
  const { adminApi } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/messages')
      .then((d) => setRows([...d].reverse()))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminApi]);

  return (
    <div>
      <h1>Contact Messages</h1>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="admin-cards">
          {rows.map((m) => (
            <div className="admin-panel" key={m.id}>
              <div className="admin-header-row">
                <strong>{m.name}</strong>
                <span className="admin-muted">{new Date(m.createdAt).toLocaleString('en-GB')}</span>
              </div>
              <p className="admin-muted">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
              <p>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
