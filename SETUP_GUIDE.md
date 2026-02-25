# 🏖️ Malta Real Estate CRM — Complete Setup Guide

> **Who this guide is for:** Someone setting up this CRM for the first time on **Windows** — no programming experience needed. Follow every step in order and you'll have a running system that you and your agents can access.
>
> Mac/Linux commands are shown where they differ.

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
3. Run the installer — click **Next** through all the steps, leave all defaults
4. When done, open a **Command Prompt** (press `Win + R`, type `cmd`, press Enter) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`. ✅

---

### 1.2 — PostgreSQL (the database)

1. Go to **https://www.postgresql.org/download/windows/**
2. Click **"Download the installer"** (from EDB)
3. Download the latest version and run it
4. During installation:
   - When asked for a **password** — write it down, you'll need it later. Use something you'll remember, e.g. `postgres123`
   - Leave the port as **5432**
   - Leave everything else as default
5. Finish the installation

To verify, open a **new** Command Prompt and type:
```
psql --version
```

> **If `psql` is not found on Windows:** The PostgreSQL folder is not in your PATH yet.
>
> **Quick fix:**
> 1. Press `Win`, search for **"Edit the system environment variables"**, open it
> 2. Click **"Environment Variables..."**
> 3. Under **"System variables"**, find **Path**, click **Edit**
> 4. Click **New** and add: `C:\Program Files\PostgreSQL\16\bin`
>    (replace `16` with your installed version number)
> 5. Click OK everywhere, then **close and reopen** your Command Prompt
> 6. Try `psql --version` again

---

### 1.3 — Git (to download the project)

1. Go to **https://git-scm.com/download/win**
2. Download and run the installer — click Next through all steps, leave all defaults
3. Open a **new** Command Prompt and verify:
   ```
   git --version
   ```
   You should see something like `git version 2.43.0`. ✅

---

## 2. Download the Project Code

Open a Command Prompt and navigate to where you want to keep the project. For example:

```
cd %USERPROFILE%\malta-crm
```

> If that folder doesn't exist yet, create it first: `mkdir %USERPROFILE%\malta-crm && cd %USERPROFILE%\malta-crm`

Then run:

```
git clone https://github.com/Patrick31214/malta-real-estate-crm.git
```

Wait for it to finish, then enter the project folder:

```
cd malta-real-estate-crm
```

To confirm you're in the right place, run:

```
dir
```

> ⚠️ **Windows note:** Use `dir` (not `ls`) to list files. `ls` is a Mac/Linux command.

You should see files like `package.json`, `README.md`, `.env.example`, etc. ✅

### ⚡ If you already cloned the project earlier — get the latest version first!

If you already ran `git clone` before, your copy of the code may be outdated. Always run this from inside the project folder before starting:

```
git pull
```

This downloads any updates. After pulling, run `npm install` and then install the frontend dependencies with the steps in Section 5.

> **If `git pull` says "local changes to the following files would be overwritten":**
>
> This happens when you already ran `npm install`, which modifies `package-lock.json`. Discard that change, then pull again:
> ```
> git checkout -- package-lock.json
> git pull
> ```

---

## 3. Set Up the Database

### 3.1 — Create the database

In your Command Prompt (still in the project folder), run:

```
psql -U postgres -c "CREATE DATABASE malta_crm;"
```

You'll be asked for your PostgreSQL password (the one you wrote down in Step 1.2). Type it and press Enter — **you won't see the characters as you type, that's normal**.

You should see:
```
CREATE DATABASE
```
✅

> **If it says "psql is not recognized":** Go back to Step 1.2 and add PostgreSQL to your PATH.

> **If it says "FATAL: role postgres does not exist":** During installation your PostgreSQL user might have been named differently. Check pgAdmin (installed with PostgreSQL) to see the username.

---

## 4. Configure the Project

### 4.1 — Create your configuration file

In your Command Prompt (inside the project folder), run:

**Windows:**
```
copy .env.example .env
```

**Mac/Linux:**
```
cp .env.example .env
```

### 4.2 — Edit the configuration file

Open the `.env` file in Notepad:

```
notepad .env
```

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

**Make these three changes:**

**Change 1:** Replace `your_password_here` with your PostgreSQL password from Step 1.2.

**Change 2 & 3:** Replace the two JWT secret lines with long random strings.  
Run this command in your Command Prompt to generate one:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run it **twice** and copy each result into `JWT_SECRET` and `JWT_REFRESH_SECRET`.

Example of what it should look like after editing:
```
DB_PASSWORD=postgres123

