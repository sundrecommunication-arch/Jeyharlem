import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminLogin() {
  const { authed, login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (authed) return <Navigate to="/admin/overview" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(value.trim());
      const to = location.state?.from || '/admin/overview';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-auth">
      <form className="admin-auth-card" onSubmit={submit}>
        <span className="eyebrow">IBCOCO Quality Hairs</span>
        <h1>Admin Sign In</h1>
        <p>Enter the admin key set in your server's <code>.env</code> file (<code>ADMIN_KEY</code>).</p>
        <label htmlFor="admin-key">Admin key</label>
        <input
          id="admin-key"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          required
        />
        {error && <div className="admin-error">{error}</div>}
        <button className="btn gold" type="submit" disabled={busy || !value.trim()}>
          {busy ? 'Checking…' : 'Sign In'}
        </button>
      </form>
    </section>
  );
}
