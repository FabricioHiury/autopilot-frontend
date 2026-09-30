import { ReactNode } from "react"

interface props {
    icon: string,
    children: ReactNode,
    criadoEm: string
}

const CardHistorico: React.FC<props> = ({ icon, children, criadoEm }) => {
    return (
        <>
            <div className="flex gap-4 w-full relative">
                <div className="p-[12px] rounded-full aspect-square w-[48px] h-[48px] flex-shrink-0 bg-white flex justify-center items-center">
                    <img src={icon} className="w-[20px]" alt="" />
                </div>
                <div className="flex flex-col text-[#293856] text-[16px]">
                    <div>
                        {children}
                    </div>
                    <span className="text-[14px] text-[#485B80] ">{criadoEm}</span>
                </div>
            </div>
        </>
    )
}

export default CardHistorico