"use client"

import { useState, useRef } from 'react';
import { RelatorioAtendimentoCanal } from '@/model/relatorio-atendimento-canal';

interface CanaisAtendimentoProps {
  canais: RelatorioAtendimentoCanal[];
  totalLeads?: number;
  totalConversoes?: number;
  className?: string;
}

export default function CanaisAtendimento({
  canais,
  totalLeads = 0,
  totalConversoes = 0,
  className = ""
}: CanaisAtendimentoProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const getIconPath = (canal: string) => {
    const iconMap: { [key: string]: string } = {
      'facebook': '/icons/facebook.svg',
      'instagram': '/icons/instagram.svg',
      'olx': '/icons/olx.svg',
      'whatsapp': '/icons/whatsapp.svg',
      'outros': '/icons/outros.svg',
      'webmotors': '/avatar/avatar_webmotors.webp',
      'icarros': '/avatar/avatar_icarros.webp',
      'mobiauto': '/avatar/avatar_mobiauto.webp',
      'usadosbr': '/icons/usadosbr.svg',
      'showroom': '/icons/showroom.svg',
      'ligacao': '/avatar/avatar_ligacao.webp',
      'mercadolivre': '/icons/outros.svg',
      'carteira': '/icons/carteira.svg',
      'site': '/icons/site.svg',
      'indicacao': '/icons/indicacao.png',
    };
    
    return iconMap[canal.toLowerCase()] || '/icons/outros.svg';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Hoje nos seus canais de atendimento
        </h3>
        <div className="text-sm text-gray-500">
          <span className="font-medium">{totalLeads}</span> leads • <span className="font-medium">{totalConversoes}</span> conversões
        </div>
      </div>

      <div className="relative">
        {/* Botão de scroll esquerda */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            style={{ marginLeft: '-12px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Container dos canais */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={checkScrollButtons}
        >
          {canais.map((canal, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-gray-50 rounded-lg p-4 min-w-[140px] text-center hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Ícone do canal */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <img
                    src={getIconPath(canal.canal)}
                    alt={canal.nomeExibicao}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/icons/outros.svg';
                    }}
                  />
                </div>
              </div>

              {/* Nome do canal */}
              <div className="text-xs font-medium text-gray-600 mb-2">
                {canal.nomeExibicao}
              </div>

              {/* Métricas */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Leads</span>
                  <span className="font-medium text-gray-900">{canal.leadsTotal}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Conv.</span>
                  <span className="font-medium text-gray-900">{canal.conversoes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de scroll direita */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            style={{ marginRight: '-12px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}