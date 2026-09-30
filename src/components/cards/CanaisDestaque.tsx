import React from 'react';

interface CanalDestaque {
  canal: string;
  nomeExibicao: string;
  iconeUrl?: string;
  leads: number;
  conversoes: number;
  porcentagemLeads: number;
  porcentagemConversoes: number;
}

interface CanaisDestaqueProps {
  titulo?: string;
  data?: string;
  canaisLeads: CanalDestaque[];
  canaisConversoes: CanalDestaque[];
}

export default function CanaisDestaque({
  titulo = "Seus Canais em Destaque",
  data = "JUN 24",
  canaisLeads,
  canaisConversoes
}: CanaisDestaqueProps) {
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
      'usadosbr': '/avatar/avatar_usadosbr.webp',
      'showroom': '/avatar/avatar_showroom.webp',
      'ligacao': '/avatar/avatar_ligacao.webp',
      'mercadolivre': '/icons/outros.svg'
    };
    
    return iconMap[canal.toLowerCase()] || '/icons/outros.svg';
  };

  const renderCanalItem = (canal: CanalDestaque, tipo: 'leads' | 'conversoes') => (
    <div key={`${canal.canal}-${tipo}`} className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center">
          <img
            src={canal.iconeUrl || getIconPath(canal.canal)}
            alt={canal.nomeExibicao}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/icons/outros.svg';
            }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700">
          {canal.nomeExibicao}
        </span>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-900">
          {tipo === 'leads' ? canal.leads : canal.conversoes}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {titulo}
          </h3>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {data}
        </span>
      </div>

      {/* Leads Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
          <span className="text-xs font-medium text-gray-600">Leads</span>
          <span className="text-xs text-green-500 font-medium ml-auto">30%</span>
        </div>
        <div className="space-y-1">
          {canaisLeads.map(canal => renderCanalItem(canal, 'leads'))}
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
          {canaisConversoes.map(canal => renderCanalItem(canal, 'conversoes'))}
        </div>
      </div>
    </div>
  );
}