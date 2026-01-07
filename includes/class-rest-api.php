<?php
/**
 * REST API class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * REST API class.
 */
class Malta_RE_CRM_REST_API {

    /**
     * Single instance.
     *
     * @var Malta_RE_CRM_REST_API
     */
    private static $instance = null;

    /**
     * API namespace.
     *
     * @var string
     */
    private $namespace = 'malta-re-crm/v1';

    /**
     * Get instance.
     *
     * @return Malta_RE_CRM_REST_API
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
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register REST API routes.
     */
    public function register_routes() {
        // Properties endpoints
        register_rest_route(
            $this->namespace,
            '/properties',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_properties' ),
                'permission_callback' => array( $this, 'check_read_permission' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/properties/(?P<id>\d+)',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_property' ),
                'permission_callback' => array( $this, 'check_read_permission' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/properties',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'create_property' ),
                'permission_callback' => array( $this, 'check_manage_properties_permission' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/properties/(?P<id>\d+)',
            array(
                'methods'             => 'PUT',
                'callback'            => array( $this, 'update_property' ),
                'permission_callback' => array( $this, 'check_manage_properties_permission' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/properties/(?P<id>\d+)',
            array(
                'methods'             => 'DELETE',
                'callback'            => array( $this, 'delete_property' ),
                'permission_callback' => array( $this, 'check_manage_properties_permission' ),
            )
        );

        // Contacts endpoints
        register_rest_route(
            $this->namespace,
            '/contacts',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_contacts' ),
                'permission_callback' => array( $this, 'check_manage_contacts_permission' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/contacts',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'create_contact' ),
                'permission_callback' => array( $this, 'check_manage_contacts_permission' ),
            )
        );

        // Agents endpoints
        register_rest_route(
            $this->namespace,
            '/agents',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_agents' ),
                'permission_callback' => array( $this, 'check_read_permission' ),
            )
        );
    }

    /**
     * Get properties.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function get_properties( $request ) {
        $args = array(
            'limit'  => $request->get_param( 'limit' ) ? intval( $request->get_param( 'limit' ) ) : 20,
            'offset' => $request->get_param( 'offset' ) ? intval( $request->get_param( 'offset' ) ) : 0,
        );

        if ( $request->get_param( 'status' ) ) {
            $args['status'] = sanitize_text_field( $request->get_param( 'status' ) );
        }

        if ( $request->get_param( 'property_type' ) ) {
            $args['property_type'] = sanitize_text_field( $request->get_param( 'property_type' ) );
        }

        $properties = Malta_RE_CRM_Properties::get_all( $args );

        return new WP_REST_Response( $properties, 200 );
    }

    /**
     * Get single property.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function get_property( $request ) {
        $property_id = intval( $request->get_param( 'id' ) );
        $property = Malta_RE_CRM_Properties::get( $property_id );

        if ( ! $property ) {
            return new WP_REST_Response( array( 'error' => 'Property not found' ), 404 );
        }

        return new WP_REST_Response( $property, 200 );
    }

    /**
     * Create property.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function create_property( $request ) {
        $data = $request->get_json_params();

        $property_id = Malta_RE_CRM_Properties::create( $data );

        if ( ! $property_id ) {
            return new WP_REST_Response( array( 'error' => 'Failed to create property' ), 400 );
        }

        return new WP_REST_Response( array( 'id' => $property_id, 'message' => 'Property created successfully' ), 201 );
    }

    /**
     * Update property.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function update_property( $request ) {
        $property_id = intval( $request->get_param( 'id' ) );
        $data = $request->get_json_params();

        $updated = Malta_RE_CRM_Properties::update( $property_id, $data );

        if ( ! $updated ) {
            return new WP_REST_Response( array( 'error' => 'Failed to update property' ), 400 );
        }

        return new WP_REST_Response( array( 'message' => 'Property updated successfully' ), 200 );
    }

    /**
     * Delete property.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function delete_property( $request ) {
        $property_id = intval( $request->get_param( 'id' ) );

        $deleted = Malta_RE_CRM_Properties::delete( $property_id );

        if ( ! $deleted ) {
            return new WP_REST_Response( array( 'error' => 'Failed to delete property' ), 400 );
        }

        return new WP_REST_Response( array( 'message' => 'Property deleted successfully' ), 200 );
    }

    /**
     * Get contacts.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function get_contacts( $request ) {
        $args = array(
            'limit'  => $request->get_param( 'limit' ) ? intval( $request->get_param( 'limit' ) ) : 20,
            'offset' => $request->get_param( 'offset' ) ? intval( $request->get_param( 'offset' ) ) : 0,
        );

        $contacts = Malta_RE_CRM_Contacts::get_all( $args );

        return new WP_REST_Response( $contacts, 200 );
    }

    /**
     * Create contact.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function create_contact( $request ) {
        $data = $request->get_json_params();

        $contact_id = Malta_RE_CRM_Contacts::create( $data );

        if ( ! $contact_id ) {
            return new WP_REST_Response( array( 'error' => 'Failed to create contact' ), 400 );
        }

        return new WP_REST_Response( array( 'id' => $contact_id, 'message' => 'Contact created successfully' ), 201 );
    }

    /**
     * Get agents.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response Response object.
     */
    public function get_agents( $request ) {
        $agents = Malta_RE_CRM_Agents::get_all();

        return new WP_REST_Response( $agents, 200 );
    }

    /**
     * Check read permission.
     *
     * @return bool True if permitted.
     */
    public function check_read_permission() {
        return is_user_logged_in();
    }

    /**
     * Check manage properties permission.
     *
     * @return bool True if permitted.
     */
    public function check_manage_properties_permission() {
        return Malta_RE_CRM_Security::check_permission( 'manage_properties' );
    }

    /**
     * Check manage contacts permission.
     *
     * @return bool True if permitted.
     */
    public function check_manage_contacts_permission() {
        return Malta_RE_CRM_Security::check_permission( 'manage_contacts' );
    }
}
