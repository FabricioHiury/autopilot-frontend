'use client';

import RelatorioAtendimentosPorVendedor from '../index';

export default function VendedorReportPage() {
  const hoje = new Date();
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(hoje.getMonth() - 6);

  const dataStart = seiseMesesAtras.toISOString().split('T')[0];
  const dataEnd = hoje.toISOString().split('T')[0];

  return <RelatorioAtendimentosPorVendedor dataStart={dataStart} dataEnd={dataEnd} />;
}
