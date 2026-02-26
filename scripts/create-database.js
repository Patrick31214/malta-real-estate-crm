#!/usr/bin/env node
/**
 * Malta Real Estate CRM — Database Creation Helper
 * -------------------------------------------------
 * Creates the CRM database if it does not already exist.
 * Called automatically by start-windows.bat before the server starts.
 *
 * Safe to run multiple times — it is a no-op when the database exists.
 *
 * Usage:
 *   node scripts/create-database.js
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
  // We cannot connect to 'malta_crm' yet because it may not exist.
  const client = new Client({ host, port, database: 'postgres', user, password });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✓ Database '${dbName}' created.`);
    } else {
      console.log(`✓ Database '${dbName}' already exists.`);
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    await client.end().catch(() => {});
    console.error(`✗ Could not create/verify the database: ${error.message}`);

    if (error.message.includes('password authentication failed')) {
      console.error('');
      console.error('  The DB_PASSWORD in your .env file is wrong.');
      console.error('  Open .env in Notepad and set DB_PASSWORD= to the password');
      console.error('  you chose when you installed PostgreSQL.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('  PostgreSQL is not running.');
      console.error('  Start it via Services (Win+R -> services.msc -> PostgreSQL -> Start).');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.error('');
      console.error('  The DB_USER in your .env is wrong.');
      console.error('  The default PostgreSQL user is "postgres".');
      console.error('  Check: DB_USER=postgres  in your .env file.');
    }

    process.exit(1);
  }
}

main();
