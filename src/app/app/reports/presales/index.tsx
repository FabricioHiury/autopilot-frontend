'use client';

import CardSegmentacaoLeadStatus from './components/card/CardSegmentacaoLeadStatus';
import toast from 'react-hot-toast';
import IconUser from '@/components/icons/icon-user';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import GraficoMotivosPerdas from '@/app/app/reports/salespeople/components/GraficoMotivosPerdas';
import { IconFailured } from '@/components/icons/icon-failured';
import { IconLineDown } from '@/components/icons/icon-line-down';
import { IconLineUp } from '@/components/icons/icon-line-up';
import { AppServices } from '@/services/app.services';
import { GeneralReport } from '@/types/general-report';
import { useEffect, useMemo, useState } from 'react';
import {
  CardMetrica,
  CardTempoResposta,
  CardQualificacao,
  CardMetricasAvancadas,
} from './components/card';
import { PreVendaTable, PreVendaData } from '@/components/table';
import { DealLossReason, DealLossSubReason } from '@/types/deal-loss';

interface RelatorioAtendimentosGeralProps {
  dataStart: string;
  dataEnd: string;
  mode?: 'total' | 'BUY' | 'SELL' | 'CONSIGNMENT';
  employeeId?: string;
  setIdColaborador: (id: string) => void;
}

