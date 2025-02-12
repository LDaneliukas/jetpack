import { InspectorAdvancedControls, InspectorControls } from '@wordpress/block-editor';
import { BaseControl, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

export function AiChatControls( { setAttributes, askButtonLabel } ) {
	const [ promptOverride, setPromptOverride ] = useEntityProp(
		'root',
		'site',
		'jetpack_search_ai_prompt_override'
	);
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'jetpack' ) } initialOpen={ false }>
					<BaseControl
						label={ __( 'Ask button', 'jetpack' ) }
						help={ __( 'What do you want the button to say?', 'jetpack' ) }
						className="jetpack-ai-chat__ask-button-text"
					>
						<TextControl
							placeholder={ __( 'Ask', 'jetpack' ) }
							onChange={ newAskButtonLabel =>
								setAttributes( { askButtonLabel: newAskButtonLabel } )
							}
							value={ askButtonLabel }
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				<BaseControl
					label={ __( 'Additional instructions', 'jetpack' ) }
					help={ __(
						'This will instruct Jetpack AI to adjust the answer in a certain way. You can ask it to only provide one sentence response, or make it talk like a pirate, but please remember your instructions may have unintended consequences.',
						'jetpack'
					) }
				>
					<TextareaControl value={ promptOverride } onChange={ setPromptOverride } />
				</BaseControl>
			</InspectorAdvancedControls>
		</>
	);
}
