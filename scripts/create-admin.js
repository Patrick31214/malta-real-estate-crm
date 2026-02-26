#!/usr/bin/env node
/**
 * Malta Real Estate CRM — First Admin Setup Script
 * ------------------------------------------------
 * Run this ONCE after setting up the database to create your admin account.
 *
 * Usage:
 *   node scripts/create-admin.js
 *
 * You will be prompted for:
 *   - Your name
 *   - Your email address
 *   - A password (min 8 characters)
 */

'use strict';

require('dotenv').config();
const readline = require('readline');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  console.log('');
  console.log('================================================');
  console.log('  🏖️  Malta Real Estate CRM — Admin Setup');
  console.log('================================================');
  console.log('');
  console.log('This will create your first admin account.');
  console.log('Run this script only once, then use the web');
  console.log('interface to manage all other accounts.');
  console.log('');

  // Connect to database
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log('✓ Connected to database.\n');
  } catch (err) {
    console.error('✗ Cannot connect to database:', err.message);
    console.error('');
    console.error('Make sure:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Your .env file has the correct DB_PASSWORD');
    console.error('  3. The database "malta_crm" exists');
    process.exit(1);
  }

  // Check if an admin already exists
  const existingAdmin = await User.findOne({ where: { role: 'admin' } });
  if (existingAdmin) {
    console.log('ℹ️  An admin account already exists:');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log('');
    console.log('You can log in with that account.');
    console.log('If you forgot the password, re-run this script');
    console.log('and choose a different email to create a second admin.');
    console.log('');
    rl.close();
    process.exit(0);
  }

  // Gather input
  const firstName = await ask('Your first name: ');
  const lastName  = await ask('Your last name:  ');
  const email     = await ask('Your email:      ');
  const password  = await ask('Choose a password (min 8 chars): ');

  if (!firstName || !email || !password) {
    console.error('\n✗ All fields are required.');
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n✗ Password must be at least 8 characters.');
    rl.close();
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('\n✗ Please enter a valid email address.');
    rl.close();
    process.exit(1);
  }

  // Check email isn't taken
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.error(`\n✗ An account with email "${email}" already exists.`);
    rl.close();
    process.exit(1);
  }

  // Create the admin
  await User.create({ email, password, firstName, lastName, role: 'admin' });

  console.log('');
  console.log('================================================');
  console.log('  ✅  Admin account created successfully!');
  console.log('================================================');
  console.log('');
  console.log(`  Name:  ${firstName} ${lastName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Role:  admin`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Start the backend:  npm run dev');
  console.log('  2. Start the frontend: npm run client:dev');
  console.log('  3. Open http://localhost:3000 in your browser');
  console.log('  4. Log in with the email and password above');
  console.log('');

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
