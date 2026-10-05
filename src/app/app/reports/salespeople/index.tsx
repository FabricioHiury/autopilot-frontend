'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppServices } from '@/services/app.services';
import {
  ConsolidatedSalespersonReport,
  SalespersonDetailReport,
  SalespersonDetailResponse,
} from '@/types/salesperson-detail-report';
import { IconLineUp } from '@/components/icons/icon-line-up';
import { IconFailured } from '@/components/icons/icon-failured';
import { IconLineDown } from '@/components/icons/icon-line-down';
import { DealLossReason, DealLossSubReason } from '@/types/deal-loss';
import { GeneralReport } from '@/types/general-report';
import Reports from '@/components/reports/Reports';
import CardSegmentacaoLeads from '@/components/cards/CardSegmentacaoLeads';
import AtendimentoVendedor, { VendedorData } from '@/components/table/AtendimentoVendedor';
import CardQualificacao from '@/components/cards/CardQualificacao';
import CardMetrica from '@/components/cards/CardMetrica';
import IconUser from '@/components/icons/icon-user';
import CardTempoMedioFechamento from './components/CardTempoMedioFechamento';
import CardTempoMedioEtapa from './components/CardTempoMedioEtapa';
import GraficoMotivosPerdas from './components/GraficoMotivosPerdas';
import CardTempoRespostaConversa from './components/CardTempoRespostaConversa';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import IconFrio from '@/components/icons/icon-frio';
import IconMorno from '@/components/icons/icon-morno';
import IconQuente from '@/components/icons/icon-quente';

