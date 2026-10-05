'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/class-name.utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { useEffect, useState } from 'react';
import { ptBR } from 'date-fns/locale';

interface IDatePickerRangeProps {
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
}

export function DatePickerRange(props: IDatePickerRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>(props.value);

  const onSelect = (range: DateRange | undefined) => {
    if (range && !range.to) {
      range.to = range.from;
    }

    setDate(range);
    if (props.onChange) {
      props.onChange(range);
    }
  };

  useEffect(() => {
    setDate(props.value);
  }, [props.value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex h-9 w-full rounded-[0.5rem] border border-input bg-white px-3 py-1 text-sm transition-colors items-center justify-between',
            !date && 'text-muted-foreground',
          )}
        >
          <div className="flex items-center gap-2">
            <svg
              width="18"
              height="20"
              viewBox="0 0 18 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.99219 10.375H9.49219V15.25M0.867188 7H17.3672M12.8672 4V1M5.36719 4V1M2.36719 19H15.8672C16.265 19 16.6465 18.842 16.9278 18.5607C17.2092 18.2794 17.3672 17.8978 17.3672 17.5V4C17.3672 3.60218 17.2092 3.22064 16.9278 2.93934C16.6465 2.65804 16.265 2.5 15.8672 2.5H2.36719C1.96936 2.5 1.58783 2.65804 1.30653 2.93934C1.02522 3.22064 0.867188 3.60218 0.867188 4V17.5C0.867188 17.8978 1.02522 18.2794 1.30653 18.5607C1.58783 18.842 1.96936 19 2.36719 19Z"
                stroke="#485B80"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[hsl(var(--secondary))]">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'dd/MM/uuuu')} - {format(date.to, 'dd/MM/uuuu')}
                  </>
                ) : (
                  format(date.from, 'dd/MM/uuuu')
                )
              ) : (
                'Selecione o período'
              )}
            </span>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#000000"
            viewBox="0 0 256 256"
          >
            <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"></path>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={ptBR}
          mode="range"
          selected={date}
          onSelect={onSelect}
          numberOfMonths={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
