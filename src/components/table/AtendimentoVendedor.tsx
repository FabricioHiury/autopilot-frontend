import React from 'react';
import { Table, TableColumn } from './Table';
const DEFAULT_AVATAR = '/images/default.png';
export interface VendedorData {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  dataStart: string;
  leads: number;
  leadsAtendimento: number;
  leadsResgate: number;
  leadsConverted: number;
  averageConversion: string;
}

interface AtendimentoVendedorProps {
  data: VendedorData[];
  title?: string;
  placeholderFiltro?: string;
  onVendedorClick?: (vendedorId: string) => void;
}

export default function AtendimentoVendedor({
  data,
  title = 'Contatos interessados e Conversões',
  placeholderFiltro = 'Procurar em vendedores',
  onVendedorClick,
}: AtendimentoVendedorProps) {
  const image = (record: VendedorData) => (record.avatar ? record.avatar : DEFAULT_AVATAR);
  const colunas: TableColumn<VendedorData>[] = [
    {
      key: 'salesperson',
      title: 'Vendedores',
      dataIndex: 'name',
      render: (value, record) => (
        <div
          className={`flex items-center gap-3 ${onVendedorClick ? 'group-hover:text-blue-600 transition-colors' : ''}`}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <img src={image(record)} alt={record.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div
              className={`font-medium ${onVendedorClick ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-900'}`}
            >
              {record.name}
            </div>
            <div className="text-sm text-gray-500">Desde {record.dataStart}</div>
          </div>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'leads',
      title: 'Contatos interessados',
      dataIndex: 'leads',
      align: 'center',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'leadsAtendimento',
      title: 'Contatos interessados em atendimento',
      dataIndex: 'leadsAtendimento',
      align: 'center',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'leadsResgate',
      title: 'Contatos interessados em resgate',
      dataIndex: 'leadsResgate',
      align: 'center',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'leadsConverted',
      title: 'Contatos interessados convertidos',
      dataIndex: 'leadsConverted',
      align: 'center',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'averageConversion',
      title: 'Média de conversão',
      dataIndex: 'averageConversion',
      align: 'center',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
  ];

  const handleRowClick = (record: VendedorData) => {
    if (onVendedorClick) {
      onVendedorClick(record.id);
    }
  };

  return (
    <Table
      columns={colunas}
      data={data}
      placeholderFiltro={placeholderFiltro}
      onRowClick={onVendedorClick ? handleRowClick : undefined}
    />
  );
}
