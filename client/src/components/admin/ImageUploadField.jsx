import React, { useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

// Reusable "product photo / category tile / hero slide / logo" field used across the admin
// panel — shows the current image, a button that uploads a file straight to the server (no
// code changes needed to swap a picture), and a fallback text field for pasting a hosted URL.
export default function ImageUploadField({ label, value, onChange, hint }) {
  const { adminUpload } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const { url } = await adminUpload(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="img-upload">
      {label && <span className="img-upload-label">{label}</span>}
      <div className="img-upload-row">
        <div className="img-upload-preview">
          {value ? <img src={value} alt="" /> : <span>No image</span>}
        </div>
        <div className="img-upload-actions">
          <input type="file" accept="image/*" ref={inputRef} onChange={handleFile} hidden />
          <div className="img-upload-btns">
            <button type="button" className="btn ghost small" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}
            </button>
            {value && (
              <button type="button" className="btn ghost small danger" onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
          <input type="text" placeholder="or paste an image URL" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
      {hint && <p className="admin-hint">{hint}</p>}
      {error && <div className="admin-inline-error">{error}</div>}
    </div>
  );
}
