<?php
/** Blocks package.
 *
 * @since 1.1.0
 *
 * This package lifts elements from Jetpack's Jetpack_Gutenberg class.
 * It is now an standalone package reusable outside Jetpack.
 *
 * @package automattic/jetpack-blocks
 */

namespace Automattic\Jetpack;

use Automattic\Jetpack\Constants as Jetpack_Constants;
use Jetpack_Gutenberg;

/**
 * Register and manage blocks within a plugin. Used to manage block registration, enqueues, and more.
 *
 * @since 1.1.0
 */
class Blocks {
	/**
	 * Wrapper function to safely register a Gutenberg block type
	 *
	 * @see register_block_type
	 * @see Automattic\Jetpack\Blocks::is_gutenberg_version_available
	 *
	 * @since 1.1.0
	 *
	 * @param string $slug Slug of the block or absolute path to the block source code directory.
	 * @param array  $args {
	 *     Arguments that are passed into register_block_type.
	 *     See register_block_type for full list of arguments.
	 *     Can also include 2 extra arguments not currently supported by register_block_type.
	 *
	 *     @type array $version_requirements Array containing required Gutenberg version and, if known, the WordPress version that was released with this minimum version.
	 *     @type bool  $plan_check           Should we check for a specific plan before registering the block.
	 * }
	 *
	 * @return WP_Block_Type|false The registered block type on success, or false on failure.
	 */
	public static function jetpack_register_block( $slug, $args = array() ) {
		// Slug doesn't start with `jetpack/`, isn't an absolute path, or doesn't contain a slash
		// (synonym of a namespace) at all.
		if ( 0 !== strpos( $slug, 'jetpack/' ) && 0 !== strpos( $slug, '/' ) && ! strpos( $slug, '/' ) ) {
			_doing_it_wrong( 'jetpack_register_block', 'Prefix the block with jetpack/ ', 'Jetpack 9.0.0' );
			$slug = 'jetpack/' . $slug;
		}

		$block_type = $slug;

		// If a path is passed, find the slug in the file then create a block type object to register
		// the block.
		// Note: passing the path directly to register_block_type seems to loose the interactivity of
		// the block once in the editor once it's out of focus.
		if ( '/' === substr( $slug, 0, 1 ) ) {
			// Test if build directory exists. Fall back to reading block.json from source directory.
			$build_dir = realpath( self::get_path_to_block_metadata( $slug ) );
			$path      = false === $build_dir ? $slug : $build_dir;
			$metadata  = self::get_block_metadata_from_file( $path );
			$name      = self::get_block_name_from_metadata( $metadata );

			if ( ! empty( $name ) ) {
				$slug       = $name;
				$block_type = new \WP_Block_Type( $slug, array_merge( $metadata, $args ) );
			}
		}

		if (
			isset( $args['version_requirements'] )
			&& ! self::is_gutenberg_version_available( $args['version_requirements'], $slug )
		) {
			return false;
		}

		// Checking whether block is registered to ensure it isn't registered twice.
		if ( self::is_registered( $slug ) ) {
			return false;
		}

		$feature_name = self::remove_extension_prefix( $slug );

		// This is only useful in Jetpack.
		if ( ! self::is_standalone_block() ) {
			// If the block is dynamic, and a Jetpack block, wrap the render_callback to check availability.
			if ( ! empty( $args['plan_check'] ) ) {
				// Set up attributes.
				if ( ! isset( $args['attributes'] ) ) {
					$args['attributes'] = array();
				}
				$args['attributes'] = array_merge(
					$args['attributes'],
					array(
						// Indicates that this block should display an upgrade nudge on the frontend when applicable.
						'shouldDisplayFrontendBanner' => array(
							'type'    => 'boolean',
							'default' => true,
						),
					)
				);
				if ( isset( $args['render_callback'] ) ) {
					$args['render_callback'] = Jetpack_Gutenberg::get_render_callback_with_availability_check( $feature_name, $args['render_callback'] );
				}
				$method_name = 'set_availability_for_plan';
			} else {
				$method_name = 'set_extension_available';
			}

			add_action(
				'jetpack_register_gutenberg_extensions',
				function () use ( $feature_name, $method_name ) {
					call_user_func( array( 'Jetpack_Gutenberg', $method_name ), $feature_name );
				}
			);

			// Ensure editor styles are registered so that the site editor knows about the
			// editor style dependency when copying styles to the editor iframe.
			if ( ! isset( $args['editor_style'] ) ) {
				$args['editor_style'] = 'jetpack-blocks-editor';
			}
		}

		return register_block_type( $block_type, $args );
	}

