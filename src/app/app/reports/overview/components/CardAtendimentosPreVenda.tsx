import React, { useState } from 'react';
import ChevronLeft from '@/components/icons/chevron-left';
import ChevronRight from '@/components/icons/chevron-right';
import IconArrowNext from '@/components/icons/icon-next-arrow';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';

export type AtendimentoSemFollowUp = {
  id: string;
  nameDeal: string;
  period: string;
  status: string;
  employee: string;
  daysWithoutFollowUp: number;
};

interface CardAtendimentosPreVendaProps {
  dealsPreDealWithoutFollowUp: AtendimentoSemFollowUp[];
  dealsSalesWithoutFollowUp: AtendimentoSemFollowUp[];
}

export function CardAtendimentosPreVenda({
  dealsPreDealWithoutFollowUp,
  dealsSalesWithoutFollowUp,
}: CardAtendimentosPreVendaProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 2;

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const getStatusColor = (status: string) => {
    switch (status && status.toLowerCase()) {
      case 'aguardando':
        return 'text-yellow-600 bg-yellow-50';
      case 'em andamento':
        return 'text-blue-600 bg-blue-50';
      case 'concluído':
        return 'text-green-600 bg-green-50';
      case 'cancelado':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const currentItems = currentPage === 0 ? dealsPreDealWithoutFollowUp : dealsSalesWithoutFollowUp;

  const pageTitle = currentPage === 0 ? 'Atendimentos Pré-Venda' : 'Atendimento em Venda';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{pageTitle}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`p-2 rounded-md ${
              currentPage === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500">
            {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-md ${
              currentPage === totalPages - 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="sm:hidden space-y-2">
        {currentItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">Nenhum atendimento encontrado</div>
        ) : (
          currentItems.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-medium text-gray-900 truncate" title={deal.nameDeal}>
                  {deal.nameDeal}
                </div>
                <div className="text-xs text-gray-600 truncate" title={deal.employee}>
                  {deal.employee}
                </div>
                <div className="text-xs text-gray-600">
                  Período:{' '}
                  <span className="truncate" title={deal.period}>
                    {deal.period}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Dias sem follow-up: {deal.daysWithoutFollowUp}
                </div>
                <span
                  className={`inline-flex max-w-[160px] px-2 py-1 text-xs font-medium rounded-full truncate ${getStatusColor(
                    deal.status,
                  )}`}
                >
                  {deal.status}
                </span>
              </div>
              <button
                onClick={() => navigateToDeal(deal.id)}
                className="ml-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Abrir atendimento"
                title="Abrir atendimento"
              >
                <IconArrowNext size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 rounded-md">
            <tr>
              <th className="sm:w-[28%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Nome do Atendimento
              </th>
              <th className="sm:w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Colaborador
              </th>
              <th className="sm:w-[16%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Período
              </th>
              <th className="sm:w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Dias sem follow-up
              </th>
              <th className="sm:w-[16%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Status
              </th>
              <th className="sm:w-[8%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Acessar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum atendimento encontrado
                </td>
              </tr>
            ) : (
              currentItems.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td
                    className="sm:w-[28%] px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate"
                    title={deal.nameDeal}
                  >
                    {deal.nameDeal}
                  </td>
                  <td
                    className="sm:w-[20%] px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate"
                    title={deal.employee}
                  >
                    {deal.employee}
                  </td>
                  <td
                    className="sm:w-[16%] px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center truncate"
                    title={deal.period}
                  >
                    {deal.period}
                  </td>
                  <td className="sm:w-[12%] px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                    {deal.daysWithoutFollowUp}
                  </td>
                  <td className="sm:w-[16%] px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex max-w-[140px] px-2 py-1 text-xs font-medium rounded-full truncate ${getStatusColor(
                        deal.status,
                      )}`}
                    >
                      {deal.status}
                    </span>
                  </td>
                  <td className="sm:w-[8%] px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigateToDeal(deal.id)}
                      className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      aria-label="Abrir atendimento"
                      title="Abrir atendimento"
                    >
                      <IconArrowNext size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {currentItems.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <span>Mostrando {currentItems.length} atendimentos</span>
          <span>{pageTitle}</span>
        </div>
      )}
    </div>
  );
}
