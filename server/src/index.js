import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import XLSX from 'xlsx';
import { mkdirSync } from 'fs';
import { sendEmail, sendEmailAsync } from './lib/email.js';
import { orderStatusEmail, appointmentStatusEmail, appointmentReceivedEmail, newsletterThankYouEmail, contactReceivedEmail } from './lib/emailTemplates.js';
import * as pgDb from './lib/db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = path.join(__dirname, '../data/db.json');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Uploaded/downloaded images (product photos, category tiles, hero slides, logo) are stored as
// real files on disk here and served at /uploads/<filename> — this is what makes them
// self-hosted instead of hotlinked from somewhere else. On Hostinger (or any host), make sure
// this folder survives redeploys, since it's not part of the built client/server code.
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
mkdirSync(UPLOADS_DIR, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname || '').toLowerCase() || '.jpg').slice(0, 6);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(/^image\//.test(file.mimetype) ? null : new Error('Only image files are allowed'), /^image\//.test(file.mimetype))
});
// Videos (About page studio walkthrough, Hair Care Guide washing video, per-product styling
// videos) get their own multer instance — same local-disk storage, but a video mimetype
// filter and a bigger size cap, since these files run much larger than photos.
const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname || '').toLowerCase() || '.mp4').slice(0, 6);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
  }),
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(/^video\//.test(file.mimetype) ? null : new Error('Only video files are allowed'), /^video\//.test(file.mimetype))
});
// Bulk product upload (.xlsx template) — kept in memory, not written to disk, since it's parsed
// once and discarded. 5MB is generous for a product spreadsheet (even a few thousand rows).
const uploadSheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname || '');
    cb(ok ? null : new Error('Please upload the .xlsx template file'), ok);
  }
});
function isExternalUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}
// Downloads one external image URL into UPLOADS_DIR and returns its new local /uploads/... path.
async function downloadImageToUploads(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = (r.headers.get('content-type') || '').split(';')[0];
  const extByType = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
  let ext = extByType[ct];
  if (!ext) { try { ext = path.extname(new URL(url).pathname) || '.jpg'; } catch { ext = '.jpg'; } }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buf);
  return `/uploads/${filename}`;
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('[ibcoco] JWT_SECRET is not set in .env — using an insecure development default. Set a real JWT_SECRET before going live.');

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use('/uploads', express.static(UPLOADS_DIR));

// Seed data used only the very first time the server runs against an empty db.json.
const SEED_PRODUCTS = [
  {
    id: 'adaeze-bob', name: 'The Adaeze Bob Wig', price: 245, oldPrice: null, badge: 'Bestseller', texture: 'straight', category: 'wigs', rating: 5,
    description: 'A polished luxury bob with a sleek finish and natural movement.', image: '',
    variants: [
      { id: 'v1', length: '14"', color: 'Natural Black', density: '150%', price: 245, image: '' },
      { id: 'v2', length: '18"', color: 'Natural Black', density: '150%', price: 285, image: '' },
      { id: 'v3', length: '18"', color: 'Honey Blonde', density: '150%', price: 305, image: '' },
      { id: 'v4', length: '22"', color: 'Natural Black', density: '180%', price: 340, image: '' }
    ]
  },
  { id: 'straight-bundle', name: 'Straight Bundle Deal (3pc)', price: 135, oldPrice: 160, badge: 'New In', texture: 'straight', category: 'bundles', rating: 5, description: 'Three-piece straight bundle set selected for density and longevity.', image: '', variants: [] },
  { id: 'hd-frontal', name: 'HD Lace Frontal 13x4', price: 95, oldPrice: null, badge: 'Limited', texture: 'straight', category: 'closures', rating: 5, description: 'Fine HD lace frontal for a seamless, natural-looking finish.', image: '', variants: [] },
  {
    id: 'deep-curl-wig', name: 'Deep Curl Closure Wig', price: 225, oldPrice: null, badge: "Editor's Pick", texture: 'curly', category: 'wigs', rating: 5,
    description: 'Full defined curls with soft bounce and volume.', image: '',
    variants: [
      { id: 'v1', length: '16"', color: 'Natural Black', density: '', price: 225, image: '' },
      { id: 'v2', length: '20"', color: 'Natural Black', density: '', price: 265, image: '' },
      { id: 'v3', length: '20"', color: 'Dark Brown', density: '', price: 265, image: '' }
    ]
  }
];
const DEFAULT_TICKER = ['Worldwide Shipping', '100% Raw Human Hair', 'Book Your Luxury Install', 'London Atelier'];
const DEFAULT_SETTINGS = { bankTransfer: { enabled: false, instructions: '' }, categoryImages: {}, heroImages: ['', '', ''], logo: '', siteImages: {}, siteVideos: {}, ticker: DEFAULT_TICKER };
const DEFAULT_DB = { products: [], newsletter: [], appointments: [], orders: [], messages: [], settings: DEFAULT_SETTINGS, users: [] };

