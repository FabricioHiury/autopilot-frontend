export interface IconProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function IconArrowNext ({size = 20, color='currentColor', className}: IconProps) {
    const stroke = size * 0.116665;
    return (
        <svg width={size} height={size} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color} strokeWidth={stroke} className={className}>
            <path d="M7 3.5L13 10.5L7 17.5"  strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}