<script lang="ts">
	import { Button, Notice } from '@automattic/jetpack-components';
	import React from 'react';
	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import ReactComponent from './ReactComponent.svelte';

	type ActionButton = {
		label: string;
		onClick?: () => void;
		isLoading?: boolean;
		disabled?: boolean;
	};

	export let level: 'info' | 'warning' | 'success' | 'error' = 'info';
	export let title: string;
	export let message: string;
	export let actions: ActionButton[] | undefined;
	export let hideCloseButton = true;

	const dispatch = createEventDispatcher();

	const actionComponents = actions?.map( ( action, index ) =>
		React.createElement(
			Button,
			{
				isPrimary: true,
				onClick: action.onClick,
				key: index,
				isLoading: !! action.isLoading,
				disabled: !! action.disabled,
			},
			action.label
		)
	);
</script>

<div transition:slide|local>
	<ReactComponent
		this={Notice}
		{level}
		{title}
		children={message}
		actions={actionComponents}
		onClose={() => {
			dispatch( 'onClose' );
		}}
		{hideCloseButton}
	/>
</div>
