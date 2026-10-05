import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DealLossReason, DealLossSubReason } from '@/types/deal-loss';

interface MotivoPerda {
  reason: string;
  limit: number;
  percentage: number;
  color: string;
}

interface GraficoMotivosPerdasProps {
  title: string;
  subtitulo?: string;
  data: MotivoPerda[];
  totalLosses: number | undefined;
  rateLoss: number | undefined;
  primaryReason: DealLossReason | undefined;
  reasonsDetailed?: Array<{
    reason: DealLossReason;
    limit: number;
    percentage: number;
  }>;
  subReasonsByReason?: Partial<
    Record<
      DealLossReason,
      Array<{ subReason: DealLossSubReason; limit: number; percentage: number }>
    >
  >;
  subReasonsDetailed?: Array<{
    reasonPrimary: DealLossReason;
    subReason: DealLossSubReason;
    limit: number;
    percentage: number;
  }>;
  className?: string;
}

// Converte valores camelCase/underscore em rótulos legíveis, aplicando acentuação conhecida
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
    incompatível: 'incompatível', // fallback caso já venha acentuado
    incompativel: 'incompatível',
    documentacao: 'documentação',
    doente: 'doente',
    imprevisto: 'imprevisto',
    imprevistos: 'imprevistos',
    city: 'city',
    data: 'data',
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
    bloqueou: 'bloqueou',
    retornou: 'retornou',
    respondeu: 'respondeu',
    messages: 'messages',
    initial: 'initial',
    outra: 'outra',
    competition: 'concorrência',
  };
  const normalized = tokens
    .map((t, i) => {
      const lower = t.toLowerCase();
      const converted = accentMap[lower] || lower;
      // Capitaliza a primeira palavra
      if (i === 0) return converted.charAt(0).toUpperCase() + converted.slice(1);
      return converted;
    })
    .join(' ');
  return normalized;
};

const GraficoMotivosPerdas: React.FC<GraficoMotivosPerdasProps> = ({
  title,
  subtitulo,
  data,
  totalLosses,
  rateLoss,
  primaryReason,
  reasonsDetailed = [],
  subReasonsByReason = {} as Partial<
    Record<
      DealLossReason,
      Array<{ subReason: DealLossSubReason; limit: number; percentage: number }>
    >
  >,
  subReasonsDetailed = [],
  className = '',
}) => {
  const [motivoAberto, setMotivoAberto] = useState<string | null>(null);
  const [submotivoAberto, setSubmotivoAberto] = useState<string | null>(null);

  const noData = !data || data.length === 0 || data.every((d) => (d.limit ?? 0) === 0);
  const chartData: MotivoPerda[] = noData
    ? [{ reason: 'Sem dados', limit: 1, percentage: 100, color: '#D1D5DB' }]
    : data;

  const principalMotivoDisplay = noData ? '—' : formatEnumLabel(primaryReason);
  const taxaPerdaDisplay = noData ? 0 : (rateLoss ?? 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (noData) return null;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.reason}</p>
          <p className="text-sm text-gray-600">
            {data.limit} perdas ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4 space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{entry.value}</span>
            </div>
            {!noData && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {data.find((d) => d.reason === entry.value)?.limit}
                </span>
                <span className="text-gray-500">
                  ({data.find((d) => d.reason === entry.value)?.percentage}%)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-auto ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitulo && <p className="text-sm text-gray-600 mt-1">{subtitulo}</p>}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="limit"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={noData ? '#D1D5DB' : entry.color} />
                ))}
              </Pie>
              {!noData && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-gray-900">{noData ? 0 : totalLosses}</div>
            <div className="text-sm text-gray-600">{noData ? 'Sem perdas' : 'Total de perdas'}</div>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <CustomLegend
            payload={
              noData
                ? [{ value: 'Sem dados', color: '#D1D5DB' }]
                : data.map((d) => ({ value: d.reason, color: d.color }))
            }
          />
        </div>
      </div>

      {/* Indicadores principais */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Principal motivo</div>
            <div className="text-sm font-medium text-red-600">{principalMotivoDisplay}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Taxa de perda</div>
            <div className="text-sm font-medium text-gray-900">{taxaPerdaDisplay}%</div>
          </div>
        </div>
      </div>

      {/* Seção de motivos detalhados */}
      {reasonsDetailed.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-4">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Motivos detalhados</h4>

          <div className="divide-y divide-gray-100">
            {reasonsDetailed.map((reason) => (
              <div key={reason.reason} className="py-2">
                <button
                  onClick={() =>
                    setMotivoAberto(motivoAberto === reason.reason ? null : reason.reason)
                  }
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="flex items-center gap-2">
                    {motivoAberto === reason.reason ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {formatEnumLabel(reason.reason)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex gap-2">
                    <span>{reason.limit}</span>
                    <span className="text-gray-400">({reason.percentage}%)</span>
                  </div>
                </button>

                {/* Submotivos */}
                {motivoAberto === reason.reason && (
                  <div className="mt-3 pl-6 space-y-2">
                    {(subReasonsByReason[reason.reason] || []).map((sub) => (
                      <div key={sub.subReason}>
                        <button
                          onClick={() =>
                            setSubmotivoAberto(
                              submotivoAberto === sub.subReason ? null : sub.subReason,
                            )
                          }
                          className="w-full flex justify-between items-center text-left"
                        >
                          <div className="flex items-center gap-2">
                            {submotivoAberto === sub.subReason ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-gray-800">{formatEnumLabel(sub.subReason)}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex gap-2">
                            <span>{sub.limit}</span>
                            <span className="text-gray-400">({sub.percentage}%)</span>
                          </div>
                        </button>

                        {/* Submotivos detalhados */}
                        {submotivoAberto === sub.subReason && (
                          <div className="mt-2 pl-6 border-l border-gray-200 space-y-1">
                            {subReasonsDetailed
                              .filter(
                                (s) =>
                                  s.reasonPrimary === reason.reason &&
                                  s.subReason === sub.subReason,
                              )
                              .map((detalhe, i) => (
                                <div key={i} className="flex justify-between text-sm text-gray-600">
                                  <span>{formatEnumLabel(detalhe.subReason)}</span>
                                  <span>
                                    {detalhe.limit} ({detalhe.percentage}%)
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficoMotivosPerdas;
