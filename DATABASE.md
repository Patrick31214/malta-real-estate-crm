# Database Schema Documentation

## Overview

The Malta Real Estate CRM uses PostgreSQL as the database with Sequelize ORM for migrations, models, and relationships. The database schema is designed to manage properties, owners, agents, inquiries, property updates, and automated communications.

## Database Tables

### 1. Users

Core authentication and user management table.

**Table Name:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | STRING(255) | NOT NULL, UNIQUE | User email address |
| password | STRING | NOT NULL | Hashed password |
| first_name | STRING | NULL | User's first name |
| last_name | STRING | NULL | User's last name |
| role | ENUM | NOT NULL, DEFAULT 'user' | User role: admin, agent, user |
| refresh_token | TEXT | NULL | JWT refresh token |
| is_active | BOOLEAN | DEFAULT true | Account active status |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `users_email_idx` on `email` (unique)

---

### 2. Owners

Property owners and landlords.

**Table Name:** `owners`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique owner identifier |
| first_name | STRING(100) | NOT NULL | Owner's first name |
| last_name | STRING(100) | NOT NULL | Owner's last name |
| email | STRING(255) | NOT NULL, UNIQUE | Contact email |
| phone | STRING(20) | NULL | Primary phone number |
| mobile | STRING(20) | NULL | Mobile phone number |
| address | TEXT | NULL | Owner's address |
| city | STRING(100) | NULL | City |
| country | STRING(100) | DEFAULT 'Malta' | Country |
| company_name | STRING(255) | NULL | Company name (if corporate) |
| tax_id | STRING(50) | NULL | Tax identification number |
| notes | TEXT | NULL | Additional notes |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `owners_email_idx` on `email` (unique)
- `owners_is_active_idx` on `is_active`

---

### 3. Agents

Real estate agents linked to user accounts.

