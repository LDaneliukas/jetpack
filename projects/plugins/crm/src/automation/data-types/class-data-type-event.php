<?php
/**
 * Event Data Type.
 *
 * @package automattic/jetpack-crm
 * @since $$next-version$$
 */

namespace Automattic\Jetpack\CRM\Automation\Data_Types;

/**
 * Event Data Type.
 *
 * @since $$next-version$$
 */
class Data_Type_Event extends Data_Type_Base {

	/**
	 * {@inheritDoc}
	 */
	public static function get_slug(): string {
		return 'event';
	}

	/**
	 * {@inheritDoc}
	 */
	public function get_id() {
		return $this->entity['id'];
	}

	/**
	 * Validate entity data.
	 *
	 * @since $$next-version$$
	 *
	 * @param mixed $entity Event entity data to validate.
	 * @return bool Whether the entity is valid or not.
	 */
	public function validate_entity( $entity ): bool {
		if ( ! is_array( $entity ) ) {
			return false;
		}

		return true;
	}
}
