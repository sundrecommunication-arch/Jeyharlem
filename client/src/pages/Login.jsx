import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="content-section" style={{ paddingTop: 70 }}>
      <div className="wrap auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">Welcome Back</span>
          <h1>Sign In</h1>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <div className="admin-error">{error}</div>}
          <button className="btn gold" type="submit" disabled={busy}>{busy ? 'Signing In…' : 'Sign In'}</button>
          <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
    </section>
  );
}
