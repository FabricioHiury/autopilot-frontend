import * as React from 'react';
import { SVGProps } from 'react';

export default function IconAdd({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.00195 1.2002V10.8002"
        stroke="#95A3B2"
        strokeWidth={1.04}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.20117 6H10.8012"
        stroke="#95A3B2"
        strokeWidth={1.04}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
