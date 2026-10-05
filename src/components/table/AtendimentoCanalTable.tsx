import React from 'react';
import { Table, TableColumn } from './Table';

export interface AtendimentoCanalData {
  channel: string;
  nameDisplay: string;
  iconUrl?: string;
  leadsTotal: number;
  conversions: number;
  rateConversion: number;
}

interface AtendimentoCanalTableProps {
  data: AtendimentoCanalData[];
  loading?: boolean;
}

export function AtendimentoCanalTable({ data, loading = false }: AtendimentoCanalTableProps) {
  const getIconPath = (channel: string) => {
    const iconMap: { [key: string]: string } = {
      facebook: '/icons/facebook.svg',
      instagram: '/icons/instagram.svg',
      olx: '/icons/olx.svg',
      whatsapp: '/icons/whatsapp.svg',
      other: '/icons/outros.svg',
      webmotors: '/icons/webmotors.svg',
      icarros: '/icons/icarros.svg',
      mobiauto: '/icons/mobiauto.svg',
      usadosbr: '/icons/usadosbr.svg',
      showroom: '/icons/showroom.svg',
      ligação: '/avatar/avatar_ligacao.webp',
      mercadolivre: '/icons/outros.svg',
      carteira: '/icons/carteira.svg',
      site: '/icons/site.svg',
      indicação: '/icons/indicacao.png',
    };

    return iconMap[channel.toLowerCase()] || '/icons/outros.svg';
  };

  const columns: TableColumn<AtendimentoCanalData>[] = [
    {
      key: 'channel',
      title: 'Canal',
      dataIndex: 'nameDisplay',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <img
                className="w-6 h-6 object-contain"
                src={getIconPath(record.channel)}
                alt={record.nameDisplay}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/icons/outros.svg';
                }}
              />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.nameDisplay}</div>
            <div className="text-sm text-gray-500 capitalize">{record.channel}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'leadsTotal',
      title: 'Total de Leads',
      dataIndex: 'leadsTotal',
      align: 'center',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'conversions',
      title: 'Conversões',
      dataIndex: 'conversions',
      align: 'center',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'rateConversion',
      title: 'Taxa de Conversão',
      dataIndex: 'rateConversion',
      align: 'center',
      render: (value) => {
        const percentage = Math.round(value);
        let colorClass = 'text-green-600';

        if (percentage < 20) {
          colorClass = 'text-red-600';
        } else if (percentage < 35) {
          colorClass = 'text-yellow-600';
        }

        return <span className={`text-sm font-medium ${colorClass}`}>{percentage}%</span>;
      },
    },
  ];

  return (
    <Table
      title="Atendimentos por Canal"
      placeholderFiltro="Procurar em canal..."
      columns={columns}
      data={data}
      loading={loading}
      emptyText="Nenhum canal encontrado"
      className="mt-6"
    />
  );
}
