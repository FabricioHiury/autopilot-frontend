'use client'
import IconBalaoChat from "./icons/icon-balao-chat";
import SideModal from "@/components/commons/modais/side-modal";
import AvatarCanal from "@/components/commons/avatar-canal";
import { useState, useRef } from "react";
import { ConteudoNovoChat } from "../chat/conteudo-novo-chat";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/hooks/use-click-outside";


export interface OptionSelectChatType {
    id: string;
    canal: string;
}

export interface SelectChatProps {
    options: OptionSelectChatType[];
    idAtendimento: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

export function SelectChat (props: SelectChatProps) {

    const router = useRouter();
    const { options, idAtendimento, isOpen = false, onToggle } = props;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [novoChat, setNovoChat] = useState<boolean>(false);


    const onNovoChatCriado = (idChat: string) => {
        setNovoChat(false);
        router.push(`/app/atendimentos/chat?id=${idChat}`);
    }

    useClickOutside(dropdownRef, () => {
        if (isOpen && onToggle) {
            onToggle();
        }
    }, isOpen);

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button 
                    className="bg-[#293856] rounded-[0.5rem] w-12 h-10 flex items-center justify-center"
                    onClick={() => onToggle && onToggle()}
                >
                    <IconBalaoChat />
                </button>
                {isOpen && <div className="absolute md:right-0 bg-white rounded-lg shadow-lg p-2 w-[12rem] text-sm font-semibold z-50">
                    {options.map(option => (
                        <button 
                            key={option.id} 
                            onClick={() => router.push(`/app/atendimentos/chat?id=${option.id}`)} 
                            className="flex items-center justify-start gap-0.5 text-left "
                        >
                            <AvatarCanal canal={option.canal as "whatsapp" | "instagram" | "facebook" | "olx"} className="border" />
                            <span className="block w-full capitalize">{option.canal}</span>
                        </button>
                    ))}
                    { !options.some(option => option.canal === 'whatsapp') && (
                        <button 
                            onClick={() => setNovoChat(true)}
                            className="flex items-center justify-start gap-0.5 text-left"
                        >
                            <AvatarCanal canal="whatsapp" className="border" />
                            <span className="block w-full">Whatsapp</span>
                        </button>
                    )}
                </div>}
            </div>

            {novoChat && (
                <SideModal onClose={() => setNovoChat(false)} idSelector="content-container">
                    <ConteudoNovoChat 
                      onCancel={() => setNovoChat(false)}
                      onSucess={onNovoChatCriado}  
                      atendimentoId={idAtendimento || undefined}
                    />
                  </SideModal>
            )}
        </>
    )

}