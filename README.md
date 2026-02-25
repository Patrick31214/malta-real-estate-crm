# Malta Real Estate CRM

A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro.

## 🚀 Quick Start Guides

**New to the system? Choose the guide that fits you:**

- **📘 [LAPTOP_SETUP_GUIDE.md](LAPTOP_SETUP_GUIDE.md)** - Complete beginner-friendly setup guide
  - Step-by-step instructions for Windows, Mac, and Linux
  - PostgreSQL installation and configuration
  - Detailed troubleshooting section
  
- **⚡ [QUICK_START.md](QUICK_START.md)** - Essential commands only
  - Copy-paste ready commands for each OS
  - Quick reference for daily use
  
- **✅ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Interactive checklist
  - Track your progress step-by-step
  - Verification checkboxes
  - Space for your notes

- **🔄 [RESTART_GUIDE.md](RESTART_GUIDE.md)** - For when you need to restart the system
  - API examples and test credentials
  - System status verification

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

### Properties

#### Create Property
- **POST** `/api/properties`
- **Access**: Private (Admin, Agent)
- **Body**:
  ```json
  {
    "ownerId": "uuid",
    "agentId": "uuid",
    "title": "Beautiful 3-Bedroom Apartment in Sliema",
    "description": "Spacious apartment with sea views",
    "propertyType": "apartment",
    "listingType": "sale",
    "status": "available",
    "price": 350000,
    "currency": "EUR",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareMeters": 150,
    "address": "123 Main Street",
    "city": "Sliema",
    "country": "Malta",
    "features": ["air conditioning", "balcony", "parking"]
  }
  ```

#### Get All Properties
- **GET** `/api/properties`
- **Access**: Public
- **Query Parameters**:
  - `propertyType`: apartment, house, villa, etc.
  - `listingType`: sale, rent, lease
  - `status`: available, under_offer, sold, etc.
  - `city`: City name
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `bedrooms`: Minimum bedrooms
  - `bathrooms`: Minimum bathrooms
  - `featured`: true/false
  - `isActive`: true/false
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)

#### Get Single Property
- **GET** `/api/properties/:id`
- **Access**: Public

#### Update Property
- **PUT** `/api/properties/:id`
- **Access**: Private (Admin, Agent)
- **Body**: Any property fields to update

#### Delete Property
- **DELETE** `/api/properties/:id`
- **Access**: Private (Admin)

### Owners

