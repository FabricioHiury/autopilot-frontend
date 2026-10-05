'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppServices } from '@/services/app.services';
import { Employee } from '@/types/employee';
import { addHours } from 'date-fns';
import { profileImageUrl } from '@/lib/profile.utils';
import { TagItem } from '@/types/tag';
import { DatePickerRange } from '@/components/commons/inputs/date-picker-range';
import AvatarUser from '@/components/commons/avatar-user';
import IconX from '@/components/icons/icon-x';
import AvatarCanal from '@/components/commons/avatar-canal';
import PesquisarAtendimentos from './pesquisar-atentimentos';
import RadioTipoAtendimentos from './radio-tipo-atendimento';

export interface DealFilter {
  search?: string;
  tipoAtendimento?: 'todos' | 'BUY' | 'SELL' | 'CONSIGNMENT';
  channels?: string[];
  employees?: string[];
  period?: { start: Date | undefined; end: Date | undefined };
  assignedTasks?: string;
  idTag?: string;
  idsTags?: string[];
  isArchived?: boolean;
}

export interface ModalAtendimentoFiltroProps {
  value: DealFilter;
  onFilter: (value: DealFilter, options?: { close?: boolean }) => Promise<void> | void;
}

export function ModalAtendimentoFiltro({ value, onFilter }: ModalAtendimentoFiltroProps) {
  const api = new AppServices();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [idsTags, setIdsTags] = useState<string[]>(
    value.idsTags || (value.idTag ? [value.idTag] : []),
  );
  const canaisDefault = [
    'whatsapp',
    'instagram',
    'facebook',
    'olx',
    'showroom',
    'usadosbr',
    'icarros',
    'mobiauto',
    'webmotors',
    'ligacao',
    'other',
  ];
  const apiApp = new AppServices();
  const [colaboradoresList, setColaboradoresList] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [search, setPesquisa] = useState<string>(value.search || '');
  const [tipoAtendimento, setTipoAtendimento] = useState<'todos' | 'BUY' | 'SELL' | 'CONSIGNMENT'>(
    value.tipoAtendimento || 'todos',
  );
  const [channels, setCanais] = useState<string[]>(value.channels || []);
  const [employees, setColaboradores] = useState<string[]>(value.employees || []);
  const [period, setPeriodo] = useState<
    { from: Date | undefined; to?: Date | undefined } | undefined
  >(
    value.period
      ? {
          from: value.period.start,
          to: value.period.end,
        }
      : undefined,
  );
  const [assignedTasks, setAtribuidasAMim] = useState<boolean>(value.assignedTasks === 'true');
  const [isArchived, setIsArchived] = useState<boolean>(!!value.isArchived);

  useEffect(() => {
    setPesquisa(value.search || '');
    setTipoAtendimento(value.tipoAtendimento || 'todos');
    setCanais(value.channels || []);
    setColaboradores(value.employees || []);
    setPeriodo(
      value.period
        ? {
            from: value.period.start,
            to: value.period.end,
          }
        : undefined,
    );
    setAtribuidasAMim(value.assignedTasks === 'true');
    setIdsTags(value.idsTags || (value.idTag ? [value.idTag] : []));
    setIsArchived(!!value.isArchived);
    fetchTags();
  }, [value]);

  // Helper para converter hex em rgba com alpha
  const hexToRGBA = (hex: string, alpha: number) => {
    try {
      const normalized = hex.replace('#', '');
      const fullHex =
        normalized.length === 3
          ? normalized
              .split('')
              .map((c) => c + c)
              .join('')
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
    const [data, error] = await apiApp.employee.list({ limit: 100 });
    if (error || !data) {
      console.error(error);
      return;
    }
    const employees = data.employees;
    setColaboradoresList(employees);
    if (!value.employees || value.employees.length === 0) {
      setColaboradores([]);
    }
  };

  const handleCanal = (channel: string) => {
    if (channels.includes(channel)) {
      setCanais(channels.filter((c) => c !== channel));
    } else {
      setCanais([...channels, channel]);
    }
  };

  const handleColaborador = (employee: string) => {
    if (employees.includes(employee)) {
      setColaboradores(employees.filter((c) => c !== employee));
    } else {
      setColaboradores([...employees, employee]);
    }
  };

  const fetchTags = async () => {
    setLoading(true);
    const [data, error] = await api.deal.findTags();
    if (error) {
      setLoading(false);
      return;
    }
    const normalized = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name ?? t.name,
      color: t.color ?? t.color,
      description: t.description ?? t.description,
    })) as TagItem[];
    setTags(normalized);
    setLoading(false);
  };

  const isCanalActive = (channel: string) => channels.includes(channel);
  const isColaboradorActive = (employee: string) => employees.includes(employee);

  const isAbleToSearch = () => {
    const isPesquisa = search.trim().length > 0;
    const isCanal = channels.length > 0;
    const isColaborador = employees.length > 0;
    const isTipoAtendimento = tipoAtendimento !== 'todos';
    const isPeriodo = period?.from || period?.to;
    const isAtribuidasAMim = assignedTasks;
    const isTag = idsTags.length > 0;
    const isArquivados = isArchived;
    return (
      isCanal ||
      isColaborador ||
      isPesquisa ||
      isTipoAtendimento ||
      isPeriodo ||
      isAtribuidasAMim ||
      isTag ||
      isArquivados
    );
  };

  const handleTagClick = (tagId?: string) => {
    if (!tagId) return;
    setIdsTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSearch = async () => {
    setLoading(true);

    await onFilter(
      {
        search,
        tipoAtendimento,
        channels: channels.length > 0 ? channels : undefined,
        employees: colaboradoresList && employees.length > 0 ? employees : undefined,
        period: { start: period?.from, end: period?.to ? addHours(period.to, 23.99) : undefined },
        assignedTasks: assignedTasks ? 'true' : 'false',
        idsTags: idsTags.length > 0 ? idsTags : undefined,
        idTag: undefined,
        isArchived: isArchived ? true : undefined,
      },
      { close: true },
    );
    setLoading(false);
  };

  const resetAll = () => {
    setPesquisa('');
    setTipoAtendimento('todos');
    setCanais([]);
    setColaboradores([]);
    setPeriodo(undefined);
    setAtribuidasAMim(false);
    setIdsTags([]);
    setIsArchived(false);
    onFilter(
      {
        search: '',
        tipoAtendimento: 'todos',
        channels: undefined,
        employees: undefined,
        period: undefined,
        assignedTasks: 'false',
        idsTags: undefined,
        idTag: undefined,
        isArchived: undefined,
      },
      { close: false },
    );
  };
  const buildFilter = (overrides?: Partial<DealFilter>): DealFilter => ({
    search,
    tipoAtendimento,
    channels: channels.length > 0 ? channels : undefined,
    employees: colaboradoresList && employees.length > 0 ? employees : undefined,
    period: { start: period?.from, end: period?.to ? addHours(period.to, 23.99) : undefined },
    assignedTasks: assignedTasks ? 'true' : 'false',
    idsTags: idsTags.length > 0 ? idsTags : undefined,
    idTag: undefined,
    isArchived: isArchived ? true : undefined,
    ...overrides,
  });

  useEffect(() => {
    fechtColaboradores();
  }, []);

  const RenderColaborador = useCallback(
    ({ employee }: { employee: Employee }) => {
      return (
        <button
          key={employee.id}
          className="z-0 opacity-60 saturate-0 transition-all duration-150 data-[active=true]:opacity-100 data-[active=true]:saturate-100 data-[active=true]:z-10"
          onClick={() => handleColaborador(employee.id)}
          data-active={isColaboradorActive(employee.id)}
        >
          <AvatarUser src={profileImageUrl(employee.userId)} name={employee.name} />
        </button>
      );
    },
    [employees],
  );

  return (
    <div className="w-full text-white md:rounded-[0.75rem] md:shadow-xl p-6 md:p-5 pb-[8rem] bg-gradient-to-b from-[#23324a] to-[#1b263a] border border-[#3A4B6A] animate-fade-in-top max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
      <div>
        <PesquisarAtendimentos
          value={search}
          onChange={setPesquisa}
          className="md:rounded-t-none bg-[#1F2A44] border border-[#3A4B6A] text-[#DDE6F2]"
        />

        <div className="mt-4">
          <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
            Tipo de atendimento
          </span>
          <div className="mt-2 overflow-x-auto md:overflow-visible">
            <RadioTipoAtendimentos
              value={tipoAtendimento || 'todos'}
              onChange={(v) => setTipoAtendimento(v)}
              className="text-[#A8B4CC] data-[active=true]:text-white data-[active=true]:bg-[#1F2A44]"
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
            Período
          </span>
          <div className="mt-2">
            <div className="p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A]">
              <DatePickerRange value={period} onChange={setPeriodo} />
            </div>
          </div>
        </div>

        <div className="mt-6 md:pt-4 space-y-6 md:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
                Filtrar por plataforma
              </span>
              <div className="flex gap-2 flex-wrap overflow-y-auto p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] max-h-[160px] scrollbar-mini">
                {canaisDefault.map((channel) => (
                  <button
                    key={channel}
                    className="opacity-60 saturate-0 transition-all duration-150 data-[active=true]:opacity-100 data-[active=true]:saturate-100 rounded-full hover:opacity-100 data-[active=true]:ring-2 data-[active=true]:ring-[hsl(var(--primary))]"
                    onClick={() => handleCanal(channel)}
                    data-active={isCanalActive(channel)}
                  >
                    <AvatarCanal channel={channel} className="bg-white" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
                Filtrar por colaborador
              </span>
              <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-y-auto whitespace-nowrap p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] md:max-h-[160px] scrollbar-mini">
                {!colaboradoresList &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-[#2A3B5E] w-11 h-11 rounded-full shrink-0"></div>
                  ))}
                {colaboradoresList &&
                  colaboradoresList.map((employee) => RenderColaborador({ employee }))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
              Filtros adicionais
            </span>
            <div className="flex items-center gap-3 p-3 rounded-md bg-[#1F2A44] border border-[#3A4B6A]">
              <label htmlFor="atribuidasAMim" className="text-sm font-medium text-[#DDE6F2]">
                Tarefas atribuídas a mim
              </label>
              <button
                id="atribuidasAMim"
                type="button"
                className="relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                style={{ backgroundColor: assignedTasks ? 'hsl(var(--primary))' : '#3A4B6A' }}
                onClick={() => setAtribuidasAMim(!assignedTasks)}
                aria-pressed={assignedTasks}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: assignedTasks ? 'translateX(1.0rem)' : 'translateX(0)' }}
                />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-md bg-[#1F2A44] border border-[#3A4B6A]">
              <label htmlFor="arquivadosSwitch" className="text-sm font-medium text-[#DDE6F2]">
                Arquivados
              </label>
              <button
                id="arquivadosSwitch"
                type="button"
                className="relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                style={{ backgroundColor: isArchived ? 'hsl(var(--primary))' : '#3A4B6A' }}
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
            <span className="text-xs font-semibold tracking-wide text-[#A8B4CC] uppercase">
              Filtrar por etiqueta
            </span>
            <div className="flex gap-2 flex-wrap p-2 rounded-lg bg-[#1F2A44] border border-[#3A4B6A] max-h-[90px] overflow-y-scroll scrollbar-mini">
              {loading && <span className="text-xs text-[#A8B4CC]">Carregando etiquetas...</span>}
              {!loading && tags.length === 0 && (
                <span className="text-xs text-[#A8B4CC]">Nenhuma etiqueta criada.</span>
              )}
              {!loading &&
                tags.length > 0 &&
                tags.map((item) => (
                  <button
                    key={(item.id || item.name) + item.color}
                    className="shrink-0 rounded-[.25rem] border border-[#3A4B6A] px-2 py-1 text-xs font-semibold hover:ring-2 hover:ring-[hsl(var(--primary))] transition-all data-[active=true]:ring-2 data-[active=true]:ring-[hsl(var(--primary))]"
                    onClick={() => handleTagClick(item.id)}
                    data-active={idsTags.includes(item.id!)}
                    style={{
                      backgroundColor: item.color ? hexToRGBA(item.color, 0.18) : '#E5E7EB',
                      color: item.color || '#485B80',
                    }}
                  >
                    {item.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-4 items-end border-t border-[#3A4B6A] pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {search.length > 0 && (
                  <ItemSelectedFilter
                    label={search}
                    onRemove={() => {
                      setPesquisa('');
                      onFilter(buildFilter({ search: '' }), { close: false });
                    }}
                  />
                )}
                {period && period.from && (
                  <ItemSelectedFilter
                    label={`${period.from.toLocaleDateString()} ${period.to ? `a ${period.to.toLocaleDateString()}` : ''}`}
                    onRemove={() => {
                      setPeriodo(undefined);
                      onFilter(buildFilter({ period: undefined }), { close: false });
                    }}
                  />
                )}
                {channels.length > 0 && (
                  <ItemSelectedFilter
                    label={
                      channels.length === 1 ? channels[0] || '1 canal' : `${channels.length} canais`
                    }
                    onRemove={() => {
                      setCanais([]);
                      onFilter(buildFilter({ channels: undefined }), { close: false });
                    }}
                  />
                )}
                {colaboradoresList &&
                  employees.length > 0 &&
                  employees.length !== colaboradoresList?.length && (
                    <ItemSelectedFilter
                      label={
                        employees.length === 1
                          ? colaboradoresList?.find((c) => c.id === employees[0])?.name ||
                            '1 colaborador'
                          : `${employees.length} colaboradores`
                      }
                      onRemove={() => {
                        setColaboradores([]);
                        onFilter(buildFilter({ employees: undefined }), { close: false });
                      }}
                    />
                  )}
                {assignedTasks && (
                  <ItemSelectedFilter
                    label="Atribuídas a mim"
                    onRemove={() => {
                      setAtribuidasAMim(false);
                      onFilter(buildFilter({ assignedTasks: 'false' }), { close: false });
                    }}
                  />
                )}
                {isArchived && (
                  <ItemSelectedFilter
                    label="Arquivados"
                    onRemove={() => {
                      setIsArchived(false);
                      onFilter(buildFilter({ isArchived: undefined }), { close: false });
                    }}
                  />
                )}
                {idsTags.length > 0 &&
                  idsTags.map((tagId) => (
                    <ItemSelectedFilter
                      key={tagId}
                      label={tags.find((t) => t.id === tagId)?.name || 'Etiqueta'}
                      onRemove={() => {
                        const next = idsTags.filter((id) => id !== tagId);
                        setIdsTags(next);
                        onFilter(buildFilter({ idsTags: next.length > 0 ? next : undefined }), {
                          close: false,
                        });
                      }}
                    />
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
            className={`px-6 h-10 rounded-md ${isAbleToSearch() ? 'bg-[hsl(var(--primary))] hover:bg-[#B12B27]' : 'bg-[#12161F] hover:bg-[#0E121A]'} text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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

function ItemSelectedFilter({
  label,
  onRemove,
  onApply,
  disable,
}: {
  label: string;
  onRemove: () => void;
  onApply?: () => void;
  disable?: boolean;
}) {
  return (
    <button
      className="bg-[#1F2A44] border border-[#3A4B6A] text-[#DDE6F2] text-xs font-semibold rounded-full pl-3 pr-2 py-1.5 max-w-[12rem] flex items-center gap-1.5 justify-between hover:bg-[#223251] transition-colors disabled:cursor-not-allowed shadow-sm"
      onClick={() => {
        onRemove();
        onApply && onApply();
      }}
      disabled={disable}
    >
      <span className="truncate capitalize">{label}</span>
      <IconX color="#A8B4CC" className="shrink-0" />
    </button>
  );
}
