<?php
/**
 * Database management class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Database class for creating and managing CRM tables.
 */
class Malta_RE_CRM_Database {

    /**
     * Create database tables.
     */
    public static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // Properties table
        $table_properties = $wpdb->prefix . 'malta_re_properties';
        $sql_properties = "CREATE TABLE IF NOT EXISTS $table_properties (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description longtext,
            property_type varchar(50) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'available',
            price decimal(15,2) NOT NULL,
            currency varchar(10) DEFAULT 'EUR',
            bedrooms int(11) DEFAULT 0,
            bathrooms int(11) DEFAULT 0,
            area decimal(10,2),
            area_unit varchar(20) DEFAULT 'sqm',
            address text,
            city varchar(100),
            region varchar(100),
            postal_code varchar(20),
            latitude decimal(10,8),
            longitude decimal(11,8),
            owner_id bigint(20) UNSIGNED,
            agent_id bigint(20) UNSIGNED,
            featured tinyint(1) DEFAULT 0,
            images longtext,
            documents longtext,
            created_by bigint(20) UNSIGNED NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY owner_id (owner_id),
            KEY agent_id (agent_id),
            KEY status (status),
            KEY property_type (property_type)
        ) $charset_collate;";

        // Contacts table
        $table_contacts = $wpdb->prefix . 'malta_re_contacts';
        $sql_contacts = "CREATE TABLE IF NOT EXISTS $table_contacts (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED,
            first_name varchar(100) NOT NULL,
            last_name varchar(100) NOT NULL,
            email varchar(100) NOT NULL,
            phone varchar(50),
            mobile varchar(50),
            contact_type varchar(50) NOT NULL,
            status varchar(50) DEFAULT 'active',
            address text,
            city varchar(100),
            postal_code varchar(20),
            notes longtext,
            preferences longtext,
            assigned_agent_id bigint(20) UNSIGNED,
            source varchar(100),
            created_by bigint(20) UNSIGNED NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY email (email),
            KEY contact_type (contact_type),
            KEY assigned_agent_id (assigned_agent_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Agents table
        $table_agents = $wpdb->prefix . 'malta_re_agents';
        $sql_agents = "CREATE TABLE IF NOT EXISTS $table_agents (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id bigint(20) UNSIGNED NOT NULL,
            license_number varchar(100),
            specialization varchar(100),
            bio longtext,
            photo_url varchar(255),
            phone varchar(50),
            mobile varchar(50),
            office_location varchar(255),
            status varchar(50) DEFAULT 'active',
            commission_rate decimal(5,2),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_id (user_id),
            KEY status (status)
        ) $charset_collate;";

        // Viewings/Appointments table
        $table_viewings = $wpdb->prefix . 'malta_re_viewings';
        $sql_viewings = "CREATE TABLE IF NOT EXISTS $table_viewings (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            property_id bigint(20) UNSIGNED NOT NULL,
            contact_id bigint(20) UNSIGNED NOT NULL,
            agent_id bigint(20) UNSIGNED NOT NULL,
            viewing_date datetime NOT NULL,
            duration int(11) DEFAULT 60,
            status varchar(50) DEFAULT 'scheduled',
            notes longtext,
            feedback longtext,
            created_by bigint(20) UNSIGNED NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY property_id (property_id),
            KEY contact_id (contact_id),
            KEY agent_id (agent_id),
            KEY viewing_date (viewing_date),
            KEY status (status)
        ) $charset_collate;";

        // Activities/Notes table
        $table_activities = $wpdb->prefix . 'malta_re_activities';
        $sql_activities = "CREATE TABLE IF NOT EXISTS $table_activities (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            activity_type varchar(50) NOT NULL,
            entity_type varchar(50) NOT NULL,
            entity_id bigint(20) UNSIGNED NOT NULL,
            title varchar(255) NOT NULL,
            description longtext,
            user_id bigint(20) UNSIGNED NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY entity_type (entity_type),
            KEY entity_id (entity_id),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql_properties );
        dbDelta( $sql_contacts );
        dbDelta( $sql_agents );
        dbDelta( $sql_viewings );
        dbDelta( $sql_activities );

        // Store database version
        update_option( 'malta_re_crm_db_version', '1.0.0' );
    }

    /**
     * Drop all tables (used for uninstallation).
     */
    public static function drop_tables() {
        global $wpdb;

        $tables = array(
            $wpdb->prefix . 'malta_re_properties',
            $wpdb->prefix . 'malta_re_contacts',
            $wpdb->prefix . 'malta_re_agents',
            $wpdb->prefix . 'malta_re_viewings',
            $wpdb->prefix . 'malta_re_activities',
        );

        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS $table" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }

        delete_option( 'malta_re_crm_db_version' );
    }
}
