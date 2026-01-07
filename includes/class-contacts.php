<?php
/**
 * Contacts management class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Contacts class.
 */
class Malta_RE_CRM_Contacts {

    /**
     * Get contact by ID.
     *
     * @param int $contact_id Contact ID.
     * @return object|null Contact object or null if not found.
     */
    public static function get( $contact_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_contacts';

        $contact = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $contact_id
            )
        );

        return $contact;
    }

    /**
     * Get all contacts with filters.
     *
     * @param array $args Query arguments.
     * @return array Array of contact objects.
     */
    public static function get_all( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_contacts';

        $defaults = array(
            'contact_type'      => '',
            'status'            => '',
            'assigned_agent_id' => 0,
            'search'            => '',
            'orderby'           => 'created_at',
            'order'             => 'DESC',
            'limit'             => 20,
            'offset'            => 0,
        );

        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        $where_values = array();

        if ( ! empty( $args['contact_type'] ) ) {
            $where[] = 'contact_type = %s';
            $where_values[] = $args['contact_type'];
        }

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        if ( ! empty( $args['assigned_agent_id'] ) ) {
            $where[] = 'assigned_agent_id = %d';
            $where_values[] = $args['assigned_agent_id'];
        }

        if ( ! empty( $args['search'] ) ) {
            $where[] = '(first_name LIKE %s OR last_name LIKE %s OR email LIKE %s)';
            $search_term = '%' . $wpdb->esc_like( $args['search'] ) . '%';
            $where_values[] = $search_term;
            $where_values[] = $search_term;
            $where_values[] = $search_term;
        }

        $where_clause = implode( ' AND ', $where );

        $orderby = sanitize_sql_orderby( $args['orderby'] . ' ' . $args['order'] );
        if ( ! $orderby ) {
            $orderby = 'created_at DESC';
        }

        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );

        $query = "SELECT * FROM $table WHERE $where_clause ORDER BY $orderby LIMIT %d OFFSET %d"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $where_values[] = $limit;
        $where_values[] = $offset;

        if ( ! empty( $where_values ) ) {
            $query = $wpdb->prepare( $query, $where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }

        return $wpdb->get_results( $query ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
    }

    /**
     * Create a new contact.
     *
     * @param array $data Contact data.
     * @return int|false Contact ID on success, false on failure.
     */
    public static function create( $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_contacts' ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = Malta_RE_CRM_Security::sanitize_contact_data( $data );

        // Validate email
        if ( empty( $sanitized['email'] ) || ! Malta_RE_CRM_Security::validate_email( $sanitized['email'] ) ) {
            return false;
        }

        $sanitized['created_by'] = get_current_user_id();

        $table = $wpdb->prefix . 'malta_re_contacts';

        $inserted = $wpdb->insert(
            $table,
            $sanitized,
            array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d' )
        );

        if ( $inserted ) {
            $contact_id = $wpdb->insert_id;

            // Log activity
            self::log_activity( 'create', $contact_id, sprintf( 'Contact "%s %s" created', $sanitized['first_name'], $sanitized['last_name'] ) );

            return $contact_id;
        }

        return false;
    }

    /**
     * Update a contact.
     *
     * @param int   $contact_id Contact ID.
     * @param array $data Contact data.
     * @return bool True on success, false on failure.
     */
    public static function update( $contact_id, $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_contacts' ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = Malta_RE_CRM_Security::sanitize_contact_data( $data );

        // Validate email if provided
        if ( ! empty( $sanitized['email'] ) && ! Malta_RE_CRM_Security::validate_email( $sanitized['email'] ) ) {
            return false;
        }

        $table = $wpdb->prefix . 'malta_re_contacts';

        $updated = $wpdb->update(
            $table,
            $sanitized,
            array( 'id' => $contact_id ),
            array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s' ),
            array( '%d' )
        );

        if ( false !== $updated ) {
            // Log activity
            self::log_activity( 'update', $contact_id, sprintf( 'Contact "%s %s" updated', $sanitized['first_name'], $sanitized['last_name'] ) );

            return true;
        }

        return false;
    }

    /**
     * Delete a contact.
     *
     * @param int $contact_id Contact ID.
     * @return bool True on success, false on failure.
     */
    public static function delete( $contact_id ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_contacts' ) ) {
            return false;
        }

        $contact = self::get( $contact_id );
        if ( ! $contact ) {
            return false;
        }

        $table = $wpdb->prefix . 'malta_re_contacts';

        $deleted = $wpdb->delete(
            $table,
            array( 'id' => $contact_id ),
            array( '%d' )
        );

        if ( $deleted ) {
            // Log activity
            self::log_activity( 'delete', $contact_id, sprintf( 'Contact "%s %s" deleted', $contact->first_name, $contact->last_name ) );

            return true;
        }

        return false;
    }

    /**
     * Get contact count.
     *
     * @param array $args Query arguments.
     * @return int Contact count.
     */
    public static function get_count( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_contacts';

        $where = array( '1=1' );
        $where_values = array();

        if ( ! empty( $args['contact_type'] ) ) {
            $where[] = 'contact_type = %s';
            $where_values[] = $args['contact_type'];
        }

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        $where_clause = implode( ' AND ', $where );

        $query = "SELECT COUNT(*) FROM $table WHERE $where_clause"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

        if ( ! empty( $where_values ) ) {
            $query = $wpdb->prepare( $query, $where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }

        return (int) $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
    }

    /**
     * Log activity.
     *
     * @param string $type Activity type.
     * @param int    $contact_id Contact ID.
     * @param string $description Activity description.
     */
    private static function log_activity( $type, $contact_id, $description ) {
        global $wpdb;

        $table = $wpdb->prefix . 'malta_re_activities';

        $wpdb->insert(
            $table,
            array(
                'activity_type' => $type,
                'entity_type'   => 'contact',
                'entity_id'     => $contact_id,
                'title'         => ucfirst( $type ) . ' Contact',
                'description'   => $description,
                'user_id'       => get_current_user_id(),
            ),
            array( '%s', '%s', '%d', '%s', '%s', '%d' )
        );
    }
}
