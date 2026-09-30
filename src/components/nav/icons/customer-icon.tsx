import { SVGProps } from "react"

export default function CustomerIcon ({fill = 'currentColor', ...props}: SVGProps<SVGSVGElement>) { return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <g stroke={fill} strokeWidth={1.5} clipPath="url(#a)">
      <circle cx={10.5} cy={5} r={3.333} />
      <path
        strokeLinecap="round"
        d="M15.5 7.5c1.38 0 2.5-.933 2.5-2.083 0-1.151-1.12-2.084-2.5-2.084M5.5 7.5C4.12 7.5 3 6.567 3 5.417c0-1.151 1.12-2.084 2.5-2.084"
      />
      <ellipse cx={10.5} cy={14.167} rx={5} ry={3.333} />
      <path
        strokeLinecap="round"
        d="M17.166 15.833c1.462-.32 2.5-1.132 2.5-2.083 0-.95-1.038-1.763-2.5-2.083M3.833 15.833c-1.461-.32-2.5-1.132-2.5-2.083 0-.95 1.039-1.763 2.5-2.083"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill={fill} d="M.5 0h20v20H.5z" />
      </clipPath>
    </defs>
  </svg>
)}

