import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MOTIVOS_PERDA_ATENDIMENTO, SUB_MOTIVOS_PERDA_ATENDIMENTO } from "@/utils/types/motivos-perda-atendimento-enum";

interface MotivoPerda {
  motivo: string;
  quantidade: number;
  porcentagem: number;
  cor: string;
}

interface GraficoMotivosPerdasProps {
  titulo: string;
  subtitulo?: string;
  dados: MotivoPerda[];
  totalPerdas: number | undefined;
  taxaPerda: number | undefined;
  principalMotivo: MOTIVOS_PERDA_ATENDIMENTO | undefined;
  motivosDetalhados?: Array<{
    motivo: MOTIVOS_PERDA_ATENDIMENTO;
    quantidade: number;
    porcentagem: number;
  }>;
  submotivosPorMotivo?: Partial<
    Record<
      MOTIVOS_PERDA_ATENDIMENTO,
      Array<{ submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }>
    >
  >;
  submotivosDetalhados?: Array<{
    motivoPrincipal: MOTIVOS_PERDA_ATENDIMENTO;
    submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO;
    quantidade: number;
    porcentagem: number;
  }>;
  className?: string;
}

// Converte valores camelCase/underscore em rótulos legíveis, aplicando acentuação conhecida
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
    incompatível: "incompatível", // fallback caso já venha acentuado
    incompativel: "incompatível",
    documentacao: "documentação",
    doente: "doente",
    imprevisto: "imprevisto",
    imprevistos: "imprevistos",
    cidade: "cidade",
    dados: "dados",
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
    bloqueou: "bloqueou",
    retornou: "retornou",
    respondeu: "respondeu",
    mensagens: "mensagens",
    inicial: "inicial",
    outra: "outra",
    concorrencia: "concorrência",
  };
  const normalized = tokens
    .map((t, i) => {
      const lower = t.toLowerCase();
      const converted = accentMap[lower] || lower;
      // Capitaliza a primeira palavra
      if (i === 0) return converted.charAt(0).toUpperCase() + converted.slice(1);
      return converted;
    })
    .join(" ");
  return normalized;
};

const GraficoMotivosPerdas: React.FC<GraficoMotivosPerdasProps> = ({
  titulo,
  subtitulo,
  dados,
  totalPerdas,
  taxaPerda,
  principalMotivo,
  motivosDetalhados = [],
  submotivosPorMotivo = {} as Partial<Record<MOTIVOS_PERDA_ATENDIMENTO, Array<{ submotivo: SUB_MOTIVOS_PERDA_ATENDIMENTO; quantidade: number; porcentagem: number }>>>,
  submotivosDetalhados = [],
  className = "",
}) => {
  const [motivoAberto, setMotivoAberto] = useState<string | null>(null);
  const [submotivoAberto, setSubmotivoAberto] = useState<string | null>(null);

  const noData = !dados || dados.length === 0 || dados.every((d) => (d.quantidade ?? 0) === 0);
  const chartData: MotivoPerda[] = noData
    ? [{ motivo: "Sem dados", quantidade: 1, porcentagem: 100, cor: "#D1D5DB" }]
    : dados;

  const principalMotivoDisplay = noData ? "—" : formatEnumLabel(principalMotivo);
  const taxaPerdaDisplay = noData ? 0 : (taxaPerda ?? 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (noData) return null;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.motivo}</p>
          <p className="text-sm text-gray-600">
            {data.quantidade} perdas ({data.porcentagem}%)
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
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{entry.value}</span>
            </div>
            {!noData && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {dados.find((d) => d.motivo === entry.value)?.quantidade}
                </span>
                <span className="text-gray-500">
                  ({dados.find((d) => d.motivo === entry.value)?.porcentagem}%)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-auto ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
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
                dataKey="quantidade"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={noData ? "#D1D5DB" : entry.cor} />
                ))}
              </Pie>
              {!noData && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-gray-900">{noData ? 0 : totalPerdas}</div>
            <div className="text-sm text-gray-600">{noData ? "Sem perdas" : "Total de perdas"}</div>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <CustomLegend
            payload={noData ? [{ value: "Sem dados", color: "#D1D5DB" }] : dados.map((d) => ({ value: d.motivo, color: d.cor }))}
          />
        </div>
      </div>

      {/* Indicadores principais */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Principal motivo</div>
            <div className="text-sm font-medium text-red-600">
              {principalMotivoDisplay}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Taxa de perda</div>
            <div className="text-sm font-medium text-gray-900">
              {taxaPerdaDisplay}%
            </div>
          </div>
        </div>
      </div>

      {/* Seção de motivos detalhados */}
      {motivosDetalhados.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-4">
          <h4 className="text-base font-semibold text-gray-900 mb-3">
            Motivos detalhados
          </h4>

          <div className="divide-y divide-gray-100">
            {motivosDetalhados.map((motivo) => (
              <div key={motivo.motivo} className="py-2">
                <button
                  onClick={() =>
                    setMotivoAberto(
                      motivoAberto === motivo.motivo ? null : motivo.motivo
                    )
                  }
                  className="w-full flex justify-between items-center text-left"
                >
                  <div className="flex items-center gap-2">
                    {motivoAberto === motivo.motivo ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {formatEnumLabel(motivo.motivo)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex gap-2">
                    <span>{motivo.quantidade}</span>
                    <span className="text-gray-400">
                      ({motivo.porcentagem}%)
                    </span>
                  </div>
                </button>

                {/* Submotivos */}
                {motivoAberto === motivo.motivo && (
                  <div className="mt-3 pl-6 space-y-2">
                    {(submotivosPorMotivo[motivo.motivo] || []).map((sub) => (
                      <div key={sub.submotivo}>
                        <button
                          onClick={() =>
                            setSubmotivoAberto(
                              submotivoAberto === sub.submotivo
                                ? null
                                : sub.submotivo
                            )
                          }
                          className="w-full flex justify-between items-center text-left"
                        >
                          <div className="flex items-center gap-2">
                            {submotivoAberto === sub.submotivo ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-gray-800">
                              {formatEnumLabel(sub.submotivo)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 flex gap-2">
                            <span>{sub.quantidade}</span>
                            <span className="text-gray-400">
                              ({sub.porcentagem}%)
                            </span>
                          </div>
                        </button>

                        {/* Submotivos detalhados */}
                        {submotivoAberto === sub.submotivo && (
                          <div className="mt-2 pl-6 border-l border-gray-200 space-y-1">
                            {submotivosDetalhados
                              .filter(
                                (s) =>
                                  s.motivoPrincipal === motivo.motivo &&
                                  s.submotivo === sub.submotivo
                              )
                              .map((detalhe, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between text-sm text-gray-600"
                                >
                                  <span>{formatEnumLabel(detalhe.submotivo)}</span>
                                  <span>
                                    {detalhe.quantidade} (
                                    {detalhe.porcentagem}%)
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