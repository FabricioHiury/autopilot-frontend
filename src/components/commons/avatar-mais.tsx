import { cn } from "@/lib/class-name.utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export interface AvatarUserProps {
    qtd: number | undefined;
    entidade?: string | undefined;
    size?: number;
    className?:string;
}

export default function AvatarMais({qtd=1, entidade="registros", className, size=2.75 }: AvatarUserProps) {

    const sizeInRem = `${size}rem`;
    const classNameAplicado = cn("flex-shrink-0 rounded-full overflow-hidden border border-white", className); 

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={classNameAplicado} style={{width:sizeInRem, height:sizeInRem}}>
                        <Avatar style={{width:sizeInRem, height:sizeInRem}}>
                            <AvatarFallback className="flex items-center justify-center w-full h-full">{"+"+qtd}</AvatarFallback>
                        </Avatar>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{`+${qtd} ${entidade}`}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        
    )
}