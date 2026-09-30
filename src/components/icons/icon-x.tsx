export interface IconXProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function IconX ({size = 20, color='currentColor', className}: IconXProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill={color} xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M10.0002 9.99967L5.8335 5.83301L10.0002 9.99967ZM10.0002 9.99967L14.1668 14.1663L10.0002 9.99967ZM10.0002 9.99967L14.1668 5.83301L10.0002 9.99967ZM10.0002 9.99967L5.8335 14.1663L10.0002 9.99967Z" fill={color} />
            <path d="M10.0002 9.99967L5.8335 5.83301M10.0002 9.99967L14.1668 14.1663M10.0002 9.99967L14.1668 5.83301M10.0002 9.99967L5.8335 14.1663" stroke={color} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}