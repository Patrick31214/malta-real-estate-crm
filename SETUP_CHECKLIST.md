# ✅ Setup Checklist - Malta Real Estate CRM

Use this checklist to track your progress. Check off each item as you complete it.

---

## 📋 Pre-Installation Checklist

- [ ] I have a laptop with Windows, Mac, or Linux
- [ ] I have internet connection
- [ ] I have administrator/sudo access on my computer
- [ ] I know my Windows username (if on Windows)

---

## 🔧 Prerequisites Installation

### Node.js & npm
- [ ] Downloaded Node.js from https://nodejs.org/
- [ ] Installed Node.js (LTS version)
- [ ] Opened terminal/command prompt
- [ ] Verified: `node --version` shows a version (like v20.x.x)
- [ ] Verified: `npm --version` shows a version (like 10.x.x)

### Git
- [ ] Downloaded Git (https://git-scm.com/downloads)
- [ ] Installed Git
- [ ] Verified: `git --version` shows a version

### PostgreSQL
- [ ] Downloaded PostgreSQL from https://www.postgresql.org/download/
- [ ] Installed PostgreSQL
- [ ] **Wrote down my PostgreSQL password:** ________________
- [ ] Kept default port: 5432
- [ ] Can open pgAdmin OR SQL Shell (psql)

---

## 📁 Project Setup

### Getting the Code
- [ ] Opened terminal/command prompt
- [ ] Navigated to Documents folder
  - Windows: `cd C:\Users\YourUsername\Documents`
  - Mac/Linux: `cd ~/Documents`
- [ ] Cloned repository: `git clone https://github.com/Patrick31214/malta-real-estate-crm.git`
- [ ] Changed to project directory: `cd malta-real-estate-crm`
- [ ] Listed files to verify (dir on Windows, ls on Mac/Linux)
- [ ] Saw package.json, src folder, tests folder

### Installing Dependencies
- [ ] Ran: `npm install`
- [ ] Waited for installation to complete (1-2 minutes)
- [ ] Saw: "added XXX packages"
- [ ] No major errors appeared

---

## ⚙️ Configuration

### Environment File
- [ ] Created .env file from example
  - Windows: `copy .env.example .env`
  - Mac/Linux: `cp .env.example .env`
- [ ] Opened .env file in editor
  - Windows: `notepad .env`
  - Mac/Linux: `nano .env` or `code .env`
- [ ] Updated DB_PASSWORD with my PostgreSQL password
- [ ] Verified PORT=5000
- [ ] Verified DB_NAME=malta_crm
- [ ] Saved and closed the file

---

## 🗄️ Database Setup

### Creating Database
- [ ] Opened PostgreSQL
  - Option A: Opened pgAdmin
  - Option B: Opened SQL Shell (psql)
- [ ] Entered my PostgreSQL password (if asked)
- [ ] Created database malta_crm
  - pgAdmin: Right-click Databases → Create → Database → Name: malta_crm
  - SQL Shell: `CREATE DATABASE malta_crm;`
- [ ] Saw confirmation message
- [ ] Closed pgAdmin/SQL Shell

### Running Migrations
- [ ] Made sure I'm in malta-real-estate-crm directory
- [ ] Ran: `npm run db:migrate`
- [ ] Saw migrations running (20240101000000-create-users, etc.)
- [ ] All migrations completed successfully
- [ ] No errors appeared

### Seeding Test Data
- [ ] Ran: `npm run db:seed`
- [ ] Saw seeders running
- [ ] All seeders completed
- [ ] No errors appeared

---

## 🚀 Starting the Server

### First Run
- [ ] Made sure I'm in malta-real-estate-crm directory
- [ ] Ran: `npm start`
- [ ] Saw: "✓ PostgreSQL database connection established successfully"
- [ ] Saw: "✓ Server is running on port 5000"
- [ ] No errors appeared
- [ ] **Left this terminal window open** (don't close it!)

---

## ✅ Verification

### Browser Test
- [ ] Opened web browser
- [ ] Went to: http://localhost:5000
- [ ] Saw JSON response with "success": true
- [ ] Went to: http://localhost:5000/health
- [ ] Saw health check response

### API Test (Optional)
- [ ] Opened **NEW** terminal/command prompt window
- [ ] Tested login with curl command
- [ ] Received success response with token

---

## 🎯 Final Checks

### System Ready
- [ ] Server is running (terminal shows "Server is running on port 5000")
- [ ] Browser shows API at http://localhost:5000
- [ ] Health check passes at http://localhost:5000/health
- [ ] Can login with test account: admin@maltarealestate.com / Password123!

### Documentation Review
- [ ] Bookmarked LAPTOP_SETUP_GUIDE.md for detailed instructions
- [ ] Bookmarked QUICK_START.md for daily use
- [ ] Bookmarked README.md for API documentation
- [ ] Bookmarked this checklist for next time

---

## 📝 My Notes

**My PostgreSQL Password:** ________________

**Project Location:** 
- Windows: C:\Users\____________\Documents\malta-real-estate-crm
- Mac/Linux: /Users/____________/Documents/malta-real-estate-crm

**Date Completed:** ________________

**Issues I Encountered:**
1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

**How I Fixed Them:**
1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

---

## 🔄 Daily Startup Procedure

For next time, just do these steps:

- [ ] Open terminal/command prompt
- [ ] Navigate to project: `cd ~/Documents/malta-real-estate-crm`
- [ ] Start server: `npm start`
- [ ] Open browser to http://localhost:5000
- [ ] Start working! 🎉

---

## 🆘 If Something Goes Wrong

**Read these guides in order:**

1. **QUICK_START.md** - Essential commands only
2. **LAPTOP_SETUP_GUIDE.md** - Detailed troubleshooting
3. **README.md** - API documentation
4. **SESSION_SUMMARY.md** - Technical details

**Common problems:**
- ❌ Database error → Check DB_PASSWORD in .env
- ❌ Port in use → Something already using port 5000
- ❌ Module not found → Run `npm install`
- ❌ Can't find postgres → PostgreSQL not started

---

## ✨ Success!

If you checked all boxes above, **congratulations!** 🎉

Your Malta Real Estate CRM is fully set up and ready to use!

**What you can do now:**
- Test the API endpoints
- Log in with test accounts
- Add new properties
- Explore the codebase
- Start developing features

---

**Checklist Version:** 1.0  
**Created:** 2026-02-25  
**For:** Malta Real Estate CRM