// Backfills any fields old records might be missing, and seeds the product catalogue the
// very first time this runs against an empty store — shared by both the Postgres path and
// the legacy JSON-file fallback below.
function normalize(db) {
  if (!Array.isArray(db.products) || db.products.length === 0) db.products = SEED_PRODUCTS;
  db.products.forEach((p) => { if (!Array.isArray(p.variants)) p.variants = []; });
  if (!db.settings) db.settings = DEFAULT_SETTINGS;
  if (!db.settings.bankTransfer) db.settings.bankTransfer = DEFAULT_SETTINGS.bankTransfer;
  if (!db.settings.categoryImages || typeof db.settings.categoryImages !== 'object') db.settings.categoryImages = {};
  if (!Array.isArray(db.settings.heroImages)) db.settings.heroImages = ['', '', ''];
  if (typeof db.settings.logo !== 'string') db.settings.logo = '';
  if (!db.settings.siteImages || typeof db.settings.siteImages !== 'object') db.settings.siteImages = {};
  if (!db.settings.siteVideos || typeof db.settings.siteVideos !== 'object') db.settings.siteVideos = {};
  if (!Array.isArray(db.settings.ticker) || !db.settings.ticker.length) db.settings.ticker = DEFAULT_TICKER;
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.orders)) db.orders = [];
  db.orders.forEach((o) => { if (!Array.isArray(o.statusHistory)) o.statusHistory = []; });
  return db;
}

// Real persistence: when DATABASE_URL is set, every read/write goes through Postgres
// (see src/lib/db.js) instead of the JSON file — safe under concurrent requests, and the
// first read automatically imports whatever was already in server/data/db.json.
// Without DATABASE_URL, the app keeps working exactly as before against the JSON file, so
// this is an opt-in upgrade: set DATABASE_URL in server/.env whenever Postgres is ready.
async function read() {
  if (pgDb.isConfigured()) return normalize(await pgDb.read());
  try {
    return normalize(JSON.parse(await fs.readFile(DB, 'utf8')));
  } catch {
    return normalize({ ...DEFAULT_DB });
  }
}
async function write(db) {
  if (pgDb.isConfigured()) return pgDb.write(db);
  await fs.writeFile(DB, JSON.stringify(db, null, 2));
}
function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
// Keep these in sync with client/src/data/content.js — categories (filter: 'category') and
// textures. Used to validate rows in the bulk product upload sheet.
const VALID_CATEGORIES = ['wigs', 'closures', 'bundles', 'care'];
const VALID_TEXTURES = ['straight', 'wavy', 'curly'];
function admin(req, res, next) {
  if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired — please sign in again.' });
  }
}
function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore — checkout still proceeds as a guest
    }
  }
  next();
}
function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
}
function variantLabel(v) {
  return [v.length, v.color, v.density].filter(Boolean).join(' / ');
}

// Order status lifecycle. Moves are forward-only along this list (you can't un-ship an order),
// plus 'cancelled' is reachable from any non-terminal state. 'delivered' and 'cancelled' are terminal.
const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
function nextAllowedOrderStatuses(current) {
  if (current === 'delivered' || current === 'cancelled') return [];
  const idx = ORDER_FLOW.indexOf(current);
  const forward = idx === -1 ? [] : ORDER_FLOW.slice(idx + 1);
  return [...forward, 'cancelled'];
}
function pushOrderHistory(order, status, note) {
  order.status = status;
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({ status, note: note || '', at: new Date().toISOString() });
}

// Stripe requires the raw request body to verify webhook signatures, so this route is registered before the JSON body parser below.
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Stripe is not configured');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const db = await read();
    const order = db.orders.find((o) => o.id === orderId);
    if (order) {
      pushOrderHistory(order, 'confirmed', 'Payment received via Stripe.');
      order.stripePaymentIntent = session.payment_intent;
      order.paidAt = new Date().toISOString();
      await write(db);
      sendEmailAsync(orderStatusEmail(order, 'confirmed', 'Payment received via Stripe.'));
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'IBCOCO Quality Hairs API' }));

