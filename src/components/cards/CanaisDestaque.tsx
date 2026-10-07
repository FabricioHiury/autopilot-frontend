import { channelLabel } from '@/lib/presentation-labels';
import React from 'react';

interface CanalDestaque {
  channel: string;
  nameDisplay: string;
  iconUrl?: string;
  leads: number;
  conversions: number;
  porcentagemLeads: number;
  porcentagemConversoes: number;
}

interface CanaisDestaqueProps {
  title?: string;
  data?: string;
  canaisLeads: CanalDestaque[];
  canaisConversoes: CanalDestaque[];
}

export default function CanaisDestaque({
  title = 'Seus Canais em Destaque',
  data = 'JUN 24',
  canaisLeads,
  canaisConversoes,
}: CanaisDestaqueProps) {
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
    };

    return iconMap[channel.toLowerCase()] || '/icons/outros.svg';
  };

  const renderCanalItem = (channel: CanalDestaque, type: 'leads' | 'conversions') => (
    <div key={`${channel.channel}-${type}`} className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center">
          <img
            src={channel.iconUrl || getIconPath(channel.channel)}
            alt={channelLabel(channel.nameDisplay)}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/icons/outros.svg';
            }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700">
          {channelLabel(channel.nameDisplay)}
        </span>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">
          {type === 'leads' ? channel.leads : channel.conversions}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-medium">{data}</span>
      </div>

      {/* Leads Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          <span className="text-xs font-medium text-gray-600">Contatos interessados</span>
          <span className="text-xs text-green-500 font-medium ml-auto">30%</span>
        </div>
        <div className="space-y-1">
          {canaisLeads.map((channel) => renderCanalItem(channel, 'leads'))}
        </div>
      </div>

      {/* Conversões Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="text-xs font-medium text-gray-600">Conversões</span>
          <span className="text-xs text-green-500 font-medium ml-auto">30%</span>
        </div>
        <div className="space-y-1">
          {canaisConversoes.map((channel) => renderCanalItem(channel, 'conversions'))}
        </div>
      </div>
    </div>
  );
}
