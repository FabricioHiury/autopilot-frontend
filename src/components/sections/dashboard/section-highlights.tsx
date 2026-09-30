import HighlightItem from "./highlight-item";
import api from "@/utils/classes/api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Destaque } from "@/model/destaques";

export default function SectionHighlights() {
    const [highlight, setHighlight] = useState<Destaque>();


    async function load() {
        const [response, error] = await api.get(`/loja/dashboard/relatorio-semanal`);
        if (error) {
            return toast.error(error.message)
        }
        setHighlight(response.data)
    }

    useEffect(() => {
        load()
    }, [])

    if (!highlight)
        return (
            <div className="py-8 px-1 text-[14px] flex items-center justify-center opacity-50 w-full">
                <p>LoadingGlobal...</p>
            </div>
        )

    return (
        <div
            className="flex flex-col gap-3 p-2 md:flex-row md:gap-6 md:overflow-y-hidden md:overflow-x-auto md:max-h-[180px] md:max-w-full"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            <HighlightItem
                title="ATENDIMENTOS EM ABERTO"
                value={highlight.atendimentosEmAberto.quantidade}
                percentage={highlight.atendimentosEmAberto.percentual}
            />
            <HighlightItem title="VENDAS REALIZADAS (SUCESSO)"
                value={highlight.vendasRealizadas.quantidade}
                percentage={highlight.vendasRealizadas.percentual} />
            <HighlightItem
                title="CHATS SEM RESPOSTA"
                value={highlight.chatsSemResposta.quantidade}
                percentage={highlight.chatsSemResposta.percentual}
            />
            <HighlightItem
                title="TAREFAS PENDENTES"
                value={highlight.tarefasPendentes.quantidade}
                percentage={highlight.tarefasPendentes.percentual}
            />
        </div>
    );
}