app.get('/api/products', async (req, res) => {
  const db = await read();
  res.json(db.products);
});

// Public, safe-to-expose subset of settings — used by the storefront (footer badges, checkout notes).
app.get('/api/settings', async (req, res) => {
  const db = await read();
  res.json({ bankTransfer: db.settings.bankTransfer, categoryImages: db.settings.categoryImages, heroImages: db.settings.heroImages, logo: db.settings.logo, siteImages: db.settings.siteImages, siteVideos: db.settings.siteVideos, ticker: db.settings.ticker });
});

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
  const db = await read();
  if (db.newsletter.some((x) => x.email.toLowerCase() === email.toLowerCase())) return res.json({ message: 'Already subscribed' });
  db.newsletter.push({ id: id(), email, createdAt: new Date().toISOString() });
  await write(db);
  sendEmailAsync(newsletterThankYouEmail(email));
  res.status(201).json({ message: 'Welcome to the IBCOCO Inner Circle.' });
});

app.post('/api/appointments', async (req, res) => {
  const { name, email, phone, date, time, service, notes } = req.body || {};
  if (!name || !phone || !date || !time || !service) return res.status(400).json({ error: 'Name, phone, date, time and service are required' });
  const db = await read();
  const conflict = db.appointments.some((a) => a.date === date && a.time === time && a.status !== 'cancelled');
  if (conflict) return res.status(409).json({ error: 'That appointment slot is already requested.' });
  const item = { id: id(), name, email, phone, date, time, service, notes: notes || '', status: 'pending', createdAt: new Date().toISOString() };
  db.appointments.push(item);
  await write(db);
  if (item.email) sendEmailAsync(appointmentReceivedEmail(item));
  res.status(201).json({ message: 'Appointment request received.', appointment: item });
});

// Admin accepts or rejects an appointment request; the client gets an email when one is on file.
app.put('/api/admin/appointments/:id/status', admin, async (req, res) => {
  const { status, note } = req.body || {};
  if (!['confirmed', 'rejected', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Status must be confirmed, rejected or cancelled.' });
  const db = await read();
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  appt.status = status;
  appt.note = note || '';
  appt.respondedAt = new Date().toISOString();
  await write(db);
  if (appt.email) sendEmailAsync(appointmentStatusEmail(appt, status, note));
  res.json(appt);
});

// ---- Customer auth ----
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and a password of at least 8 characters are required.' });
  const db = await read();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'An account with that email already exists — try signing in instead.' });
  const user = { id: id(), name, email, passwordHash: await bcrypt.hash(password, 10), createdAt: new Date().toISOString() };
  db.users.push(user);
  await write(db);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const db = await read();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json({ token: signToken(user), user: publicUser(user) });
});
app.get('/api/auth/me', auth, async (req, res) => {
  const db = await read();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });
  res.json(publicUser(user));
});
app.get('/api/account/orders', auth, async (req, res) => {
  const db = await read();
  const orders = db.orders.filter((o) => o.userId === req.user.id || o.customer?.email?.toLowerCase() === req.user.email.toLowerCase());
  res.json([...orders].reverse());
});