**Table Name:** `agents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique agent identifier |
| user_id | UUID | NOT NULL, UNIQUE, FK→users | Link to user account |
| license_number | STRING(100) | UNIQUE | Agent license number |
| specialization | STRING(255) | NULL | Agent specialization areas |
| commission_rate | DECIMAL(5,2) | DEFAULT 0.00 | Commission percentage (0-100) |
| phone | STRING(20) | NULL | Office phone |
| mobile | STRING(20) | NULL | Mobile phone |
| office_address | TEXT | NULL | Office location |
| bio | TEXT | NULL | Agent biography |
| profile_image_url | STRING(500) | NULL | Profile image URL |
| languages | ARRAY(STRING) | DEFAULT ['English'] | Spoken languages |
| years_experience | INTEGER | DEFAULT 0 | Years of experience |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `agents_user_id_idx` on `user_id` (unique)
- `agents_license_number_idx` on `license_number` (unique)
- `agents_is_active_idx` on `is_active`

---

### 4. Properties

Property listings and details.

**Table Name:** `properties`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique property identifier |
| owner_id | UUID | NOT NULL, FK→owners | Property owner |
| agent_id | UUID | NULL, FK→agents | Assigned agent |
| title | STRING(255) | NOT NULL | Property title |
| description | TEXT | NULL | Full description |
| property_type | ENUM | NOT NULL | apartment, house, villa, townhouse, penthouse, maisonette, farmhouse, commercial, office, land, garage, other |
| listing_type | ENUM | NOT NULL, DEFAULT 'sale' | sale, rent, lease |
| status | ENUM | NOT NULL, DEFAULT 'draft' | available, under_offer, sold, rented, withdrawn, draft |
| price | DECIMAL(12,2) | NOT NULL | Property price |
| currency | STRING(3) | DEFAULT 'EUR' | Currency code |
| bedrooms | INTEGER | NULL | Number of bedrooms |
| bathrooms | INTEGER | NULL | Number of bathrooms |
| square_meters | DECIMAL(10,2) | NULL | Total area in m² |
| year_built | INTEGER | NULL | Construction year |
| floor_number | INTEGER | NULL | Floor number |
| total_floors | INTEGER | NULL | Total floors in building |
| address | TEXT | NOT NULL | Street address |
| city | STRING(100) | NOT NULL | City |
| region | STRING(100) | NULL | Region in Malta |
| postal_code | STRING(20) | NULL | Postal code |
| country | STRING(100) | DEFAULT 'Malta' | Country |
| latitude | DECIMAL(10,8) | NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NULL | GPS longitude |
| features | ARRAY(STRING) | DEFAULT [] | Property features |
| images | ARRAY(STRING) | DEFAULT [] | Image URLs |
| video_url | STRING(500) | NULL | Video tour URL |
| virtual_tour_url | STRING(500) | NULL | Virtual tour URL |
| energy_rating | ENUM | NULL | A, B, C, D, E, F, G, exempt |
| furnished | ENUM | NULL | furnished, semi-furnished, unfurnished |
| parking_spaces | INTEGER | DEFAULT 0 | Number of parking spaces |
| has_garden | BOOLEAN | DEFAULT false | Has garden |
| has_pool | BOOLEAN | DEFAULT false | Has swimming pool |
| has_terrace | BOOLEAN | DEFAULT false | Has terrace |
| has_balcony | BOOLEAN | DEFAULT false | Has balcony |
| pet_friendly | BOOLEAN | DEFAULT false | Pets allowed |
| view_count | INTEGER | DEFAULT 0 | View counter |
| featured | BOOLEAN | DEFAULT false | Featured listing |
| published_at | TIMESTAMP | NULL | Publication date |
| expires_at | TIMESTAMP | NULL | Expiration date |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `properties_owner_id_idx` on `owner_id`
- `properties_agent_id_idx` on `agent_id`
- `properties_property_type_idx` on `property_type`
- `properties_listing_type_idx` on `listing_type`
- `properties_status_idx` on `status`
- `properties_city_idx` on `city`
- `properties_price_idx` on `price`
- `properties_is_active_idx` on `is_active`
- `properties_featured_idx` on `featured`

---

### 5. Inquiries

Customer inquiries about properties.

**Table Name:** `inquiries`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique inquiry identifier |
| property_id | UUID | NOT NULL, FK→properties | Related property |
| agent_id | UUID | NULL, FK→agents | Assigned agent |
| client_name | STRING(200) | NOT NULL | Client name |
| client_email | STRING(255) | NOT NULL | Client email |
| client_phone | STRING(20) | NULL | Client phone |
| message | TEXT | NULL | Inquiry message |
| inquiry_type | ENUM | DEFAULT 'general' | viewing_request, information_request, make_offer, callback_request, general |
| status | ENUM | DEFAULT 'new' | new, contacted, in_progress, viewing_scheduled, offer_made, completed, cancelled |
| priority | ENUM | DEFAULT 'medium' | low, medium, high, urgent |
| preferred_viewing_date | TIMESTAMP | NULL | Requested viewing date |
| preferred_viewing_time | STRING(50) | NULL | Requested viewing time |
| offer_amount | DECIMAL(12,2) | NULL | Offer amount if applicable |
| source | STRING(100) | DEFAULT 'website' | Inquiry source |
| notes | TEXT | NULL | Internal notes |
| response_sent | BOOLEAN | DEFAULT false | Response sent flag |
| response_sent_at | TIMESTAMP | NULL | Response timestamp |
| followed_up | BOOLEAN | DEFAULT false | Follow-up flag |
| followed_up_at | TIMESTAMP | NULL | Follow-up timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `inquiries_property_id_idx` on `property_id`
- `inquiries_agent_id_idx` on `agent_id`
- `inquiries_client_email_idx` on `client_email`
- `inquiries_status_idx` on `status`
- `inquiries_inquiry_type_idx` on `inquiry_type`
- `inquiries_priority_idx` on `priority`
- `inquiries_created_at_idx` on `created_at`

---

### 6. Property Updates Queue

Queue for scheduled property updates.

**Table Name:** `property_updates_queue`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique queue item identifier |
| property_id | UUID | NOT NULL, FK→properties | Related property |
| update_type | ENUM | NOT NULL | price_change, status_change, details_update, images_update, new_listing, delisting, featured_update, other |
| old_value | JSONB | NULL | Previous value(s) |
| new_value | JSONB | NULL | New value(s) |
| description | TEXT | NULL | Update description |
| status | ENUM | DEFAULT 'pending' | pending, processing, completed, failed, cancelled |
| scheduled_for | TIMESTAMP | NULL | Scheduled execution time |
| processed_at | TIMESTAMP | NULL | Actual execution time |
| error_message | TEXT | NULL | Error message if failed |
| retry_count | INTEGER | DEFAULT 0 | Retry attempts |
| max_retries | INTEGER | DEFAULT 3 | Maximum retries |
| priority | INTEGER | DEFAULT 5 | Priority (1=highest, 10=lowest) |
| metadata | JSONB | DEFAULT {} | Additional metadata |
| created_by | UUID | NULL, FK→users | User who created the update |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `property_updates_queue_property_id_idx` on `property_id`
- `property_updates_queue_status_idx` on `status`
- `property_updates_queue_update_type_idx` on `update_type`
- `property_updates_queue_scheduled_for_idx` on `scheduled_for`
- `property_updates_queue_priority_idx` on `priority`
- `property_updates_queue_created_at_idx` on `created_at`

---

### 7. Automated Contact Logs

Logs for automated communications.

**Table Name:** `automated_contact_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log identifier |
| property_id | UUID | NULL, FK→properties | Related property |
| inquiry_id | UUID | NULL, FK→inquiries | Related inquiry |
| agent_id | UUID | NULL, FK→agents | Related agent |
| contact_type | ENUM | NOT NULL | email, sms, push_notification, webhook, system_notification |
| recipient_email | STRING(255) | NULL | Recipient email |
| recipient_phone | STRING(20) | NULL | Recipient phone |
| recipient_name | STRING(200) | NULL | Recipient name |
| subject | STRING(500) | NULL | Email subject |
| message | TEXT | NOT NULL | Message content |
| template_name | STRING(100) | NULL | Template used |
| template_variables | JSONB | DEFAULT {} | Template variables |
| status | ENUM | DEFAULT 'pending' | pending, sent, delivered, failed, bounced, opened, clicked |
| sent_at | TIMESTAMP | NULL | Sent timestamp |
| delivered_at | TIMESTAMP | NULL | Delivered timestamp |
| opened_at | TIMESTAMP | NULL | Opened timestamp |
| clicked_at | TIMESTAMP | NULL | Clicked timestamp |
| error_message | TEXT | NULL | Error message if failed |
| retry_count | INTEGER | DEFAULT 0 | Retry attempts |
| max_retries | INTEGER | DEFAULT 3 | Maximum retries |
| automation_trigger | STRING(100) | NULL | What triggered the contact |
| metadata | JSONB | DEFAULT {} | Additional metadata |
| external_id | STRING(255) | NULL | External service ID |
| created_at | TIMESTAMP | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `automated_contact_logs_property_id_idx` on `property_id`
- `automated_contact_logs_inquiry_id_idx` on `inquiry_id`
- `automated_contact_logs_agent_id_idx` on `agent_id`
- `automated_contact_logs_contact_type_idx` on `contact_type`
- `automated_contact_logs_status_idx` on `status`
- `automated_contact_logs_recipient_email_idx` on `recipient_email`
- `automated_contact_logs_automation_trigger_idx` on `automation_trigger`
- `automated_contact_logs_created_at_idx` on `created_at`
- `automated_contact_logs_sent_at_idx` on `sent_at`

