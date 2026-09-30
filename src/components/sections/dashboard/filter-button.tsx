'use client'

import Image from "next/image";
import React from "react";

export interface FilterButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    title: string;
    icon: React.ReactNode;
    active?: boolean;
}


export default function FilterButton( { title, icon, active=false, ...props }: FilterButtonProps) {
    return (
        <button {...props} className="text-[#C8CCD2] hover:text-[#6C7788] aria-selected:text-[#293856]" aria-selected={active} >
            <div className="flex items-center gap-1">
                {icon}
                <span className=" font-semibold text-[1rem] text-xs md:text-sm">{title}</span>
            </div>
        </button>
    );
}
