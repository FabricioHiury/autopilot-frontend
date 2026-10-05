'use client';

import * as React from 'react';
import { cn } from '@/lib/class-name.utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import IconRelogio from '../../sections/deals/icons/icon-relogio';

interface TimePickerProps {
  onChange: (value: string) => void;
  value?: string;
  className?: string;
}

export function TimePicker({ onChange, value, className }: TimePickerProps) {
  const [time, setTime] = React.useState<string>(value || '');
  const [isOpen, setIsOpen] = React.useState(false);
  const [rawInput, setRawInput] = React.useState<string>('');

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    onChange(newTime);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '').slice(0, 4);
    setRawInput(inputValue);
  };

  const parseAndFormatTime = (value: string) => {
    if (!value || value.length === 0) {
      setTime('');
      onChange('');
      return;
    }

    const digits = value.replace(/\D/g, '');
    let hour: string;
    let minute: string;

    if (digits.length === 1) {
      hour = digits.padStart(2, '0');
      minute = '00';
    } else if (digits.length === 2) {
      const num = parseInt(digits);
      if (num <= 23) {
        hour = digits;
        minute = '00';
      } else {
        hour = digits[0].padStart(2, '0');
        minute = digits[1].padStart(2, '0');
      }
    } else if (digits.length === 3) {
      const firstTwo = parseInt(digits.slice(0, 2));
      if (firstTwo <= 23) {
        hour = digits.slice(0, 2);
        minute = digits.slice(2).padStart(2, '0');
      } else {
        hour = digits[0].padStart(2, '0');
        minute = digits.slice(1);
      }
    } else if (digits.length === 4) {
      const firstTwo = parseInt(digits.slice(0, 2));
      if (firstTwo <= 23) {
        hour = digits.slice(0, 2);
        minute = digits.slice(2);
      } else {
        hour = digits[0].padStart(2, '0');
        minute = digits.slice(1, 3);
      }
    } else {
      return;
    }

    const validHour = Math.min(parseInt(hour), 23);
    const validMinute = Math.min(parseInt(minute), 59);

    const formattedTime = `${validHour.toString().padStart(2, '0')}:${validMinute.toString().padStart(2, '0')}`;
    setTime(formattedTime);
    onChange(formattedTime);
    setRawInput('');
    setIsOpen(false);
  };

  const handleDirectInputBlur = () => {
    parseAndFormatTime(rawInput);
  };

  const handleDirectInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      parseAndFormatTime(rawInput);
    }
  };

  const displayValue = time || 'Selecione um horário';

  React.useEffect(() => {
    if (value !== undefined) {
      setTime(value);
    }
  }, [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full rounded-[0.5rem] border border-input bg-white px-3 py-1 text-sm transition-colors items-center justify-between',
            !time && 'text-muted-foreground',
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <IconRelogio />
            <span>{displayValue}</span>
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
      <PopoverContent className="w-auto p-4" containerSelector="#content-container">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Horário</label>
            <input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Ou digite diretamente</label>
            <input
              type="text"
              placeholder="143 ou 1430"
              value={rawInput}
              onChange={handleDirectInput}
              onBlur={handleDirectInputBlur}
              onKeyDown={handleDirectInputKeyDown}
              className="w-full px-3 py-2 border border-input rounded-md text-sm text-center"
              maxLength={4}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
