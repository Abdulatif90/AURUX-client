import { useEffect } from 'react';
import { getJwtToken, updateUserInfo } from '../auth';

const useAuthSync = () => {
    	useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);
};

export default useAuthSync;
