import React from 'react';

interface EtapaNegociacao {
  etapa: string;
  tempoMedio: number;
  unidade: string;
  porcentagem: number;
  cor: string;
}

interface CardTempoMedioEtapaProps {
  titulo: string;
  subtitulo: string;
  etapas: EtapaNegociacao[];
}

const CardTempoMedioEtapa: React.FC<CardTempoMedioEtapaProps> = ({
  titulo,
  subtitulo,
  etapas
}) => {
  const tempoTotal = etapas.reduce((acc, etapa) => acc + etapa.tempoMedio, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <p className="text-xs text-gray-500">{subtitulo}</p>
        </div>
        <div className="text-xs text-gray-500">
          Total: {tempoTotal} dias
        </div>
      </div>

      <div className="space-y-4">
        {etapas.map((etapa, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{etapa.etapa}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {etapa.tempoMedio} {etapa.unidade}
                </span>
                <span className="text-xs text-gray-500">
                  ({etapa.porcentagem}%)
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${etapa.cor}`}
                style={{ width: `${etapa.porcentagem}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardTempoMedioEtapa;