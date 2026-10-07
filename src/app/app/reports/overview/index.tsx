'use client';
import { presentationLabel } from '@/lib/presentation-labels';
import CardMetrica from '@/components/cards/CardMetrica';
import CardQualificacao from '@/components/cards/CardQualificacao';
import CardSegmentacaoLeads from '@/components/cards/CardSegmentacaoLeads';
import IconAtendimento from '@/components/icons/icon-atendimento';
import IconClock from '@/components/icons/icon-clock';
import IconRepeat from '@/components/icons/icon-repeat';
import IconUserCheck from '@/components/icons/icon-user-check';
import Reports from '@/components/reports/Reports';
import DesempenhoVendasChart from '@/components/reports/DesempenhoVendasChart';
import CardTempoMedioResposta from './components/CardTempoMedioResposta';
import CardSegmentacaoLeadsStatus from './components/CardSegmentacaoLeadsStatus';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import toast from 'react-hot-toast';
import IconQuente from '@/components/icons/icon-quente';
import IconFrio from '@/components/icons/icon-frio';
import IconMorno from '@/components/icons/icon-morno';

import { CardAtendimentosPreVenda } from './components/CardAtendimentosPreVenda';
import { IconLineDown } from '@/components/icons/icon-line-down';
import { IconLineUp } from '@/components/icons/icon-line-up';
import { useEffect, useMemo, useState } from 'react';
import { AppServices } from '@/services/app.services';
import { GeneralReport } from '@/types/general-report';
import { ChannelReports } from '@/types/channel-report';
import {
  SalespersonDetailResponse,
  DailySalespersonSales,
} from '@/types/salesperson-detail-report';

type AtendimentoSemFollowUp = {
  id: string;
  nameDeal: string;
  period: string;
  status: string;
  employee: string;
  daysWithoutFollowUp: number;
};

interface RelatorioGeralAtendimentoVendasProps {
  dataStart: string;
  dataEnd: string;
  mode?: 'total' | 'BUY' | 'SELL' | 'CONSIGNMENT';
  employeeId?: string;
}

