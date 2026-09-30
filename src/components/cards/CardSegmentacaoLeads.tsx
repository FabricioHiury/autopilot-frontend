import React, { useState, useEffect } from 'react';
import ChevronRight from '@/components/icons/chevron-right';
import ChevronLeft from '@/components/icons/chevron-left';

export interface SegmentacaoItem {
  tipo: 'Frio' | 'Morno' | 'Quente';
  icone: React.ReactNode;
  porcentagem: number;
  cor: string;
}

interface CardSegmentacaoLeadsProps {
  titulo: string;
  subtitulo?: string;
  totalLeads: number | undefined;
  unidade: string;
  segmentacao: SegmentacaoItem[];
}

interface CardTypeSegmentacao {
  type?: "unico" | "multiplo";
  content: CardSegmentacaoLeadsProps | CardSegmentacaoLeadsProps[];
}

export default function CardSegmentacaoLeads({ type = "unico", content }: CardTypeSegmentacao) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    if (type === 'multiplo' && Array.isArray(content)) {
      setIndiceAtual((i) => Math.min(Math.max(0, i), Math.max(0, content.length - 1)));
    }
  }, [type, content]);

  const renderBarraProgresso = (porcentagem: number, cor: string) => {
    const totalBarras = 20;
    const barrasPreenchidas = Math.round((porcentagem / 100) * totalBarras);

    return (
      <div className="flex gap-[1px] flex-1">
        {Array.from({ length: totalBarras }, (_, index) => (
          <div
            key={index}
            className={`flex-1 h-5 rounded-sm ${index < barrasPreenchidas ? cor : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 h-full flex flex-col justify-between">
      {type === "unico" && !!content && Array.isArray(content) === false && (
        <>
          <div className="mb-4 flex justify-between">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex-1 pr-2">{(content as CardSegmentacaoLeadsProps).titulo}</h3>
            {(content as CardSegmentacaoLeadsProps).subtitulo && <p className="text-xs text-gray-600 font-semibold">{(content as CardSegmentacaoLeadsProps).subtitulo}</p>}
            <div className="flex items-baseline gap-1 bg-gray-100 rounded-full h-6 px-3 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">
                {(content as CardSegmentacaoLeadsProps).totalLeads?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-600 font-semibold">{(content as CardSegmentacaoLeadsProps).unidade}</span>
            </div>
          </div>

          <div className="space-y-3">
            {(content as CardSegmentacaoLeadsProps).segmentacao.map((item, index) => (
              <div key={index} className="flex items-center  justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs">{item.icone}</span>
                  <span className="text-xs font-medium text-gray-700 min-w-[45px]">{item.tipo}</span>
                </div>
                <div className="flex justify-end items-center gap-2 w-1/2">
                  {renderBarraProgresso(item.porcentagem, item.cor)}
                  <span className="text-xs font-semibold text-gray-900 w-8 text-right flex-shrink-0">
                    {item.porcentagem}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {type === "multiplo" && Array.isArray(content) && content.length > 0 && (
        <>
          <div className="mb-4 flex justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 flex-1 pr-2">{content[indiceAtual].titulo}</h3>
              {content[indiceAtual].subtitulo && <p className="text-xs text-gray-600 font-semibold">{content[indiceAtual].subtitulo}</p>}
            </div>
            <div className="flex items-baseline gap-1 bg-gray-100 rounded-full h-6 px-3 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900">
                {content[indiceAtual].totalLeads?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-600 font-semibold">{content[indiceAtual].unidade}</span>
            </div>
          </div>

          <div className="space-y-3">
            {content[indiceAtual].segmentacao.map((seg, idx) => (
              <div key={idx} className="flex items-center  justify-between gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs">{seg.icone}</span>
                  <span className="text-xs font-medium text-gray-700 min-w-[45px]">{seg.tipo}</span>
                </div>
                <div className="flex justify-end items-center gap-2 w-1/2">
                  {renderBarraProgresso(seg.porcentagem, seg.cor)}
                  <span className="text-xs font-semibold text-gray-900 w-8 text-right flex-shrink-0">
                    {seg.porcentagem}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setIndiceAtual((i) => Math.max(0, i - 1))}
              disabled={indiceAtual === 0}
              className={`p-1 rounded-full transition-colors ${indiceAtual > 0 ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
              aria-label="Anterior"
            >
              <ChevronLeft />
            </button>

            <div className="flex gap-2">
              {content.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndiceAtual(i)}
                  className={`w-2 h-2 rounded-full ${i === indiceAtual ? 'bg-red-500' : 'bg-gray-300'}`}
                  aria-label={`Ir para item ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setIndiceAtual((i) => Math.min(content.length - 1, i + 1))}
              disabled={indiceAtual === content.length - 1}
              className={`p-1 rounded-full transition-colors ${indiceAtual < content.length - 1 ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
              aria-label="Próximo"
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}

      {((type === 'unico' && (!content || Array.isArray(content))) || (type === 'multiplo' && Array.isArray(content) && content.length === 0)) && (
        <div className="flex items-center justify-center h-full py-6">
          <span className="text-sm text-gray-600">Dados não disponíveis</span>
        </div>
      )}
    </div>
  );
}