export interface ChevronRightProps {
    fill?: string;
    size?: number;
    className?: string;
}
export default function ChevronRight({ fill = "currentColor", size = 20, className }: ChevronRightProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 21 21" fill="none">
            <path d="M7.70996 4.5L13.71 10.5L7.70996 16.5" stroke={fill} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}