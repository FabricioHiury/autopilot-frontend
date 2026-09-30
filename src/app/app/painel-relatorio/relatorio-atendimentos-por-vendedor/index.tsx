"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiApp } from "@/lib/api-app";
import { RelatorioConsolidadoVendedores, RelatorioVendedorEspecifico, RelatorioVendedorEspecificoResponse } from "@/model/relatorio-vendedor-especifico";
import { IconLineUp } from "@/components/icons/icon-line-up";
import { IconFailured } from "@/components/icons/icon-failured";
import { IconLineDown } from "@/components/icons/icon-line-down";
import { MOTIVOS_PERDA_ATENDIMENTO, SUB_MOTIVOS_PERDA_ATENDIMENTO } from "@/utils/types/motivos-perda-atendimento-enum";
import { RelatorioGeral } from "@/model/relatorio-geral";
import Reports from "@/components/reports/Reports";
import CardSegmentacaoLeads from "@/components/cards/CardSegmentacaoLeads";
import AtendimentoVendedor, { VendedorData } from "@/components/table/AtendimentoVendedor";
import CardQualificacao from "@/components/cards/CardQualificacao";
import CardMetrica from "@/components/cards/CardMetrica";
import IconUser from "@/components/icons/icon-user";
import CardTempoMedioFechamento from "./components/CardTempoMedioFechamento";
import CardTempoMedioEtapa from "./components/CardTempoMedioEtapa";
import GraficoMotivosPerdas from "./components/GraficoMotivosPerdas";
import CardTempoRespostaConversa from "./components/CardTempoRespostaConversa";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import NoData from "@/components/commons/estados/NoData";
import IconFrio from "@/components/icons/icon-frio";
import IconMorno from "@/components/icons/icon-morno";
import IconQuente from "@/components/icons/icon-quente";


