// phpcs:disable no-undef

/*
 * Thickbox 3.1 - One Box To Rule Them All. jQuery was removed by Automattic.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 */

/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/

let TB_WIDTH = 0;
let TB_HEIGHT = 0;
const a8c_tb_pathToImage = 'https://s0.wp.com/i/loading/dark-200.gif';
function show( element ) {
	element.style.display = 'block';
	element.style.visibility = 'visible';
}

//add thickbox to href & area elements that have a class of .thickbox
function a8c_tb_init( domChunk ) {
	document.querySelectorAll( domChunk ).forEach( function ( el ) {
		el.addEventListener(
			'click',
			function () {
				const t = this.title || this.name || null;
				const a = this.href || this.alt;
				const g = this.rel || false;
				a8c_tb_show( t, a, g );
				this.blur();
				return false;
			},
			false
		);
	} );
}

export const a8c_tb_show = function ( caption, url ) {
	const imgLoader = new Image(); // preload image
	imgLoader.src = a8c_tb_pathToImage;

	//function called when the user clicks on a thickbox link
	document.querySelectorAll( 'body', 'html' ).forEach( el => {
		el.style.height = '100%';
		el.style.width = '100%';
	} );
	document.querySelector( 'html' ).style.overflow = 'hidden';
	// try {
	if ( typeof document.body.style.maxHeight === 'undefined' ) {
		//if IE 6

		if ( document.getElementById( 'TB_HideSelect' ) === null ) {
			//iframe to hide select elements in ie6
			document
				.querySelector( 'body' )
				.insertAdjacentHTML(
					'beforeend',
					"<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>"
				);
			document.getElementById( 'TB_overlay' ).addEventListener( 'click', a8c_tb_remove, false );
		}
	} else if ( document.getElementById( 'TB_overlay' ) === null ) {
		document
			.querySelector( 'body' )
			.insertAdjacentHTML( 'beforeend', "<div id='TB_overlay'></div><div id='TB_window'></div>" );
		document.getElementById( 'TB_overlay' ).addEventListener( 'click', a8c_tb_remove, false );
	}

	if ( a8c_tb_detectMacXFF() ) {
		document.getElementById( 'TB_overlay' ).classList.add( 'TB_overlayMacFFBGHack' ); //use png overlay so hide flash
	} else {
		document.getElementById( 'TB_overlay' ).classList.add( 'TB_overlayBG' ); //use background and opacity
	}

	if ( caption === null ) {
		caption = '';
	}
	document
		.querySelector( 'body' )
		.insertAdjacentHTML(
			'beforeend',
			"<div id='TB_load'><img src='" + imgLoader.src + "' /></div>"
		); //add loader to the page
	show( document.getElementById( 'TB_load' ) ); //show loader
	//code to show html
	const queryString = url.replace( /^[^?]+\??/, '' );
	const params = a8c_tb_parseQuery( queryString );
	TB_WIDTH = params.width * 1 + 30 || 630; //defaults to 630 if no paramaters were added to URL
	TB_HEIGHT = params.height * 1 + 40 || 440; //defaults to 440 if no paramaters were added to URL
	const ajaxContentW = TB_WIDTH - 30;
	const ajaxContentH = TB_HEIGHT - 45;

	if ( url.indexOf( 'TB_iframe' ) !== -1 ) {
		// either iframe or ajax window
		const urlNoQuery = url.split( 'TB_' );
		document.getElementById( 'TB_iframeContent' )?.remove();
		if ( params.modal !== 'true' ) {
			//iframe no modal
			document
				.getElementById( 'TB_window' )
				.insertAdjacentHTML(
					'beforeend',
					"<div id='TB_title'><div id='TB_ajaxWindowTitle'>" +
						caption +
						"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a> or Esc Key</div></div><iframe frameborder='0' hspace='0' src='" +
						urlNoQuery[ 0 ] +
						"' id='TB_iframeContent' name='TB_iframeContent" +
						Math.round( Math.random() * 1000 ) +
						"' style='width:" +
						( ajaxContentW + 29 ) +
						'px;height:' +
						( ajaxContentH + 17 ) +
						"px;' > </iframe>"
				);
		} else {
			//iframe modal
			document.getElementById( 'TB_overlay' ).removeEventListener( 'click', a8c_tb_remove, false );
			document
				.getElementById( 'TB_window' )
				.insertAdjacentHTML(
					'beforeend',
					"<iframe frameborder='0' hspace='0' src='" +
						urlNoQuery[ 0 ] +
						"' id='TB_iframeContent' name='TB_iframeContent" +
						Math.round( Math.random() * 1000 ) +
						"' style='width:" +
						( ajaxContentW + 29 ) +
						'px;height:' +
						( ajaxContentH + 17 ) +
						"px;'> </iframe>"
				);
		}
		document.getElementById( 'TB_iframeContent' ).onload = a8c_tb_showIframe;
	} else if ( document.getElementById( 'TB_window' ).style.display !== 'block' ) {
		// not an iframe, ajax
		if ( params.modal !== 'true' ) {
			//ajax no modal
			document
				.getElementById( 'TB_window' )
				.insertAdjacentHTML(
					'beforeend',
					"<div id='TB_title'><div id='TB_ajaxWindowTitle'>" +
						caption +
						"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton'>close</a> or Esc Key</div></div><div id='TB_ajaxContent' style='width:" +
						ajaxContentW +
						'px;height:' +
						ajaxContentH +
						"px'></div>"
				);
		} else {
			//ajax modal
			document.getElementById( 'TB_overlay' ).removeEventListener( 'click', a8c_tb_remove );
			document
				.getElementById( 'TB_window' )
				.insertAdjacentHTML(
					'beforeend',
					"<div id='TB_ajaxContent' class='TB_modal' style='width:" +
						ajaxContentW +
						'px;height:' +
						ajaxContentH +
						"px;'></div>"
				);
		}
	} else {
		//this means the window is already up, we are just loading new content via ajax
		document.getElementById( 'TB_ajaxContent' )[ 0 ].style.width = ajaxContentW + 'px';
		document.getElementById( 'TB_ajaxContent' )[ 0 ].style.height = ajaxContentH + 'px';
		document.getElementById( 'TB_ajaxContent' )[ 0 ].scrollTop = 0;
		document.getElementById( 'TB_ajaxWindowTitle' ).html( caption );
	}

	document
		.getElementById( 'TB_closeWindowButton' )
		.addEventListener( 'click', a8c_tb_remove, false );

	if ( url.indexOf( 'TB_inline' ) !== -1 ) {
		document
			.getElementById( 'TB_ajaxContent' )
			.append( document.getElementById( params.inlineId ).children() );
		document.getElementById( 'TB_window' ).unload = function () {
			document
				.getElementById( params.inlineId )
				.append( document.getElementById( 'TB_ajaxContent' ).children() ); // move elements back when you're finished
		};
		a8c_tb_position();
		document.getElementById( 'TB_load' ).remove();
		show( document.getElementById( 'TB_window' ) );
	} else if ( url.indexOf( 'TB_iframe' ) !== -1 ) {
		a8c_tb_position();
		const isSafari = /^((?!chrome|android).)*safari/i.test( navigator.userAgent );

		if ( isSafari ) {
			//safari needs help because it will not fire iframe onload
			document.getElementById( 'TB_load' ).remove();
			show( document.getElementById( 'TB_window' ) );
		}
	} else {
		document
			.getElementById( 'TB_ajaxContent' )
			.load( ( url += '&random=' + new Date().getTime() ), function () {
				//to do a post change this load method
				a8c_tb_position();
				document.getElementById( 'TB_load' ).remove();
				a8c_tb_init( '#TB_ajaxContent a.thickbox' );
				show( document.getElementById( 'TB_window' ) );
			} );
	}

	if ( ! params.modal ) {
		document.onkeyup = function ( e ) {
			let keycode = null;
			if ( e === null ) {
				// ie
				keycode = event.keyCode;
			} else {
				// mozilla
				keycode = e.which;
			}
			if ( keycode === 27 ) {
				// close
				a8c_tb_remove();
			}
		};
	}
};

