import { SVGProps } from "react"

export default function ConfigIcon ({fill = 'currentColor', ...props}: SVGProps<SVGSVGElement>) { return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke={fill}
      strokeWidth={1.5}
      d="M6.536 3.169C8.226 2.167 9.072 1.667 10 1.667c.928 0 1.774.5 3.464 1.502l.572.338c1.69 1.001 2.536 1.502 3 2.326.464.825.464 1.826.464 3.828v.678c0 2.002 0 3.003-.464 3.828-.464.824-1.31 1.325-3 2.326l-.572.339c-1.69 1-2.536 1.501-3.464 1.501-.928 0-1.774-.5-3.464-1.501l-.572-.339c-1.69-1.001-2.536-1.502-3-2.326-.464-.825-.464-1.826-.464-3.828V9.66c0-2.002 0-3.003.464-3.828.464-.824 1.31-1.325 3-2.326l.572-.338Z"
    />
    <circle cx={10} cy={10} r={2.5} stroke={fill} strokeWidth={1.5} />
  </svg>
)}


export function ConfigIconAnimation(){
  return(
    <button className="p-[10px] border border-[#C7D2DD] flex justify-center items-center rounded-full hover:bg-white ease-in-out duration-300 ">
      <ConfigIcon/>
    </button>
  )
}