'use client'
import AvatarUser from "@/components/commons/avatar-user";
import { Skeleton } from "@/components/ui/skeleton";
import { navToNext, navToPrevious } from "@/lib/nav-on-array";
import { profileImageUrl } from "@/lib/profile.utils";
import { cn } from "@/lib/class-name.utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface ItemOverview {
  id: string;
  idColaborador: string;
  name: string;
  value: number;
  percent: number;
  label: string;
}

export interface ActiveItemOverview extends ItemOverview {
  onNextClick: () => void;
  onPreviousClick: () => void;
}

export interface SectionOverviewProps {
  items?: ItemOverview[];
}

export default function SectionOverview({ items }: SectionOverviewProps) {
  if (!items) {
    return (
      <div className="w-full">
        <h2 className="text-[#293856] font-semibold text-[1.5rem]">Overview</h2>
        <div className="mt-3 relative">
          <Skeleton className="h-52" />
        </div>
      </div>
    )}

    if (items.length === 0) {
      return (
        <div className="w-full">
          <div className="mt-8">
              <h2 className="text-[#293856] font-semibold text-[1.5rem]">Overview</h2>
          </div>

          <div className="mt-3 h-52 flex items-center justify-center">
            <p className="text-[#7F8999] text-sm">Sem destaques para exibir</p>
          </div>
        </div>
      )
    }

    if (items.length < 3) {
      return (
        <div className="w-full">

          <h2 className="text-[#293856] font-semibold text-[1.5rem]">Overview</h2>

          <div className="mt-3 h-52 flex items-center justify-center">
            {items.map((item) => (
              <SimpleOverviewItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      )
    }

    
    const [itemsProcessed, setItemsProcessed] = useState<ItemOverview[]>(items.map((item) => { return {...item} } ));

    const handleNext = () => {
      setItemsProcessed((prev) => { return [...navToNext(prev)] });
    }

    const handlePrevious = () => {
      setItemsProcessed((prev) => { return [...navToPrevious(prev)] });
    }


    return (
        <div className="w-full">
            <h2 className="text-[#293856] font-semibold text-[1.5rem]">Overview</h2>
            
            <div className="mt-3 relative">
                <div className="pt-[1.5rem] relative flex gap-2 items-start justify-between opacity-40">
                    <SimpleOverviewItem
                        {...itemsProcessed[itemsProcessed.length - 1]}
                    />
                    <SimpleOverviewItem {...itemsProcessed[1]} />
                </div>
                <div className="w-3/5 translate-x-1/3 absolute top-0">
                    <ActiveOverviewItem
                        onNextClick={handleNext}
                        onPreviousClick={handlePrevious}
                        {...itemsProcessed[0]}
                    />
                </div>
            </div>
        </div>
    );
}

function SimpleOverviewItem({
    id,
    label,
    name,
    percent,
    value,
}: ItemOverview) {
    const isPreVendedor = label.includes("Sucesso") || label === "Novos Atendimentos";
    const roleText = isPreVendedor ? "Pré-vendedor em Destaque" : "Vendedor em Destaque";
    
    return (
        <div className="rounded-[.75rem] px-3 py-4 w-1/2">
            <div className="flex gap-2 pb-3 border-b border-[#DDE6F2]">
                <div className="relative w-[2.5rem] h-[2.5rem]">
                    <AvatarUser
                        name={name}
                        src={profileImageUrl(id)}
                    />
                    <div className="text-orange-500 absolute -bottom-2 left-[.75rem] w-[1rem] h-[1rem]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93.89C51,87.53,40,116.08,40,144a88,88,0,0,0,176,0C216,84.55,165.21,36,143.38,17.85Z"></path>
                        </svg>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-[#1B263A] line-clamp-1">
                        {name}
                    </h3>
                    <span className="block text-[#7F8999] text-[.625rem] uppercase leading-3 line-clamp-1">
                        {roleText}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-1">
                    <span className="block font-semibold text-[#1B263A] text-[2.375rem]">
                        +{value}
                    </span>
                    <span className={cn(
                        "block bg-[#24AE6C] text-[#1B263A] text-xs px-2 py-0.5 rounded-full",
                        percent === 0 ? "bg-slate-400" : "",
                        percent < 0 ? "bg-[#FF4D4F]" : ""
                    )}>
                        {Math.floor(percent)}%
                    </span>
                </div>
                <span className="block text-[#7F8999] text-sm leading-3 line-clamp-1">
                    {label}
                </span>
            </div>
        </div>
    );
}

function ActiveOverviewItem({
    id,
    idColaborador,
    label,
    name,
    percent,
    value,
    onNextClick,
    onPreviousClick,
}: ActiveItemOverview) {
    const isPreVendedor = label.includes("Sucesso") || label === "Novos Atendimentos";
    const roleText = isPreVendedor ? "Pré-vendedor em Destaque" : "Vendedor em Destaque";
    
    return (
        <div className="bg-[#1B263A] rounded-[.75rem] px-3 py-4 relative shadow-md">
            <div className="flex gap-2 pb-3 border-b border-[#293856]">
                <div className="relative w-[2.5rem] h-[2.5rem]">
                    <AvatarUser
                        name={name}
                        src={profileImageUrl(id)}
                    />
                    <div className="text-orange-500 absolute -bottom-2 left-[.75rem] w-[1rem] h-[1rem]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93.89C51,87.53,40,116.08,40,144a88,88,0,0,0,176,0C216,84.55,165.21,36,143.38,17.85Z"></path>
                        </svg>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-white line-clamp-1">
                        {name}
                    </h3>
                    <span className="block text-[#85A3DC] text-[.625rem] uppercase leading-3 line-clamp-1">
                        {roleText}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between gap-1">
                    <span className="block font-semibold text-white text-[2.375rem]">
                        +{value}
                    </span>
                    <span className={cn(
                        "block bg-[#24AE6C] text-[#1B263A] text-xs px-2 py-0.5 rounded-full",
                        percent === 0 ? "bg-slate-400" : "",
                        percent < 0 ? "bg-[#FF4D4F]" : ""
                    )}>
                        {Math.floor(percent)}%
                    </span>
                </div>
                <span className="block text-[#C8CCD2] text-sm leading-3 line-clamp-1">
                    {label}
                </span>
            </div>

            <Link href={`/app/atendimentos/painel-de-atendimentos?colaboradores=${idColaborador}`} className="w-full bg-[#293856] rounded-[.5rem] flex items-center justify-center text-white text-sm h-[1.875rem] mt-4">
                Ver atendimentos
            </Link>

            <button className="absolute -right-[17px] top-0 translate-y-full" onClick={() => onNextClick()}>
                <Image
                    src="/images/seta-card.svg"
                    width={18}
                    height={60}
                    alt={"seta"}
                />
            </button>

            <button className="absolute -left-[17px] top-0 translate-y-full" onClick={() => onPreviousClick()}>
                <Image
                    src="/images/seta-card.svg"
                    width={18}
                    height={60}
                    alt={"seta"}
                    className="rotate-180"
                />
            </button>
        </div>
    );
}