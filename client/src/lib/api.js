export const api = (url, opt = {}) => {
  const { headers, ...rest } = opt;
  // headers must be merged AFTER spreading the rest of opt, otherwise a caller-supplied `headers`
  // (e.g. an Authorization bearer token) silently overwrites Content-Type instead of adding to it.
  return fetch(url, { ...rest, headers: { 'Content-Type': 'application/json', ...(headers || {}) } }).then(async (r) => {
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Something went wrong');
    return d;
  });
};
