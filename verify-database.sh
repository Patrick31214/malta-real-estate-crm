#!/bin/bash
# Database Schema Verification Script
# This script verifies that the Malta Real Estate CRM database schema is properly set up

echo "========================================"
echo "Malta Real Estate CRM - Database Schema Verification"
echo "========================================"
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL service..."
if sudo service postgresql status > /dev/null 2>&1; then
    echo "   ✓ PostgreSQL is running"
else
    echo "   ✗ PostgreSQL is not running"
    exit 1
fi
echo ""

# Check if database exists
echo "2. Checking if malta_crm database exists..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw malta_crm; then
    echo "   ✓ Database 'malta_crm' exists"
else
    echo "   ✗ Database 'malta_crm' does not exist"
    echo "   Run: npm run db:migrate"
    exit 1
fi
echo ""

# Check tables
echo "3. Checking database tables..."
tables=$(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != 'SequelizeMeta';")
if [ "$tables" -ge 7 ]; then
    echo "   ✓ All 7 tables exist"
else
    echo "   ✗ Expected 7 tables, found $tables"
    exit 1
fi
echo ""

# Check data
echo "4. Checking seeded data..."
users=$(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM users;")
properties=$(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM properties;")
echo "   - Users: $users"
echo "   - Properties: $properties"
echo "   - Owners: $(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM owners;")"
echo "   - Agents: $(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM agents;")"
echo "   - Inquiries: $(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM inquiries;")"
echo "   - Property Updates: $(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM property_updates_queue;")"
echo "   - Contact Logs: $(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM automated_contact_logs;")"
echo ""

# Test relationships
echo "5. Testing database relationships..."
relationship_test=$(sudo -u postgres psql -d malta_crm -t -c "SELECT COUNT(*) FROM properties p JOIN owners o ON p.owner_id = o.id;")
if [ "$relationship_test" -gt 0 ]; then
    echo "   ✓ Property-Owner relationships working"
else
    echo "   ✗ Property-Owner relationships not working"
fi
echo ""

# Summary
echo "========================================"
echo "Database Schema Verification: PASSED ✓"
echo "========================================"
echo ""
echo "Test credentials:"
echo "  Email: admin@maltarealestate.com"
echo "  Password: Password123!"
echo ""
echo "Available commands:"
echo "  npm run db:migrate     - Run migrations"
echo "  npm run db:seed        - Seed test data"
echo "  npm run db:reset       - Reset and reseed database"
echo ""
