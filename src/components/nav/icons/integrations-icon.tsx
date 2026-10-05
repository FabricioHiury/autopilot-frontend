import { SVGProps } from 'react';

export default function IntegrationsIcon({
  fill = 'currentColor',
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.667 8.333H3.333l4.584-5M3.333 11.667h13.334l-4.584 5"
      />
    </svg>
  );
}
