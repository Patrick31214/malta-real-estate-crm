<?php
/**
 * Properties admin template.
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
        <?php esc_html_e( 'Properties', 'malta-re-crm' ); ?>
        <a href="#" class="page-title-action" id="add-property"><?php esc_html_e( 'Add New', 'malta-re-crm' ); ?></a>
    </h1>

    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php esc_html_e( 'Title', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Type', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Status', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Price', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Location', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Date', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Actions', 'malta-re-crm' ); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if ( ! empty( $properties ) ) : ?>
                <?php foreach ( $properties as $property ) : ?>
                    <tr>
                        <td><?php echo esc_html( $property->title ); ?></td>
                        <td><?php echo esc_html( ucfirst( $property->property_type ) ); ?></td>
                        <td><?php echo esc_html( ucfirst( $property->status ) ); ?></td>
                        <td><?php echo esc_html( $property->currency . ' ' . number_format( $property->price, 2 ) ); ?></td>
                        <td><?php echo esc_html( $property->city . ', ' . $property->region ); ?></td>
                        <td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $property->created_at ) ) ); ?></td>
                        <td>
                            <a href="#" class="button button-small edit-property" data-id="<?php echo esc_attr( $property->id ); ?>">
                                <?php esc_html_e( 'Edit', 'malta-re-crm' ); ?>
                            </a>
                            <a href="#" class="button button-small delete-property" data-id="<?php echo esc_attr( $property->id ); ?>">
                                <?php esc_html_e( 'Delete', 'malta-re-crm' ); ?>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="7"><?php esc_html_e( 'No properties found.', 'malta-re-crm' ); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
