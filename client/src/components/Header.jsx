import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, UserRound, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const navClass = ({ isActive }) => (isActive ? 'active' : '');

export default function Header() {
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { count } = useCart();
  const { setCartOpen, setBookOpen } = useUI();
  const { user } = useAuth();
  const { logo } = useSettings();
  const navigate = useNavigate();
  const closeMobile = () => setMobile(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
    setQ('');
  };

  return (
    <header>
      <div className="nav-row">
        <button className="mobile-menu" aria-label={mobile ? 'Close menu' : 'Open menu'} onClick={() => setMobile((m) => !m)}>
          {mobile ? <X /> : <Menu />}
        </button>
        <div className="nav-left">
          <nav className={mobile ? 'open' : ''}>
            <ul>
              <li><NavLink to="/shop" className={navClass} onClick={closeMobile}>Shop All</NavLink></li>
              <li><NavLink to="/shop?category=wigs" className={navClass} onClick={closeMobile}>Wigs</NavLink></li>
              <li><NavLink to="/shop?category=closures" className={navClass} onClick={closeMobile}>Lace Fronts</NavLink></li>
              <li><NavLink to="/shop?category=bundles" className={navClass} onClick={closeMobile}>Bundles</NavLink></li>
              <li><NavLink to="/shop?category=care" className={navClass} onClick={closeMobile}>Hair Products</NavLink></li>
            </ul>
          </nav>
        </div>
        <Link className="logo-mark" to="/">
          {logo ? <img src={logo} alt="IBCOCO Quality Hairs" /> : <span className="logo-word">IBCOCO<span className="logo-sub">Quality Hairs</span></span>}
        </Link>
        <div className="nav-right">
          <nav>
            <ul>
              <li><NavLink to="/about" className={navClass}>Our Story</NavLink></li>
              <li><NavLink to="/faqs" className={navClass}>FAQs</NavLink></li>
              <li><NavLink to="/contact" className={navClass}>Contact</NavLink></li>
            </ul>
          </nav>
          <div className="icons">
            <button title="Search" onClick={() => setSearchOpen((s) => !s)}><Search /></button>
            <Link title={user ? `Account (${user.name})` : 'Sign In'} to={user ? '/account' : '/login'}><UserRound /></Link>
            <button title="Bag" onClick={() => setCartOpen(true)} className="bag">
              <ShoppingBag />
              <span>{count}</span>
            </button>
          </div>
        </div>
      </div>
      {mobile && (
        <div className="mobile-nav">
          <nav>
            <ul>
              <li><NavLink to="/shop" className={navClass} onClick={closeMobile}>Shop All</NavLink></li>
              <li><NavLink to="/shop?category=wigs" className={navClass} onClick={closeMobile}>Wigs</NavLink></li>
              <li><NavLink to="/shop?category=closures" className={navClass} onClick={closeMobile}>Lace Fronts</NavLink></li>
              <li><NavLink to="/shop?category=bundles" className={navClass} onClick={closeMobile}>Bundles</NavLink></li>
              <li><NavLink to="/shop?category=care" className={navClass} onClick={closeMobile}>Hair Products</NavLink></li>
            </ul>
            <ul className="mobile-nav-secondary">
              <li><NavLink to="/about" className={navClass} onClick={closeMobile}>Our Story</NavLink></li>
              <li><NavLink to="/faqs" className={navClass} onClick={closeMobile}>FAQs</NavLink></li>
              <li><NavLink to="/contact" className={navClass} onClick={closeMobile}>Contact</NavLink></li>
            </ul>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="search-bar">
          <form onSubmit={submitSearch} className="wrap search-bar-form">
            <input autoFocus placeholder="Search wigs, bundles, closures…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="submit" className="btn gold">Search</button>
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}><X /></button>
          </form>
        </div>
      )}
    </header>
  );
}
