'use client';
import { useEffect, useState } from 'react';
import { FiltroSuspensaoType } from '@/utils/types/suspensao-type';

export interface ModalSuspensaoFiltroProps {
    value: FiltroSuspensaoType;
    onFilter: (filtro: FiltroSuspensaoType) => void;
}

export function ModalSuspensaoFiltro({ value, onFilter }: ModalSuspensaoFiltroProps) {
    const [filtro, setFiltro] = useState<FiltroSuspensaoType>(value);

    useEffect(() => {
        setFiltro(value);
    }, [value]);

    const handleApplyFilter = () => {
        onFilter(filtro);
    };

    const handleReset = () => {
        const resetFiltro: FiltroSuspensaoType = {
            descricao: '',
            idUsuario: undefined,
            startDateInicio: undefined,
            startDateFim: undefined,
            ativas: false,
        };
        setFiltro(resetFiltro);
        onFilter(resetFiltro);
    };

    const handleChange = (field: keyof FiltroSuspensaoType, value: any) => {
        setFiltro(prev => ({
            ...prev,
            [field]: value
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
                        value={filtro.descricao || ''}
                        onChange={(e) => handleChange('descricao', e.target.value)}
                        className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
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
                                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[#7F8999] mb-1">Até</label>
                            <input
                                type="date"
                                value={filtro.startDateFim || ''}
                                onChange={(e) => handleChange('startDateFim', e.target.value)}
                                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
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
                        className="h-4 w-4 text-[#D33632] focus:ring-[#D33632] rounded border-[#DDE6F2]"
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
                        className="px-4 py-2 rounded-[0.5rem] bg-[#1B263A] text-white hover:bg-[#293856] text-sm font-medium"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
} 