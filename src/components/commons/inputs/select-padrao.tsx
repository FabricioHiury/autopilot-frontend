'use client';
import { cn } from '@/lib/class-name.utils';
import { useState, useEffect } from 'react';
import { SelectContent, SelectItem } from '../../ui/select-custom';
import * as Select from '@radix-ui/react-select';

export interface OptionSelectType {
  label: string;
  value: string;
}

export interface SelectPadraoProps {
  value: string | undefined;
  options: OptionSelectType[];
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  className?: string;
}

export function SelectPadrao(props: SelectPadraoProps) {
  const { options = [], onChange, placeholder, className, disabled } = props;

  const [open, setOpen] = useState(props.open || false);
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleOnChange = (value: string | undefined) => {
    setValue(value);
    onChange && onChange(value);
  };

  return (
    <Select.Root value={value} open={open} onOpenChange={setOpen} onValueChange={handleOnChange}>
      <Select.Trigger
        className="w-full text-[#6C7788] rounded-[0.5rem] disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        disabled={disabled}
      >
        <div
          className={cn(
            'flex w-full items-center justify-between rounded-[0.5rem] border border-input bg-transparent px-3 h-[2.5rem] text-sm transition-colors file:border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <div className="flex flex-col items-start gap-0.5">
            {!value && <span className="text-muted-foreground">{placeholder}</span>}
            {value && (
              <div className="flex gap-1 items-center">
                {options.find((option) => option.value === value)?.label}
              </div>
            )}
          </div>
          <div
            className="w-3 h-3 flex items-center ml-2 justify-center transition-transform data-[open=true]:rotate-180"
            data-open={open}
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
      {!disabled && (
        <SelectContent className="text-[#6C7788]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-1">{option.label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      )}
    </Select.Root>
  );
}
