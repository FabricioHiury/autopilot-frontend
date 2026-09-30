import React, { useState, useMemo } from "react";
import ChevronRight from "@/components/icons/chevron-right";
import IconArrowUp from "@/components/icons/icon-arrow-up";

interface TempoMedioReposta {
  mes: string;
  tempoMedio: string;
}

interface BarraMesesProps {
  dadosTempoMedio?: TempoMedioReposta[];
  mesSelecionado?: string;
  onMesSelecionado?: (mes: string) => void;
  corBarraSelecionada?: string;
  corBarraNaoSelecionada?: string;
}

function BarraMeses({
  dadosTempoMedio = [],
  mesSelecionado,
  onMesSelecionado,
  corBarraSelecionada = "bg-[#586E9D]",
  corBarraNaoSelecionada = "bg-gray-300",
}: BarraMesesProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const converterTempoParaMinutos = (tempo: string): number => {
    if (!tempo || tempo === "0min" || tempo === "00:00") return 0;
    const hMatch = tempo.match(/(\d+)h/);
    const mMatch = tempo.match(/(\d+)min/);
    const horas = hMatch ? parseInt(hMatch[1]) : 0;
    const minutos = mMatch ? parseInt(mMatch[1]) : 0;
    return horas * 60 + minutos;
  };

  const valoresMinutos = dadosTempoMedio.map((d) =>
    converterTempoParaMinutos(d.tempoMedio)
  );
  const maxMin = Math.max(...valoresMinutos, 0);
  const alturaMax = 40;
  const alturaMin = 10;

  const calcularAltura = (tempo: string) => {
    const minutos = converterTempoParaMinutos(tempo);
    if (maxMin === 0) return alturaMin;
    const proporcao = minutos / maxMin;
    const altura = alturaMin + proporcao * (alturaMax - alturaMin);
    return altura;
  };

  return (
    <div className="flex items-end gap-2 h-16 relative">
      {dadosTempoMedio.map((item, index) => {
        const altura = calcularAltura(item.tempoMedio);
        const isSelected =
          mesSelecionado &&
          item.mes.toLowerCase().includes(mesSelecionado.toLowerCase());

        return (
          <div
            key={index}
            className="flex flex-col items-center gap-1 cursor-pointer relative"
            onClick={() => onMesSelecionado?.(item.mes)}
            onMouseEnter={() => setTooltip(item.mes)}
            onMouseLeave={() => setTooltip(null)}
          >
            {tooltip === item.mes && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap z-10 transition-opacity duration-200">
                {item.mes.toUpperCase()} — {item.tempoMedio}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
            <div
              className={`w-2 rounded-full transition-all duration-200 ${
                isSelected ? corBarraSelecionada : corBarraNaoSelecionada
              }`}
              style={{ height: `${altura}px` }}
            />
            <span className="text-[10px] text-gray-500">
              {item.mes.split("/")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface CardTempoRespostaProps {
  titulo: string;
  subtitulo: string;
  tempo: string;
  className?: string;
  dadosTempoMedio?: TempoMedioReposta[];
  corBarraSelecionada?: string;
  corBarraNaoSelecionada?: string;
  mesSelecionado?: string;
}

export default function CardTempoResposta({
  titulo,
  subtitulo,
  tempo,
  className = "",
  dadosTempoMedio = [],
  corBarraSelecionada,
  corBarraNaoSelecionada,
}: CardTempoRespostaProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
    const ultimoMes = dadosTempoMedio[dadosTempoMedio.length - 1];
    return ultimoMes?.mes || "";
  });

  const converterTempoParaMinutos = (tempo: string): number => {
    if (!tempo || tempo === "0min" || tempo === "00:00") return 0;
    const hMatch = tempo.match(/(\d+)h/);
    const mMatch = tempo.match(/(\d+)min/);
    const horas = hMatch ? parseInt(hMatch[1]) : 0;
    const minutos = mMatch ? parseInt(mMatch[1]) : 0;
    return horas * 60 + minutos;
  };

  const tempoExibido = useMemo(() => {
    const dado = dadosTempoMedio.find((d) =>
      d.mes.toLowerCase().includes(mesSelecionado.toLowerCase())
    );
    return dado?.tempoMedio || tempo;
  }, [dadosTempoMedio, mesSelecionado, tempo]);

  // --- Cálculo de variação percentual ---
  const porcentagem = useMemo(() => {
    if (!dadosTempoMedio || dadosTempoMedio.length < 2) return 0;

    const indexAtual = dadosTempoMedio.findIndex((d) =>
      d.mes.toLowerCase().includes(mesSelecionado.toLowerCase())
    );
    const atual = dadosTempoMedio[indexAtual];
    const anterior = dadosTempoMedio[indexAtual - 1];

    if (!anterior) return 0;

    const valorAtual = converterTempoParaMinutos(atual?.tempoMedio);
    const valorAnterior = converterTempoParaMinutos(anterior?.tempoMedio);

    if (valorAnterior === 0 && valorAtual > 0) return 100;
    if (valorAnterior === 0 && valorAtual === 0) return 0;

    const variacao = ((valorAtual - valorAnterior) / valorAnterior) * 100;
    return Math.round(variacao);
  }, [dadosTempoMedio, mesSelecionado]);

  const isAumento = porcentagem >= 0;

  return (
    <div
      className={`bg-white rounded-2xl min-h-56 p-5 shadow-md border border-gray-100 flex flex-col justify-between w-full ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">{titulo}</p>
          <p className="text-sm font-semibold text-gray-900">{subtitulo}</p>
        </div>
        <div
          className={`w-[55px] h-5 rounded-sm flex items-center justify-center gap-1 font-semibold text-xs ${
            isAumento
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <IconArrowUp className="w-3 h-3" />
          {isAumento ? "+" : ""}
          {porcentagem}%
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-center pb-2">
          <div>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">
              {tempoExibido}
            </p>
            <p className="text-xs text-gray-500">{mesSelecionado}</p>
          </div>

          <BarraMeses
            dadosTempoMedio={dadosTempoMedio}
            mesSelecionado={mesSelecionado}
            onMesSelecionado={setMesSelecionado}
            corBarraSelecionada={corBarraSelecionada}
            corBarraNaoSelecionada={corBarraNaoSelecionada}
          />
        </div>

        <div className="text-right border-t border-t-gray-200 pt-2 flex justify-between items-center">
          <div className="flex items-center gap-1">
            🏆
            <p className="text-xs sm:text-sm text-gray-500">
              {mesSelecionado.toUpperCase()}
            </p>
          </div>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" fill="#B1BCD3" />
          <p className="text-xs sm:text-sm text-gray-900">{tempoExibido}</p>
        </div>
      </div>
    </div>
  );
}
