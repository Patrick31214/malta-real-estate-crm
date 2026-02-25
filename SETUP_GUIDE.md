# 🏖️ Malta Real Estate CRM — Complete Setup Guide

> **Who this guide is for:** Someone setting up this CRM for the first time — no programming experience needed. Follow every step in order and you'll have a running system that you and your agents can access.

---

## 📋 What You'll End Up With

By the end of this guide you will have:

- ✅ A **backend server** that stores all your data (properties, owners, agents)
- ✅ A **web interface** running in your browser where you and your agents can log in
- ✅ An **online version** hosted on the internet (free), accessible from anywhere
- ✅ Individual **agent accounts** your team can use to log in

Estimated time: **30–60 minutes** on first setup.

---

## 🗂️ Table of Contents

1. [Install the Required Tools](#1-install-the-required-tools)
2. [Download the Project Code](#2-download-the-project-code)
3. [Set Up the Database](#3-set-up-the-database)
4. [Configure the Project](#4-configure-the-project)
5. [Install Project Dependencies](#5-install-project-dependencies)
6. [Create Your Admin Account](#6-create-your-admin-account)
7. [Run the CRM on Your Computer](#7-run-the-crm-on-your-computer)
8. [Deploy Online (so agents can access it)](#8-deploy-online-so-agents-can-access-it)
9. [Add Agent Accounts](#9-add-agent-accounts)
10. [Day-to-Day Usage](#10-day-to-day-usage)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Install the Required Tools

You need three pieces of software on your computer. Install them in this order.

### 1.1 — Node.js (the runtime that runs the server)

1. Go to **https://nodejs.org/**
2. Click the **LTS** button (the one that says "Recommended for most users")
3. Run the installer and click Next through all the steps
4. When done, open a terminal (see below) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`. If you do, ✅ Node.js is installed.

> **How to open a terminal:**
> - **Windows:** Press `Win + R`, type `cmd`, press Enter
> - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
> - **Linux:** Right-click desktop → "Open Terminal"

---

### 1.2 — PostgreSQL (the database)

1. Go to **https://www.postgresql.org/download/**
2. Click your operating system
3. Download and run the installer
4. During installation you will be asked to **set a password for the postgres user** — write this down, you'll need it later
5. Leave the port as **5432** (the default)
6. Finish the installation

To verify, open a terminal and type:
```
psql --version
```
You should see something like `psql (PostgreSQL) 16.x`. ✅

> **Windows users:** If `psql` is not found, you need to add it to your PATH. Look for "PostgreSQL 16\bin" in your Program Files and add it to the system PATH, or just search "pgAdmin" in your Start menu — that's a visual tool that comes with PostgreSQL.

---

### 1.3 — Git (to download the project)

1. Go to **https://git-scm.com/downloads**
2. Download and install for your operating system
3. Verify:
   ```
   git --version
   ```
   You should see something like `git version 2.43.0`. ✅

---

## 2. Download the Project Code

Open a terminal and run these two commands one at a time:

```bash
git clone https://github.com/Patrick31214/malta-real-estate-crm.git
```

```bash
cd malta-real-estate-crm
```

After running these, your terminal should now show the project folder name. You can verify by running:
```bash
ls
```
You should see files like `package.json`, `README.md`, `.env.example`, etc. ✅

---

## 3. Set Up the Database

### 3.1 — Create the database

**On Windows (using Command Prompt):**
```cmd
psql -U postgres -c "CREATE DATABASE malta_crm;"
```
Enter your PostgreSQL password when prompted.

**On Mac/Linux:**
```bash
psql -U postgres -c "CREATE DATABASE malta_crm;"
```
If that doesn't work on Linux, try:
```bash
sudo -u postgres psql -c "CREATE DATABASE malta_crm;"
```

You should see `CREATE DATABASE`. ✅

> If you get an error like "role postgres does not exist", your PostgreSQL user might have a different name. Try replacing `postgres` with your computer username.

---

## 4. Configure the Project

### 4.1 — Create your configuration file

The project needs a `.env` file that contains your database password and security keys.

**On Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**On Mac/Linux:**
```bash
cp .env.example .env
```

### 4.2 — Edit the configuration file

Open the `.env` file with a text editor (Notepad on Windows, TextEdit on Mac, or VS Code if installed).

You'll see:

```
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=malta_crm
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLIENT_URL=http://localhost:3000
```

**Make these changes:**

1. Replace `your_password_here` with the PostgreSQL password you set during installation.

2. Replace **both** JWT secret lines with long random strings. The easiest way is to run this command in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run it **twice** to get two different strings (one for each secret).

   Example of what it should look like after editing:
   ```
   JWT_SECRET=a3f9d2e8c1b4a7f0e5d2c8b1a4f7e0d3c6b9a2f5e8d1c4b7a0f3e6d9c2b5a8f1
   JWT_REFRESH_SECRET=b5e2d8a1c4f7e0d3c6b9a2f5e8d1c4b7a0f3e6d9c2b5a8f1e4d7c0b3a6f9e2d5
   ```

3. Save the file.

> ⚠️ **Never share your `.env` file with anyone and never upload it to GitHub.** It contains your passwords and security keys.

---

## 5. Install Project Dependencies

Still in the project folder in your terminal, run:

```bash
npm install
```

This downloads all the code libraries the project needs. It will take 1–2 minutes. You'll see a lot of text scrolling — that's normal.

Then install the frontend dependencies:

```bash
npm run client:install
```

Wait for both to finish. ✅

---

## 6. Create Your Admin Account

This is a one-time setup step that creates your personal admin account.

Make sure your database is running (PostgreSQL starts automatically on most computers), then run:

```bash
npm run setup:admin
```

You will be asked for:
- Your first name
- Your last name  
- Your email address ← **this is your login email**
- A password ← **at least 8 characters**

Example session:
```
================================================
  🏖️  Malta Real Estate CRM — Admin Setup
================================================

✓ Connected to database.

Your first name: Patrick
Your last name:  Borg
Your email:      patrick@myagency.mt
Choose a password (min 8 chars): ••••••••••

================================================
  ✅  Admin account created successfully!
================================================

  Name:  Patrick Borg
  Email: patrick@myagency.mt
  Role:  admin
```

Write down your email and password — you'll use these to log in. ✅

---

## 7. Run the CRM on Your Computer

You need **two terminal windows open at the same time** — one for the backend server, one for the frontend.

### Terminal 1 — Start the backend server

```bash
npm run dev
```

You should see:
```
✓ PostgreSQL database connection established successfully.
✓ Database models synchronized.
✓ Server is running on port 3001
```

**Leave this terminal running.** Don't close it.

### Terminal 2 — Start the frontend (open a second terminal window)

Navigate back to the project folder first, then:

```bash
npm run client:dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:3000/
```

**Leave this terminal running too.**

### Open the CRM in your browser

Go to: **http://localhost:3000**

You should see the login page. Log in with the email and password you created in Step 6. ✅

> 💡 **Bookmark http://localhost:3000** — this is where you access the CRM whenever you're working on your own computer.

---

## 8. Deploy Online (so agents can access it)

"Deploying online" means putting the CRM on a server on the internet so you and your agents can access it from any computer, anywhere, not just your own machine.

We'll use **Railway.app** — it's free to start, requires no credit card, and is the easiest option for beginners.

### 8.1 — Create a Railway account

1. Go to **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign up with your GitHub account (if you don't have one, create one free at https://github.com)

### 8.2 — Push your code to GitHub

If the code is already on GitHub (which it is, since you cloned it), skip to 8.3.

If you made changes and want to save them:
```bash
git add .
git commit -m "My configuration"
git push
```

### 8.3 — Deploy the Backend on Railway

1. In Railway, click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select **`malta-real-estate-crm`**
4. Railway will detect it's a Node.js app

Now add the environment variables (same as your `.env` file):

1. Click on your deployed service
2. Go to the **"Variables"** tab
3. Add each variable from your `.env` file:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `DB_HOST` | *(see Step 8.4)* |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `malta_crm` |
   | `DB_USER` | *(see Step 8.4)* |
   | `DB_PASSWORD` | *(see Step 8.4)* |
   | `JWT_SECRET` | *(same as your .env)* |
   | `JWT_REFRESH_SECRET` | *(same as your .env)* |
   | `JWT_EXPIRE` | `15m` |
   | `JWT_REFRESH_EXPIRE` | `7d` |
   | `CLIENT_URL` | *(your frontend URL — set this after deploying frontend)* |

### 8.4 — Add a PostgreSQL Database on Railway

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates a managed PostgreSQL database automatically
3. Click on the database, go to **"Variables"**
4. Copy these values and use them in your backend's variables:
   - `PGHOST` → use as `DB_HOST`
   - `PGPORT` → use as `DB_PORT`
   - `PGDATABASE` → use as `DB_NAME`
   - `PGUSER` → use as `DB_USER`
   - `PGPASSWORD` → use as `DB_PASSWORD`

### 8.5 — Run Migrations on the Online Database

After the backend deploys, you need to set up the database tables. In Railway:

1. Click on your backend service
2. Go to **"Settings"** → **"Deploy"**
3. Add a **"Start Command"**: `npm run db:migrate && npm start`

Or alternatively, go to the Railway shell and run:
```bash
npm run db:migrate
```

### 8.6 — Deploy the Frontend on Railway (or Netlify)

**Option A — Serve frontend from the backend (simplest)**

The backend already serves the built frontend in production mode. Just run:

```bash
npm run client:build
```

This creates a `client/dist` folder. Commit and push it:
```bash
git add client/dist
git commit -m "Add built frontend"
git push
```

Railway will automatically redeploy. Your entire CRM (frontend + backend) will be at the Railway URL shown on your dashboard.

**Option B — Deploy frontend separately on Netlify (recommended for speed)**

1. Go to **https://www.netlify.com/** and sign up (free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub, select `malta-real-estate-crm`
4. Set:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
5. Add an environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g., `https://malta-crm-production.up.railway.app`)
6. Deploy

After deploying, go back to Railway and update `CLIENT_URL` to your Netlify URL.

### 8.7 — Create your online admin account

Once your backend is online, run this from your local machine (updating the URL):

```bash
curl -X POST https://YOUR-RAILWAY-URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"patrick@youragency.mt","password":"YourPassword","firstName":"Patrick","lastName":"Borg","role":"admin"}'
```

Or you can use Postman:
- **POST** `https://YOUR-RAILWAY-URL/api/auth/register`
- Body: `{ "email": "...", "password": "...", "firstName": "...", "lastName": "...", "role": "admin" }`

---

## 9. Add Agent Accounts

Once you're logged into the CRM as admin, you can add accounts for your agents directly through the API. Future versions will include an in-app "Users" management page, but for now use one of these two methods:

### Method A — Using the CRM's register endpoint (from the terminal)

For each agent, run this command (replace the values):

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@youragency.mt",
    "password": "AgentPassword123",
    "firstName": "Maria",
    "lastName": "Borg",
    "role": "agent"
  }'
```

For the **online version**, replace `http://localhost:3001` with your Railway URL.

### Method B — Using Postman (visual tool, no command line needed)

1. Download Postman free from **https://www.postman.com/downloads/**
2. Create a new request:
   - Method: **POST**
   - URL: `http://localhost:3001/api/auth/register` (or your Railway URL)
   - Go to **Body** → **raw** → **JSON**
   - Paste:
     ```json
     {
       "email": "agent@youragency.mt",
       "password": "AgentPassword123",
       "firstName": "Maria",
       "lastName": "Borg",
       "role": "agent"
     }
     ```
3. Click **Send**

### Sharing access with agents

Once an account is created, share with your agent:
- The CRM URL (e.g., `https://your-crm.netlify.app` or Railway URL)
- Their email
- Their password (tell them to change it after first login — currently done by logging out and registering again with the same email won't work; they need to keep the password you give them)

---

## 10. Day-to-Day Usage

### Starting the CRM on your computer

Every time you want to use the CRM on your own machine, open **two terminals** and run:

**Terminal 1:**
```bash
cd malta-real-estate-crm
npm run dev
```

**Terminal 2:**
```bash
cd malta-real-estate-crm
npm run client:dev
```

Then go to **http://localhost:3000** in your browser.

### What you can do in the CRM

| Feature | Where |
|---------|-------|
| Add/view/edit/delete properties | Properties page |
| Add/view/edit/delete owners | Owners page |
| See a summary of everything | Dashboard |
| Log out | Bottom-left of sidebar |

### Adding data

1. **Add an owner first** — every property must have an owner. Go to Owners → click "Add Owner"
2. **Then add the property** — go to Properties → click "Add Property" — choose the owner from the dropdown

---

## 11. Troubleshooting

### ❌ "Cannot connect to database"

**Cause:** PostgreSQL is not running, or the password in `.env` is wrong.

**Fix:**
- Windows: Search "Services" in Start menu, find "postgresql-x64-16" and click Start
- Mac: Run `brew services start postgresql@16`
- Linux: Run `sudo systemctl start postgresql`
- Double-check `DB_PASSWORD` in your `.env` matches your PostgreSQL password

---

### ❌ "Port 3001 already in use"

**Cause:** Another program is using port 3001.

**Fix:** Change `PORT=3001` to `PORT=3002` in your `.env` file. Then also update `vite.config.js` to proxy to the same port.

---

### ❌ The browser shows a blank page or can't connect

**Cause:** The backend or frontend server isn't running.

**Fix:** Make sure both terminals are running (`npm run dev` and `npm run client:dev`). If a terminal shows an error, read the error message — it usually tells you exactly what's wrong.

---

### ❌ "module not found" or install errors

**Fix:**
```bash
rm -rf node_modules
npm install
npm run client:install
```

---

### ❌ I forgot my admin password

**Fix:** Run the admin setup script again with a different email to create a second admin:
```bash
npm run setup:admin
```

---

### ❌ The database says "relation does not exist"

**Cause:** Migrations haven't been run.

**Fix:**
```bash
npm run db:migrate
```

---

## 🎉 You're Done!

Your Malta Real Estate CRM is now:
- Running locally at **http://localhost:3000**
- (After Step 8) Available online for your agents

**Quick reference — commands you'll use regularly:**

| What | Command |
|------|---------|
| Start backend | `npm run dev` |
| Start frontend | `npm run client:dev` |
| Create admin account | `npm run setup:admin` |
| Update database structure | `npm run db:migrate` |
| Reset database (⚠️ deletes all data) | `npm run db:reset` |

---

*For technical questions, open an issue at https://github.com/Patrick31214/malta-real-estate-crm/issues*
