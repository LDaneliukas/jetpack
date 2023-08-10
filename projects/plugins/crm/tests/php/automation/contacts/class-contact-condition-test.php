<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

namespace Automattic\Jetpack\CRM\Automation\Tests;

use Automattic\Jetpack\CRM\Automation\Automation_Exception;
use Automattic\Jetpack\CRM\Automation\Conditions\Contact_Field_Changed;
use WorDBless\BaseTestCase;

require_once __DIR__ . '../../tools/class-automation-faker.php';

/**
 * Test Automation Workflow functionalities
 *
 * @covers Automattic\Jetpack\CRM\Automation
 */
class Contact_Condition_Test extends BaseTestCase {

	private $automation_faker;

	public function setUp(): void {
		parent::setUp();
		$this->automation_faker = Automation_Faker::instance();
		$this->automation_faker->reset_all();
	}

	private function get_contact_field_changed_condition( $operator, $expected_value ) {
		$condition_data = array(
			'slug'       => 'jpcrm/condition/contact_field_changed',
			'attributes' => array(
				'field'    => 'status',
				'operator' => $operator,
				'value'    => $expected_value,
			),
		);
		return new Contact_Field_Changed( $condition_data );
	}

	/**
	 * @testdox Test the update contact field condition for the is operator.
	 */
	public function test_field_changed_is_operator() {
		$contact_field_changed_condition = $this->get_contact_field_changed_condition( 'is', 'customer' );
		$contact_data                    = $this->automation_faker->contact_data();

		// Testing when the condition has been met.
		$contact_data['data']['status'] = 'customer';
		$contact_field_changed_condition->execute( $contact_data );
		$this->assertTrue( $contact_field_changed_condition->condition_met() );

		// Testing when the condition has not been met.
		$contact_data['data']['status'] = 'lead';
		$contact_field_changed_condition->execute( $contact_data );
		$this->assertFalse( $contact_field_changed_condition->condition_met() );
	}

	/**
	 * @testdox Test the update contact field condition for the is_not operator.
	 */
	public function test_field_changed_is_not_operator() {
		$contact_field_changed_condition = $this->get_contact_field_changed_condition( 'is_not', 'customer' );
		$contact_data                    = $this->automation_faker->contact_data();

		// Testing when the condition has been met.
		$contact_data['data']['status'] = 'lead';
		$contact_field_changed_condition->execute( $contact_data );
		$this->assertTrue( $contact_field_changed_condition->condition_met() );

		// Testing when the condition has not been met.
		$contact_data['data']['status'] = 'customer';
		$contact_field_changed_condition->execute( $contact_data );
		$this->assertFalse( $contact_field_changed_condition->condition_met() );
	}

	/**
	 * @testdox Test if an exception is being correctly thrown for wrong operators.
	 */
	public function test_field_changed_invalid_operator_throws_exception() {
		$contact_field_changed_condition = $this->get_contact_field_changed_condition( 'wrong_operator', 'customer' );
		$contact_data                    = $this->automation_faker->contact_data();

		$this->expectException( Automation_Exception::class );
		$this->expectExceptionMessage( 'Invalid operator: wrong_operator' );

		$contact_field_changed_condition->execute( $contact_data );
	}

}
