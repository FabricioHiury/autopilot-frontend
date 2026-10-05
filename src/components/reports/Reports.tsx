import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ComposedChart,
} from 'recharts';

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter' | 'composed';

interface SeriesCommon {
  name?: string;
  color?: string;
  strokeWidth?: number;
  stackId?: string;
  fillOpacity?: number;
  type?: 'line' | 'bar' | 'area' | 'scatter' | 'radar';
}

interface CartesianSeries extends SeriesCommon {
  dataKey: string;
}

interface ScatterSeries extends SeriesCommon {
  xKey: string;
  yKey: string;
}

interface PieSeries {
  dataKey: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[]; // optional custom colors for slices
}

interface ReportsProps {
  type: ChartType;
  data: any[];
  height?: number;
  className?: string;
  icon?: React.ReactNode;

  xKey?: string;
  series?: (CartesianSeries | ScatterSeries)[];
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;

  pieSeries?: PieSeries[];
}

const PALETTE = ['#2A3E65', 'hsl(var(--primary))'];

function colorAt(index: number, override?: string) {
  return override ?? PALETTE[index % PALETTE.length];
}

export default function Reports(props: ReportsProps) {
  const {
    type,
    data,
    height = 320,
    icon,
    className,
    xKey,
    series = [],
    layout = 'horizontal',
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    pieSeries = [],
  } = props;

  const commonCartesian = (
    <>
      {showGrid && <CartesianGrid strokeDasharray="3 3" />}
      {xKey && <XAxis dataKey={xKey} />}
      <YAxis />
      {showTooltip && <Tooltip />}
      {showLegend && <Legend />}
    </>
  );

  const renderCartesianSeries = (chartType: 'line' | 'bar' | 'area') => {
    const seen = new Set<string>();
    return series
      .filter((s: any) => (s.type ?? chartType) === chartType && (s as any).dataKey)
      .filter((s: any) => {
        const key = `${chartType}:${(s as any).dataKey}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((s: any, i: number) => {
        const color = colorAt(i, s.color);
        if (chartType === 'line') {
          return (
            <Line
              key={`line-${s.dataKey}-${i}`}
              type="monotone"
              dataKey={(s as CartesianSeries).dataKey}
              name={s.name}
              stroke={color}
              strokeWidth={s.strokeWidth ?? 2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          );
        }
        if (chartType === 'bar') {
          return (
            <Bar
              key={`bar-${s.dataKey}-${i}`}
              dataKey={(s as CartesianSeries).dataKey}
              name={s.name}
              fill={color}
              legendType="circle"
              stackId={s.stackId}
            />
          );
        }
        // area
        return (
          <Area
            key={`area-${s.dataKey}-${i}`}
            type="monotone"
            dataKey={(s as CartesianSeries).dataKey}
            name={s.name}
            stroke={color}
            fill={color}
            fillOpacity={s.fillOpacity ?? 0.2}
          />
        );
      });
  };

  function renderRadar() {
    // Use xKey as category angles and series[].dataKey as value keys
    const seen = new Set<string>();
    return (
      <RadarChart data={data} outerRadius={90}>
        <PolarGrid />
        {xKey && <PolarAngleAxis dataKey={xKey} />}
        <PolarRadiusAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {series
          .filter((s: any) => (s.type ?? 'radar') === 'radar' && (s as any).dataKey)
          .filter((s: any) => {
            const key = `radar:${(s as any).dataKey}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((s: any, i: number) => (
            <Radar
              key={`radar-${(s as CartesianSeries).dataKey}-${i}`}
              name={s.name}
              dataKey={(s as CartesianSeries).dataKey}
              stroke={colorAt(i, s.color)}
              fill={colorAt(i, s.color)}
              fillOpacity={s.fillOpacity ?? 0.2}
            />
          ))}
      </RadarChart>
    );
  }

  function renderScatter() {
    const scatters = series.filter(
      (s: any) => (s.type ?? 'scatter') === 'scatter',
    ) as ScatterSeries[];
    const usePerSeriesKeys = scatters.some((s) => !!s.xKey && !!s.yKey);
    const xKeyGlobal = usePerSeriesKeys ? undefined : (xKey as string);
    const yKeyGlobal = !usePerSeriesKeys && series.length ? (series[0] as any).dataKey : undefined;

    const seen = new Set<string>();

    return (
      <ScatterChart>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {xKeyGlobal && <XAxis type="number" dataKey={xKeyGlobal} />}
        {yKeyGlobal && <YAxis type="number" dataKey={yKeyGlobal} />}
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {scatters
          .filter((s) => {
            const key = `scatter:${s.xKey}:${s.yKey}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((s: ScatterSeries, i: number) => {
            const points = usePerSeriesKeys
              ? data.map((d: any) => ({ x: d[s.xKey], y: d[s.yKey] }))
              : data;
            return (
              <Scatter
                key={`scatter-${i}`}
                name={s.name}
                data={points}
                fill={colorAt(i, s.color)}
              />
            );
          })}
      </ScatterChart>
    );
  }

  function renderPie() {
    const pies = pieSeries.length ? pieSeries : [{ dataKey: 'value', nameKey: xKey }];
    return (
      <PieChart>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {pies.map((p, i) => {
          const inner = p.innerRadius ?? (i > 0 ? 40 + i * 20 : 0);
          const outer = p.outerRadius ?? (i > 0 ? inner + 20 : 80);
          const colors = p.colors ?? PALETTE;
          return (
            <Pie
              key={`pie-${i}`}
              data={data}
              dataKey={p.dataKey}
              nameKey={p.nameKey ?? xKey}
              innerRadius={inner}
              outerRadius={outer}
              label
            >
              {data.map((_: any, idx: number) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
          );
        })}
      </PieChart>
    );
  }

  function renderComposed() {
    return (
      <ComposedChart data={data} layout={layout}>
        {commonCartesian}
        {/* Render mixed series based on series[].type */}
        {renderCartesianSeries('area')}
        {renderCartesianSeries('bar')}
        {renderCartesianSeries('line')}
      </ComposedChart>
    );
  }

  function renderChart() {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {commonCartesian}
            {renderCartesianSeries('line')}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data} layout={layout}>
            {commonCartesian}
            {renderCartesianSeries('bar')}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            {commonCartesian}
            {renderCartesianSeries('area')}
          </AreaChart>
        );
      case 'pie':
        return renderPie();
      case 'radar':
        return renderRadar();
      case 'scatter':
        return renderScatter();
      case 'composed':
      default:
        return renderComposed();
    }
  }

  return (
    <div className={'flex flex-col gap-2 ' + (className ?? '')}>
      {icon && <div className="mb-1">{icon}</div>}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
