# Malta Real Estate CRM - System Restart Guide

## ✅ System Successfully Restarted!

Your Malta Real Estate CRM system is now **up and running** on port 5000.

## Quick Status Check

- **Server URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Root**: http://localhost:5000/
- **Environment**: Development
- **Database**: PostgreSQL (malta_crm)
- **Status**: ✅ OPERATIONAL

## Test Credentials

### Admin Account
- **Email**: admin@maltarealestate.com
- **Password**: Password123!
- **Access**: Full system access

### Agent Accounts
- john.smith@maltarealestate.com / Password123!
- maria.garcia@maltarealestate.com / Password123!
- david.borg@maltarealestate.com / Password123!

### Client Accounts
- client1@example.com / Password123!
- client2@example.com / Password123!

## What's Available

### Test Data Loaded
- **8 Properties** (various types: apartments, villas, penthouses, etc.)
- **5 Owners** (property owners and landlords)
- **3 Agents** (real estate agents with profiles)
- **8 Inquiries** (customer inquiries and viewing requests)
- **7 Property Update Queue Items**
- **8 Automated Contact Logs**

### API Endpoints

#### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltarealestate.com","password":"Password123!"}'

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"Password123!","firstName":"John","lastName":"Doe"}'
```

#### Properties
```bash
# Get all properties
curl http://localhost:5000/api/properties

# Get properties with filters
curl "http://localhost:5000/api/properties?city=Valletta&minPrice=200000&maxPrice=500000"

# Get single property
curl http://localhost:5000/api/properties/{id}
```

#### Owners
```bash
# Get all owners (requires authentication)
curl http://localhost:5000/api/owners \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Agents
```bash
# Get all agents (public access)
curl http://localhost:5000/api/agents

# Get single agent
curl http://localhost:5000/api/agents/{id}
```

#### Inquiries
```bash
# Create inquiry (public)
curl -X POST http://localhost:5000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"...","clientName":"John Doe","clientEmail":"john@example.com","message":"Interested in viewing"}'
```

## System Architecture

```
malta-real-estate-crm/
├── src/
│   ├── config/           # Database & environment config
│   ├── controllers/      # Business logic (auth, properties, owners, agents, inquiries)
│   ├── middleware/       # Auth & validation middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API route definitions
│   ├── validations/      # Joi validation schemas
│   ├── migrations/       # Database migrations (7 files)
│   ├── seeders/          # Test data seeders (7 files)
│   └── server.js         # Application entry point
├── tests/                # Jest test suite
├── .env                  # Environment configuration
└── package.json          # Dependencies & scripts
```

## Available Commands

```bash
# Start server (production mode)
npm start

# Start server (development mode with auto-reload)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Database migrations
npm run db:migrate              # Run pending migrations
npm run db:migrate:undo         # Rollback last migration
npm run db:migrate:undo:all     # Rollback all migrations

# Database seeders
npm run db:seed                 # Seed database with test data
npm run db:seed:undo            # Undo last seeder
npm run db:seed:undo:all        # Undo all seeders

# Reset database (undo all, migrate, seed)
npm run db:reset
```

## How to Continue Working

### 1. Explore the Current Data
```bash
# View all properties
curl http://localhost:5000/api/properties | jq .

# View specific property details
curl http://localhost:5000/api/properties/{property-id} | jq .

# Check health status
curl http://localhost:5000/health | jq .
```

### 2. Test Authentication
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltarealestate.com","password":"Password123!"}' | jq .

# Save the accessToken from response
export TOKEN="your_access_token_here"

# Use token for protected endpoints
curl http://localhost:5000/api/owners \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 3. Create New Data
```bash
# Create a new property (requires agent/admin role)
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": "owner-uuid",
    "title": "New Property",
    "propertyType": "apartment",
    "listingType": "sale",
    "price": 300000,
    "bedrooms": 2,
    "city": "Sliema"
  }' | jq .
```

### 4. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## Troubleshooting

### Server Not Starting?
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 $(lsof -t -i:5000)

# Restart server
npm start
```

### Database Issues?
```bash
# Check database connection
psql -U postgres -d malta_crm -c "SELECT COUNT(*) FROM users;"

# Reset database completely
npm run db:reset
```

### Authentication Errors?
- Make sure you're using the correct test credentials
- Check that JWT secrets are set in .env file
- Verify token is included in Authorization header: `Bearer YOUR_TOKEN`

## Configuration Files

### .env
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

# JWT Configuration
JWT_SECRET=dev_secret_key_for_testing_only_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_for_testing_only_change_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## Next Development Steps

1. **Review the codebase**
   - Check controllers in `src/controllers/`
   - Review models in `src/models/`
   - Understand routes in `src/routes/`

2. **Read documentation**
   - Main README: `README.md`
   - Database schema: `DATABASE.md`
   - Deployment guide: `DEPLOYMENT_GUIDE.md`

3. **Plan new features**
   - Check existing issues on GitHub
   - Review API endpoints for gaps
   - Consider frontend integration

4. **Write tests**
   - Add more test cases in `tests/`
   - Improve test coverage
   - Test edge cases

## Support

- **Documentation**: See README.md and DATABASE.md
- **API Reference**: Check route files in src/routes/
- **Issues**: Create issues on GitHub repository

---

**System restarted successfully on**: 2026-02-25 13:03 UTC
**Server status**: ✅ Running on port 5000
**Database status**: ✅ Connected and seeded
**Authentication**: ✅ Working
