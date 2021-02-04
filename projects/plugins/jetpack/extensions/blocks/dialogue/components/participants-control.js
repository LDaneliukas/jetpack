/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { DropdownMenu, MenuGroup, MenuItem, SelectControl } from '@wordpress/components';
import { check, people } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

import { useMemo, useState, useEffect } from '@wordpress/element';
import { __experimentalUseFocusOutside as useFocusOutside } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { getParticipantByLabel } from '../../conversation/utils';

const EDIT_MODE_ADDING = 'is-adding';
const EDIT_MODE_SELECTING = 'is-selecting';
const EDIT_MODE_EDITING = 'is-editing';

// Fallback for `useFocusOutside` hook.
const useFocusOutsideIsAvailable = typeof useFocusOutside !== 'undefined';
const useFocusOutsideWithFallback = useFocusOutsideIsAvailable ? useFocusOutside : () => {};

function ParticipantsMenu( { participants, className, onSelect, participantSlug, onClose } ) {
	return (
		<MenuGroup className={ `${ className }__participants-selector` }>
			{ participants.map( ( { value, slug } ) => {
				// eslint-disable-next-line react/no-danger
				const optionValue = <span dangerouslySetInnerHTML={ {
					__html: value,
				} } />;

				return (
					<MenuItem
						key={ slug }
						onClick={ () => {
							onSelect( { participantSlug: slug } );
							onClose();
						} }
						isSelected={ participantSlug === slug }
						icon={ participantSlug === slug ? check : null }
					>
						{ optionValue }
					</MenuItem>
				);
			} ) }
		</MenuGroup>
	);
}

export function ParticipantsControl( { participants, participantSlug, onSelect } ) {
	return (
		<SelectControl
			label={ __( 'Participant name', 'jetpack' ) }
			value={ participantSlug }
			options={ participants.map( ( { slug: value, label } ) => ( {
				label,
				value,
			} ) ) }
			onChange={ slug => onSelect( { participantSlug: slug } ) }
		/>
	);
}

export default function ParticipantsDropdown( props ) {
	return (
		<DropdownMenu
			popoverProps={ {
				position: 'bottom',
			} }
			icon={ people }
		>
			{ ( { onClose } ) => <ParticipantsMenu { ...props } onClose={ onClose } /> }
		</DropdownMenu>
	);
}

/**
 * Participants Autocompleter.
 *
 * @param {Array} participants - Conversation participants list.
 * @returns {object} Participants autocompleter.
 */
function refreshAutocompleter( participants ) {
	return {
		name: 'jetpack/conversation-participants',
		triggerPrefix: '',
		options: participants,

		getOptionLabel: ( { label } ) => (
			<span>{ label }</span>
		),

		getOptionKeywords: ( { label } ) => [ label ],

		getOptionCompletion: ( option ) => ( {
			action: 'replace',
			value: option,
		} ),

		popoverProps: {
			position: 'bottom',
		},
	};
}

/**
 * Control to edit Dialogue participant globally.
 *
 * @param {object}   prop                     - ParticipantRichControl component.
 * @param {string}   prop.className           - Component CSS class.
 * @param {string}   prop.label               - Dialogue participant value. Local level.
 * @param {Array}    prop.participants        - Participants list. Global level (Conversation block).
 * @param {string}   prop.reRenderingKey      - Custom property to for a re-render in the rich text component.
 * @param {object}   prop.participant         - Participant object. Gloanl level.
 * @param {Function} prop.onParticipantChange - Use this callback to update participant label, locally.
 * @param {Function} prop.onUpdate            - Use this callback to update the participant, but globaly.
 * @param {Function} prop.onSelect            - Callback triggered when a particpant is selectd from the list.
 * @param {Function} prop.onAdd               - Callback used to add a new participant.
 * @param {Function} prop.onClean             - Use this callback to disassociate the Dialogue with a participant.
 * @returns {Function} React component function.
 */
