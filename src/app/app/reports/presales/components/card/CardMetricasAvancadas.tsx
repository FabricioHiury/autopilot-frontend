import { lossReasonLabel } from '@/lib/presentation-labels';
import { presentationLabel } from '@/lib/presentation-labels';
import React from 'react';
import { IconLineUp } from '@/components/icons/icon-line-up';

interface DadosVisitas {
  agendadas: number;
  compareceram: number;
  taxaComparecimento: number;
}

interface DadosConversao {
  cold: { limit: number; conversao: number; rate: number };
  warm: { limit: number; conversao: number; rate: number };
  hot: { limit: number; conversao: number; rate: number };
}

interface MotivoPerdas {
  reason: string;
  percentage: number;
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
  className = '',
}: CardMetricasAvancadasProps) {
  const getTemperaturaColor = (type: 'COLD' | 'WARM' | 'HOT') => {
    switch (type) {
      case 'COLD':
        return '#6B7280';
      case 'WARM':
        return '#F59E0B';
      case 'HOT':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const clampPercent = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const calcularTaxa = (data: { limit: number; conversao: number; rate: number }) => {
    const taxaValida = Number.isFinite(data.rate) ? data.rate : 0;
    if (taxaValida > 0) return clampPercent(taxaValida);
    if (data.limit > 0) {
      const perc = (data.conversao / data.limit) * 100;
      return clampPercent(Math.round(perc));
    }
    return 0;
  };

  const formatEnumLabel = lossReasonLabel;

  return (
    <div
      className={`bg-white rounded-2xl p-6 h-[320px] max-h-[400px] overflow-y-auto ${className}`}
    >
      <div className="space-y-5">
        {/* Agendamentos de Visitas */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Agendamentos de Visitas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{dadosVisitas.agendadas}</div>
              <div className="text-sm text-gray-600">Visitas agendadas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{dadosVisitas.compareceram}</div>
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
          <h3 className="text-lg font-semibold text-gray-800">Conversão por Temperatura</h3>
          <div className="space-y-4">
            {Object.entries(dadosConversao).map(([temperature, data]) => {
              const taxaCalculada = calcularTaxa(
                data as { limit: number; conversao: number; rate: number },
              );
              const color = getTemperaturaColor(temperature as 'COLD' | 'WARM' | 'HOT');
              return (
                <div key={temperature} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <div className="font-medium text-gray-800 capitalize">
                        {presentationLabel(temperature)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(data as any).limit} contatos interessados
                    </div>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-3"
                    aria-label={`Conversão ${presentationLabel(temperature)}`}
                    aria-valuenow={taxaCalculada}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  >
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ width: `${taxaCalculada}%`, backgroundColor: color }}
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
            {motivosPerdas.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatEnumLabel(reason.reason)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {reason.total} ({reason.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${reason.percentage}%` }}
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
