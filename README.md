# Malta Real Estate CRM

A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro.

## 🚀 Getting Started (Windows — double-click to start)

> **Non-technical user?**  Double-click **`quick-start.bat`** in Windows Explorer.
> It checks your setup AND starts the CRM — your browser will open at `http://localhost:3001`.

> **Full setup guide:**  👉 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** — step-by-step from installing tools to adding agents. No coding experience needed.

---

### 🔧 Fixing an old `start-windows.bat` that closes immediately

If you downloaded the project a while ago and `start-windows.bat` closes as soon as you
press any key (even though the server started), you have an older version of the file.

**Quick fix**: Use **`quick-start.bat`** instead — open it by double-clicking it in Windows
Explorer. It does exactly the same job as `start-windows.bat`: checks your setup, builds
the CRM pages, and starts the server in a dedicated window that stays open.

---


## Features

- **JWT-based Authentication**: Secure authentication system with access and refresh tokens
- **User Management**: Role-based access control (Admin, Agent, User)
- **PostgreSQL Database**: Robust data persistence with Sequelize ORM
- **Complete CRM Schema**: Properties, Owners, Agents, Inquiries, Updates, Contact Logs
- **Database Migrations**: Version-controlled schema with Sequelize migrations
- **Test Data Seeders**: Pre-populated sample data for development
- **RESTful API**: Clean and organized API endpoints
- **MVC Architecture**: Well-structured codebase following best practices

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Patrick31214/malta-real-estate-crm.git
   cd malta-real-estate-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=malta_crm
   DB_USER=postgres
   DB_PASSWORD=your_password_here

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **Create PostgreSQL database and run migrations**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE malta_crm;
   
   # Exit
   \q
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```
   
   This will create all necessary tables with proper relationships and indexes.

6. **Seed the database with test data (optional)**
   ```bash
   npm run db:seed
   ```
   
   This populates the database with sample data for development. Default password for all test users is `Password123!`

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Database Management

- **Migrate Database** - `npm run db:migrate` - Run all pending migrations
- **Seed Database** - `npm run db:seed` - Populate with test data
- **Reset Database** - `npm run db:reset` - Reset and reseed entire database
- See [DATABASE.md](DATABASE.md) for complete database documentation

### Health Check
- **GET** `/health` - Check server status
- **GET** `/` - API information

### Authentication

#### Register New User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Body**:
  ```json
  {
    "refreshToken": "your_refresh_token_here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully.",
    "data": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- **Body**:
  ```json
  {
    "refreshToken": "your_refresh_token_here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

## Project Structure

```
malta-real-estate-crm/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration (Sequelize)
│   │   └── config.js             # Environment-based config for CLI
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   └── auth.js               # Authentication & authorization middleware
│   ├── models/
│   │   ├── index.js              # Models index with relationships
│   │   ├── User.js               # User model
│   │   ├── Owner.js              # Property owner model
│   │   ├── Agent.js              # Real estate agent model
│   │   ├── Property.js           # Property listing model
│   │   ├── Inquiry.js            # Customer inquiry model
│   │   ├── PropertyUpdateQueue.js # Property update queue model
│   │   └── AutomatedContactLog.js # Contact log model
│   ├── migrations/               # Database migration files
│   ├── seeders/                  # Database seeder files
│   ├── routes/
│   │   └── auth.js               # Authentication routes
│   ├── utils/
│   │   └── jwt.js                # JWT utility functions
│   └── server.js                 # Application entry point
├── .env.example                  # Environment variables template
├── .sequelizerc                  # Sequelize CLI configuration
├── .gitignore                    # Git ignore file
├── package.json                  # Project dependencies
├── DATABASE.md                   # Database schema documentation
└── README.md                     # Project documentation
```

## Authentication Flow

1. **Register/Login**: User provides credentials and receives access token (short-lived) and refresh token (long-lived)
2. **Access Protected Routes**: Include access token in Authorization header: `Bearer <access_token>`
3. **Token Refresh**: When access token expires, use refresh token to get new tokens
4. **Logout**: Invalidate refresh token on server

## Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Tokens**: Separate access and refresh tokens
- **Token Validation**: Middleware to protect routes
- **Role-Based Access**: Authorization middleware for different user roles
- **Input Validation**: Request validation for all endpoints
- **Secure Headers**: CORS and security best practices

## User Roles

- **admin**: Full system access
- **agent**: Real estate agent access
- **user**: Basic user access (property owners, clients)

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Create corresponding controller in `src/controllers/`
3. Import and use in `src/server.js`

### Adding New Models

1. Create model file in `src/models/`
2. Define schema using Sequelize
3. Add relationships in `src/models/index.js`
4. Create corresponding migration file
5. Run migration: `npm run db:migrate`

## Database Schema

The application includes a comprehensive database schema for managing real estate operations:

- **Properties**: Property listings with full details (type, location, price, features, etc.)
- **Owners**: Property owners and landlords
- **Agents**: Real estate agents with profiles and specializations
- **Inquiries**: Customer inquiries and viewing requests
- **Property Updates Queue**: Scheduled property updates and changes
- **Automated Contact Logs**: Email, SMS, and notification tracking

For complete database documentation, see [DATABASE.md](DATABASE.md).

### Database Commands

```bash
# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Seed database with test data
npm run db:seed

# Reset entire database
npm run db:reset
```

### Test Data

After running seeders, you can login with:
- **Email**: admin@maltarealestate.com
- **Password**: Password123!

See DATABASE.md for all test accounts.

## License

ISC

## Author

Malta Real Estate CRM Team

## Support

For issues and questions, please open an issue on GitHub.
