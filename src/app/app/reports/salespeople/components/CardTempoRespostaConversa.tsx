import React from 'react';

interface CardTempoRespostaConversaProps {
  timeAverage: number | string;
  unidade?: string;
  tendencia?: 'up' | 'down';
  percentualTendencia?: string;
  meta?: number | string;
  metaUnidade?: string;
}

// Função para converter string de tempo "0h 0min" para minutos
const parseTempoString = (tempo: string | number): number => {
  if (typeof tempo === 'number') {
    return tempo;
  }

  const regex = /(\d+)h\s*(\d+)min/;
  const match = tempo.match(regex);

  if (match) {
    const horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    return horas * 60 + minutos;
  }

  const numeroTempo = parseFloat(tempo);
  return isNaN(numeroTempo) ? 0 : numeroTempo;
};

// Função para formatar tempo em minutos para string legível
const formatarTempo = (minutos: number): string => {
  if (minutos < 60) {
    return `${minutos}min`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (minutosRestantes === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${minutosRestantes}min`;
};

const CardTempoRespostaConversa: React.FC<CardTempoRespostaConversaProps> = ({
  timeAverage,
  unidade,
  tendencia,
  percentualTendencia,
  meta,
  metaUnidade,
}) => {
  const tempoMedioMinutos = parseTempoString(timeAverage);
  const metaMinutos = meta ? parseTempoString(meta) : null;

  const progressoMeta = metaMinutos ? Math.min((tempoMedioMinutos / metaMinutos) * 100, 100) : 0;
  const isWithinMeta = metaMinutos ? tempoMedioMinutos <= metaMinutos : false;

  const tempoExibido =
    typeof timeAverage === 'string' && timeAverage.includes('h')
      ? timeAverage
      : formatarTempo(tempoMedioMinutos);

  const metaExibida =
    meta && typeof meta === 'string' && meta.includes('h')
      ? meta
      : metaMinutos
        ? formatarTempo(metaMinutos)
        : meta;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">Tempo médio de resposta</h3>
        {tendencia && (
          <div
            className={`flex items-center gap-1 ${tendencia === 'down' ? 'text-green-600' : 'text-red-600'}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform ${tendencia === 'down' ? 'rotate-180' : ''}`}
            >
              <path d="M7 14l5-5 5 5z" fill="currentColor" />
            </svg>
            <span className="text-xs font-medium">{percentualTendencia}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-gray-900">{tempoExibido}</span>
        {unidade && <span className="text-sm text-gray-500">{unidade}</span>}
      </div>

      {/* <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Performance e Meta</span>
          {isWithinMeta && <span className={`text-xs font-medium ${isWithinMeta ? 'text-green-600' : 'text-red-600'}`}>
            {isWithinMeta ? 'Dentro da meta' : 'Acima da meta'}
          </span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          {isWithinMeta && <div
            className={`h-2 rounded-full transition-all duration-300 ${isWithinMeta ? 'bg-green-500' : 'bg-red-500'
              }`}
            style={{ width: `${Math.min(progressoMeta, 100)}%` }}
          />}
        </div>
      </div> */}

      {meta && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Meta: {metaExibida} {metaUnidade || ''}
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${isWithinMeta ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>{isWithinMeta ? 'Atingida' : 'Não atingida'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardTempoRespostaConversa;