app.post('/api/checkout', authOptional, async (req, res) => {
  let { customer, items } = req.body || {};
  if (!customer?.email || !Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Email and cart items are required' });
  customer = { ...customer, name: customer.name || 'Guest' };
  const db = await read();
  const lineItems = [];
  const resolvedItems = [];
  let total = 0;
  for (const it of items) {
    const product = db.products.find((p) => p.id === it.productId);
    if (!product) return res.status(400).json({ error: `Unknown product: ${it.productId}` });
    let unitPrice = product.price;
    let label = product.name;
    if (it.variantId) {
      const variant = product.variants.find((v) => v.id === it.variantId);
      if (!variant) return res.status(400).json({ error: `Unknown variant for ${product.name}` });
      unitPrice = variant.price;
      label = `${product.name} — ${variantLabel(variant)}`;
    }
    const q = Math.max(1, Number(it.qty) || 1);
    total += unitPrice * q;
    lineItems.push({ price_data: { currency: 'gbp', unit_amount: Math.round(unitPrice * 100), product_data: { name: label } }, quantity: q });
    resolvedItems.push({ productId: product.id, variantId: it.variantId || null, name: label, price: unitPrice, qty: q });
  }
  const order = { id: 'HBG-' + Date.now().toString().slice(-8), userId: req.user?.id || null, customer, items: resolvedItems, total, paymentMethod: 'stripe', status: 'pending', statusHistory: [], createdAt: new Date().toISOString() };
  pushOrderHistory(order, 'pending', 'Order placed.');
  db.orders.push(order);
  await write(db);
  sendEmailAsync(orderStatusEmail(order, 'pending', ''));
  if (!stripe) return res.status(503).json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to server/.env to enable checkout.', order });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Automatic payment methods lets Stripe decide what to show (cards, Apple Pay, Google Pay, and any
      // wallet/BNPL method enabled in the Stripe Dashboard under Settings > Payment methods) based on the
      // customer's browser, currency and location, instead of a fixed list hardcoded here.
      automatic_payment_methods: { enabled: true },
      customer_email: customer.email,
      // Phone is no longer collected on-site (one email field is all the cart form asks for) —
      // Stripe collects it on its own hosted page instead, so IBCOCO still gets a number for
      // WhatsApp follow-up without adding a second field to the on-site form.
      phone_number_collection: { enabled: true },
      line_items: lineItems,
      success_url: `${CLIENT_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/?checkout=cancel`,
      metadata: { orderId: order.id }
    });
    order.stripeSessionId = session.id;
    await write(db);
    res.status(201).json({ message: 'Checkout session created.', url: session.url, order });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required' });
  const db = await read();
  db.messages.push({ id: id(), name, email, phone: phone || '', message, status: 'new', createdAt: new Date().toISOString() });
  await write(db);
  sendEmailAsync(contactReceivedEmail({ name, email, message }));
  res.status(201).json({ message: 'Message received. Our team will get back to you.' });
});

// ---- Admin: dashboard summary + read-only lists ----
app.get('/api/admin/summary', admin, async (req, res) => {
  const db = await read();
  res.json({ products: db.products.length, subscribers: db.newsletter.length, appointments: db.appointments.length, orders: db.orders.length, messages: db.messages.length, customers: db.users.length });
});
app.get('/api/admin/:type', admin, async (req, res) => {
  const allowed = ['newsletter', 'appointments', 'orders', 'messages'];
  if (!allowed.includes(req.params.type)) return res.status(404).json({ error: 'Not found' });
  const db = await read();
  res.json(db[req.params.type]);
});
app.get('/api/admin/customers/all', admin, async (req, res) => {
  const db = await read();
  res.json([...db.users].reverse().map(publicUser));
});

// Admin moves an order forward through its lifecycle (or cancels it); the customer gets an email
// at every transition. nextAllowedOrderStatuses() enforces forward-only movement.
app.put('/api/admin/orders/:id/status', admin, async (req, res) => {
  const { status, note } = req.body || {};
  const db = await read();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const allowed = nextAllowedOrderStatuses(order.status);
  if (!allowed.includes(status)) return res.status(400).json({ error: `Cannot move an order from "${order.status}" to "${status}".` });
  pushOrderHistory(order, status, note);
  await write(db);
  sendEmailAsync(orderStatusEmail(order, status, note));
  res.json(order);
});

// ---- Admin: product management (with variants) ----
app.get('/api/admin/products/all', admin, async (req, res) => {
  const db = await read();
  res.json(db.products);
});
function sanitizeVariants(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => v && (v.length || v.color || v.density) && v.price !== undefined && v.price !== '')
    .map((v) => ({
      id: v.id && String(v.id).trim() ? String(v.id).trim() : id(),
      length: (v.length || '').trim(),
      color: (v.color || '').trim(),
      density: (v.density || '').trim(),
      price: Number(v.price),
      image: (v.image || '').trim()
    }));
}
app.post('/api/admin/products', admin, async (req, res) => {
  const { name, price, oldPrice, badge, texture, category, description, image, video, variants } = req.body || {};
  if (!name || price === undefined || price === null || !texture || !category) return res.status(400).json({ error: 'Name, price, texture and category are required' });
  const db = await read();
  let base = slugify(name) || 'product';
  let slug = base;
  let n = 2;
  while (db.products.some((p) => p.id === slug)) slug = `${base}-${n++}`;
  const product = {
    id: slug,
    name,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    badge: badge || '',
    texture,
    category,
    rating: 5,
    description: description || '',
    image: image || '',
    video: video || '',
    variants: sanitizeVariants(variants)
  };
  db.products.push(product);
  await write(db);
  res.status(201).json(product);
});
app.put('/api/admin/products/:id', admin, async (req, res) => {
  const db = await read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { name, price, oldPrice, badge, texture, category, description, image, video, variants } = req.body || {};
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (oldPrice !== undefined) product.oldPrice = oldPrice ? Number(oldPrice) : null;
  if (badge !== undefined) product.badge = badge;
  if (texture !== undefined) product.texture = texture;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (image !== undefined) product.image = image;
  if (video !== undefined) product.video = video;
  if (variants !== undefined) product.variants = sanitizeVariants(variants);
  await write(db);
  res.json(product);
});
app.delete('/api/admin/products/:id', admin, async (req, res) => {
  const db = await read();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  db.products.splice(idx, 1);
  await write(db);
  res.json({ message: 'Product deleted' });
});

