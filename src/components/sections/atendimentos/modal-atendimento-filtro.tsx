"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiApp } from "@/lib/api-app";
import { ColaboradorType } from "@/utils/types/colaborador-type";
import { addHours } from "date-fns";
import { profileImageUrl } from "@/lib/profile.utils";
import { TagItem } from "@/model/tag";
import { DatePickerRange } from "@/components/commons/inputs/date-picker-range";
import AvatarUser from "@/components/commons/avatar-user";
import IconX from "@/components/icons/icon-x";
import AvatarCanal from "@/components/commons/avatar-canal";
import PesquisarAtendimentos from "./pesquisar-atentimentos";
import RadioTipoAtendimentos from "./radio-tipo-atendimento";

export interface FiltroAtendimentoType {
    pesquisa?: string;
    tipoAtendimento?: 'todos' | 'compra' | 'venda' | 'consignado';
    canais?: string[];
    colaboradores?: string[];
    periodo?: { inicio: Date | undefined, fim: Date | undefined };
    tarefasAtribuidas?: string;
    idTag?: string;
    idsTags?: string[];
    isArchived?: boolean;
}

export interface ModalAtendimentoFiltroProps {
    value: FiltroAtendimentoType;
    onFilter: (value: FiltroAtendimentoType, options?: { close?: boolean }) => Promise<void> | void;
}

