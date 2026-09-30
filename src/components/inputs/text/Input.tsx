'use client'

import { useEffect, memo, useCallback } from "react";

interface props extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder: string;
    label: string;
    icon?: string;
    flexLevel?:string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSanitizar?:(event:string) => string;
    value?:string;
    disabled?:boolean;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}
  
const Input : React.FC<props> = ({ placeholder="Insira seu placeholder",label="Insira sua label", disabled=false, onChange, onSanitizar, icon,flexLevel="flex-[1]",value="", onBlur}) => {
    
    const handleChangeEvent = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if(onSanitizar)
            event.target.value=onSanitizar(event.target.value);
        onChange(event)
    }, [onChange, onSanitizar]);


    return(
     <>
        <div className={(flexLevel) + " " +"flex flex-col gap-1 relative flex-shrink-0 w-full"}>
            <span className="text-[12px] text-[#485B80] font-semibold">{label}</span>
            <div className="relative w-full flex items-center">
                {icon ? <img className="w-[17px] left-[15px] absolute object-contain" src={icon} alt=""/>  : ""}
                <input className={
                "px-[16px] py-[8px] w-full text-[#485B80] disabled:opacity-50 disabled:cursor-not-allowed text-[14px] placeholder:text-[#95A3B2] rounded-md border focus:border-[#485B80] outline-none "+
                (icon ? "pl-[45px]" : "pl-[10px]")             
                } 
                type="text" onChange={handleChangeEvent} onBlur={onBlur} value={value} placeholder={placeholder}/>    
             
                            </div>
        </div>
     </>   
    );

}

export default memo(Input)