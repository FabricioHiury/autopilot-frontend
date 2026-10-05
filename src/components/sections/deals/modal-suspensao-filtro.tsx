'use client';
import { useEffect, useState } from 'react';
import { SuspensionFilter } from '@/types/suspension';

export interface ModalSuspensaoFiltroProps {
  value: SuspensionFilter;
  onFilter: (filtro: SuspensionFilter) => void;
}

export function ModalSuspensaoFiltro({ value, onFilter }: ModalSuspensaoFiltroProps) {
  const [filtro, setFiltro] = useState<SuspensionFilter>(value);

  useEffect(() => {
    setFiltro(value);
  }, [value]);

  const handleApplyFilter = () => {
    onFilter(filtro);
  };

  const handleReset = () => {
    const resetFiltro: SuspensionFilter = {
      description: '',
      userId: undefined,
      startDateInicio: undefined,
      startDateFim: undefined,
      ativas: false,
    };
    setFiltro(resetFiltro);
    onFilter(resetFiltro);
  };

  const handleChange = (field: keyof SuspensionFilter, value: any) => {
    setFiltro((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white p-4 rounded-[0.5rem] shadow-xl">
      <h2 className="text-lg font-semibold mb-4 text-[#1B263A]">Filtros</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1B263A] mb-1">Descrição</label>
          <input
            type="text"
            value={filtro.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
            placeholder="Buscar por descrição"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B263A] mb-1">Data de início</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-[#7F8999] mb-1">De</label>
              <input
                type="date"
                value={filtro.startDateInicio || ''}
                onChange={(e) => handleChange('startDateInicio', e.target.value)}
                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#7F8999] mb-1">Até</label>
              <input
                type="date"
                value={filtro.startDateFim || ''}
                onChange={(e) => handleChange('startDateFim', e.target.value)}
                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativas"
            checked={filtro.ativas || false}
            onChange={(e) => handleChange('ativas', e.target.checked)}
            className="h-4 w-4 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] rounded border-[#DDE6F2]"
          />
          <label htmlFor="ativas" className="ml-2 block text-sm text-[#1B263A]">
            Mostrar apenas suspensões ativas
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-[0.5rem] bg-white border border-[#DDE6F2] text-[#7F8999] hover:bg-[#F2F4F7] text-sm font-medium"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-4 py-2 rounded-[0.5rem] bg-[#1B263A] text-secondary-foreground hover:bg-[hsl(var(--secondary))] text-sm font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
