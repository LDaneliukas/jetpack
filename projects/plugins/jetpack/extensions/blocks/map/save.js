/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { settings } from './settings.js';
import { getActiveStyleName } from '../../shared/block-styles';

class MapSave extends Component {
	render() {
		const { attributes } = this.props;
		const {
			align,
			className,
			mapDetails,
			points,
			zoom,
			mapCenter,
			markerColor,
			scrollToZoom,
			mapHeight,
			showFullscreenButton,
			isStaticMap,
			staticMapImageUrl,
		} = attributes;
		const mapStyle = getActiveStyleName( settings.styles, className );
		const pointsList = points.map( ( point, index ) => {
			const { longitude, latitude } = point.coordinates;
			const url = 'https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude;
			return (
				<li key={ index }>
					<a href={ url }>{ point.title }</a>
				</li>
			);
		} );
		const alignClassName = align ? `align${ align }` : null;

		if ( isStaticMap && staticMapImageUrl ) {
			return (
				<div className={ alignClassName } data-jetpack-block-initialized>
					<img alt="" src={ staticMapImageUrl } />
				</div>
			);
		}

		// All camelCase attribute names converted to snake_case data attributes
		return (
			<div
				className={ alignClassName }
				data-map-style={ mapStyle }
				data-map-details={ mapDetails }
				data-points={ JSON.stringify( points ) }
				data-zoom={ zoom }
				data-map-center={ JSON.stringify( mapCenter ) }
				data-marker-color={ markerColor }
				data-scroll-to-zoom={ scrollToZoom || null }
				data-map-height={ mapHeight || null }
				data-show-fullscreen-button={ showFullscreenButton || null }
			>
				{ points.length > 0 && <ul>{ pointsList }</ul> }
			</div>
		);
	}
}

export default MapSave;
