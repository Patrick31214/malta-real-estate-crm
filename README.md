# Malta Real Estate CRM

A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro.

## Features

- **JWT-based Authentication**: Secure authentication system with access and refresh tokens
- **User Management**: Role-based access control (Admin, Agent, User)
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
3. Import in controllers as needed

## License

ISC

## Author

Malta Real Estate CRM Team

## Support

For issues and questions, please open an issue on GitHub.
