<?php
/**
 * Dashboard admin template.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap malta-re-crm-admin">
    <h1><?php esc_html_e( 'Malta Real Estate CRM Dashboard', 'malta-re-crm' ); ?></h1>

    <div class="malta-re-stats">
        <div class="stat-box">
            <h3><?php echo esc_html( $stats['total_properties'] ); ?></h3>
            <p><?php esc_html_e( 'Total Properties', 'malta-re-crm' ); ?></p>
        </div>
        <div class="stat-box">
            <h3><?php echo esc_html( $stats['available_properties'] ); ?></h3>
            <p><?php esc_html_e( 'Available Properties', 'malta-re-crm' ); ?></p>
        </div>
        <div class="stat-box">
            <h3><?php echo esc_html( $stats['total_contacts'] ); ?></h3>
            <p><?php esc_html_e( 'Total Contacts', 'malta-re-crm' ); ?></p>
        </div>
        <div class="stat-box">
            <h3><?php echo esc_html( $stats['active_contacts'] ); ?></h3>
            <p><?php esc_html_e( 'Active Contacts', 'malta-re-crm' ); ?></p>
        </div>
    </div>

    <div class="malta-re-quick-actions">
        <h2><?php esc_html_e( 'Quick Actions', 'malta-re-crm' ); ?></h2>
        <div class="action-buttons">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=malta-re-crm-properties' ) ); ?>" class="button button-primary">
                <?php esc_html_e( 'Manage Properties', 'malta-re-crm' ); ?>
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=malta-re-crm-contacts' ) ); ?>" class="button button-primary">
                <?php esc_html_e( 'Manage Contacts', 'malta-re-crm' ); ?>
            </a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=malta-re-crm-agents' ) ); ?>" class="button button-primary">
                <?php esc_html_e( 'Manage Agents', 'malta-re-crm' ); ?>
            </a>
        </div>
    </div>
</div>
