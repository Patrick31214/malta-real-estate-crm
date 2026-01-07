<?php
/**
 * Security class for handling authentication, authorization, and data protection.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Security class.
 */
class Malta_RE_CRM_Security {

    /**
     * Single instance.
     *
     * @var Malta_RE_CRM_Security
     */
    private static $instance = null;

    /**
     * Get instance.
     *
     * @return Malta_RE_CRM_Security
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
        add_action( 'init', array( $this, 'init_security' ) );
    }

    /**
     * Initialize security features.
     */
    public function init_security() {
        // Add security headers
        add_action( 'send_headers', array( $this, 'add_security_headers' ) );
    }

    /**
     * Add security headers.
     */
    public function add_security_headers() {
        header( 'X-Content-Type-Options: nosniff' );
        header( 'X-Frame-Options: SAMEORIGIN' );
        header( 'X-XSS-Protection: 1; mode=block' );
        header( 'Referrer-Policy: strict-origin-when-cross-origin' );
    }

    /**
     * Verify nonce for AJAX requests.
     *
     * @param string $nonce Nonce value.
     * @return bool True if valid, false otherwise.
     */
    public static function verify_nonce( $nonce ) {
        return wp_verify_nonce( $nonce, 'malta_re_crm_nonce' );
    }

    /**
     * Check if current user has permission for an action.
     *
     * @param string $action Action to check.
     * @param int    $entity_id Optional entity ID for ownership check.
     * @return bool True if permitted, false otherwise.
     */
    public static function check_permission( $action, $entity_id = 0 ) {
        if ( ! is_user_logged_in() ) {
            return false;
        }

        $user = wp_get_current_user();

        switch ( $action ) {
            case 'manage_properties':
                return current_user_can( 'manage_properties' ) || current_user_can( 'manage_options' );

            case 'manage_own_properties':
                if ( current_user_can( 'manage_properties' ) || current_user_can( 'manage_options' ) ) {
                    return true;
                }
                if ( $entity_id > 0 && current_user_can( 'manage_own_properties' ) ) {
                    return self::is_entity_owner( 'property', $entity_id, $user->ID );
                }
                return false;

            case 'manage_contacts':
                return current_user_can( 'manage_contacts' ) || current_user_can( 'manage_options' );

            case 'manage_agents':
                return current_user_can( 'manage_agents' ) || current_user_can( 'manage_options' );

            case 'schedule_viewings':
                return current_user_can( 'schedule_viewings' ) || current_user_can( 'manage_options' );

            case 'view_all_properties':
                return current_user_can( 'view_all_properties' ) || current_user_can( 'manage_options' );

            case 'manage_crm_settings':
                return current_user_can( 'manage_crm_settings' ) || current_user_can( 'manage_options' );

            case 'export_crm_data':
                return current_user_can( 'export_crm_data' ) || current_user_can( 'manage_options' );

            default:
                return false;
        }
    }

    /**
     * Check if user owns an entity.
     *
     * @param string $entity_type Entity type (property, contact, etc.).
     * @param int    $entity_id Entity ID.
     * @param int    $user_id User ID.
     * @return bool True if owner, false otherwise.
     */
    private static function is_entity_owner( $entity_type, $entity_id, $user_id ) {
        global $wpdb;

        switch ( $entity_type ) {
            case 'property':
                $table = $wpdb->prefix . 'malta_re_properties';
                $owner_id = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT owner_id FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                        $entity_id
                    )
                );
                return (int) $owner_id === (int) $user_id;