JWT_SECRET=a3f9d2e8c1b4a7f0e5d2c8b1a4f7e0d3c6b9a2f5e8d1c4b7a0f3e6d9c2b5a8f1
JWT_REFRESH_SECRET=b5e2d8a1c4f7e0d3c6b9e2d5c8b1a4f7e0d3c6b9a2f5e8d1c4b7a0f3e6d9c2b5
```

**Save the file:** Press `Ctrl + S`, then close Notepad.

> ⚠️ Never share your `.env` file with anyone. It contains your passwords and security keys.

---

## 5. Install Project Dependencies

> ⚠️ **Run every command below from inside the `malta-real-estate-crm` folder.**
> If you're not sure where you are, paste this into your Command Prompt first:
> ```
> cd %USERPROFILE%\malta-crm\malta-real-estate-crm
> ```
> You should see `package.json` when you run `dir`.

**Easiest option — double-click the startup script:**

If you just want to install everything and get started, double-click **`start-windows.bat`** in the project folder. It will handle the rest and tell you what to do next.

Otherwise, continue manually below.

---

**First, get the latest code updates:**
```
cd %USERPROFILE%\malta-crm\malta-real-estate-crm
git pull
```

> **If `git pull` says "local changes to the following files would be overwritten":**
>
> Running `npm install` earlier modified `package-lock.json`. Discard that local change, then pull again:
> ```
> git checkout -- package-lock.json
> git pull
> ```

**Install backend dependencies:**
```
npm install
```

You'll see a lot of text — that's normal. Wait for it to finish.

**Install frontend dependencies:**
```
cd client
npm install
cd ..
```

> **Shortcut (if available):** `npm run client:install` does the same thing.

Wait for both installs to finish. ✅

---

## 6. Create Your Admin Account

This is a one-time step that creates your personal admin login.

Make sure your Command Prompt is in the project folder, then run:

```
npm run setup:admin
```

You will be asked for:
- Your first name
- Your last name
- Your email address ← **this is your login email**
- A password ← **at least 8 characters**

Example:
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

> **If you see a database connection error:** Make sure PostgreSQL is running. Go to Step 11 (Troubleshooting) → "Cannot connect to database".

---

## 7. Run the CRM on Your Computer

**Easiest option — just double-click `start-windows.bat`** in the project folder. It installs everything, shows you the command to open the frontend in a second window, then starts the backend server automatically. Skip to step 7c below.

If you prefer to start things manually, follow 7a and 7b.

### 7a — Start the backend server (Window 1)

In a Command Prompt **inside the project folder**:

```
cd %USERPROFILE%\malta-crm\malta-real-estate-crm
npm run dev
```

You should see:
```
✓ PostgreSQL database connection established successfully.
✓ Server is running on port 3001
```

**Leave this window running.** Don't close it.

### 7b — Start the frontend (Window 2)

Open a **second** Command Prompt:
1. Press `Win + R`, type `cmd`, press Enter
2. Navigate to the project folder:
   ```
   cd %USERPROFILE%\malta-crm\malta-real-estate-crm
   ```
3. Run:
   ```
   npm run client:dev
   ```

You should see:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:3000/
```

**Leave this window running too.**

### 7c — Open the CRM in your browser

Open your web browser and go to:

**http://localhost:3000**

You should see the login page. Log in with the email and password you created in Step 6. ✅

