import { SVGProps } from 'react';

interface IconDeleteProps {
  fill?: string;
  size?: number;
  className?: string;
}

export function IconDelete({ fill = 'currentColor', size = 20, className = '' }: IconDeleteProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className="group"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 5.83342H4.16667V16.6667C4.16667 17.1088 4.34226 17.5327 4.65482 17.8453C4.96738 18.1578 5.39131 18.3334 5.83333 18.3334H14.1667C14.6087 18.3334 15.0326 18.1578 15.3452 17.8453C15.6577 17.5327 15.8333 17.1088 15.8333 16.6667V5.83342H5ZM13.8483 3.33341L12.5 1.66675H7.5L6.15167 3.33341H2.5V5.00008H17.5V3.33341H13.8483Z"
        fill={fill}
        className={className}
      />
    </svg>
  );
}

export function IconDeleteModern({ ...props }: { props?: SVGProps<SVGSVGElement> }) {
  return (
    <svg
      width={23}
      height={26}
      viewBox="0 0 23 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.88086 3.65905C8.3896 2.2197 9.7623 1.18848 11.3759 1.18848C12.9894 1.18848 14.3621 2.2197 14.8708 3.65905"
        stroke="hsl(var(--primary))"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M21.875 6.12988H0.875"
        stroke="hsl(var(--primary))"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M19.8159 9.21777L19.2477 17.7402C19.0291 21.0197 18.9197 22.6595 17.8512 23.6592C16.7827 24.6589 15.1392 24.6589 11.8524 24.6589H10.8971C7.61021 24.6589 5.96678 24.6589 4.89825 23.6592C3.82971 22.6595 3.72039 21.0197 3.50175 17.7402L2.93359 9.21777"
        stroke="hsl(var(--primary))"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M8.28711 12.3057L8.90475 18.4821"
        stroke="hsl(var(--primary))"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <path
        d="M14.4633 12.3057L13.8457 18.4821"
        stroke="hsl(var(--primary))"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}
