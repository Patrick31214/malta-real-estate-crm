<?php
/**
 * Uninstall script for Malta Real Estate CRM.
 *
 * This file is executed when the plugin is deleted via WordPress admin.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly or not during uninstall.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Load database class.
require_once plugin_dir_path( __FILE__ ) . 'includes/class-database.php';

// Remove all database tables.
Malta_RE_CRM_Database::drop_tables();

// Remove custom roles.
remove_role( 'property_owner' );
remove_role( 're_agent' );
remove_role( 'crm_manager' );

// Remove plugin options.
delete_option( 'malta_re_crm_currency' );
delete_option( 'malta_re_crm_default_commission' );
delete_option( 'malta_re_crm_property_types' );
delete_option( 'malta_re_crm_contact_types' );
delete_option( 'malta_re_crm_db_version' );
