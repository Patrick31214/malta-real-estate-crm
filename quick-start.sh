#!/bin/bash

# ============================================================
# WINDOWS USERS: DO NOT RUN THIS FILE
# ============================================================
# This file (quick-start.sh) is for Mac and Linux ONLY.
# On Windows, double-clicking it will NOT work.
#
# If you are on Windows, use these files instead:
#   - quick-start.bat   (to check your setup)
#   - start-windows.bat (to start the CRM)
#
# See STEP-BY-STEP.txt for the full guide.
# ============================================================


# Malta Real Estate CRM - Quick Start Script
# This script helps you verify your backend setup

echo "🚀 Malta Real Estate CRM - Backend Quick Start"
echo "=============================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"
else
    echo "❌ Node.js is NOT installed. Please install from https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "📦 Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is installed: $NPM_VERSION"
else
    echo "❌ npm is NOT installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check PostgreSQL
echo ""
echo "🐘 Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL is installed: $PSQL_VERSION"
else
    echo "❌ PostgreSQL is NOT installed. Please install from https://www.postgresql.org/"
    exit 1
fi

# Check if .env exists
echo ""
echo "⚙️  Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check if JWT secrets are set
    if grep -q "JWT_SECRET=your_super_secret" .env; then
        echo "⚠️  WARNING: You're still using placeholder JWT secrets!"
        echo "   Please edit .env and set secure random strings for JWT_SECRET and JWT_REFRESH_SECRET"
    else
        echo "✅ JWT secrets appear to be configured"
    fi
else
    echo "❌ .env file NOT found"
    echo "   Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env and set your database credentials and JWT secrets!"
    exit 1
fi

# Check if node_modules exists
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies are installed"
else
    echo "⚠️  Dependencies not installed"
    echo "   Run: npm install"
    exit 1
fi

# Try to connect to PostgreSQL
echo ""
echo "🔌 Testing PostgreSQL connection..."
if psql -U postgres -d malta_crm -c "SELECT 1;" &> /dev/null; then
    echo "✅ Successfully connected to malta_crm database"
else
    echo "⚠️  Cannot connect to malta_crm database"
    echo "   Make sure PostgreSQL is running and the database exists"
    echo "   Create it with: psql -U postgres -c 'CREATE DATABASE malta_crm;'"
fi

echo ""
echo "=============================================="
echo "✅ Pre-flight checks complete!"
echo ""
echo "To start the backend server, run:"
echo "  npm start"
echo ""
echo "Or for development mode with auto-restart:"
echo "  npm run dev"
echo ""
echo "📖 For detailed setup instructions, see: DEPLOYMENT_GUIDE.md"
echo "=============================================="
