<?php
/**
 * Plugin Name: Malta Real Estate CRM
 * Plugin URI: https://github.com/Patrick31214/malta-real-estate-crm
 * Description: A secure, scalable private CRM system for real estate agents and property owners in Malta, integrated with WordPress Elementor Pro
 * Version: 1.0.0
 * Author: Malta Real Estate
 * Author URI: https://maltarealestate.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: malta-re-crm
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants.
define( 'MALTA_RE_CRM_VERSION', '1.0.0' );
define( 'MALTA_RE_CRM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MALTA_RE_CRM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MALTA_RE_CRM_PLUGIN_FILE', __FILE__ );

/**
 * Main plugin class.
 */
class Malta_Real_Estate_CRM {

    /**
     * Single instance of the class.
     *
     * @var Malta_Real_Estate_CRM
     */
    private static $instance = null;

    /**
     * Get single instance.
     *
     * @return Malta_Real_Estate_CRM
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
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load required dependencies.
     */
    private function load_dependencies() {
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-database.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-properties.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-contacts.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-agents.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-admin.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-rest-api.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/class-security.php';
        
        // Load Elementor integration if Elementor is active
        if ( did_action( 'elementor/loaded' ) ) {
            require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/elementor/class-elementor-integration.php';
        }
    }

    /**
     * Initialize WordPress hooks.
     */
    private function init_hooks() {
        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
        
        add_action( 'plugins_loaded', array( $this, 'init' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
    }

    /**
     * Plugin activation.
     */
    public function activate() {
        Malta_RE_CRM_Database::create_tables();
        $this->create_default_roles();
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation.
     */
    public function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Initialize plugin.
     */
    public function init() {
        // Initialize components
        Malta_RE_CRM_Admin::get_instance();
        Malta_RE_CRM_REST_API::get_instance();
        Malta_RE_CRM_Security::get_instance();
        
        // Load text domain for translations
        load_plugin_textdomain( 'malta-re-crm', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    /**
     * Enqueue admin assets.
     *
     * @param string $hook Current admin page hook.
     */
    public function enqueue_admin_assets( $hook ) {
        // Only load on our admin pages
        if ( strpos( $hook, 'malta-re-crm' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'malta-re-crm-admin',
            MALTA_RE_CRM_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            MALTA_RE_CRM_VERSION
        );

        wp_enqueue_script(
            'malta-re-crm-admin',
            MALTA_RE_CRM_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery', 'wp-api' ),
            MALTA_RE_CRM_VERSION,
            true
        );

        wp_localize_script(
            'malta-re-crm-admin',
            'maltaRECRM',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'restUrl' => rest_url( 'malta-re-crm/v1' ),
                'nonce'   => wp_create_nonce( 'malta_re_crm_nonce' ),
            )
        );
    }

    /**
     * Enqueue frontend assets.
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'malta-re-crm-frontend',
            MALTA_RE_CRM_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            MALTA_RE_CRM_VERSION
        );

        wp_enqueue_script(
            'malta-re-crm-frontend',
            MALTA_RE_CRM_PLUGIN_URL . 'assets/js/frontend.js',
            array( 'jquery' ),
            MALTA_RE_CRM_VERSION,
            true
        );

        wp_localize_script(
            'malta-re-crm-frontend',
            'maltaRECRM',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'restUrl' => rest_url( 'malta-re-crm/v1' ),
                'nonce'   => wp_create_nonce( 'malta_re_crm_nonce' ),
            )
        );
    }

    /**
     * Create default user roles.
     */
    private function create_default_roles() {
        // Property Owner role
        add_role(
            'property_owner',
            __( 'Property Owner', 'malta-re-crm' ),
            array(
                'read'                   => true,
                'manage_own_properties'  => true,
                'view_property_stats'    => true,
            )
        );

        // Real Estate Agent role
        add_role(
            're_agent',
            __( 'Real Estate Agent', 'malta-re-crm' ),
            array(
                'read'                    => true,
                'manage_properties'       => true,
                'manage_contacts'         => true,
                'schedule_viewings'       => true,
                'view_all_properties'     => true,
            )
        );

        // CRM Manager role
        add_role(
            'crm_manager',
            __( 'CRM Manager', 'malta-re-crm' ),
            array(
                'read'                    => true,
                'manage_properties'       => true,
                'manage_contacts'         => true,
                'manage_agents'           => true,
                'schedule_viewings'       => true,
                'view_all_properties'     => true,
                'manage_crm_settings'     => true,
                'export_crm_data'         => true,
            )
        );
    }
}

/**
 * Initialize the plugin.
 */
function malta_re_crm_init() {
    return Malta_Real_Estate_CRM::get_instance();
}

// Start the plugin.
malta_re_crm_init();
