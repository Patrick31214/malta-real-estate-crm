# 🚀 Quick Start Commands - Malta Real Estate CRM

**Choose your operating system and follow these exact commands:**

---

## 🪟 Windows (Command Prompt)

```cmd
REM === PART 1: FIRST TIME SETUP (Only do once) ===

REM 1. Navigate to where you want the project
cd C:\Users\YourUsername\Documents

REM 2. Download the project
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

REM 3. Go into the project folder
cd malta-real-estate-crm

REM 4. Install all dependencies (takes 1-2 minutes)
npm install

REM 5. Create your configuration file
copy .env.example .env

REM 6. Edit the file to set your PostgreSQL password
notepad .env
REM → Change DB_PASSWORD=your_password_here to your actual password
REM → Save and close (Ctrl+S, then close Notepad)

REM === PART 2: OPEN POSTGRESQL ===

REM Option A: Using pgAdmin (Easiest)
REM 1. Press Windows Key
REM 2. Type: pgAdmin
REM 3. Press Enter
REM 4. In pgAdmin, right-click "Databases" → Create → Database
REM 5. Name it: malta_crm
REM 6. Click Save

REM Option B: Using SQL Shell (psql)
REM 1. Press Windows Key  
REM 2. Type: SQL Shell
REM 3. Press Enter
REM 4. Press Enter 4 times (accept defaults)
REM 5. Type your PostgreSQL password
REM 6. Type: CREATE DATABASE malta_crm;
REM 7. Type: \q

REM === PART 3: SETUP DATABASE (Back in Command Prompt) ===

REM Create all database tables
npm run db:migrate

REM Load test data (users, properties, etc.)
npm run db:seed

REM === PART 4: START THE SERVER ===

npm start

REM You should see:
REM ✓ Server is running on port 5000
```

---

## 🍎 Mac (Terminal)

```bash
# === PART 1: FIRST TIME SETUP (Only do once) ===

# 1. Navigate to your Documents folder
cd ~/Documents

# 2. Download the project
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

# 3. Go into the project folder
cd malta-real-estate-crm

# 4. Install all dependencies (takes 1-2 minutes)
npm install

# 5. Create your configuration file
cp .env.example .env

# 6. Edit the file to set your PostgreSQL password
nano .env
# → Change DB_PASSWORD=your_password_here to your actual password
# → Press Ctrl+X, then Y, then Enter to save

# === PART 2: SETUP POSTGRESQL ===

# Start PostgreSQL service
brew services start postgresql@16

# Create the database
psql -U postgres
# Type your password
# Then type: CREATE DATABASE malta_crm;
# Then type: \q

# === PART 3: SETUP DATABASE ===

# Create all database tables
npm run db:migrate

# Load test data (users, properties, etc.)
npm run db:seed

# === PART 4: START THE SERVER ===

npm start

# You should see:
# ✓ Server is running on port 5000
```

---

## 🐧 Linux (Ubuntu/Debian Terminal)

```bash
# === PART 1: FIRST TIME SETUP (Only do once) ===

# 1. Navigate to your Documents folder
cd ~/Documents

# 2. Download the project
git clone https://github.com/Patrick31214/malta-real-estate-crm.git

# 3. Go into the project folder
cd malta-real-estate-crm

# 4. Install all dependencies (takes 1-2 minutes)
npm install

# 5. Create your configuration file
cp .env.example .env

# 6. Edit the file to set your PostgreSQL password
nano .env
# → Change DB_PASSWORD=your_password_here to your actual password
# → Press Ctrl+X, then Y, then Enter to save

# === PART 2: SETUP POSTGRESQL ===

# Start PostgreSQL service
sudo systemctl start postgresql

# Create the database
sudo -u postgres psql
# Type: CREATE DATABASE malta_crm;
# Type: \q

# === PART 3: SETUP DATABASE ===

# Create all database tables
npm run db:migrate

# Load test data (users, properties, etc.)
npm run db:seed

# === PART 4: START THE SERVER ===

npm start

# You should see:
# ✓ Server is running on port 5000
```

---

## ✅ Verify It's Working

**1. Open your web browser**

Go to: http://localhost:5000

You should see:
```json
{
  "success": true,
  "message": "Malta Real Estate CRM API",
  "version": "1.0.0"
}
```

**2. Check health status**

Go to: http://localhost:5000/health

---

## 🔄 Daily Use (After First Setup)

Every time you want to start working:

**Windows:**
```cmd
REM 1. Open Command Prompt
REM 2. Navigate to project
cd C:\Users\YourUsername\Documents\malta-real-estate-crm

REM 3. Start the server
npm start
```

**Mac/Linux:**
```bash
# 1. Open Terminal
# 2. Navigate to project
cd ~/Documents/malta-real-estate-crm

# 3. Start the server
npm start
```

---

## ⚡ Common Issues & Quick Fixes

### ❌ "database malta_crm does not exist"
**Fix:** You forgot to create the database
```bash
# Open PostgreSQL and run:
CREATE DATABASE malta_crm;
```

### ❌ "password authentication failed"
**Fix:** Wrong password in .env file
1. Open .env file
2. Update DB_PASSWORD with correct password
3. Save and try again

### ❌ "Port 5000 already in use"
**Fix:** Something else is using port 5000

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID XXXX /F
```

**Mac/Linux:**
```bash
lsof -i :5000
kill -9 XXXX
```

### ❌ "Cannot find module"
**Fix:** Dependencies not installed
```bash
npm install
```

---

## 🎯 Test Login

**After server is running**, open a NEW terminal/command prompt window:

**Windows:**
```cmd
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@maltarealestate.com\",\"password\":\"Password123!\"}"
```

**Mac/Linux:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltarealestate.com","password":"Password123!"}'
```

---

## 🔑 Test Accounts

- **Admin:** admin@maltarealestate.com / Password123!
- **Agent:** john.smith@maltarealestate.com / Password123!
- **Client:** client1@example.com / Password123!

---

## 📚 Need More Help?

**Full detailed guide:** Read `LAPTOP_SETUP_GUIDE.md`

**Already set up before?** Read `RESTART_GUIDE.md`

**API documentation:** Read `README.md`

---

**Quick Start Created:** 2026-02-25
