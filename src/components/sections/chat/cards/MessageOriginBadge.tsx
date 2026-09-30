'use client'

interface MessageOriginBadgeProps {
	origin: string;
	details?: string;
}

export function MessageOriginBadge({ origin, details }: MessageOriginBadgeProps) {
	const getOriginConfig = () => {
		switch (origin) {
			case 'story_reply':
				return {
					icon: (
						<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
							<circle cx="12" cy="12" r="6" fill="currentColor"/>
						</svg>
					),
					text: 'Story',
					bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
					textColor: 'text-white'
				};
			case 'reel_reply':
				return {
					icon: (
						<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
							<path d="M9 8v8l7-4z"/>
						</svg>
					),
					text: 'Reel',
					bgColor: 'bg-gradient-to-r from-pink-500 to-orange-500',
					textColor: 'text-white'
				};
			case 'post_reply':
				return {
					icon: (
						<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
							<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
							<circle cx="8" cy="9" r="1.5" fill="currentColor"/>
							<path d="M3 17l5-5 3 3 5-7 5 5" stroke="currentColor" strokeWidth="2" fill="none"/>
						</svg>
					),
					text: 'Post',
					bgColor: 'bg-blue-500',
					textColor: 'text-white'
				};
			case 'referral':
				return {
					icon: (
						<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
						</svg>
					),
					text: 'Anúncio',
					bgColor: 'bg-yellow-500',
					textColor: 'text-white'
				};
			default:
				return null;
		}
	};

	const config = getOriginConfig();

	if (!config) return null;

	return (
		<div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor} ${config.textColor} text-[10px] font-semibold shadow-sm`}>
			{config.icon}
			<span>{config.text}</span>
		</div>
	);
}

export default MessageOriginBadge;

