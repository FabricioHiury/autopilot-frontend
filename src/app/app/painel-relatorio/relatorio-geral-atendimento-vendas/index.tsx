"use client"
import CardMetrica from "@/components/cards/CardMetrica";
import CardQualificacao from "@/components/cards/CardQualificacao";
import CardSegmentacaoLeads from "@/components/cards/CardSegmentacaoLeads";
import IconAtendimento from "@/components/icons/icon-atendimento";
import IconClock from "@/components/icons/icon-clock";
import IconRepeat from "@/components/icons/icon-repeat";
import IconUserCheck from "@/components/icons/icon-user-check";
import Reports from "@/components/reports/Reports";
import DesempenhoVendasChart from "@/components/reports/DesempenhoVendasChart";
import CardTempoMedioResposta from "./components/CardTempoMedioResposta";
import CardSegmentacaoLeadsStatus from "./components/CardSegmentacaoLeadsStatus";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import toast from "react-hot-toast";
import IconQuente from "@/components/icons/icon-quente";
import IconFrio from "@/components/icons/icon-frio";
import IconMorno from "@/components/icons/icon-morno";

import { CardAtendimentosPreVenda } from "./components/CardAtendimentosPreVenda";
import { IconLineDown } from "@/components/icons/icon-line-down";
import { IconLineUp } from "@/components/icons/icon-line-up";
import { useEffect, useMemo, useState } from "react";
import { ApiApp } from "@/lib/api-app";
import { RelatorioGeral } from "@/model/relatorio-geral";
import { RelatorioCanais } from "@/model/relatorio-atendimento-canal";
import { RelatorioVendedorEspecificoResponse, VendasDiariasVendedor } from "@/model/relatorio-vendedor-especifico";

type AtendimentoSemFollowUp = {
  id: string;
  nomeAtendimento: string;
  periodo: string;
  status: string;
  colaborador: string;
  diasSemFollowUp: number;
}

interface RelatorioGeralAtendimentoVendasProps {
  dataInicio: string;
  dataFim: string;
  modo?: "total" | "compra" | "venda" | "consignado";
  idColaborador?: string;
}

