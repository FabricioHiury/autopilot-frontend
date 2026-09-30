export interface IconArrowUpProps {
    fill?: string;
    size?: number;
    className?: string;
}
export default function IconArrowUp({ size = 16, fill = "currentColor", className }: IconArrowUpProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" className={className}>
            <path d="M1.63965 9.00046L4.63993 6.00019L6.64011 8.00037L10.6405 4" stroke={fill} strokeWidth="0.875081" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.14062 4H10.641V7.50033" stroke={fill} strokeWidth="0.875081" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}