// ---- Admin: bulk product upload (.xlsx) ----
// Downloads a ready-to-fill .xlsx template matching the columns the bulk-upload route below
// expects, plus an Instructions sheet. Generated on the fly so it can never drift from the
// columns actually read by POST /api/admin/products/bulk-upload.
app.get('/api/admin/products/bulk-template', admin, (req, res) => {
  const header = ['id', 'name', 'price', 'oldPrice', 'badge', 'texture', 'category', 'description', 'image', 'tags'];
  const example = ['', 'The Adaeze Bob Wig', 245, '', 'Bestseller', 'straight', 'wigs', 'A polished luxury bob with a sleek finish and natural movement.', 'https://example.com/photo.jpg', 'new,bestseller'];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, example]);
  ws['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 8 }, { wch: 9 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 45 }, { wch: 32 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  const notes = [
    ['How to use this template'],
    [''],
    ['Leave "id" blank to add a brand-new product — an id is generated from the name automatically.'],
    ['To UPDATE an existing product instead, put its exact product id in the "id" column.'],
    [''],
    ['Required: name, price, texture, category'],
    [`texture must be one of: ${VALID_TEXTURES.join(', ')}`],
    [`category must be one of: ${VALID_CATEGORIES.join(', ')}`],
    ['tags is optional and comma-separated, e.g. new,bestseller,donor-unit,bob,fringe'],
    ['image is optional — paste a hosted photo URL, or leave blank and add photos per product afterwards in the admin panel'],
    [''],
    ['Variant options (length/color/density/price) are not covered by this sheet — add variants per product in the admin panel after uploading.'],
    ['Delete the example row before uploading, or leave it — a row with no name is skipped.']
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(notes);
  ws2['!cols'] = [{ wch: 95 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Instructions');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="ibcoco-product-upload-template.xlsx"');
  res.send(buf);
});
// Accepts a filled-in copy of the template above and creates/updates products from it in one
// batch. Rows with a problem are skipped (with a reason) rather than failing the whole upload.
app.post('/api/admin/products/bulk-upload', admin, (req, res) => {
  uploadSheet.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No file received' });
    let rows;
    try {
      const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } catch {
      return res.status(400).json({ error: 'Could not read that file — make sure it is the .xlsx template, unedited in structure.' });
    }
    const db = await read();
    let created = 0;
    let updated = 0;
    const skipped = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // header is row 1 in the sheet
      const existingId = String(row.id || '').trim();
      const name = String(row.name || '').trim();
      if (!name && !existingId) continue; // blank row — ignore silently
      if (!name) { skipped.push({ row: rowNum, reason: 'Missing name' }); continue; }
      const price = Number(row.price);
      if (!Number.isFinite(price) || price <= 0) { skipped.push({ row: rowNum, reason: 'Missing or invalid price' }); continue; }
      const texture = String(row.texture || '').trim().toLowerCase();
      if (!VALID_TEXTURES.includes(texture)) { skipped.push({ row: rowNum, reason: `texture must be one of: ${VALID_TEXTURES.join(', ')}` }); continue; }
      const category = String(row.category || '').trim().toLowerCase();
      if (!VALID_CATEGORIES.includes(category)) { skipped.push({ row: rowNum, reason: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }); continue; }
      let product = null;
      if (existingId) {
        product = db.products.find((p) => p.id === existingId);
        if (!product) { skipped.push({ row: rowNum, reason: `No existing product with id "${existingId}"` }); continue; }
      }
      const oldPriceNum = Number(row.oldPrice);
      const tags = String(row.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const badge = String(row.badge || '').trim();
      const description = String(row.description || '').trim();
      const image = String(row.image || '').trim();
      if (product) {
        product.name = name;
        product.price = price;
        product.oldPrice = row.oldPrice !== '' && Number.isFinite(oldPriceNum) ? oldPriceNum : null;
        product.badge = badge;
        product.texture = texture;
        product.category = category;
        product.description = description;
        if (image) product.image = image;
        if (tags.length) product.tags = tags;
        updated++;
      } else {
        let base = slugify(name) || 'product';
        let slug = base;
        let n = 2;
        while (db.products.some((p) => p.id === slug)) slug = `${base}-${n++}`;
        db.products.push({
          id: slug,
          name,
          price,
          oldPrice: row.oldPrice !== '' && Number.isFinite(oldPriceNum) ? oldPriceNum : null,
          badge,
          texture,
          category,
          rating: 5,
          description,
          image,
          variants: [],
          tags
        });
        created++;
      }
    }
    if (created || updated) await write(db);
    res.json({ created, updated, skipped });
  });
});

