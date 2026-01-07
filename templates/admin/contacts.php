<?php
/**
 * Contacts admin template.
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
        <?php esc_html_e( 'Contacts', 'malta-re-crm' ); ?>
        <a href="#" class="page-title-action" id="add-contact"><?php esc_html_e( 'Add New', 'malta-re-crm' ); ?></a>
    </h1>

    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php esc_html_e( 'Name', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Email', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Phone', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Type', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Status', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Date', 'malta-re-crm' ); ?></th>
                <th><?php esc_html_e( 'Actions', 'malta-re-crm' ); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if ( ! empty( $contacts ) ) : ?>
                <?php foreach ( $contacts as $contact ) : ?>
                    <tr>
                        <td><?php echo esc_html( $contact->first_name . ' ' . $contact->last_name ); ?></td>
                        <td><?php echo esc_html( $contact->email ); ?></td>
                        <td><?php echo esc_html( $contact->phone ); ?></td>
                        <td><?php echo esc_html( ucfirst( $contact->contact_type ) ); ?></td>
                        <td><?php echo esc_html( ucfirst( $contact->status ) ); ?></td>
                        <td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $contact->created_at ) ) ); ?></td>
                        <td>
                            <a href="#" class="button button-small edit-contact" data-id="<?php echo esc_attr( $contact->id ); ?>">
                                <?php esc_html_e( 'Edit', 'malta-re-crm' ); ?>
                            </a>
                            <a href="#" class="button button-small delete-contact" data-id="<?php echo esc_attr( $contact->id ); ?>">
                                <?php esc_html_e( 'Delete', 'malta-re-crm' ); ?>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="7"><?php esc_html_e( 'No contacts found.', 'malta-re-crm' ); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>
