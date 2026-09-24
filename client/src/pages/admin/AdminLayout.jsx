import React from 'react';
import { NavLink, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext.jsx';

const NAV = [
  { to: '/admin/overview', label: 'Overview' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/newsletter', label: 'Newsletter' },
  { to: '/admin/settings', label: 'Settings' }
];

export function RequireAdmin() {
  const { authed } = useAdmin();
  const location = useLocation();
  if (!authed) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default function AdminLayout() {
  const { logout } = useAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Link to="/" className="admin-brand">IBCOCO Quality Hairs</Link>
        <span className="admin-nav-label">Admin</span>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-logout" onClick={logout}>Log Out</button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
