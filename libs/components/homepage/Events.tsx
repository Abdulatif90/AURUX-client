import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: '',
		city: '',
		description:
			'',
		imageSrc: '/img/events/5.jpg',
	},
	{
		eventTitle: '',
		city: '',
		description: '',
		imageSrc: '/img/events/2.jpg',
	},
	{
		eventTitle: '',
		city: '',
		description: '',
		imageSrc: '/img/events/3.jpg',
	},
	{
		eventTitle: '',
		city: '',
		description:
			'',
		imageSrc: '/img/events/4.jpg',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack
				className="event-card"
				style={{
					backgroundImage: `url(${event?.imageSrc})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<Box component={'div'} className={'info'}>
					<strong>{event?.city}</strong>
					<span>{event?.eventTitle}</span>
				</Box>
				<Box component={'div'} className={'more'}>
					<span>{event?.description}</span>
				</Box>
			</Stack>
		);
	}
};

const Events = () => {
	const device = useDeviceDetect();
	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack className={'events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span className={'white'}>Events</span>
							<p className={'white'}>Events waiting your attention!</p>
						</Box>
					</Stack>
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData) => {
							console.log('EVENT id', event?.eventTitle);
							return <EventCard event={event} key={event?.imageSrc} />;
						})}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Events;
