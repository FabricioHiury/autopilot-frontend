import React from 'react';

interface CardTempoMedioRespostaProps {
  title: string;
  subtitulo: string;
  tempo: string;
  period: string;
}

export default function CardTempoMedioResposta({
  title,
  subtitulo,
  tempo,
  period,
}: CardTempoMedioRespostaProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 w-full">
      <div className="space-y-3 sm:space-y-4">
        {/* Cabeçalho */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-sm sm:text-lg font-semibold text-gray-900">{subtitulo}</p>
        </div>

        {/* Tempo principal */}
        <div className="text-center">
          <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{tempo}</div>
          <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">{period}</div>
        </div>
      </div>
    </div>
  );
}
