export interface IconLineUpProps {
    fill?: string;
    size?: number;
    className?: string;
}
export const IconLineUp = ({ fill = 'currentColor', size = 24, className = '' }: IconLineUpProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="61" height="20" viewBox="0 0 61 20" fill="none">
            <path d="M1.28125 18.25C1.28125 18.25 6.34198 9.10893 12.1562 12.2564C17.9705 15.4039 18.7241 18.25 23.8923 16.3615C29.0605 14.473 29.384 -1.48779 33.9062 1.65971C38.4285 4.8072 49.5908 11.1022 59.2812 1.65971" stroke="url(#paint0_linear_766_91660)" strokeWidth="2.37343" strokeLinecap="round" strokeLinejoin="round"></path>
            <defs>
                <linearGradient id="paint0_linear_766_91660" x1="37.9532" y1="-2.92513" x2="26.6312" y2="26.6158" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#50DE9A"></stop>
                    <stop offset="1" stopColor="#24AE6C"></stop>
                </linearGradient>
            </defs>
        </svg>
    )
}