import * as React from 'react';
import { SVGProps } from 'react';

export default function RelatorioIcon({
  fill = 'currentColor',
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={fill} strokeWidth="1.5" fill="none" />
      <path d="M7 16V11M12 16V8M17 16V13" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
