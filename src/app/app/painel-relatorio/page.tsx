"use client"
import { useState, useMemo, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { ApiApp } from "@/lib/api-app";
import { Colaborador } from "@/model/colaborador";
import ReportHeader, { ReportTab } from "@/components/commons/ReportHeader"
import RelatorioGeralAtendimentoVendas from "./relatorio-geral-atendimento-vendas";
import RelatorioAtendimentosGeral from "./relatorio-atendimentos-geral";
import RelatorioAtendimentosPorCanal from "./relatorio-atendimentos-por-canal";
import RelatorioAtendimentosPorVendedor from "./relatorio-atendimentos-por-vendedor";

export default function PainelRelatorio() {
    const api = useMemo(() => new ApiApp(), []);
    const tabs: ReportTab[] = [
        { titulo: "Painel Geral", subtitulo: "Veja o progresso de conversões em vendas 👋", estaSelecioando: true },
        { titulo: "Painel de Pré-venda", subtitulo: "Veja o progresso geral 👋", estaSelecioando: false },
        { titulo: "Painel por Canal", subtitulo: "Veja o progresso por canal 👋", estaSelecioando: false },
        { titulo: "Painel do Vendedor", subtitulo: "Veja o progresso por vendedor 👋", estaSelecioando: false },
    ]
    const [selectedTab, setSelectedTab] = useState(tabs[0]);
    const [confirmedRange, setConfirmedRange] = useState<DateRange | undefined>();
    const [modo, setModo] = useState<"total" | "compra" | "venda" | "consignado">("total");
    const [vendedores, setVendedores] = useState<{ id: string; nome: string; avatar?: string | null }[]>([]);
    const [idColaborador, setIdColaborador] = useState<string | 'todos'>('todos');

    const handleTabChange = (tab: ReportTab) => {
        setSelectedTab(tab);
    }

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setConfirmedRange(range);
    }

    useEffect(() => {
        buscarListaDeVendedores();
    }, [confirmedRange, selectedTab.titulo])

    const conteudo = useMemo(() => {
        const hoje = new Date();
        const seiseMesesAtras = new Date();
        seiseMesesAtras.setMonth(hoje.getMonth() - 6);

        const dataInicio = confirmedRange?.from ? confirmedRange.from.toISOString().split('T')[0] : seiseMesesAtras.toISOString().split('T')[0];
        const dataFim = confirmedRange?.to ? confirmedRange.to.toISOString().split('T')[0] : hoje.toISOString().split('T')[0];
        switch (selectedTab.titulo) {
            case "Painel Geral":
                return <RelatorioGeralAtendimentoVendas dataInicio={dataInicio} dataFim={dataFim} modo={modo} idColaborador={idColaborador === 'todos' ? undefined : idColaborador} />
            case "Painel de Pré-venda":
                return <RelatorioAtendimentosGeral dataInicio={dataInicio} dataFim={dataFim} modo={modo} idColaborador={idColaborador === 'todos' ? undefined : idColaborador} setIdColaborador={setIdColaborador} />
            case "Painel por Canal":
                return <RelatorioAtendimentosPorCanal dataInicio={dataInicio} dataFim={dataFim} modo={modo} idColaborador={idColaborador === 'todos' ? undefined : idColaborador} />
            case "Painel do Vendedor":
                return <RelatorioAtendimentosPorVendedor dataInicio={dataInicio} dataFim={dataFim} modo={modo} idColaborador={idColaborador === 'todos' ? undefined : idColaborador} setIdColaborador={setIdColaborador} />
            default:
                return null
        }
    }, [confirmedRange, selectedTab.titulo, modo, idColaborador])

    const buscarListaDeVendedores = async () => {
        try {
            const response = await api.relatorio.buscarColaborador();
            if (response) {
                const data = response as unknown as Colaborador;
                const todos = data.colaboradores as unknown as Array<{ id: string; nome: string; cargos?: Array<{ cargo: string }> }>;
                const filtrados = selectedTab.titulo === "Painel de Pré-venda"
                    ? todos.filter((item) => item.cargos?.some((c) => c.cargo === "Pré-vendedor"))
                    : todos;
                const lista = filtrados.map((item) => ({ id: item.id, nome: item.nome }));
                setVendedores(lista);
                if (idColaborador !== 'todos' && !lista.some((v) => v.id === idColaborador)) {
                    setIdColaborador('todos');
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="flex flex-col w-full min-h-screen overflow-hidden">
            <ReportHeader
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
                dateRange={confirmedRange}
                onDateRangeChange={handleDateRangeChange}
                modeItems={["total", "compra", "venda", "consignado"]}
                modeValue={modo}
                onModeChange={(key) => setModo(key as any)}
                vendedores={vendedores}
                selectedVendedorId={idColaborador}
                onVendedorChange={(id) => setIdColaborador(id as any)}
            />

            <main className="flex-1 w-full overflow-x-hidden overflow-y-auto px-6 sm:px-9 py-6 bg-gray-50">
                {conteudo}
            </main>
        </div>
    )
}
