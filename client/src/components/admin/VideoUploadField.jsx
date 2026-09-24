import React, { useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';

// Same pattern as ImageUploadField, for the handful of spots that take a real video
// (About page walkthrough, Hair Care Guide washing video, a product's styling video).
export default function VideoUploadField({ label, value, onChange, hint }) {
  const { adminUploadVideo } = useAdmin();
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
      const { url } = await adminUploadVideo(file);
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
          {value ? <video src={value} muted /> : <span>No video</span>}
        </div>
        <div className="img-upload-actions">
          <input type="file" accept="video/*" ref={inputRef} onChange={handleFile} hidden />
          <div className="img-upload-btns">
            <button type="button" className="btn ghost small" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : value ? 'Replace Video' : 'Upload Video'}
            </button>
            {value && (
              <button type="button" className="btn ghost small danger" onClick={() => onChange('')}>Remove</button>
            )}
          </div>
          <input type="text" placeholder="or paste a hosted video URL" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
      {hint && <p className="admin-hint">{hint}</p>}
      {error && <div className="admin-inline-error">{error}</div>}
    </div>
  );
}
