import { useEffect, useRef, useState } from "react"




export default function FocusBlock({children,className,setVisibleBlock,containersWithinFocus}:
    {children:React.ReactNode,className:string,setVisibleBlock:Function,containersWithinFocus?:any[]}){
    
    const container = useRef<HTMLDivElement>(null);

    function lostFocus(event:any){
        if(!container.current) return        
        const elemento = event.relatedTarget;
        if(!container.current.contains(elemento)){
            setVisibleBlock(false)
        }
        else if(containersWithinFocus && containersWithinFocus.some((obj)=> obj===elemento)){
        }
        else{
            container.current.focus();
        }
    }



    return(
        <>
            <div className={className} ref={container} tabIndex={-1} onBlur={lostFocus}>
                {children}
            </div>
        </>
    )
}   