export function ParticipantsRichControl( {
	className,
	label,
	participants,
	participant,
	reRenderingKey,
	onParticipantChange,
	onUpdate = () => {},
	onSelect,
	onAdd,
	onClean,
} ) {
	const [ editingMode, setEditingMode ] = useState( participant ? EDIT_MODE_SELECTING : EDIT_MODE_ADDING );

	function onActionHandler( forceFocus ) {
		switch ( editingMode ) {
			case EDIT_MODE_ADDING: {
				return onAdd( label, ! useFocusOutsideIsAvailable || forceFocus );
			}

			case EDIT_MODE_EDITING: {
				return onUpdate( {
					slug: participant.slug,
					label,
				}, ! useFocusOutsideIsAvailable || forceFocus );
			}
		}
	}

	const focusOutsideProps = useFocusOutsideWithFallback( onActionHandler );

	/**
	 * Funcion handler when user types participant value.
	 * It can add a new participan, or add a new one,
	 * dependeing on the previous values.
	 *
	 * @param {string} newLabel - New participant value.
	 * @returns {null} Null
	 */
	function onChangeHandler( newLabel ) {
		// If the new value is empty,
		// activate autocomplete, and emit onClean(),
		// to clean the current participant.
		if ( ! newLabel?.length ) {
			setEditingMode( EDIT_MODE_ADDING );
			return onClean();
		}

		// Always update the participant value (block attribute).
		onParticipantChange( newLabel );

		const participantByNewLabel = getParticipantByLabel( participants, newLabel );

		// Set editing mode depending on participant label,
		// and current conversation participant
		// tied to this Dialogue block.
		if ( participant ) {
			if ( participant.value === newLabel ) {
				setEditingMode( EDIT_MODE_SELECTING );
			} else {
				setEditingMode( EDIT_MODE_EDITING );
			}
		} else if ( participantByNewLabel ) {
			setEditingMode( EDIT_MODE_SELECTING );
		} else {
			setEditingMode( EDIT_MODE_ADDING );
		}
	}

	// Keep autocomplete options udated.
	const autocompleter = useMemo( () => {
		if ( editingMode !== EDIT_MODE_ADDING ) {
			return [];
		}

		return [ refreshAutocompleter( participants ) ];
	}, [ participants, editingMode ] );

	useEffect( () => {
		setEditingMode( participant ? EDIT_MODE_SELECTING : EDIT_MODE_ADDING );
	}, [ participant ] );

	return (
		<div
			className={ classNames( className, {
				'is-adding-participant': editingMode === EDIT_MODE_ADDING,
				'is-editing-participant': editingMode === EDIT_MODE_EDITING,
				'is-selecting-participant': editingMode === EDIT_MODE_SELECTING,
			} ) }
			{ ...focusOutsideProps }
		>
			<RichText
				key={ reRenderingKey }
				tagName="div"
				value={ label }
				formattingControls={ [] }
				withoutInteractiveFormatting={ false }
				onChange={ onChangeHandler }
				placeholder={ __( 'Speaker', 'jetpack' ) }
				keepPlaceholderOnFocus={ true }
				onSplit={ () => {} }
				onReplace={ ( replaceValue ) => {
					const replacedParticipant = replaceValue?.[ 0 ];
					// Handling participant selection,
					// by picking them from the autocomplete options.
					if ( replacedParticipant ) {
						const { label: newLabel } = replacedParticipant;

						onParticipantChange( newLabel );
						setEditingMode( EDIT_MODE_SELECTING );
						return onSelect( replacedParticipant );
					}

					if ( ! label?.length ) {
						return;
					}

					// Handling participant selection,
					// by typing `ENTER` KEY.
					const participantExists = getParticipantByLabel( participants, label );
					if ( participantExists ) {
						if ( ! participant ) {
							setEditingMode( EDIT_MODE_SELECTING );
							return onSelect( participantExists, true );
						}

						// // Update participant format.
						// if ( participant?.value !== label ) {
						// 	setEditingMode( EDIT_MODE_EDITING );
						// 	return onActionHandler();
						// }
					}

					// From here, it will add a new participant.
					setEditingMode( EDIT_MODE_ADDING );
					onActionHandler( true );
				} }
				autocompleters={ autocompleter }
			/>
		</div>
	);
}