export default function RelatorioAtendimentosGeral({
  dataStart,
  dataEnd,
  mode = 'total',
  employeeId,
  setIdColaborador,
}: RelatorioAtendimentosGeralProps) {
  const api = useMemo(() => new AppServices(), []);
  const [relatorioGeral, setRelatorioGeral] = useState<GeneralReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const formatMesAno = (dateStr: string) => {
    const d = new Date(dateStr);
    const meses = [
      'JAN.',
      'FEV.',
      'MAR.',
      'ABR.',
      'MAI.',
      'JUN.',
      'JUL.',
      'AGO.',
      'SET.',
      'OUT.',
      'NOV.',
      'DEZ.',
    ];
    return `${meses[d.getMonth()]}${d.getFullYear()}`;
  };

  const dadosFiltrados = useMemo(() => {
    if (!relatorioGeral?.reportByMode) return null;
    return relatorioGeral.reportByMode.find((item) => item.mode === mode) || null;
  }, [relatorioGeral, mode]);

  const motivosPreAtendimento = useMemo(() => {
    return dadosFiltrados?.reasonsLossesPreDeal || [];
  }, [dadosFiltrados]);

  const normalizeMotivoKey = (s: string | undefined): string | undefined => {
    if (!s) return undefined;
    const aliasMap: Record<string, DealLossReason> = {
      financeiroCredito: DealLossReason.FINANCIAL_CREDIT,
    };
    const mapped = aliasMap[s as keyof typeof aliasMap];
    return mapped ? mapped : s;
  };

  const toMotivoEnum = (s: string | undefined): DealLossReason | undefined => {
    const normalized = normalizeMotivoKey(s);
    if (!normalized) return undefined;
    return (Object.values(DealLossReason) as string[]).includes(normalized)
      ? (normalized as DealLossReason)
      : undefined;
  };

  const toSubEnum = (s: string | undefined): DealLossSubReason | undefined => {
    if (!s) return undefined;
    return (Object.values(DealLossSubReason) as string[]).includes(s)
      ? (s as DealLossSubReason)
      : undefined;
  };

  const formatEnumLabel = (raw: string | undefined): string => {
    if (!raw) return '—';
    const spaced = raw.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    const tokens = spaced.split(' ');
    const accentMap: Record<string, string> = {
      nao: 'não',
      negotiation: 'negociação',
      avaliacao: 'avaliação',
      credito: 'crédito',
      proximo: 'próximo',
      concessionaria: 'concessionária',
      veiculo: 'veículo',
      whatsapp: 'WhatsApp',
      incompativel: 'incompatível',
      documentacao: 'documentação',
      customer: 'Customer',
      banco: 'Banco',
      score: 'Score',
      mercado: 'mercado',
      proposta: 'proposta',
      parcela: 'parcela',
      renda: 'renda',
      color: 'color',
      version: 'versão',
      modelo: 'modelo',
      store: 'STORE',
      competition: 'concorrência',
    };
    const normalized = tokens
      .map((t, i) => {
        const lower = t.toLowerCase();
        const converted = accentMap[lower] || lower;
        return i === 0 ? converted.charAt(0).toUpperCase() + converted.slice(1) : converted;
      })
      .join(' ');
    return normalized;
  };

  const motivosPerdaChartData = useMemo(() => {
    const palette = [
      '#DC2626',
      '#EA580C',
      '#D97706',
      '#65A30D',
      '#6B7280',
      '#2563EB',
      '#0EA5E9',
      '#14B8A6',
      '#F59E0B',
      '#EF4444',
    ];
    return (motivosPreAtendimento || []).map((item, idx) => ({
      reason: formatEnumLabel(item.reason),
      limit: item.total,
      percentage: item.percentage,
      color: palette[idx % palette.length],
    }));
  }, [motivosPreAtendimento]);

  const principalMotivoEnum = useMemo(() => {
    const arr = motivosPreAtendimento || [];
    if (arr.length === 0) return undefined;
    const top = arr.reduce((prev, cur) => (cur.total > prev.total ? cur : prev), arr[0]);
    return toMotivoEnum(top.reason);
  }, [motivosPreAtendimento]);

  const motivosDetalhadosEnum = useMemo(() => {
    return (motivosPreAtendimento || [])
      .map((m) => {
        const mk = toMotivoEnum(m.reason);
        if (!mk) return null;
        return { reason: mk, limit: m.total, percentage: m.percentage };
      })
      .filter(
        (x): x is { reason: DealLossReason; limit: number; percentage: number } => x !== null,
      );
  }, [motivosPreAtendimento]);

  const submotivosPorMotivoEnum = useMemo(() => {
    return (motivosPreAtendimento || []).reduce(
      (submotivosPorMotivoMap, motivoItem) => {
        const motivoEnum = toMotivoEnum(motivoItem.reason);
        if (!motivoEnum) return submotivosPorMotivoMap;
        const submotivosList = (motivoItem.subReasons || [])
          .map((subItem: any) => {
            const submotivoRaw = subItem.subReason ?? subItem.financeiroCredito;
            const submotivoEnum = toSubEnum(submotivoRaw);
            if (!submotivoEnum) return null;
            return {
              subReason: submotivoEnum,
              limit: subItem.limit,
              percentage: subItem.percentage,
            };
          })
          .filter(
            (s): s is { subReason: DealLossSubReason; limit: number; percentage: number } =>
              s !== null,
          );
        submotivosPorMotivoMap[motivoEnum] = submotivosList;
        return submotivosPorMotivoMap;
      },
      {} as Partial<
        Record<
          DealLossReason,
          Array<{ subReason: DealLossSubReason; limit: number; percentage: number }>
        >
      >,
    );
  }, [motivosPreAtendimento]);

  const submotivosDetalhadosEnum = useMemo(() => {
    const details: {
      reasonPrimary: DealLossReason;
      subReason: DealLossSubReason;
      limit: number;
      percentage: number;
    }[] = [];
    (motivosPreAtendimento || []).forEach((motivoItem) => {
      const motivoEnum = toMotivoEnum(motivoItem.reason);
      if (!motivoEnum) return;
      (motivoItem.subReasons || []).forEach((subItem: any) => {
        const submotivoRaw = subItem.subReason ?? subItem.financeiroCredito;
        const submotivoEnum = toSubEnum(submotivoRaw);
        if (!submotivoEnum) return;
        details.push({
          reasonPrimary: motivoEnum,
          subReason: submotivoEnum,
          limit: subItem.limit,
          percentage: subItem.percentage,
        });
      });
    });
    return details;
  }, [motivosPreAtendimento]);

  const totalPerdasPreAtendimento = useMemo(() => {
    return (motivosPreAtendimento || []).reduce((acc, cur) => acc + (cur.total || 0), 0);
  }, [motivosPreAtendimento]);

  const taxaPerdaPreAtendimento = useMemo(() => {
    return dadosFiltrados?.rateFailure || 0;
  }, [dadosFiltrados]);

  const preVendaData: PreVendaData[] =
    relatorioGeral?.viewPreSell?.map((item) => ({
      id: item.id,
      name: item.salesperson || '',
      role: 'Vendedor',
      timeInPlatform: item.timeInPlatform || '',
      leadsReceived: item.leadsReceived || 0,
      leadsAtendimento: item.atDeal || 0,
      leadsQualificados: item.qualified || 0,
      averageQualification: `${item.rateQualification || 0}%`,
      avatar: item.avatar || undefined,
    })) || [];

  useEffect(() => {
    listaRelatorioGeral();
  }, [dataStart, dataEnd, employeeId]);

  const listaRelatorioGeral = async () => {
    setLoading(true);
    const idFiltro = employeeId && employeeId !== 'todos' ? employeeId : undefined;
    const response = await api.reports.listGeneral(dataStart, dataEnd, idFiltro);
    if (response) {
      setRelatorioGeral(response as unknown as GeneralReport);
      setLoading(false);
    } else {
      toast.error('Não foi possível listar o relatório geral');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingGlobal />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="xl:col-span-4 flex flex-col gap-4 h-full">
          <CardMetrica
            icone={<IconUser size={16} fill="white" />}
            title="Sucesso em atend."
            value={dadosFiltrados?.dealsWellSucceeded}
            unidade="atend."
            iconesTendencia={<IconLineUp />}
            percentage={dadosFiltrados?.rateSuccess.toFixed(2)}
          />
          <CardMetrica
            icone={<IconFailured size={16} fill="white" />}
            title="Insucesso em atend."
            value={dadosFiltrados?.failures}
            unidade="atend."
            iconesTendencia={<IconLineDown />}
            percentage={dadosFiltrados?.rateFailure.toFixed(2)}
          />
        </div>

        <div className="xl:col-span-5 flex flex-col md:flex-row gap-4 h-full">
          <CardTempoResposta
            title="Tempo de resposta média"
            subtitulo="Lead e pré-venda"
            tempo={dadosFiltrados?.timeAverageReplyPreSalesperson || '00:00'}
            dadosTempoMedio={dadosFiltrados?.timeAverageReplyPreSalespersonByMonth}
            className="flex-1"
          />
          <CardTempoResposta
            title="Tempo de resposta média"
            subtitulo="Conversa em andamento"
            tempo={dadosFiltrados?.timeAverageReplySalesperson || '00:00'}
            dadosTempoMedio={dadosFiltrados?.timeAverageReplySalespersonByMonth}
            corBarraSelecionada="bg-[hsl(var(--primary))]"
            corBarraNaoSelecionada="bg-[#edcfce]"
            className="flex-1"
          />
        </div>

        <div className="xl:col-span-3 h-full">
          <CardQualificacao
            type="carrossel"
            slides={[
              {
                title: 'Leads Recebidas vs Conversões',
                subtitulo: 'Leads que passaram pelo(s) Pré-vendedor(es)',
                itens: [
                  {
                    label: 'Quantidade de leads recebidas',
                    percentage: dadosFiltrados?.rateConversionLeads || 0,
                    total: dadosFiltrados?.limitQualification || 0,
                    conversao: dadosFiltrados?.limitConversionLeads || 0,
                  },
                ],
              },
              {
                title: 'Leads Recebidas vs Qualificações',
                subtitulo: 'Leads que chegaram ao vendedor após pré-venda',
                itens: [
                  {
                    label: 'Leads recebidas',
                    percentage: dadosFiltrados?.averageQualification || 0,
                    total: dadosFiltrados?.totalDeals || 0,
                    conversao: dadosFiltrados?.limitQualification || 0,
                  },
                ],
              },
              {
                title: 'Leads Recebidas vs Qualificações',
                subtitulo: '',
                itens: [
                  {
                    label: 'Leads Convertidas',
                    percentage: dadosFiltrados?.averageConversion || 0,
                    total: dadosFiltrados?.totalDeals || 0,
                    conversao: dadosFiltrados?.limitConversion || 0,
                  },
                ],
              },
              {
                title: 'Leads Qualificadas vs Conversões',
                subtitulo: 'Leads que chegaram ao vendedor vs Vendas realizadas',
                itens: [
                  {
                    label: 'Leads qualificadas',
                    percentage: dadosFiltrados?.rateConversionLeads || 0,
                    total: dadosFiltrados?.limitQualification || 0,
                    conversao: dadosFiltrados?.limitConversionLeads || 0,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="w-full lg:w-6/12">
          <CardSegmentacaoLeadStatus
            data={[
              {
                label: 'Atend. inicial',
                value: dadosFiltrados?.segmentationStatus.initial || 0,
                color: '#3B82F6',
                percentage: dadosFiltrados?.segmentationStatus.initial || 0,
              },
              {
                label: 'Em visita',
                value: dadosFiltrados?.segmentationStatus.atVisit || 0,
                color: '#10B981',
                percentage: dadosFiltrados?.segmentationStatus.atVisit || 0,
              },
              {
                label: 'Em resgate',
                value: dadosFiltrados?.segmentationStatus.recovery || 0,
                color: '#6B7280',
                percentage: dadosFiltrados?.segmentationStatus.recovery || 0,
              },
              {
                label: 'Em negociação',
                value: dadosFiltrados?.segmentationStatus.negotiation || 0,
                color: '#1E3A8A',
                percentage: dadosFiltrados?.segmentationStatus.negotiation || 0,
              },
            ]}
            totalLeads={dadosFiltrados?.segmentationStatus.total || 0}
            referenciaMesAno={formatMesAno(dataEnd)}
          />
        </div>

        <div className="flex-1">
          <CardMetricasAvancadas
            dadosVisitas={{
              agendadas: dadosFiltrados?.appointmentsVisits || 0,
              compareceram: dadosFiltrados?.visitsAttended || 0,
              taxaComparecimento: dadosFiltrados?.rateAttendanceVisits || 0,
            }}
            dadosConversao={{
              cold: {
                limit: dadosFiltrados?.conversionByTemperature?.cold?.total || 0,
                conversao: dadosFiltrados?.conversionByTemperature?.cold?.conversions || 0,
                rate: dadosFiltrados?.conversionByTemperature?.cold?.rate || 0,
              },
              warm: {
                limit: dadosFiltrados?.conversionByTemperature?.warm?.total || 0,
                conversao: dadosFiltrados?.conversionByTemperature?.warm?.conversions || 0,
                rate: dadosFiltrados?.conversionByTemperature?.warm?.rate || 0,
              },
              hot: {
                limit: dadosFiltrados?.conversionByTemperature?.hot?.total || 0,
                conversao: dadosFiltrados?.conversionByTemperature?.hot?.conversions || 0,
                rate: dadosFiltrados?.conversionByTemperature?.hot?.rate || 0,
              },
            }}
            motivosPerdas={
              dadosFiltrados?.reasonsLoss?.map((item) => {
                return {
                  reason: item.reason,
                  percentage: item.percentage,
                  total: item.total,
                };
              }) || []
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <GraficoMotivosPerdas
          title="Motivos de perda do Pré-atendimento"
          data={motivosPerdaChartData}
          totalLosses={totalPerdasPreAtendimento}
          rateLoss={taxaPerdaPreAtendimento}
          primaryReason={principalMotivoEnum}
          reasonsDetailed={motivosDetalhadosEnum}
          subReasonsByReason={submotivosPorMotivoEnum}
          subReasonsDetailed={submotivosDetalhadosEnum}
        />
      </div>

      <PreVendaTable data={preVendaData} setVendedorId={setIdColaborador} />
    </div>
  );
}
