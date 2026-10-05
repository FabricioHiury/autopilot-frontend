'use client';
import { cn } from '@/lib/class-name.utils';
import { useState } from 'react';

import * as Select from '@radix-ui/react-select';
import { SelectContent, SelectItem } from '@/components/ui/select-custom';
import { DealStatus } from '@/types/deal-status';

export interface OptionSelectEtapaType {
  label: string;
  value: string;
  color: string;
}

export interface SelectEtapaProps {
  value: string | undefined;
  options: OptionSelectEtapaType[];
  onChange: (value: DealStatus) => void;
  placeholder?: string;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function SelectEtapa(props: SelectEtapaProps) {
  const { options, onChange, placeholder, className, disabled, isOpen = false, onToggle } = props;

  const [value, setValue] = useState(props.value);

  const handleOnChange = (value: DealStatus) => {
    setValue(value);
    onChange(value);
  };

  const handleColor = (value: string) => {
    return options.find((option) => option.value === value)?.color;
  };

  return (
    <Select.Root open={isOpen} onOpenChange={onToggle} onValueChange={handleOnChange}>
      <Select.Trigger className="w-full md:w-fit md:min-w-52 text-[#6C7788]">
        <div
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-[0.5rem] bg-[#F2F4F7] px-3 h-10 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <div className="flex flex-col items-start gap-0.5">
            {!value && <span className="text-muted-foreground">{placeholder}</span>}
            {value && (
              <div className="flex gap-2 items-center font-semibold text-[#485B80]">
                <div
                  className="w-2 h-2 rounded-[0.1rem]"
                  style={{ backgroundColor: handleColor(value) }}
                ></div>
                {options.find((option) => option.value === value)?.label}
              </div>
            )}
          </div>
          <div
            className="w-3 h-3 flex items-center justify-center transition-transform data-[open=true]:rotate-180"
            data-open={isOpen}
          >
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.95093L6.00081 6.53093L11 1.95093"
                stroke="#7F8999"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </Select.Trigger>
      <SelectContent className="z-50">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2 py-1 font-semibold text-[#485B80]">
              <div
                className="w-2 h-2 rounded-[0.1rem]"
                style={{ backgroundColor: option.color }}
              ></div>
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select.Root>
  );
}
