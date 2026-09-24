import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminCustomers() {
  const { adminApi } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/customers/all')
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminApi]);

  return (
    <div>
      <h1>Customers</h1>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No registered accounts yet — customers can still check out as guests.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
