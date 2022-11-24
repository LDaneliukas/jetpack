/**
 * jQuery.query - Query String Modification and Creation for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/8/13
 *
 * @author Blair Mitchelmore
 * @version 2.2.3
 *
 **/
! ( function ( e ) {
	var t = e.separator || '&',
		l = ! 1 !== e.spaces,
		n = ( e.suffix, ! 1 !== e.prefix ? ( ! 0 === e.hash ? '#' : '?' ) : '' ),
		i = ! 1 !== e.numbers;
	jQuery.query = new ( function () {
		function c( e, t ) {
			return null != e && null !== e && ( ! t || e.constructor == t );
		}
		function u( e ) {
			for (
				var t, n = /\[([^[]*)\]/g, r = /^([^[]+)(\[.*\])?$/.exec( e ), e = r[ 1 ], u = [];
				( t = n.exec( r[ 2 ] ) );

			)
				u.push( t[ 1 ] );
			return [ e, u ];
		}
		function o( e, t, n ) {
			var r = t.shift();
			if ( ( 'object' != typeof e && ( e = null ), '' === r ) )
				if ( c( ( e = e || [] ), Array ) ) e.push( 0 == t.length ? n : o( null, t.slice( 0 ), n ) );
				else if ( c( e, Object ) ) {
					for ( var u = 0; null != e[ u++ ];  );
					e[ --u ] = 0 == t.length ? n : o( e[ u ], t.slice( 0 ), n );
				} else ( e = [] ).push( 0 == t.length ? n : o( null, t.slice( 0 ), n ) );
			else if ( r && r.match( /^\s*[0-9]+\s*$/ ) )
				( e = e || [] )[ ( i = parseInt( r, 10 ) ) ] =
					0 == t.length ? n : o( e[ i ], t.slice( 0 ), n );
			else {
				if ( ! r ) return n;
				var i = r.replace( /^\s*|\s*$/g, '' );
				if ( c( ( e = e || {} ), Array ) ) {
					for ( var s = {}, u = 0; u < e.length; ++u ) s[ u ] = e[ u ];
					e = s;
				}
				e[ i ] = 0 == t.length ? n : o( e[ i ], t.slice( 0 ), n );
			}
			return e;
		}
		function r( e ) {
			var n = this;
			return (
				( n.keys = {} ),
				e.queryObject
					? jQuery.each( e.get(), function ( e, t ) {
							n.SET( e, t );
					  } )
					: n.parseNew.apply( n, arguments ),
				n
			);
		}
		return (
			( r.prototype = {
				queryObject: ! 0,
				parseNew: function () {
					var n = this;
					return (
						( n.keys = {} ),
						jQuery.each( arguments, function () {
							var e = '' + this;
							( e = ( e = e.replace( /^[?#]/, '' ) ).replace( /[;&]$/, '' ) ),
								l && ( e = e.replace( /[+]/g, ' ' ) ),
								jQuery.each( e.split( /[&;]/ ), function () {
									var e = decodeURIComponent( this.split( '=' )[ 0 ] || '' ),
										t = decodeURIComponent( this.split( '=' )[ 1 ] || '' );
									e &&
										( i &&
											( /^[+-]?[0-9]+\.[0-9]*$/.test( t )
												? ( t = parseFloat( t ) )
												: /^[+-]?[1-9][0-9]*$/.test( t ) && ( t = parseInt( t, 10 ) ) ),
										n.SET( e, ( t = ( ! t && 0 !== t ) || t ) ) );
								} );
						} ),
						n
					);
				},
				has: function ( e, t ) {
					e = this.get( e );
					return c( e, t );
				},
				GET: function ( e ) {
					if ( ! c( e ) ) return this.keys;
					for (
						var e = u( e ), t = e[ 0 ], n = e[ 1 ], r = this.keys[ t ];
						null != r && 0 != n.length;

					)
						r = r[ n.shift() ];
					return 'number' == typeof r ? r : r || '';
				},
				get: function ( e ) {
					e = this.GET( e );
					return c( e, Object ) ? jQuery.extend( ! 0, {}, e ) : c( e, Array ) ? e.slice( 0 ) : e;
				},
				SET: function ( e, t ) {
					var n, r;
					return (
						e.includes( '__proto__' ) ||
							e.includes( 'constructor' ) ||
							e.includes( 'prototype' ) ||
							( ( t = c( t ) ? t : null ),
							( n = ( e = u( e ) )[ 0 ] ),
							( e = e[ 1 ] ),
							( r = this.keys[ n ] ),
							( this.keys[ n ] = o( r, e.slice( 0 ), t ) ) ),
						this
					);
				},
				set: function ( e, t ) {
					return this.copy().SET( e, t );
				},
				REMOVE: function ( e, t ) {
					if ( t ) {
						var n = this.GET( e );
						if ( c( n, Array ) ) {
							for ( tval in n ) n[ tval ] = n[ tval ].toString();
							var r = $.inArray( t, n );
							if ( ! ( 0 <= r ) ) return;
							e = ( e = n.splice( r, 1 ) )[ r ];
						} else if ( t != n ) return;
					}
					return this.SET( e, null ).COMPACT();
				},
				remove: function ( e, t ) {
					return this.copy().REMOVE( e, t );
				},
				EMPTY: function () {
					var n = this;
					return (
						jQuery.each( n.keys, function ( e, t ) {
							delete n.keys[ e ];
						} ),
						n
					);
				},
				load: function ( e ) {
					var t = e.replace( /^.*?[#](.+?)(?:\?.+)?$/, '$1' ),
						n = e.replace( /^.*?[?](.+?)(?:#.+)?$/, '$1' );
					return new r( e.length == n.length ? '' : n, e.length == t.length ? '' : t );
				},
				empty: function () {
					return this.copy().EMPTY();
				},
				copy: function () {
					return new r( this );
				},
				COMPACT: function () {
					return (
						( this.keys = ( function r( e ) {
							var u = 'object' == typeof e ? ( c( e, Array ) ? [] : {} ) : e;
							return (
								'object' == typeof e &&
									jQuery.each( e, function ( e, t ) {
										if ( ! c( t ) ) return ! 0;
										var n;
										( n = u ), ( t = r( t ) ), c( n, Array ) ? n.push( t ) : ( n[ e ] = t );
									} ),
								u
							);
						} )( this.keys ) ),
						this
					);
				},
				compact: function () {
					return this.copy().COMPACT();
				},
				toString: function () {
					function u( e, t ) {
						function r( e ) {
							return ( t && '' != t ? [ t, '[', e, ']' ] : [ e ] ).join( '' );
						}
						jQuery.each( e, function ( e, t ) {
							var n;
							'object' == typeof t
								? u( t, r( e ) )
								: ( ( n = i ),
								  ( e = r( e ) ),
								  c( ( t = t ) ) &&
										! 1 !== t &&
										( ( e = [ s( e ) ] ),
										! 0 !== t && ( e.push( '=' ), e.push( s( t ) ) ),
										n.push( e.join( '' ) ) ) );
						} );
					}
					var e = [],
						i = [],
						s = function ( e ) {
							return (
								( e += '' ),
								( e = encodeURIComponent( e ) ),
								( e = l ? e.replace( /%20/g, '+' ) : e )
							);
						};
					return u( this.keys ), 0 < i.length && e.push( n ), e.push( i.join( t ) ), e.join( '' );
				},
			} ),
			new r( location.search, location.hash )
		);
	} )();
} )( jQuery.query || {} );
