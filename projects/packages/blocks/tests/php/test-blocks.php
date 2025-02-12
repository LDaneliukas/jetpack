<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Test methods from Automattic\Jetpack\Blocks
 *
 * @since 9.0.0
 *
 * @package automattic/jetpack-blocks
 */

namespace Automattic\Jetpack;

use Automattic\Jetpack\Constants as Jetpack_Constants;
use Brain\Monkey;
use PHPUnit\Framework\TestCase;

/**
 * Class Test_Blocks
 */
class Test_Blocks extends TestCase {
	use \Yoast\PHPUnitPolyfills\Polyfills\AssertStringContains;

	/**
	 * Test block name.
	 *
	 * @var string
	 */
	public $block_name = 'jetpack/apple';

	/**
	 * Setup runs before each test.
	 *
	 * @before
	 */
	public function set_up() {
		Monkey\setUp();
		// Register a test block.
		Blocks::jetpack_register_block( $this->block_name );
	}

	/**
	 * Teardown runs after each test.
	 *
	 * @after
	 */
	public function tear_down() {
		Monkey\tearDown();
		// Unregister the test Jetpack block we may have created for our tests.
		unregister_block_type( $this->block_name );
	}

	/**
	 * Test the different inputs and matching output for Classes.
	 *
	 * @since 9.0.0
	 *
	 * @covers Automattic\Jetpack\Blocks::classes
	 */
	public function test_block_classes() {
		$block_name = 'foo';
		$attr       = array(
			'bar'       => 'baz',
			'align'     => 'wide',
			'className' => 'editorclass',
		);
		$extra      = array( 'extraclass' );

		$block_classes = Blocks::classes( $block_name, $attr, $extra );

		$this->assertStringContainsString( 'wp-block-jetpack-foo', $block_classes ); // a general class is created from the block name.
		$this->assertStringNotContainsString( 'bar', $block_classes ); // The extra 'bar' attribute should be dropped.
		$this->assertStringNotContainsString( 'baz', $block_classes ); // The extra 'baz' attribute should be dropped.
		$this->assertStringNotContainsString( 'align ', $block_classes ); // The align attribute should only be used to create a new attribute.
		$this->assertStringNotContainsString( 'className', $block_classes ); // The className attribute should be dropped, only the editorclass value should remain.
		$this->assertStringContainsString( 'alignwide', $block_classes ); // an alignment class is created.
		$this->assertStringContainsString( 'editorclass', $block_classes ); // className classes are passed.
		$this->assertStringContainsString( 'extraclass', $block_classes ); // Extra class remains.
	}

	/**
	 * Test for invalid alignment values.
	 *
	 * @since 9.0.0
	 *
	 * @covers Automattic\Jetpack\Blocks::classes
	 */
	public function test_block_classes_invalid_align() {
		$attr          = array( 'align' => 'test' );
		$block_classes = Blocks::classes( 'test', $attr );

		$this->assertStringNotContainsString( 'aligntest', $block_classes );
	}

	/**
	 * Test whether we can detect an AMP view.
	 *
	 * @since 9.0.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_amp_request
	 */
	public function test_is_amp_request() {
		add_filter( 'jetpack_is_amp_request', '__return_true' );
		try {
			$this->assertTrue( Blocks::is_amp_request() );
		} finally {
			remove_filter( 'jetpack_is_amp_request', '__return_true' );
		}
	}

	/**
	 * Test whether we can detect an AMP view.
	 *
	 * @since 9.0.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_amp_request
	 */
	public function test_is_not_amp_request() {
		$this->assertFalse( Blocks::is_amp_request() );
	}

	/**
	 * Test WordPress and Gutenberg version requirements.
	 *
	 * @covers Automattic\Jetpack\Blocks::is_gutenberg_version_available
	 */
	public function test_returns_false_if_core_wp_version_less_than_minimum() {
		$version_gated = Blocks::is_gutenberg_version_available(
			array(
				'wp'        => '999999',
				'gutenberg' => '999999',
			),
			'gated_block'
		);
		$this->assertFalse( false, $version_gated );
	}