#### Create Owner
- **POST** `/api/owners`
- **Access**: Private (Admin, Agent)
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+35621234567",
    "mobile": "+35699123456",
    "address": "456 Owner Street",
    "city": "Valletta",
    "country": "Malta",
    "companyName": "Doe Properties Ltd",
    "taxId": "MT12345678"
  }
  ```

#### Get All Owners
- **GET** `/api/owners`
- **Access**: Private (Admin, Agent)
- **Query Parameters**:
  - `search`: Search by name, email, or company
  - `isActive`: true/false
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)

#### Get Single Owner
- **GET** `/api/owners/:id`
- **Access**: Private (Admin, Agent)

#### Update Owner
- **PUT** `/api/owners/:id`
- **Access**: Private (Admin, Agent)
- **Body**: Any owner fields to update

#### Delete Owner
- **DELETE** `/api/owners/:id`
- **Access**: Private (Admin)
- **Note**: Cannot delete owners with associated properties

### Agents

#### Create Agent
- **POST** `/api/agents`
- **Access**: Private (Admin)
- **Body**:
  ```json
  {
    "userId": "uuid",
    "licenseNumber": "RE123456",
    "specialization": "Residential Properties",
    "commissionRate": 5.0,
    "phone": "+35621234567",
    "mobile": "+35699123456",
    "officeAddress": "789 Agent Plaza",
    "bio": "Experienced real estate agent...",
    "languages": ["English", "Maltese", "Italian"],
    "yearsExperience": 10
  }
  ```

#### Get All Agents
- **GET** `/api/agents`
- **Access**: Public
- **Query Parameters**:
  - `search`: Search by license or specialization
  - `specialization`: Filter by specialization
  - `isActive`: true/false
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)

#### Get Single Agent
- **GET** `/api/agents/:id`
- **Access**: Public

#### Update Agent
- **PUT** `/api/agents/:id`
- **Access**: Private (Admin, Agent)
- **Body**: Any agent fields to update

#### Delete Agent
- **DELETE** `/api/agents/:id`
- **Access**: Private (Admin)

### Inquiries

#### Create Inquiry
- **POST** `/api/inquiries`
- **Access**: Public
- **Body**:
  ```json
  {
    "propertyId": "uuid",
    "agentId": "uuid",
    "clientName": "Jane Smith",
    "clientEmail": "jane.smith@example.com",
    "clientPhone": "+35699123456",
    "message": "I would like to schedule a viewing",
    "inquiryType": "viewing_request",
    "priority": "high",
    "preferredViewingDate": "2024-01-20T10:00:00Z"
  }
  ```

#### Get All Inquiries
- **GET** `/api/inquiries`
- **Access**: Private (Admin, Agent)
- **Query Parameters**:
  - `propertyId`: Filter by property
  - `agentId`: Filter by agent
  - `status`: new, contacted, in_progress, etc.
  - `inquiryType`: viewing_request, information_request, etc.
  - `priority`: low, medium, high, urgent
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20)

#### Get Inquiries by Property
- **GET** `/api/inquiries/property/:propertyId`
- **Access**: Private (Admin, Agent)

#### Get Single Inquiry
- **GET** `/api/inquiries/:id`
- **Access**: Private (Admin, Agent)

#### Update Inquiry
- **PUT** `/api/inquiries/:id`
- **Access**: Private (Admin, Agent)
- **Body**: Any inquiry fields to update

#### Delete Inquiry
- **DELETE** `/api/inquiries/:id`
- **Access**: Private (Admin)

## Project Structure

```
malta-real-estate-crm/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration (Sequelize)
│   │   └── config.js             # Environment-based config for CLI
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── propertyController.js # Property CRUD operations
│   │   ├── ownerController.js    # Owner CRUD operations
│   │   ├── agentController.js    # Agent CRUD operations
│   │   └── inquiryController.js  # Inquiry CRUD operations
│   ├── middleware/
│   │   ├── auth.js               # Authentication & authorization middleware
│   │   └── validation.js         # Request validation middleware
│   ├── models/
│   │   ├── index.js              # Models index with relationships
│   │   ├── User.js               # User model
│   │   ├── Owner.js              # Property owner model
│   │   ├── Agent.js              # Real estate agent model
│   │   ├── Property.js           # Property listing model
│   │   ├── Inquiry.js            # Customer inquiry model
│   │   ├── PropertyUpdateQueue.js # Property update queue model
│   │   └── AutomatedContactLog.js # Contact log model
│   ├── validations/              # Joi validation schemas
│   │   ├── propertyValidation.js
│   │   ├── ownerValidation.js
│   │   ├── agentValidation.js
│   │   └── inquiryValidation.js
│   ├── migrations/               # Database migration files
│   ├── seeders/                  # Database seeder files
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── properties.js         # Property routes
│   │   ├── owners.js             # Owner routes
│   │   ├── agents.js             # Agent routes
│   │   └── inquiries.js          # Inquiry routes
│   ├── utils/
│   │   └── jwt.js                # JWT utility functions
│   └── server.js                 # Application entry point
├── tests/                        # Test files
│   ├── property.test.js
│   ├── owner.test.js
│   ├── agent.test.js
│   └── inquiry.test.js
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

## Testing

This project uses Jest and Supertest for automated testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The test suite covers:
- **Property Endpoints**: CRUD operations with authentication and validation
- **Owner Endpoints**: CRUD operations with relationship validation
- **Agent Endpoints**: CRUD operations with user association
- **Inquiry Endpoints**: CRUD operations including property-specific queries

All tests verify:
- Successful operations with proper authentication
- Authorization checks for different user roles
- Input validation and error handling
- Relationship integrity (foreign keys)
- Proper HTTP status codes and response formats

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
