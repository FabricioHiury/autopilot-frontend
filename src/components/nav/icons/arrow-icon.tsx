import { SVGProps } from 'react';

export default function IconArrow({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      stroke="#95A3B2"
      fill="none"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.832031 1L4.83203 5L8.83203 1"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
