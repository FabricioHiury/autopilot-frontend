'use client';

import { AppServices } from '@/services/app.services';
import { Highlight, ChannelReports, ChannelReport, Ranking } from '@/types/channel-report';
import { useEffect, useMemo, useState } from 'react';
import {
  AtendimentoCanalData,
  AtendimentoCanalTable,
} from '@/components/table/AtendimentoCanalTable';
import toast from 'react-hot-toast';
import Reports from '@/components/reports/Reports';
import CanaisAtendimento from './components/canais-atendimento/CanaisAtendimento';
import CardQualificacao from '@/components/cards/CardQualificacao';
import DestaqueMensais from '@/components/cards/DestaqueMensais';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import RankingCanais from './components/ranking-canais/RankingCanais';

interface RelatorioAtendimentosPorCanalProps {
  dataStart: string;
  dataEnd: string;
  mode?: 'total' | 'BUY' | 'SELL' | 'CONSIGNMENT';
  employeeId?: string;
}

export default function RelatorioAtendimentosPorCanal({
  dataStart,
  dataEnd,
  mode = 'total',
  employeeId,
}: RelatorioAtendimentosPorCanalProps) {
  const api = useMemo(() => new AppServices(), []);
  const [relatorioAtendimentoCanal, setRelatorioAtendimentoCanal] = useState<ChannelReports>();
  const [channels, setCanais] = useState<any>([]);
  const [conversaoVendaCanal, setConversaoVendaCanal] = useState<any>([]);
  const [highlights, setDestaques] = useState<Highlight>();
  const [atendimentoPorCanal, setAtendimentoPorCanal] = useState<AtendimentoCanalData[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeRelatorioCanais = (
    raw: any,
    modoSel?: 'total' | 'BUY' | 'SELL' | 'CONSIGNMENT',
  ): ChannelReports | undefined => {
    try {
      if (Array.isArray(raw)) {
        const item = raw.find((it: any) => it?.mode === modoSel);
        if (!item || !Array.isArray(item.channels)) return undefined;
        const channels: ChannelReport[] = item.channels.map((c: any) => {
          const leadsTotal = c?.leadsTotal ?? c?.leads ?? 0;
          const conversions = c?.conversions ?? 0;
          const rateConversion =
            c?.rateConversion ?? (leadsTotal > 0 ? (conversions / leadsTotal) * 100 : 0);
          return {
            channel: c?.channel ?? c?.nameDisplay?.toLowerCase() ?? '',
            nameDisplay: c?.nameDisplay ?? c?.channel ?? '',
            iconUrl: c?.iconUrl ?? '',
            leadsTotal,
            conversions,
            rateConversion,
            summaryDay: c?.summaryDay ?? undefined,
            seriesHistorical: c?.seriesHistorical ?? undefined,
          };
        });
        const totalLeads = channels.reduce((sum, c) => sum + (c.leadsTotal || 0), 0);
        const totalConversions = channels.reduce((sum, c) => sum + (c.conversions || 0), 0);
        const averageConversionGeneral = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
        const rankConversas = [...channels]
          .sort((a, b) => b.conversions - a.conversions)
          .map((c, i) => ({
            channel: c.channel,
            nameDisplay: c.nameDisplay,
            value: c.conversions,
            position: i + 1,
          }));
        const rankLeads = [...channels]
          .sort((a, b) => b.leadsTotal - a.leadsTotal)
          .map((c, i) => ({
            channel: c.channel,
            nameDisplay: c.nameDisplay,
            value: c.leadsTotal,
            position: i + 1,
          }));
        const ranking = { byConversations: rankConversas, byLeads: rankLeads };
        const destaquesArr = [
          {
            byConversations: rankConversas.slice(0, 3).map((rc) => ({
              channel: rc.channel,
              nameDisplay: rc.nameDisplay,
              value: rc.value,
              rank: rc.position,
            })),
            byLeads: rankLeads.slice(0, 3).map((rl) => ({
              channel: rl.channel,
              nameDisplay: rl.nameDisplay,
              value: rl.value,
              rank: rl.position,
            })),
          },
        ];
        return {
          channels,
          averageConversionGeneral,
          totalConversions,
          totalLeads,
          highlights: destaquesArr,
          ranking,
        };
      }
      // Já está no formato esperado; garante totais e ranking se ausentes
      if (raw && Array.isArray(raw.channels)) {
        const channels: ChannelReport[] = raw.channels.map((c: any) => ({
          channel: c?.channel,
          nameDisplay: c?.nameDisplay,
          iconUrl: c?.iconUrl,
          leadsTotal: c?.leadsTotal ?? 0,
          conversions: c?.conversions ?? 0,
          rateConversion:
            c?.rateConversion ?? (c?.leadsTotal > 0 ? (c?.conversions / c?.leadsTotal) * 100 : 0),
          summaryDay: c?.summaryDay,
          seriesHistorical: c?.seriesHistorical,
        }));
        const totalLeads =
          raw.totalLeads ?? channels.reduce((sum, c) => sum + (c.leadsTotal || 0), 0);
        const totalConversions =
          raw.totalConversions ?? channels.reduce((sum, c) => sum + (c.conversions || 0), 0);
        const averageConversionGeneral =
          raw.averageConversionGeneral ??
          (totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0);
        const rankConversas =
          raw?.ranking?.byConversations ??
          [...channels]
            .sort((a, b) => b.conversions - a.conversions)
            .map((c, i) => ({
              channel: c.channel,
              nameDisplay: c.nameDisplay,
              value: c.conversions,
              position: i + 1,
            }));
        const rankLeads =
          raw?.ranking?.byLeads ??
          [...channels]
            .sort((a, b) => b.leadsTotal - a.leadsTotal)
            .map((c, i) => ({
              channel: c.channel,
              nameDisplay: c.nameDisplay,
              value: c.leadsTotal,
              position: i + 1,
            }));
        const ranking = { byConversations: rankConversas, byLeads: rankLeads };
        const destaquesArr = Array.isArray(raw.highlights)
          ? raw.highlights
          : raw.highlights
            ? [raw.highlights]
            : [];
        return {
          channels,
          averageConversionGeneral,
          totalConversions,
          totalLeads,
          highlights: destaquesArr,
          ranking,
        };
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    listReportDealChannel();
  }, [dataStart, dataEnd, employeeId, mode]);

  useEffect(() => {
    preencherCanais();
    preencherLeadsConversaoVenda();
    preencherDestaques();
    preencherAtendimentoPorCanal();
  }, [relatorioAtendimentoCanal]);

  const listReportDealChannel = async () => {
    setLoading(true);
    try {
      const response = await api.reports.listDealChannel(dataStart, dataEnd, employeeId);
      if (response) {
        const raw: any = response as any;
        let selected: any = null;

        if (Array.isArray(raw)) {
          const modoLower = (mode || 'total').toLowerCase();
          selected = raw.find((r: any) => (r?.mode || '') === modoLower) || raw[0] || {};
        } else {
          selected = raw;
        }

        const canaisSelecionados: ChannelReport[] = Array.isArray(selected?.channels)
          ? selected.channels
          : Array.isArray(raw?.channels)
            ? raw.channels
            : [];

        // Agregados calculados se não vierem prontos
        const totalLeads = canaisSelecionados.reduce(
          (sum, c) => sum + Number(c?.leadsTotal || 0),
          0,
        );
        const totalConversions = canaisSelecionados.reduce(
          (sum, c) => sum + Number(c?.conversions || 0),
          0,
        );
        const averageConversionGeneral = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

        const ranking: Ranking = {
          byLeads: canaisSelecionados
            .map((c) => ({
              channel: c.channel,
              nameDisplay: c.nameDisplay,
              value: Number(c.leadsTotal || 0),
              position: 0,
            }))
            .sort((a, b) => b.value - a.value)
            .map((item, idx) => ({ ...item, position: idx + 1 })),
          byConversations: canaisSelecionados
            .map((c) => ({
              channel: c.channel,
              nameDisplay: c.nameDisplay,
              value: Number(c.conversions || 0),
              position: 0,
            }))
            .sort((a, b) => b.value - a.value)
            .map((item, idx) => ({ ...item, position: idx + 1 })),
        };

        const destaquesCalc: Highlight[] = [
          {
            byLeads: ranking.byLeads.slice(0, 3).map((i) => ({
              channel: i.channel,
              nameDisplay: i.nameDisplay,
              value: i.value,
              rank: i.position,
            })),
            byConversations: ranking.byConversations.slice(0, 3).map((i) => ({
              channel: i.channel,
              nameDisplay: i.nameDisplay,
              value: i.value,
              rank: i.position,
            })),
          },
        ];

        const relatorioNormalizado: ChannelReports = {
          channels: canaisSelecionados,
          averageConversionGeneral:
            typeof selected?.averageConversionGeneral === 'number'
              ? selected.averageConversionGeneral
              : averageConversionGeneral,
          totalConversions:
            typeof selected?.totalConversions === 'number'
              ? selected.totalConversions
              : totalConversions,
          totalLeads: typeof selected?.totalLeads === 'number' ? selected.totalLeads : totalLeads,
          highlights: Array.isArray(selected?.highlights) ? selected.highlights : destaquesCalc,
          ranking: selected?.ranking || ranking,
        };

        setRelatorioAtendimentoCanal(relatorioNormalizado);
      } else {
        toast.error('Não foi possível listar o relatório de atendimentos por canal');
      }
    } catch (error) {
      toast.error('Erro ao carregar relatório de atendimentos por canal');
    } finally {
      setLoading(false);
    }
  };

  const preencherCanais = () => {
    if (relatorioAtendimentoCanal?.channels) {
      setCanais(
        relatorioAtendimentoCanal.channels.map((item) => {
          const { summaryDay, seriesHistorical, ...rest } = item;
          return {
            ...rest,
          };
        }),
      );
    }
  };

  const preencherLeadsConversaoVenda = () => {
    if (relatorioAtendimentoCanal?.channels) {
      setConversaoVendaCanal(
        relatorioAtendimentoCanal.channels.map((item) => ({
          channel: item.nameDisplay,
          leads: item.leadsTotal,
          conversions: item.conversions,
          taxaConv: item.rateConversion,
        })),
      );
    }
  };

  const preencherDestaques = () => {
    const d = relatorioAtendimentoCanal?.highlights as any;
    if (d) {
      const normalizado: Highlight | undefined = Array.isArray(d) ? d[0] : d;
      setDestaques(normalizado);
    }
  };

  const preencherAtendimentoPorCanal = () => {
    if (relatorioAtendimentoCanal?.channels) {
      setAtendimentoPorCanal(
        relatorioAtendimentoCanal.channels.map((item) => ({
          channel: item.nameDisplay,
          nameDisplay: item.nameDisplay,
          leadsTotal: item.leadsTotal,
          conversions: item.conversions,
          rateConversion: item.rateConversion,
        })),
      );
    }
  };

  if (loading) {
    return <LoadingGlobal />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-6">
          <CanaisAtendimento
            className="h-full"
            channels={channels}
            totalLeads={relatorioAtendimentoCanal?.totalLeads || 0}
            totalConversions={relatorioAtendimentoCanal?.totalConversions || 0}
          />
        </div>

        <div className="xl:col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <CardQualificacao
              className="h-full  w-full"
              type="unitario"
              title="Taxa Média de Conversão"
              subtitulo=""
              percentage={relatorioAtendimentoCanal?.averageConversionGeneral?.toFixed(2)}
              conversions={relatorioAtendimentoCanal?.totalConversions || 0}
              salespeople={relatorioAtendimentoCanal?.totalLeads || 0}
            />

            <RankingCanais
              className="h-full w-full"
              ranking={relatorioAtendimentoCanal?.ranking}
              taxaMedia={relatorioAtendimentoCanal?.averageConversionGeneral}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
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

        <div className="xl:col-span-12">
          {highlights && <DestaqueMensais data={highlights} mostrarConversoes />}
        </div>
      </div>

      <AtendimentoCanalTable data={atendimentoPorCanal} />
    </div>
  );
}
