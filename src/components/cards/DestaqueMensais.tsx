import { Destaque } from '@/model/relatorio-atendimento-canal';
import React, { useEffect, useState } from 'react';

interface DestaqueMensaisProps {
  titulo?: string;
  subtitulo?: string;
  dados: Destaque;
  mostrarConversoes?: boolean;
}

export default function DestaqueMensais({
  titulo = "Destaque mensais",
  subtitulo = "",
  dados,
  mostrarConversoes = false
}: DestaqueMensaisProps) {
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

  useEffect(() => {
    setDadosSelecionado(dados.porLeads);
  }, [dados])

  const [tabAtiva, setTabAtiva] = useState<'leads' | 'conversoes'>('leads');
  const [dadosSelecionado, setDadosSelecionado] = useState(dados.porLeads);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-red-500 text-white';
      case 2:
        return 'bg-gray-800 text-white';
      case 3:
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 flex-1 border border-gray-100  h-[440px] max-h-[450px] overflow-y-auto ">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {titulo}
        </h3>
        {subtitulo && (
          <p className="text-sm text-gray-500">
            {subtitulo}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${tabAtiva === 'leads'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => {
            setTabAtiva('leads');
            setDadosSelecionado(dados.porLeads);
          }}
        >
          Leads
        </button>
        {mostrarConversoes && (
          <button
            className={`px-4 py-2 text-sm font-medium ${tabAtiva === 'conversoes'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => {
              setTabAtiva('conversoes');
              setDadosSelecionado(dados.porConversas);
            }}
          >
            Conversões
          </button>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 mb-3 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Rank
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Canal
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
          Leads
        </div>
      </div>

      {/* Table Body */}
      <div className="space-y-3">
        {dadosSelecionado.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center py-2">
            {/* Rank */}
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(item.rank || 0)}`}>
                {item.rank || 0}
              </div>
            </div>

            {/* Canal */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white border flex items-center justify-center">
                <img
                  src={getIconPath(item.canal)}
                  alt={item.nomeExibicao}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/outros.svg';
                  }}
                />
              </div>
              <span className="text-sm text-gray-700 truncate">
                {item.nomeExibicao}
              </span>
            </div>

            <div className="text-sm font-medium text-gray-900 text-right">
              {item.valor}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}