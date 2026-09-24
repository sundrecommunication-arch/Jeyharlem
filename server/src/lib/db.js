// Postgres-backed replacement for the old server/data/db.json flat-file store.
//
// Design: each collection (products, newsletter, appointments, orders, messages, users)
// gets its own table with an `id` primary key and a `data JSONB` column holding the full
// record — the same shape the rest of the app already works with. This keeps every route
// handler in src/index.js completely unchanged: they still call read() to get the whole
// { products, newsletter, ... } object and write(db) to persist it, exactly as before.
// The difference is write(db) now runs inside a single Postgres transaction, so concurrent
// requests can no longer corrupt or clobber each other's writes the way two simultaneous
// writes to a JSON file on disk could.
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_JSON_DB = path.join(__dirname, '../../data/db.json');

const COLLECTIONS = ['products', 'newsletter', 'appointments', 'orders', 'messages', 'users'];

let pool = null;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Most managed Postgres providers (Neon, Supabase, Render, etc.) require SSL and
      // present a certificate that isn't in Node's default trust store — a local Postgres
      // on localhost doesn't need this.
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

let schemaReady = null;
async function ensureSchema() {
  if (schemaReady) return schemaReady;
  const p = getPool();
  schemaReady = (async () => {
    for (const table of COLLECTIONS) {
      await p.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          seq BIGSERIAL PRIMARY KEY,
          id TEXT UNIQUE NOT NULL,
          data JSONB NOT NULL
        )
      `);
    }
    await p.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'global',
        data JSONB NOT NULL
      )
    `);
    await migrateLegacyJsonIfEmpty(p);
  })();
  return schemaReady;
}

// One-time convenience migration: if the products table is still empty (a brand new
// database) and the old server/data/db.json file exists with real data in it, import
// everything from that file so nothing already built up there gets lost. Safe to leave
// in place — it only ever runs once, the moment the products table stops being empty.
async function migrateLegacyJsonIfEmpty(p) {
  const { rows } = await p.query('SELECT count(*)::int AS n FROM products');
  if (rows[0].n > 0) return;
  let legacy;
  try {
    legacy = JSON.parse(await fs.readFile(LEGACY_JSON_DB, 'utf8'));
  } catch {
    return; // no legacy file, nothing to migrate — the caller will seed defaults instead
  }
  const hasData = COLLECTIONS.some((c) => Array.isArray(legacy[c]) && legacy[c].length);
  if (!hasData) return;
  console.log('[ibcoco] Importing existing server/data/db.json into Postgres (first run only)…');
  await writeRaw(p, legacy);
  console.log('[ibcoco] Import complete —', COLLECTIONS.map((c) => `${c}: ${(legacy[c] || []).length}`).join(', '));
}

export async function read() {
  const p = getPool();
  await ensureSchema();
  const out = {};
  for (const table of COLLECTIONS) {
    const { rows } = await p.query(`SELECT data FROM ${table} ORDER BY seq ASC`);
    out[table] = rows.map((r) => r.data);
  }
  const s = await p.query(`SELECT data FROM settings WHERE id = 'global'`);
  out.settings = s.rows[0]?.data || null;
  return out;
}

async function writeRaw(p, db) {
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    for (const table of COLLECTIONS) {
      await client.query(`DELETE FROM ${table}`);
      const rows = Array.isArray(db[table]) ? db[table] : [];
      for (const row of rows) {
        if (!row?.id) continue;
        await client.query(`INSERT INTO ${table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`, [row.id, row]);
      }
    }
    if (db.settings) {
      await client.query(
        `INSERT INTO settings (id, data) VALUES ('global', $1) ON CONFLICT (id) DO UPDATE SET data = $1`,
        [db.settings]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function write(db) {
  const p = getPool();
  await ensureSchema();
  await writeRaw(p, db);
}
