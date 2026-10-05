'use client';
import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { AppServices } from '@/services/app.services';
import { EmployeeList } from '@/types/employee-list';
import ReportHeader, { ReportTab } from '@/components/commons/ReportHeader';
import RelatorioGeralAtendimentoVendas from './overview';
import RelatorioAtendimentosGeral from './presales';
import RelatorioAtendimentosPorCanal from './channels';
import RelatorioAtendimentosPorVendedor from './salespeople';

export default function PainelRelatorio() {
  const api = useMemo(() => new AppServices(), []);
  const tabs: ReportTab[] = [
    {
      title: 'Painel Geral',
      subtitulo: 'Veja o progresso de conversões em vendas 👋',
      estaSelecioando: true,
    },
    {
      title: 'Painel de Pré-venda',
      subtitulo: 'Veja o progresso geral 👋',
      estaSelecioando: false,
    },
    {
      title: 'Painel por Canal',
      subtitulo: 'Veja o progresso por canal 👋',
      estaSelecioando: false,
    },
    {
      title: 'Painel do Vendedor',
      subtitulo: 'Veja o progresso por vendedor 👋',
      estaSelecioando: false,
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [confirmedRange, setConfirmedRange] = useState<DateRange | undefined>();
  const [mode, setModo] = useState<'total' | 'BUY' | 'SELL' | 'CONSIGNMENT'>('total');
  const [salespeople, setVendedores] = useState<
    { id: string; name: string; avatar?: string | null }[]
  >([]);
  const [employeeId, setIdColaborador] = useState<string | 'todos'>('todos');

  const handleTabChange = (tab: ReportTab) => {
    setSelectedTab(tab);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setConfirmedRange(range);
  };

  useEffect(() => {
    buscarListaDeVendedores();
  }, [confirmedRange, selectedTab.title]);

  const content = useMemo(() => {
    const hoje = new Date();
    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(hoje.getMonth() - 6);

    const dataStart = confirmedRange?.from
      ? confirmedRange.from.toISOString().split('T')[0]
      : seiseMesesAtras.toISOString().split('T')[0];
    const dataEnd = confirmedRange?.to
      ? confirmedRange.to.toISOString().split('T')[0]
      : hoje.toISOString().split('T')[0];
    switch (selectedTab.title) {
      case 'Painel Geral':
        return (
          <RelatorioGeralAtendimentoVendas
            dataStart={dataStart}
            dataEnd={dataEnd}
            mode={mode}
            employeeId={employeeId === 'todos' ? undefined : employeeId}
          />
        );
      case 'Painel de Pré-venda':
        return (
          <RelatorioAtendimentosGeral
            dataStart={dataStart}
            dataEnd={dataEnd}
            mode={mode}
            employeeId={employeeId === 'todos' ? undefined : employeeId}
            setIdColaborador={setIdColaborador}
          />
        );
      case 'Painel por Canal':
        return (
          <RelatorioAtendimentosPorCanal
            dataStart={dataStart}
            dataEnd={dataEnd}
            mode={mode}
            employeeId={employeeId === 'todos' ? undefined : employeeId}
          />
        );
      case 'Painel do Vendedor':
        return (
          <RelatorioAtendimentosPorVendedor
            dataStart={dataStart}
            dataEnd={dataEnd}
            mode={mode}
            employeeId={employeeId === 'todos' ? undefined : employeeId}
            setIdColaborador={setIdColaborador}
          />
        );
      default:
        return null;
    }
  }, [confirmedRange, selectedTab.title, mode, employeeId]);

  const buscarListaDeVendedores = async () => {
    try {
      const response = await api.reports.findEmployee();
      if (response) {
        const data = response as unknown as EmployeeList;
        const todos = data.employees as unknown as Array<{
          id: string;
          name: string;
          roles?: Array<{ role: string }>;
        }>;
        const filtrados =
          selectedTab.title === 'Painel de Pré-venda'
            ? todos.filter((item) => item.roles?.some((c) => c.role === 'Pre-salesperson'))
            : todos;
        const lista = filtrados.map((item) => ({ id: item.id, name: item.name }));
        setVendedores(lista);
        if (employeeId !== 'todos' && !lista.some((v) => v.id === employeeId)) {
          setIdColaborador('todos');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <ReportHeader
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        dateRange={confirmedRange}
        onDateRangeChange={handleDateRangeChange}
        modeItems={['total', 'BUY', 'SELL', 'CONSIGNMENT']}
        modeValue={mode}
        onModeChange={(key) => setModo(key as any)}
        salespeople={salespeople}
        selectedVendedorId={employeeId}
        onVendedorChange={(id) => setIdColaborador(id as any)}
      />

      <main className="flex-1 w-full overflow-x-hidden overflow-y-auto px-6 sm:px-9 py-6 bg-gray-50">
        {content}
      </main>
    </div>
  );
}
