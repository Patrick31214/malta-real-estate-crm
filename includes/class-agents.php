<?php
/**
 * Agents management class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Agents class.
 */
class Malta_RE_CRM_Agents {

    /**
     * Get agent by ID.
     *
     * @param int $agent_id Agent ID.
     * @return object|null Agent object or null if not found.
     */
    public static function get( $agent_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_agents';

        $agent = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $agent_id
            )
        );

        return $agent;
    }

    /**
     * Get agent by user ID.
     *
     * @param int $user_id User ID.
     * @return object|null Agent object or null if not found.
     */
    public static function get_by_user_id( $user_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_agents';

        $agent = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE user_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $user_id
            )
        );

        return $agent;
    }

    /**
     * Get all agents.
     *
     * @param array $args Query arguments.
     * @return array Array of agent objects.
     */
    public static function get_all( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'malta_re_agents';

        $defaults = array(
            'status'  => '',
            'orderby' => 'created_at',
            'order'   => 'DESC',
            'limit'   => 20,
            'offset'  => 0,
        );

        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        $where_values = array();

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $where_values[] = $args['status'];
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
     * Create a new agent.
     *
     * @param array $data Agent data.
     * @return int|false Agent ID on success, false on failure.
     */
    public static function create( $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_agents' ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = array(
            'user_id'          => isset( $data['user_id'] ) ? intval( $data['user_id'] ) : 0,
            'license_number'   => isset( $data['license_number'] ) ? sanitize_text_field( $data['license_number'] ) : '',
            'specialization'   => isset( $data['specialization'] ) ? sanitize_text_field( $data['specialization'] ) : '',
            'bio'              => isset( $data['bio'] ) ? sanitize_textarea_field( $data['bio'] ) : '',
            'photo_url'        => isset( $data['photo_url'] ) ? esc_url_raw( $data['photo_url'] ) : '',
            'phone'            => isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '',
            'mobile'           => isset( $data['mobile'] ) ? sanitize_text_field( $data['mobile'] ) : '',
            'office_location'  => isset( $data['office_location'] ) ? sanitize_text_field( $data['office_location'] ) : '',
            'status'           => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'active',
            'commission_rate'  => isset( $data['commission_rate'] ) ? floatval( $data['commission_rate'] ) : 0,
        );

        if ( empty( $sanitized['user_id'] ) ) {
            return false;
        }

        $table = $wpdb->prefix . 'malta_re_agents';

        $inserted = $wpdb->insert(
            $table,
            $sanitized,
            array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%f' )
        );

        if ( $inserted ) {
            $agent_id = $wpdb->insert_id;

            // Update user role
            $user = get_user_by( 'id', $sanitized['user_id'] );
            if ( $user ) {
                $user->add_role( 're_agent' );
            }

            return $agent_id;
        }

        return false;
    }

    /**
     * Update an agent.
     *
     * @param int   $agent_id Agent ID.
     * @param array $data Agent data.
     * @return bool True on success, false on failure.
     */
    public static function update( $agent_id, $data ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_agents' ) ) {
            return false;
        }

        // Sanitize data
        $sanitized = array(
            'license_number'   => isset( $data['license_number'] ) ? sanitize_text_field( $data['license_number'] ) : '',
            'specialization'   => isset( $data['specialization'] ) ? sanitize_text_field( $data['specialization'] ) : '',
            'bio'              => isset( $data['bio'] ) ? sanitize_textarea_field( $data['bio'] ) : '',
            'photo_url'        => isset( $data['photo_url'] ) ? esc_url_raw( $data['photo_url'] ) : '',
            'phone'            => isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '',
            'mobile'           => isset( $data['mobile'] ) ? sanitize_text_field( $data['mobile'] ) : '',
            'office_location'  => isset( $data['office_location'] ) ? sanitize_text_field( $data['office_location'] ) : '',
            'status'           => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'active',
            'commission_rate'  => isset( $data['commission_rate'] ) ? floatval( $data['commission_rate'] ) : 0,
        );

        $table = $wpdb->prefix . 'malta_re_agents';

        $updated = $wpdb->update(
            $table,
            $sanitized,
            array( 'id' => $agent_id ),
            array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%f' ),
            array( '%d' )
        );

        return false !== $updated;
    }

    /**
     * Delete an agent.
     *
     * @param int $agent_id Agent ID.
     * @return bool True on success, false on failure.
     */
    public static function delete( $agent_id ) {
        global $wpdb;

        // Check permission
        if ( ! Malta_RE_CRM_Security::check_permission( 'manage_agents' ) ) {
            return false;
        }

        $agent = self::get( $agent_id );
        if ( ! $agent ) {
            return false;
        }

        $table = $wpdb->prefix . 'malta_re_agents';

        $deleted = $wpdb->delete(
            $table,
            array( 'id' => $agent_id ),
            array( '%d' )
        );

        if ( $deleted ) {
            // Remove agent role from user
            $user = get_user_by( 'id', $agent->user_id );
            if ( $user ) {
                $user->remove_role( 're_agent' );
            }

            return true;
        }

        return false;
    }

    /**
     * Get agent statistics.
     *
     * @param int $agent_id Agent ID.
     * @return array Statistics array.
     */
    public static function get_statistics( $agent_id ) {
        global $wpdb;

        $stats = array(
            'total_properties'   => 0,
            'active_properties'  => 0,
            'total_contacts'     => 0,
            'scheduled_viewings' => 0,
        );

        // Count properties
        $properties_table = $wpdb->prefix . 'malta_re_properties';
        $stats['total_properties'] = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $properties_table WHERE agent_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $agent_id
            )
        );

        $stats['active_properties'] = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $properties_table WHERE agent_id = %d AND status = 'available'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $agent_id
            )
        );

        // Count contacts
        $contacts_table = $wpdb->prefix . 'malta_re_contacts';
        $stats['total_contacts'] = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $contacts_table WHERE assigned_agent_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $agent_id
            )
        );

        // Count scheduled viewings
        $viewings_table = $wpdb->prefix . 'malta_re_viewings';
        $stats['scheduled_viewings'] = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $viewings_table WHERE agent_id = %d AND status = 'scheduled'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $agent_id
            )
        );

        return $stats;
    }
}
