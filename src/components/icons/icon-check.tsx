import { SVGProps } from 'react';

export interface IconCheckProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function IconCheck({
  size = 20,
  color = 'currentColor',
  className,
}: IconCheckProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 256 256"
      className={className}
    >
      <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path>
    </svg>
  );
}

export function IconCheckRed({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={11}
      viewBox="0 0 20 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.5 5.5L9.875 9.875L18.625 1.125"
        stroke="hsl(var(--primary))"
        strokeWidth={1.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.125 5.5L5.5 9.875M9.875 5.5L14.25 1.125"
        stroke="hsl(var(--primary))"
        strokeWidth={1.08333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
