"use client"

import CardSegmentacaoLeadStatus from "./components/card/CardSegmentacaoLeadStatus";
import toast from "react-hot-toast";
import IconUser from "@/components/icons/icon-user";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import GraficoMotivosPerdas from "@/app/app/painel-relatorio/relatorio-atendimentos-por-vendedor/components/GraficoMotivosPerdas";
import { IconFailured } from "@/components/icons/icon-failured";
import { IconLineDown } from "@/components/icons/icon-line-down";
import { IconLineUp } from "@/components/icons/icon-line-up";
import { ApiApp } from "@/lib/api-app";
import { RelatorioGeral } from "@/model/relatorio-geral";
import { useEffect, useMemo, useState } from "react";
import { CardMetrica, CardTempoResposta, CardQualificacao, CardMetricasAvancadas } from "./components/card";
import { PreVendaTable, PreVendaData } from "@/components/table";
import { MOTIVOS_PERDA_ATENDIMENTO, SUB_MOTIVOS_PERDA_ATENDIMENTO } from "@/utils/types/motivos-perda-atendimento-enum";

interface RelatorioAtendimentosGeralProps {
  dataInicio: string;
  dataFim: string;
  modo?: "total" | "compra" | "venda" | "consignado";
  idColaborador?: string;
  setIdColaborador: (id: string) => void;
}

