<?php
/**
 * Properties management class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Properties class.
 */
class Malta_RE_CRM_Properties {

    /**
     * Get property by ID.
     *
     * @param int $property_id Property ID.
     * @return object|null Property object or null if not found.
     */
    public static function get( $property_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_properties';

        $property = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $property_id
            )
        );

        return $property;
    }

    /**
     * Get all properties with filters.
     *
     * @param array $args Query arguments.
     * @return array Array of property objects.
     */
    public static function get_all( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_properties';

        $defaults = array(
            'status'        => '',
            'property_type' => '',
            'owner_id'      => 0,
            'agent_id'      => 0,
            'city'          => '',
            'min_price'     => 0,
            'max_price'     => 0,
            'min_bedrooms'  => 0,
            'featured'      => null,
            'orderby'       => 'created_at',
            'order'         => 'DESC',
            'limit'         => 20,
            'offset'        => 0,
        );

        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        $where_values = array();

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        if ( ! empty( $args['property_type'] ) ) {
            $where[] = 'property_type = %s';
            $where_values[] = $args['property_type'];
        }

        if ( ! empty( $args['owner_id'] ) ) {
            $where[] = 'owner_id = %d';
            $where_values[] = $args['owner_id'];
        }

        if ( ! empty( $args['agent_id'] ) ) {
            $where[] = 'agent_id = %d';
            $where_values[] = $args['agent_id'];
        }

        if ( ! empty( $args['city'] ) ) {
            $where[] = 'city = %s';
            $where_values[] = $args['city'];
        }

        if ( ! empty( $args['min_price'] ) ) {
            $where[] = 'price >= %f';
            $where_values[] = $args['min_price'];
        }

        if ( ! empty( $args['max_price'] ) ) {
            $where[] = 'price <= %f';
            $where_values[] = $args['max_price'];
        }

        if ( ! empty( $args['min_bedrooms'] ) ) {
            $where[] = 'bedrooms >= %d';
            $where_values[] = $args['min_bedrooms'];
        }

        if ( null !== $args['featured'] ) {
            $where[] = 'featured = %d';
            $where_values[] = $args['featured'] ? 1 : 0;
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
     * Create a new property.
     *
     * @param array $data Property data.
     * @return int|false Property ID on success, false on failure.
     */
    public static function create( $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_properties' ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = Malta_RE_CRM_Security::sanitize_property_data( $data );

        $sanitized['created_by'] = get_current_user_id();

        $table = $wpdb->prefix . 'malta_re_properties';

        $inserted = $wpdb->insert(
            $table,
            $sanitized,
            array(
                '%s', '%s', '%s', '%s', '%f', '%s', '%d', '%d', '%f', '%s',
                '%s', '%s', '%s', '%s', '%f', '%f', '%d', '%d', '%d', '%d',
            )
        );

        if ( $inserted ) {
            $property_id = $wpdb->insert_id;

            // Log activity
            self::log_activity( 'create', $property_id, sprintf( 'Property "%s" created', $sanitized['title'] ) );

            return $property_id;
        }

        return false;
    }

    /**
     * Update a property.
     *
     * @param int   $property_id Property ID.
     * @param array $data Property data.
     * @return bool True on success, false on failure.
     */
    public static function update( $property_id, $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_own_properties', $property_id ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = Malta_RE_CRM_Security::sanitize_property_data( $data );

        $table = $wpdb->prefix . 'malta_re_properties';

        $updated = $wpdb->update(
            $table,
            $sanitized,
            array( 'id' => $property_id ),
            array(
                '%s', '%s', '%s', '%s', '%f', '%s', '%d', '%d', '%f', '%s',
                '%s', '%s', '%s', '%s', '%f', '%f', '%d', '%d', '%d',
            ),
            array( '%d' )
        );

        if ( false !== $updated ) {
            // Log activity
            self::log_activity( 'update', $property_id, sprintf( 'Property "%s" updated', $sanitized['title'] ) );

            return true;
        }

        return false;
    }

    /**
     * Delete a property.
     *
     * @param int $property_id Property ID.
     * @return bool True on success, false on failure.
     */
    public static function delete( $property_id ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_own_properties', $property_id ) ) {
            return false;
        }

        $property = self::get( $property_id );
        if ( ! $property ) {
            return false;
        }

        $table = $wpdb->prefix . 'malta_re_properties';

        $deleted = $wpdb->delete(
            $table,
            array( 'id' => $property_id ),
            array( '%d' )
        );

        if ( $deleted ) {
            // Log activity
            self::log_activity( 'delete', $property_id, sprintf( 'Property "%s" deleted', $property->title ) );

            return true;
        }

        return false;
    }

    /**
     * Get property count.
     *
     * @param array $args Query arguments.
     * @return int Property count.
     */
    public static function get_count( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_properties';

        $where = array( '1=1' );
        $where_values = array();

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        if ( ! empty( $args['property_type'] ) ) {
            $where[] = 'property_type = %s';
            $where_values[] = $args['property_type'];
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
     * @param int    $property_id Property ID.
     * @param string $description Activity description.
     */
    private static function log_activity( $type, $property_id, $description ) {
        global $wpdb;

        $table = $wpdb->prefix . 'malta_re_activities';

        $wpdb->insert(
            $table,
            array(
                'activity_type' => $type,
                'entity_type'   => 'property',
                'entity_id'     => $property_id,
                'title'         => ucfirst( $type ) . ' Property',
                'description'   => $description,
                'user_id'       => get_current_user_id(),
            ),
            array( '%s', '%s', '%d', '%s', '%s', '%d' )
        );
    }
}
