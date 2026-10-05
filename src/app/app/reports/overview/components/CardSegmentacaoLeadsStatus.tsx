import React from 'react';

interface Segmento {
  label: string;
  value: number;
  color: string;
}

interface CardSegmentacaoLeadsStatusProps {
  title: string;
  total: number;
  statusAtual: string;
  segmentos: Segmento[];
  corVazia?: string;
  size?: number;
  barras?: number;
}

export default function CardSegmentacaoLeadsStatus({
  title,
  total,
  statusAtual,
  segmentos,
  corVazia = '#E5E7EB',
  size = 220,
  barras = 28,
}: CardSegmentacaoLeadsStatusProps) {
  const somaSegmentos = segmentos.reduce((acc, s) => acc + s.value, 0);
  const totalPreenchido = somaSegmentos > 0 ? somaSegmentos : total;
  const radius = Math.round(size * 0.42);
  const barWidth = 6;
  const baseBarHeight = 22;
  const start = -100;
  const end = 100;
  const step = (end - start) / (barras - 1);
  const alturaGauge = Math.ceil(size / 2 + baseBarHeight);

  const renderBarras = () => {
    const barrasArray = Array.from({ length: barras });
    const totalPercent = 100;
    const segmentosComPercentual = segmentos.map((s) => ({
      ...s,
      percentage: (s.value / totalPreenchido) * totalPercent,
    }));

    let acumulado = 0;
    return barrasArray.map((_, i) => {
      const ang = start + step * i;
      const progress = (i / barras) * 100;

      let corAtual = corVazia;
      for (const seg of segmentosComPercentual) {
        if (progress >= acumulado && progress < acumulado + seg.percentage) {
          corAtual = seg.color;
          break;
        }
        acumulado += seg.percentage;
      }

      const h =
        Math.round(baseBarHeight * (0.82 + 0.18 * Math.cos((ang * Math.PI) / 180))) ||
        baseBarHeight;

      return (
        <div
          key={i}
          className="absolute bottom-0 left-1/2 rounded-full"
          style={{
            width: barWidth,
            height: h,
            backgroundColor: corAtual,
            transform: `translateX(-50%) rotate(${ang}deg) translateY(-${radius}px)`,
            transition: 'background-color 0.3s ease',
          }}
        />
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm w-full">
      <h3 className="text-sm font-medium text-gray-900 mb-4">{title}</h3>

      <div
        className="relative mx-auto overflow-visible"
        style={{ width: size, height: alturaGauge }}
      >
        {renderBarras()}

        {/* texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 z-10 pointer-events-none">
          <span className="text-lg font-semibold text-gray-900">
            {total.toLocaleString()} leads
          </span>
          <span className="text-sm text-gray-500">{statusAtual}</span>
        </div>
      </div>

      {/* legenda */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {segmentos.map((seg, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="font-medium">{seg.label}</span>
            <span className="text-gray-500 ml-1">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
