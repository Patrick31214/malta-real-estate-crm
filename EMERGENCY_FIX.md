# 🚨 EMERGENCY FIX - Read This First!

## Your Exact Problem and Solution

You're experiencing **THREE separate issues** that are confusing you. Let me explain clearly:

---

## 🔴 CRITICAL UNDERSTANDING

### The Port Confusion (MAIN ISSUE!)

**You have TWO different things running on TWO different ports:**

1. **PostgreSQL Database** → Runs on **Port 5432** (or 5433 for version 18)
2. **Malta CRM Application** → Runs on **Port 5000**

**❌ YOU ARE TRYING TO CONNECT pgAdmin TO PORT 5000 - THIS IS WRONG!**

pgAdmin needs to connect to PostgreSQL on port **5432** or **5433**, NOT port 5000!

---

## 🎯 IMMEDIATE FIX - Follow These Steps

### STEP 1: Find Your PostgreSQL Service Name

PostgreSQL 18 has a different service name. Open **Administrator Command Prompt** and run:

```cmd
sc query | findstr /i "postgres"
```

Look for a service name like:
- `postgresql-x64-18`
- `PostgreSQL-18`
- `postgresql-18`

**Write down the exact service name you see!**

### STEP 2: Start PostgreSQL Service

Use the EXACT service name from Step 1:

```cmd
net start postgresql-x64-18
```

(Replace `postgresql-x64-18` with YOUR actual service name)

### STEP 3: Configure pgAdmin 4 CORRECTLY

