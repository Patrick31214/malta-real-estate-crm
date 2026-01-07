# Malta Real Estate CRM - Backend Deployment Guide

This guide will walk you through setting up the backend server step by step until it's fully functional.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (version 12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **A code editor** (optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any editor of your choice

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/Patrick31214/malta-real-estate-crm.git
cd malta-real-estate-crm
```

**Expected Result:** You should now be inside the project directory.

---

### Step 2: Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

**Expected Result:** You should see packages being installed. This may take 1-2 minutes.

**Verification:**
```bash
ls node_modules
```
You should see many folders (express, sequelize, pg, etc.).

---

### Step 3: Set Up PostgreSQL Database

#### 3.1: Start PostgreSQL Service

**On Windows:**
- PostgreSQL should auto-start. If not, open Services and start "postgresql-x64-XX"

**On macOS:**
```bash
brew services start postgresql
```

**On Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 3.2: Create Database

Open PostgreSQL command line:

```bash
# On Windows/macOS:
psql -U postgres

# On Linux:
sudo -u postgres psql
```

Once in the PostgreSQL prompt, create the database:

```sql
CREATE DATABASE malta_crm;
\q
```

**Expected Result:** You should see `CREATE DATABASE` message.

#### 3.3: Set PostgreSQL Password (if needed)

If you need to set/reset the postgres user password:

```sql
psql -U postgres
ALTER USER postgres PASSWORD 'your_password';
\q
```

---

### Step 4: Configure Environment Variables

#### 4.1: Copy the Example File

```bash
# On Windows (Command Prompt):
copy .env.example .env

# On macOS/Linux:
cp .env.example .env
```

#### 4.2: Edit the .env File

Open the `.env` file in your text editor and update the values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malta_crm
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password

# JWT Configuration - IMPORTANT: Generate secure random strings!
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_long
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**🔐 Security Note:** 
- Replace `your_actual_postgres_password` with your PostgreSQL password
- Generate secure random strings for JWT secrets. You can use:
  - Online: https://www.uuidgenerator.net/
  - Command line: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Expected Result:** Your `.env` file should have real values (no placeholder text).

---

### Step 5: Start the Backend Server

```bash
npm start
```

**Expected Result:** You should see:
```
✓ PostgreSQL database connection established successfully.
✓ Database models synchronized.
✓ Server is running on port 5000
✓ Environment: development
✓ API Documentation: http://localhost:5000/
```

**If you see errors:**
- **Database connection error:** Check PostgreSQL is running and credentials in `.env` are correct
- **Port already in use:** Change PORT in `.env` to 5001 or another available port
- **JWT secrets error:** Make sure you set JWT_SECRET and JWT_REFRESH_SECRET in `.env`

---

## ✅ Verify Installation

### Test 1: Health Check

Open a new terminal window and run:

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-07T17:53:00.000Z"
}
```

**On Windows without curl:**
- Open your browser and go to: http://localhost:5000/health

---

### Test 2: Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### Test 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Expected Response:** Similar to registration with new tokens.

---

## 🎯 Available API Endpoints

Once your backend is running, you have these endpoints:

### Authentication Endpoints

1. **POST** `/api/auth/register`
   - Register a new user
   - Body: `{ email, password, firstName, lastName, role }`

2. **POST** `/api/auth/login`
   - Login existing user
   - Body: `{ email, password }`

3. **POST** `/api/auth/refresh`
   - Refresh access token
   - Body: `{ refreshToken }`

4. **POST** `/api/auth/logout`
   - Logout user
   - Body: `{ refreshToken }`

### Utility Endpoints

5. **GET** `/health`
   - Check server status

6. **GET** `/`
   - API information

---

## 🔧 Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when you make code changes.

---

## 📊 Database Verification

To verify the database and tables were created:

```bash
psql -U postgres -d malta_crm
```

Then check tables:

```sql
\dt
SELECT * FROM users;
\q
```

You should see the `users` table and any users you created.

---

## 🐛 Troubleshooting

### Issue: Cannot connect to database

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -U postgres -l | grep malta_crm`

### Issue: Port 5000 already in use

**Solution:**
1. Find what's using the port:
   - Windows: `netstat -ano | findstr :5000`
   - macOS/Linux: `lsof -i :5000`
2. Kill the process or change PORT in `.env`

### Issue: JWT secrets error

**Solution:**
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in `.env`
- They must be non-empty strings
- Generate secure random strings as shown in Step 4

### Issue: Module not found

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Success!

If all tests pass, your backend is **fully functional** and ready to:
- Accept user registrations
- Authenticate users
- Manage JWT tokens
- Store data in PostgreSQL

---

## 📝 Next Steps

Now that your backend is running:

1. **Keep the server running** in one terminal window
2. **Note your server URL:** `http://localhost:5000`
3. **Save your access tokens** from the test registration
4. **Ready for frontend integration** - We'll connect WordPress/Elementor in the next phase

---

## 🚦 Production Deployment (Optional)

When ready to deploy to production, consider:

1. **Hosting Options:**
   - Heroku (easiest for beginners)
   - AWS EC2/Elastic Beanstalk
   - DigitalOcean
   - Render.com
   - Railway.app

2. **Environment:**
   - Change `NODE_ENV=production` in `.env`
   - Use strong, unique JWT secrets
   - Enable HTTPS
   - Set up proper database backups

3. **Security:**
   - Never commit `.env` file to Git
   - Use environment variables on hosting platform
   - Enable CORS only for your domain
   - Set up rate limiting

---

## 📞 Need Help?

If you encounter issues not covered here:
1. Check the main README.md for additional documentation
2. Review error messages carefully
3. Ensure all prerequisites are correctly installed
4. Verify PostgreSQL is running and accessible

---

**Status:** ✅ Backend Setup Complete - Ready for Frontend Integration
