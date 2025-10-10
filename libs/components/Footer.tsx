import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import Swal from 'sweetalert2';

const Footer = () => {
	const device = useDeviceDetect();

	const handleSubscribe = async () => {
		await Swal.fire({
			position: 'top-end',
			icon: 'success',
			title: 'Subscribed!',
			text: 'Thank you for subscribing to our newsletter',
			showConfirmButton: false,
			timer: 2500,
			timerProgressBar: true,
			toast: true,
			background: '#f8f9fa',
			color: '#28a745',
			iconColor: '#28a745',
			customClass: {
				popup: 'compact-alert',
				title: 'compact-title'
			}
		});
	};

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>total free customer care</span>
							<p>+82 10 7622 6662</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Sharipov Abdulatif</span>
							<p>+82 10 7622 6662</p>
							<span>Support?</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>follow us on social media</p>
							<div className={'media-box'}>
								<a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
									<FacebookOutlinedIcon className="social-icon" />
								</a>
								<a href="https://t.me/" target="_blank" rel="noopener noreferrer">
									<TelegramIcon className="social-icon" />
								</a>
								<a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
									<InstagramIcon className="social-icon" />
								</a>
								<a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
									<TwitterIcon className="social-icon" />
								</a>
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Search</strong>
								<span>Property for Rent</span>
								<span>Property Low to hide</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>Seoul</span>
								<span>Gyeongido</span>
								<span>Busan</span>
								<span>Jejudo</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Aurux - All rights reserved. Aurux {moment().year()}</span>
					<span>Author - Sharipov Abdulatif</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>total free customer care</span>
							<p>+82 10 7622 6662</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>nee live</span>
							<p>+82 10 7622 6662</p>
							<span>Support?</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>follow us on social media</p>
							<div className={'media-box'}>
								<a href="https://facebook.com/aurux" target="_blank" rel="noopener noreferrer">
									<FacebookOutlinedIcon className="social-icon" />
								</a>
								<a href="https://t.me/aurux" target="_blank" rel="noopener noreferrer">
									<TelegramIcon className="social-icon" />
								</a>
								<a href="https://instagram.com/aurux" target="_blank" rel="noopener noreferrer">
									<InstagramIcon className="social-icon" />
								</a>
								<a href="https://twitter.com/aurux" target="_blank" rel="noopener noreferrer">
									<TwitterIcon className="social-icon" />
								</a>
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>keep yourself up to date</strong>
							<div>
								<input type="text" placeholder={'Your Email'} />
								<span onClick={handleSubscribe}>Subscribe</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Search</strong>
								<span>Property for Rent</span>
								<span>Property Low to hide</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>Seoul</span>
								<span>Gyeongido</span>
								<span>Busan</span>
								<span>Jejudo</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Aurux - All rights reserved. Aurux {moment().year()}</span>
					<span>Author - Sharipov Abdulatif</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
