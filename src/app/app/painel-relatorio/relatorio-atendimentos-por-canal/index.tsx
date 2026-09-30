"use client"

import { ApiApp } from "@/lib/api-app";
import { Destaque, RelatorioCanais, RelatorioAtendimentoCanal, Ranking } from "@/model/relatorio-atendimento-canal";
import { useEffect, useMemo, useState } from "react";
import { AtendimentoCanalData, AtendimentoCanalTable } from "@/components/table/AtendimentoCanalTable";
import toast from "react-hot-toast";
import Reports from "@/components/reports/Reports";
import CanaisAtendimento from "./components/canais-atendimento/CanaisAtendimento";
import CardQualificacao from "@/components/cards/CardQualificacao";
import DestaqueMensais from "@/components/cards/DestaqueMensais";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import RankingCanais from "./components/ranking-canais/RankingCanais";

interface RelatorioAtendimentosPorCanalProps {
  dataInicio: string;
  dataFim: string;
  modo?: "total" | "compra" | "venda" | "consignado";
  idColaborador?: string;
}

export default function RelatorioAtendimentosPorCanal({ dataInicio, dataFim, modo = "total", idColaborador }: RelatorioAtendimentosPorCanalProps) {
  const api = useMemo(() => new ApiApp(), []);
  const [relatorioAtendimentoCanal, setRelatorioAtendimentoCanal] = useState<RelatorioCanais>();
  const [canais, setCanais] = useState<any>([]);
  const [conversaoVendaCanal, setConversaoVendaCanal] = useState<any>([]);
  const [destaques, setDestaques] = useState<Destaque>();
  const [atendimentoPorCanal, setAtendimentoPorCanal] = useState<AtendimentoCanalData[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeRelatorioCanais = (raw: any, modoSel?: "total" | "compra" | "venda" | "consignado"): RelatorioCanais | undefined => {
    try {
      if (Array.isArray(raw)) {
        const item =raw.find((it: any) => it?.modo === modoSel);
        if (!item || !Array.isArray(item.canais)) return undefined;
        const canais: RelatorioAtendimentoCanal[] = item.canais.map((c: any) => {
          const leadsTotal = c?.leadsTotal ?? c?.leads ?? 0;
          const conversoes = c?.conversoes ?? 0;
          const taxaConversao = c?.taxaConversao ?? (leadsTotal > 0 ? (conversoes / leadsTotal) * 100 : 0);
          return {
            canal: c?.canal ?? c?.nomeExibicao?.toLowerCase() ?? "",
            nomeExibicao: c?.nomeExibicao ?? c?.canal ?? "",
            iconeUrl: c?.iconeUrl ?? "",
            leadsTotal,
            conversoes,
            taxaConversao,
            resumoDia: c?.resumoDia ?? undefined,
            serieHistorica: c?.serieHistorica ?? undefined,
          };
        });
        const totalLeads = canais.reduce((sum, c) => sum + (c.leadsTotal || 0), 0);
        const totalConversoes = canais.reduce((sum, c) => sum + (c.conversoes || 0), 0);
        const mediaConversaoGeral = totalLeads > 0 ? (totalConversoes / totalLeads) * 100 : 0;
        const rankConversas = [...canais]
          .sort((a, b) => b.conversoes - a.conversoes)
          .map((c, i) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: c.conversoes, posicao: i + 1 }));
        const rankLeads = [...canais]
          .sort((a, b) => b.leadsTotal - a.leadsTotal)
          .map((c, i) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: c.leadsTotal, posicao: i + 1 }));
        const ranking = { porConversas: rankConversas, porLeads: rankLeads };
        const destaquesArr = [{
          porConversas: rankConversas.slice(0, 3).map((rc) => ({ canal: rc.canal, nomeExibicao: rc.nomeExibicao, valor: rc.valor, rank: rc.posicao })),
          porLeads: rankLeads.slice(0, 3).map((rl) => ({ canal: rl.canal, nomeExibicao: rl.nomeExibicao, valor: rl.valor, rank: rl.posicao })),
        }];
        return { canais, mediaConversaoGeral, totalConversoes, totalLeads, destaques: destaquesArr, ranking };
      }
      // Já está no formato esperado; garante totais e ranking se ausentes
      if (raw && Array.isArray(raw.canais)) {
        const canais: RelatorioAtendimentoCanal[] = raw.canais.map((c: any) => ({
          canal: c?.canal,
          nomeExibicao: c?.nomeExibicao,
          iconeUrl: c?.iconeUrl,
          leadsTotal: c?.leadsTotal ?? 0,
          conversoes: c?.conversoes ?? 0,
          taxaConversao: c?.taxaConversao ?? (c?.leadsTotal > 0 ? (c?.conversoes / c?.leadsTotal) * 100 : 0),
          resumoDia: c?.resumoDia,
          serieHistorica: c?.serieHistorica,
        }));
        const totalLeads = raw.totalLeads ?? canais.reduce((sum, c) => sum + (c.leadsTotal || 0), 0);
        const totalConversoes = raw.totalConversoes ?? canais.reduce((sum, c) => sum + (c.conversoes || 0), 0);
        const mediaConversaoGeral = raw.mediaConversaoGeral ?? (totalLeads > 0 ? (totalConversoes / totalLeads) * 100 : 0);
        const rankConversas = raw?.ranking?.porConversas ?? [...canais]
          .sort((a, b) => b.conversoes - a.conversoes)
          .map((c, i) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: c.conversoes, posicao: i + 1 }));
        const rankLeads = raw?.ranking?.porLeads ?? [...canais]
          .sort((a, b) => b.leadsTotal - a.leadsTotal)
          .map((c, i) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: c.leadsTotal, posicao: i + 1 }));
        const ranking = { porConversas: rankConversas, porLeads: rankLeads };
        const destaquesArr = Array.isArray(raw.destaques) ? raw.destaques : raw.destaques ? [raw.destaques] : [];
        return { canais, mediaConversaoGeral, totalConversoes, totalLeads, destaques: destaquesArr, ranking };
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    listarRelatorioAtendimentoCanal();
  }, [dataInicio, dataFim, idColaborador, modo]);

  useEffect(() => {
    preencherCanais();
    preencherLeadsConversaoVenda();
    preencherDestaques();
    preencherAtendimentoPorCanal();
  }, [relatorioAtendimentoCanal])

  const listarRelatorioAtendimentoCanal = async () => {
    setLoading(true);
    try {
      const response = await api.relatorio.listarAtendimentoCanal(dataInicio, dataFim, idColaborador);
      if (response) {
        const raw: any = response as any;
        let selected: any = null;

        if (Array.isArray(raw)) {
          const modoLower = (modo || "total").toLowerCase();
          selected = raw.find((r: any) => (r?.modo || "").toLowerCase() === modoLower) || raw[0] || {};
        } else {
          selected = raw;
        }

        const canaisSelecionados: RelatorioAtendimentoCanal[] = Array.isArray(selected?.canais)
          ? selected.canais
          : Array.isArray(raw?.canais)
            ? raw.canais
            : [];

        // Agregados calculados se não vierem prontos
        const totalLeads = canaisSelecionados.reduce((sum, c) => sum + Number(c?.leadsTotal || 0), 0);
        const totalConversoes = canaisSelecionados.reduce((sum, c) => sum + Number(c?.conversoes || 0), 0);
        const mediaConversaoGeral = totalLeads > 0 ? (totalConversoes / totalLeads) * 100 : 0;

        const ranking: Ranking = {
          porLeads: canaisSelecionados
            .map((c) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: Number(c.leadsTotal || 0), posicao: 0 }))
            .sort((a, b) => b.valor - a.valor)
            .map((item, idx) => ({ ...item, posicao: idx + 1 })),
          porConversas: canaisSelecionados
            .map((c) => ({ canal: c.canal, nomeExibicao: c.nomeExibicao, valor: Number(c.conversoes || 0), posicao: 0 }))
            .sort((a, b) => b.valor - a.valor)
            .map((item, idx) => ({ ...item, posicao: idx + 1 })),
        };

        const destaquesCalc: Destaque[] = [{
          porLeads: ranking.porLeads.slice(0, 3).map((i) => ({ canal: i.canal, nomeExibicao: i.nomeExibicao, valor: i.valor, rank: i.posicao })),
          porConversas: ranking.porConversas.slice(0, 3).map((i) => ({ canal: i.canal, nomeExibicao: i.nomeExibicao, valor: i.valor, rank: i.posicao })),
        }];

        const relatorioNormalizado: RelatorioCanais = {
          canais: canaisSelecionados,
          mediaConversaoGeral: typeof selected?.mediaConversaoGeral === 'number' ? selected.mediaConversaoGeral : mediaConversaoGeral,
          totalConversoes: typeof selected?.totalConversoes === 'number' ? selected.totalConversoes : totalConversoes,
          totalLeads: typeof selected?.totalLeads === 'number' ? selected.totalLeads : totalLeads,
          destaques: Array.isArray(selected?.destaques) ? selected.destaques : destaquesCalc,
          ranking: selected?.ranking || ranking,
        };

        setRelatorioAtendimentoCanal(relatorioNormalizado);
      } else {
        toast.error("Não foi possível listar o relatório de atendimentos por canal");
      }
    } catch (error) {
      toast.error("Erro ao carregar relatório de atendimentos por canal");
    } finally {
      setLoading(false);
    }
  }

  const preencherCanais = () => {
    if (relatorioAtendimentoCanal?.canais) {
      setCanais(relatorioAtendimentoCanal.canais.map((item) => {
        const { resumoDia, serieHistorica, ...rest } = item;
        return {
          ...rest,
        }
      }));
    }
  }

  const preencherLeadsConversaoVenda = () => {
    if (relatorioAtendimentoCanal?.canais) {
      setConversaoVendaCanal(relatorioAtendimentoCanal.canais.map(item => ({
        canal: item.nomeExibicao,
        leads: item.leadsTotal,
        conversoes: item.conversoes,
        taxaConv: item.taxaConversao,
      })))
    }
  }

  const preencherDestaques = () => {
    const d = relatorioAtendimentoCanal?.destaques as any;
    if (d) {
      const normalizado: Destaque | undefined = Array.isArray(d) ? d[0] : d;
      setDestaques(normalizado);
    }
  }

  const preencherAtendimentoPorCanal = () => {
    if (relatorioAtendimentoCanal?.canais) {
      setAtendimentoPorCanal(relatorioAtendimentoCanal.canais.map(item => ({
        canal: item.nomeExibicao,
        nomeExibicao: item.nomeExibicao,
        leadsTotal: item.leadsTotal,
        conversoes: item.conversoes,
        taxaConversao: item.taxaConversao,
      })))
    }
  }

  if (loading) {
    return <LoadingGlobal />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-6">
          <CanaisAtendimento
            className="h-full"
            canais={canais}
            totalLeads={relatorioAtendimentoCanal?.totalLeads || 0}
            totalConversoes={relatorioAtendimentoCanal?.totalConversoes || 0}
          />
        </div>

        <div className="xl:col-span-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <CardQualificacao
              className="h-full  w-full"
              tipo="unitario"
              titulo="Taxa Média de Conversão"
              subtitulo=""
              porcentagem={relatorioAtendimentoCanal?.mediaConversaoGeral?.toFixed(2)}
              conversoes={relatorioAtendimentoCanal?.totalConversoes || 0}
              vendedores={relatorioAtendimentoCanal?.totalLeads || 0}
            />

            <RankingCanais
              className="h-full w-full"
              ranking={relatorioAtendimentoCanal?.ranking}
              taxaMedia={relatorioAtendimentoCanal?.mediaConversaoGeral}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
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

        <div className="xl:col-span-12">
          {destaques && (
            <DestaqueMensais dados={destaques} mostrarConversoes />
          )}
        </div>
      </div>

      <AtendimentoCanalTable data={atendimentoPorCanal} />
    </div>
  );
}