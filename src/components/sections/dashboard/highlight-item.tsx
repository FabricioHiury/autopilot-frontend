import Image from 'next/image';

export interface HighlightItemProps {
  title: string;
  value: string | number;
  percentage?: string | number;
}

export default function HighlightItem({ title, value, percentage }: HighlightItemProps) {
  let valueString: string;
  let percentageString: string | undefined;

  if (typeof value === 'number') {
    valueString = Math.abs(value).toLocaleString('pt-BR');
  } else {
    valueString = value;
  }

  const percentNumber = typeof percentage === 'number' ? percentage : undefined;

  if (typeof percentage === 'number') {
    percentageString = Math.abs(percentage).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  } else {
    percentageString = percentage;
  }

  const isNegative = typeof percentNumber === 'number' && percentNumber < 0;

  return (
    <div className="w-full md:w-auto min-w-[180px] md:min-w-[220px] bg-white rounded-xl border border-[#EBEEF2] p-4 flex flex-col gap-1">
      <h3 className="text-[#7F8999] text-[.75rem] uppercase">{title}</h3>
      <span className="block text-[hsl(var(--secondary))] font-semibold leading-[1em] text-[2rem] md:text-[2.5rem]">
        {valueString}
      </span>

      {percentage ? (
        <div className="flex items-center justify-start gap-2 mt-1">
          <div
            className={`w-[2rem] h-[1.125rem] rounded-full flex items-center justify-center ${isNegative ? 'bg-[#FF4D4F]' : 'bg-[#32D386]'}`}
          >
            <Image
              src="/icons/icon_chart_arrow_up.svg"
              width={15}
              height={15}
              alt={isNegative ? 'Gráfico queda' : 'Gráfico crescimento'}
              className={isNegative ? 'rotate-180' : ''}
            />
          </div>
          <span className="block text-[#7F8999] text-[.875rem] leading-tight">
            {percentageString} {isNegative ? '% - que semana passada' : '% + que semana passada'}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-start gap-1 mt-1"></div>
      )}
    </div>
  );
}