**❌ WRONG (What you're doing now):**
- Host: localhost
- Port: 5000 ← THIS IS THE APP PORT, NOT DATABASE!

**✅ CORRECT (What you should do):**

1. Open pgAdmin 4
2. Right-click "Servers" → Create → Server
3. **General Tab:**
   - Name: Malta CRM Database (or any name)
4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432` ← **NOT 5000!**
   - Database: `malta_crm`
   - Username: `postgres`
   - Password: YOUR_POSTGRES_PASSWORD

**If port 5432 doesn't work, try port 5433** (PostgreSQL 18 sometimes uses 5433)

### STEP 4: Navigate to Correct Directory

You're in `C:\Windows\system32` - you need to be in your project folder!

```cmd
cd C:\Users\USER\malta-crm\malta-real-estate-crm
```

### STEP 5: Start the Application

```cmd
npm start
```

This will start the **application** on port 5000 (NOT the database)

---

## 📊 Visual Explanation

```
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  - Port: 5432 or 5433                   │
│  - Connect with: pgAdmin 4              │
│  - Service: postgresql-x64-18           │
└─────────────────────────────────────────┘
              ↑
              │ Connects to
              │
┌─────────────────────────────────────────┐
│  Malta CRM Application                  │
│  - Port: 5000                           │
│  - Connect with: Web Browser            │
│  - Start with: npm start                │
└─────────────────────────────────────────┘
```

---

## 🔧 Complete Solution - Step by Step

### Part A: Fix PostgreSQL Connection

**1. Open Administrator Command Prompt**
- Windows Key → Type "cmd"
- Right-click "Command Prompt"
- Click "Run as administrator"

**2. Find PostgreSQL Service Name**
```cmd
sc query | findstr /i "postgres"
```

**3. Start PostgreSQL (use YOUR service name)**
```cmd
net start postgresql-x64-18
```

Expected output:
```
The postgresql-x64-18 service is starting.
The postgresql-x64-18 service was started successfully.
```

**4. Verify PostgreSQL is Running**
```cmd
sc query postgresql-x64-18
```

Look for: `STATE: 4 RUNNING`

### Part B: Fix pgAdmin 4 Connection

**1. Open pgAdmin 4**

**2. If you already have a server configured:**
- Right-click on your server → Properties
- Go to Connection tab
- Change Port from `5000` to `5432`
- Click Save
- Try connecting again

**3. If no server configured:**
- Right-click "Servers" → Create → Server
- General Tab: Name = "Malta CRM"
- Connection Tab:
  - Host = `localhost`
  - Port = `5432`
  - Database = `malta_crm`
  - Username = `postgres`
  - Password = [your postgres password]
- Click Save

**4. Test Connection**
- Click on the server name
- If it connects → SUCCESS! ✅
- If it fails with port error, try port `5433` instead of `5432`

### Part C: Start Your Application

**1. Open Regular Command Prompt** (not Administrator)

**2. Navigate to Project**
```cmd
cd C:\Users\USER\malta-crm\malta-real-estate-crm
```

**3. Verify You're in Right Place**
```cmd
dir package.json
```

You should see `package.json` listed

**4. Start the Application**
```cmd
npm start
```

**5. Verify Success**
- Open browser
- Go to: http://localhost:5000
- You should see the API response

---

## 🆘 Troubleshooting

### Error: "The service name is invalid"

**Cause:** You're using the wrong service name

**Solution:**
```cmd
sc query | findstr /i "postgres"
```

Use the EXACT name shown. Common variations:
- `postgresql-x64-18`
- `postgresql-18`
- `PostgreSQL-18`
- `postgresql`

### Error: "connection timeout expired" in pgAdmin

**Cause 1:** Using port 5000 instead of 5432

**Solution:** Change port to 5432 in pgAdmin connection settings

**Cause 2:** PostgreSQL service not running

**Solution:** Start the service (see Part A above)

**Cause 3:** Wrong password

**Solution:** Check your .env file:
```cmd
notepad C:\Users\USER\malta-crm\malta-real-estate-crm\.env
```
Look for `DB_PASSWORD=` - this is your PostgreSQL password

### Error: "Could not read package.json" when running npm start

**Cause:** You're in the wrong directory

**Current location:** `C:\Windows\system32`
**Needed location:** `C:\Users\USER\malta-crm\malta-real-estate-crm`

**Solution:**
```cmd
cd C:\Users\USER\malta-crm\malta-real-estate-crm
npm start
```

### PostgreSQL Running on Port 5433 Instead of 5432

**Why:** PostgreSQL 18 sometimes uses 5433 when 5432 is taken

**Check in pgAdmin:** Change port from 5432 to 5433

**Check in .env file:**
```cmd
notepad .env
```
Change: `DB_PORT=5432` to `DB_PORT=5433`

---

## 📋 Quick Checklist

Use this to verify everything:

- [ ] PostgreSQL service is running
  ```cmd
  sc query postgresql-x64-18
  ```

- [ ] pgAdmin connects successfully
  - Port: 5432 (or 5433)
  - NOT port 5000!

- [ ] In correct directory
  ```cmd
  cd C:\Users\USER\malta-crm\malta-real-estate-crm
  ```

- [ ] .env file has correct database password

- [ ] Application starts without errors
  ```cmd
  npm start
  ```

- [ ] Can access http://localhost:5000 in browser

---

## 🎓 Understanding the Difference

### Port 5000 = Application Server
- This is your Node.js/Express web application
- Start with: `npm start`
- Access in browser: http://localhost:5000
- This is what users/developers connect to

### Port 5432/5433 = Database Server
- This is your PostgreSQL database
- Start with: `net start postgresql-x64-18`
- Access with: pgAdmin 4
- This is what the APPLICATION connects to (not users directly)

**The application (port 5000) talks to the database (port 5432), then serves data to users.**

```
User Browser
    ↓
Port 5000 (Application)
    ↓
Port 5432 (Database)
```

---

## 🚀 After You Fix This

Once everything is working:

**Daily Startup:**
1. Start PostgreSQL:
   ```cmd
   net start postgresql-x64-18
   ```

2. Go to project and start app:
   ```cmd
   cd C:\Users\USER\malta-crm\malta-real-estate-crm
   npm start
   ```

**Or use the automated script:**
```cmd
cd C:\Users\USER\malta-crm\malta-real-estate-crm
start-windows.bat
```

---

## 📞 Still Stuck?

If you're still having issues, check:

1. **PostgreSQL version:** `psql --version` (in cmd)
2. **Service name:** `sc query | findstr postgres`
3. **Port in use:** `netstat -ano | findstr :5432`
4. **.env file:** `notepad .env` - check DB_PORT value

**Most common fix:** Change pgAdmin port from 5000 to 5432! 🎯
