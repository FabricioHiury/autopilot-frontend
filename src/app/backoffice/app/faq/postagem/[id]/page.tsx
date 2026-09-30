"use client"
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import { BellFillAnimation } from "@/components/nav/icons/bell-icon";
import { ConfigIconAnimation } from "@/components/nav/icons/config-icon";
import { Title } from "@/components/sections/Text";
import IconCompartilhar from "@/components/sections/atendimentos/icons/icon-compartilhar";
import GoBackPage from "@/components/sections/go-back-page";
import { apiAdmin } from "@/utils/classes/api";
import handleDate from "@/utils/classes/format/time";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Tiptap from "@/components/tiptap/TipTapEditor";

type FAQItem = {
    id: string;
    titulo: string;
    categoria: string;
    status: "publicado" | "rascunho" | "arquivado";
    resumo: string;
    views: number;
    criadoEm: string;
    conteudo: string;
    atualizadoEm: string;
    tags: string[];
};

export default function Page() {

    const [faq, setFaq] = useState<FAQItem>()
    const [loading, setLoading] = useState<boolean>(true)

    async function load() {
        const slug = window.location.pathname.split("/")
        console.log(slug[5])
        const [r, e] = await apiAdmin.get(`/faq/${slug[5]}`)
        if (e) {
            toast.error("FAQ não encontrado")
            return window.history.back()
        }
        console.log(r)

        setLoading(false)
        setFaq(r.data)
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <>
            <div className=" flex flex-col items-start h-full  justify-start">

                <div className="flex flex-col gap-3 w-full p-9 bg-white">
                    <GoBackPage />
                    <div className="flex justify-between items-center">
                        <Title label="Ajuda & FAQs" />
                        <div className="flex items-center gap-3">
                            <ConfigIconAnimation />
                            <BellFillAnimation />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col p-12 px-28 w-full">
                    <Conteudo />
                </div>
            </div>
        </>
    )


    function Dot() {
        return (
            <div className="w-1 mx-2 aspect-square bg-[#C5C2D1] rounded-full"></div>
        )
    }
    function tempo(value: string): string {
        const length = value.length;
        const readingSpeedPerMinute = 1500;
        const readingSpeedPerHour = 1600 * 60;
        if (length > readingSpeedPerHour) {
            const hours = Math.floor(length / readingSpeedPerHour);
            return `${hours} hora${hours > 1 ? 's' : ''} de leitura`;
        }

        const minutes = Math.floor(length / readingSpeedPerMinute);
        return `${minutes === 0 ? 1 : minutes} minuto${minutes > 1 ? 's' : ''} de leitura`;
    }


    function Conteudo() {

        const [text, setText] = useState("")

        function compartilhar() {
            navigator.clipboard.writeText(window.location.toString())
            toast.success("Link copiado")
        }

        if (loading || !faq)
            return (
                <>
                    <LoadingGlobal />
                </>
            )

        return (<>

            <div className="flex gap-3 font-semibold text-[#434D56] items-center">
                <Link href="/backoffice/app/faq" className="text-[#434D56] hover:underline">Dúvidas Frequentes</Link>
                {">"}
                <span>{faq.titulo}</span>
            </div>
            <div className="flex gap-2 items-center mt-2 text-[14px]">
                <div className="p-1 px-2 bg-[#E3EBF3] text-[#24292E] text-[14px] font-semibold rounded-xl shadow-sm">
                    {faq.categoria}
                </div>
                <Dot />
                <span className="text-[#434D56]">{tempo(text)}</span>
                <Dot />
                <span className="text-[#434D56] mr-2">{handleDate.formatRelativeDate(new Date(faq.atualizadoEm))}</span>
                <button onClick={compartilhar}>
                    <IconCompartilhar fill="rgba(153,28,28)" />
                </button>

            </div>
            <div className="flex flex-col gap-0 mt-8">
                <h1 className="text-[36px] text-[#24292E] font-semibold leading-6">{faq.titulo}</h1>
                <div className="w-full h-[1px] bg-slate-300 my-7"></div>

                <Tiptap content={faq.conteudo} viewOnly={true} />
            </div>
        </>)



    }

}

