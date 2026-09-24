import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/account', { replace: true });
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
          <span className="eyebrow">Join IBCOCO Quality Hairs</span>
          <h1>Create Your Account</h1>
          <label htmlFor="reg-name">Full name</label>
          <input id="reg-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="auth-hint">At least 8 characters.</p>
          {error && <div className="admin-error">{error}</div>}
          <button className="btn gold" type="submit" disabled={busy}>{busy ? 'Creating Account…' : 'Create Account'}</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </section>
  );
}
