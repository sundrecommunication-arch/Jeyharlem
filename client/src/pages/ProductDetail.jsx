import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money } from '../lib/format.js';
import { ImagePlaceholder, VideoPlaceholder, ProductImage } from '../components/Placeholder.jsx';
import { textures as textureData } from '../data/content.js';
import { hasVariants, priceRange, defaultVariant, variantDimensions, findVariant, cartLineFor } from '../lib/variants.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { add } = useCart();
  const setToast = useToast();
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState({ length: '', color: '', density: '' });

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!product) return;
    const dv = defaultVariant(product);
    setSel({ length: dv?.length || '', color: dv?.color || '', density: dv?.density || '' });
    setQty(1);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !product) return <Navigate to="/shop" replace />;
  if (!product) return <div className="wrap pd"><p>Loading…</p></div>;

  const dims = variantDimensions(product);
  const selectedVariant = hasVariants(product) ? findVariant(product, sel) || defaultVariant(product) : null;
  const displayPrice = selectedVariant ? selectedVariant.price : priceRange(product).min;
  const displayOldPrice = selectedVariant ? null : product.oldPrice;

  const addToBag = () => {
    add(cartLineFor(product, selectedVariant, qty));
    const label = selectedVariant ? ` (${[selectedVariant.length, selectedVariant.color, selectedVariant.density].filter(Boolean).join(' / ')})` : '';
    setToast(`${product.name}${label} added to your bag`);
  };

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <section className="pd">
      <div className="wrap pd-grid">
        <div>
          <ProductImage
            product={selectedVariant?.image ? { ...product, image: selectedVariant.image } : product}
            className="pd-gallery-main"
            label={`${product.name} — main photo`}
          />
          <div className="pd-thumbs">
            {[1, 2, 3, 4].map((n) => (
              <ImagePlaceholder key={n} label={`${product.name} — angle ${n}`} />
            ))}
          </div>
        </div>
        <div className="pd-info">
          <span className="eyebrow">{product.badge}</span>
          <h1>{product.name}</h1>
          <div className="prod-stars">★★★★★</div>
          <div className="pd-price">
            {displayOldPrice && <span className="was">{money(displayOldPrice)}</span>}
            {money(displayPrice)}
          </div>
          <p className="pd-desc">
            {product.description} {textureData[product.texture] ? textureData[product.texture].text : ''}
          </p>
          {hasVariants(product) && (
            <div className="pd-options">
              {dims.lengths.length > 0 && (
                <div>
                  <label>Length</label>
                  <select value={sel.length} onChange={(e) => setSel({ ...sel, length: e.target.value })}>
                    {dims.lengths.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}
              {dims.colors.length > 0 && (
                <div>
                  <label>Colour</label>
                  <select value={sel.color} onChange={(e) => setSel({ ...sel, color: e.target.value })}>
                    {dims.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {dims.densities.length > 0 && (
                <div>
                  <label>Density</label>
                  <select value={sel.density} onChange={(e) => setSel({ ...sel, density: e.target.value })}>
                    {dims.densities.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
          <div className="pd-qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus /></button>
            {qty}
            <button onClick={() => setQty((q) => q + 1)}><Plus /></button>
          </div>
          <button className="btn gold" onClick={addToBag}>Add to Bag</button>
          <div className="pd-video">
            <h3>See It Styled</h3>
            <VideoPlaceholder label={`${product.name} — styling video`} src={product.video} />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="wrap pd-related">
          <h3>You May Also Like</h3>
          <div className="shop-grid">
            {related.map((p, i) => {
              const range = priceRange(p);
              return (
                <article className="prod-card" key={p.id}>
                  <Link to={`/product/${p.id}`} className={'prod-thumb p' + (i % 4)}>
                    <ProductImage product={p} className="bg" />
                  </Link>
                  <div className="prod-info">
                    <Link to={`/product/${p.id}`}><h4>{p.name}</h4></Link>
                    <div className="prod-price">{range.min !== range.max ? `From ${money(range.min)}` : money(range.min)}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
