import React, { useEffect, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import { Box, Stack, CircularProgress } from '@mui/material';
import { HTMLMdNode } from '@toast-ui/editor/types/markdown';
import { Context as MdContext } from '@toast-ui/editor/types/toastmark';

interface TViewerProps {
	markdown: string;
}

const TViewer = ({ markdown }: TViewerProps) => {
	const [isMounted, setIsMounted] = useState(false);

	/** LIFECYCLES **/
	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<Stack sx={{ background: 'white', mt: '30px', borderRadius: '10px' }}>
			<Box component={'div'} sx={{ m: '40px' }}>
				{isMounted && markdown ? (
					<Viewer
						initialValue={markdown}
						customHTMLRenderer={{
							htmlBlock: {
								iframe(node: HTMLMdNode) {
									return [
										{
											type: 'openTag',
											tagName: 'iframe',
											outerNewLine: true,
											attributes: node.attrs,
										},
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'iframe', outerNewLine: true },
									];
								},
								div(node: HTMLMdNode) {
									return [
										{ type: 'openTag', tagName: 'div', outerNewLine: true, attributes: node.attrs },
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'div', outerNewLine: true },
									];
								},
							},
							htmlInline: {
								big(node: HTMLMdNode, { entering }: MdContext) {
									return entering
										? { type: 'openTag', tagName: 'big', attributes: node.attrs }
										: { type: 'closeTag', tagName: 'big' };
								},
							},
						}}
					/>
				) : (
					<CircularProgress />
				)}
			</Box>
		</Stack>
	);
};

export default TViewer;
