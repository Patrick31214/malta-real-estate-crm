<?php
/**
 * Property Listing Elementor Widget.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Property Listing Widget class.
 */
class Malta_RE_CRM_Property_Listing_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name.
     *
     * @return string Widget name.
     */
    public function get_name() {
        return 'malta_re_property_listing';
    }

    /**
     * Get widget title.
     *
     * @return string Widget title.
     */
    public function get_title() {
        return __( 'Property Listing', 'malta-re-crm' );
    }

    /**
     * Get widget icon.
     *
     * @return string Widget icon.
     */
    public function get_icon() {
        return 'eicon-gallery-grid';
    }

    /**
     * Get widget categories.
     *
     * @return array Widget categories.
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
            'limit',
            array(
                'label'   => __( 'Number of Properties', 'malta-re-crm' ),
                'type'    => \Elementor\Controls_Manager::NUMBER,
                'default' => 6,
            )
        );

        $this->add_control(
            'property_type',
            array(
                'label'   => __( 'Property Type', 'malta-re-crm' ),
                'type'    => \Elementor\Controls_Manager::SELECT,
                'options' => array(
                    ''           => __( 'All Types', 'malta-re-crm' ),
                    'apartment'  => __( 'Apartment', 'malta-re-crm' ),
                    'house'      => __( 'House', 'malta-re-crm' ),
                    'villa'      => __( 'Villa', 'malta-re-crm' ),
                    'penthouse'  => __( 'Penthouse', 'malta-re-crm' ),
                    'townhouse'  => __( 'Townhouse', 'malta-re-crm' ),
                    'commercial' => __( 'Commercial', 'malta-re-crm' ),
                ),
                'default' => '',
            )
        );

        $this->add_control(
            'status',
            array(
                'label'   => __( 'Status', 'malta-re-crm' ),
                'type'    => \Elementor\Controls_Manager::SELECT,
                'options' => array(
                    ''          => __( 'All', 'malta-re-crm' ),
                    'available' => __( 'Available', 'malta-re-crm' ),
                    'sold'      => __( 'Sold', 'malta-re-crm' ),
                    'rented'    => __( 'Rented', 'malta-re-crm' ),
                ),
                'default' => 'available',
            )
        );

        $this->add_control(
            'featured_only',
            array(
                'label'        => __( 'Featured Only', 'malta-re-crm' ),
                'type'         => \Elementor\Controls_Manager::SWITCHER,
                'label_on'     => __( 'Yes', 'malta-re-crm' ),
                'label_off'    => __( 'No', 'malta-re-crm' ),
                'return_value' => 'yes',
                'default'      => 'no',
            )
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output on the frontend.
     */
    protected function render() {
        $settings = $this->get_settings_for_display();

        $args = array(
            'limit'  => intval( $settings['limit'] ),
            'status' => $settings['status'],
        );

        if ( ! empty( $settings['property_type'] ) ) {
            $args['property_type'] = $settings['property_type'];
        }

        if ( 'yes' === $settings['featured_only'] ) {
            $args['featured'] = 1;
        }

        $properties = Malta_RE_CRM_Properties::get_all( $args );

        if ( empty( $properties ) ) {
            echo '<p>' . esc_html__( 'No properties found.', 'malta-re-crm' ) . '</p>';
            return;
        }

        echo '<div class="malta-re-property-listing">';
        foreach ( $properties as $property ) {
            $this->render_property_card( $property );
        }
        echo '</div>';
    }

    /**
     * Render single property card.
     *
     * @param object $property Property object.
     */
    private function render_property_card( $property ) {
        ?>
        <div class="malta-re-property-card">
            <div class="property-image">
                <?php if ( $property->featured ) : ?>
                    <span class="featured-badge"><?php esc_html_e( 'Featured', 'malta-re-crm' ); ?></span>
                <?php endif; ?>
            </div>
            <div class="property-content">
                <h3 class="property-title"><?php echo esc_html( $property->title ); ?></h3>
                <p class="property-price">
                    <?php echo esc_html( $property->currency ); ?> 
                    <?php echo esc_html( number_format( $property->price, 2 ) ); ?>
                </p>
                <p class="property-location">
                    <?php echo esc_html( $property->city ); ?>, <?php echo esc_html( $property->region ); ?>
                </p>
                <div class="property-details">
                    <span class="bedrooms">
                        <i class="fas fa-bed"></i> <?php echo esc_html( $property->bedrooms ); ?>
                    </span>
                    <span class="bathrooms">
                        <i class="fas fa-bath"></i> <?php echo esc_html( $property->bathrooms ); ?>
                    </span>
                    <span class="area">
                        <i class="fas fa-ruler"></i> <?php echo esc_html( $property->area . ' ' . $property->area_unit ); ?>
                    </span>
                </div>
                <div class="property-type">
                    <?php echo esc_html( ucfirst( $property->property_type ) ); ?>
                </div>
            </div>
        </div>
        <?php
    }
}
