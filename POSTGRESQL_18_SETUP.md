# PostgreSQL 18 Setup Guide for Windows

## Special Notes for PostgreSQL 18

If you have PostgreSQL 18 installed (instead of PostgreSQL 16), there are some differences:

---

## Finding Your PostgreSQL 18 Service

PostgreSQL 18 may have a different service name. Here's how to find it:

### Method 1: Using Command Prompt

```cmd
sc query | findstr /i "postgres"
```

Common service names for PostgreSQL 18:
- `postgresql-x64-18`
- `postgresql-18`
- `PostgreSQL-18`
- `postgresql` (if only one version installed)

### Method 2: Using Services GUI

1. Press `Windows Key + R`
2. Type `services.msc` and press Enter
3. Scroll down to find services starting with "postgresql"
4. Look for version 18

---

## Starting PostgreSQL 18

Once you know your service name, start it:

```cmd
net start postgresql-x64-18
```

(Replace `postgresql-x64-18` with your actual service name)

---

## PostgreSQL 18 Default Port

PostgreSQL 18 might use a different port if you have multiple PostgreSQL versions installed:

- **First installation:** Port 5432
- **Second installation:** Port 5433
- **Third installation:** Port 5434

### How to Check Which Port PostgreSQL 18 is Using

**Method 1: Check during installation**
- When you installed PostgreSQL 18, it showed the port number
- Default is 5432, but changes to 5433 if 5432 is taken

**Method 2: Check PostgreSQL data directory**

1. Open File Explorer
2. Navigate to: `C:\Program Files\PostgreSQL\18\data`
3. Open file: `postgresql.conf`
4. Search for: `port =`
5. The number after `port =` is your PostgreSQL port

**Method 3: Check with pgAdmin**

1. Open pgAdmin 4
2. When connecting, try different ports:
   - First try: 5432
   - If fails, try: 5433
   - If fails, try: 5434

---

## Configuring Your Application for PostgreSQL 18

### Update .env File

Edit your `.env` file to match your PostgreSQL 18 configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432          # ← Change this if PostgreSQL 18 uses 5433 or 5434
DB_NAME=malta_crm
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### How to Find the Correct Port

**Try starting your app with different ports:**

1. Edit `.env`, set `DB_PORT=5432`
2. Run `npm start`
3. If you see database connection error, try next port:
4. Edit `.env`, set `DB_PORT=5433`
5. Run `npm start`
6. Repeat until it works

**The port that works is your PostgreSQL port!**

---

## pgAdmin 4 Configuration for PostgreSQL 18

### Create Server Connection

1. Open pgAdmin 4
2. Right-click "Servers" → Create → Server
3. **General Tab:**
   - Name: `PostgreSQL 18 - Malta CRM`

4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432` (or 5433, 5434 - see above)
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: [your PostgreSQL password]

5. Click "Save"

### Test Connection

- Click on the server name
- If connects successfully → Port is correct! ✅
- If connection timeout → Try next port (5433, 5434)

---

## Multiple PostgreSQL Versions

### If You Have Both PostgreSQL 16 and 18

Each version will have:
- Different service name
- Different port number
- Different data directory

**Example:**
```
PostgreSQL 16:
- Service: postgresql-x64-16
- Port: 5432
- Data: C:\Program Files\PostgreSQL\16\data

PostgreSQL 18:
- Service: postgresql-x64-18
- Port: 5433
- Data: C:\Program Files\PostgreSQL\18\data
```

### Which One Should You Use?

**For this project, use PostgreSQL 18** (the newer version)

Make sure:
1. PostgreSQL 18 service is running
2. Your .env file points to PostgreSQL 18 port
3. pgAdmin connects to PostgreSQL 18 port

---

## Quick Reference Commands

### Start PostgreSQL 18
```cmd
net start postgresql-x64-18
```

### Stop PostgreSQL 18
```cmd
net stop postgresql-x64-18
```

### Check if Running
```cmd
sc query postgresql-x64-18
```

### Find Port Number
```cmd
type "C:\Program Files\PostgreSQL\18\data\postgresql.conf" | findstr "port"
```

---

## Common Issues with PostgreSQL 18

### Issue 1: Service Name Not Found

**Error:** "The service name is invalid"

**Solution:** Use the exact service name from:
```cmd
sc query | findstr /i "postgres"
```

### Issue 2: Port Already in Use

**Error:** Could not bind to port 5432

**Solution:** PostgreSQL 18 will automatically use next available port (5433)
- Check `postgresql.conf` for actual port
- Update `.env` file with correct port

### Issue 3: Can't Connect from pgAdmin

**Error:** "connection timeout expired"

**Solution:**
1. Verify PostgreSQL 18 service is running
2. Check you're using correct port (5432, 5433, or 5434)
3. Check firewall isn't blocking the port

### Issue 4: Wrong PostgreSQL Version

**Error:** Application connects but features don't work

**Solution:**
- Make sure you're using PostgreSQL 18, not older version
- Check service name to confirm version
- Only start PostgreSQL 18 service

---

## PostgreSQL 18 Advantages

PostgreSQL 18 includes improvements over version 16:
- Better performance
- New features
- Security updates
- Better Windows compatibility

**You're using the latest version - that's good!** 👍

---

## Migration from PostgreSQL 16 to 18

If you previously had PostgreSQL 16:

1. **Backup old data** (if any):
   ```cmd
   pg_dump -U postgres malta_crm > backup.sql
   ```

2. **Create database in PostgreSQL 18:**
   - Use pgAdmin 4 connected to port 5433 (or your PostgreSQL 18 port)
   - Create database: `malta_crm`

3. **Update .env file:**
   - Change `DB_PORT` to PostgreSQL 18 port

4. **Run migrations:**
   ```cmd
   npm run db:migrate
   ```

5. **Restore data** (if needed):
   ```cmd
   psql -U postgres -d malta_crm < backup.sql
   ```

---

## Summary

**For PostgreSQL 18 on Windows:**

1. ✅ Service name: `postgresql-x64-18` (or similar)
2. ✅ Default port: Usually 5433 (not 5432 if version 16 still installed)
3. ✅ pgAdmin port: Must match PostgreSQL 18 port (5433)
4. ✅ .env DB_PORT: Must match PostgreSQL 18 port (5433)
5. ✅ Application port: Still 5000 (unchanged)

**Remember:** Database port ≠ Application port!
- PostgreSQL 18: Port 5433
- Malta CRM App: Port 5000

---

## Need Help?

1. Check your PostgreSQL version:
   ```cmd
   psql --version
   ```

2. Check which port it's using:
   ```cmd
   netstat -ano | findstr :5432
   netstat -ano | findstr :5433
   ```

3. Verify service is running:
   ```cmd
   sc query postgresql-x64-18
   ```

All should match PostgreSQL 18 configuration!