//helper functions below
export const a8c_tb_showIframe = function () {
	document.getElementById( 'TB_load' )?.remove();
	show( document.getElementById( 'TB_window' ) );
};

export const a8c_tb_remove = function () {
	document.getElementById( 'TB_imageOff' )?.removeEventListener( 'click', a8c_tb_remove );
	document.getElementById( 'TB_closeWindowButton' )?.removeEventListener( 'click', a8c_tb_remove );
	document.getElementById( 'TB_window' )?.remove();
	document.querySelectorAll( '#TB_window,#TB_overlay,#TB_HideSelect' ).forEach( el => {
		el.dispatchEvent( new Event( 'unload' ) );
		el.remove();
	} );
	document.getElementById( 'TB_load' )?.remove();
	if ( typeof document.body.style.maxHeight === 'undefined' ) {
		//if IE 6
		document.querySelectorAll( 'body', 'html' ).forEach( function ( el ) {
			el.style.height = 'auto';
			el.style.width = 'auto';
		} );
	}
	document.querySelector( 'html' ).style.overflow = '';
	document.onkeydown = '';
	document.onkeyup = '';
	return false;
};

function a8c_tb_position() {
	document.getElementById( 'TB_window' ).style.marginLeft =
		'-' + parseInt( TB_WIDTH / 2, 10 ) + 'px';
	document.getElementById( 'TB_window' ).style.width = TB_WIDTH + 'px';
	// Not supporting IR6 anymore
	// if ( ! ( jQuery.browser.msie && jQuery.browser.version < 7 ) ) {
	// 	// take away IE6
	// 	document.getElementById( 'TB_window' ).style.marginTop =
	// 		'-' + parseInt( TB_HEIGHT / 2, 10 ) + 'px';
	// }
}

function a8c_tb_parseQuery( query ) {
	const Params = {};
	if ( ! query ) {
		return Params;
	} // return empty object
	const Pairs = query.split( /[;&]/ );
	for ( let i = 0; i < Pairs.length; i++ ) {
		const KeyVal = Pairs[ i ].split( '=' );
		if ( ! KeyVal || KeyVal.length !== 2 ) {
			continue;
		}
		const key = unescape( KeyVal[ 0 ] );
		let val = unescape( KeyVal[ 1 ] );
		val = val.replace( /\+/g, ' ' );
		Params[ key ] = val;
	}
	return Params;
}

function a8c_tb_detectMacXFF() {
	const userAgent = navigator.userAgent.toLowerCase();
	if ( userAgent.indexOf( 'mac' ) !== -1 && userAgent.indexOf( 'firefox' ) !== -1 ) {
		return true;
	}
}
