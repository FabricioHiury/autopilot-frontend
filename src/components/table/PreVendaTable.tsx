import React from 'react';
import { Table, TableColumn } from './Table';

export interface PreVendaData {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  timeInPlatform: string;
  leadsReceived: number;
  leadsAtendimento: number;
  leadsQualificados: number;
  averageQualification: string;
}

interface PreVendaTableProps {
  data: PreVendaData[];
  setVendedorId: (id: string) => void;
  loading?: boolean;
}

export function PreVendaTable({ data, setVendedorId, loading = false }: PreVendaTableProps) {
  const handleRowClick = (record: PreVendaData, index: number) => {
    setVendedorId(record.id);
  };

  const columns: TableColumn<PreVendaData>[] = [
    {
      key: 'salesperson',
      title: 'Vendedores',
      dataIndex: 'name',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={record.avatar || '/images/default.png'}
              alt={record.name}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.timeInPlatform}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'leadsReceived',
      title: 'Contatos interessados recebidos',
      dataIndex: 'leadsReceived',
      align: 'center',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'leadsAtendimento',
      title: 'Contatos interessados em atendimento',
      dataIndex: 'leadsAtendimento',
      align: 'center',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'leadsQualificados',
      title: 'Contatos interessados qualificados',
      dataIndex: 'leadsQualificados',
      align: 'center',
      render: (value) => <span className="text-sm font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'averageQualification',
      title: 'Média de qualificação',
      dataIndex: 'averageQualification',
      align: 'center',
      render: (value, record) => {
        const percentage = parseInt(value.replace('%', ''));
        let colorClass = 'text-green-600';

        if (percentage < 30) {
          colorClass = 'text-red-600';
        } else if (percentage < 70) {
          colorClass = 'text-yellow-600';
        }

        return <span className={`text-sm font-medium ${colorClass}`}>{value}</span>;
      },
    },
  ];

  return (
    <Table
      title="Pré-Venda"
      placeholderFiltro="Procurar em vendedor..."
      columns={columns}
      data={data}
      loading={loading}
      emptyText="Nenhum vendedor encontrado"
      className="mt-6"
      onRowClick={handleRowClick}
    />
  );
}
