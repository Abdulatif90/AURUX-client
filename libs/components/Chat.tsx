import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Badge from '@mui/material/Badge';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar, useMutation, useSubscription } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { SEND_CHAT_MESSAGE, CHAT_MESSAGE_SUBSCRIPTION } from '../../apollo/user/mutation';
import { REACT_APP_API_URL } from 	'../config';

// Message interface
interface ChatMessage {
	id: string;
	text: string;
	author: string;
	timestamp: Date;
	isOwn: boolean;
	avatar?: string;
}

// Smart response system
const generateSmartResponse = (userMessage: string, userName: string): string => {
	const message = userMessage.toLowerCase().trim();
	
	// Property related responses
	if (message.includes('property') || message.includes('house') || message.includes('apartment')) {
		return `Hi ${userName}! I see you're interested in properties. Would you like me to help you find apartments, houses, or commercial properties?`;
	}
	
	if (message.includes('price') || message.includes('cost') || message.includes('rent')) {
		return `${userName}, I can help you with pricing information. What's your budget range and preferred location?`;
	}
	
	if (message.includes('location') || message.includes('area') || message.includes('district')) {
		return `Great question about location, ${userName}! Which area are you most interested in? I can provide details about different districts.`;
	}
	
	// Greeting responses
	if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
		return `Hello ${userName}! Welcome to Nestar. How can I assist you with finding your perfect property today?`;
	}
	
	if (message.includes('help') || message.includes('assist')) {
		return `I'm here to help, ${userName}! I can assist you with property searches, pricing, locations, and any questions about our services.`;
	}
	
	// Contact related
	if (message.includes('contact') || message.includes('phone') || message.includes('call')) {
		return `${userName}, you can contact our agents directly through the property listings or reach our support team. Would you like me to connect you with a specific agent?`;
	}
	
	// Features related
	if (message.includes('feature') || message.includes('amenity') || message.includes('facility')) {
		return `${userName}, our properties come with various features. Are you looking for specific amenities like parking, gym, pool, or security?`;
	}
	
	// Default intelligent response
	const responses = [
		`That's interesting, ${userName}! Could you tell me more about what you're looking for?`,
		`Thanks for your message, ${userName}! I'm here to help with any property-related questions.`,
		`${userName}, I understand. Let me know if you need assistance with property searches or have any specific requirements.`,
		`Great point, ${userName}! Is there anything specific about properties or our services I can help clarify?`
	];
	
	return responses[Math.floor(Math.random() * responses.length)];
};

const NewMessage = ({ message }: { message: ChatMessage }) => {
	if (message.isOwn) {
		return (
			<Box
				component={'div'}
				flexDirection={'row'}
				style={{ display: 'flex' }}
				alignItems={'flex-end'}
				justifyContent={'flex-end'}
				sx={{ m: '10px 0px' }}
			>
				<div className={'msg-right'}>{message.text}</div>
			</Box>
		);
	} else {
		return (
			<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
				<Avatar alt={message.author} src={message.avatar || '/img/profile/defaultUser.svg'} />
				<div className={'msg-left'}>{message.text}</div>
			</Box>
		);
	}
};

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<ChatMessage[]>([
		{
			id: '1',
			text: 'Welcome to Nestar Live Chat! 🏠 I\'m here to help you find your perfect property. How can I assist you today?',
			author: 'Nestar Assistant',
			timestamp: new Date(),
			isOwn: false,
		}
	]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);

	// GraphQL mutations and subscriptions
	const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE);
	
	// WebSocket subscription for real-time messages
	const { data: subscriptionData } = useSubscription(CHAT_MESSAGE_SUBSCRIPTION);

	/** LIFECYCLES **/
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	// Handle subscription data
	useEffect(() => {
		if (subscriptionData?.chatMessageUpdated) {
			const newMessage = subscriptionData.chatMessageUpdated;
			const chatMessage: ChatMessage = {
				id: newMessage._id,
				text: newMessage.messageText,
				author: newMessage.memberData?.memberNick || 'User',
				timestamp: new Date(newMessage.createdAt),
				isOwn: newMessage.messageAuthor === user?._id,
				avatar: newMessage.memberData?.memberImage 
					? `${REACT_APP_API_URL}/${newMessage.memberData.memberImage}` 
					: undefined,
			};
			
			if (!messagesList.find(msg => msg.id === chatMessage.id)) {
				setMessagesList(prev => [...prev, chatMessage]);
			}
		}
	}, [subscriptionData, user?._id]);

	// Auto scroll to bottom when new message arrives
	useEffect(() => {
		if (chatContentRef.current) {
			chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
		}
	}, [messagesList]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessage(text);
		},
		[],
	);

	const getKeyHandler = (e: any) => {
		try {
			if (e.key === 'Enter') {
				e.preventDefault();
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = async () => {
		if (!message.trim()) return;
		if (!user?._id) {
			alert('Please login to send messages');
			return;
		}

		const userMessage = message.trim();
		
		// Create user message
		const newUserMessage: ChatMessage = {
			id: Date.now().toString(),
			text: userMessage,
			author: user.memberNick || 'User',
			timestamp: new Date(),
			isOwn: true,
			avatar: user.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : undefined,
		};

		// Add user message to list
		setMessagesList(prev => [...prev, newUserMessage]);
		
		// Clear input
		setMessage('');
		if (textInput.current) {
			textInput.current.value = '';
		}

		// Show typing indicator
		setIsTyping(true);

		try {
			// Try to send to backend (if available)
			await sendChatMessage({
				variables: {
					input: {
						messageText: userMessage,
						messageAuthor: user._id,
					}
				}
			});
		} catch (error) {
			console.log('Backend not available, using smart response system');
			
			// Generate smart response after delay
			setTimeout(() => {
				setIsTyping(false);
				
				const smartResponse = generateSmartResponse(userMessage, user.memberNick || 'User');
				const botMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					text: smartResponse,
					author: 'Nestar Assistant',
					timestamp: new Date(),
					isOwn: false,
				};
				setMessagesList(prev => [...prev, botMessage]);
			}, 1000 + Math.random() * 2000); // Random delay for realism
		}
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<Badge
						style={{
							margin: '-30px 0 0 20px',
							color: '#33c1c1',
							background: 'none',
						}}
						badgeContent={onlineUsers || messagesList.length}
					/>
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							{messagesList.map((msg) => (
								<NewMessage key={msg.id} message={msg} />
							))}
							{isTyping && (
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<Avatar alt={'Assistant'} src={'/img/profile/defaultUser.svg'} />
									<div className={'msg-left'}>
										<div style={{ opacity: 0.7, fontStyle: 'italic' }}>
											Nestar Assistant is typing...
										</div>
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={message}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
						disabled={!user?._id}
					/>
					<button 
						className={'send-msg-btn'} 
						onClick={onClickHandler}
						disabled={!message.trim() || !user?._id}
						style={{ 
							opacity: (!message.trim() || !user?._id) ? 0.5 : 1,
							cursor: (!message.trim() || !user?._id) ? 'not-allowed' : 'pointer'
						}}
					>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;