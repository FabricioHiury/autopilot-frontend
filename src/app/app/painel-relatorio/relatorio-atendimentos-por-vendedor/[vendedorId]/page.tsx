'use client'

import RelatorioAtendimentosPorVendedor from "../index";

export default function VendedorReportPage() {
  const hoje = new Date();
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(hoje.getMonth() - 6);

  const dataInicio = seiseMesesAtras.toISOString().split('T')[0];
  const dataFim = hoje.toISOString().split('T')[0];

  return <RelatorioAtendimentosPorVendedor dataInicio={dataInicio} dataFim={dataFim} />;
}