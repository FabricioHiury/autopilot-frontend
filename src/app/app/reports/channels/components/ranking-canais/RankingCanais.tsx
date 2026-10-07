'use client';
import { channelLabel } from '@/lib/presentation-labels';

import React from 'react';
import { Ranking } from '@/types/channel-report';

interface RankingCanaisProps {
  ranking?: Ranking;
  taxaMedia?: number; // opcional, exibe como pill de porcentagem
  className?: string;
}

export default function RankingCanais({ ranking, taxaMedia, className }: RankingCanaisProps) {
  const leadTop = ranking?.byLeads?.find((i) => i.position === 1) || ranking?.byLeads?.[0];
  const convTop =
    ranking?.byConversations?.find((i) => i.position === 1) || ranking?.byConversations?.[0];

  const getIconPath = (channel: string) => {
    const iconMap: { [key: string]: string } = {
      facebook: '/icons/facebook.svg',
      instagram: '/icons/instagram.svg',
      olx: '/icons/olx.svg',
      whatsapp: '/icons/whatsapp.svg',
      other: '/icons/outros.svg',
      webmotors: '/avatar/avatar_webmotors.webp',
      icarros: '/avatar/avatar_icarros.webp',
      mobiauto: '/avatar/avatar_mobiauto.webp',
      usadosbr: '/avatar/avatar_usadosbr.webp',
      showroom: '/avatar/avatar_showroom.webp',
      ligacao: '/avatar/avatar_ligacao.webp',
      mercadolivre: '/icons/outros.svg',
      site: '/icons/site.svg',
    };
    return iconMap[(channel || '').toLowerCase()] || '/icons/outros.svg';
  };

  const PercentPill = ({ value }: { value?: number }) => (
    <div className="flex items-center bg-gray-100 rounded-full h-7 px-3 text-sm font-semibold text-gray-900">
      {value !== undefined ? `${Number(value).toFixed(0)}%` : ''}
    </div>
  );

  const isEmptyRanking =
    !ranking ||
    ((!ranking.byLeads || ranking.byLeads.length === 0) &&
      (!ranking.byConversations || ranking.byConversations.length === 0));

  if (isEmptyRanking) {
    return (
      <div
        className={`bg-white rounded-2xl p-6 shadow-md border border-gray-100 ${className || ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Seus Canais em Destaque</h3>
          {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
        </div>
        <p className="text-sm text-gray-600">Não há ranking de canais disponível.</p>
        <p className="text-xs text-gray-500 mt-1">
          Nenhum canal disponível para este período e modo selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-100 ${className || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Seus Canais em Destaque</h3>
      </div>

      {leadTop && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Contatos interessados</span>
            {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center">
                <img
                  src={getIconPath(leadTop.channel)}
                  alt={channelLabel(leadTop.nameDisplay)}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/outros.svg';
                  }}
                />
              </div>
              <div className="text-lg font-semibold text-gray-600 leading-tight">
                {channelLabel(leadTop.nameDisplay)}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof leadTop.value === 'number' ? leadTop.value.toLocaleString() : leadTop.value}
            </div>
          </div>
          <div className="border-t border-gray-100 mt-3" />
        </div>
      )}

      {convTop && (
        <div className="mt-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Conversões</span>
            {taxaMedia !== undefined && <PercentPill value={taxaMedia} />}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center">
                <img
                  src={getIconPath(convTop.channel)}
                  alt={channelLabel(convTop.nameDisplay)}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/outros.svg';
                  }}
                />
              </div>
              <div className="text-lg font-semibold text-gray-600 leading-tight">
                {channelLabel(convTop.nameDisplay)}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof convTop.value === 'number' ? convTop.value.toLocaleString() : convTop.value}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