	/**
	 * Test WordPress and Gutenberg version requirements.
	 *
	 * @covers Automattic\Jetpack\Blocks::is_gutenberg_version_available
	 */
	public function test_returns_true_if_core_wp_version_greater_or_equal_to_minimum() {
		$version_gated = Blocks::is_gutenberg_version_available(
			array(
				'wp'        => '1',
				'gutenberg' => '999999',
			),
			'ungated_block'
		);
		$this->assertTrue( true, $version_gated );
	}

	/**
	 * Testing removing the Jetpack prefix from a block slug.
	 *
	 * @covers Automattic\Jetpack\Blocks::remove_extension_prefix
	 *
	 * @dataProvider get_extension_name_provider
	 *
	 * @param string $extension_slug      Block / Extension name.
	 * @param string $expected_short_slug Extension name without Jetpack prefix.
	 */
	public function test_remove_extension_prefix( $extension_slug, $expected_short_slug ) {
		$short_slug = Blocks::remove_extension_prefix( $extension_slug );

		$this->assertEquals( $expected_short_slug, $short_slug );
	}

	/**
	 * Get different possible block names.
	 *
	 * Data provider for test_remove_extension_prefix.
	 */
	public function get_extension_name_provider() {
		return array(
			'not_jetpack'    => array(
				'woocommerce/product-best-sellers',
				'woocommerce/product-best-sellers',
			),
			'jetpack_dash'   => array(
				'jetpack/shortlinks',
				'shortlinks',
			),
			'jetpack_hyphen' => array(
				'jetpack-shortlinks',
				'shortlinks',
			),
		);
	}

	/**
	 * Test to ensure that an extension is returned as registered.
	 *
	 * @covers Automattic\Jetpack\Blocks::is_registered
	 */
	public function test_is_extension_registered() {
		// Test for the block that is registered for all tests here.
		$this->assertTrue( Blocks::is_registered( $this->block_name ) );
		// Test for a non-existing block.
		$this->assertFalse( Blocks::is_registered( 'foo/bar' ) );
	}

	/**
	 * Ensure blocks cannot be registered twice.
	 *
	 * @covers Automattic\Jetpack\Blocks::jetpack_register_block
	 */
	public function test_jetpack_register_block_twice() {
		$result = Blocks::jetpack_register_block( $this->block_name );
		$this->assertFalse( $result );
	}

	/**
	 * Test to ensure blocks without a Jetpack prefix are registered, but with a jetpack prefix.
	 *
	 * @expectedIncorrectUsage Automattic\Jetpack\Blocks::jetpack_register_block
	 * @covers Automattic\Jetpack\Blocks::jetpack_register_block
	 */
	public function test_jetpack_register_block_without_jetpack() {
		$result = Blocks::jetpack_register_block( 'doing-it-wrong' );
		$this->assertEquals( 'jetpack/doing-it-wrong', $result->name );
	}

	/**
	 * Test that we can detect an FSE theme.
	 *
	 * @since 9.8.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_fse_theme
	 */
	public function test_is_not_fse_theme() {
		$this->assertFalse( Blocks::is_fse_theme() );
	}

	/**
	 * Test that we can detect an FSE theme using the provided filter.
	 *
	 * @since 9.8.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_fse_theme
	 */
	public function test_is_fse_theme_via_filter() {
		add_filter( 'jetpack_is_fse_theme', '__return_true' );
		try {
			$this->assertTrue( Blocks::is_fse_theme() );
		} finally {
			remove_filter( 'jetpack_is_fse_theme', '__return_true' );
		}
	}

	/**
	 * Test that by default we are not running in a Jetpack plugin context.
	 *
	 * @since 9.6.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_standalone_block
	 */
	public function test_is_standalone_block() {
		$this->assertTrue( Blocks::is_standalone_block() );
	}

	/**
	 * Test that we are running in a Jetpack plugin context, and not
	 * as a standalone block.
	 *
	 * @since 9.6.0
	 *
	 * @covers Automattic\Jetpack\Blocks::is_standalone_block
	 */
	public function test_is_not_standalone_block() {
		add_filter( 'jetpack_is_standalone_block', '__return_false' );
		try {
			$this->assertFalse( Blocks::is_standalone_block() );
		} finally {
			remove_filter( 'jetpack_is_standalone_block', '__return_false' );
		}
	}

