export interface ChevronLeftProps {
  fill?: string;
  size?: number;
  className?: string;
}

export default function ChevronLeft({
  fill = 'currentColor',
  size = 20,
  className,
}: ChevronLeftProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 11 12"
      fill="none"
    >
      <path
        d="M7.14961 9.8501L3.84961 6.0001L7.14961 2.1501"
        stroke={fill}
        strokeWidth="1.28333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
