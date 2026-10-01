import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'hbg_admin_key';
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [key, setKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const login = useCallback(async (candidateKey) => {
    const res = await fetch('/api/admin/summary', { headers: { 'x-admin-key': candidateKey } });
    if (!res.ok) throw new Error('Incorrect admin key');
    try {
      localStorage.setItem(STORAGE_KEY, candidateKey);
    } catch {}
    setKey(candidateKey);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setKey('');
  }, []);

  const adminApi = useCallback(
    (url, opt = {}) =>
      fetch(url, {
        ...opt,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key, ...(opt.headers || {}) }
      }).then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) {
          logout();
          throw new Error('Your admin session expired — please log in again.');
        }
        if (!r.ok) throw new Error(d.error || 'Something went wrong');
        return d;
      }),
    [key, logout]
  );

  // Uploads a single image file to the server (multipart/form-data) and resolves to its new
  // local URL. Deliberately does NOT go through adminApi(), which always sets
  // Content-Type: application/json — that header must be left for the browser to set itself
  // (with the multipart boundary) when the body is a FormData.
  const adminUpload = useCallback(
    (file) => {
      const body = new FormData();
      body.append('image', file);
      return fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-key': key }, body }).then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) {
          logout();
          throw new Error('Your admin session expired — please log in again.');
        }
        if (!r.ok) throw new Error(d.error || 'Upload failed');
        return d;
      });
    },
    [key, logout]
  );

  // Same as adminUpload but for the video-only endpoint (larger size limit server-side).
  const adminUploadVideo = useCallback(
    (file) => {
      const body = new FormData();
      body.append('video', file);
      return fetch('/api/admin/upload-video', { method: 'POST', headers: { 'x-admin-key': key }, body }).then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) {
          logout();
          throw new Error('Your admin session expired — please log in again.');
        }
        if (!r.ok) throw new Error(d.error || 'Upload failed');
        return d;
      });
    },
    [key, logout]
  );

  // Downloads the bulk product-upload .xlsx template and saves it via the browser's normal
  // file-download flow. Not routed through adminApi() — the response body is a binary
  // spreadsheet, not JSON.
  const adminDownloadTemplate = useCallback(() => {
    return fetch('/api/admin/products/bulk-template', { headers: { 'x-admin-key': key } }).then(async (r) => {
      if (r.status === 401) {
        logout();
        throw new Error('Your admin session expired — please log in again.');
      }
      if (!r.ok) throw new Error('Could not download the template.');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ibcoco-product-upload-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }, [key, logout]);

  // Uploads a filled-in copy of that template; resolves to { created, updated, skipped }.
  const adminBulkUploadProducts = useCallback(
    (file) => {
      const body = new FormData();
      body.append('file', file);
      return fetch('/api/admin/products/bulk-upload', { method: 'POST', headers: { 'x-admin-key': key }, body }).then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.status === 401) {
          logout();
          throw new Error('Your admin session expired — please log in again.');
        }
        if (!r.ok) throw new Error(d.error || 'Upload failed');
        return d;
      });
    },
    [key, logout]
  );

  return (
    <AdminContext.Provider value={{ authed: !!key, login, logout, adminApi, adminUpload, adminUploadVideo, adminDownloadTemplate, adminBulkUploadProducts }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
