#!/usr/bin/env node
/**
 * Malta Real Estate CRM — Database Drop Helper
 * ---------------------------------------------
 * Terminates all active connections to the CRM database, then drops it.
 *
 * This is used instead of  sequelize-cli db:drop  because the sequelize-cli
 * command issues a plain  DROP DATABASE  which PostgreSQL refuses when any
 * other session (e.g. the running CRM server) is connected.
 *
 * Safe to run when the database does not exist — it is a no-op in that case.
 *
 * Usage:
 *   node scripts/drop-database.js
 */

'use strict';

require('dotenv').config();
const { Client } = require('pg');

const dbName   = process.env.DB_NAME     || 'malta_crm';
const host     = process.env.DB_HOST     || 'localhost';
const port     = parseInt(process.env.DB_PORT, 10) || 5432;
const user     = process.env.DB_USER     || 'postgres';
const password = process.env.DB_PASSWORD || '';

// Restrict DB_NAME to safe identifier characters so it can be used in SQL.
if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
  console.error(`✗ DB_NAME '${dbName}' contains characters that are not allowed.`);
  console.error('  DB_NAME may only contain letters, numbers, and underscores.');
  process.exit(1);
}

async function main() {
  // Connect to the built-in 'postgres' maintenance database.
  // We must NOT connect to 'malta_crm' itself — that would add another
  // session that we would also need to terminate.
  const client = new Client({ host, port, database: 'postgres', user, password });

  try {
    await client.connect();

    // Check whether the database exists at all.
    const exists = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (exists.rowCount === 0) {
      console.log(`✓ Database '${dbName}' does not exist — nothing to drop.`);
      await client.end();
      process.exit(0);
    }

    // Terminate every session connected to the target database (except ours).
    // pg_terminate_backend() sends SIGTERM to the backend process, which
    // causes it to cleanly disconnect.  This is the same approach used by
    // pgAdmin's "Drop Database" dialog.
    const terminated = await client.query(
      `SELECT COUNT(*) AS n
         FROM pg_terminate_backend(
           (SELECT pid FROM pg_stat_activity
             WHERE datname = $1
               AND pid <> pg_backend_pid())
         )`,
      [dbName]
    );

    const count = parseInt(terminated.rows[0].n, 10);
    if (count > 0) {
      console.log(`  Disconnected ${count} active session(s) from '${dbName}'.`);
    }

    // Drop the database.
    // NOTE: PostgreSQL does not support parameterized queries for DDL
    // identifiers (table names, database names).  We use string interpolation
    // here with the dbName value that has already been validated above against
    // a strict allowlist regex (letters, digits, underscores only), so SQL
    // injection is not possible.
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`✓ Database '${dbName}' dropped.`);

    await client.end();
    process.exit(0);
  } catch (error) {
    await client.end().catch(() => {});
    console.error(`✗ Could not drop the database: ${error.message}`);

    if (error.message.includes('password authentication failed')) {
      console.error('');
      console.error('  The DB_PASSWORD in your .env file is wrong.');
      console.error('  Open .env in Notepad and set DB_PASSWORD= to the password');
      console.error('  you chose when you installed PostgreSQL.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('  PostgreSQL is not running.');
      console.error('  Start it via Services (Win+R -> services.msc -> PostgreSQL -> Start).');
    }

    process.exit(1);
  }
}

main();
