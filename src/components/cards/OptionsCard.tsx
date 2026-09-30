import { useEffect, useRef } from "react";

export default function OptionsCard({visible,setVisible,list}:{visible:boolean,setVisible:Function,list:{
    icon:string,
    label:string,
    action:Function
}[]}){

    
    const actionsRef = useRef<HTMLDivElement>(null)
 
    useEffect(()=>{
        if(visible===true && actionsRef.current){
            if(actionsRef.current){
                actionsRef.current?.focus();
            }
    
        }
    },[visible,actionsRef])

    function lostFocus(event:any){
        const elemento = event.relatedTarget;
        if(actionsRef.current && !actionsRef.current.contains(elemento)){
            setVisible(false)
        }
        else if(actionsRef.current){
            actionsRef.current.focus();
        }
    }


    return(
    <>
    {visible===true ?
        <div ref={actionsRef} tabIndex={-1} onBlur={lostFocus}
        className={"flex absolute w-[247px] flex-shrink-0 z-10 top-[50%] lg:right-[70%] *:duration-300 bg-white  rounded-lg border border-[#DDE6F2]"}>
            <div className="flex flex-col relative w-full">
                {list.map((obj,i)=>{
                    return(                    
                        <button key={i} className="flex items-center p-3 gap-3 text-[#6C7788] hover:bg-slate-200 duration-300  text-[16px] whitespace-nowrap" 
                        onClick={()=>obj.action()}>
                            <img src={obj.icon} alt="" />
                            {obj.label}
                        </button>
                    )
                })}
            </div>
        </div> 
        :
        <>
        </>
    }
    </>
    )
}

