import React from 'react';

interface CardMetricaProps {
  icone: React.ReactNode;
  titulo: string;
  valor: number | undefined;
  unidade?: string;
  iconesTendencia: React.ReactNode;
  percentual?: number | string;
}

export default function CardMetrica({ icone, titulo, valor, unidade, iconesTendencia, percentual }: CardMetricaProps) {
  return (
    <div className="bg-white rounded-2xl p-5 flex-1 shadow-md border border-gray-100 flex items-center justify-between">
      <div className="flex items-center justify-between flex-1 gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0f1522] rounded-lg flex items-center justify-center">
            {icone}
          </div>
          <div>
            <p className="text-xs text-gray-600">{titulo}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {valor?.toLocaleString()} {unidade && <span className="text-sm font-normal">{unidade}</span>}
              </p>
              {percentual && <div className="w-[41px] h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-xs">
                {percentual}%
              </div>}
            </div>
          </div>
        </div>
        {iconesTendencia}
      </div>
    </div>
  );
}