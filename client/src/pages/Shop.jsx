import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../lib/format.js';
import { ProductImage } from '../components/Placeholder.jsx';
import { categories } from '../data/content.js';
import { priceRange, defaultVariant, cartLineFor } from '../lib/variants.js';

export default function Shop() {
  const { products, loading } = useProducts();
  const { add } = useCart();
  const setToast = useToast();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const texture = params.get('texture') || 'all';
  const length = params.get('length') || 'all';
  const color = params.get('color') || 'all';
  const sort = params.get('sort') || '';
  const q = params.get('q') || '';

  const { lengths, colors } = useMemo(() => {
    const l = new Set();
    const c = new Set();
    products.forEach((p) => (p.variants || []).forEach((v) => {
      if (v.length) l.add(v.length);
      if (v.color) c.add(v.color);
    }));
    return { lengths: [...l], colors: [...c] };
  }, [products]);

  const activeCategory = categories.find((c) => c.key === category);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== 'all') {
        if (activeCategory?.filter === 'tag') {
          if (!(p.tags || []).includes(category)) return false;
        } else if (p.category !== category) {
          return false;
        }
      }
      return texture === 'all' || p.texture === texture;
    });
    if (length !== 'all') list = list.filter((p) => (p.variants || []).some((v) => v.length === length));
    if (color !== 'all') list = list.filter((p) => (p.variants || []).some((v) => v.color === color));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) => `${p.name} ${p.description} ${p.category} ${p.texture}`.toLowerCase().includes(needle));
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => priceRange(a).min - priceRange(b).min);
    if (sort === 'price-desc') list = [...list].sort((a, b) => priceRange(b).min - priceRange(a).min);
    return list;
  }, [products, category, texture, length, color, q, sort, activeCategory]);

  const setParam = (key, value) => {
    const n = new URLSearchParams(params);
    if (value === 'all' || !value) n.delete(key);
    else n.set(key, value);
    setParams(n);
  };

  const addToBag = (p) => {
    const variant = defaultVariant(p);
    add(cartLineFor(p, variant));
    setToast(variant ? `${p.name} (${variant.length || ''} ${variant.color || ''}) added to your bag`.replace(/\s+/g, ' ') : `${p.name} added to your bag`);
  };

  return (
    <section className="section pd">
      <div className="wrap">
        <div className="page-hero" style={{ padding: '0 0 40px' }}>
          <span className="eyebrow">The Full Edit</span>
          <h1>Shop All</h1>
          {q && <p>Showing results for "{q}"</p>}
        </div>
        <div className="shop-toolbar">
          <div className="shop-filters">
            <button className={category === 'all' ? 'active' : ''} onClick={() => setParam('category', 'all')}>All</button>
            {categories.map((c) => (
              <button key={c.key} className={category === c.key ? 'active' : ''} onClick={() => setParam('category', c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="shop-select-filters">
            {lengths.length > 0 && (
              <select value={length} onChange={(e) => setParam('length', e.target.value)}>
                <option value="all">Any Length</option>
                {lengths.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            )}
            {colors.length > 0 && (
              <select value={color} onChange={(e) => setParam('color', e.target.value)}>
                <option value="all">Any Colour</option>
                {colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              <option value="">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        {loading ? (
          <p>Loading the edit…</p>
        ) : filtered.length === 0 ? (
          <div className="shop-empty">No products match this filter yet — check back soon.</div>
        ) : (
          <div className="shop-grid">
            {filtered.map((p, i) => {
              const range = priceRange(p);
              return (
                <article className="prod-card" key={p.id}>
                  <Link to={`/product/${p.id}`} className={'prod-thumb p' + (i % 4)}>
                    <ProductImage product={p} className="bg" />
                    <span className="prod-badge">{p.badge}</span>
                  </Link>
                  <div className="prod-info">
                    <Link to={`/product/${p.id}`}><h4>{p.name}</h4></Link>
                    <div className="prod-stars">★★★★★</div>
                    <div className="prod-price">
                      {p.oldPrice && <span className="was">{money(p.oldPrice)}</span>}
                      {range.min !== range.max ? `From ${money(range.min)}` : money(range.min)}
                    </div>
                    <button className="quick quick-static" onClick={() => addToBag(p)}>Add to Bag</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
