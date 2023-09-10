<?php
/**
 * Launchpad API endpoint
 *
 * @package automattic/jetpack-mu-wpcom
 * @since 4.9.0
 */

/**
 * Fetches Launchpad Navigator-related data for the site.
 *
 * @since 4.9.0
 */
class WPCOM_REST_API_V2_Endpoint_Launchpad_Navigator extends WP_REST_Controller {

	/**
	 * Class constructor
	 */
	public function __construct() {
		$this->namespace = 'wpcom/v2';
		$this->rest_base = 'launchpad/navigator';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register our routes.
	 */
	public function register_routes() {
		// Register rest route for getting a list of available checklists and the currently active checklist.
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_navigator_data' ),
					'permission_callback' => array( $this, 'can_access' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_navigator_options' ),
					'permission_callback' => array( $this, 'can_access' ),
					'args'                => array(
						'active_checklist_slug' => array(
							'description' => 'The slug of the checklist to set as active.',
							'type'        => 'string',
							'enum'        => $this->get_checklist_slug_enums(),
						),
					),
				),
			)
		);
	}

	/**
	 * Returns all available checklist slugs.
	 * TODO: This function is used by both endpoints, we should move it somewhere common.
	 *
	 * @return array Array of checklist slugs.
	 */
	public function get_checklist_slug_enums() {
		$checklists = wpcom_launchpad_checklists()->get_all_task_lists();
		return array_keys( $checklists );
	}

	/**
	 * Updates Launchpad navigator-related options and returns the result
	 *
	 * @param WP_REST_Request $request Request object.
	 */
	public function update_navigator_options( $request ) {
		$input = $request->get_json_params();

		if ( ! isset( $input['active_checklist_slug'] ) ) {
			return;
		}

		$updated = wpcom_launchpad_set_current_active_checklist( $input['active_checklist_slug'] );

		return array(
			'updated' => $updated,
		);
	}

	/**
	 * Returns a list of available checklists and the currently active checklist.
	 *
	 * @return array Array with two keys: `checklists` and `active_checklist`.
	 */
	public function get_navigator_data() {
		$raw_checklists = wpcom_launchpad_checklists()->get_all_task_lists();
		$checklists     = array();
		foreach ( $raw_checklists as $slug => $checklist ) {
			$checklists[] = array(
				'slug'  => $slug,
				'title' => $checklist['title'],
			);
		}

		return array(
			'available_checklists' => $checklists,
			'current_checklist'    => 'intent-build',
		);
	}

	/**
	 * Permission callback for the REST route.
	 *
	 * @return boolean
	 */
	public function can_access() {
		return current_user_can( 'manage_options' );
	}
}

wpcom_rest_api_v2_load_plugin( 'WPCOM_REST_API_V2_Endpoint_Launchpad_Navigator' );
