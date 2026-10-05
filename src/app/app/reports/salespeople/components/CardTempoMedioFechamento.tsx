import React from 'react';

interface CardTempoMedioFechamentoProps {
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

  // Regex para capturar horas e minutos do formato "0h 0min"
  const regex = /(\d+)h\s*(\d+)min/;
  const match = tempo.match(regex);

  if (match) {
    const horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    return horas * 60 + minutos;
  }

  // Se não conseguir fazer parse, tenta converter diretamente para número
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

const CardTempoMedioFechamento: React.FC<CardTempoMedioFechamentoProps> = ({
  timeAverage,
  unidade,
  tendencia,
  percentualTendencia,
  meta,
  metaUnidade,
}) => {
  // Converte tempoMedio para minutos para cálculos
  const tempoMedioMinutos = parseTempoString(timeAverage);
  const metaMinutos = meta ? parseTempoString(meta) : null;

  // Calcula progresso e performance
  const progressoMeta = metaMinutos ? Math.min((tempoMedioMinutos / metaMinutos) * 100, 100) : 0;
  const isWithinMeta = metaMinutos ? tempoMedioMinutos <= metaMinutos : false;

  // Determina como exibir o tempo
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
        <h3 className="text-sm font-medium text-gray-600">Tempo médio até o fechamento</h3>
        {tendencia && (
          <div
            className={`flex items-center gap-1 ${tendencia === 'up' ? 'text-green-600' : 'text-red-600'}`}
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

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{tempoExibido}</span>
        {unidade && <span className="text-sm text-gray-500">{unidade}</span>}
      </div>

      {/* <div className="mt-4 bg-gray-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            metaMinutos 
              ? (isWithinMeta ? 'bg-green-500' : 'bg-red-500')
              : 'bg-blue-500'
          }`}
          style={{ width: `${metaMinutos ? progressoMeta : 65}%` }}
        />
      </div> */}

      {meta && (
        <div className="mt-2 text-xs text-gray-500">
          Meta: {metaExibida} {metaUnidade || ''}
        </div>
      )}
    </div>
  );
};

export default CardTempoMedioFechamento;
