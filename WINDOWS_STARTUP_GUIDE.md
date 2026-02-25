# 🪟 Windows Startup Guide - Malta Real Estate CRM

## ⚠️ YOU ARE SEEING THIS ERROR

```
✗ Unable to connect to the database: ConnectionRefusedError [SequelizeConnectionRefusedError]
ECONNREFUSED
```

**This means PostgreSQL is NOT running on your computer!**

---

## 🚀 STEP-BY-STEP: Start Everything on Windows

### Current Situation (Based on Your Messages)

✅ You are in: `C:\Users\USER\malta-crm\malta-real-estate-crm`  
✅ npm packages are installed  
❌ PostgreSQL is NOT running  
❌ You need to update your code (4 commits behind)

---

## 📋 EXACT STEPS TO START EVERYTHING

### STEP 1: Start PostgreSQL Service

**Option A: Using Windows Services (GUI)**

1. Press `Windows Key + R`
2. Type: `services.msc`
3. Press `Enter`
4. Scroll down to find: **postgresql-x64-16** (or similar)
5. Right-click on it
6. Click **Start** (if it says "Stop", it's already running!)

**Option B: Using Command Prompt (as Administrator)**

1. Right-click on **Command Prompt**
2. Click **Run as Administrator**
3. Type this command:
   ```cmd
   net start postgresql-x64-16
   ```
4. Press `Enter`

You should see: **"The postgresql-x64-16 service was started successfully."**

**If you get an error:**
- The service name might be different
- Try: `net start postgresql-x64-15` or `net start postgresql-x64-14`
- Or open Services and check the exact name

---

### STEP 2: Verify PostgreSQL is Running

**Open Command Prompt and type:**

```cmd
psql --version
```

You should see something like: `psql (PostgreSQL) 16.x`

**Test the connection:**

```cmd
psql -U postgres -c "SELECT version();"
```

- It will ask for password (the one you set when installing PostgreSQL)
- If it shows PostgreSQL version info, it's working! ✅

---

### STEP 3: Navigate to Your Project

**In your Command Prompt, you are already here:**

```cmd
C:\Users\USER\malta-crm\malta-real-estate-crm>
```

✅ **PERFECT! You're in the right directory!**

---

### STEP 4: Update Your Code (You're 4 Commits Behind)

**You saw this message:**
```
Your branch is behind 'origin/copilot/implement-crud-endpoints-properties-owners-agents' by 4 commits
```

**Pull the latest code:**

```cmd
git pull origin copilot/implement-crud-endpoints-properties-owners-agents
```

This will update your code with the latest fixes!

---

### STEP 5: Verify Database Exists

**Open pgAdmin 4** (or SQL Shell):

**Method 1: Using pgAdmin**
1. Press `Windows Key`
2. Type: `pgAdmin`
3. Press `Enter`
4. Login with your PostgreSQL password
5. Expand "Servers" → "PostgreSQL 16" → "Databases"
6. Look for: **malta_crm**

**Method 2: Using SQL Shell (psql)**
1. Press `Windows Key`
2. Type: `SQL Shell`
3. Press `Enter`
4. Press `Enter` 4 times (accept defaults)
5. Enter your PostgreSQL password
6. Type: `\l` (list databases)
7. Look for **malta_crm** in the list

**If database DOES NOT exist:**

```sql
CREATE DATABASE malta_crm;
```

---

### STEP 6: Check Your .env File

**Make sure you have a `.env` file in:**
```
C:\Users\USER\malta-crm\malta-real-estate-crm\.env
```

**Open it with Notepad:**

```cmd
notepad .env
```

**It should contain:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5000
DB_NAME=malta_crm
DB_PASSWORD=your_postgres_password_here
DB_USER=postgres

# JWT Configuration
JWT_SECRET=abc123randomstring456def789ghi012jkl345mno678pqr901stu234
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=xyz987differentstring654wvu321tsr098qpo765nml432kji109hgf876

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**
- Replace `your_postgres_password_here` with YOUR actual PostgreSQL password
- The `DB_PORT=5000` is YOUR PostgreSQL port (you found this works for you!)

**Save and close Notepad**

---

### STEP 7: Run Database Migrations (if needed)

**Only if this is your first time or database is empty:**

```cmd
npm run db:reset
```

This will:
- Reset all database tables
- Create all tables fresh
- Add test data

**You should see:**
```
✓ Database connected successfully
== 20240101000000-create-users: migrating =======
== 20240101000000-create-users: migrated
...
```

---

### STEP 8: Start the Server! 🚀

**Now run:**

```cmd
npm start
```

**You should see:**

```
[dotenv@17.2.3] injecting env (11) from .env
✓ Database connected successfully
Server is running on port 5000
Server is accessible at: http://localhost:5000
```

**✅ SUCCESS!**

---

### STEP 9: Verify It's Working

**Open your web browser and go to:**

```
http://localhost:5000
```

You should see:
```json
{
  "message": "Malta Real Estate CRM API",
  "version": "1.0.0",
  "status": "running"
}
```

**Test the health check:**

```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

**✅ EVERYTHING IS WORKING!**

---

## 🔄 DAILY STARTUP PROCEDURE (From Now On)

Every time you want to start the system:

### 1. Open Command Prompt

Press `Windows Key`, type `cmd`, press `Enter`

### 2. Navigate to Project

```cmd
cd C:\Users\USER\malta-crm\malta-real-estate-crm
```

### 3. Make Sure PostgreSQL is Running

```cmd
net start postgresql-x64-16
```

(If it says "already started", that's fine!)

### 4. Start the Server

```cmd
npm start
```

**Done! That's it!**

---

## 🆘 TROUBLESHOOTING

### Problem: "Unable to connect to the database"

**Solution:**
1. PostgreSQL is not running → Start it (see Step 1 above)
2. Wrong password in `.env` → Check and fix it
3. Wrong port in `.env` → Make sure it's `DB_PORT=5000` (your PostgreSQL port)

### Problem: "Database 'malta_crm' does not exist"

**Solution:**

Open SQL Shell or pgAdmin and run:
```sql
CREATE DATABASE malta_crm;
```

Then run:
```cmd
npm run db:migrate
```

### Problem: "Cannot find module"

**Solution:**
```cmd
npm install
```

### Problem: "Port 5000 is already in use"

**Solution:**

**Option 1:** Stop the other process
1. Press `Ctrl+C` in any other Command Prompt windows running npm
2. Or open Task Manager, find "Node.js", and End Task

**Option 2:** Change the port
1. Open `.env` file
2. Change `PORT=5000` to `PORT=3001` (or any other port)
3. Save and restart

### Problem: "command not found: psql"

**Solution:**

PostgreSQL is not in your PATH. Either:
1. Use pgAdmin instead (GUI method)
2. Or add PostgreSQL to PATH:
   - Find PostgreSQL bin folder: `C:\Program Files\PostgreSQL\16\bin`
   - Add to System PATH in Environment Variables

### Problem: Git says "Your branch is behind"

**Solution:**
```cmd
git pull origin copilot/implement-crud-endpoints-properties-owners-agents
```

### Problem: "password authentication failed"

**Solution:**

Your PostgreSQL password in `.env` is wrong:
1. Open `.env`: `notepad .env`
2. Fix the `DB_PASSWORD=` line
3. Save and try again

---

## 📞 QUICK REFERENCE

### Your Project Location
```
C:\Users\USER\malta-crm\malta-real-estate-crm
```

### Important Commands

| What You Want | Command |
|---------------|---------|
| Navigate to project | `cd C:\Users\USER\malta-crm\malta-real-estate-crm` |
| Start PostgreSQL | `net start postgresql-x64-16` |
| Start the server | `npm start` |
| Reset database | `npm run db:reset` |
| Run migrations | `npm run db:migrate` |
| Update code | `git pull origin copilot/implement-crud-endpoints-properties-owners-agents` |
| Install packages | `npm install` |

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@maltarealestate.com | Password123! | Admin |
| john.smith@maltarealestate.com | Password123! | Agent |
| client1@example.com | Password123! | User |

### Important Files

| File | Purpose |
|------|---------|
| `.env` | Configuration (passwords, ports) |
| `package.json` | Project info and scripts |
| `src/server.js` | Main server file |

### Important URLs

| URL | What It Does |
|-----|--------------|
| http://localhost:5000 | API homepage |
| http://localhost:5000/health | Health check |
| http://localhost:5000/api/properties | List properties |

---

## ✅ CHECKLIST: Is Everything Ready?

- [ ] PostgreSQL service is running
- [ ] Database `malta_crm` exists
- [ ] `.env` file exists and has correct password
- [ ] Code is up to date (`git pull` done)
- [ ] npm packages installed
- [ ] Migrations run successfully
- [ ] Server starts without errors
- [ ] Browser shows API at http://localhost:5000

---

## 🎯 NEXT STEPS

Once everything is running:

1. **Test the API** - Use the test accounts to login
2. **Explore the endpoints** - Check README.md for API documentation
3. **Start developing** - Make your changes
4. **Have fun!** 🎉

---

**Need more help?**
- Check `LAPTOP_SETUP_GUIDE.md` for detailed setup
- Check `QUICK_START.md` for command reference
- Check `RESTART_GUIDE.md` for system restart info

---

*Last Updated: 2026-02-25*
*For: Windows Users Having Database Connection Issues*