export default function RelatorioGeralAtendimentoVendas({
  dataStart,
  dataEnd,
  mode = 'total',
  employeeId,
}: RelatorioGeralAtendimentoVendasProps) {
  const api = useMemo(() => new AppServices(), []);

  const [relatorioGeral, setRelatorioGeral] = useState<GeneralReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [conversaoVendaCanal, setConversaoVendaCanal] = useState<
    { channel: string; leads: number; conversions: number; taxaConv: number }[]
  >([]);
  const [averageQualification, setMediaQualificacao] = useState<
    {
      label: string;
      percentage: number;
      value: number;
      color?: string;
      subvalorLabel?: string;
      subvalor?: number;
      conversao?: number;
      total?: number;
    }[]
  >([]);

  const [dealsPreDealWithoutFollowUp, setAtendimentosPreAtendimentoSemFollowUp] = useState<
    AtendimentoSemFollowUp[]
  >([]);
  const [dealsSalesWithoutFollowUp, setAtendimentosVendasSemFollowUp] = useState<
    AtendimentoSemFollowUp[]
  >([]);
  const [segmentationStatus, setSegmentacaoStatus] = useState<
    { status: string; limit: number; color: string }[]
  >([]);
  const [desempenhoVendas, setDesempenhoVendas] = useState<DailySalespersonSales>([]);
  const [desempenhoVendedorMesAnterior, setDesempenhoVendedorMesAnterior] = useState<
    { data: string; sales: number }[] | null
  >(null);

  const dadosFiltrados = useMemo(() => {
    if (!relatorioGeral?.reportByMode) return null;
    return relatorioGeral.reportByMode.find((item) => item.mode === mode) || null;
  }, [relatorioGeral, mode]);

  const conteudoTemperatura = useMemo(() => {
    if (!dadosFiltrados) return [] as any[];

    return [
      {
        title: 'Segmentação de contatos interessados por temperatura',
        totalLeads: dadosFiltrados.totalDeals,
        unidade: 'leads',
        segmentacao: [
          {
            type: 'Quente',
            icone: <IconQuente />,
            percentage: dadosFiltrados.segmentationTemperature?.hot?.percentage || 0,
            color: 'bg-red-500',
          },
          {
            type: 'Morno',
            icone: <IconMorno />,
            percentage: dadosFiltrados.segmentationTemperature?.warm?.percentage || 0,
            color: 'bg-yellow-500',
          },
          {
            type: 'Frio',
            icone: <IconFrio />,
            percentage: dadosFiltrados.segmentationTemperature?.cold?.percentage || 0,
            color: 'bg-blue-500',
          },
        ],
      },
    ];
  }, [dadosFiltrados]);

  const conteudoAposAtendimento = useMemo(() => {
    if (!dadosFiltrados) return [] as any[];

    return [
      {
        title: 'Segmentação de Contatos interessados após atendimento',
        totalLeads: dadosFiltrados?.segmentationTemperatureQualification?.total || 0,
        unidade: 'leads',
        segmentacao: [
          {
            type: 'Quente',
            icone: <IconQuente />,
            percentage:
              dadosFiltrados.segmentationTemperatureQualification?.hot?.percentageFinal || 0,
            color: 'bg-red-500',
          },
          {
            type: 'Morno',
            icone: <IconMorno />,
            percentage:
              dadosFiltrados.segmentationTemperatureQualification?.warm?.percentageFinal || 0,
            color: 'bg-yellow-500',
          },
          {
            type: 'Frio',
            icone: <IconFrio />,
            percentage:
              dadosFiltrados.segmentationTemperatureQualification?.cold?.percentageFinal || 0,
            color: 'bg-blue-500',
          },
        ],
      },
    ];
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
  }, [dataStart, dataEnd, employeeId, mode]);

  useEffect(() => {
    if (!relatorioGeral || !dadosFiltrados) return;
    listarAtendimentosPreVenda();
    preencherMediaQualificacao();
    preencherSegmentacaoStatus();
  }, [relatorioGeral, dadosFiltrados]);

  const listaRelatorioGeral = async () => {
    try {
      const response = await api.reports.listGeneral(dataStart, dataEnd, employeeId);
      if (response) {
        setRelatorioGeral(response as unknown as GeneralReport);
      } else {
        toast.error('Não foi possível listar o relatório geral');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar o relatório geral');
    }
  };

  const listarConversaoVendaCanal = async () => {
    try {
      const response = await api.reports.listDealChannel(dataStart, dataEnd, employeeId);
      if (response) {
        const raw: any = response as any;
        const porModoArray: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.channels)
            ? [raw]
            : [];
        const selecionado =
          porModoArray.find((x: any) => x?.mode === mode) ??
          porModoArray.find((x: any) => x?.mode === 'total') ??
          null;
        const canaisArray: any[] = Array.isArray(selecionado?.channels)
          ? selecionado.channels
          : Array.isArray(raw?.channels)
            ? raw.channels
            : [];
        const canaisOrdenados = canaisArray
          .map((item: any) => ({
            channel: item?.nameDisplay,
            leads: Number(item?.leadsTotal ?? 0),
            conversions: Number(item?.conversions ?? 0),
            taxaConv: Number(item?.rateConversion ?? 0),
          }))
          .sort((a, b) => b.conversions - a.conversions);

        setConversaoVendaCanal(canaisOrdenados);
      } else {
        toast.error('Não foi possível listar o relatório por canal');
      }
    } catch (error) {
      console.error('Erro ao carregar relatório por canal:', error);
      toast.error('Erro ao carregar o relatório por canal');
      setConversaoVendaCanal([]);
    }
  };

  const listarAtendimentosPreVenda = () => {
    if (!dadosFiltrados) return;
    setAtendimentosPreAtendimentoSemFollowUp(dadosFiltrados.dealsPreDealWithoutFollowUp || []);
    setAtendimentosVendasSemFollowUp(dadosFiltrados.dealsSalesWithoutFollowUp || []);
  };

  const buscarDesempenhoVendas = async () => {
    const response = await api.reports.listBySalesperson(dataStart, dataEnd, employeeId);
    if (response && Array.isArray(response)) {
      const data = response
        .flatMap((item: any) => item.salesDailyBySalesperson || [])
        .filter((v, i, arr) => arr.findIndex((t) => t.id === v.id) === i);
      setDesempenhoVendas(data);
    } else {
      toast.error('Não foi possível listar o desempenho de vendas');
    }
  };

  const buscarDesempenhoVendedorMesAnterior = async () => {
    try {
      if (!employeeId) {
        setDesempenhoVendedorMesAnterior(null);
        return;
      }
      // Calcula período do mês anterior baseado em dataInicio/fim atuais
      const parseDate = (str: string) => {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
      };
      const ini = parseDate(dataStart);
      const prevIni = new Date(ini);
      prevIni.setMonth(ini.getMonth() - 1);
      prevIni.setDate(1);
      const prevFim = new Date(prevIni.getFullYear(), prevIni.getMonth() + 1, 0);

      const prevInicioStr = prevIni.toISOString().slice(0, 10);
      const prevFimStr = prevFim.toISOString().slice(0, 10);

      const response = await api.reports.listBySalesperson(prevInicioStr, prevFimStr, employeeId);
      if (response && Array.isArray(response)) {
        const flat = response.flatMap((item: any) => item.salesDailyBySalesperson || []);
        const vocePrev = flat.find((v: any) => v.id === employeeId);
        setDesempenhoVendedorMesAnterior(vocePrev?.seriesSales || null);
      } else {
        setDesempenhoVendedorMesAnterior(null);
      }
    } catch (error) {
      console.error(error);
      setDesempenhoVendedorMesAnterior(null);
    }
  };
  const preencherMediaQualificacao = () => {
    if (!dadosFiltrados) return;

    setMediaQualificacao([
      {
        label: 'Qualificação',
        percentage: parseFloat(dadosFiltrados?.averageQualification?.toFixed(2)) || 0,
        conversao: parseFloat(dadosFiltrados.limitQualification?.toFixed(2)) || 0,
        total: parseFloat(dadosFiltrados.totalDeals?.toFixed(2)) || 0,
        value: parseFloat(dadosFiltrados.totalDeals?.toFixed(2)) || 0,
        color: 'hsl(var(--primary))',
      },
      {
        label: 'Conversões',
        percentage: parseFloat(dadosFiltrados?.averageConversion?.toFixed(2)) || 0,
        conversao: parseFloat(dadosFiltrados.limitConversion?.toFixed(2)) || 0,
        total: parseFloat(dadosFiltrados.totalDeals?.toFixed(2)) || 0,
        value: parseFloat(dadosFiltrados.totalDeals?.toFixed(2)) || 0,
      },
      {
        label: 'Conversão de Contatos interessados',
        percentage: parseFloat(dadosFiltrados?.rateConversionLeads?.toFixed(2)) || 0,
        value: parseFloat(dadosFiltrados.limitConversionLeads?.toFixed(2)) || 0,
        color: '#22C55E',
        subvalorLabel: 'Quantidade total de Contatos interessados qualificados',
        subvalor: parseFloat(dadosFiltrados.limitQualification?.toFixed(2)) || 0,
      },
      {
        label: 'Showroom',
        percentage: parseFloat(dadosFiltrados?.rateShowroom?.toFixed(2)) || 0,
        value: parseFloat(dadosFiltrados.limitShowroom?.toFixed(2)) || 0,
        color: '#FF8C00',
        subvalorLabel: 'Quantidade de showroom convertido',
        subvalor: parseFloat(dadosFiltrados.limitShowroomSuccess?.toFixed(2)) || 0,
      },
    ]);
  };

  const preencherSegmentacaoStatus = () => {
    if (!dadosFiltrados) return;

    setSegmentacaoStatus([
      {
        status: 'Atend. inicial',
        limit: dadosFiltrados.segmentationStatus.initial,
        color: 'hsl(var(--primary))',
      },
      { status: 'Em visita', limit: dadosFiltrados.segmentationStatus.atVisit, color: '#589D6A' },
      { status: 'Em resgate', limit: dadosFiltrados.segmentationStatus.recovery, color: '#586E9D' },
      {
        status: 'Em negociação',
        limit: dadosFiltrados.segmentationStatus.negotiation,
        color: '#3B82F6',
      },
    ]);
  };

  const obterPeriodo = () => {
    const parseLocalDate = (str: any) => {
      const [year, month, dia] = str.split('-').map(Number);
      return new Date(year, month - 1, dia);
    };

    const ini = parseLocalDate(dataStart);
    const end = parseLocalDate(dataEnd);

    const mesAnoIni = ini.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      month: 'short',
      year: 'numeric',
    });

    const mesAnoFim = end.toLocaleString('pt-BR', {
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
              title="Total de Atendimentos"
              value={dadosFiltrados?.totalDeals}
              iconesTendencia={<IconLineUp />}
            />
            <CardMetrica
              icone={<IconClock size={16} fill="white" />}
              title="Em Atendimento"
              value={dadosFiltrados?.segmentationStatus?.initial}
              iconesTendencia={<IconLineUp />}
            />
            <CardMetrica
              icone={<IconUserCheck size={16} fill="white" />}
              title="Sucessos"
              value={dadosFiltrados?.limitSuccess}
              iconesTendencia={<IconLineUp />}
              percentage={dadosFiltrados?.rateSuccess?.toFixed(2)}
            />
            <CardMetrica
              icone={<IconRepeat size={16} fill="white" />}
              title="Resgates"
              value={dadosFiltrados?.segmentationStatus?.recovery}
              iconesTendencia={<IconLineDown />}
              percentage={dadosFiltrados?.rateRecovery?.toFixed(2)}
            />
          </div>

          <div className="xl:col-span-12 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <DesempenhoVendasChart
                data={desempenhoVendas}
                yourSellerId={employeeId}
                previousSeries={desempenhoVendedorMesAnterior}
                initialMonth={(() => {
                  const d = new Date(dataEnd);
                  return d.getMonth() + 1;
                })()}
                initialYear={(() => {
                  const d = new Date(dataEnd);
                  return d.getFullYear();
                })()}
                height={360}
              />
            </div>
          </div>
          <div className="xl:col-span-12 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">
                Contatos interessados e Conversões em Vendas por canal
              </h3>
              <div className="overflow-x-auto">
                <div className="min-w-[800px] xl:min-w-full">
                  <Reports
                    type="composed"
                    data={conversaoVendaCanal}
                    xKey="channel"
                    height={360}
                    series={[
                      { type: 'bar', dataKey: 'leads', name: 'Contatos interessados' },
                      { type: 'bar', dataKey: 'conversions', name: 'Conversão' },
                      { type: 'line', dataKey: 'taxaConv', name: 'Taxa de Conversão (%)' },
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
                type="carrossel-multiplo"
                title="Média de Qualificação e Conversão"
                subtitulo=""
                itens={averageQualification}
              />

              <div className="col-span-12 gap-3 sm:gap-4">
                <CardSegmentacaoLeads
                  type="multiplo"
                  content={[...conteudoTemperatura, ...conteudoAposAtendimento]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <CardTempoMedioResposta
                  title="Tempo de resposta média"
                  subtitulo="Contato interessado e pré-venda"
                  tempo={dadosFiltrados?.timeAverageReplyPreSalesperson || '00:00'}
                  period={obterPeriodo()}
                />
                <CardTempoMedioResposta
                  title="Tempo de resposta média"
                  subtitulo="Contato interessado e vendedor"
                  tempo={dadosFiltrados?.timeAverageReplySalesperson || '00:00'}
                  period={obterPeriodo()}
                />
              </div>
            </div>

            <div className="xl:col-span-7 sm:space-y-6 flex flex-col h-full">
              <CardAtendimentosPreVenda
                dealsPreDealWithoutFollowUp={dealsPreDealWithoutFollowUp}
                dealsSalesWithoutFollowUp={dealsSalesWithoutFollowUp}
              />
            </div>
          </div>

          <div className="xl:col-span-12 sm:space-y-6">
            <CardSegmentacaoLeadsStatus
              title="Segmentação de contatos interessados por Situação"
              total={dadosFiltrados?.segmentationStatus?.total || 0}
              statusAtual="Em negociação"
              segmentos={segmentationStatus.map((item) => ({
                label: presentationLabel(item.status),
                value: item.limit,
                color: item.color,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
