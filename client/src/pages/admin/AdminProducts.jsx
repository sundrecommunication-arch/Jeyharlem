import React, { useEffect, useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { money } from '../../lib/format.js';
import { categories, textures } from '../../data/content.js';
import ImageUploadField from '../../components/admin/ImageUploadField.jsx';
import VideoUploadField from '../../components/admin/VideoUploadField.jsx';

const BLANK = { name: '', price: '', oldPrice: '', badge: '', texture: 'straight', category: 'wigs', description: '', image: '', video: '', variants: [] };
const BLANK_VARIANT = () => ({ localId: Math.random().toString(36).slice(2), id: '', length: '', color: '', density: '', price: '', image: '' });

const LENGTH_PRESETS = ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'];
const COLOR_PRESETS = ['Natural Black', 'Dark Brown', 'Medium Brown', 'Honey Blonde', 'Platinum Blonde', 'Ombré', 'Burgundy', 'Ash Grey'];
const DENSITY_PRESETS = ['130%', '150%', '180%', '200%'];

function priceRangeText(p) {
  const prices = (p.variants || []).map((v) => v.price);
  if (!prices.length) return money(p.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  return min === max ? money(min) : `${money(min)} – ${money(max)}`;
}

function VariantImageCell({ value, onChange, adminUpload }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await adminUpload(file);
      onChange(url);
    } catch {
      // surfaced via the row staying unchanged — the main form's admin-error covers save-time issues
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="variant-img-cell">
      <input placeholder="optional" value={value} onChange={(e) => onChange(e.target.value)} />
      <input type="file" accept="image/*" ref={inputRef} onChange={handleFile} hidden />
      <button type="button" className="mini-upload-btn" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? '…' : 'Upload'}
      </button>
    </div>
  );
}