---

## Relationships

### User-Agent (One-to-One)
- A `User` can have one `Agent` profile (user_id)
- An `Agent` belongs to one `User`
- **Cascade:** DELETE user → DELETE agent

### Owner-Property (One-to-Many)
- An `Owner` can have many `Properties`
- A `Property` belongs to one `Owner` (owner_id)
- **Restrict:** Cannot DELETE owner with properties

### Agent-Property (One-to-Many)
- An `Agent` can manage many `Properties`
- A `Property` can be assigned to one `Agent` (agent_id, nullable)
- **Set NULL:** DELETE agent → SET NULL on properties

### Property-Inquiry (One-to-Many)
- A `Property` can have many `Inquiries`
- An `Inquiry` belongs to one `Property` (property_id)
- **Cascade:** DELETE property → DELETE inquiries

### Agent-Inquiry (One-to-Many)
- An `Agent` can handle many `Inquiries`
- An `Inquiry` can be assigned to one `Agent` (agent_id, nullable)
- **Set NULL:** DELETE agent → SET NULL on inquiries

### Property-PropertyUpdateQueue (One-to-Many)
- A `Property` can have many update queue items
- A queue item belongs to one `Property` (property_id)
- **Cascade:** DELETE property → DELETE queue items

### User-PropertyUpdateQueue (One-to-Many)
- A `User` can create many update queue items
- A queue item has one creator `User` (created_by, nullable)
- **Set NULL:** DELETE user → SET NULL on queue items

