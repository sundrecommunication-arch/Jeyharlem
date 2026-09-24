import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartDrawer() {
  const { cart, qty, total } = useCart();
  const { cartOpen, setCartOpen } = useUI();
  const setToast = useToast();
  const { user, token } = useAuth();
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const checkoutCustomer = user
    ? { name: user.name, email: user.email, phone: customer.phone }
    : { name: customer.name || 'Guest', email: customer.email, phone: customer.phone };

  const checkout = async () => {
    if (!checkoutCustomer.email) {
      setToast('Please add your email to checkout.');
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((x) => ({ productId: x.productId, variantId: x.variantId, qty: x.qty }));
      const r = await api('/api/checkout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ customer: checkoutCustomer, items })
      });
      if (r.url) {
        window.location.href = r.url;
      } else {
        setToast(r.message || 'Order received — our team will be in touch to arrange payment.');
        setCartOpen(false);
      }
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'drawer-wrap ' + (cartOpen ? 'show' : '')}>
      <div className="drawer-shade" onClick={() => setCartOpen(false)} />
      <aside className="drawer">
        <div className="drawer-head">
          <h3>Your Bag</h3>
          <button onClick={() => setCartOpen(false)}><X /></button>
        </div>
        {!cart.length ? (
          <p className="empty">Your bag is waiting for something beautiful.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((x, i) => (
                <div className="cart-item" key={x.cartKey}>
                  {x.image ? <img className="mini" src={x.image} alt={x.name} /> : <div className={'mini p' + (i % 4)} />}
                  <div>
                    <strong>{x.name}</strong>
                    {x.variantLabel && <span className="cart-variant">{x.variantLabel}</span>}
                    <span>{money(x.price)}</span>
                    <div className="qty">
                      <button onClick={() => qty(x.cartKey, -1)}><Minus /></button>
                      {x.qty}
                      <button onClick={() => qty(x.cartKey, 1)}><Plus /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout">
              <strong>Checkout</strong>
              {user ? (
                <p className="cart-account-note">Checking out as <strong>{user.name}</strong> ({user.email})</p>
              ) : (
                <input placeholder="Email — for your order confirmation" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              )}
              <div className="total">
                <span>Total</span>
                <b>{money(total)}</b>
              </div>
              <button className="btn gold" onClick={checkout} disabled={loading}>
                {loading ? 'Redirecting to Stripe…' : 'Pay Securely with Stripe'}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
