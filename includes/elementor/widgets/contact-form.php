<?php
/**
 * Contact Form Elementor Widget.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Contact Form Widget class.
 */
class Malta_RE_CRM_Contact_Form_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name.
     */
    public function get_name() {
        return 'malta_re_contact_form';
    }

    /**
     * Get widget title.
     */
    public function get_title() {
        return __( 'Contact Form', 'malta-re-crm' );
    }

    /**
     * Get widget icon.
     */
    public function get_icon() {
        return 'eicon-form-horizontal';
    }

    /**
     * Get widget categories.
     */
    public function get_categories() {
        return array( 'malta-re-crm' );
    }

    /**
     * Register widget controls.
     */
    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            array(
                'label' => __( 'Content', 'malta-re-crm' ),
                'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'title',
            array(
                'label'   => __( 'Title', 'malta-re-crm' ),
                'type'    => \Elementor\Controls_Manager::TEXT,
                'default' => __( 'Get in Touch', 'malta-re-crm' ),
            )
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output.
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        $nonce = wp_create_nonce( 'malta_re_crm_contact_form' );
        ?>
        <div class="malta-re-contact-form">
            <?php if ( ! empty( $settings['title'] ) ) : ?>
                <h2 class="form-title"><?php echo esc_html( $settings['title'] ); ?></h2>
            <?php endif; ?>
            <form class="contact-form" method="post" data-nonce="<?php echo esc_attr( $nonce ); ?>">
                <div class="form-field">
                    <label for="first_name"><?php esc_html_e( 'First Name', 'malta-re-crm' ); ?> *</label>
                    <input type="text" id="first_name" name="first_name" required>
                </div>
                <div class="form-field">
                    <label for="last_name"><?php esc_html_e( 'Last Name', 'malta-re-crm' ); ?> *</label>
                    <input type="text" id="last_name" name="last_name" required>
                </div>
                <div class="form-field">
                    <label for="email"><?php esc_html_e( 'Email', 'malta-re-crm' ); ?> *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-field">
                    <label for="phone"><?php esc_html_e( 'Phone', 'malta-re-crm' ); ?></label>
                    <input type="tel" id="phone" name="phone">
                </div>
                <div class="form-field">
                    <label for="message"><?php esc_html_e( 'Message', 'malta-re-crm' ); ?> *</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="submit-button"><?php esc_html_e( 'Send Message', 'malta-re-crm' ); ?></button>
            </form>
        </div>
        <?php
    }
}
