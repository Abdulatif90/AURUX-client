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
	const isGuest = userName === 'Guest User';
	const greeting = isGuest ? `Hello there!` : `Hi ${userName}!`;
	
	// Property related responses
	if (message.includes('property') || message.includes('house') || message.includes('apartment')) {
		return `${greeting} I see you're interested in properties. Would you like me to help you find apartments, houses, or commercial properties? ${isGuest ? 'Consider logging in for personalized recommendations!' : ''}`;
	}
	
	if (message.includes('price') || message.includes('cost') || message.includes('rent')) {
		return `${greeting} I can help you with pricing information. What's your budget range and preferred location? ${isGuest ? 'Login to save your preferences!' : ''}`;
	}
	
	if (message.includes('location') || message.includes('area') || message.includes('district')) {
		return `Great question about location! Which area are you most interested in? I can provide details about different districts.`;
	}
	
	// Greeting responses
	if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
		return `${greeting} Welcome to Aurux. How can I assist you with finding your perfect property today? ${isGuest ? 'Feel free to browse as a guest or login for a personalized experience!' : ''}`;
	}
	
	if (message.includes('help') || message.includes('assist')) {
		return `I'm here to help! I can assist you with property searches, pricing, locations, and any questions about our services. ${isGuest ? 'Consider creating an account for saved searches and personalized recommendations!' : ''}`;
	}
	
	// Login related
	if (message.includes('login') || message.includes('register') || message.includes('sign up')) {
		return `${greeting} You can login or register using the button in the top navigation. Registered users get access to saved properties, personalized recommendations, and direct agent contact!`;
	}
	
	// Contact related
	if (message.includes('contact') || message.includes('phone') || message.includes('call')) {
		return `You can contact our agents directly through the property listings or reach our support team. ${isGuest ? 'Login to get direct access to agent contact information!' : 'Would you like me to connect you with a specific agent?'}`;
	}
	
	// Features related
	if (message.includes('feature') || message.includes('amenity') || message.includes('facility')) {
		return `Our properties come with various features. Are you looking for specific amenities like parking, gym, pool, or security?`;
	}
	
	// Default intelligent response
	const responses = [
		`That's interesting! Could you tell me more about what you're looking for? ${isGuest ? 'Login for personalized assistance!' : ''}`,
		`Thanks for your message! I'm here to help with any property-related questions. ${isGuest ? 'Consider registering for a better experience!' : ''}`,
		`I understand. Let me know if you need assistance with property searches or have any specific requirements.`,
		`Great point! Is there anything specific about properties or our services I can help clarify?`
	];
	
	return responses[Math.floor(Math.random() * responses.length)];
};

