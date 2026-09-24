import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const ProductsContext = createContext({ products: [], loading: true });

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/products')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return <ProductsContext.Provider value={{ products, loading }}>{children}</ProductsContext.Provider>;
}

export const useProducts = () => useContext(ProductsContext);
