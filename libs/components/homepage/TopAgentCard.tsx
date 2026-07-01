import React from 'react';
import { Stack } from '@mui/material';
import Image from 'next/image';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}

const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const device = useDeviceDetect();
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card">
				<Image src={agentImage} alt={agent?.memberNick ?? ''} width={100} height={100} style={{ objectFit: 'cover' }} />
				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-agent-card">
				<Image src={agentImage} alt={agent?.memberNick ?? ''} width={100} height={100} style={{ objectFit: 'cover' }} />
				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
			</Stack>
		);
	}
};

export default React.memo(TopAgentCard);
