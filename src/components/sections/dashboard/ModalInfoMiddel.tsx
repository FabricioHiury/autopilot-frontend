import { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import CenterModal from "@/components/commons/modais/center-modal";



export default function SucessMessageMiddle(){
    const [visible,setVisible] = useState<boolean>(false)
    const [info,setInfo] = useState<{label:string,subLabel:string,extra?:ReactNode}>()

    const messager = useSelector((state:RootState) => state);

    useEffect(()=>{
        if(messager.signal==="openModalSucessMiddle"){
            setInfo(messager.data)
            setVisible(true)
        }
    },[messager])

    return(
        <>
        { 
        (visible && info) 
        &&
        <CenterModal onClose={()=>setVisible(false)} idSelector="content-container">
            <div className="flex flex-col gap-1 p-6 px-20 items-center justify-center">
                <svg width="65" height="64" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.834 31.9997L32.5007 42.6663L53.834 21.333" stroke="#307342" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.167 31.9997L21.8337 42.6663M32.5003 31.9997L43.167 21.333" stroke="#307342" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-[32px] text-[#24292E] text-center font-semibold">{info.label}</h1>
                <span className="text-[#657380] text-[14px] text-center font-medium">{info.subLabel}</span>
                {info.extra}
                <button className="bg-[#1B2841] mt-4 hover:bg-slate-800 duration-150 text-white font-semibold text-[14px] w-full rounded-xl p-4" onClick={()=>setVisible(false)}>
                    Voltar para tela inicial
                </button>
            </div>
        </CenterModal> 
        }
        </>
    
    )   
}