	/**
	 * Test to ensure registering a Jetpack block does not add in an editor style dependency,
	 * when the Jetpack_Gutenberg class is not available.
	 *
	 * @since 9.6.0
	 *
	 * @covers Automattic\Jetpack\Blocks::jetpack_register_block
	 */
	public function test_jetpack_register_block_without_editor_style() {
		$result = Blocks::jetpack_register_block( 'jetpack/block-without-editor-style' );
		$this->assertEquals( 'jetpack/block-without-editor-style', $result->name );
		$this->assertNull( $result->editor_style );
	}

	/**
	 * Test to ensure registering a Jetpack block adds in an editor style dependency,
	 * when the Jetpack_Gutenberg class is available.
	 *
	 * @since 9.6.0
	 *
	 * @covers Automattic\Jetpack\Blocks::jetpack_register_block
	 */
	public function test_jetpack_register_block_with_editor_style() {
		add_filter( 'jetpack_is_standalone_block', '__return_false' );
		try {
			$result = Blocks::jetpack_register_block( 'jetpack/block-with-editor-style' );
			$this->assertEquals( 'jetpack/block-with-editor-style', $result->name );
			$this->assertEquals( 'jetpack-blocks-editor', $result->editor_style );
		} finally {
			remove_filter( 'jetpack_is_standalone_block', '__return_false' );
		}
	}

	/**
	 * Test to ensure registering a Jetpack block does not override an existing dependency,
	 * when the Jetpack_Gutenberg class is available.
	 *
	 * @since 9.6.0
	 *
	 * @covers Automattic\Jetpack\Blocks::jetpack_register_block
	 */
	public function test_jetpack_register_block_with_existing_editor_style() {
		add_filter( 'jetpack_is_standalone_block', '__return_false' );
		try {
			$result = Blocks::jetpack_register_block(
				'jetpack/block-with-existing-editor-style',
				array(
					'editor_style' => 'custom-editor-style',
				)
			);
			$this->assertEquals( 'jetpack/block-with-existing-editor-style', $result->name );
			$this->assertEquals( 'custom-editor-style', $result->editor_style );
		} finally {
			remove_filter( 'jetpack_is_standalone_block', '__return_false' );
		}
	}

	/**
	 * Test registering a block by specifying the path to its metadata file.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_metadata_from_file
	 */
	public function test_jetpack_register_block_from_metadata_file() {
		$result = Blocks::jetpack_register_block( __DIR__ . '/fixtures/test-block/block.json' );

		$this->assertInstanceOf( 'WP_Block_Type', $result );
	}

	/**
	 * Test reading metadata from a block.json file by specifying its path.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_metadata_from_file
	 */
	public function test_get_block_metadata_from_file() {
		$result = Blocks::get_block_metadata_from_file( __DIR__ . '/fixtures/test-block/block.json' );

		// phpcs:ignore MediaWiki.PHPUnit.SpecificAssertions.assertIsArray -- assertIsArray not supported by all PHP versions we support.
		$this->assertTrue( is_array( $result ) );
		$this->assertNotEmpty( $result );
	}

	/**
	 * Test reading metadata from a block.json file by specifying its folder.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_metadata_from_file
	 */
	public function test_get_block_metadata_from_folder() {
		$result = Blocks::get_block_metadata_from_file( __DIR__ . '/fixtures/test-block' );

		// phpcs:ignore MediaWiki.PHPUnit.SpecificAssertions.assertIsArray -- assertIsArray not supported by all PHP versions we support.
		$this->assertTrue( is_array( $result ) );
		$this->assertNotEmpty( $result );
	}

	/**
	 * Test reading metadata from a file that doesn't exist.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_metadata_from_file
	 */
	public function test_get_block_metadata_from_wrong_file() {
		$result = Blocks::get_block_metadata_from_file( __DIR__ . '/fixtures/ghost-folder/block.json' );

		// phpcs:ignore MediaWiki.PHPUnit.SpecificAssertions.assertIsArray -- assertIsArray not supported by all PHP versions we support.
		$this->assertTrue( is_array( $result ) );
		$this->assertEmpty( $result );
	}

