import Link from "next/link";
import ButtonPlusIcon from "./button-circle/icons/button-plus-icon";

export interface ButtonAddProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    title: string;
    href: string;
}

export default function LinkButtonAdd({ title, href, ...props }: ButtonAddProps) {
    return (
        <Link  href={href} {...props}>
            <div className="group flex items-center justify-end w-full h-12 md:w-fit bg-[#1B263A] rounded-[.5rem] hover:scale-[1.01]">
            <span className="flex justify-center text-white w-full md:min-w-[9.5rem] font-semibold text-xs px-4">{title}</span>
            <div className="flex-shrink-0 w-[3rem] h-full transition-colors ease-in-out duration-300 text-[#D33632] flex items-center justify-center border-l border-[#455471] rounded-r-[.5rem] group-hover:text-white group-hover:bg-[#D33632] ">
                <ButtonPlusIcon/>
            </div>
            </div>
        </Link>
    )
}