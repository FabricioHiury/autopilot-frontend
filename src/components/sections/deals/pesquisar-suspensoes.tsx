'use client';
import { useEffect, useState } from 'react';
import { IconSearch } from '@/components/icons/icon-search';
import { cn } from '@/lib/class-name.utils';

interface PesquisarSuspensoesProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function PesquisarSuspensoes({
  value,
  onChange,
  className,
}: PesquisarSuspensoesProps) {
  const [search, setPesquisa] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, onChange]);

  useEffect(() => {
    setPesquisa(value);
  }, [value]);

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar suspensões..."
          className="w-full pl-10 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch fill="#7F8999" />
        </div>
      </div>
    </div>
  );
}