            case 'contact':
                $table = $wpdb->prefix . 'malta_re_contacts';
                $creator_id = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT created_by FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                        $entity_id
                    )
                );
                return (int) $creator_id === (int) $user_id;

            default:
                return false;
        }
    }

    /**
     * Sanitize property data.
     *
     * @param array $data Property data.
     * @return array Sanitized data.
     */
    public static function sanitize_property_data( $data ) {
        return array(
            'title'         => isset( $data['title'] ) ? sanitize_text_field( $data['title'] ) : '',
            'description'   => isset( $data['description'] ) ? wp_kses_post( $data['description'] ) : '',
            'property_type' => isset( $data['property_type'] ) ? sanitize_text_field( $data['property_type'] ) : '',
            'status'        => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'available',
            'price'         => isset( $data['price'] ) ? floatval( $data['price'] ) : 0,
            'currency'      => isset( $data['currency'] ) ? sanitize_text_field( $data['currency'] ) : 'EUR',
            'bedrooms'      => isset( $data['bedrooms'] ) ? intval( $data['bedrooms'] ) : 0,
            'bathrooms'     => isset( $data['bathrooms'] ) ? intval( $data['bathrooms'] ) : 0,
            'area'          => isset( $data['area'] ) ? floatval( $data['area'] ) : 0,
            'area_unit'     => isset( $data['area_unit'] ) ? sanitize_text_field( $data['area_unit'] ) : 'sqm',
            'address'       => isset( $data['address'] ) ? sanitize_textarea_field( $data['address'] ) : '',
            'city'          => isset( $data['city'] ) ? sanitize_text_field( $data['city'] ) : '',
            'region'        => isset( $data['region'] ) ? sanitize_text_field( $data['region'] ) : '',
            'postal_code'   => isset( $data['postal_code'] ) ? sanitize_text_field( $data['postal_code'] ) : '',
            'latitude'      => isset( $data['latitude'] ) ? floatval( $data['latitude'] ) : null,
            'longitude'     => isset( $data['longitude'] ) ? floatval( $data['longitude'] ) : null,
            'owner_id'      => isset( $data['owner_id'] ) ? intval( $data['owner_id'] ) : 0,
            'agent_id'      => isset( $data['agent_id'] ) ? intval( $data['agent_id'] ) : 0,
            'featured'      => isset( $data['featured'] ) ? (bool) $data['featured'] : false,
        );
    }

    /**
     * Sanitize contact data.
     *
     * @param array $data Contact data.
     * @return array Sanitized data.
     */
    public static function sanitize_contact_data( $data ) {
        return array(
            'user_id'           => isset( $data['user_id'] ) ? intval( $data['user_id'] ) : null,
            'first_name'        => isset( $data['first_name'] ) ? sanitize_text_field( $data['first_name'] ) : '',
            'last_name'         => isset( $data['last_name'] ) ? sanitize_text_field( $data['last_name'] ) : '',
            'email'             => isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '',
            'phone'             => isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '',
            'mobile'            => isset( $data['mobile'] ) ? sanitize_text_field( $data['mobile'] ) : '',
            'contact_type'      => isset( $data['contact_type'] ) ? sanitize_text_field( $data['contact_type'] ) : '',
            'status'            => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'active',
            'address'           => isset( $data['address'] ) ? sanitize_textarea_field( $data['address'] ) : '',
            'city'              => isset( $data['city'] ) ? sanitize_text_field( $data['city'] ) : '',
            'postal_code'       => isset( $data['postal_code'] ) ? sanitize_text_field( $data['postal_code'] ) : '',
            'notes'             => isset( $data['notes'] ) ? sanitize_textarea_field( $data['notes'] ) : '',
            'assigned_agent_id' => isset( $data['assigned_agent_id'] ) ? intval( $data['assigned_agent_id'] ) : null,
            'source'            => isset( $data['source'] ) ? sanitize_text_field( $data['source'] ) : '',
        );
    }

    /**
     * Validate email.
     *
     * @param string $email Email address.
     * @return bool True if valid, false otherwise.
     */
    public static function validate_email( $email ) {
        return is_email( $email );
    }

    /**
     * Sanitize output for display.
     *
     * @param string $value Value to sanitize.
     * @return string Sanitized value.
     */
    public static function sanitize_output( $value ) {
        return esc_html( $value );
    }
}
