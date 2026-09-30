export interface IconRepeatProps {
    fill?: string;
    size?: number;
    className?: string;
}

export default function IconRepeat({ size = 16, fill = "currentColor", className }: IconRepeatProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M3.8584 4.7998H15.3918C16.7751 4.7998 17.8918 5.91647 17.8918 7.2998V10.0665" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.49173 2.1665L3.8584 4.79981L6.49173 7.43318" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.8918 16.1998H6.3584C4.97507 16.1998 3.8584 15.0831 3.8584 13.6998V10.9331" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.2588 18.8331L17.8921 16.1998L15.2588 13.5664" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}