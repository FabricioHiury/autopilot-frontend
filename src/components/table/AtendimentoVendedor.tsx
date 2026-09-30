import React from 'react';
import { Table, TableColumn } from './Table';
const DEFAULT_AVATAR = '/images/default.png'
export interface VendedorData {
  id: string;
  nome: string;
  avatar?: string | null;
  cargo: string;
  dataInicio: string;
  leads: number;
  leadsAtendimento: number;
  leadsResgate: number;
  leadsConvertidos: number;
  mediaConversao: string;
}

interface AtendimentoVendedorProps {
  dados: VendedorData[];
  titulo?: string;
  placeholderFiltro?: string;
  onVendedorClick?: (vendedorId: string) => void;
}

export default function AtendimentoVendedor({
  dados,
  titulo = "Leads e Conversões",
  placeholderFiltro = "Procurar em vendedores",
  onVendedorClick
}: AtendimentoVendedorProps) {
  const image = (record: VendedorData) => record.avatar ? record.avatar : DEFAULT_AVATAR;
  const colunas: TableColumn<VendedorData>[] = [
    {
      key: 'vendedor',
      title: 'Vendedores',
      dataIndex: 'nome',
      render: (value, record) => (
        <div className={`flex items-center gap-3 ${onVendedorClick ? 'group-hover:text-blue-600 transition-colors' : ''}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <img
              src={image(record)}
              alt={record.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className={`font-medium ${onVendedorClick ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-900'}`}>{record.nome}</div>
            <div className="text-sm text-gray-500">Desde {record.dataInicio}</div>
          </div>
        </div>
      ),
      width: '200px'
    },
    {
      key: 'leads',
      title: 'Leads',
      dataIndex: 'leads',
      align: 'center',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'leadsAtendimento',
      title: 'Leads em atendimento',
      dataIndex: 'leadsAtendimento',
      align: 'center',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'leadsResgate',
      title: 'Leads em resgate',
      dataIndex: 'leadsResgate',
      align: 'center',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'leadsConvertidos',
      title: 'Leads convertidos',
      dataIndex: 'leadsConvertidos',
      align: 'center',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'mediaConversao',
      title: 'Média de conversão',
      dataIndex: 'mediaConversao',
      align: 'center',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
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
      data={dados}
      placeholderFiltro={placeholderFiltro}
      onRowClick={onVendedorClick ? handleRowClick : undefined}
    />
  );
}