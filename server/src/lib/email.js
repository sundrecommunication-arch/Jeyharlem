// Thin wrapper around the Resend HTTP API. Uses the platform `fetch` (Node 18+), so no extra
// dependency is needed. If RESEND_API_KEY isn't set yet, every call becomes a safe no-op that
// logs a warning instead of throwing — so the rest of the app works fully before email is configured.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'IBCOCO Quality Hairs <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }) {
  if (!to) return { sent: false, reason: 'no_recipient' };
  if (!RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}" to ${to}. Add RESEND_API_KEY to server/.env to enable real sending.`);
    return { sent: false, reason: 'not_configured' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html })
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[email] Resend API error ${res.status} sending "${subject}" to ${to}: ${body}`);
      return { sent: false, reason: 'api_error', status: res.status };
    }
    const data = await res.json();
    return { sent: true, id: data.id };
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err.message);
    return { sent: false, reason: 'network_error' };
  }
}

// Fire-and-forget helper for call sites that must not let an email failure break the HTTP response
// (e.g. a slow/broken email API should never stop an order or appointment from being saved).
export function sendEmailAsync(payload) {
  sendEmail(payload).catch((err) => console.error('[email] unexpected error:', err.message));
}
