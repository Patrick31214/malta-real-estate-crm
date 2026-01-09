# Malta Real Estate CRM

A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro.

## Features

- **JWT-based Authentication**: Secure authentication system with access and refresh tokens
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin, Agent, Owner, and System roles
- **Email Verification**: Secure email verification flow with short-lived tokens
- **Password Recovery**: Forgot password and reset password functionality
- **User Management**: Complete user lifecycle management
- **PostgreSQL Database**: Robust data persistence with Sequelize ORM
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

4. **Create PostgreSQL database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE malta_crm;
   
   # Exit
   \q
   ```

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

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "If the email exists, a password reset link has been sent."
  }
  ```
- **Note**: In production, the reset token should be sent via email. For development, it's included in the response.

#### Reset Password
- **POST** `/api/auth/reset-password`
- **Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "newPassword": "newSecurePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully."
  }
  ```

#### Verify Email
- **POST** `/api/auth/verify`
- **Body**:
  ```json
  {
    "token": "verification_token_from_email"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully."
  }
  ```
- **Note**: In production, the verification token should be sent via email. For development, it's included in the registration response.

## Project Structure

```
malta-real-estate-crm/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   └── auth.js               # Authentication & authorization middleware
│   ├── models/
│   │   └── User.js               # User model
│   ├── routes/
│   │   └── auth.js               # Authentication routes
│   ├── utils/
│   │   └── jwt.js                # JWT utility functions
│   └── server.js                 # Application entry point
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore file
├── package.json                  # Project dependencies
└── README.md                     # Project documentation
```

## Authentication Flow

### Registration and Email Verification Flow
1. **Register**: User provides credentials and receives access token, refresh token, and email verification token
2. **Email Verification**: User clicks verification link (or uses token) to verify email address
3. **Access Protected Routes**: Include access token in Authorization header: `Bearer <access_token>`

### Login Flow
1. **Login**: User provides credentials and receives access token (short-lived, 15 min) and refresh token (long-lived, 7 days)
2. **Access Protected Routes**: Include access token in Authorization header: `Bearer <access_token>`
3. **Token Refresh**: When access token expires, use refresh token to get new tokens
4. **Logout**: Invalidate refresh token on server

### Password Recovery Flow
1. **Forgot Password**: User provides email and receives password reset token (1 hour expiration)
2. **Reset Password**: User provides reset token and new password
3. **Login**: User can now login with new password

## Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Tokens**: Separate access and refresh tokens with different expiration times
- **Short-lived Special Tokens**: 
  - Email verification tokens (24 hours)
  - Password reset tokens (1 hour)
- **Token Validation**: Middleware to protect routes
- **Role-Based Access Control (RBAC)**: Authorization middleware for different user roles
- **Permission-Based Access**: Fine-grained permission checks for specific actions
- **Input Validation**: Request validation for all endpoints
- **Secure Headers**: CORS and security best practices
- **Email Verification**: Ensures users own their email addresses
- **Password Reset Security**: Time-limited tokens prevent unauthorized access

## User Roles and Permissions

### Admin
- Full system access
- Permissions: `users:*`, `properties:*`, `agents:*`, `system:configure`
- Can manage all users, properties, and system configuration

### Agent
- Real estate agent access
- Permissions: `properties:read/write`, `clients:read/write`, `leads:read/write`
- Can manage properties, clients, and leads

### Owner
- Property owner/client access
- Permissions: `properties:read`, `profile:read/write`
- Can view properties and manage own profile

### System
- System/service account access
- Permissions: `system:read/write/execute`
- For automated processes and integrations

## Development

### API Testing Examples

Here are some examples of how to test the authentication API using cURL:

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "owner"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### Request password reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### Reset password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "NewSecurePass456"
  }'
```

#### Verify email
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_VERIFICATION_TOKEN"
  }'
```

#### Access protected route
```bash
curl -X GET http://localhost:5000/api/protected-route \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

The test suite includes:
- 37 comprehensive unit tests
- Authentication endpoint tests
- RBAC middleware tests
- Permission mapping tests
- SQLite in-memory database for fast test execution

### Using RBAC Middleware

The authentication system provides two types of authorization middleware:

#### Role-Based Authorization
Restrict access to specific roles:
```javascript
const { authenticate, authorize } = require('./middleware/auth');

// Only admins can access
router.get('/admin/users', authenticate, authorize('admin'), controller);

// Admins and agents can access
router.get('/properties', authenticate, authorize('admin', 'agent'), controller);
```

#### Permission-Based Authorization
Restrict access to specific permissions:
```javascript
const { authenticate, checkPermission } = require('./middleware/auth');

// Require specific permission
router.post('/properties', authenticate, checkPermission('properties:write'), controller);

// Require multiple permissions
router.delete('/users/:id', authenticate, checkPermission('users:delete', 'users:write'), controller);
```

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Create corresponding controller in `src/controllers/`
3. Import and use in `src/server.js`

### Adding New Models

1. Create model file in `src/models/`
2. Define schema using Sequelize
3. Import in controllers as needed

## License

ISC

## Author

Malta Real Estate CRM Team

## Support

For issues and questions, please open an issue on GitHub.
