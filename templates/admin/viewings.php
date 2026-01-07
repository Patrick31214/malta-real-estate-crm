<?php
/**
 * Viewings admin template.
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
        <?php esc_html_e( 'Property Viewings', 'malta-re-crm' ); ?>
        <a href="#" class="page-title-action" id="schedule-viewing"><?php esc_html_e( 'Schedule New', 'malta-re-crm' ); ?></a>
    </h1>

    <div class="malta-re-viewings">
        <p><?php esc_html_e( 'Manage and schedule property viewings here.', 'malta-re-crm' ); ?></p>
    </div>
</div>
