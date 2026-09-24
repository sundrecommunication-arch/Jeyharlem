// Branded HTML email templates. Kept as plain template-literal strings with inline styles only —
// email clients don't support external CSS or CSS variables, so brand colours are hardcoded here
// to match client/src/styles.css (--cream #FBEFE0, --black #15110D, --gold #C9982E,
// --golddeep #8C6B1F, --ivory #FFF9F1, --ink #5C5142).

function money(n) {
  return `£${Number(n || 0).toFixed(2)}`;
}

function wrap(bodyHtml) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#FBEFE0;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
      <div style="text-align:center;margin-bottom:26px;">
        <span style="font-size:22px;letter-spacing:3px;color:#15110D;font-weight:bold;">HAIR BY GIFTY</span>
        <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin-top:6px;">Essex Atelier</div>
      </div>
      <div style="background:#FFF9F1;border:1px solid rgba(21,17,13,.14);padding:36px 32px;">
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#8a7f6f;font-size:11px;margin-top:26px;letter-spacing:.04em;">
        IBCOCO Quality Hairs · Essex, UK<br />This is an automated message — please don't reply directly to this email.
      </p>
    </div>
  </body>
</html>`;
}

function button(label, note) {
  return `<div style="margin-top:24px;padding:16px 18px;background:#FBEFE0;border-left:3px solid #C9982E;font-size:13px;color:#5C5142;">${note}</div>${label ? '' : ''}`;
}

function itemsTable(items) {
  const rows = (items || [])
    .map(
      (it) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(21,17,13,.1);font-size:13px;color:#15110D;">${it.qty}× ${it.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(21,17,13,.1);font-size:13px;color:#5C5142;text-align:right;">${money(it.price * it.qty)}</td>
      </tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;margin:18px 0;">${rows}</table>`;
}

const ORDER_COPY = {
  pending: {
    subject: (order) => `We've received your order ${order.id}`,
    heading: "We've received your order",
    intro: "Thank you for shopping with IBCOCO Quality Hairs. Here's a summary of what you ordered — we'll email you again as soon as payment is confirmed."
  },
  confirmed: {
    subject: (order) => `Order ${order.id} confirmed`,
    heading: 'Your order is confirmed',
    intro: "Payment has been received and your order is confirmed. We're getting it ready for you."
  },
  processing: {
    subject: (order) => `Order ${order.id} is being prepared`,
    heading: 'Your order is being processed',
    intro: 'Our team is carefully preparing and quality-checking your hair before it ships.'
  },
  shipped: {
    subject: (order) => `Order ${order.id} has shipped`,
    heading: 'Your order is on its way',
    intro: "Your order has shipped. We'll let you know the moment it's marked as delivered."
  },
  delivered: {
    subject: (order) => `Order ${order.id} delivered`,
    heading: "You've received your order",
    intro: 'Your order has been marked as delivered. We hope you love it — thank you for choosing IBCOCO Quality Hairs.'
  },
  cancelled: {
    subject: (order) => `Order ${order.id} cancelled`,
    heading: 'Your order has been cancelled',
    intro: 'This order has been cancelled. If you were charged, any payment will be refunded — get in touch if you have questions.'
  }
};

export function orderStatusEmail(order, status, note) {
  const copy = ORDER_COPY[status] || ORDER_COPY.pending;
  const name = order.customer?.name ? order.customer.name.split(' ')[0] : 'there';
  const body = `
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin:0 0 10px;">Order ${order.id}</p>
    <h1 style="font-size:24px;color:#15110D;margin:0 0 16px;font-family:Georgia,serif;">${copy.heading}</h1>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;margin:0 0 6px;">Hi ${name},</p>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;">${copy.intro}</p>
    ${itemsTable(order.items)}
    <div style="display:flex;justify-content:space-between;padding-top:8px;font-size:16px;color:#15110D;font-weight:bold;">
      <span>Total</span><span>${money(order.total)}</span>
    </div>
    ${note ? button(null, note) : ''}
  `;
  return { to: order.customer?.email, subject: copy.subject(order), html: wrap(body) };
}

