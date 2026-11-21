/**
 * Applies new SQL migrations from src/database/migrations, in file-name order.
 * Applied migrations are recorded in the schema_migrations table, so each file runs only once.
 *
 * Usage:  npm run migrate            apply pending migrations
 *         npm run migrate -- --status list applied / pending migrations
 *
 * Rule: never edit a migration that has already run. Add a new file (002_..., 003_...) instead.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../config/environment.js';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

async function main() {
  const statusOnly = process.argv.includes('--status');
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true, // migration files contain several statements; only trusted local files are run
  });

  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       VARCHAR(255) PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    const [rows] = await conn.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    const pending = files.filter((f) => !applied.has(f));

    if (statusOnly) {
      files.forEach((f) => console.log(`${applied.has(f) ? '[applied]' : '[pending]'} ${f}`));
      return;
    }
    if (!pending.length) {
      console.log('Database is up to date.');
      return;
    }

    for (const file of pending) {
      process.stdout.write(`Applying ${file} ... `);
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      // Note: MySQL commits DDL (CREATE/ALTER) immediately, so a failed file may be partly applied.
      await conn.query(sql);
      await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      console.log('done');
    }
    console.log(`Applied ${pending.length} migration(s).`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
