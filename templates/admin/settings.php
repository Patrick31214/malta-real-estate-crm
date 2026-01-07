<?php
/**
 * Settings admin template.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap malta-re-crm-admin">
    <h1><?php esc_html_e( 'CRM Settings', 'malta-re-crm' ); ?></h1>

    <form method="post" action="options.php">
        <?php settings_fields( 'malta_re_crm_settings' ); ?>
        <?php do_settings_sections( 'malta_re_crm_settings' ); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="malta_re_crm_currency"><?php esc_html_e( 'Default Currency', 'malta-re-crm' ); ?></label>
                </th>
                <td>
                    <select id="malta_re_crm_currency" name="malta_re_crm_currency">
                        <option value="EUR" <?php selected( get_option( 'malta_re_crm_currency', 'EUR' ), 'EUR' ); ?>>EUR (€)</option>
                        <option value="USD" <?php selected( get_option( 'malta_re_crm_currency' ), 'USD' ); ?>>USD ($)</option>
                        <option value="GBP" <?php selected( get_option( 'malta_re_crm_currency' ), 'GBP' ); ?>>GBP (£)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="malta_re_crm_default_commission"><?php esc_html_e( 'Default Commission Rate (%)', 'malta-re-crm' ); ?></label>
                </th>
                <td>
                    <input type="number" id="malta_re_crm_default_commission" name="malta_re_crm_default_commission" 
                           value="<?php echo esc_attr( get_option( 'malta_re_crm_default_commission', '5' ) ); ?>" 
                           step="0.01" min="0" max="100">
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>
</div>
