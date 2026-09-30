import { SVGProps } from "react"

export default function ButtonPlusIcon ({fill = 'currentColor', ...props}: SVGProps<SVGSVGElement>) { return (
  <svg
  xmlns="http://www.w3.org/2000/svg"
  width={14}
  height={15}
  fill="none"
  {...props}
>
  <path
    stroke={fill}
    strokeLinecap="round"
    strokeWidth={2}
    d="M13 7.311H7m0 0H1m6 0v-6m0 6v6"
  />
</svg>
)}

