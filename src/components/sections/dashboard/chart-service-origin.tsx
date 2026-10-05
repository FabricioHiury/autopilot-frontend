'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';
import CalendarSelect from '@/components/inputs/select/CalendarSelect';
import { SelectMin } from '@/components/commons/inputs/select-min';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';

const chartData = [
  { month: 'Jan', facebook: 186, store: 145, redesSociais: 41, other: 15 },
  { month: 'Fev', facebook: 305, store: 15, redesSociais: 60, other: 30 },
  { month: 'Mar', anuncios: 237, store: 190, redesSociais: 47, other: 97 },
  { month: 'Abr', anuncios: 73, store: 60, redesSociais: 154, other: 8 },
  { month: 'Mai', anuncios: 85, store: 170, redesSociais: 39, other: 15 },
  { month: 'Jun', anuncios: 214, store: 175, redesSociais: 39, other: 19 },
];

const chartConfig = {
  facebook: {
    label: 'Facebook',
  },
  instagram: {
    label: 'Instagram',
  },
  whatsapp: {
    label: 'Whatsapp',
  },
  olx: {
    label: 'Olx',
  },
} satisfies ChartConfig;

type Contagem = {
  facebook: number;
  olx: number;
  instagram: number;
  whatsapp: number;
  other: number;
};

type Dado = {
  data: string;
  count: Contagem;
};

type AgrupamentoDados = {
  grouping: string;
  dataStart: string;
  dataEnd: string;
  data: Dado[];
};

export function ChartServiceOrigin() {
  const [data, setData] = useState<AgrupamentoDados>();
  const [loading, setLoading] = useState<boolean>(true);
  const [filtros, setFiltros] = useState<any>({
    grouping: 'mensal',
    period: {
      from: null,
      to: null,
    },
  });

  async function load() {
    setLoading(true);
    const [response, error] = await api.get(
      `/store/dashboard/origin-deals${api.query.searchInMemoryQuerys({
        grouping: filtros.grouping,
        dataStart: filtros.period.from ? filtros.period.from.toISOString() : null,
        dataEnd: filtros.period.to ? filtros.period.to.toISOString() : null,
      })}`,
    );
    if (error) {
      return toast.error(error.message);
    }
    console.log(response.data);
    setLoading(false);
    setData(response.data);
  }

  function setPeriodo(value: any) {
    setFiltros((old: any) => {
      return {
        ...old,
        period: value ?? {
          from: null,
          to: null,
        },
      };
    });
  }
  useEffect(() => {
    load();
  }, [filtros]);

  return (
    <div className="w-full bg-white p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#1B263A] text-[1.25rem]">Origem dos atentimentos</h2>
        <div className="flex items-center gap-2">
          <SelectMin
            options={[
              {
                label: 'Ano',
                value: 'anual',
              },
              {
                label: 'Mês',
                value: 'mensal',
              },
              {
                label: 'Semana',
                value: 'semanal',
              },
              {
                label: 'Dia',
                value: 'diario',
              },
            ]}
            value={filtros.grouping}
            onChange={(value) => {
              setFiltros((old: any) => {
                return {
                  ...old,
                  grouping: value,
                };
              });
            }}
          />
          <CalendarSelect
            default={1}
            range={filtros.period}
            setRange={(value) => {
              setPeriodo(value);
            }}
          />
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center items-center w-full p-3">
          <LoadingGlobal minH="min-h-[130px]" />
        </div>
      ) : (
        <>
          <div className="w-full mt-6">
            <ChartContainer config={chartConfig} className="min-h-[16.25rem] h-[16.25rem] w-full">
              <LineChart
                accessibilityLayer
                data={data.data.map((obj, i) => {
                  const date = new Date(obj.data);
                  let name;
                  if (filtros.grouping === 'mensal') {
                    name = date.toLocaleString('pt-br', { month: 'long' });
                  }
                  if (filtros.grouping === 'anual') {
                    name = date.toLocaleString('pt-br', { year: 'numeric' });
                  }
                  if (filtros.grouping === 'diario') {
                    name = date.toLocaleString('pt-br', { day: 'numeric' });
                  }
                  if (filtros.grouping === 'semanal') {
                    const weekNumber = Math.ceil((date.getDate() - date.getDay()) / 7);
                    name = `Semana ${weekNumber}`;
                  }
                  if (filtros.grouping === 'trimestral') {
                    const quarter = Math.floor((date.getMonth() + 3) / 3);
                    name = `Trimestre ${quarter}`;
                  }

                  return {
                    month: name,
                    ...obj.count,
                  };
                })}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="facebook"
                  type="linear"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  dot={true}
                  fill="hsl(var(--primary))"
                />
                <Line
                  dataKey="whatsapp"
                  type="linear"
                  stroke="green"
                  strokeWidth={1}
                  dot={true}
                  fill="green"
                />
                <Line
                  dataKey="olx"
                  type="linear"
                  stroke="#85A3DC"
                  strokeWidth={1}
                  dot={true}
                  fill="#85A3DC"
                />
                <Line
                  dataKey="instagram"
                  type="linear"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={1}
                  dot={true}
                  fill="hsl(var(--secondary))"
                />
                <Line
                  dataKey="other"
                  type="linear"
                  stroke="#4A6395"
                  strokeWidth={1}
                  dot={true}
                  fill="#4A6395"
                />
              </LineChart>
            </ChartContainer>
          </div>

          <div className="flex gap-2 items-center justify-between">
            <ItemChart color="hsl(var(--secondary))" text="Instagram" />
            <ItemChart color="hsl(var(--primary))" text="Facebook" />
            <ItemChart color="#85A3DC" text="Olx" />
            <ItemChart color="green" text="Whatsapp" />
            <ItemChart color="#4A6395" text="Outros" />
          </div>
        </>
      )}
    </div>
  );
}

export function ItemChart({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-start gap-1.5 mt-2">
      <div
        className="w-2 h-2  translate-y-[3px] rounded-full border font-bold border-gray-100"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-[#C8CCD2] font-bold text-xs">{text}</span>
    </div>
  );
}
