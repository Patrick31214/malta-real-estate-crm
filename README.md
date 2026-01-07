# Malta Real Estate CRM

A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro.

## Features

### Core CRM Functionality
- **Property Management**: Complete CRUD operations for property listings
- **Contact Management**: Lead and client tracking with full contact information
- **Agent Management**: Agent profiles with statistics and performance tracking
- **Viewing Scheduler**: Appointment scheduling for property viewings
- **Activity Logging**: Track all CRM activities and interactions

### Security Features
- **Role-Based Access Control**: Custom user roles (Property Owner, Real Estate Agent, CRM Manager)
- **Permission System**: Granular permissions for different actions
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **SQL Injection Prevention**: Prepared statements for all database queries
- **CSRF Protection**: Nonce validation for all forms and AJAX requests
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Data Validation**: Email validation and data type checking

### Elementor Pro Integration
Custom Elementor widgets included:
- **Property Listing Widget**: Display properties in a grid layout
- **Property Search Widget**: Advanced search form for properties
- **Contact Form Widget**: Lead capture form integrated with CRM
- **Agent Profile Widget**: Display agent information and statistics

### REST API
Full REST API for CRM operations:
- Properties endpoint (`/malta-re-crm/v1/properties`)
- Contacts endpoint (`/malta-re-crm/v1/contacts`)
- Agents endpoint (`/malta-re-crm/v1/agents`)

## Installation

1. Upload the plugin files to `/wp-content/plugins/malta-real-estate-crm/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to 'RE CRM' in the WordPress admin menu
4. Configure settings as needed

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Elementor Pro (optional, for widget integration)

## User Roles

### Property Owner
- Manage own properties
- View property statistics

### Real Estate Agent
- Manage properties
- Manage contacts and leads
- Schedule property viewings
- View all properties

### CRM Manager
- Full access to all CRM features
- Manage agents
- Export CRM data
- Configure CRM settings

## Database Schema

The plugin creates the following tables:
- `wp_malta_re_properties` - Property listings
- `wp_malta_re_contacts` - Contacts and leads
- `wp_malta_re_agents` - Agent profiles
- `wp_malta_re_viewings` - Scheduled viewings
- `wp_malta_re_activities` - Activity logs

## Security Best Practices

This plugin implements multiple security layers:

1. **Authentication & Authorization**: Proper WordPress user authentication and role-based access control
2. **Data Sanitization**: All inputs sanitized using WordPress sanitization functions
3. **Data Validation**: Email validation, type checking, and business logic validation
4. **Output Escaping**: All outputs properly escaped to prevent XSS
5. **Prepared Statements**: All database queries use prepared statements
6. **Nonce Verification**: All forms and AJAX requests include nonce verification
7. **HTTPS Ready**: Designed to work with HTTPS for secure data transmission

## API Usage

### Get Properties
```
GET /wp-json/malta-re-crm/v1/properties
```

### Create Property
```
POST /wp-json/malta-re-crm/v1/properties
Content-Type: application/json
X-WP-Nonce: {nonce}

{
  "title": "Beautiful Apartment in Valletta",
  "property_type": "apartment",
  "price": 350000,
  "bedrooms": 3,
  "bathrooms": 2,
  "city": "Valletta"
}
```

### Get Contacts
```
GET /wp-json/malta-re-crm/v1/contacts
```

## Customization

### Adding Custom Property Types
Property types can be customized by modifying the Elementor widget options or by filtering the property types in your theme.

### Styling
The plugin includes default styles that can be overridden by your theme:
- `/assets/css/admin.css` - Admin interface styles
- `/assets/css/frontend.css` - Frontend widget styles

## Support

For support, please open an issue on GitHub.

## License

GPL-2.0-or-later

## Author

Malta Real Estate

## Changelog

### Version 1.0.0
- Initial release
- Property management
- Contact management
- Agent management
- Viewing scheduler
- Elementor Pro integration
- REST API
- Security features
- Role-based access control
