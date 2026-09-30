export interface IconClockProps {
    fill?: string;
    size?: number;
    className?: string;
}

export default function IconClock({ size = 16, fill = "currentColor", className }: IconClockProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path d="M19.2082 9.99984C19.2082 14.5998 15.4748 18.3332 10.8748 18.3332C6.27484 18.3332 2.5415 14.5998 2.5415 9.99984C2.5415 5.39984 6.27484 1.6665 10.8748 1.6665C15.4748 1.6665 19.2082 5.39984 19.2082 9.99984Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.9669 12.65L11.3836 11.1083C10.9336 10.8416 10.5669 10.2 10.5669 9.67497V6.2583" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
