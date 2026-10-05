'use client';

import { Calendar } from '@/components/ui/calendar';
import { useCallback, useState } from 'react';
import { DateRange } from 'react-day-picker';
import FocusBlock from './FocusBlock';
import { ptBR } from 'date-fns/locale';

interface CalendarSelectProps {
  range?: DateRange;
  setRange: (value: DateRange | undefined) => void;
  default?: number;
}

const CalendarSelect: React.FC<CalendarSelectProps> = ({
  range,
  setRange,
  default: variant = 0,
}) => {
  const [isDropped, setIsDropped] = useState(false);

  const toggleDrop = useCallback(() => {
    setIsDropped((prev) => !prev);
  }, []);

  return (
    <FocusBlock setVisibleBlock={setIsDropped} className="relative">
      {variant === 0 && (
        <button
          type="button"
          className="flex flex-col flex-shrink-0 justify-center items-center border h-10 w-10 lg:h-auto lg:w-auto border-[#6C7788] px-2 py-1.5 rounded-md gap-0 relative transition-all duration-200"
          onClick={toggleDrop}
          aria-haspopup="dialog"
          aria-expanded={isDropped}
          aria-label="Selecionar período"
        >
          <div className="relative w-full flex px-1 justify-center items-center gap-3 text-[#6C7788] focus:text-[#485B80]">
            <img src="/icons/calendar2.svg" alt="" />
            <div className="gap-2 items-center hidden lg:flex">
              <span className="translate-y-[2px]">Período</span>
              <img src="/images/arrowDown.png" alt="" className="w-4" />
            </div>
          </div>
        </button>
      )}

      {variant === 1 && (
        <button
          type="button"
          className="p-3 transition-all duration-300 ease-in-out hover:bg-slate-200 group rounded-full"
          onClick={toggleDrop}
          aria-haspopup="dialog"
          aria-expanded={isDropped}
          aria-label="Selecionar período"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 8.7781H18M14.4444 1.66699V5.22255M5.55556 1.66699V5.22255M5.88889 11.9025H6.80267M13.1973 11.9025H14.1111M9.54311 11.9025H10.4569M5.88889 14.6439H6.80267M13.1973 14.6439H14.1111M9.54311 14.6439H10.4569M14.4444 3.44477H5.55556C4.61256 3.44477 3.70819 3.81937 3.0414 4.48617C2.3746 5.15296 2 6.05733 2 7.00033V14.7781C2 15.7211 2.3746 16.6255 3.0414 17.2923C3.70819 17.9591 4.61256 18.3337 5.55556 18.3337H14.4444C15.3874 18.3337 16.2918 17.9591 16.9586 17.2923C17.6254 16.6255 18 15.7211 18 14.7781V7.00033C18 6.05733 17.6254 5.15296 16.9586 4.48617C16.2918 3.81937 15.3874 3.44477 14.4444 3.44477Z"
              stroke="#586E9D"
              className="group-hover:stroke-slate-950 duration-300 ease-in-out"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {isDropped && (
        <div className="absolute top-0 right-0 z-20 bg-white border">
          <Calendar
            locale={ptBR}
            mode="range"
            selected={range}
            onSelect={(value) => setRange(value)}
            numberOfMonths={1}
            initialFocus
          />
        </div>
      )}
    </FocusBlock>
  );
};

export default CalendarSelect;
