<?php
/**
 * Property Search Elementor Widget.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Property Search Widget class.
 */
class Malta_RE_CRM_Property_Search_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name.
     */
    public function get_name() {
        return 'malta_re_property_search';
    }

    /**
     * Get widget title.
     */
    public function get_title() {
        return __( 'Property Search', 'malta-re-crm' );
    }

    /**
     * Get widget icon.
     */
    public function get_icon() {
        return 'eicon-search';
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
                'default' => __( 'Find Your Dream Property', 'malta-re-crm' ),
            )
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output.
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        ?>
        <div class="malta-re-property-search">
            <?php if ( ! empty( $settings['title'] ) ) : ?>
                <h2 class="search-title"><?php echo esc_html( $settings['title'] ); ?></h2>
            <?php endif; ?>
            <form class="property-search-form" method="get">
                <div class="search-field">
                    <input type="text" name="property_search" placeholder="<?php esc_attr_e( 'Search by location or keyword', 'malta-re-crm' ); ?>">
                </div>
                <div class="search-field">
                    <select name="property_type">
                        <option value=""><?php esc_html_e( 'Property Type', 'malta-re-crm' ); ?></option>
                        <option value="apartment"><?php esc_html_e( 'Apartment', 'malta-re-crm' ); ?></option>
                        <option value="house"><?php esc_html_e( 'House', 'malta-re-crm' ); ?></option>
                        <option value="villa"><?php esc_html_e( 'Villa', 'malta-re-crm' ); ?></option>
                        <option value="penthouse"><?php esc_html_e( 'Penthouse', 'malta-re-crm' ); ?></option>
                    </select>
                </div>
                <div class="search-field">
                    <input type="number" name="min_price" placeholder="<?php esc_attr_e( 'Min Price', 'malta-re-crm' ); ?>">
                </div>
                <div class="search-field">
                    <input type="number" name="max_price" placeholder="<?php esc_attr_e( 'Max Price', 'malta-re-crm' ); ?>">
                </div>
                <div class="search-field">
                    <select name="bedrooms">
                        <option value=""><?php esc_html_e( 'Bedrooms', 'malta-re-crm' ); ?></option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                </div>
                <button type="submit" class="search-button"><?php esc_html_e( 'Search', 'malta-re-crm' ); ?></button>
            </form>
        </div>
        <?php
    }
}