// Memoize NewMessage component to prevent unnecessary re-renders
const NewMessage = React.memo(({ message }: { message: ChatMessage }) => {
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
});

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<ChatMessage[]>([
		{
			id: '1',
			text: 'Welcome to Aurux Live Chat! 🏠 I\'m here to help you find your perfect property. You can chat as a guest or login for personalized assistance. How can I help you today?',
			author: 'Aurux Assistant',
			timestamp: new Date(),
			isOwn: false,
		}
	]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [chatBackendAvailable, setChatBackendAvailable] = useState<boolean | null>(null); // null = not checked, true = available, false = not available
	const textInput = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);

	// GraphQL mutations and subscriptions
	const [sendChatMessage] = useMutation(SEND_CHAT_MESSAGE, {
		errorPolicy: 'all', // Changed from 'ignore' to properly handle errors
		onError: (error) => {
			if (process.env.NODE_ENV === 'development') {
				console.log('Chat backend not available:', error.message);
			}
		}
	});
	
	// WebSocket subscription for real-time messages - DISABLED when backend not available
	// Since WebSocket link is disabled in Apollo client, subscription won't throw errors
	const subscriptionEnabled = false; // Set to true when backend is available
	const { data: subscriptionData, error: subscriptionError } = useSubscription(
		CHAT_MESSAGE_SUBSCRIPTION, 
		{
			skip: !subscriptionEnabled, // Skip subscription when disabled
			shouldResubscribe: false,
			errorPolicy: 'ignore',
			onError: (error) => {
				// Silently ignore - this is expected when backend is not available
			}
		}
	);

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

	// Handle subscription data with performance optimization
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
			
			// Prevent duplicate messages - optimized check
			setMessagesList(prev => {
				// Quick check: if last message has same id, skip
				if (prev.length > 0 && prev[prev.length - 1].id === chatMessage.id) {
					return prev;
				}
				// Otherwise check if exists anywhere
				const exists = prev.some(msg => msg.id === chatMessage.id);
				if (!exists) {
					return [...prev, chatMessage];
				}
				return prev;
			});
		}
	}, [subscriptionData, user?._id]);

	// Auto scroll to bottom when new message arrives - optimized with requestAnimationFrame
	useEffect(() => {
		if (chatContentRef.current) {
			// Use requestAnimationFrame for smoother scrolling
			requestAnimationFrame(() => {
				if (chatContentRef.current) {
					chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
				}
			});
		}
	}, [messagesList.length]);

	// Check chat backend availability on component mount
	useEffect(() => {
		const checkBackendAvailability = async () => {
			if (chatBackendAvailable !== null) return; // Already checked
			
			try {
				const response = await fetch(process.env.REACT_APP_API_GRAPHQL_URL || process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 'http://localhost:3005/graphql', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						query: `
							query CheckChatAvailability {
								__type(name: "Mutation") {
									fields {
										name
									}
								}
							}
						`
					}),
				});
				
				if (response.ok) {
					const data = await response.json();
					const mutations = data.data?.__type?.fields || [];
					const hasChatMutation = mutations.some((field: any) => field.name === 'sendChatMessage');
					setChatBackendAvailable(hasChatMutation);
					
					if (process.env.NODE_ENV === 'development') {
						console.log(`Chat backend ${hasChatMutation ? 'is' : 'is not'} available`);
					}
				} else {
					setChatBackendAvailable(false);
				}
			} catch (error) {
				setChatBackendAvailable(false);
				if (process.env.NODE_ENV === 'development') {
					console.log('Chat backend availability check failed:', error);
				}
			}
		};
		
		checkBackendAvailability();
	}, [chatBackendAvailable]); // Only trigger on message count change

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
		
		const userMessage = message.trim();
		const userName = user?.memberNick || 'Guest User';
		
		// Create user message
		const newUserMessage: ChatMessage = {
			id: Date.now().toString(),
			text: userMessage,
			author: userName,
			timestamp: new Date(),
			isOwn: true,
			avatar: user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : undefined,
		};

		// Add user message to list
		setMessagesList(prev => [...prev, newUserMessage]);
		
		// Clear input immediately for better UX
		setMessage('');
		if (textInput.current) {
			textInput.current.value = '';
		}

		// Show typing indicator
		setIsTyping(true);

		// If user is logged in and chat backend is available, try to send to backend
		if (user?._id && chatBackendAvailable === true) {
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
				
				// If successful, the message will come back through subscription
				setIsTyping(false);
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.log('Chat backend not available, using smart response system');
				}
				
				// Generate smart response after shorter delay for better UX
				const responseDelay = 500 + Math.random() * 1000; // Reduced from 1000-3000ms to 500-1500ms
				setTimeout(() => {
					setIsTyping(false);
					
					const smartResponse = generateSmartResponse(userMessage, userName);
					const botMessage: ChatMessage = {
						id: (Date.now() + 1).toString(),
						text: smartResponse,
						author: 'Aurux Assistant',
						timestamp: new Date(),
						isOwn: false,
					};
					setMessagesList(prev => [...prev, botMessage]);
				}, responseDelay);
			}
		} else {
			// For guest users or when backend is not available, use smart response system with optimized delay
			const responseDelay = 500 + Math.random() * 1000; // Reduced from 1000-3000ms to 500-1500ms
			setTimeout(() => {
				setIsTyping(false);
				
				const smartResponse = generateSmartResponse(userMessage, userName);
				const botMessage: ChatMessage = {
					id: (Date.now() + 1).toString(),
					text: smartResponse,
					author: 'Aurux Assistant',
					timestamp: new Date(),
					isOwn: false,
				};
				setMessagesList(prev => [...prev, botMessage]);
			}, responseDelay);
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
											Aurux Assistant is typing...
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
						placeholder={
							chatBackendAvailable === false 
								? (user?._id ? 'Type message (AI Assistant)' : 'Type message (AI Assistant, as guest)')
								: (user?._id ? 'Type message' : 'Type message (as guest)')
						}
						value={message}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button 
						className={'send-msg-btn'} 
						onClick={onClickHandler}
						disabled={!message.trim()}
						style={{ 
							opacity: !message.trim() ? 0.5 : 1,
							cursor: !message.trim() ? 'not-allowed' : 'pointer'
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