> 💡 **Bookmark http://localhost:3000** — this is where you access the CRM whenever you're working on your own computer.

---

## 8. Deploy Online (so agents can access it from anywhere)

"Deploying online" means putting the CRM on a server so you and your agents can access it from any computer, not just yours.

We'll use **Railway.app** — free to start, no credit card needed.

### 8.1 — Create accounts

1. Create a free GitHub account at **https://github.com** (if you don't have one)
2. Go to **https://railway.app/** and sign up with your GitHub account

### 8.2 — Fork the repository to your own GitHub

So Railway can deploy YOUR version of the code:

1. Go to **https://github.com/Patrick31214/malta-real-estate-crm**
2. Click the **"Fork"** button (top-right of the page)
3. Click **"Create fork"**

Now you have your own copy at `https://github.com/YOUR-USERNAME/malta-real-estate-crm`.

### 8.3 — Deploy on Railway

1. Go to **https://railway.app/dashboard**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your forked repo (`YOUR-USERNAME/malta-real-estate-crm`)
4. Railway will start deploying automatically

### 8.4 — Add a Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creates the database automatically

### 8.5 — Set Environment Variables

1. Click on your **backend service** (not the database)
2. Go to the **"Variables"** tab
3. Add these one by one (click **"+ New Variable"** for each):

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `JWT_SECRET` | *(same value as in your `.env` file)* |
   | `JWT_REFRESH_SECRET` | *(same value as in your `.env` file)* |
   | `JWT_EXPIRE` | `15m` |
   | `JWT_REFRESH_EXPIRE` | `7d` |

4. Now click on the **PostgreSQL database** you added, go to its **"Variables"** tab, and copy these into your backend service variables:
   - `PGHOST` → copy value and paste as `DB_HOST`
   - `PGPORT` → copy value and paste as `DB_PORT`
   - `PGDATABASE` → copy value and paste as `DB_NAME`
   - `PGUSER` → copy value and paste as `DB_USER`
   - `PGPASSWORD` → copy value and paste as `DB_PASSWORD`

5. Set `CLIENT_URL` to your Railway backend URL (found on the **"Settings"** tab of your service)

### 8.6 — Run Database Migrations Online

1. In Railway, click on your backend service
2. Click the **"Deploy"** tab → find **"Custom Start Command"**
3. Change it to:
   ```
   npm run db:migrate && npm start
   ```
4. Click **Save** — Railway will redeploy with migrations running first

### 8.7 — Build and Serve the Frontend

The backend already serves the built frontend in production. Run this in your local Command Prompt:

```
npm run client:build
```

This creates a `client\dist` folder. Then push it to GitHub:

```
git add .
git commit -m "Add built frontend"
git push
```

