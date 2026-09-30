import { ReactNode } from "react"

interface props{
    titulo?:string
    children: ReactNode,
    flexLevel?:string
}

const CardGeneric: React.FC<props> = ({titulo,children,flexLevel="flex-[1]"}) => {
    return(
        <div className={"flex flex-col "+flexLevel+" gap-[2px] rounded-md bg-[#FEFEFE] p-4 px-5"}>
            <h1 className="text-[#485B80] text-[12px] font-semibold">{titulo}</h1>
            <div className="flex flex-row w-full items-center gap-2 ">
            {children}
            </div>
        </div>
    )
}
export default CardGeneric