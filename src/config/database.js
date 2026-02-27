const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'malta_crm',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL database connection established successfully.');
    console.log(`  (host: ${process.env.DB_HOST || 'localhost'}, port: ${process.env.DB_PORT || 5432}, db: ${process.env.DB_NAME || 'malta_crm'})`);
    // Schema is managed entirely by Sequelize CLI migrations (npm run db:migrate).
    // Do NOT call sequelize.sync() here — it conflicts with underscored models
    // because sync() tries to ADD "createdAt"/"updatedAt" camelCase columns even
    // when the migrations already created "created_at"/"updated_at" snake_case
    // columns, causing: "column X contains null values" on every server start.
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);

    if (error.message.includes('password authentication failed')) {
      console.error('');
      console.error('  HOW TO FIX:');
      console.error('  1. Open the file  .env  in Notepad.');
      console.error('     (It is in the same folder as start-windows.bat)');
      console.error('  2. Find the line that starts with:  DB_PASSWORD=');
      console.error('  3. Replace the value after = with the password you');
      console.error('     chose when you installed PostgreSQL.');
      console.error('     Example:  DB_PASSWORD=MyPostgresPass123');
      console.error('  4. Save the file and restart the CRM.');
      console.error('');
      console.error('  If you have forgotten your PostgreSQL password, see');
      console.error('  STEP-BY-STEP.txt under COMMON PROBLEMS.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('  PostgreSQL is not running.');
      console.error('  Start it: press Win+R, type services.msc, press Enter,');
      console.error('  find PostgreSQL in the list, right-click it, click Start.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('');
      console.error('  The database "malta_crm" does not exist.');
      console.error('  Run:  node scripts/create-database.js');
    }

    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