export default function AdminProducts() {
  const { adminApi, adminUpload } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null); // null = not editing, 'new' = creating, else product id
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = () =>
    adminApi('/api/admin/products/all')
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNew = () => {
    setForm(BLANK);
    setEditingId('new');
  };
  const startEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice ?? '',
      badge: p.badge || '',
      texture: p.texture,
      category: p.category,
      description: p.description || '',
      image: p.image || '',
      video: p.video || '',
      variants: (p.variants || []).map((v) => ({ localId: v.id, id: v.id, length: v.length || '', color: v.color || '', density: v.density || '', price: v.price, image: v.image || '' }))
    });
    setEditingId(p.id);
  };
  const cancel = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const addVariantRow = () => setForm({ ...form, variants: [...form.variants, BLANK_VARIANT()] });
  const updateVariantRow = (localId, field, value) =>
    setForm({ ...form, variants: form.variants.map((v) => (v.localId === localId ? { ...v, [field]: value } : v)) });
  const removeVariantRow = (localId) => setForm({ ...form, variants: form.variants.filter((v) => v.localId !== localId) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
      badge: form.badge.trim(),
      texture: form.texture,
      category: form.category,
      description: form.description.trim(),
      image: form.image.trim(),
      video: form.video.trim(),
      variants: form.variants
        .filter((v) => (v.length || v.color || v.density) && v.price !== '')
        .map((v) => ({ id: v.id || undefined, length: v.length.trim(), color: v.color.trim(), density: v.density.trim(), price: Number(v.price), image: v.image.trim() }))
    };
    try {
      if (editingId === 'new') {
        await adminApi('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await adminApi(`/api/admin/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      cancel();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    setError('');
    try {
      await adminApi(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1>Products</h1>
        {editingId === null && (
          <button className="btn gold" onClick={startNew}>+ Add Product</button>
        )}
      </div>
      {error && <div className="admin-error">{error}</div>}

      {editingId !== null && (
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>{editingId === 'new' ? 'New Product' : `Editing: ${form.name}`}</h2>
          <div className="admin-form-grid">
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Base Price (£)
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </label>
            <label>
              Was-price (£, optional)
              <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
            </label>
            <label>
              Badge (optional)
              <input placeholder="e.g. Bestseller, New In" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </label>
            <label>
              Texture
              <select value={form.texture} onChange={(e) => setForm({ ...form, texture: e.target.value })}>
                {Object.entries(textures).map(([key, t]) => (
                  <option key={key} value={key}>{t.title}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </label>
            <div className="admin-form-wide">
              <ImageUploadField
                label="Product Photo"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                hint="Upload a photo, or paste a hosted image link. Leave blank to keep the placeholder."
              />
            </div>
            <div className="admin-form-wide">
              <VideoUploadField
                label="Styling Video (optional)"
                value={form.video}
                onChange={(url) => setForm({ ...form, video: url })}
                hint="Shown under 'See It Styled' on the product page. Leave blank to keep the placeholder."
              />
            </div>
            <label className="admin-form-wide">
              Description
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>

          <div className="admin-variants">
            <div className="admin-header-row">
              <h3>Variants — length, colour &amp; density</h3>
              <button type="button" className="btn ghost small" onClick={addVariantRow}>+ Add Variant</button>
            </div>
            <p className="admin-hint">Leave this empty to sell the product at a single base price. Add a row per length/colour/density combination you stock — each can have its own price and photo. The base price above is only used when there are no variants.</p>
            {form.variants.length > 0 && (
              <div className="variant-rows">
                <div className="variant-row variant-row-head">
                  <span>Length</span>
                  <span>Colour</span>
                  <span>Density</span>
                  <span>Price (£)</span>
                  <span>Image URL</span>
                  <span></span>
                </div>
                {form.variants.map((v) => (
                  <div className="variant-row" key={v.localId}>
                    <input list="length-presets" placeholder="18&quot;" value={v.length} onChange={(e) => updateVariantRow(v.localId, 'length', e.target.value)} />
                    <input list="color-presets" placeholder="Natural Black" value={v.color} onChange={(e) => updateVariantRow(v.localId, 'color', e.target.value)} />
                    <input list="density-presets" placeholder="150%" value={v.density} onChange={(e) => updateVariantRow(v.localId, 'density', e.target.value)} />
                    <input type="number" min="0" step="0.01" required placeholder="285" value={v.price} onChange={(e) => updateVariantRow(v.localId, 'price', e.target.value)} />
                    <VariantImageCell value={v.image} onChange={(url) => updateVariantRow(v.localId, 'image', url)} adminUpload={adminUpload} />
                    <button type="button" className="btn ghost small danger" onClick={() => removeVariantRow(v.localId)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            <datalist id="length-presets">{LENGTH_PRESETS.map((l) => <option key={l} value={l} />)}</datalist>
            <datalist id="color-presets">{COLOR_PRESETS.map((c) => <option key={c} value={c} />)}</datalist>
            <datalist id="density-presets">{DENSITY_PRESETS.map((d) => <option key={d} value={d} />)}</datalist>
          </div>

          <div className="admin-form-actions">
            <button className="btn gold" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
            <button className="btn ghost" type="button" onClick={cancel}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading products…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Texture</th>
              <th>Price</th>
              <th>Variants</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.image ? <img className="admin-thumb" src={p.image} alt={p.name} /> : <span className="admin-thumb admin-thumb-empty">No photo</span>}</td>
                <td>{p.name}</td>
                <td>{categories.find((c) => c.key === p.category)?.label || p.category}</td>
                <td>{textures[p.texture]?.title || p.texture}</td>
                <td>{priceRangeText(p)}{p.oldPrice ? <span className="admin-was"> (was {money(p.oldPrice)})</span> : ''}</td>
                <td>{p.variants?.length ? `${p.variants.length} variants` : '—'}</td>
                <td className="admin-row-actions">
                  <button className="btn ghost small" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn ghost small danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7}>No products yet — add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