> **First time pushing?** You'll need to configure git with your GitHub credentials.  
> Run these (replace with your info):
> ```
> git config --global user.email "you@example.com"
> git config --global user.name "Your Name"
> ```
> Then push will ask for your GitHub username and password (use a Personal Access Token as password — create one at https://github.com/settings/tokens).

Railway detects the push and redeploys automatically. Your CRM is now live at the Railway URL! ✅

### 8.8 — Create your admin account on the live server

Once Railway is running, use the URL shown in your Railway dashboard (looks like `https://something.up.railway.app`) and open Postman or your browser to:

In Postman:
- **POST** `https://YOUR-RAILWAY-URL/api/auth/register`
- Body (JSON):
  ```json
  {
    "email": "patrick@youragency.mt",
    "password": "YourPassword123",
    "firstName": "Patrick",
    "lastName": "Borg",
    "role": "admin"
  }
  ```

---

## 9. Add Agent Accounts

Use **Postman** (free download from https://www.postman.com/downloads/) to create accounts for your agents:

1. Open Postman
2. Create a new request:
   - Method: **POST**
   - URL: `http://localhost:3001/api/auth/register` (local) or your Railway URL (online)
3. Click **Body** → **raw** → change dropdown from "Text" to **JSON**
4. Paste:
   ```json
   {
     "email": "maria@youragency.mt",
     "password": "AgentPassword123",
     "firstName": "Maria",
     "lastName": "Borg",
     "role": "agent"
   }
   ```
5. Click **Send**

Repeat for each agent, changing the email, name, and password each time.

**Share with each agent:**
- The CRM URL
- Their email
- Their password

---

## 10. Day-to-Day Usage

### Starting the CRM on your computer

**Quickest way:** double-click **`start-windows.bat`** inside the `malta-real-estate-crm` folder. It starts the backend and shows you the frontend command.

Or manually — open **two** Command Prompt windows:

**Window 1** (backend):
```
cd %USERPROFILE%\malta-crm\malta-real-estate-crm
npm run dev
```

**Window 2** (frontend):
```
cd %USERPROFILE%\malta-crm\malta-real-estate-crm
npm run client:dev
```

Then open **http://localhost:3000** in your browser.

### What you can do in the CRM

| Feature | How |
|---------|-----|
| View all properties | Click "Properties" in sidebar |
| Add a new property | Properties → "Add Property" |
| View all owners | Click "Owners" in sidebar |
| Add a new owner | Owners → "Add Owner" |
| See a summary | Click "Dashboard" |
| Log out | Bottom of sidebar |

### Tips

- **Add an owner before adding a property** — properties need to be linked to an owner
- **To update the code later**, run `git pull` then restart both servers

---

## 11. Troubleshooting

### ❌ `ls` is not recognized

`ls` is a Mac/Linux command. On Windows, use `dir` instead.

---

### ❌ "Missing script: client:install"

This script may not exist on your current branch. Use the direct command instead — it always works:
```
cd client
npm install
cd ..
```

---

### ❌ `git pull` says "local changes would be overwritten by merge"

Running `npm install` modifies `package-lock.json`. Git refuses to pull because it would overwrite that file.

**Fix — discard the lock file change and pull again:**
```
git checkout -- package-lock.json
git pull
```

This is safe — `package-lock.json` will be replaced by the correct version from GitHub.

---

### ❌ Cannot connect to database

PostgreSQL may not be running.

**Fix on Windows:**
1. Press `Win`, search for **"Services"**
2. Scroll down to find **"postgresql-x64-16"** (or similar)
3. Right-click → **Start**

Also double-check your `.env` file has the right `DB_PASSWORD`.

---

### ❌ Port 3001 already in use

**Fix:** Change `PORT=3001` to `PORT=3002` in your `.env` file. Then open `client\vite.config.js` and change `3001` to `3002` in the proxy section.

---

### ❌ Browser shows a blank page or "can't connect"

Both servers need to be running at the same time:
- Window 1 running `npm run dev`
- Window 2 running `npm run client:dev`

If one of them shows an error, read it — it usually says exactly what's wrong.

---

### ❌ "module not found" or install errors

**Fix on Windows:**
```
rmdir /s /q node_modules
npm install
cd client
rmdir /s /q node_modules
npm install
cd ..
```

---

### ❌ I forgot my admin password

Run the setup script again with a different email to create a second admin:
```
npm run setup:admin
```

---

### ❌ psql is not recognized

PostgreSQL is not in your PATH. Follow the fix in Step 1.2 (add `C:\Program Files\PostgreSQL\16\bin` to your system PATH).

---

### ❌ The database says "relation does not exist"

Migrations haven't run yet:
```
npm run db:migrate
```

---

## 🎉 You're Done!

**Quick reference:**

| What to do | Command |
|-----------|---------|
| Get latest code updates | `git pull` |
| Start backend | `npm run dev` |
| Start frontend | `npm run client:dev` |
| Install/update backend packages | `npm install` |
| Install/update frontend packages | `npm run client:install` |
| Create admin account | `npm run setup:admin` |
| Update database structure | `npm run db:migrate` |
| Build for production | `npm run client:build` |

---

*For questions, open an issue at https://github.com/Patrick31214/malta-real-estate-crm/issues*