export default function RelatorioAtendimentosPorVendedor({ dataInicio, dataFim, modo = "total", idColaborador, setIdColaborador }: { dataInicio: string, dataFim: string, modo?: "total" | "compra" | "venda" | "consignado", idColaborador?: string, setIdColaborador?: (id: string | 'todos') => void }) {
  const params = useParams();
  const api = new ApiApp();
  const vendedorId = (idColaborador ?? (params.vendedorId as string));
  const [dadosRelatorio, setDadosRelatorio] = useState<Partial<RelatorioVendedorEspecifico> | null>(null);
  const [listVendedor, setListVendedor] = useState<VendedorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
  }, [vendedorId])

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listarRelatorioVendedor(dataInicio, dataFim)
    ]).finally(() => {
      setLoading(false);
    })
  }, [vendedorId, dataInicio, dataFim, modo])

  useEffect(() => {
    const carregarDadosVendedor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.relatorio.listarGeral(dataInicio, dataFim) as unknown as RelatorioGeral;
        const data = response.visaoPreVenda;

        setListVendedor(data.map((item) => ({
          id: item.id,
          nome: item.vendedor,
          avatar: item.avatar,
          cargo: "Pré-Vendedor",
          dataInicio: item.tempoNaPlataforma,
          leads: item.leadsRecebidos,
          leadsAtendimento: item.emAtendimento,
          leadsResgate: item.leadsResgatados || 0,
          leadsConvertidos: item.leadsConvertidos || 0,
          mediaConversao: item.mediaConversao?.toString() || "0",
        })));

      } catch (err) {
        console.error('Erro ao carregar dados do vendedor:', err);
        setError('Erro ao carregar dados do vendedor');
      } finally {
        setLoading(false);
      }
    };
    carregarDadosVendedor();
  }, [vendedorId, dataInicio, dataFim, modo]);

  const listarRelatorioVendedor = async (dataInicio: string, dataFim: string) => {
    try {
      const response = await api.relatorio.listarRelatorioVendedor(dataInicio, dataFim, vendedorId);
      if (response) {
        normalizeRelatorioResposta(response as unknown as RelatorioConsolidadoVendedores[])
      }
    } catch (err) {
      console.error('Erro ao carregar dados do vendedor:', err);
      throw new Error('Erro ao carregar dados do vendedor');
    }
  };

  const normalizeRelatorioResposta = (response: RelatorioConsolidadoVendedores[]) => {
    const data = response.find((item) => item.modo === modo);

    if (!data || !data.vendedores || data.vendedores.length === 0) {
      setDadosRelatorio(null);
      return;
    }

    const filterData = {
      totalLeads: data.totalLeads || 0,
      segmentacaoTemperatura: data.vendedores[0].segmentacaoTemperatura,
      tempoMedioPorEtapa: data.vendedores[0].tempoMedioPorEtapa,
      motivosPerdasNegociais: data.vendedores[0].motivosPerdasNegociais,
      atendimentosBemSucedidos: data.vendedores[0].atendimentosBemSucedidos,
      mediaConversao: data.vendedores[0].mediaConversao,
      insucessos: data.vendedores[0].insucessos,
      mediaQualificacao: data.vendedores[0].mediaQualificacao,
      taxaConversao: data.vendedores[0].taxaConversao,
      taxaInsucesso: data.vendedores[0].taxaInsucesso,
      taxaSucesso: data.vendedores[0].taxaSucesso,
      tempoMedioResposta: data.vendedores[0].tempoMedioResposta,
      tempoMedioFinalizacao: data.vendedores[0].tempoMedioFinalizacao,
      numeroConversaoOnline: (data as any).numeroConversaoOnline ?? data.vendedores[0].numeroConversaoOnline ?? 0,
      numeroConversaoShowroom: (data as any).numeroConversaoShowroom ?? data.vendedores[0].numeroConversaoShowroom ?? 0,
      segmentacaoTemperaturaQualificacao: data.vendedores[0].segmentacaoTemperaturaQualificacao,
      totalOnline: data.totalOnline || 0,
      taxaConversaoOnline: data.taxaConversaoOnline || 0,
      taxaConversaoShowroom: data.taxaConversaoShowroom || 0,
      totalShowroom: data.totalShowroom || 0,
      leadsVsConversoesVendedor: data.vendedores.map(v => ({
        nome: v.nome,
        leads: v.emAtendimento || 0,
        conversoes: v.convertidos || 0,
      }))
    }

    setDadosRelatorio({
      ...filterData,
      tempoMedioPorEtapa: {
        ...filterData.tempoMedioPorEtapa,
        etapaMaisRapida: '',
        etapaMaisLenta: ''
      }
    })
  }

  const handleVendedorClick = async (novoVendedorId: string) => {
    if (novoVendedorId === vendedorId) {
      return;
    }

    setIdColaborador?.(novoVendedorId as any);
  };

  if (loading) {
    return <LoadingGlobal />;
  }

  if (error || !dadosRelatorio) {
    return (
      <NoData
        label={error || "Não foi possível carregar os dados do vendedor"}
      />
    );
  }
  const totalLeads = dadosRelatorio?.totalLeads || 0;
  const segQualificacao = dadosRelatorio.segmentacaoTemperaturaQualificacao;

  const segmentacaoLeadsInicial = [
    {
      tipo: 'Frio' as const,
      icone: <IconFrio />,
      porcentagem: Math.round(segQualificacao?.frio?.porcentagemInicial ?? 0),
      cor: 'bg-red-500'
    },
    {
      tipo: 'Morno' as const,
      icone: <IconMorno />,
      porcentagem: Math.round(segQualificacao?.morno?.porcentagemInicial ?? 0),
      cor: 'bg-red-500'
    },
    {
      tipo: 'Quente' as const,
      icone: <IconQuente />,
      porcentagem: Math.round(segQualificacao?.quente?.porcentagemInicial ?? 0),
      cor: 'bg-red-500'
    },
  ];

  const segmentacaoLeadsFinal = [
    {
      tipo: 'Frio' as const,
      icone: <IconFrio />,
      porcentagem: Math.round(segQualificacao?.frio?.porcentagemFinal ?? 0),
      cor: 'bg-red-500'
    },
    {
      tipo: 'Morno' as const,
      icone: <IconMorno />,
      porcentagem: Math.round(segQualificacao?.morno?.porcentagemFinal ?? 0),
      cor: 'bg-red-500'
    },
    {
      tipo: 'Quente' as const,
      icone: <IconQuente />,
      porcentagem: Math.round(segQualificacao?.quente?.porcentagemFinal ?? 0),
      cor: 'bg-red-500'
    },
  ];

  function parseTempoString(tempoString: string): number {
    if (!tempoString || typeof tempoString !== 'string') return 0;

    const horasMatch = tempoString.match(/(\d+)h/);
    const minutosMatch = tempoString.match(/(\d+)min/);

    const horas = horasMatch ? parseInt(horasMatch[1]) : 0;
    const minutos = minutosMatch ? parseInt(minutosMatch[1]) : 0;

    return horas * 60 + minutos;
  }

  function formatarTempo(minutos: number): { valor: number; unidade: string } {
    if (minutos === 0) return { valor: 0, unidade: 'min' };

    if (minutos < 60) {
      return { valor: minutos, unidade: 'min' };
    } else if (minutos < 1440) {
      const horas = Math.round(minutos / 60 * 10) / 10;
      return { valor: horas, unidade: horas === 1 ? 'hora' : 'horas' };
    } else {
      const dias = Math.round(minutos / 1440 * 10) / 10;
      return { valor: dias, unidade: dias === 1 ? 'dia' : 'dias' };
    }
  }

  function formatarTempoString(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  }

  const toMotivoEnum = (s: string | undefined): MOTIVOS_PERDA_ATENDIMENTO | undefined => {
    if (!s) return undefined;
    return (Object.values(MOTIVOS_PERDA_ATENDIMENTO) as string[]).includes(s)
      ? (s as MOTIVOS_PERDA_ATENDIMENTO)
      : undefined;
  };

  const toSubEnum = (s: string | undefined): SUB_MOTIVOS_PERDA_ATENDIMENTO | undefined => {
    if (!s) return undefined;
    return (Object.values(SUB_MOTIVOS_PERDA_ATENDIMENTO) as string[]).includes(s)
      ? (s as SUB_MOTIVOS_PERDA_ATENDIMENTO)
      : undefined;
  };
  const tempoEtapas = dadosRelatorio.tempoMedioPorEtapa;
  const temposMinutos = {
    "Pré-atendimento": parseTempoString(tempoEtapas?.["Pré-atendimento"] || '0h 0min'),
    "Atendimento Inicial": parseTempoString(tempoEtapas?.["Atendimento Inicial"] || '0h 0min'),
    "Visita": parseTempoString(tempoEtapas?.["Visita"] || '0h 0min'),
    "Em Negociação": parseTempoString(tempoEtapas?.["Em Negociação"] || '0h 0min'),
    "Resgate": parseTempoString(tempoEtapas?.["Resgate"] || '0h 0min'),
  };

  const totalTempo = Object.values(temposMinutos).reduce((acc, tempo) => acc + tempo, 0);

  const dadosTempoEtapas = [
    {
      etapa: 'Pré-atendimento',
      ...formatarTempo(temposMinutos["Pré-atendimento"]),
      porcentagem: totalTempo > 0 ? Math.round((temposMinutos["Pré-atendimento"] / totalTempo) * 100) : 0,
      cor: 'bg-green-500'
    },
    {
      etapa: 'Atendimento Inicial',
      ...formatarTempo(temposMinutos["Atendimento Inicial"]),
      porcentagem: totalTempo > 0 ? Math.round((temposMinutos["Atendimento Inicial"] / totalTempo) * 100) : 0,
      cor: 'bg-blue-500'
    },
    {
      etapa: 'Visita',
      ...formatarTempo(temposMinutos["Visita"]),
      porcentagem: totalTempo > 0 ? Math.round((temposMinutos["Visita"] / totalTempo) * 100) : 0,
      cor: 'bg-yellow-500'
    },
    {
      etapa: 'Em Negociação',
      ...formatarTempo(temposMinutos["Em Negociação"]),
      porcentagem: totalTempo > 0 ? Math.round((temposMinutos["Em Negociação"] / totalTempo) * 100) : 0,
      cor: 'bg-purple-500'
    },
    {
      etapa: 'Resgate',
      ...formatarTempo(temposMinutos["Resgate"]),
      porcentagem: totalTempo > 0 ? Math.round((temposMinutos["Resgate"] / totalTempo) * 100) : 0,
      cor: 'bg-red-500'
    },
  ].map(etapa => ({
    ...etapa,
    tempoMedio: etapa.valor
  }));

  const motivosPerdas = dadosRelatorio.motivosPerdasNegociais;
  const dadosMotivosPerdas = motivosPerdas ? [
    {
      motivo: 'Preço alto',
      quantidade: motivosPerdas.precoAlto.valor,
      porcentagem: motivosPerdas.precoAlto.porcentagem,
      cor: '#DC2626'
    },
    {
      motivo: 'Concorrência',
      quantidade: motivosPerdas.concorrencia.valor,
      porcentagem: motivosPerdas.concorrencia.porcentagem,
      cor: '#EA580C'
    },
    {
      motivo: 'Não qualificado',
      quantidade: motivosPerdas.naoQualificado.valor,
      porcentagem: motivosPerdas.naoQualificado.porcentagem,
      cor: '#D97706'
    },
    {
      motivo: 'Timing',
      quantidade: motivosPerdas.timing.valor,
      porcentagem: motivosPerdas.timing.porcentagem,
      cor: '#65A30D'
    },
    {
      motivo: 'Outros',
      quantidade: motivosPerdas.outros.valor,
      porcentagem: motivosPerdas.outros.porcentagem,
      cor: '#6B7280'
    },
  ] : [

    { motivo: 'Preço alto', quantidade: 0, porcentagem: 0, cor: '#DC2626' },
    { motivo: 'Concorrência', quantidade: 0, porcentagem: 0, cor: '#EA580C' },
    { motivo: 'Não qualificado', quantidade: 0, porcentagem: 0, cor: '#D97706' },
    { motivo: 'Timing', quantidade: 0, porcentagem: 0, cor: '#65A30D' },
    { motivo: 'Outros', quantidade: 0, porcentagem: 0, cor: '#6B7280' },
  ];

  const principalMotivoEnum = toMotivoEnum(dadosRelatorio?.motivosPerdasNegociais?.principalMotivo);
  const motivosDetalhadosEnum = (dadosRelatorio?.motivosPerdasNegociais?.motivosDetalhados || [])
    .map(m => ({ ...m, motivo: toMotivoEnum(m.motivo) }))
    .filter((m): m is { motivo: MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number } => !!m.motivo);

  const submotivosPorMotivoRaw = dadosRelatorio?.motivosPerdasNegociais?.submotivosPorMotivo || {};
  const submotivosPorMotivoEnum: Partial<Record<MOTIVOS_PERDA_ATENDIMENTO, Array<{ submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }>>> =
    Object.entries(submotivosPorMotivoRaw).reduce((acc, [key, arr]) => {
      const mk = toMotivoEnum(key);
      if (!mk) return acc;
      const list = arr
        .map(sub => ({ ...sub, submotivo: toSubEnum(sub.submotivo) }))
        .filter((s): s is { submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number } => !!s.submotivo);
      acc[mk] = list;
      return acc;
    }, {} as Partial<Record<MOTIVOS_PERDA_ATENDIMENTO, Array<{ submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }>>>);

  const submotivosDetalhadosEnum = (dadosRelatorio?.motivosPerdasNegociais?.submotivosDetalhados || [])
    .map(s => ({
      ...s,
      motivoPrincipal: toMotivoEnum(s.motivoPrincipal),
      submotivo: toSubEnum(s.submotivo)
    }))
    .filter((s): s is { motivoPrincipal: MOTIVOS_PERDA_ATENDIMENTO; submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number } => !!s.motivoPrincipal && !!s.submotivo);

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 flex flex-col gap-5">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          <div className="xl:col-span-4 flex-1 h-full">
            <CardSegmentacaoLeads
              type="multiplo"
              content={[
                {
                  titulo: "Temperatura Inicial de Atendimento",
                  subtitulo: "Baseada na temperatura definida no momento da transferência.",
                  totalLeads: totalLeads,
                  unidade: "leads",
                  segmentacao: segmentacaoLeadsInicial
                },
                {
                  titulo: "Temperatura após a finalização do atendimento",
                  totalLeads: totalLeads,
                  unidade: "leads",
                  segmentacao: segmentacaoLeadsFinal
                },
              ]}
            />
          </div>

          <div className="xl:col-span-4 flex flex-col gap-4">
            <CardMetrica
              icone={<IconUser size={16} fill="white" />}
              titulo="Sucesso em atendimentos."
              valor={dadosRelatorio.atendimentosBemSucedidos}
              unidade="atend."
              iconesTendencia={<IconLineUp />}
              percentual={dadosRelatorio.taxaSucesso}
            />
            <CardMetrica
              icone={<IconFailured size={16} fill="white" />}
              titulo="Insucesso em atendimentos"
              valor={dadosRelatorio.insucessos}
              unidade="atend."
              iconesTendencia={<IconLineDown />}
              percentual={dadosRelatorio.taxaInsucesso}
            />
          </div>
          <div className="xl:col-span-4 flex flex-col gap-4">
            <CardQualificacao
              tipo="multiplo"
              titulo="Média de Qualificação e Conversão"
              subtitulo=""
              itens={[
                { label: "Atendimentos online", porcentagem: Number(dadosRelatorio?.taxaConversaoOnline?.toFixed(2)) || 0, total: dadosRelatorio?.totalOnline || 0, conversao: dadosRelatorio?.numeroConversaoOnline || 0 },
                { label: "Atendimentos room", porcentagem: Number(dadosRelatorio?.taxaConversaoShowroom?.toFixed(2)) || 0, total: dadosRelatorio?.totalShowroom || 0, conversao: dadosRelatorio?.numeroConversaoShowroom || 0 },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Gráfico Leads vs Conversões */}
          <div className="xl:col-span-2 p-6 bg-white rounded-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Leads vs conversões em vendas por vendedor
              </h3>
            </div>
            <div className="flex-1">
              <Reports
                type="composed"
                data={dadosRelatorio?.leadsVsConversoesVendedor || []}
                xKey="nome"
                height={320}
                series={[
                  { type: "bar", dataKey: "conversoes", name: "Conversões", color: "#2A3E65" },
                  { type: "line", dataKey: "leads", name: "Leads Atendidos", color: "#10B981" },
                ]}
                showLegend
                showTooltip
                showGrid
              />
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <CardTempoMedioFechamento
              tempoMedio={dadosRelatorio?.tempoMedioFinalizacao || 0}
              unidade=""
              tendencia="up"
              percentualTendencia=""
              meta=""
              metaUnidade=""
            />
            <CardTempoRespostaConversa
              tempoMedio={dadosRelatorio?.tempoMedioResposta || 0}
              unidade=""
              tendencia="up"
              percentualTendencia=""
              meta=""
              metaUnidade=""
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          <div className="xl:col-span-4">
            <CardTempoMedioEtapa
              titulo="Tempo médio por etapa de negociação"
              subtitulo="Tempo médio que seus atendimentos permanecem em cada etapa do funil."
              etapas={dadosTempoEtapas}
            />
          </div>


          <div className="xl:col-span-8">
            <GraficoMotivosPerdas
              titulo="Motivos de perdas negociais"
              subtitulo="Principais razões para não conversão"
              dados={dadosMotivosPerdas}
              totalPerdas={dadosRelatorio?.motivosPerdasNegociais?.totalPerdas}
              taxaPerda={dadosRelatorio?.motivosPerdasNegociais?.taxaPerda}
              principalMotivo={principalMotivoEnum}
              motivosDetalhados={motivosDetalhadosEnum}
              submotivosPorMotivo={submotivosPorMotivoEnum}
              submotivosDetalhados={submotivosDetalhadosEnum}
            />
          </div>
        </div>
        <AtendimentoVendedor
          dados={listVendedor}
          onVendedorClick={handleVendedorClick}
        />
      </main >
    </div>
  );
}