	/**
	 * Test reading the name of a block from its metadata.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_name_from_metadata
	 */
	public function test_get_block_name_from_metadata() {
		$name   = 'jetpack/test-block';
		$result = Blocks::get_block_name_from_metadata( array() );

		$this->assertSame( '', $result );

		$result = Blocks::get_block_name_from_metadata( array( 'name' => $name ) );

		$this->assertEquals( $result, $name );
	}

	/**
	 * Test reading the feature name of a block from its metadata.
	 *
	 * @since 1.5.0
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_name_from_metadata
	 */
	public function test_get_block_feature_from_metadata() {
		$feature = 'test-block';
		$name    = 'jetpack/' . $feature;
		$result  = Blocks::get_block_feature_from_metadata( array() );

		$this->assertSame( '', $result );

		$result = Blocks::get_block_feature_from_metadata( array( 'name' => $name ) );

		$this->assertEquals( $result, $feature );
	}

	/**
	 * Test getting the path to a block's metadata file.
	 *
	 * @since $$next-version$$
	 *
	 * @covers Automattic\Jetpack\Blocks::get_path_to_block_metadata
	 */
	public function test_get_path_to_block_metadata() {
		$base_dir  = __DIR__ . '/fixtures';
		$block_dir = $base_dir . '/test-block';

		// Existing build folder

		Jetpack_Constants::set_constant( 'JETPACK__PLUGIN_FILE', $base_dir . '/jetpack.php' );

		$result = Blocks::get_path_to_block_metadata( $block_dir );
		$this->assertEquals( $base_dir . '/_inc/blocks/test-block', $result );

		$result = Blocks::get_path_to_block_metadata( $block_dir, $base_dir . '/_inc/blocks/' );
		$this->assertEquals( $base_dir . '/_inc/blocks/test-block', $result );

		$result = Blocks::get_path_to_block_metadata( $block_dir, $base_dir . '/_inc/blocks' );
		$this->assertEquals( $base_dir . '/_inc/blocks/test-block', $result );

		// Invalid build folder

		Jetpack_Constants::set_constant( 'JETPACK__PLUGIN_FILE', '/a/b/c/jetpack.php' );

		$result = Blocks::get_path_to_block_metadata( $block_dir );
		$this->assertEquals( $block_dir, $result );

		$result = Blocks::get_path_to_block_metadata( $block_dir, '/dist' );
		$this->assertEquals( $block_dir, $result );

		Jetpack_Constants::clear_constants();
	}

	/**
	 * Test getting the block name.
	 *
	 * @since $$next-version$$
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_name
	 */
	public function test_get_block_name() {
		// Pass metadata

		$result = Blocks::get_block_name( array() );
		$this->assertSame( '', $result );

		$result = Blocks::get_block_name( array( 'name' => 'jetpack/test-block' ) );
		$this->assertEquals( 'jetpack/test-block', $result );

		// Pass path

		$result = Blocks::get_block_name( '' );
		$this->assertSame( '', $result );

		$result = Blocks::get_block_name( __DIR__ . '/fixtures/test-block/block.json' );
		$this->assertEquals( 'jetpack/test-block', $result );
	}

	/**
	 * Test getting the block feature name.
	 *
	 * @since $$next-version$$
	 *
	 * @covers Automattic\Jetpack\Blocks::get_block_feature
	 */
	public function test_get_block_feature() {
		// Pass metadata

		$result = Blocks::get_block_feature( array() );
		$this->assertSame( '', $result );

		$result = Blocks::get_block_feature( array( 'name' => 'jetpack/test-block' ) );
		$this->assertEquals( 'test-block', $result );

		// Pass path

		$result = Blocks::get_block_feature( '' );
		$this->assertSame( '', $result );

		$result = Blocks::get_block_feature( __DIR__ . '/fixtures/test-block/block.json' );
		$this->assertEquals( 'test-block', $result );
	}
}
