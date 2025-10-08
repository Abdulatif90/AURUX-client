import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('accessToken') ?? '';
		
		// Token formatini tekshirish
		if (token) {
			const parts = token.split('.');
			if (parts.length !== 3) {
				console.error('⚠️ Invalid token format. Expected JWT with 3 parts, got:', parts.length);
				localStorage.removeItem('accessToken');
				return '';
			}
		}
		
		return token;
	}
	return '';
}

export function isTokenValid(): boolean {
	const token = getJwtToken();
	if (!token) return false;
	
	try {
		const decoded: any = decodeJWT(token);
		const currentTime = Date.now() / 1000;
		
		if (decoded.exp && decoded.exp < currentTime) {
			console.warn('⚠️ Token muddati tugagan');
			return false;
		}
		
		return true;
	} catch (err) {
		console.error('⚠️ Token decode xatosi:', err);
		return false;
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		// Don't call logOut on login failure - just throw error
		throw new Error('Login Err');
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		console.log('---------- login ----------');
		const { accessToken } = result?.data?.login;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		if (err.graphQLErrors && err.graphQLErrors[0]) {
			switch (err.graphQLErrors[0].message) {
				case 'Definer: login and password do not match':
					await sweetMixinErrorAlert('Invalid nickname or password. Please try again.');
					break;
				case 'Definer: user has been blocked!':
					await sweetMixinErrorAlert('Your account has been blocked. Please contact support.');
					break;
				case 'Definer: no member with that member nick!':
					await sweetMixinErrorAlert('User not found. Please check your nickname.');
					break;
				default:
					await sweetMixinErrorAlert('Login failed. Please try again later.');
			}
		} else {
			await sweetMixinErrorAlert('Network error. Please check your connection.');
		}
		throw new Error('token error');
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		await requestSignUpJwtToken({ nick, password, phone, type });
		// Do not automatically log in after signup
		// User must manually login
	} catch (err) {
		console.warn('signup err', err);
		throw new Error('Signup Err');
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<void> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		console.log('---------- signup successful ----------');
		// Do not return accessToken - user must login manually
	} catch (err: any) {
		console.log('request signup err', err.graphQLErrors);
		if (err.graphQLErrors && err.graphQLErrors[0]) {
			switch (err.graphQLErrors[0].message) {
				case 'Definer: This member nick is already exist!':
					await sweetMixinErrorAlert('This nickname is already taken!');
					break;
				case 'Definer: This member phone is already exist!':
					await sweetMixinErrorAlert('This phone number is already registered!');
					break;
				default:
					await sweetMixinErrorAlert(err.graphQLErrors[0].message);
			}
		}
		throw new Error('signup error');
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProperties: claims.memberProperties,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = async () => {
	const apolloClient = await initializeApollo();
	
	deleteStorage();
	deleteUserInfo();
	
	// Clear Apollo cache without reloading
	await apolloClient.clearStore();
	
	// Redirect to home page
	if (typeof window !== 'undefined') {
		window.location.href = '/';
	}
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
