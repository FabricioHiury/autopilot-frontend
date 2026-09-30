import { cn } from "@/lib/class-name.utils";

interface NoDataProps {
    label?: string;
    className?: string;
    sizeIcon?: number;
}

export default function NoData({ label, className, sizeIcon = 32 }: NoDataProps) {
    return (
        <div
            className={cn(
                "w-full min-h-[20rem] flex flex-col items-center justify-center text-[#657380] gap-4",
                className
            )}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={sizeIcon}
                height={sizeIcon}
                fill="currentColor"
                viewBox="0 0 256 256"
            >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
            </svg>
            <div className="text-sm font-normal leading-3 text-center">
                {label ?? "Nenhum dado disponível"}
            </div>
        </div>
    );
}
