'use client'
import AvatarUser from "@/components/commons/avatar-user";
import { relativeTime } from "@/lib/relative-time";
import { useState } from "react";

export interface ComentarioType {
    id: string;
    idAtendimento: string;
    idUsuario: string;
    nome: string;
    avatar: string;
    criadoEm: Date;
    comentario: string;
}

export interface ComentariosProps {
    comentarios: ComentarioType[];
}

export function Comentarios ({comentarios}: ComentariosProps) {

    const [sliceLevel,setSliceLevel] = useState<number>(2)


    const parseLineBreaks = (text: string) => {
        const lines = text.split('\n')
        return lines.map((line, index) => (
            <span key={index}>
                {line}
                {index !== lines.length - 1 && <br />}
            </span>
        ))
    }
    const formatText = (text: string) => {
        const regex = /<br\s*\/?>/gi
        const formattedText = text.replace(regex, '\n')
        return parseLineBreaks(formattedText)
    }

    return (
        <div className="flex flex-col max-h-[300px] pr-3 scroll-padrao overflow-y-auto w-full gap-4">
         
            {
            comentarios.slice(0,sliceLevel).map( comentario =>
                <Comentario key={comentario.id} {...comentario} />
            )
            }
         
            {comentarios.slice(sliceLevel).length > 0 && <div className="border-t flex items-center justify-center mt-4">
                <button onClick={() => setSliceLevel(old=>old+=3)} className="w-1/5 min-w-fit px-4 text-[#485B80] text-sm -mt-3 bg-[#F2F4F7]">Ver ({comentarios.slice(sliceLevel).length}) comentários mais antigos</button>
            </div>}
            
        </div>
    )
}

export function Comentario ({nome, avatar, criadoEm: date, comentario: conteudo}: ComentarioType) {
    return (
        <div className="w-full flex gap-4 text-sm text-[#293856]">
            <AvatarUser name={nome} src={avatar} />
            <div className="w-full">
                
                <div className="flex gap-2 items-center pb-1.6 text-xs">
                    <div className="font-semibold">{nome}</div>
                    <div>
                        <svg width="4" height="5" viewBox="0 0 4 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="2" cy="2.5" r="2" fill="#485B80"/>
                        </svg>
                    </div>
                    <div>{relativeTime(date)}</div>
                </div>
                <div className="bg-white w-full rounded-[0.5rem] px-3 py-4 border border-[#DDE6F2] text-[#485B80] whitespace-pre-wrap">
                    {conteudo}
                </div>
            </div>
        </div>
    )
}