export default function RelatorioAtendimentosGeral({ dataInicio, dataFim, modo = "total", idColaborador, setIdColaborador }: RelatorioAtendimentosGeralProps) {
  const api = useMemo(() => new ApiApp(), []);
  const [relatorioGeral, setRelatorioGeral] = useState<RelatorioGeral | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const formatMesAno = (dateStr: string) => {
    const d = new Date(dateStr);
    const meses = ["JAN.", "FEV.", "MAR.", "ABR.", "MAI.", "JUN.", "JUL.", "AGO.", "SET.", "OUT.", "NOV.", "DEZ."];
    return `${meses[d.getMonth()]}${d.getFullYear()}`;
  };

  const dadosFiltrados = useMemo(() => {
    if (!relatorioGeral?.relatorioPorModo) return null;
    return relatorioGeral.relatorioPorModo.find(item => item.modo === modo) || null;
  }, [relatorioGeral, modo]);

  const motivosPreAtendimento = useMemo(() => {
    return dadosFiltrados?.motivosPerdasPreAtendimento || [];
  }, [dadosFiltrados]);

  const normalizeMotivoKey = (s: string | undefined): string | undefined => {
    if (!s) return undefined;
    const aliasMap: Record<string, MOTIVOS_PERDA_ATENDIMENTO> = {
      financeiroCredito: MOTIVOS_PERDA_ATENDIMENTO.FINANCEIRO_CREDITO,
    };
    const mapped = aliasMap[s as keyof typeof aliasMap];
    return mapped ? mapped : s;
  };

  const toMotivoEnum = (s: string | undefined): MOTIVOS_PERDA_ATENDIMENTO | undefined => {
    const normalized = normalizeMotivoKey(s);
    if (!normalized) return undefined;
    return (Object.values(MOTIVOS_PERDA_ATENDIMENTO) as string[]).includes(normalized)
      ? (normalized as MOTIVOS_PERDA_ATENDIMENTO)
      : undefined;
  };

  const toSubEnum = (s: string | undefined): SUB_MOTIVOS_PERDA_ATENDIMENTO | undefined => {
    if (!s) return undefined;
    return (Object.values(SUB_MOTIVOS_PERDA_ATENDIMENTO) as string[]).includes(s)
      ? (s as SUB_MOTIVOS_PERDA_ATENDIMENTO)
      : undefined;
  };

  const formatEnumLabel = (raw: string | undefined): string => {
    if (!raw) return "—";
    const spaced = raw.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    const tokens = spaced.split(" ");
    const accentMap: Record<string, string> = {
      nao: "não",
      negociacao: "negociação",
      avaliacao: "avaliação",
      credito: "crédito",
      proximo: "próximo",
      concessionaria: "concessionária",
      veiculo: "veículo",
      whatsapp: "WhatsApp",
      incompativel: "incompatível",
      documentacao: "documentação",
      cliente: "Cliente",
      banco: "Banco",
      score: "Score",
      mercado: "mercado",
      proposta: "proposta",
      parcela: "parcela",
      renda: "renda",
      cor: "cor",
      versao: "versão",
      modelo: "modelo",
      loja: "loja",
      concorrencia: "concorrência",
    };
    const normalized = tokens
      .map((t, i) => {
        const lower = t.toLowerCase();
        const converted = accentMap[lower] || lower;
        return i === 0 ? converted.charAt(0).toUpperCase() + converted.slice(1) : converted;
      })
      .join(" ");
    return normalized;
  };

  const motivosPerdaChartData = useMemo(() => {
    const palette = ['#DC2626', '#EA580C', '#D97706', '#65A30D', '#6B7280', '#2563EB', '#0EA5E9', '#14B8A6', '#F59E0B', '#EF4444'];
    return (motivosPreAtendimento || []).map((item, idx) => ({
      motivo: formatEnumLabel(item.motivo),
      quantidade: item.total,
      porcentagem: item.porcentagem,
      cor: palette[idx % palette.length]
    }));
  }, [motivosPreAtendimento]);

  const principalMotivoEnum = useMemo(() => {
    const arr = motivosPreAtendimento || [];
    if (arr.length === 0) return undefined;
    const top = arr.reduce((prev, cur) => (cur.total > prev.total ? cur : prev), arr[0]);
    return toMotivoEnum(top.motivo);
  }, [motivosPreAtendimento]);

  const motivosDetalhadosEnum = useMemo(() => {
    return (motivosPreAtendimento || [])
      .map((m) => {
        const mk = toMotivoEnum(m.motivo);
        if (!mk) return null;
        return { motivo: mk, quantidade: m.total, porcentagem: m.porcentagem };
      })
      .filter((x): x is { motivo: MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number } => x !== null);
  }, [motivosPreAtendimento]);

  const submotivosPorMotivoEnum = useMemo(() => {
    return (motivosPreAtendimento || []).reduce((submotivosPorMotivoMap, motivoItem) => {
      const motivoEnum = toMotivoEnum(motivoItem.motivo);
      if (!motivoEnum) return submotivosPorMotivoMap;
      const submotivosList = (motivoItem.submotivos || [])
        .map((subItem: any) => {
          const submotivoRaw = subItem.submotivo ?? subItem.financeiroCredito;
          const submotivoEnum = toSubEnum(submotivoRaw);
          if (!submotivoEnum) return null;
          return { submotivo: submotivoEnum, quantidade: subItem.quantidade, porcentagem: subItem.porcentagem };
        })
        .filter((s): s is { submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number } => s !== null);
      submotivosPorMotivoMap[motivoEnum] = submotivosList;
      return submotivosPorMotivoMap;
    }, {} as Partial<Record<MOTIVOS_PERDA_ATENDIMENTO, Array<{ submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }>>>);
  }, [motivosPreAtendimento]);

  const submotivosDetalhadosEnum = useMemo(() => {
    const detalhes: { motivoPrincipal: MOTIVOS_PERDA_ATENDIMENTO; submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }[] = [];
    (motivosPreAtendimento || []).forEach((motivoItem) => {
      const motivoEnum = toMotivoEnum(motivoItem.motivo);
      if (!motivoEnum) return;
      (motivoItem.submotivos || []).forEach((subItem: any) => {
        const submotivoRaw = subItem.submotivo ?? subItem.financeiroCredito;
        const submotivoEnum = toSubEnum(submotivoRaw);
        if (!submotivoEnum) return;
        detalhes.push({
          motivoPrincipal: motivoEnum,
          submotivo: submotivoEnum,
          quantidade: subItem.quantidade,
          porcentagem: subItem.porcentagem,
        });
      });
    });
    return detalhes;
  }, [motivosPreAtendimento]);

  const totalPerdasPreAtendimento = useMemo(() => {
    return (motivosPreAtendimento || []).reduce((acc, cur) => acc + (cur.total || 0), 0);
  }, [motivosPreAtendimento]);

  const taxaPerdaPreAtendimento = useMemo(() => {
    return dadosFiltrados?.taxaInsucesso || 0;
  }, [dadosFiltrados]);

  const preVendaData: PreVendaData[] = relatorioGeral?.visaoPreVenda?.map((item) => ({
    id: item.id,
    nome: item.vendedor || '',
    cargo: 'Vendedor',
    tempoNaPlataforma: item.tempoNaPlataforma || '',
    leadsRecebidos: item.leadsRecebidos || 0,
    leadsAtendimento: item.emAtendimento || 0,
    leadsQualificados: item.qualificados || 0,
    mediaQualificacao: `${item.taxaQualificacao || 0}%`,
    avatar: item.avatar || undefined
  })) || [];

  useEffect(() => {
    listaRelatorioGeral();
  }, [dataInicio, dataFim, idColaborador]);

  const listaRelatorioGeral = async () => {
    setLoading(true);
    const idFiltro = idColaborador && idColaborador !== 'todos' ? idColaborador : undefined;
    const response = await api.relatorio.listarGeral(dataInicio, dataFim, idFiltro);
    if (response) {
      setRelatorioGeral(response as unknown as RelatorioGeral);
      setLoading(false);
    } else {
      toast.error("Não foi possível listar o relatório geral");
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingGlobal />;
  }

  return (
    <div className="space-y-6 w-full">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">

        <div className="xl:col-span-4 flex flex-col gap-4 h-full">
          <CardMetrica
            icone={<IconUser size={16} fill="white" />}
            titulo="Sucesso em atend."
            valor={dadosFiltrados?.atendimentosBemSucedidos}
            unidade="atend."
            iconesTendencia={<IconLineUp />}
            percentual={dadosFiltrados?.taxaSucesso.toFixed(2)}
          />
          <CardMetrica
            icone={<IconFailured size={16} fill="white" />}
            titulo="Insucesso em atend."
            valor={dadosFiltrados?.insucessos}
            unidade="atend."
            iconesTendencia={<IconLineDown />}
            percentual={dadosFiltrados?.taxaInsucesso.toFixed(2)}
          />
        </div>


        <div className="xl:col-span-5 flex flex-col md:flex-row gap-4 h-full">
          <CardTempoResposta
            titulo="Tempo de resposta média"
            subtitulo="Lead e pré-venda"
            tempo={dadosFiltrados?.tempoMedioRespostaPreVendedor || "00:00"}
            dadosTempoMedio={dadosFiltrados?.tempoMedioRespostaPreVendedorPorMes}
            className="flex-1"
          />
          <CardTempoResposta
            titulo="Tempo de resposta média"
            subtitulo="Conversa em andamento"
            tempo={dadosFiltrados?.tempoMedioRespostaVendedor || "00:00"}
            dadosTempoMedio={dadosFiltrados?.tempoMedioRespostaVendedorPorMes}
            corBarraSelecionada="bg-[#D33632]"
            corBarraNaoSelecionada="bg-[#edcfce]"
            className="flex-1"
          />
        </div>


        <div className="xl:col-span-3 h-full">
          <CardQualificacao
            tipo="carrossel"
            slides={[
              {
                titulo: "Leads Recebidas vs Conversões",
                subtitulo: "Leads que passaram pelo(s) Pré-vendedor(es)",
                itens: [
                  { label: "Quantidade de leads recebidas", porcentagem: dadosFiltrados?.taxaConversaoLeads || 0, total: dadosFiltrados?.quantidadeQualificacao || 0, conversao: dadosFiltrados?.quantidadeConversaoLeads || 0 },
                ],
              },
              {
                titulo: "Leads Recebidas vs Qualificações",
                subtitulo: "Leads que chegaram ao vendedor após pré-venda",
                itens: [
                  { label: "Leads recebidas", porcentagem: dadosFiltrados?.mediaQualificacao || 0, total: dadosFiltrados?.totalAtendimentos || 0, conversao: dadosFiltrados?.quantidadeQualificacao || 0 },
                ],
              },
              {
                titulo: "Leads Recebidas vs Qualificações",
                subtitulo: "",
                itens: [
                  { label: "Leads Convertidas", porcentagem: dadosFiltrados?.mediaConversao || 0, total: dadosFiltrados?.totalAtendimentos || 0, conversao: dadosFiltrados?.quantidadeConversao || 0 },
                ],
              },
              {
                titulo: "Leads Qualificadas vs Conversões",
                subtitulo: "Leads que chegaram ao vendedor vs Vendas realizadas",
                itens: [
                  { label: "Leads qualificadas", porcentagem: dadosFiltrados?.taxaConversaoLeads || 0, total: dadosFiltrados?.quantidadeQualificacao || 0, conversao: dadosFiltrados?.quantidadeConversaoLeads || 0 },
                ],
              },
            ]}
          />
        </div>
      </div>



      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="w-full lg:w-6/12">
          <CardSegmentacaoLeadStatus
            dados={[
              { label: "Atend. inicial", valor: dadosFiltrados?.segmentacaoStatus.inicial || 0, cor: "#3B82F6", porcentagem: dadosFiltrados?.segmentacaoStatus.inicial || 0 },
              { label: "Em visita", valor: dadosFiltrados?.segmentacaoStatus.emVisita || 0, cor: "#10B981", porcentagem: dadosFiltrados?.segmentacaoStatus.emVisita || 0 },
              { label: "Em resgate", valor: dadosFiltrados?.segmentacaoStatus.resgate || 0, cor: "#6B7280", porcentagem: dadosFiltrados?.segmentacaoStatus.resgate || 0 },
              { label: "Em negociação", valor: dadosFiltrados?.segmentacaoStatus.negociacao || 0, cor: "#1E3A8A", porcentagem: dadosFiltrados?.segmentacaoStatus.negociacao || 0 }
            ]}
            totalLeads={dadosFiltrados?.segmentacaoStatus.total || 0}
            referenciaMesAno={formatMesAno(dataFim)}
          />
        </div>

        <div className="flex-1">
          <CardMetricasAvancadas
            dadosVisitas={{
              agendadas: dadosFiltrados?.agendamentosVisitas || 0,
              compareceram: dadosFiltrados?.visitasCompareceram || 0,
              taxaComparecimento: dadosFiltrados?.taxaComparecimentoVisitas || 0
            }}
            dadosConversao={{
              frio: {
                quantidade: dadosFiltrados?.conversaoPorTemperatura?.frio?.total || 0,
                conversao: dadosFiltrados?.conversaoPorTemperatura?.frio?.conversoes || 0,
                taxa: dadosFiltrados?.conversaoPorTemperatura?.frio?.taxa || 0
              },
              morno: {
                quantidade: dadosFiltrados?.conversaoPorTemperatura?.morno?.total || 0,
                conversao: dadosFiltrados?.conversaoPorTemperatura?.morno?.conversoes || 0,
                taxa: dadosFiltrados?.conversaoPorTemperatura?.morno?.taxa || 0
              },
              quente: {
                quantidade: dadosFiltrados?.conversaoPorTemperatura?.quente?.total || 0,
                conversao: dadosFiltrados?.conversaoPorTemperatura?.quente?.conversoes || 0,
                taxa: dadosFiltrados?.conversaoPorTemperatura?.quente?.taxa || 0
              }
            }}
            motivosPerdas={dadosFiltrados?.motivosPerda?.map((item) => {
              return {
                motivo: item.motivo,
                porcentagem: item.porcentagem,
                total: item.total
              }
            }) || []}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <GraficoMotivosPerdas
          titulo="Motivos de perda do Pré-atendimento"
          dados={motivosPerdaChartData}
          totalPerdas={totalPerdasPreAtendimento}
          taxaPerda={taxaPerdaPreAtendimento}
          principalMotivo={principalMotivoEnum}
          motivosDetalhados={motivosDetalhadosEnum}
          submotivosPorMotivo={submotivosPorMotivoEnum}
          submotivosDetalhados={submotivosDetalhadosEnum}
        />
      </div>


      <PreVendaTable
        data={preVendaData}
        setVendedorId={setIdColaborador}
      />
    </div>
  );
}