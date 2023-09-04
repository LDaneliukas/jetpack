/**
 * External dependencies
 */
import { SVG, Path, Rect } from '@wordpress/components';
import React from 'react';

const playerPause = (
	<SVG width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path
			d="M16 6.33325C14.7306 6.33325 13.4736 6.58329 12.3007 7.06908C11.1279 7.55488 10.0623 8.26692 9.16464 9.16455C8.26701 10.0622 7.55497 11.1278 7.06917 12.3006C6.58338 13.4735 6.33334 14.7305 6.33334 15.9999C6.33334 17.2694 6.58338 18.5264 7.06917 19.6992C7.55497 20.872 8.26701 21.9377 9.16464 22.8353C10.0623 23.7329 11.1279 24.445 12.3007 24.9308C13.4736 25.4165 14.7306 25.6666 16 25.6666C18.5638 25.6666 21.0225 24.6481 22.8354 22.8353C24.6482 21.0224 25.6667 18.5637 25.6667 15.9999C25.6667 13.4362 24.6482 10.9774 22.8354 9.16455C21.0225 7.3517 18.5638 6.33325 16 6.33325ZM4.33334 15.9999C4.33334 12.9057 5.56251 9.93826 7.75043 7.75034C9.93836 5.56242 12.9058 4.33325 16 4.33325C19.0942 4.33325 22.0617 5.56242 24.2496 7.75034C26.4375 9.93826 27.6667 12.9057 27.6667 15.9999C27.6667 19.0941 26.4375 22.0616 24.2496 24.2495C22.0617 26.4374 19.0942 27.6666 16 27.6666C12.9058 27.6666 9.93836 26.4374 7.75043 24.2495C5.56251 22.0616 4.33334 19.0941 4.33334 15.9999Z"
			fill="currentColor"
		/>
		<Rect x="17" y="12" width="3" height="8" fill="currentColor" />
		<Rect x="12" y="12" width="3" height="8" fill="currentColor" />
	</SVG>
);

export default playerPause;
