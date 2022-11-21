import { JetpackLogo } from '@automattic/jetpack-components';
import { PanelBody, PanelRow } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { PluginPostPublishPanel } from '@wordpress/edit-post';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import JetpackPluginSidebar from '../../shared/jetpack-plugin-sidebar.js';
import { QRPostButton } from './components/qr-post.js';
import './editor.scss';
import LaunchpadModal from './components/launchpad-modal.js';

export const name = 'launchpad-modal';

export const settings = {
	render: function RenderLaunchpadModal() {
		// const panelBodyProps = {
		// 	name: 'post-publish-qr-post-panel',
		// 	title: __( 'QR Code', 'jetpack' ),
		// 	className: 'post-publish-qr-post-panel',
		// 	icon: <JetpackLogo showText={ false } height={ 16 } logoColor="#1E1E1E" />,
		// };

		// const isPostPublished = useSelect(
		// 	select => select( editorStore ).isCurrentPostPublished(),
		// 	[]
		// );

		// function QRPostPanelBodyContent() {
		// 	return (
		// 		<>
		// 			<PanelRow>
		// 				<p>
		// 					{ __(
		// 						'Take advantage of the QR code to open the post from different devices.',
		// 						'jetpack'
		// 					) }
		// 				</p>
		// 			</PanelRow>
		// 			<QRPostButton />
		// 		</>
		// 	);
		// }

		return <LaunchpadModal />;
	},
};
