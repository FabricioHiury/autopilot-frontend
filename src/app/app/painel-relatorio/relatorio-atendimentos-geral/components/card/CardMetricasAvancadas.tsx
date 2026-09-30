import React from 'react';
import { IconLineUp } from '@/components/icons/icon-line-up';

interface DadosVisitas {
  agendadas: number;
  compareceram: number;
  taxaComparecimento: number;
}

interface DadosConversao {
  frio: { quantidade: number; conversao: number, taxa:number };
  morno: { quantidade: number; conversao: number, taxa:number };
  quente: { quantidade: number; conversao: number, taxa:number };
}

interface MotivoPerdas {
  motivo: string;
  porcentagem: number;
  total: number;
}

interface CardMetricasAvancadasProps {
  dadosVisitas: DadosVisitas;
  dadosConversao: DadosConversao;
  motivosPerdas: MotivoPerdas[];
  className?: string;
}

export default function CardMetricasAvancadas({
  dadosVisitas,
  dadosConversao,
  motivosPerdas,
  className = ""
}: CardMetricasAvancadasProps) {

  const getTemperaturaColor = (tipo: 'frio' | 'morno' | 'quente') => {
    switch (tipo) {
      case 'frio': return '#6B7280';
      case 'morno': return '#F59E0B';
      case 'quente': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const clampPercent = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const calcularTaxa = (dados: { quantidade: number; conversao: number; taxa: number }) => {
    const taxaValida = Number.isFinite(dados.taxa) ? dados.taxa : 0;
    if (taxaValida > 0) return clampPercent(taxaValida);
    if (dados.quantidade > 0) {
      const perc = (dados.conversao / dados.quantidade) * 100;
      return clampPercent(Math.round(perc));
    }
    return 0;
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
      bloqueou: "bloqueou",
      retornou: "retornou",
      respondeu: "respondeu",
      mensagens: "mensagens",
      inicial: "inicial",
      outra: "outra"
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

  return (
    <div className={`bg-white rounded-2xl p-6 h-[320px] max-h-[400px] overflow-y-auto ${className}`}>
      <div className="space-y-5">
      {/* Agendamentos de Visitas */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Agendamentos de Visitas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">
              {dadosVisitas.agendadas}
            </div>
            <div className="text-sm text-gray-600">Visitas agendadas</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">
              {dadosVisitas.compareceram}
            </div>
            <div className="text-sm text-gray-600">Compareceram</div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
          <div>
            <div className="text-lg font-semibold text-green-700">
              {dadosVisitas.taxaComparecimento}%
            </div>
            <div className="text-sm text-green-600">Taxa de comparecimento</div>
          </div>
          <div className="text-green-600">
            <IconLineUp />
          </div>
        </div>
      </div>

      {/* Conversão por Temperatura */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Conversão por Temperatura
        </h3>
        <div className="space-y-4">
          {Object.entries(dadosConversao).map(([temperatura, dados]) => {
            const taxaCalculada = calcularTaxa(dados as { quantidade: number; conversao: number; taxa: number });
            const cor = getTemperaturaColor(temperatura as 'frio' | 'morno' | 'quente');
            return (
              <div key={temperatura} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
                    <div className="font-medium text-gray-800 capitalize">{temperatura}</div>
                  </div>
                  <div className="text-sm text-gray-600">{(dados as any).quantidade} leads</div>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-3"
                  aria-label={`Conversão ${temperatura}`}
                  aria-valuenow={taxaCalculada}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                >
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ width: `${taxaCalculada}%`, backgroundColor: cor }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">conversão</span>
                  <span className="text-sm font-semibold text-gray-800">{taxaCalculada}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivos de Perda */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Motivos de Perda do Pré-atendimento
        </h3>
        <div className="space-y-3">
          {motivosPerdas.map((motivo, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {formatEnumLabel(motivo.motivo)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {motivo.total} ({motivo.porcentagem}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${motivo.porcentagem}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}