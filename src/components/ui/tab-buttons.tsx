import React from 'react';
import { cn } from '@/lib/class-name.utils';

export interface TabButtonsItem {
  key: string;
  label?: string;
  icon?: React.ElementType;
}

export interface TabButtonsProps<T extends string = string> {
  items: Array<T | TabButtonsItem>;
  value: T;
  onChange: (key: T) => void;
  icon?: React.ElementType;
  containerClassName?: string;
  buttonClassName?: string;
  selectedClassName?: string;
  unselectedClassName?: string;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function TabButtons<T extends string = string>({
  items,
  value,
  onChange,
  icon,
  containerClassName,
  buttonClassName,
  selectedClassName,
  unselectedClassName,
}: TabButtonsProps<T>) {
  const normalized = items.map((it) =>
    typeof it === 'string'
      ? ({ key: it, label: capitalize(it) } as TabButtonsItem)
      : ({ ...it, label: it.label ?? capitalize(it.key) } as TabButtonsItem),
  );

  return (
    <div
      className={cn('flex flex-wrap xl:flex-nowrap gap-2 mb-4 justify-start', containerClassName)}
    >
      {normalized.map(({ key, label, icon: ItemIcon }) => {
        const IconComp = ItemIcon ?? icon;
        const isActive = value === (key as T);
        const classes = cn(
          'px-4 py-2 text-sm font-medium transition-colors rounded-[.25rem] flex gap-2 items-center',
          buttonClassName,
          isActive
            ? (selectedClassName ?? 'bg-white text-[#1B263A]')
            : (unselectedClassName ?? 'text-[#7F8999] hover:text-blue-900'),
        );

        return (
          <button key={key} onClick={() => onChange(key as T)} className={classes}>
            {IconComp && <IconComp />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