### Property-AutomatedContactLog (One-to-Many)
- A `Property` can have many contact logs
- A log can relate to one `Property` (property_id, nullable)
- **Set NULL:** DELETE property → SET NULL on logs

### Inquiry-AutomatedContactLog (One-to-Many)
- An `Inquiry` can have many contact logs
- A log can relate to one `Inquiry` (inquiry_id, nullable)
- **Set NULL:** DELETE inquiry → SET NULL on logs

### Agent-AutomatedContactLog (One-to-Many)
- An `Agent` can have many contact logs
- A log can relate to one `Agent` (agent_id, nullable)
- **Set NULL:** DELETE agent → SET NULL on logs

---

## Setup Instructions

### Prerequisites

- PostgreSQL 12 or higher
- Node.js 14 or higher
- npm or yarn

### Initial Setup

1. **Create the database:**
   ```bash
   psql -U postgres
   CREATE DATABASE malta_crm;
   \q
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and update the database configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=malta_crm
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```

3. **Run migrations:**
   ```bash
   npm run db:migrate
   ```
   
   This will create all database tables with proper constraints and indexes.

4. **Seed the database (optional - for development):**
   ```bash
   npm run db:seed
   ```
   
   This will populate the database with sample data for testing.

### Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run all pending migrations |
| `npm run db:migrate:undo` | Rollback the last migration |
| `npm run db:migrate:undo:all` | Rollback all migrations |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo the last seeder |
| `npm run db:seed:undo:all` | Undo all seeders |
| `npm run db:reset` | Reset and reseed database |

### Creating New Migrations

To create a new migration:
```bash
npx sequelize-cli migration:generate --name your-migration-name
```

Edit the generated file in `src/migrations/` with your changes.

### Creating New Seeders

To create a new seeder:
```bash
npx sequelize-cli seed:generate --name your-seeder-name
```

Edit the generated file in `src/seeders/` with your test data.

---

## Sample Data

The seeders provide comprehensive test data including:

- **6 Users:** 1 admin, 3 agents, 2 clients (password: `Password123!`)
- **5 Owners:** Various property owners with different profiles
- **3 Agents:** Real estate agents with different specializations
- **8 Properties:** Mix of apartments, villas, townhouses, commercial spaces
- **8 Inquiries:** Various types of customer inquiries
- **7 Property Updates:** Scheduled and completed property updates
- **8 Contact Logs:** Automated email, SMS, and notification logs

### Test User Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@maltarealestate.com | Password123! | admin |
| john.smith@maltarealestate.com | Password123! | agent |
| maria.garcia@maltarealestate.com | Password123! | agent |
| david.borg@maltarealestate.com | Password123! | agent |
| client1@example.com | Password123! | user |
| client2@example.com | Password123! | user |

---

## Best Practices

1. **Always use migrations** for schema changes - never modify the database directly
2. **Use transactions** when performing multiple related operations
3. **Add indexes** for frequently queried columns
4. **Use ENUM types** for columns with fixed value sets
5. **Set appropriate foreign key constraints** (CASCADE, SET NULL, RESTRICT)
6. **Use JSONB** for flexible metadata storage
7. **Always validate data** at the application layer before database operations
8. **Use UUID** for primary keys to avoid conflicts in distributed systems
9. **Add timestamps** to all tables for audit trails
10. **Document all schema changes** in migration files with clear descriptions

---

## Maintenance

### Backup

Regular backups are essential:
```bash
pg_dump -U postgres malta_crm > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

To restore from backup:
```bash
psql -U postgres malta_crm < backup_file.sql
```

### Performance Monitoring

Monitor query performance and add indexes as needed:
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan ASC;
```

---

## Troubleshooting

### Common Issues

1. **Migration fails:**
   - Check database connection in `.env`
   - Ensure PostgreSQL is running
   - Check for syntax errors in migration files

2. **Seeder fails:**
   - Ensure migrations have been run first
   - Check for foreign key constraint violations
   - Verify data types match model definitions

3. **Connection errors:**
   - Verify PostgreSQL is running: `sudo service postgresql status`
   - Check firewall settings
   - Verify credentials in `.env`

---

## Support

For issues or questions:
1. Check the main README.md
2. Review Sequelize documentation: https://sequelize.org/docs/v6/
3. Open an issue on GitHub

---

**Last Updated:** January 2024  
**Schema Version:** 1.0.0
