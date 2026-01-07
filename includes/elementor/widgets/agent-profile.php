<?php
/**
 * Agent Profile Elementor Widget.
 *
 * @package MaltaRealEstate\CRM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Agent Profile Widget class.
 */
class Malta_RE_CRM_Agent_Profile_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name.
     */
    public function get_name() {
        return 'malta_re_agent_profile';
    }

    /**
     * Get widget title.
     */
    public function get_title() {
        return __( 'Agent Profile', 'malta-re-crm' );
    }

    /**
     * Get widget icon.
     */
    public function get_icon() {
        return 'eicon-person';
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
            'agent_id',
            array(
                'label'   => __( 'Agent ID', 'malta-re-crm' ),
                'type'    => \Elementor\Controls_Manager::NUMBER,
                'default' => 0,
            )
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output.
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        $agent_id = intval( $settings['agent_id'] );

        if ( empty( $agent_id ) ) {
            echo '<p>' . esc_html__( 'Please select an agent.', 'malta-re-crm' ) . '</p>';
            return;
        }

        $agent = Malta_RE_CRM_Agents::get( $agent_id );

        if ( ! $agent ) {
            echo '<p>' . esc_html__( 'Agent not found.', 'malta-re-crm' ) . '</p>';
            return;
        }

        $user = get_user_by( 'id', $agent->user_id );
        $stats = Malta_RE_CRM_Agents::get_statistics( $agent_id );
        ?>
        <div class="malta-re-agent-profile">
            <?php if ( ! empty( $agent->photo_url ) ) : ?>
                <div class="agent-photo">
                    <img src="<?php echo esc_url( $agent->photo_url ); ?>" alt="<?php echo esc_attr( $user->display_name ); ?>">
                </div>
            <?php endif; ?>
            <div class="agent-info">
                <h3 class="agent-name"><?php echo esc_html( $user->display_name ); ?></h3>
                <?php if ( ! empty( $agent->specialization ) ) : ?>
                    <p class="agent-specialization"><?php echo esc_html( $agent->specialization ); ?></p>
                <?php endif; ?>
                <?php if ( ! empty( $agent->bio ) ) : ?>
                    <div class="agent-bio"><?php echo esc_html( $agent->bio ); ?></div>
                <?php endif; ?>
                <div class="agent-contact">
                    <?php if ( ! empty( $agent->mobile ) ) : ?>
                        <p class="agent-mobile">
                            <i class="fas fa-phone"></i> <?php echo esc_html( $agent->mobile ); ?>
                        </p>
                    <?php endif; ?>
                    <?php if ( ! empty( $user->user_email ) ) : ?>
                        <p class="agent-email">
                            <i class="fas fa-envelope"></i> <?php echo esc_html( $user->user_email ); ?>
                        </p>
                    <?php endif; ?>
                </div>
                <div class="agent-stats">
                    <div class="stat">
                        <span class="stat-value"><?php echo esc_html( $stats['active_properties'] ); ?></span>
                        <span class="stat-label"><?php esc_html_e( 'Active Properties', 'malta-re-crm' ); ?></span>
                    </div>
                    <div class="stat">
                        <span class="stat-value"><?php echo esc_html( $stats['total_contacts'] ); ?></span>
                        <span class="stat-label"><?php esc_html_e( 'Contacts', 'malta-re-crm' ); ?></span>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}
