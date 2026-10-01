import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

function AppointmentActions({ appt, onUpdated }) {
  const { adminApi } = useAdmin();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  if (appt.status !== 'pending') {
    return <span className="admin-muted">{appt.email ? 'Client notified by email' : 'No email on file'}</span>;
  }

  const respond = async (status) => {
    setBusy(status);
    setErr('');
    try {
      const updated = await adminApi(`/api/admin/appointments/${appt.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      onUpdated(updated);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="admin-inline-form">
      <button className="btn gold" type="button" disabled={!!busy} onClick={() => respond('confirmed')}>{busy === 'confirmed' ? '…' : 'Accept'}</button>
      <button className="btn ghost" type="button" disabled={!!busy} onClick={() => respond('rejected')}>{busy === 'rejected' ? '…' : 'Reject'}</button>
      {!appt.email && <span className="admin-muted">No email on file</span>}
      {err && <span className="admin-inline-error">{err}</span>}
    </div>
  );
}

export default function AdminAppointments() {
  const { adminApi } = useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi('/api/admin/appointments')
      .then((d) => setRows([...d].reverse()))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminApi]);

  const handleUpdated = (updated) => {
    setRows((r) => r.map((a) => (a.id === updated.id ? updated : a)));
  };

  return (
    <div>
      <h1>Appointments</h1>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No appointment requests yet.</p>
      ) : (
        <div className="admin-table-wrap">
        <table className="admin-table mobile-cards">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Requested Date/Time</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Respond</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td data-label="Client">{a.name}<br /><span className="admin-muted">{a.email || 'no email'} · {a.phone}</span></td>
                <td data-label="Service">{a.service}</td>
                <td data-label="Requested">{a.date} at {a.time}</td>
                <td data-label="Notes">{a.notes || '—'}</td>
                <td data-label="Status"><span className={`admin-badge admin-badge-${a.status}`}>{a.status}</span></td>
                <td data-label="Respond"><AppointmentActions appt={a} onUpdated={handleUpdated} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
