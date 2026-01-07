<?php
/**
 * Agents admin template.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap malta-re-crm-admin">
    <h1>
        <?php esc_html_e( 'Agents', 'malta-re-crm' ); ?>
        <a href="#" class="page-title-action" id="add-agent"><?php esc_html_e( 'Add New', 'malta-re-crm' ); ?></a>
    </h1>

    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php esc_html_e( 'Name', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'License', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Specialization', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Phone', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Status', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Actions', 'malta-re-crm' ); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if ( ! empty( $agents ) ) : ?>
                <?php foreach ( $agents as $agent ) : ?>
                    <?php $user = get_user_by( 'id', $agent->user_id ); ?>
                    <tr>
                        <td><?php echo esc_html( $user->display_name ); ?></td>
                        <td><?php echo esc_html( $agent->license_number ); ?></td>
                        <td><?php echo esc_html( $agent->specialization ); ?></td>
                        <td><?php echo esc_html( $agent->mobile ); ?></td>
                        <td><?php echo esc_html( ucfirst( $agent->status ) ); ?></td>
                        <td>
                            <a href="#" class="button button-small edit-agent" data-id="<?php echo esc_attr( $agent->id ); ?>">
                                <?php esc_html_e( 'Edit', 'malta-re-crm' ); ?>
                            </a>
                            <a href="#" class="button button-small view-stats" data-id="<?php echo esc_attr( $agent->id ); ?>">
                                <?php esc_html_e( 'View Stats', 'malta-re-crm' ); ?>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="6"><?php esc_html_e( 'No agents found.', 'malta-re-crm' ); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
