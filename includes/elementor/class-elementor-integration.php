<?php
/**
 * Elementor integration class.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Elementor Integration class.
 */
class Malta_RE_CRM_Elementor_Integration {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
        add_action( 'elementor/elements/categories_registered', array( $this, 'add_elementor_category' ) );
    }

    /**
     * Register custom Elementor widgets.
     *
     * @param object $widgets_manager Elementor widgets manager.
     */
    public function register_widgets( $widgets_manager ) {
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/elementor/widgets/property-search.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/elementor/widgets/property-listing.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/elementor/widgets/contact-form.php';
        require_once MALTA_RE_CRM_PLUGIN_DIR . 'includes/elementor/widgets/agent-profile.php';

        $widgets_manager->register( new \Malta_RE_CRM_Property_Search_Widget() );
        $widgets_manager->register( new \Malta_RE_CRM_Property_Listing_Widget() );
        $widgets_manager->register( new \Malta_RE_CRM_Contact_Form_Widget() );
        $widgets_manager->register( new \Malta_RE_CRM_Agent_Profile_Widget() );
    }

    /**
     * Add custom Elementor category.
     *
     * @param object $elements_manager Elementor elements manager.
     */
    public function add_elementor_category( $elements_manager ) {
        $elements_manager->add_category(
            'malta-re-crm',
            array(
                'title' => __( 'Malta RE CRM', 'malta-re-crm' ),
                'icon'  => 'fa fa-building',
            )
        );
    }
}

// Initialize if Elementor is active
if ( did_action( 'elementor/loaded' ) ) {
    new Malta_RE_CRM_Elementor_Integration();
}