// ---- Admin: settings (bank transfer acceptance shown on the storefront) ----
app.put('/api/admin/settings', admin, async (req, res) => {
  const db = await read();
  const { bankTransfer, categoryImages, heroImages, logo, siteImages, siteVideos, ticker } = req.body || {};
  if (bankTransfer) {
    db.settings.bankTransfer = { enabled: !!bankTransfer.enabled, instructions: bankTransfer.instructions || '' };
  }
  if (categoryImages && typeof categoryImages === 'object') db.settings.categoryImages = categoryImages;
  if (Array.isArray(heroImages)) db.settings.heroImages = heroImages;
  if (logo !== undefined) db.settings.logo = logo;
  if (siteImages && typeof siteImages === 'object') db.settings.siteImages = siteImages;
  if (siteVideos && typeof siteVideos === 'object') db.settings.siteVideos = siteVideos;
  if (Array.isArray(ticker) && ticker.length) db.settings.ticker = ticker.filter((t) => typeof t === 'string' && t.trim());
  await write(db);
  res.json(db.settings);
});

// Upload a single image file (product photo, category tile, hero slide, logo) — stores it in
// UPLOADS_DIR and returns the local URL to save on whichever record it belongs to.
app.post('/api/admin/upload', admin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No image file received' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// Same idea as /api/admin/upload but for video files (About page walkthrough, Hair Care Guide
// washing video, per-product styling videos) — kept as a separate route since it uses the
// video-only multer instance with a larger size limit.
app.post('/api/admin/upload-video', admin, (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No video file received' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// One-click migration: downloads every externally-hosted image currently referenced anywhere
// in the store (product photos, variant photos, category tiles, hero slides, logo) into
// UPLOADS_DIR, and rewrites those records to point at the new local copy. Already-local
// (/uploads/...) images are left alone, so this is safe to run more than once.
app.post('/api/admin/migrate-images', admin, async (req, res) => {
  const db = await read();
  let downloaded = 0;
  const failed = [];
  async function migrateField(obj, field, label) {
    const val = obj[field];
    if (!isExternalUrl(val)) return;
    try {
      obj[field] = await downloadImageToUploads(val);
      downloaded++;
    } catch (err) {
      failed.push({ label, url: val, error: err.message });
    }
  }
  for (const p of db.products) {
    await migrateField(p, 'image', p.name);
    for (const v of p.variants || []) await migrateField(v, 'image', `${p.name} — variant`);
  }
  for (const key of Object.keys(db.settings.categoryImages || {})) {
    await migrateField(db.settings.categoryImages, key, `category: ${key}`);
  }
  for (let i = 0; i < (db.settings.heroImages || []).length; i++) {
    await migrateField(db.settings.heroImages, i, `hero image ${i + 1}`);
  }
  await migrateField(db.settings, 'logo', 'logo');
  for (const key of Object.keys(db.settings.siteImages || {})) {
    await migrateField(db.settings.siteImages, key, `site photo: ${key}`);
  }
  await write(db);
  res.json({ downloaded, failed });
});
app.get('/api/admin/settings/all', admin, async (req, res) => {
  const db = await read();
  res.json(db.settings);
});

app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
app.listen(PORT, () => console.log(`IBCOCO Quality Hairs API running on http://localhost:${PORT}`));
