import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // item must be a resolved cart line (see lib/variants.js#cartLineFor) — it carries its own
  // cartKey so the same product with two different variants stays as two separate lines.
  const add = (item, n = 1) =>
    setCart((c) => {
      const old = c.find((x) => x.cartKey === item.cartKey);
      return old
        ? c.map((x) => (x.cartKey === item.cartKey ? { ...x, qty: x.qty + n } : x))
        : [...c, { ...item, qty: n }];
    });

  const qty = (cartKey, n) =>
    setCart((c) => c.map((x) => (x.cartKey === cartKey ? { ...x, qty: Math.max(0, x.qty + n) } : x)).filter((x) => x.qty));

  const clear = () => setCart([]);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const count = cart.reduce((s, x) => s + x.qty, 0);

  return <CartContext.Provider value={{ cart, add, qty, clear, total, count }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