export default function RelatorioGeralAtendimentoVendas({ dataInicio, dataFim, modo = "total", idColaborador }: RelatorioGeralAtendimentoVendasProps) {
  const api = useMemo(() => new ApiApp(), []);

  const [relatorioGeral, setRelatorioGeral] = useState<RelatorioGeral | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [conversaoVendaCanal, setConversaoVendaCanal] = useState<{ canal: string; leads: number; conversoes: number; taxaConv: number }[]>([]);
  const [mediaQualificacao, setMediaQualificacao] = useState<{ label: string, porcentagem: number, valor: number, cor?: string, subvalorLabel?: string, subvalor?: number, conversao?: number, total?: number }[]>([]);

  const [atendimentosPreAtendimentoSemFollowUp, setAtendimentosPreAtendimentoSemFollowUp] = useState<AtendimentoSemFollowUp[]>([]);
  const [atendimentosVendasSemFollowUp, setAtendimentosVendasSemFollowUp] = useState<AtendimentoSemFollowUp[]>([]);
  const [segmentacaoStatus, setSegmentacaoStatus] = useState<{ status: string, quantidade: number, cor: string }[]>([]);
  const [desempenhoVendas, setDesempenhoVendas] = useState<VendasDiariasVendedor | null>(null);
  const [desempenhoVendedorMesAnterior, setDesempenhoVendedorMesAnterior] = useState<{ data: string; vendas: number }[] | null>(null);


  const dadosFiltrados = useMemo(() => {
    if (!relatorioGeral?.relatorioPorModo) return null;
    return relatorioGeral.relatorioPorModo.find(item => item.modo === modo) || null;
  }, [relatorioGeral, modo]);

  const conteudoTemperatura = useMemo(() => {
    if (!dadosFiltrados) return [] as any[];

    return [{
      titulo: "Segmentacao de leads por temperatura",
      totalLeads: dadosFiltrados.totalAtendimentos,
      unidade: "leads",
      segmentacao: [
        { tipo: 'Quente', icone: <IconQuente />, porcentagem: dadosFiltrados.segmentacaoTemperatura?.quente?.porcentagem || 0, cor: 'bg-red-500' },
        { tipo: 'Morno', icone: <IconMorno />, porcentagem: dadosFiltrados.segmentacaoTemperatura?.morno?.porcentagem || 0, cor: 'bg-yellow-500' },
        { tipo: 'Frio', icone: <IconFrio />, porcentagem: dadosFiltrados.segmentacaoTemperatura?.frio?.porcentagem || 0, cor: 'bg-blue-500' },
      ]
    }];
  }, [dadosFiltrados]);

  const conteudoAposAtendimento = useMemo(() => {
    if (!dadosFiltrados) return [] as any[];

    return [{
      titulo: "Segmentação de Leads após atendimento",
      totalLeads: dadosFiltrados?.segmentacaoTemperaturaQualificacao?.total || 0,
      unidade: "leads",
      segmentacao: [
        { tipo: 'Quente', icone: <IconQuente />, porcentagem: dadosFiltrados.segmentacaoTemperaturaQualificacao?.quente?.porcentagemFinal || 0, cor: 'bg-red-500' },
        { tipo: 'Morno', icone: <IconMorno />, porcentagem: dadosFiltrados.segmentacaoTemperaturaQualificacao?.morno?.porcentagemFinal || 0, cor: 'bg-yellow-500' },
        { tipo: 'Frio', icone: <IconFrio />, porcentagem: dadosFiltrados.segmentacaoTemperaturaQualificacao?.frio?.porcentagemFinal || 0, cor: 'bg-blue-500' },
      ]
    }];
  }, [dadosFiltrados]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await listaRelatorioGeral();
      await listarConversaoVendaCanal();
      await buscarDesempenhoVendas();
      await buscarDesempenhoVendedorMesAnterior();
    })().finally(() => {
      setLoading(false);
    });
  }, [dataInicio, dataFim, idColaborador, modo]);

  useEffect(() => {
    if (!relatorioGeral || !dadosFiltrados) return;
    listarAtendimentosPreVenda();
    preencherMediaQualificacao();
    preencherSegmentacaoStatus();
  }, [relatorioGeral, dadosFiltrados]);

  const listaRelatorioGeral = async () => {
    try {
      const response = await api.relatorio.listarGeral(dataInicio, dataFim, idColaborador);
      if (response) {
        setRelatorioGeral(response as unknown as RelatorioGeral);
      } else {
        toast.error("Não foi possível listar o relatório geral");
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
      toast.error("Erro ao carregar o relatório geral");
    }
  }

  const listarConversaoVendaCanal = async () => {
    try {
      const response = await api.relatorio.listarAtendimentoCanal(dataInicio, dataFim, idColaborador);
      if (response) {
        const raw: any = response as any;
        const porModoArray: any[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.canais) ? [raw] : []);
        const selecionado = porModoArray.find((x: any) => x?.modo === modo) ?? porModoArray.find((x: any) => x?.modo === 'total') ?? null;
        const canaisArray: any[] = Array.isArray(selecionado?.canais) ? selecionado.canais : (Array.isArray(raw?.canais) ? raw.canais : []);
        const canaisOrdenados = canaisArray
          .map((item: any) => ({
            canal: item?.nomeExibicao,
            leads: Number(item?.leadsTotal ?? 0),
            conversoes: Number(item?.conversoes ?? 0),
            taxaConv: Number(item?.taxaConversao ?? 0),
          }))
          .sort((a, b) => b.conversoes - a.conversoes);

        setConversaoVendaCanal(canaisOrdenados)
      } else {
        toast.error("Não foi possível listar o relatório por canal");
      }
    } catch (error) {
      console.error("Erro ao carregar relatório por canal:", error);
      toast.error("Erro ao carregar o relatório por canal");
      setConversaoVendaCanal([]);
    }
  }

  const listarAtendimentosPreVenda = () => {
    if (!dadosFiltrados) return;
    setAtendimentosPreAtendimentoSemFollowUp(dadosFiltrados.atendimentosPreAtendimentoSemFollowUp || []);
    setAtendimentosVendasSemFollowUp(dadosFiltrados.atendimentosVendasSemFollowUp || []);
  }

  const buscarDesempenhoVendas = async () => {
    const response = await api.relatorio.listarPorVendedor(dataInicio, dataFim, idColaborador);
    if (response && Array.isArray(response)) {
      const data = response
        .flatMap((item: any) => item.vendasDiariasPorVendedor || [])
        .filter((v, i, arr) => arr.findIndex(t => t.id === v.id) === i);
      setDesempenhoVendas(data);
    } else {
      toast.error("Não foi possível listar o desempenho de vendas");
    }
  }

  const buscarDesempenhoVendedorMesAnterior = async () => {
    try {
      if (!idColaborador) {
        setDesempenhoVendedorMesAnterior(null);
        return;
      }
      // Calcula período do mês anterior baseado em dataInicio/fim atuais
      const parseDate = (str: string) => {
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
      };
      const ini = parseDate(dataInicio);
      const prevIni = new Date(ini);
      prevIni.setMonth(ini.getMonth() - 1);
      prevIni.setDate(1);
      const prevFim = new Date(prevIni.getFullYear(), prevIni.getMonth() + 1, 0);

      const prevInicioStr = prevIni.toISOString().slice(0, 10);
      const prevFimStr = prevFim.toISOString().slice(0, 10);

      const response = await api.relatorio.listarPorVendedor(prevInicioStr, prevFimStr, idColaborador);
      if (response && Array.isArray(response)) {
        const flat = response.flatMap((item: any) => item.vendasDiariasPorVendedor || []);
        const vocePrev = flat.find((v: any) => v.id === idColaborador);
        setDesempenhoVendedorMesAnterior(vocePrev?.serieVendas || null);
      } else {
        setDesempenhoVendedorMesAnterior(null);
      }
    } catch (error) {
      console.error(error);
      setDesempenhoVendedorMesAnterior(null);
    }
  }
  const preencherMediaQualificacao = () => {
    if (!dadosFiltrados) return;

    setMediaQualificacao([
      { label: "Qualificação", porcentagem: parseFloat(dadosFiltrados?.mediaQualificacao?.toFixed(2)) || 0, conversao: parseFloat(dadosFiltrados.quantidadeQualificacao?.toFixed(2)) || 0, total: parseFloat(dadosFiltrados.totalAtendimentos?.toFixed(2)) || 0, valor: parseFloat(dadosFiltrados.totalAtendimentos?.toFixed(2)) || 0, cor: "#D33632" },
      { label: "Conversões", porcentagem: parseFloat(dadosFiltrados?.mediaConversao?.toFixed(2)) || 0, conversao: parseFloat(dadosFiltrados.quantidadeConversao?.toFixed(2)) || 0, total: parseFloat(dadosFiltrados.totalAtendimentos?.toFixed(2)) || 0, valor: parseFloat(dadosFiltrados.totalAtendimentos?.toFixed(2)) || 0 },
      { label: "Conversão de Leads", porcentagem: parseFloat(dadosFiltrados?.taxaConversaoLeads?.toFixed(2)) || 0, valor: parseFloat(dadosFiltrados.quantidadeConversaoLeads?.toFixed(2)) || 0, cor: "#22C55E", subvalorLabel: "Quantidade total de Leads qualificados", subvalor: parseFloat(dadosFiltrados.quantidadeQualificacao?.toFixed(2)) || 0 },
      { label: "Showroom", porcentagem: parseFloat(dadosFiltrados?.taxaShowroom?.toFixed(2)) || 0, valor: parseFloat(dadosFiltrados.quantidadeShowroom?.toFixed(2)) || 0, cor: "#FF8C00", subvalorLabel: "Quantidade de showroom convertido", subvalor: parseFloat(dadosFiltrados.quantidadeShowroomSucesso?.toFixed(2)) || 0 },
    ])
  }

  const preencherSegmentacaoStatus = () => {
    if (!dadosFiltrados) return;

    setSegmentacaoStatus([
      { status: 'Atend. inicial', quantidade: dadosFiltrados.segmentacaoStatus.inicial, cor: '#D33632' },
      { status: 'Em visita', quantidade: dadosFiltrados.segmentacaoStatus.emVisita, cor: '#589D6A' },
      { status: 'Em resgate', quantidade: dadosFiltrados.segmentacaoStatus.resgate, cor: '#586E9D' },
      { status: 'Em negociação', quantidade: dadosFiltrados.segmentacaoStatus.negociacao, cor: '#3B82F6' },
    ])
  }

  const obterPeriodo = () => {
    const parseLocalDate = (str: any) => {
      const [ano, mes, dia] = str.split('-').map(Number);
      return new Date(ano, mes - 1, dia);
    };

    const ini = parseLocalDate(dataInicio);
    const fim = parseLocalDate(dataFim);

    const mesAnoIni = ini.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      month: 'short',
      year: 'numeric',
    });

    const mesAnoFim = fim.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      month: 'short',
      year: 'numeric',
    });

    return mesAnoIni === mesAnoFim ? mesAnoIni : `${mesAnoIni} - ${mesAnoFim}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full p-2 sm:p-0">

      {loading ? (
        <LoadingGlobal />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <CardMetrica
              icone={<IconAtendimento size={16} fill="white" />}
              titulo="Total de Atendimentos"
              valor={dadosFiltrados?.totalAtendimentos}
              iconesTendencia={<IconLineUp />}
            />
            <CardMetrica
              icone={<IconClock size={16} fill="white" />}
              titulo="Em Atendimento"
              valor={dadosFiltrados?.segmentacaoStatus?.inicial}
              iconesTendencia={<IconLineUp />}
            />
            <CardMetrica
              icone={<IconUserCheck size={16} fill="white" />}
              titulo="Sucessos"
              valor={dadosFiltrados?.quantidadeSucesso}
              iconesTendencia={<IconLineUp />}
              percentual={dadosFiltrados?.taxaSucesso?.toFixed(2)}
            />
            <CardMetrica
              icone={<IconRepeat size={16} fill="white" />}
              titulo="Resgates"
              valor={dadosFiltrados?.segmentacaoStatus?.resgate}
              iconesTendencia={<IconLineDown />}
              percentual={dadosFiltrados?.taxaResgate?.toFixed(2)}
            />
          </div>

          <div className="xl:col-span-12 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <DesempenhoVendasChart
                data={desempenhoVendas}
                yourSellerId={idColaborador}
                previousSeries={desempenhoVendedorMesAnterior}
                initialMonth={(() => { const d = new Date(dataFim); return d.getMonth() + 1; })()}
                initialYear={(() => { const d = new Date(dataFim); return d.getFullYear(); })()}
                height={360}
              />
            </div>
          </div>
          <div className="xl:col-span-12 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">
                Leads vs Conversões em Vendas por canal
              </h3>
              <div className="overflow-x-auto">
                <div className="min-w-[800px] xl:min-w-full">
                  <Reports
                    type="composed"
                    data={conversaoVendaCanal}
                    xKey="canal"
                    height={360}
                    series={[
                      { type: "bar", dataKey: "leads", name: "Leads" },
                      { type: "bar", dataKey: "conversoes", name: "Conversão" },
                      { type: "line", dataKey: "taxaConv", name: "Taxa de Conversão (%)" },
                    ]}
                    showLegend
                    showTooltip
                    showGrid
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            <div className="xl:col-span-5 space-y-4 sm:space-y-6 flex flex-col justify-between">
              <CardQualificacao
                tipo="carrossel-multiplo"
                titulo="Média de Qualificação e Conversão"
                subtitulo=""
                itens={mediaQualificacao}
              />

              <div className="col-span-12 gap-3 sm:gap-4">
                <CardSegmentacaoLeads
                  type="multiplo"
                  content={[...conteudoTemperatura, ...conteudoAposAtendimento]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <CardTempoMedioResposta
                  titulo="Tempo de resposta média"
                  subtitulo="Lead e pré-venda"
                  tempo={dadosFiltrados?.tempoMedioRespostaPreVendedor || '00:00'}
                  periodo={obterPeriodo()}
                />
                <CardTempoMedioResposta
                  titulo="Tempo de resposta média"
                  subtitulo="Lead e vendedor"
                  tempo={dadosFiltrados?.tempoMedioRespostaVendedor || '00:00'}
                  periodo={obterPeriodo()}
                />
              </div>
            </div>

            <div className="xl:col-span-7 sm:space-y-6 flex flex-col h-full">
              <CardAtendimentosPreVenda
                atendimentosPreAtendimentoSemFollowUp={atendimentosPreAtendimentoSemFollowUp}
                atendimentosVendasSemFollowUp={atendimentosVendasSemFollowUp}
              />
            </div>
          </div>

          <div className="xl:col-span-12 sm:space-y-6">
            <CardSegmentacaoLeadsStatus
              titulo="Segmentação de leads por Status"
              total={dadosFiltrados?.segmentacaoStatus?.total || 0}
              statusAtual="Em negociação"
              segmentos={segmentacaoStatus.map(item => ({
                label: item.status,
                valor: item.quantidade,
                cor: item.cor,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}