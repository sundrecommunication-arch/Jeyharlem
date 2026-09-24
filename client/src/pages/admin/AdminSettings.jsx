import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import ImageUploadField from '../../components/admin/ImageUploadField.jsx';
import VideoUploadField from '../../components/admin/VideoUploadField.jsx';
import { categories } from '../../data/content.js';

const HERO_LABELS = ['Hero Slide 1 — "Pure Luxury"', 'Hero Slide 2 — "The Deep Curl Edit"', 'Hero Slide 3 — "Not Just Hair"'];
const SITE_IMAGE_FIELDS = [
  ['homeAtelier', 'Homepage — Atelier Photo (about teaser)'],
  ['contactAtelier', 'Contact Page — Studio / Atelier Photo'],
  ['aboutPortrait', 'About Page — Portrait Photo'],
  ['careGuideStyling', 'Hair Care Guide — "Styling Without Heat Damage" Photo'],
  ['careGuideStoring', 'Hair Care Guide — "Storing Your Hair Between Wears" Photo'],
];
const SITE_VIDEO_FIELDS = [
  ['aboutStudio', 'About Page — Studio / Unboxing Walkthrough Video'],
  ['careGuideWashing', 'Hair Care Guide — "Washing & Conditioning Your Wig" Video'],
];

export default function AdminSettings() {
  const { adminApi } = useAdmin();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);

  useEffect(() => {
    adminApi('/api/admin/settings/all').then(setSettings).catch((e) => setError(e.message));
  }, [adminApi]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await adminApi('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          bankTransfer: settings.bankTransfer,
          categoryImages: settings.categoryImages,
          heroImages: settings.heroImages,
          logo: settings.logo,
          siteImages: settings.siteImages,
          siteVideos: settings.siteVideos,
          ticker: settings.ticker
        })
      });
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const migrateImages = async () => {
    setMigrating(true);
    setMigrateResult(null);
    setError('');
    try {
      const result = await adminApi('/api/admin/migrate-images', { method: 'POST', body: JSON.stringify({}) });
      setMigrateResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-panel">
        <h2>Card & Wallet Payments</h2>
        <p>Card payments, Apple Pay, Google Pay, Klarna and other wallet or buy-now-pay-later methods run through Stripe Checkout automatically — Stripe decides what to show a customer based on what you've switched on in your Stripe account, their browser, and their location. To add or remove one of these, go to your <a href="https://dashboard.stripe.com/settings/payment_methods" target="_blank" rel="noreferrer">Stripe Dashboard → Settings → Payment methods</a>. No changes needed here.</p>
      </div>

      <div className="admin-panel">
        <h2>Move All Images Onto This Site</h2>
        <p>Right now some images (mainly product photos pulled from the old jeyharlem.com site) are still linked from elsewhere rather than stored here. Click below to download every external image this store currently uses — product photos, variant photos, category tiles, hero slides, logo — into this site's own storage, one time. Anything already uploaded here is left alone, so it's safe to run again later.</p>
        <button type="button" className="btn gold" onClick={migrateImages} disabled={migrating}>
          {migrating ? 'Downloading…' : 'Download All Images To This Site'}
        </button>
        {migrateResult && (
          <p className="admin-hint" style={{ marginTop: 12 }}>
            Downloaded {migrateResult.downloaded} image{migrateResult.downloaded === 1 ? '' : 's'}.
            {migrateResult.failed.length > 0 && ` ${migrateResult.failed.length} failed: ${migrateResult.failed.map((f) => f.label).join(', ')}.`}
          </p>
        )}
      </div>

      {!settings ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="admin-panel">
            <h2>Category Images</h2>
            <p>Set the photo shown for each category tile on the homepage and shop filters.</p>
            <div className="admin-cards">
              {categories.map((c) => (
                <ImageUploadField
                  key={c.key}
                  label={c.label}
                  value={settings.categoryImages?.[c.key] || ''}
                  onChange={(url) => setSettings({ ...settings, categoryImages: { ...settings.categoryImages, [c.key]: url } })}
                />
              ))}
            </div>
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Images'}</button>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Homepage Hero Slides</h2>
            <p>Replace any of the 3 rotating homepage banner photos.</p>
            <div className="admin-cards">
              {HERO_LABELS.map((label, i) => (
                <ImageUploadField
                  key={i}
                  label={label}
                  value={settings.heroImages?.[i] || ''}
                  onChange={(url) => {
                    const next = [...(settings.heroImages || ['', '', ''])];
                    next[i] = url;
                    setSettings({ ...settings, heroImages: next });
                  }}
                />
              ))}
            </div>
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Images'}</button>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Site Photos</h2>
            <p>Recommended size: 1200×1500px (portrait, 4:5) for each of these — they crop to fill their frame, so a taller image works better than a wide one.</p>
            <div className="admin-cards">
              {SITE_IMAGE_FIELDS.map(([key, label]) => (
                <ImageUploadField
                  key={key}
                  label={label}
                  value={settings.siteImages?.[key] || ''}
                  onChange={(url) => setSettings({ ...settings, siteImages: { ...settings.siteImages, [key]: url } })}
                />
              ))}
            </div>
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Images'}</button>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Scrolling Ticker Text</h2>
            <p>The scrolling strip at the top of every page. Add, edit or remove phrases — it loops through them in order.</p>
            <div className="ticker-editor">
              {(settings.ticker || []).map((t, i) => (
                <div key={i} className="ticker-editor-row">
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => {
                      const next = [...settings.ticker];
                      next[i] = e.target.value;
                      setSettings({ ...settings, ticker: next });
                    }}
                  />
                  <button
                    type="button"
                    className="btn ghost small danger"
                    onClick={() => setSettings({ ...settings, ticker: settings.ticker.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn ghost small"
              style={{ marginTop: 10 }}
              onClick={() => setSettings({ ...settings, ticker: [...(settings.ticker || []), ''] })}
            >
              + Add Phrase
            </button>
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Ticker Text'}</button>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Site Videos</h2>
            <p>Recommended: MP4 (H.264), under ~80MB, 16:9 landscape for the About page video and roughly square/portrait is fine for the Hair Care Guide clip since it sits in a photo-sized card.</p>
            <div className="admin-cards">
              {SITE_VIDEO_FIELDS.map(([key, label]) => (
                <VideoUploadField
                  key={key}
                  label={label}
                  value={settings.siteVideos?.[key] || ''}
                  onChange={(url) => setSettings({ ...settings, siteVideos: { ...settings.siteVideos, [key]: url } })}
                />
              ))}
            </div>
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Videos'}</button>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Logo</h2>
            <p>Upload a real logo file to replace the text wordmark in the header and footer. Leave blank to keep the text version.</p>
            <ImageUploadField value={settings.logo || ''} onChange={(url) => setSettings({ ...settings, logo: url })} />
            <div className="admin-form-actions">
              <button className="btn gold" type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Logo'}</button>
              {saved && <span className="admin-saved">Saved.</span>}
            </div>
          </div>
        </>
      )}

      {!settings ? null : (
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>Bank Transfer</h2>
          <p>Offer direct bank transfer as a manual payment option alongside Stripe. When enabled, your instructions below appear in the site footer and can be quoted to customers who ask.</p>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={settings.bankTransfer.enabled}
              onChange={(e) => setSettings({ ...settings, bankTransfer: { ...settings.bankTransfer, enabled: e.target.checked } })}
            />
            Accept bank transfer
          </label>
          <label className="admin-form-wide">
            Instructions shown to customers
            <textarea
              rows={4}
              placeholder="e.g. Account name, sort code, account number, and reference format to use."
              value={settings.bankTransfer.instructions}
              onChange={(e) => setSettings({ ...settings, bankTransfer: { ...settings.bankTransfer, instructions: e.target.value } })}
            />
          </label>
          <div className="admin-form-actions">
            <button className="btn gold" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            {saved && <span className="admin-saved">Saved.</span>}
          </div>
        </form>
      )}
    </div>
  );
}
