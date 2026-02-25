# 🚀 Malta Real Estate CRM - Complete Laptop Setup Guide

This guide will walk you through **every single step** to get the Malta Real Estate CRM running on your laptop, starting from scratch.

---

## 📋 Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Setting Up PostgreSQL](#setting-up-postgresql)
3. [Getting the Project Code](#getting-the-project-code)
4. [Configuring the Application](#configuring-the-application)
5. [Setting Up the Database](#setting-up-the-database)
6. [Starting the Application](#starting-the-application)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites Installation

### Step 1: Install Node.js

**Windows:**
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended for most users)
3. Double-click the downloaded file
4. Follow the installation wizard (click "Next" through all steps)
5. **Verify installation:**
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   - In the black window (Command Prompt), type:
     ```cmd
     node --version
     ```
   - You should see something like `v20.x.x` or `v18.x.x`
   - Type:
     ```cmd
     npm --version
     ```
   - You should see something like `10.x.x` or `9.x.x`

**Mac:**
1. Go to https://nodejs.org/
2. Download the **LTS version** (macOS Installer)
3. Double-click the `.pkg` file
4. Follow the installation wizard
5. **Verify installation:**
   - Press `Command + Space`
   - Type `terminal` and press Enter
   - In the Terminal window, type:
     ```bash
     node --version
     npm --version
     ```

**Linux (Ubuntu/Debian):**
```bash
# Open Terminal (Ctrl + Alt + T)
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm -y

# Verify installation
node --version
npm --version
```

---

### Step 2: Install Git

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download Git for Windows
3. Run the installer
4. Use default settings (click "Next" through all steps)
5. **Verify installation:**
   - Open Command Prompt (Windows Key + R, type `cmd`)
   - Type:
     ```cmd
     git --version
     ```

**Mac:**
```bash
# Open Terminal
# Git is usually pre-installed on Mac. Check with:
git --version

# If not installed, install via Homebrew:
# First install Homebrew if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Git:
brew install git
```

**Linux:**
```bash
sudo apt install git -y
git --version
```

---

## 🐘 Setting Up PostgreSQL

### Windows Installation

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Download the latest version for Windows

2. **Install PostgreSQL:**
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup
   - **Important:** When asked for a password, choose a password you'll remember
     - Example: `postgres` (simple for development)
     - **Write this down!** You'll need it later
   - Keep the default port: `5432`
   - Click "Next" through the rest
   - Wait for installation to complete

3. **Open pgAdmin (PostgreSQL GUI):**
   - Press Windows Key
   - Type `pgAdmin`
   - Click on pgAdmin 4
   - Wait for it to open in your browser
   - It may ask for the password you set during installation

4. **Open SQL Shell (Alternative):**
   - Press Windows Key
   - Type `SQL Shell` or `psql`
   - Click on "SQL Shell (psql)"
   - Press Enter for Server [localhost]:
   - Press Enter for Database [postgres]:
   - Press Enter for Port [5432]:
   - Press Enter for Username [postgres]:
   - Type your password and press Enter
   - You should see: `postgres=#`

### Mac Installation

```bash
# Install PostgreSQL via Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Access PostgreSQL
psql postgres

# Set a password for postgres user (in psql prompt):
ALTER USER postgres PASSWORD 'postgres';

# Exit psql
\q
```

### Linux Installation

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password for postgres user
sudo -u postgres psql
ALTER USER postgres PASSWORD 'postgres';
\q
```

---

## 📁 Getting the Project Code

### Step 1: Choose a Location

**Windows:**
1. Open Command Prompt (Windows Key + R, type `cmd`, press Enter)
2. Navigate to where you want to store the project:
   ```cmd
   cd C:\Users\YourUsername\Documents
   ```
   Replace `YourUsername` with your actual Windows username

**Mac/Linux:**
```bash
# Open Terminal
# Navigate to your home directory
cd ~

# Or go to Documents folder
cd ~/Documents
```

### Step 2: Clone the Repository

**All Platforms:**
```bash
# Clone the project from GitHub
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

# You should see: "Cloning into 'malta-real-estate-crm'..."
# Wait for it to complete
```

### Step 3: Enter the Project Directory

**Windows:**
```cmd
cd malta-real-estate-crm
```

**Mac/Linux:**
```bash
cd malta-real-estate-crm
```

**Verify you're in the right place:**
```bash
# List files - you should see package.json, src, tests, etc.

# Windows:
dir

# Mac/Linux:
ls -la
```

---

## ⚙️ Configuring the Application

### Step 1: Install Project Dependencies

**All Platforms:**
```bash
# Make sure you're in the malta-real-estate-crm directory
# Install all required packages (this takes 1-2 minutes)
npm install
```

You'll see lots of text scrolling by. Wait until you see:
```
added XXX packages, and audited XXX packages in XXs
```

### Step 2: Create Configuration File

**Windows:**
```cmd
# Copy the example configuration file
copy .env.example .env

# Edit the file
notepad .env
```

**Mac/Linux:**
```bash
# Copy the example configuration file
cp .env.example .env

# Edit the file (choose one):
nano .env
# OR
vim .env
# OR
code .env  # if you have VS Code
```

### Step 3: Update Configuration

In the `.env` file, update the following lines:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malta_crm
DB_USER=postgres
DB_PASSWORD=postgres
# ⬆️ CHANGE THIS to the password you set during PostgreSQL installation

# JWT Configuration (you can leave these as-is for development)
JWT_SECRET=dev_secret_key_for_testing_only_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_for_testing_only_change_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**Save the file:**
- **Notepad (Windows):** File → Save, then close
- **nano:** Press `Ctrl + X`, then `Y`, then `Enter`
- **vim:** Press `Esc`, type `:wq`, press `Enter`
- **VS Code:** Press `Ctrl + S` (Windows/Linux) or `Cmd + S` (Mac)

---

## 🗄️ Setting Up the Database

### Step 1: Open PostgreSQL

**Windows - Using pgAdmin:**
1. Open pgAdmin (Windows Key → type "pgAdmin")
2. Expand "Servers" in the left panel
3. Click on "PostgreSQL XX" (enter your password if asked)
4. Right-click "Databases"
5. Choose "Create" → "Database"
6. Name: `malta_crm`
7. Click "Save"

**Windows - Using SQL Shell:**
1. Open SQL Shell (psql) (Windows Key → type "SQL Shell")
2. Press Enter for all prompts until "Password:"
3. Type your PostgreSQL password
4. Type:
   ```sql
   CREATE DATABASE malta_crm;
   ```
5. You should see: `CREATE DATABASE`
6. Type `\q` to exit

**Mac/Linux - Using Terminal:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted

# Create database
CREATE DATABASE malta_crm;

# You should see: CREATE DATABASE

# Exit
\q
```

### Step 2: Run Database Migrations

**All Platforms:**

Make sure you're in the `malta-real-estate-crm` directory, then:

```bash
# Run migrations to create all tables
npm run db:migrate
```

You should see output like:
```
Sequelize CLI [Node: XX.X.X, CLI: X.X.X, ORM: X.X.X]

Loaded configuration file "src/config/config.js".
Using environment "development".

== 20240101000000-create-users: migrating =======
== 20240101000000-create-users: migrated (0.XXXs)

== 20240102000000-create-owners: migrating =======
== 20240102000000-create-owners: migrated (0.XXXs)
...
```

### Step 3: Seed Test Data (Optional but Recommended)

```bash
# Load sample data (properties, users, agents, etc.)
npm run db:seed
```

This creates:
- 6 test user accounts (admin, agents, clients)
- 8 sample properties
- 5 property owners
- 3 agents
- 8 customer inquiries

---

## 🚀 Starting the Application

### Start the Server

**All Platforms:**

```bash
# Make sure you're in the malta-real-estate-crm directory

# Start the server
npm start
```

You should see:
```
> malta-real-estate-crm@1.0.0 start
> node src/server.js

✓ PostgreSQL database connection established successfully.
✓ Database ready (using migrations for schema management).
✓ Server is running on port 5000
✓ Environment: development
✓ API Documentation: http://localhost:5000/
```

**🎉 Congratulations! Your server is now running!**

**Note:** Keep this window open! The server is running here. Don't close it.

---

## ✅ Verification

### Step 1: Test in Browser

1. **Open your web browser** (Chrome, Firefox, Edge, Safari)
2. **Go to:** http://localhost:5000
3. **You should see:**
   ```json
   {
     "success": true,
     "message": "Malta Real Estate CRM API",
     "version": "1.0.0"
   }
   ```

### Step 2: Test Health Endpoint

Go to: http://localhost:5000/health

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-XX-XXTXX:XX:XX.XXXZ"
}
```

### Step 3: Test Login (Optional)

**Windows (Command Prompt - open a NEW window, don't close the server):**
```cmd
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@maltarealestate.com\",\"password\":\"Password123!\"}"
```

**Mac/Linux (Terminal - open a NEW tab/window):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltarealestate.com","password":"Password123!"}'
```

You should see a response with `"success": true` and a token.

---

## 📊 Complete Directory Navigation Reference

Here's the **exact order of commands** from start to finish:

### Windows Complete Setup:

```cmd
REM 1. Open Command Prompt (Windows Key + R, type cmd, Enter)

REM 2. Go to your Documents folder
cd C:\Users\YourUsername\Documents

REM 3. Clone the project
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

REM 4. Enter the project directory
cd malta-real-estate-crm

REM 5. Install dependencies
npm install

REM 6. Create configuration file
copy .env.example .env

REM 7. Edit configuration (update DB_PASSWORD)
notepad .env

REM 8. Create database (open SQL Shell separately and run):
REM CREATE DATABASE malta_crm;

REM 9. Run migrations (back in Command Prompt)
npm run db:migrate

REM 10. Seed test data
npm run db:seed

REM 11. Start the server
npm start
```

### Mac/Linux Complete Setup:

```bash
# 1. Open Terminal (Cmd+Space, type "terminal", Enter on Mac)
#    or Ctrl+Alt+T on Linux

# 2. Go to your Documents folder
cd ~/Documents

# 3. Clone the project
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

# 4. Enter the project directory
cd malta-real-estate-crm

# 5. Install dependencies
npm install

# 6. Create configuration file
cp .env.example .env

# 7. Edit configuration (update DB_PASSWORD)
nano .env
# Press Ctrl+X, then Y, then Enter to save

# 8. Create database
psql -U postgres
# Enter password
# Then type: CREATE DATABASE malta_crm;
# Then type: \q

# 9. Run migrations
npm run db:migrate

# 10. Seed test data
npm run db:seed

# 11. Start the server
npm start
```

---

## 🔧 Troubleshooting

### Problem: "command not found: node" or "node is not recognized"

**Solution:** Node.js is not installed or not in your PATH
- Reinstall Node.js from https://nodejs.org/
- Restart your terminal/command prompt after installation

---

### Problem: "command not found: npm" or "npm is not recognized"

**Solution:** npm should install with Node.js
- Reinstall Node.js
- Make sure to restart your terminal

---

### Problem: "password authentication failed for user postgres"

**Solution:** Wrong database password
1. Open `.env` file
2. Update `DB_PASSWORD=` with your actual PostgreSQL password
3. Save the file
4. Try again: `npm run db:migrate`

---

### Problem: "database "malta_crm" does not exist"

**Solution:** Database not created
- Follow "Step 1: Open PostgreSQL" in the "Setting Up the Database" section
- Create the database: `CREATE DATABASE malta_crm;`

---

### Problem: "Port 5000 is already in use" or "EADDRINUSE"

**Solution:** Another application is using port 5000

**Windows:**
```cmd
REM Find what's using port 5000
netstat -ano | findstr :5000

REM Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F
```

**Mac/Linux:**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace XXXX with PID from above)
kill -9 XXXX
```

**Or change the port:**
1. Open `.env` file
2. Change `PORT=5000` to `PORT=3001` (or any other port)
3. Save and restart: `npm start`

---

### Problem: "Cannot find module" errors

**Solution:** Dependencies not installed
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install
```

---

### Problem: PostgreSQL service not running

**Windows:**
1. Press Windows Key
2. Type "Services"
3. Open Services app
4. Find "postgresql-x64-XX"
5. Right-click → Start

**Mac:**
```bash
brew services start postgresql@16
```

**Linux:**
```bash
sudo systemctl start postgresql
```

---

## 📝 Quick Reference Commands

### Daily Use:

```bash
# Start the server (run from malta-real-estate-crm directory)
npm start

# Start in development mode (auto-restart on file changes)
npm run dev

# Stop the server
# Press Ctrl + C in the terminal where it's running
```

### Database Commands:

```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Seed test data
npm run db:seed

# Reset database (undo all, migrate, seed)
npm run db:reset
```

### Testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🎯 Test Credentials

After seeding the database, you can use these accounts:

**Admin:**
- Email: `admin@maltarealestate.com`
- Password: `Password123!`

**Agents:**
- Email: `john.smith@maltarealestate.com`
- Password: `Password123!`

**Clients:**
- Email: `client1@example.com`
- Password: `Password123!`

---

## 🆘 Still Having Issues?

1. **Check the README.md file** in the project folder for additional documentation
2. **Review the SESSION_SUMMARY.md** for technical details
3. **Check the GitHub repository** for issues: https://github.com/Patrick31214/malta-real-estate-crm/issues

---

## ✨ Success!

If you can see the API response at http://localhost:5000, **you've successfully set up the Malta Real Estate CRM!** 🎉

The server is now running and ready for development or testing.

**Next Steps:**
- Explore the API endpoints (see README.md)
- Try the test credentials to log in
- Read the documentation to understand the system

---

**Created:** 2026-02-25  
**For:** Malta Real Estate CRM v1.0.0