export default function RelatorioAtendimentosPorVendedor({
  dataStart,
  dataEnd,
  mode = 'total',
  employeeId: requestedEmployeeId,
  setIdColaborador,
}: {
  dataStart: string;
  dataEnd: string;
  mode?: 'total' | 'BUY' | 'SELL' | 'CONSIGNMENT';
  employeeId?: string;
  setIdColaborador?: (id: string | 'todos') => void;
}) {
  const params = useParams();
  const api = new AppServices();
  const employeeId = requestedEmployeeId ?? (params.employeeId as string);
  const [dadosRelatorio, setDadosRelatorio] = useState<Partial<SalespersonDetailReport> | null>(
    null,
  );
  const [listVendedor, setListVendedor] = useState<VendedorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
  }, [employeeId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([listReportSalesperson(dataStart, dataEnd)]).finally(() => {
      setLoading(false);
    });
  }, [employeeId, dataStart, dataEnd, mode]);

  useEffect(() => {
    const carregarDadosVendedor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.reports.listGeneral(
          dataStart,
          dataEnd,
        )) as unknown as GeneralReport;
        const data = response.viewPreSell;

        setListVendedor(
          data.map((item) => ({
            id: item.id,
            name: item.salesperson,
            avatar: item.avatar,
            role: 'Pré-Vendedor',
            dataStart: item.timeInPlatform,
            leads: item.leadsReceived,
            leadsAtendimento: item.atDeal,
            leadsResgate: item.leadsRecovered || 0,
            leadsConverted: item.leadsConverted || 0,
            averageConversion: item.averageConversion?.toString() || '0',
          })),
        );
      } catch (err) {
        console.error('Erro ao carregar dados do vendedor:', err);
        setError('Erro ao carregar dados do vendedor');
      } finally {
        setLoading(false);
      }
    };
    carregarDadosVendedor();
  }, [employeeId, dataStart, dataEnd, mode]);

  const listReportSalesperson = async (dataStart: string, dataEnd: string) => {
    try {
      const response = await api.reports.listReportSalesperson(dataStart, dataEnd, employeeId);
      if (response) {
        normalizeRelatorioResposta(response as unknown as ConsolidatedSalespersonReport[]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do vendedor:', err);
      throw new Error('Erro ao carregar dados do vendedor');
    }
  };

  const normalizeRelatorioResposta = (response: ConsolidatedSalespersonReport[]) => {
    const data = response.find((item) => item.mode === mode);

    if (!data || !data.salespeople || data.salespeople.length === 0) {
      setDadosRelatorio(null);
      return;
    }

    const filterData = {
      totalLeads: data.totalLeads || 0,
      segmentationTemperature: data.salespeople[0].segmentationTemperature,
      timeAverageByStage: data.salespeople[0].timeAverageByStage,
      reasonsLossesBusiness: data.salespeople[0].reasonsLossesBusiness,
      dealsWellSucceeded: data.salespeople[0].dealsWellSucceeded,
      averageConversion: data.salespeople[0].averageConversion,
      failures: data.salespeople[0].failures,
      averageQualification: data.salespeople[0].averageQualification,
      rateConversion: data.salespeople[0].rateConversion,
      rateFailure: data.salespeople[0].rateFailure,
      rateSuccess: data.salespeople[0].rateSuccess,
      timeAverageReply: data.salespeople[0].timeAverageReply,
      timeAverageCompletion: data.salespeople[0].timeAverageCompletion,
      numberConversionOnline:
        (data as any).numberConversionOnline ?? data.salespeople[0].numberConversionOnline ?? 0,
      numberConversionShowroom:
        (data as any).numberConversionShowroom ?? data.salespeople[0].numberConversionShowroom ?? 0,
      segmentationTemperatureQualification:
        data.salespeople[0].segmentationTemperatureQualification,
      totalOnline: data.totalOnline || 0,
      rateConversionOnline: data.rateConversionOnline || 0,
      rateConversionShowroom: data.rateConversionShowroom || 0,
      totalShowroom: data.totalShowroom || 0,
      leadsVsConversionsSalesperson: data.salespeople.map((v) => ({
        name: v.name,
        leads: v.atDeal || 0,
        conversions: v.converted || 0,
      })),
    };

    setDadosRelatorio({
      ...filterData,
      timeAverageByStage: {
        ...filterData.timeAverageByStage,
        etapaMaisRapida: '',
        etapaMaisLenta: '',
      },
    });
  };

  const handleVendedorClick = async (novoVendedorId: string) => {
    if (novoVendedorId === employeeId) {
      return;
    }

    setIdColaborador?.(novoVendedorId as any);
  };

  if (loading) {
    return <LoadingGlobal />;
  }

  if (error || !dadosRelatorio) {
    return <NoData label={error || 'Não foi possível carregar os dados do vendedor'} />;
  }
  const totalLeads = dadosRelatorio?.totalLeads || 0;
  const segQualificacao = dadosRelatorio.segmentationTemperatureQualification;

  const segmentacaoLeadsInicial = [
    {
      type: 'Frio' as const,
      icone: <IconFrio />,
      percentage: Math.round(segQualificacao?.cold?.percentageInitial ?? 0),
      color: 'bg-red-500',
    },
    {
      type: 'Morno' as const,
      icone: <IconMorno />,
      percentage: Math.round(segQualificacao?.warm?.percentageInitial ?? 0),
      color: 'bg-red-500',
    },
    {
      type: 'Quente' as const,
      icone: <IconQuente />,
      percentage: Math.round(segQualificacao?.hot?.percentageInitial ?? 0),
      color: 'bg-red-500',
    },
  ];

  const segmentacaoLeadsFinal = [
    {
      type: 'Frio' as const,
      icone: <IconFrio />,
      percentage: Math.round(segQualificacao?.cold?.percentageFinal ?? 0),
      color: 'bg-red-500',
    },
    {
      type: 'Morno' as const,
      icone: <IconMorno />,
      percentage: Math.round(segQualificacao?.warm?.percentageFinal ?? 0),
      color: 'bg-red-500',
    },
    {
      type: 'Quente' as const,
      icone: <IconQuente />,
      percentage: Math.round(segQualificacao?.hot?.percentageFinal ?? 0),
      color: 'bg-red-500',
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

  function formatarTempo(minutos: number): { value: number; unidade: string } {
    if (minutos === 0) return { value: 0, unidade: 'min' };

    if (minutos < 60) {
      return { value: minutos, unidade: 'min' };
    } else if (minutos < 1440) {
      const horas = Math.round((minutos / 60) * 10) / 10;
      return { value: horas, unidade: horas === 1 ? 'hora' : 'horas' };
    } else {
      const dias = Math.round((minutos / 1440) * 10) / 10;
      return { value: dias, unidade: dias === 1 ? 'dia' : 'dias' };
    }
  }

  function formatarTempoString(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  }

  const toMotivoEnum = (s: string | undefined): DealLossReason | undefined => {
    if (!s) return undefined;
    return (Object.values(DealLossReason) as string[]).includes(s)
      ? (s as DealLossReason)
      : undefined;
  };

  const toSubEnum = (s: string | undefined): DealLossSubReason | undefined => {
    if (!s) return undefined;
    return (Object.values(DealLossSubReason) as string[]).includes(s)
      ? (s as DealLossSubReason)
      : undefined;
  };
  const tempoEtapas = dadosRelatorio.timeAverageByStage;
  const temposMinutos = {
    'Pré-atendimento': parseTempoString(tempoEtapas?.['Pré-atendimento'] || '0h 0min'),
    'Atendimento Inicial': parseTempoString(tempoEtapas?.['Atendimento Inicial'] || '0h 0min'),
    Visita: parseTempoString(tempoEtapas?.['Visita'] || '0h 0min'),
    'Em Negociação': parseTempoString(tempoEtapas?.['Em Negociação'] || '0h 0min'),
    Resgate: parseTempoString(tempoEtapas?.['Resgate'] || '0h 0min'),
  };

  const totalTempo = Object.values(temposMinutos).reduce((acc, tempo) => acc + tempo, 0);

  const dadosTempoEtapas = [
    {
      stage: 'Pré-atendimento',
      ...formatarTempo(temposMinutos['Pré-atendimento']),
      percentage:
        totalTempo > 0 ? Math.round((temposMinutos['Pré-atendimento'] / totalTempo) * 100) : 0,
      color: 'bg-green-500',
    },
    {
      stage: 'Atendimento Inicial',
      ...formatarTempo(temposMinutos['Atendimento Inicial']),
      percentage:
        totalTempo > 0 ? Math.round((temposMinutos['Atendimento Inicial'] / totalTempo) * 100) : 0,
      color: 'bg-blue-500',
    },
    {
      stage: 'Visita',
      ...formatarTempo(temposMinutos['Visita']),
      percentage: totalTempo > 0 ? Math.round((temposMinutos['Visita'] / totalTempo) * 100) : 0,
      color: 'bg-yellow-500',
    },
    {
      stage: 'Em Negociação',
      ...formatarTempo(temposMinutos['Em Negociação']),
      percentage:
        totalTempo > 0 ? Math.round((temposMinutos['Em Negociação'] / totalTempo) * 100) : 0,
      color: 'bg-purple-500',
    },
    {
      stage: 'Resgate',
      ...formatarTempo(temposMinutos['Resgate']),
      percentage: totalTempo > 0 ? Math.round((temposMinutos['Resgate'] / totalTempo) * 100) : 0,
      color: 'bg-red-500',
    },
  ].map((stage) => ({
    ...stage,
    timeAverage: stage.value,
  }));

  const motivosPerdas = dadosRelatorio.reasonsLossesBusiness;
  const dadosMotivosPerdas = motivosPerdas
    ? [
        {
          reason: 'Preço alto',
          limit: motivosPerdas.priceHigh.value,
          percentage: motivosPerdas.priceHigh.percentage,
          color: '#DC2626',
        },
        {
          reason: 'Concorrência',
          limit: motivosPerdas.competition.value,
          percentage: motivosPerdas.competition.percentage,
          color: '#EA580C',
        },
        {
          reason: 'Não qualificado',
          limit: motivosPerdas.notQualified.value,
          percentage: motivosPerdas.notQualified.percentage,
          color: '#D97706',
        },
        {
          reason: 'Timing',
          limit: motivosPerdas.timing.value,
          percentage: motivosPerdas.timing.percentage,
          color: '#65A30D',
        },
        {
          reason: 'Outros',
          limit: motivosPerdas.other.value,
          percentage: motivosPerdas.other.percentage,
          color: '#6B7280',
        },
      ]
    : [
        { reason: 'Preço alto', limit: 0, percentage: 0, color: '#DC2626' },
        { reason: 'Concorrência', limit: 0, percentage: 0, color: '#EA580C' },
        { reason: 'Não qualificado', limit: 0, percentage: 0, color: '#D97706' },
        { reason: 'Timing', limit: 0, percentage: 0, color: '#65A30D' },
        { reason: 'Outros', limit: 0, percentage: 0, color: '#6B7280' },
      ];

  const principalMotivoEnum = toMotivoEnum(dadosRelatorio?.reasonsLossesBusiness?.primaryReason);
  const motivosDetalhadosEnum = (dadosRelatorio?.reasonsLossesBusiness?.reasonsDetailed || [])
    .map((m) => ({ ...m, reason: toMotivoEnum(m.reason) }))
    .filter((m): m is { reason: DealLossReason; limit: number; percentage: number } => !!m.reason);

  const submotivosPorMotivoRaw = dadosRelatorio?.reasonsLossesBusiness?.subReasonsByReason || {};
  const submotivosPorMotivoEnum: Partial<
    Record<
      DealLossReason,
      Array<{ subReason: DealLossSubReason; limit: number; percentage: number }>
    >
  > = Object.entries(submotivosPorMotivoRaw).reduce(
    (acc, [key, arr]) => {
      const mk = toMotivoEnum(key);
      if (!mk) return acc;
      const list = arr
        .map((sub) => ({ ...sub, subReason: toSubEnum(sub.subReason) }))
        .filter(
          (s): s is { subReason: DealLossSubReason; limit: number; percentage: number } =>
            !!s.subReason,
        );
      acc[mk] = list;
      return acc;
    },
    {} as Partial<
      Record<
        DealLossReason,
        Array<{ subReason: DealLossSubReason; limit: number; percentage: number }>
      >
    >,
  );

  const submotivosDetalhadosEnum = (dadosRelatorio?.reasonsLossesBusiness?.subReasonsDetailed || [])
    .map((s) => ({
      ...s,
      reasonPrimary: toMotivoEnum(s.reasonPrimary),
      subReason: toSubEnum(s.subReason),
    }))
    .filter(
      (
        s,
      ): s is {
        reasonPrimary: DealLossReason;
        subReason: DealLossSubReason;
        limit: number;
        percentage: number;
      } => !!s.reasonPrimary && !!s.subReason,
    );

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 flex flex-col gap-5">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          <div className="xl:col-span-4 flex-1 h-full">
            <CardSegmentacaoLeads
              type="multiplo"
              content={[
                {
                  title: 'Temperatura Inicial de Atendimento',
                  subtitulo: 'Baseada na temperatura definida no momento da transferência.',
                  totalLeads: totalLeads,
                  unidade: 'leads',
                  segmentacao: segmentacaoLeadsInicial,
                },
                {
                  title: 'Temperatura após a finalização do atendimento',
                  totalLeads: totalLeads,
                  unidade: 'leads',
                  segmentacao: segmentacaoLeadsFinal,
                },
              ]}
            />
          </div>

          <div className="xl:col-span-4 flex flex-col gap-4">
            <CardMetrica
              icone={<IconUser size={16} fill="white" />}
              title="Sucesso em atendimentos."
              value={dadosRelatorio.dealsWellSucceeded}
              unidade="atend."
              iconesTendencia={<IconLineUp />}
              percentage={dadosRelatorio.rateSuccess}
            />
            <CardMetrica
              icone={<IconFailured size={16} fill="white" />}
              title="Insucesso em atendimentos"
              value={dadosRelatorio.failures}
              unidade="atend."
              iconesTendencia={<IconLineDown />}
              percentage={dadosRelatorio.rateFailure}
            />
          </div>
          <div className="xl:col-span-4 flex flex-col gap-4">
            <CardQualificacao
              type="multiplo"
              title="Média de Qualificação e Conversão"
              subtitulo=""
              itens={[
                {
                  label: 'Atendimentos online',
                  percentage: Number(dadosRelatorio?.rateConversionOnline?.toFixed(2)) || 0,
                  total: dadosRelatorio?.totalOnline || 0,
                  conversao: dadosRelatorio?.numberConversionOnline || 0,
                },
                {
                  label: 'Atendimentos room',
                  percentage: Number(dadosRelatorio?.rateConversionShowroom?.toFixed(2)) || 0,
                  total: dadosRelatorio?.totalShowroom || 0,
                  conversao: dadosRelatorio?.numberConversionShowroom || 0,
                },
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
                data={dadosRelatorio?.leadsVsConversionsSalesperson || []}
                xKey="name"
                height={320}
                series={[
                  { type: 'bar', dataKey: 'conversions', name: 'Conversões', color: '#2A3E65' },
                  { type: 'line', dataKey: 'leads', name: 'Leads Atendidos', color: '#10B981' },
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
              timeAverage={dadosRelatorio?.timeAverageCompletion || 0}
              unidade=""
              tendencia="up"
              percentualTendencia=""
              meta=""
              metaUnidade=""
            />
            <CardTempoRespostaConversa
              timeAverage={dadosRelatorio?.timeAverageReply || 0}
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
              title="Tempo médio por etapa de negociação"
              subtitulo="Tempo médio que seus atendimentos permanecem em cada etapa do funil."
              etapas={dadosTempoEtapas}
            />
          </div>

          <div className="xl:col-span-8">
            <GraficoMotivosPerdas
              title="Motivos de perdas negociais"
              subtitulo="Principais razões para não conversão"
              data={dadosMotivosPerdas}
              totalLosses={dadosRelatorio?.reasonsLossesBusiness?.totalLosses}
              rateLoss={dadosRelatorio?.reasonsLossesBusiness?.rateLoss}
              primaryReason={principalMotivoEnum}
              reasonsDetailed={motivosDetalhadosEnum}
              subReasonsByReason={submotivosPorMotivoEnum}
              subReasonsDetailed={submotivosDetalhadosEnum}
            />
          </div>
        </div>
        <AtendimentoVendedor data={listVendedor} onVendedorClick={handleVendedorClick} />
      </main>
    </div>
  );
}
