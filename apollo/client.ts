import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// Separate Chat WebSocket client (not for GraphQL)
class ChatWebSocket {
	private socket: WebSocket | null = null;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectDelay: number = 1000;
	private url: string;

	constructor(url: string) {
		this.url = url;
		this.connect();
	}

	private connect() {
		try {
			this.socket = new WebSocket(`${this.url}?token=${getJwtToken()}`);
			socketVar(this.socket);

			this.socket.onopen = () => {
				console.log('Chat WebSocket connected!');
				this.reconnectAttempts = 0;
			};

			this.socket.onmessage = (msg) => {
				console.log('Chat WebSocket message:', msg.data);
				// Handle chat-specific messages here
			};

			this.socket.onerror = (error) => {
				console.log('Chat WebSocket error:', error);
			};

			this.socket.onclose = (event) => {
				console.log('Chat WebSocket closed:', event.code, event.reason);
				
				// Auto-reconnect if not intentional close
				if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
					this.reconnectAttempts++;
					setTimeout(() => {
						console.log(`Chat WebSocket reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
						this.connect();
					}, this.reconnectDelay * this.reconnectAttempts);
				}
			};
		} catch (error) {
			console.error('Failed to create chat WebSocket:', error);
		}
	}

	send(message: string) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message);
		} else {
			console.warn('Chat WebSocket not connected');
		}
	}

	close() {
		if (this.socket) {
			this.socket.close(1000, 'Manual close');
		}
	}
}

// Initialize chat WebSocket if needed
let chatWebSocket: ChatWebSocket | null = null;
if (typeof window !== 'undefined') {
	// Only initialize if chat is needed
	// chatWebSocket = new ChatWebSocket(process.env.NEXT_PUBLIC_CHAT_WS || 'ws://localhost:4000/chat');
}


function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:4001/graphql'
		});

		/* WEBSOCKET SUBSCRIPTION LINK - CONFIGURED FOR BACKEND */
		// WebSocket subscriptions for real-time updates
		const wsLink = new WebSocketLink({	
			uri: process.env.REACT_APP_API_WS_URL || process.env.REACT_APP_API_WS || 'ws://localhost:4001',
			options: {
				reconnect: true,
				timeout: 30000,
				connectionParams: () => {
					const token = getJwtToken();
					return { 
						Authorization: token ? `Bearer ${token}` : '',
						token: token || ''
					};
				},
				lazy: true,
				inactivityTimeout: 300000,
				connectionCallback: (error) => {
					if (error) {
						console.error('GraphQL WebSocket connection error:', error);
					} else {
						console.log('GraphQL WebSocket connected successfully');
					}
				},
				reconnectionAttempts: 5,
				minTimeout: 1000,
			},
			// Use standard WebSocket for GraphQL subscriptions
			webSocketImpl: WebSocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, response, operation, forward }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) =>
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
				);
			}
			if (networkError) {
				console.log(`[Network error]: ${networkError}`);
				// @ts-ignore
				if (networkError?.statusCode === 401) {
					// Handle 401 errors
					console.warn('Unauthorized access detected');
				}
				// @ts-ignore
				if (networkError?.name === 'AbortError') {
					// Handle aborted requests that might cause loading cancellation
					console.warn('Request was aborted');
				}
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			// Use WebSocket for subscriptions
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache({
			// Removed deprecated options for Apollo Client 3.14.0
			typePolicies: {
				// Add type policies here if needed
			},
		}),
		resolvers: {},
		// Add default options to prevent loading cancellation
		defaultOptions: {
			watchQuery: {
				errorPolicy: 'all',
				notifyOnNetworkStatusChange: true,
			},
			query: {
				errorPolicy: 'all',
			},
		},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

// Export ChatWebSocket for use in components
export { ChatWebSocket };

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/