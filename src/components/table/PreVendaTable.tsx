import React from 'react';
import { Table, TableColumn } from './Table';

export interface PreVendaData {
  id: string;
  nome: string;
  avatar?: string;
  cargo: string;
  tempoNaPlataforma: string;  
  leadsRecebidos: number;
  leadsAtendimento: number;
  leadsQualificados: number;
  mediaQualificacao: string;
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
      key: 'vendedor',
      title: 'Vendedores',
      dataIndex: 'nome',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={record.avatar || '/images/default.png'}
              alt={record.nome}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.nome}</div>
            <div className="text-sm text-gray-500">{record.tempoNaPlataforma}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'leadsRecebidos',
      title: 'Leads Recebidos',
      dataIndex: 'leadsRecebidos',
      align: 'center',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'leadsAtendimento',
      title: 'Leads em atendimento',
      dataIndex: 'leadsAtendimento',
      align: 'center',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'leadsQualificados',
      title: 'Leads qualificados',
      dataIndex: 'leadsQualificados',
      align: 'center',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'mediaQualificacao',
      title: 'Média de qualificação',
      dataIndex: 'mediaQualificacao',
      align: 'center',
      render: (value, record) => {
        const percentage = parseInt(value.replace('%', ''));
        let colorClass = 'text-green-600';

        if (percentage < 30) {
          colorClass = 'text-red-600';
        } else if (percentage < 70) {
          colorClass = 'text-yellow-600';
        }

        return (
          <span className={`text-sm font-medium ${colorClass}`}>
            {value}
          </span>
        );
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