export function ModalAtendimentoFiltro({ value, onFilter }: ModalAtendimentoFiltroProps) {
    const api = new ApiApp();
    const [tags, setTags] = useState<TagItem[]>([]);
    const [idsTags, setIdsTags] = useState<string[]>(value.idsTags || (value.idTag ? [value.idTag] : []));
    const canaisDefault = [
        'whatsapp', 'instagram', 'facebook', 'olx', 'showroom', 'usadosbr', 'icarros', 'mobiauto', 'webmotors', 'ligacao', 'outros'
    ];
    const apiApp = new ApiApp();
    const [colaboradoresList, setColaboradoresList] = useState<ColaboradorType[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [pesquisa, setPesquisa] = useState<string>(value.pesquisa || '');
    const [tipoAtendimento, setTipoAtendimento] = useState<'todos' | 'compra' | 'venda' | 'consignado'>(value.tipoAtendimento || 'todos');
    const [canais, setCanais] = useState<string[]>(value.canais || []);
    const [colaboradores, setColaboradores] = useState<string[]>(value.colaboradores || []);
    const [periodo, setPeriodo] = useState<{ from: Date | undefined; to?: Date | undefined; } | undefined>(
        value.periodo ? {
            from: value.periodo.inicio,
            to: value.periodo.fim
        } : undefined
    );
    const [tarefasAtribuidas, setAtribuidasAMim] = useState<boolean>(value.tarefasAtribuidas === 'true');
    const [isArchived, setIsArchived] = useState<boolean>(!!value.isArchived);

    useEffect(() => {
        setPesquisa(value.pesquisa || '');
        setTipoAtendimento(value.tipoAtendimento || 'todos');
        setCanais(value.canais || []);
        setColaboradores(value.colaboradores || []);
        setPeriodo(value.periodo ? {
            from: value.periodo.inicio,
            to: value.periodo.fim
        } : undefined);
        setAtribuidasAMim(value.tarefasAtribuidas === 'true');
        setIdsTags(value.idsTags || (value.idTag ? [value.idTag] : []));
        setIsArchived(!!value.isArchived);
        fetchTags();
    }, [value]);

    // Helper para converter hex em rgba com alpha
    const hexToRGBA = (hex: string, alpha: number) => {
        try {
            const normalized = hex.replace('#', '');
            const fullHex = normalized.length === 3
                ? normalized.split('').map(c => c + c).join('')
                : normalized;
            const r = parseInt(fullHex.substring(0, 2), 16);
            const g = parseInt(fullHex.substring(2, 4), 16);
            const b = parseInt(fullHex.substring(4, 6), 16);
            const a = Math.min(Math.max(alpha, 0), 1);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        } catch {
            return hex;
        }
    };

    const fechtColaboradores = async () => {
        const [data, error] = await apiApp.colaborador.listar({ quantidade: 100 });
        if (error || !data) {
            console.error(error);
            return;
        }
        const colaboradores = data.colaboradores;
        setColaboradoresList(colaboradores);
        if (!value.colaboradores || value.colaboradores.length === 0) {
            setColaboradores([]);
        }
    }

    const handleCanal = (canal: string) => {
        if (canais.includes(canal)) {
            setCanais(canais.filter(c => c !== canal));
        } else {
            setCanais([...canais, canal]);
        }
    }

    const handleColaborador = (colaborador: string) => {
        if (colaboradores.includes(colaborador)) {
            setColaboradores(colaboradores.filter(c => c !== colaborador));
        } else {
            setColaboradores([...colaboradores, colaborador]);
        }
    }

    const fetchTags = async () => {
        setLoading(true);
        const [data, error] = await api.atendimento.buscarTags();
        if (error) {
            setLoading(false);
            return;
        }
        const normalized = (data || []).map((t: any) => ({
            id: t.id,
            name: t.name ?? t.nome,
            color: t.color ?? t.cor,
            description: t.description ?? t.descricao,
        })) as TagItem[];
        setTags(normalized);
        setLoading(false);
    };

    const isCanalActive = (canal: string) => canais.includes(canal);
    const isColaboradorActive = (colaborador: string) => colaboradores.includes(colaborador);

    const isAbleToSearch = () => {
        const isPesquisa = pesquisa.trim().length > 0;
        const isCanal = canais.length > 0;
        const isColaborador = colaboradores.length > 0;
        const isTipoAtendimento = tipoAtendimento !== 'todos';
        const isPeriodo = periodo?.from || periodo?.to;
        const isAtribuidasAMim = tarefasAtribuidas;
        const isTag = idsTags.length > 0;
        const isArquivados = isArchived;
        return isCanal || isColaborador || isPesquisa || isTipoAtendimento || isPeriodo || isAtribuidasAMim || isTag || isArquivados;
    }

    const handleTagClick = (tagId?: string) => {
        if (!tagId) return;
        setIdsTags((prev) => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    }

    const handleSearch = async () => {
        setLoading(true);

        await onFilter({
            pesquisa,
            tipoAtendimento,
            canais: canais.length > 0 ? canais : undefined,
            colaboradores: colaboradoresList && colaboradores.length > 0 ? colaboradores : undefined,
            periodo: { inicio: periodo?.from, fim: periodo?.to ? addHours(periodo.to, 23.99) : undefined },
            tarefasAtribuidas: tarefasAtribuidas ? 'true' : 'false',
            idsTags: idsTags.length > 0 ? idsTags : undefined,
            idTag: undefined,
            isArchived: isArchived ? true : undefined,
        }, { close: true });
        setLoading(false);
    }

    const resetAll = () => {
        setPesquisa('');
        setTipoAtendimento('todos');
        setCanais([]);
        setColaboradores([]);
        setPeriodo(undefined);
        setAtribuidasAMim(false);
        setIdsTags([]);
        setIsArchived(false);
        onFilter({
            pesquisa: '',
            tipoAtendimento: 'todos',
            canais: undefined,
            colaboradores: undefined,
            periodo: undefined,
            tarefasAtribuidas: 'false',
            idsTags: undefined,
            idTag: undefined,
            isArchived: undefined
        }, { close: false });
    };
    const buildFilter = (overrides?: Partial<FiltroAtendimentoType>): FiltroAtendimentoType => ({
        pesquisa,
        tipoAtendimento,
        canais: canais.length > 0 ? canais : undefined,
        colaboradores: colaboradoresList && colaboradores.length > 0 ? colaboradores : undefined,
        periodo: { inicio: periodo?.from, fim: periodo?.to ? addHours(periodo.to, 23.99) : undefined },
        tarefasAtribuidas: tarefasAtribuidas ? 'true' : 'false',
        idsTags: idsTags.length > 0 ? idsTags : undefined,
        idTag: undefined,
        isArchived: isArchived ? true : undefined,
        ...overrides,
    });

    useEffect(() => {
        fechtColaboradores();
    }, []);

    const RenderColaborador = useCallback(({ colaborador }: { colaborador: ColaboradorType }) => {
        return (
            <button
                key={colaborador.id}
                className="z-0 opacity-60 saturate-0 transition-all duration-150 data-[active=true]:opacity-100 data-[active=true]:saturate-100 data-[active=true]:z-10"
                onClick={() => handleColaborador(colaborador.id)}
                data-active={isColaboradorActive(colaborador.id)} >
                <AvatarUser
                    src={profileImageUrl(colaborador.idUsuario)}
                    name={colaborador.nome}
                />
            </button>
        )
    }, [colaboradores]);

    return (
        <div className="w-full text-white md:rounded-[0.75rem] md:shadow-xl p-6 md:p-5 pb-[8rem] bg-gradient-to-b from-[#23324a] to-[#1b263a] border border-[#3A4B6A] animate-fade-in-top max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
            <div>
                <PesquisarAtendimentos value={pesquisa} onChange={setPesquisa} className="md:rounded-t-none bg-[#1F2A44] border border-[#3A4B6A] text-[#DDE6F2]" />

                <div className="mt-4">
                    <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Tipo de atendimento</span>
                    <div className="mt-2 overflow-x-auto md:overflow-visible">
                        <RadioTipoAtendimentos
                            value={tipoAtendimento || 'todos'}
                            onChange={(v) => setTipoAtendimento(v)}
                            className="text-[#A8B4CC] data-[active=true]:text-white data-[active=true]:bg-[#1F2A44]"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Período</span>
                    <div className="mt-2">
                        <div className="p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A]">
                            <DatePickerRange value={periodo} onChange={setPeriodo} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 md:pt-4 space-y-6 md:space-y-4">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Filtrar por plataforma</span>
                            <div className="flex gap-2 flex-wrap overflow-y-auto p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] max-h-[160px] scrollbar-mini">
                                {canaisDefault.map((canal) => (
                                    <button key={canal} className="opacity-60 saturate-0 transition-all duration-150 data-[active=true]:opacity-100 data-[active=true]:saturate-100 rounded-full hover:opacity-100 data-[active=true]:ring-2 data-[active=true]:ring-[#D33632]"
                                        onClick={() => handleCanal(canal)}
                                        data-active={isCanalActive(canal)}
                                    >
                                        <AvatarCanal canal={canal} className="bg-white" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Filtrar por colaborador</span>
                            <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-y-auto whitespace-nowrap p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] md:max-h-[160px] scrollbar-mini">
                                {!colaboradoresList &&
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="bg-[#2A3B5E] w-11 h-11 rounded-full shrink-0"></div>
                                    ))
                                }
                                {colaboradoresList && colaboradoresList.map((colaborador) => RenderColaborador({ colaborador }))}
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Filtros adicionais</span>
                        <div className="flex items-center gap-3 p-3 rounded-md bg-[#1F2A44] border border-[#3A4B6A]">
                            <label htmlFor="atribuidasAMim" className="text-sm font-medium text-[#DDE6F2]">Tarefas atribuídas a mim</label>
                            <button
                                id="atribuidasAMim"
                                type="button"
                                className="relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                                style={{ backgroundColor: tarefasAtribuidas ? '#D33632' : '#3A4B6A' }}
                                onClick={() => setAtribuidasAMim(!tarefasAtribuidas)}
                                aria-pressed={tarefasAtribuidas}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                                    style={{ transform: tarefasAtribuidas ? 'translateX(1.0rem)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-md bg-[#1F2A44] border border-[#3A4B6A]">
                            <label htmlFor="arquivadosSwitch" className="text-sm font-medium text-[#DDE6F2]">Arquivados</label>
                            <button
                                id="arquivadosSwitch"
                                type="button"
                                className="relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                                style={{ backgroundColor: isArchived ? '#D33632' : '#3A4B6A' }}
                                onClick={() => setIsArchived(!isArchived)}
                                aria-pressed={isArchived}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                                    style={{ transform: isArchived ? 'translateX(1.0rem)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>
                    </div>


                    {/* Filtrar por etiqueta */}
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">Filtrar por etiqueta</span>
                        <div className="flex gap-2 flex-wrap p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] max-h-[90px] overflow-y-scroll scrollbar-mini">
                            {loading && <span className="text-xs text-[#A8B4CC]">Carregando etiquetas...</span>}
                            {!loading && tags.length === 0 && (
                                <span className="text-xs text-[#A8B4CC]">Nenhuma etiqueta criada.</span>
                            )}
                            {!loading && tags.length > 0 && tags.map((item) => (
                                <button
                                    key={(item.id || item.name) + item.color}
                                    className="shrink-0 rounded-[.25rem] border border-[#3A4B6A] px-2 py-1 text-xs font-semibold hover:ring-2 hover:ring-[#D33632] transition-all data-[active=true]:ring-2 data-[active=true]:ring-[#D33632]"
                                    onClick={() => handleTagClick(item.id)}
                                    data-active={idsTags.includes(item.id!)}
                                    style={{ backgroundColor: item.color ? hexToRGBA(item.color, 0.18) : '#E5E7EB', color: item.color || '#485B80' }}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-6 md:gap-4 items-end border-t border-[#3A4B6A] pt-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 flex-wrap">
                                {pesquisa.length > 0 && <ItemSelectedFilter label={pesquisa} onRemove={() => { setPesquisa(''); onFilter(buildFilter({ pesquisa: '' }), { close: false }); }} />}
                                {periodo && periodo.from && <ItemSelectedFilter label={`${periodo.from.toLocaleDateString()} ${periodo.to ? `a ${periodo.to.toLocaleDateString()}` : ''}`} onRemove={() => { setPeriodo(undefined); onFilter(buildFilter({ periodo: undefined }), { close: false }); }} />}
                                {canais.length > 0 && <ItemSelectedFilter label={
                                    canais.length === 1 ? canais[0] || '1 canal' :
                                        `${canais.length} canais`
                                } onRemove={() => { setCanais([]); onFilter(buildFilter({ canais: undefined }), { close: false }); }} />}
                                {colaboradoresList && colaboradores.length > 0 && colaboradores.length !== colaboradoresList?.length && <ItemSelectedFilter label={
                                    colaboradores.length === 1 ? colaboradoresList?.find(c => c.id === colaboradores[0])?.nome || '1 colaborador' :
                                        `${colaboradores.length} colaboradores`
                                } onRemove={() => { setColaboradores([]); onFilter(buildFilter({ colaboradores: undefined }), { close: false }); }} />}
                                {tarefasAtribuidas && <ItemSelectedFilter label="Atribuídas a mim" onRemove={() => { setAtribuidasAMim(false); onFilter(buildFilter({ tarefasAtribuidas: 'false' }), { close: false }); }} />}
                                {isArchived && <ItemSelectedFilter label="Arquivados" onRemove={() => { setIsArchived(false); onFilter(buildFilter({ isArchived: undefined }), { close: false }); }} />}
                                {idsTags.length > 0 && idsTags.map((tagId) => (
                                    <ItemSelectedFilter key={tagId} label={tags.find(t => t.id === tagId)?.name || 'Etiqueta'} onRemove={() => {
                                        const next = idsTags.filter(id => id !== tagId);
                                        setIdsTags(next);
                                        onFilter(buildFilter({ idsTags: next.length > 0 ? next : undefined }), { close: false });
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="mt-6 pt-4 border-t border-[#3A4B6A] flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 h-10 rounded-md border border-[#3A4B6A] bg-[#1F2A44] text-[#DDE6F2] hover:bg-[#223251] transition-colors"
                        onClick={resetAll}
                    >
                        Limpar
                    </button>
                    <button
                        type="button"
                        className={`px-6 h-10 rounded-md ${isAbleToSearch() ? 'bg-[#D33632] hover:bg-[#B12B27]' : 'bg-[#12161F] hover:bg-[#0E121A]'} text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!isAbleToSearch() || loading}
                        onClick={handleSearch}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
}


function ItemSelectedFilter({ label, onRemove, onApply, disable }: { label: string, onRemove: () => void, onApply?: () => void, disable?: boolean }) {
    return (
        <button className="bg-[#1F2A44] border border-[#3A4B6A] text-[#DDE6F2] text-xs font-semibold rounded-full pl-3 pr-2 py-1.5 max-w-[12rem] flex items-center gap-1.5 justify-between hover:bg-[#223251] transition-colors disabled:cursor-not-allowed shadow-sm" onClick={() => { onRemove(); onApply && onApply(); }} disabled={disable}>
            <span className="truncate capitalize">{label}</span>
            <IconX color="#A8B4CC" className="shrink-0" />
        </button>
    )
}