const APPT_COPY = {
  confirmed: {
    subject: (a) => `Your appointment is confirmed — ${a.date}`,
    heading: 'Your appointment is confirmed',
    intro: "We're looking forward to seeing you. Here are your appointment details:"
  },
  rejected: {
    subject: () => "About your appointment request",
    heading: 'About your appointment request',
    intro: "We're sorry — we're unable to confirm this slot. Please get in touch or request a different date and time, and we'll do our best to accommodate you."
  },
  cancelled: {
    subject: (a) => `Your appointment on ${a.date} has been cancelled`,
    heading: 'Your appointment has been cancelled',
    intro: 'This appointment has been cancelled. Please contact us if you would like to rebook.'
  }
};

export function appointmentStatusEmail(appt, status, note) {
  const copy = APPT_COPY[status] || APPT_COPY.confirmed;
  const name = appt.name ? appt.name.split(' ')[0] : 'there';
  const body = `
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin:0 0 10px;">Appointment Request</p>
    <h1 style="font-size:24px;color:#15110D;margin:0 0 16px;font-family:Georgia,serif;">${copy.heading}</h1>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;margin:0 0 6px;">Hi ${name},</p>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;">${copy.intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;color:#15110D;">
      <tr><td style="padding:6px 0;color:#8C6B1F;">Service</td><td style="padding:6px 0;text-align:right;">${appt.service}</td></tr>
      <tr><td style="padding:6px 0;color:#8C6B1F;">Date</td><td style="padding:6px 0;text-align:right;">${appt.date}</td></tr>
      <tr><td style="padding:6px 0;color:#8C6B1F;">Time</td><td style="padding:6px 0;text-align:right;">${appt.time}</td></tr>
    </table>
    ${note ? button(null, note) : ''}
  `;
  return { to: appt.email, subject: copy.subject(appt), html: wrap(body) };
}

export function appointmentReceivedEmail(appt) {
  const name = appt.name ? appt.name.split(' ')[0] : 'there';
  const body = `
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin:0 0 10px;">Appointment Request</p>
    <h1 style="font-size:24px;color:#15110D;margin:0 0 16px;font-family:Georgia,serif;">We've received your request</h1>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;margin:0 0 6px;">Hi ${name},</p>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;">Thanks for booking with IBCOCO Quality Hairs. We'll confirm your appointment shortly.</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;color:#15110D;">
      <tr><td style="padding:6px 0;color:#8C6B1F;">Service</td><td style="padding:6px 0;text-align:right;">${appt.service}</td></tr>
      <tr><td style="padding:6px 0;color:#8C6B1F;">Requested date</td><td style="padding:6px 0;text-align:right;">${appt.date}</td></tr>
      <tr><td style="padding:6px 0;color:#8C6B1F;">Requested time</td><td style="padding:6px 0;text-align:right;">${appt.time}</td></tr>
    </table>
  `;
  return { to: appt.email, subject: 'Appointment request received — IBCOCO Quality Hairs', html: wrap(body) };
}

export function newsletterThankYouEmail(email) {
  const body = `
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin:0 0 10px;">Welcome</p>
    <h1 style="font-size:24px;color:#15110D;margin:0 0 16px;font-family:Georgia,serif;">Welcome to the IBCOCO Inner Circle</h1>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;">Thank you for subscribing. You'll be the first to hear about new arrivals, restocks and exclusive offers from IBCOCO Quality Hairs.</p>
  `;
  return { to: email, subject: 'Welcome to the IBCOCO Inner Circle', html: wrap(body) };
}

export function contactReceivedEmail({ name, email, message }) {
  const first = name ? name.split(' ')[0] : 'there';
  const body = `
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8C6B1F;margin:0 0 10px;">Contact</p>
    <h1 style="font-size:24px;color:#15110D;margin:0 0 16px;font-family:Georgia,serif;">We've received your message</h1>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;margin:0 0 6px;">Hi ${first},</p>
    <p style="font-size:14px;color:#5C5142;line-height:1.6;">Thanks for reaching out to IBCOCO Quality Hairs. Our team will get back to you as soon as possible. For your records, here's what you sent us:</p>
    <div style="margin-top:16px;padding:16px 18px;background:#FBEFE0;border-left:3px solid #C9982E;font-size:13px;color:#5C5142;white-space:pre-wrap;">${String(message || '').replace(/</g, '&lt;')}</div>
  `;
  return { to: email, subject: 'We’ve received your message — IBCOCO Quality Hairs', html: wrap(body) };
}
