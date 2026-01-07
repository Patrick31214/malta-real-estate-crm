<?php
/**
 * Admin interface class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Admin class.
 */
class Malta_RE_CRM_Admin {

    /**
     * Single instance.
     *
     * @var Malta_RE_CRM_Admin
     */
    private static $instance = null;

    /**
     * Get instance.
     *
     * @return Malta_RE_CRM_Admin
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    private function __construct() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
    }

    /**
     * Add admin menu.
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'Malta RE CRM', 'malta-re-crm' ),
            __( 'RE CRM', 'malta-re-crm' ),
            'manage_options',
            'malta-re-crm',
            array( $this, 'render_dashboard' ),
            'dashicons-building',
            30
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Dashboard', 'malta-re-crm' ),
            __( 'Dashboard', 'malta-re-crm' ),
            'manage_options',
            'malta-re-crm',
            array( $this, 'render_dashboard' )
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Properties', 'malta-re-crm' ),
            __( 'Properties', 'malta-re-crm' ),
            'manage_properties',
            'malta-re-crm-properties',
            array( $this, 'render_properties' )
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Contacts', 'malta-re-crm' ),
            __( 'Contacts', 'malta-re-crm' ),
            'manage_contacts',
            'malta-re-crm-contacts',
            array( $this, 'render_contacts' )
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Agents', 'malta-re-crm' ),
            __( 'Agents', 'malta-re-crm' ),
            'manage_agents',
            'malta-re-crm-agents',
            array( $this, 'render_agents' )
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Viewings', 'malta-re-crm' ),
            __( 'Viewings', 'malta-re-crm' ),
            'schedule_viewings',
            'malta-re-crm-viewings',
            array( $this, 'render_viewings' )
        );

        add_submenu_page(
            'malta-re-crm',
            __( 'Settings', 'malta-re-crm' ),
            __( 'Settings', 'malta-re-crm' ),
            'manage_crm_settings',
            'malta-re-crm-settings',
            array( $this, 'render_settings' )
        );
    }

    /**
     * Register settings.
     */
    public function register_settings() {
        register_setting( 'malta_re_crm_settings', 'malta_re_crm_currency' );
        register_setting( 'malta_re_crm_settings', 'malta_re_crm_default_commission' );
        register_setting( 'malta_re_crm_settings', 'malta_re_crm_property_types' );
        register_setting( 'malta_re_crm_settings', 'malta_re_crm_contact_types' );
    }

    /**
     * Render dashboard page.
     */
    public function render_dashboard() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        $stats = $this->get_dashboard_stats();

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/dashboard.php';
    }

    /**
     * Render properties page.
     */
    public function render_properties() {
        if ( ! current_user_can( 'manage_properties' ) && ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        $properties = Malta_RE_CRM_Properties::get_all( array( 'limit' => 50 ) );

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/properties.php';
    }

    /**
     * Render contacts page.
     */
    public function render_contacts() {
        if ( ! current_user_can( 'manage_contacts' ) && ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        $contacts = Malta_RE_CRM_Contacts::get_all( array( 'limit' => 50 ) );

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/contacts.php';
    }

    /**
     * Render agents page.
     */
    public function render_agents() {
        if ( ! current_user_can( 'manage_agents' ) && ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        $agents = Malta_RE_CRM_Agents::get_all( array( 'limit' => 50 ) );

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/agents.php';
    }

    /**
     * Render viewings page.
     */
    public function render_viewings() {
        if ( ! current_user_can( 'schedule_viewings' ) && ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/viewings.php';
    }

    /**
     * Render settings page.
     */
    public function render_settings() {
        if ( ! current_user_can( 'manage_crm_settings' ) && ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'malta-re-crm' ) );
        }

        include MALTA_RE_CRM_PLUGIN_DIR . 'templates/admin/settings.php';
    }

    /**
     * Get dashboard statistics.
     *
     * @return array Dashboard statistics.
     */
    private function get_dashboard_stats() {
        return array(
            'total_properties'      => Malta_RE_CRM_Properties::get_count(),
            'available_properties'  => Malta_RE_CRM_Properties::get_count( array( 'status' => 'available' ) ),
            'total_contacts'        => Malta_RE_CRM_Contacts::get_count(),
            'active_contacts'       => Malta_RE_CRM_Contacts::get_count( array( 'status' => 'active' ) ),
        );
    }
}