	/**
	 * Read block metadata from a block.json file.
	 *
	 * @param string $filename The path to the block.json file or its directory.
	 *
	 * @return array The block metadata.
	 */
	public static function get_block_metadata_from_file( $filename ) {
		$metadata = array();
		$needle   = '/block.json';
		$filename = $needle === substr( $filename, -strlen( $needle ) ) ? $filename : realpath( $filename . $needle );

		if ( file_exists( $filename ) ) {
			try {
				$metadata = wp_json_file_decode( $filename, array( 'associative' => true ) );
			} catch ( \Exception $e ) {
				$metadata = array();
			}
		}

		return $metadata;
	}

	/**
	 * Get the block name from the its metadata.
	 *
	 * @param array $metadata The block metadata.
	 *
	 * @return string The block name.
	 */
	public static function get_block_name_from_metadata( $metadata ) {
		return ! isset( $metadata['name'] ) || empty( $metadata['name'] ) ? '' : $metadata['name'];
	}

	/**
	 * Get the block feature name (i.e. the name without the `jetpack` prefix) from its metadata.
	 *
	 * @param array $metadata The block metadata.
	 *
	 * @return string The block feature name.
	 */
	public static function get_block_feature_from_metadata( $metadata ) {
		return str_replace( 'jetpack/', '', self::get_block_name_from_metadata( $metadata ) );
	}

	/**
	 * Check if an extension/block is already registered
	 *
	 * @since 1.1.0
	 *
	 * @param string $slug Name of extension/block to check.
	 *
	 * @return bool
	 */
	public static function is_registered( $slug ) {
		return \WP_Block_Type_Registry::get_instance()->is_registered( $slug );
	}

	/**
	 * Remove the 'jetpack/' or jetpack-' prefix from an extension name
	 *
	 * @since 1.1.0
	 *
	 * @param string $extension_name The extension name.
	 *
	 * @return string The unprefixed extension name.
	 */
	public static function remove_extension_prefix( $extension_name ) {
		if ( 0 === strpos( $extension_name, 'jetpack/' ) || 0 === strpos( $extension_name, 'jetpack-' ) ) {
			return substr( $extension_name, strlen( 'jetpack/' ) );
		}
		return $extension_name;
	}

	/**
	 * Check to see if a minimum version of Gutenberg is available. Because a Gutenberg version is not available in
	 * php if the Gutenberg plugin is not installed, if we know which minimum WP release has the required version we can
	 * optionally fall back to that.
	 *
	 * @since 1.1.0
	 *
	 * @param array  $version_requirements {
	 *     An array containing the required Gutenberg version and, if known, the WordPress version that was released with this minimum version.
	 *
	 *     @type string $gutenberg Gutenberg version.
	 *     @type string $wp        Optional. WordPress version.
	 * }
	 * @param string $slug The slug of the block or plugin that has the Gutenberg version requirement.
	 *
	 * @return boolean True if the version of Gutenberg required by the block or plugin is available.
	 */
	public static function is_gutenberg_version_available( $version_requirements, $slug ) {
		global $wp_version;

		// Bail if we don't at least have the Gutenberg version requirement, the WP version is optional.
		if ( empty( $version_requirements['gutenberg'] ) ) {
			return false;
		}

		// If running a local dev build of Gutenberg plugin GUTENBERG_DEVELOPMENT_MODE is set so assume correct version.
		if ( defined( 'GUTENBERG_DEVELOPMENT_MODE' ) && GUTENBERG_DEVELOPMENT_MODE ) {
			return true;
		}

		$version_available = false;

		// If running a production build of the Gutenberg plugin then GUTENBERG_VERSION is set, otherwise if WP version
		// with required version of Gutenberg is known check that.
		if ( defined( 'GUTENBERG_VERSION' ) ) {
			$version_available = version_compare( GUTENBERG_VERSION, $version_requirements['gutenberg'], '>=' );
		} elseif ( ! empty( $version_requirements['wp'] ) ) {
			$version_available = version_compare( $wp_version, $version_requirements['wp'], '>=' );
		}

		if (
			! $version_available
			&& ! self::is_standalone_block() // This is only useful in Jetpack.
		) {
			Jetpack_Gutenberg::set_extension_unavailable(
				$slug,
				'incorrect_gutenberg_version',
				array(
					'required_feature' => $slug,
					'required_version' => $version_requirements,
					'current_version'  => array(
						'wp'        => $wp_version,
						'gutenberg' => defined( 'GUTENBERG_VERSION' ) ? GUTENBERG_VERSION : null,
					),
				)
			);
		}

		return $version_available;
	}

