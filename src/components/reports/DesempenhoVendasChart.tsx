"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { profileImageUrl } from "@/lib/profile.utils";

export default function DesempenhoVendasChart({
  data = [],
  yourSellerId,
  previousSeries,
  height = 360,
  className,
  initialMonth,
  initialYear,
}: any) {
  const [ano, setAno] = useState(initialYear || 2025);
  const [periodo, setPeriodo] = useState("Mês");
  const [mes, setMes] = useState<number>(Number(initialMonth || new Date().getMonth() + 1));

  const ultimoMesComDados = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null as number | null;
    let maxMes: number | null = null;
    data.forEach((vendedor: any) => {
      vendedor.serieVendas.forEach((cur: any) => {
        const [y, m] = cur.data.split("-").map(Number);
        if (y === ano) {
          maxMes = maxMes == null ? m : Math.max(maxMes, m);
        }
      });
    });
    return maxMes;
  }, [data, ano]);

  React.useEffect(() => {
    if (!initialMonth && ultimoMesComDados && ultimoMesComDados !== mes) {
      setMes(ultimoMesComDados);
    }
  }, [initialMonth, ultimoMesComDados, mes]);
  const dias = useMemo(() => {
    const lastDay = new Date(ano, mes, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }, [ano, mes]);

  const porVendedor = useMemo(() => {
    if (!Array.isArray(data)) return {} as Record<string, { id: string; vendasPorDia: Record<number, number>; ultimoDia: number | null }>;
    const result: Record<string, { id: string; vendasPorDia: Record<number, number>; ultimoDia: number | null }> = {};
    data.forEach((vendedor: any) => {
      const vendasPorDia: Record<number, number> = {};
      let ultimoDia: number | null = null;
      vendedor.serieVendas.forEach((cur: any) => {
        const [y, m, d] = cur.data.split("-").map(Number);
        if (y === ano && m === mes) {
          vendasPorDia[d] = (vendasPorDia[d] || 0) + cur.vendas;
          ultimoDia = ultimoDia == null ? d : Math.max(ultimoDia, d);
        }
      });
      result[vendedor.nome] = { id: vendedor.id, vendasPorDia, ultimoDia };
    });
    return result;
  }, [data, ano, mes]);


  const payload = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const cumulativos: Record<string, number> = Object.fromEntries(data.map((v: any) => [v.nome, 0]));
    return dias.map((dia) => {
      const linha: Record<string, number> = { dia } as any;
      data.forEach((vendedor: any) => {
        const info = porVendedor[vendedor.nome];
        const add = info?.vendasPorDia[dia] || 0;
        cumulativos[vendedor.nome] = (cumulativos[vendedor.nome] || 0) + add;
        linha[vendedor.nome] = cumulativos[vendedor.nome];
      });
      return linha;
    });
  }, [data, dias, porVendedor]);

  const top3 = useMemo(() => {
    return [...data]
      .map((v: any) => {
        const info = porVendedor[v.nome];
        const total = info ? Object.values(info.vendasPorDia).reduce((acc: number, n: number) => acc + n, 0) : 0;
        return { nome: v.nome, id: v.id, avatar: v.avatar, total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [data, porVendedor]);

  const lastIndexMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    top3.forEach((v) => {
      const ultimoDia = porVendedor[v.nome]?.ultimoDia ?? null;
      if (ultimoDia == null) {
        map[v.nome] = null;
        return;
      }
      const idx = dias.findIndex((d) => d === ultimoDia);
      map[v.nome] = idx >= 0 ? idx : null;
    });
    return map;
  }, [top3, dias, porVendedor]);

  const AvatarDot = ({ cx, cy, url }: { cx: number; cy: number; url: string }) => {
    return (
      <foreignObject x={cx - 14} y={cy - 14} width={28} height={28}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 2px #fff", position: "relative" }}>
          <img
            src={url || "/images/default.png"}
            width={28}
            height={28}
            style={{ display: "block" }}
            alt="avatar"
            onError={(e) => {
              e.currentTarget.src = "/images/default.png";
              e.currentTarget.className = "absolute object-cover w-full";
              e.currentTarget.alt = "";
            }}
          />
        </div>
      </foreignObject>
    )
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm ${className || ""}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Desempenho de Vendas</h2>
      <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm sm:text-base"
          >
            <option>Mês</option>
            <option>Semana</option>
          </select>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm sm:text-base"
          >
            <option value={1}>Jan</option>
            <option value={2}>Fev</option>
            <option value={3}>Mar</option>
            <option value={4}>Abr</option>
            <option value={5}>Mai</option>
            <option value={6}>Jun</option>
            <option value={7}>Jul</option>
            <option value={8}>Ago</option>
            <option value={9}>Set</option>
            <option value={10}>Out</option>
            <option value={11}>Nov</option>
            <option value={12}>Dez</option>
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm sm:text-base"
          >
            <option>2025</option>
            <option>2024</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={payload} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dia"
            tick={{ fill: "#6b7280" }}
            label={{ value: "Dias", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis
            tick={{ fill: "#6b7280" }}
            label={{ value: "Vendas", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />

          {top3.map((v, i) => (
            <Line
              key={v.nome}
              type="monotone"
              dataKey={v.nome}
              strokeWidth={3}
              connectNulls={false}
              stroke={["#22c55e", "#3b82f6", "#f59e0b"][i]}
              dot={(props: any) => {
                const lastIdx = lastIndexMap[v.nome];
                const isLast = lastIdx !== null && props.index === lastIdx;
                if (!isLast) return <g key={`dot-${v.nome}-${props.index}`} />
                const url = v.avatar || profileImageUrl(v.id);
                return (
                  <AvatarDot
                    key={`dot-${v.nome}-${props.index}`}
                    cx={props.cx}
                    cy={props.cy}
                    url={url}
                  />
                );
              }}
              activeDot={false}
              name={`${v.nome}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
