/*
 * External dependencies
 */
import { aiAssistantIcon } from '@automattic/jetpack-ai-client';
import { RangeControl, Button, BaseControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
/**
 * Internal dependencies
 */
import { I18nMenuDropdown, LANGUAGE_MAP } from '../../../../components/i18n-dropdown-control';
import { PROMPT_TONES_MAP, ToneDropdownMenu } from '../../../../components/tone-dropdown-control';
/**
 * Types and constants
 */
export type AiExcerptControlProps = {
	/*
	 * Whether the component is disabled.
	 */
	disabled?: boolean;

	/*
	 * The number of words in the generated excerpt.
	 */
	words?: number;

	/*
	 * The minimum number of words in the generated excerpt.
	 */
	minWords?: number;

	/*
	 * The maximum number of words in the generated excerpt.
	 */
	maxWords?: number;

	/*
	 * Callback to change the number of words in the generated excerpt.
	 */
	onWordsNumberChange?: ( words: number ) => void;

	language?: string;
};

import './style.scss';

export function AiExcerptControl( {
	minWords = 10,
	maxWords = 100,
	disabled,

	words,
	onWordsNumberChange,

	language,
	onLanguageChange,

	tone,
	onToneChange,

	additionalRequest,
	onAdditionalRequestChange,
}: AiExcerptControlProps ) {
	const [ isSettingActive, setIsSettingActive ] = React.useState( false );

	function toggleSetting() {
		setIsSettingActive( prev => ! prev );
	}

	const lang = language?.split( ' ' )[ 0 ];
	const langLabel = LANGUAGE_MAP[ lang ]?.label;

	const toneLabel = PROMPT_TONES_MAP[ tone ]?.label;

	return (
		<div className="jetpack-ai-generate-excerpt-control">
			<BaseControl
				className="jetpack-ai-generate-excerpt-control__header"
				label={ __( 'Generate', 'jetpack' ) }
			>
				<Button
					label={ __( 'Advanced AI options', 'jetpack' ) }
					icon={ aiAssistantIcon }
					onClick={ toggleSetting }
					isPressed={ isSettingActive }
					isSmall
				/>
			</BaseControl>
			<RangeControl
				value={ words }
				onChange={ onWordsNumberChange }
				min={ minWords }
				max={ maxWords }
				help={ __(
					'Sets the limit for words in auto-generated excerpts. The final count may vary slightly due to sentence structure.',
					'jetpack'
				) }
				showTooltip={ false }
				disabled={ disabled }
			/>

			{ isSettingActive && (
				<>
					<I18nMenuDropdown
						disabled={ disabled }
						onChange={ onLanguageChange }
						value={ language }
						label={ langLabel }
					/>

					<ToneDropdownMenu label={ toneLabel } value={ tone } onChange={ onToneChange } />

					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Additional request', 'jetpack' ) }
						onChange={ onAdditionalRequestChange }
						value={ additionalRequest }
						disabled={ disabled }
					/>
				</>
			) }
		</div>
	);
}
