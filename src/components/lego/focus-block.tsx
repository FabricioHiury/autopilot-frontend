"use client"
import { useRect } from "@dnd-kit/core/dist/hooks/utilities";
import { HTMLProps, HtmlHTMLAttributes, useEffect, useRef } from "react"

interface Props{
    children: React.ReactNode;
    className:string;
    onDisable: VoidFunction
    viewObject:boolean
    containersWithinFocus?: HTMLElement[]
}

export default function FocusBlock({children,className,onDisable,containersWithinFocus=[],viewObject}:Props){

    const container = useRef<HTMLDivElement>(null)

    function lostFocus(event:any){
        if(!container.current) return
        const elemento = event.relatedTarget;
        if(!container.current.contains(elemento)){
            onDisable()
            return
        }
        else if(containersWithinFocus.some((obj)=> obj===elemento)){

        }
        else{
            container.current.focus();
        }
    }


    useEffect(()=>{
        if(container.current && viewObject===true){
            container.current.focus();
        }
    },[viewObject])

    useEffect(()=>{
        if(container.current && containersWithinFocus.length>0){
            for(let i in containersWithinFocus){
                if(containersWithinFocus[i])
                    containersWithinFocus[i].addEventListener("blur",(event)=>lostFocus(event));
            }
        }
    },[])

    return(

        <div className={className} ref={container} onBlur={lostFocus} tabIndex={-1}>
            {children}
        </div>

    )
}