	/**
	 * Get CSS classes for a block.
	 *
	 * @since 1.1.0
	 *
	 * @param string $slug  Block slug.
	 * @param array  $attr  Block attributes.
	 * @param array  $extra Potential extra classes you may want to provide.
	 *
	 * @return string $classes List of CSS classes for a block.
	 */
	public static function classes( $slug, $attr, $extra = array() ) {
		if ( empty( $slug ) ) {
			return '';
		}

		// Basic block name class.
		$classes = array(
			'wp-block-jetpack-' . $slug,
		);

		// Add alignment if provided.
		if (
			! empty( $attr['align'] )
			&& in_array( $attr['align'], array( 'left', 'center', 'right', 'wide', 'full' ), true )
		) {
			$classes[] = 'align' . $attr['align'];
		}

		// Add custom classes if provided in the block editor.
		if ( ! empty( $attr['className'] ) ) {
			$classes[] = $attr['className'];
		}

		// Add any extra classes.
		if ( is_array( $extra ) && ! empty( $extra ) ) {
			$classes = array_merge( $classes, array_filter( $extra ) );
		}

		return implode( ' ', $classes );
	}

	/**
	 * Does the page return AMP content.
	 *
	 * @since 1.1.0
	 *
	 * @return bool $is_amp_request Are we on an AMP view.
	 */
	public static function is_amp_request() {
		$is_amp_request = ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() );

		/** This filter is documented in 3rd-party/class.jetpack-amp-support.php */
		return apply_filters( 'jetpack_is_amp_request', $is_amp_request );
	}

	/**
	 * Is the current theme an FSE/Site Editor theme.
	 *
	 * @since 1.4.0
	 * @since 1.4.22 Remove support for deprecated `gutenberg_is_fse_theme` function.
	 *
	 * @return bool True if the current theme is an FSE/Site Editor theme.
	 */
	public static function is_fse_theme() {
		$is_fse_theme = wp_is_block_theme();

		/**
		 * Returns true if the current theme is an FSE/Site Editor theme.
		 *
		 * @since 1.4.0
		 *
		 * @param boolean $is_fse_theme Is the theme an FSE theme.
		 */
		return apply_filters( 'jetpack_is_fse_theme', $is_fse_theme );
	}

	/**
	 * Check whether or the block being registered is a standalone block,
	 * running in a context outside of the Jetpack plugin.
	 *
	 * @since 1.3.0
	 *
	 * @return bool
	 */
	public static function is_standalone_block() {
		$is_standalone_block = ! class_exists( Jetpack_Gutenberg::class );

		/**
		 * Returns true if the block is not being registered within a Jetpack plugin context.
		 *
		 * @since 1.3.0
		 *
		 * @param boolean $is_standalone_block Is the block running standalone versus as part of the Jetpack plugin.
		 */
		return apply_filters( 'jetpack_is_standalone_block', $is_standalone_block );
	}

	/**
	 * Returns the path to the directory containing the block.json metadata file of a block, given its
	 * source code directory and, optionally, the directory that holds the blocks built files of
	 * the package.
	 *
	 * @since $$next-version$$
	 *
	 * @param string $block_src_dir    The path to the folder containing the block source code.
	 *                                 Typically this is done by passing __DIR__ as the argument.
	 * @param string $package_dist_dir Optional. A full path to the directory containing the blocks
	 *                                 built files of the package. Default empty.
	 *
	 * @return string The path to the directory.
	 */
	public static function get_path_to_block_metadata( $block_src_dir, $package_dist_dir = '' ) {
		$dir       = basename( $block_src_dir );
		$dist_path = empty( $package_dist_dir ) ? dirname( Jetpack_Constants::get_constant( 'JETPACK__PLUGIN_FILE' ) ) . '/_inc/blocks/' : $package_dist_dir;
		$dist_path = substr( $dist_path, -1, 1 ) === '/' ? $dist_path : $dist_path . '/';

		return $dist_path . $dir;
	}
}
