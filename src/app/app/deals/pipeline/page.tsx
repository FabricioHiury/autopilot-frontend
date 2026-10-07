'use client';
import { tagLabel } from '@/lib/presentation-labels';

import { PageTitle } from '@/components/commons/page-title';
import { useEffect, useRef, useState } from 'react';
import { ModalNovoAtendimento } from '@/components/sections/deals/modal-novo-atendimento';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import {
  DealFilter,
  ModalAtendimentoFiltro,
} from '@/components/sections/deals/modal-atendimento-filtro';
import { AppServices } from '@/services/app.services';
import { PipelineColumn, DealListResponse } from '@/types/deal';
import { DealStatus, DealStatusLabel, DealStatusColor } from '@/types/deal-status';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DealTag } from '@/types/tag';
import NoData from '@/components/commons/estados/NoData';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import toast from 'react-hot-toast';
import IconX from '@/components/icons/icon-x';
import PesquisarAtendimentos from '@/components/sections/deals/pesquisar-atentimentos';
import RadioTipoAtendimentos from '@/components/sections/deals/radio-tipo-atendimento';
import ColunasContainer from '@/components/sections/deals/colunas-container';
import IconFilter from '@/components/icons/icon-filter';
import IconTag from '@/components/icons/icon-tag';
import ModalTagsAtendimento from '@/components/sections/deals/modal-tags-atendimento';
import ModalArquivados from '@/components/sections/deals/modal-arquivados';

const configEtapas: PipelineColumn[] = [
  {
    id: '0',
    stage: DealStatus.CHAT,
    stageLabel: DealStatusLabel.CHAT,
    color: DealStatusColor.CHAT,
    items: [],
  },
  {
    id: '1',
    stage: DealStatus.PRE_DEAL,
    stageLabel: DealStatusLabel.PRE_DEAL,
    color: DealStatusColor.PRE_DEAL,
    items: [],
  },
  {
    id: '2',
    stage: DealStatus.DEAL_INITIAL,
    stageLabel: DealStatusLabel.DEAL_INITIAL,
    color: DealStatusColor.DEAL_INITIAL,
    items: [],
  },
  {
    id: '3',
    stage: DealStatus.VISIT,
    stageLabel: DealStatusLabel.VISIT,
    color: DealStatusColor.VISIT,
    items: [],
  },
  {
    id: '4',
    stage: DealStatus.AT_NEGOTIATION,
    stageLabel: DealStatusLabel.AT_NEGOTIATION,
    color: DealStatusColor.AT_NEGOTIATION,
    items: [],
  },
  {
    id: '5',
    stage: DealStatus.SUCCESS,
    stageLabel: DealStatusLabel.SUCCESS,
    color: DealStatusColor.SUCCESS,
    items: [],
  },
  {
    id: '6',
    stage: DealStatus.RECOVERY,
    stageLabel: DealStatusLabel.RECOVERY,
    color: DealStatusColor.RECOVERY,
    items: [],
  },
  {
    id: '7',
    stage: DealStatus.LOST,
    stageLabel: DealStatusLabel.LOST,
    color: DealStatusColor.LOST,
    items: [],
  },
];

export default function ServicesPage() {
  const api = new AppServices();

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const colaboradoresFiltro = params.get('employees')?.split(',');
  const [showFiltro, setShowFiltro] = useState(false);
  const [filtro, setFiltro] = useState<DealFilter>({
    employees:
      colaboradoresFiltro && colaboradoresFiltro.length > 0
        ? colaboradoresFiltro.map((c) => c)
        : [],
    tipoAtendimento: 'todos',
  });
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const colunasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [colunas, setColunas] = useState<PipelineColumn[]>([]);
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: string; name: string; color: string; description?: string }>
  >([]);

  function sanitizeDigits(input?: string) {
    if (!input) return '';
    return input.replace(/\D/g, '');
  }

  function deriveTelefoneLikeFromPesquisa(search?: string) {
    const digits = sanitizeDigits(search || '');
    return digits.length >= 3 ? digits : undefined;
  }

  async function fecthColunas() {
    setLoading(true);

    let houveErro = false;

    const colunasProcessadasPromise = configEtapas.map(async (stage) => {
      try {
        const phoneLike = deriveTelefoneLikeFromPesquisa(filtro.search);
        const baseFiltros: any = {
          search: filtro.search,
          phoneLike,
          status: stage.stage,
          employeeIds:
            filtro.employees && filtro.employees.length > 0
              ? filtro.employees.join(',')
              : undefined,
          origin:
            filtro.channels && filtro.channels.length > 0 ? filtro.channels.join(',') : undefined,
          dataStart:
            filtro.period?.start &&
            filtro.period.start !== undefined &&
            filtro.period.end !== undefined
              ? filtro.period.start
              : undefined,
          dataEnd:
            filtro.period?.end &&
            filtro.period.start !== undefined &&
            filtro.period.end !== undefined
              ? filtro.period.end
              : undefined,
          orderBy: 'updatedAt',
          orderDirection: 'desc',
          itemsPage: filtro.isArchived ? 50 : 1000,
          assignedTasks: filtro.assignedTasks,
          isArchived: filtro.isArchived ? true : undefined,
        };
        if (filtro.tipoAtendimento !== 'todos') {
          baseFiltros.dealMode = filtro.tipoAtendimento;
        }

        if (filtro.tipoAtendimento && filtro.tipoAtendimento !== 'todos') {
          baseFiltros.dealMode = filtro.tipoAtendimento;
        }

        let atendimentosRaw: any[] = [];

        if (stage.stage === DealStatus.CHAT) {
          if (filtro.isArchived) {
            if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
              const results = await Promise.all(
                filtro.idsTags.map(async (tagId) => {
                  const [dr, er] = await api.deal.list({
                    ...baseFiltros,
                    idTag: tagId,
                  });
                  if (er || !dr) {
                    return [] as any[];
                  }
                  return dr.deals || [];
                }),
              );
              const merged = results.flat();
              const uniqueMap = new Map<string, any>();
              for (const a of merged) {
                const id = String(a.id);
                if (!uniqueMap.has(id)) uniqueMap.set(id, a);
              }
              atendimentosRaw = Array.from(uniqueMap.values());
            } else {
              const [dataResponse, errorResponse] = await api.deal.list({
                ...baseFiltros,
                idTag: filtro.idTag,
              });
              if (errorResponse || !dataResponse) {
                houveErro = true;
                return { ...stage, items: [] };
              }
              atendimentosRaw = dataResponse.deals || [];
            }
          } else {
            const [dataResponse, errorResponse] = await api.deal.listChats(baseFiltros);
            if (errorResponse || !dataResponse) {
              houveErro = true;
              return { ...stage, items: [] };
            }
            if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
              atendimentosRaw = (dataResponse.deals || []).filter(
                (a: any) =>
                  Array.isArray(a.tags) && a.tags.some((t: any) => filtro.idsTags!.includes(t.id)),
              );
            } else {
              atendimentosRaw = dataResponse.deals || [];
            }
          }
        } else {
          if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
            const results = await Promise.all(
              filtro.idsTags.map(async (tagId) => {
                const [dr, er] = await api.deal.list({
                  ...baseFiltros,
                  idTag: tagId,
                });
                if (er || !dr) {
                  return [] as any[];
                }
                return dr.deals || [];
              }),
            );
            const merged = results.flat();
            const uniqueMap = new Map<string, any>();
            for (const a of merged) {
              const id = String(a.id);
              if (!uniqueMap.has(id)) uniqueMap.set(id, a);
            }
            atendimentosRaw = Array.from(uniqueMap.values());
          } else {
            const [dataResponse, errorResponse] = await api.deal.list({
              ...baseFiltros,
              // Suporte legado caso ainda exista idTag simples
              idTag: filtro.idTag,
            });
            if (errorResponse || !dataResponse) {
              houveErro = true;
              return { ...stage, items: [] };
            }
            atendimentosRaw = dataResponse.deals || [];
          }
        }

        const items = atendimentosRaw.map((deal) => {
          const canaisUnicos = new Set(deal.chats.map((c: any) => c.channel));
          const channels = Array.from(canaisUnicos) as Array<
            'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other'
          >;

          if (channels.length === 0 && deal.dealOrigin) {
            channels.push(deal.dealOrigin as any);
          }

          const clienteNome = deal.customer?.name || 'Sem nome';
          const clienteAvatar = deal.customer?.avatar?.trim() || undefined;
          const clienteEmail = deal.customer?.email || '-';
          const clienteTelefone = deal.customer?.phone || '-';

          return {
            id: deal.id,
            data: {
              stage: deal.status as DealStatus,
              status: deal.status as DealStatus,
              channels,
              dealOrigin: deal.dealOrigin,
              name: clienteNome,
              title: deal.title || undefined,
              avatar: clienteAvatar,
              temperature: deal.temperature as 'HOT' | 'WARM' | 'COLD' | undefined,
              email: clienteEmail,
              phone: clienteTelefone,
              assignees: Array.isArray(deal.assignees)
                ? deal.assignees.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    whatsapp: r.whatsapp,
                    userId: r.userId,
                  }))
                : [],
              // Mapeia tags para exibição nos cards
              tags: Array.isArray(deal.tags)
                ? deal.tags.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    color: t.color,
                  }))
                : [],
              // Mapeia chats para permitir renderização de ícones no card
              chats: Array.isArray(deal.chats)
                ? deal.chats.map((c: any) => ({ id: c.id, channel: c.channel }))
                : [],
              totalTasks: deal.tasks || 0,
              commentCount: deal.comments || 0,
            },
          };
        });

        return { ...stage, items };
      } catch (e) {
        console.error(`Erro na etapa ${stage.stage}:`, e);
        houveErro = true;
        return { ...stage, items: [] };
      }
    });

    const colunasProcessadas = await Promise.all(colunasProcessadasPromise);

    if (houveErro) {
      toast.error('Falha ao carregar alguns atendimentos. Tente novamente.');
    }

    setColunas(colunasProcessadas);
    setLoading(false);
  }

  useEffect(() => {
    fecthColunas();
    const reload = () => void fecthColunas();
    window.addEventListener('autopilot:deals-changed', reload);
    return () => window.removeEventListener('autopilot:deals-changed', reload);
  }, [filtro]);

  useEffect(() => {
    const fetchTags = async () => {
      const response = await api.deal.findTags();
      const raw: DealTag[] = Array.isArray(response[0]) ? (response[0] as DealTag[]) : [];

      const normalized = raw
        .filter((item) => typeof item.id === 'string' && !!item.id)
        .map((item) => ({
          id: item.id as string,
          name: item.name,
          color: item.color || '#DDE6F2',
          description: item.description,
        }));

      setAvailableTags(normalized);
    };
    fetchTags();
  }, []);

  const handleFiltro = async (filtro: DealFilter, options?: { close?: boolean }) => {
    if (filtro.employees && filtro.employees.length > 0) {
      router.replace(`?employees=${filtro.employees?.join(',')}`);
    } else {
      router.replace(pathname);
    }
    if (options?.close) {
      setShowFiltro(false);
    }
    setFiltro(filtro);
  };

  return (
    <main className="flex flex-col h-full bg-[#F2F4F7]">
      <section ref={sectionTopRef}>
        <div className="bg-white px-4 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="w-full flex gap-4 items-start justify-between">
              <div className="flex flex-col gap-0.5 md:gap-2">
                <PageTitle title="Painel de atendimentos" />
              </div>

              <div className="flex gap-4">
                <div className="hidden md:block">
                  <ModalNovoAtendimento onCreated={() => fecthColunas()} />
                </div>
                <ModalNotificacoes />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between">
            <div className="px-4 md:px-10">
              <button
                className="group flex items-center gap-2 pb-[2.25rem] md:pb-[1.125rem]"
                onClick={() => setShowFiltro((cur) => !cur)}
              >
                <div
                  className="bg-[#1B263A] group-hover:bg-[hsl(var(--primary))] transition-colors duration-300 rounded-[0.5rem] w-8 h-8 flex items-center justify-center data-[active=true]:bg-[hsl(var(--primary))]"
                  data-active={showFiltro}
                >
                  <IconFilter />
                </div>
                <span className="text-sm font-semibold">Faça uma busca segmentada</span>
              </button>
            </div>

            <div className="w-full block pb-6 px-4 md:hidden">
              <ModalNovoAtendimento onCreated={() => fecthColunas()} />
            </div>

            {showFiltro && (
              <div className="md:absolute z-10 top-full left-0 w-full md:w-[37.5rem] md:mx-10">
                <ModalAtendimentoFiltro value={filtro} onFilter={handleFiltro} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className="flex-1 min-h-0 overflow-hidden data-[hidden=true]:hidden md:data-[hidden=true]:block pt-6"
        data-hidden={showFiltro}
      >
        <div className="h-full min-h-0 flex flex-col">
          <div className="px-4 md:px-10 flex flex-col gap-4 md:flex-row justify-center md:justify-between pb-4">
            <div className="overflow-x-auto md:overflow-visible">
              <RadioTipoAtendimentos
                value={filtro.tipoAtendimento || 'todos'}
                onChange={(v) => setFiltro({ ...filtro, tipoAtendimento: v })}
                className="text-[#7F8999] data-[active=true]:text-[#1B263A] data-[active=true]:bg-white"
              />
            </div>
            <div className="relative flex items-center gap-2">
              <button
                aria-label="Abrir etiquetas"
                className="group flex items-center justify-center w-8 h-8 rounded-md border border-[#DDE6F2] bg-white text-[#485B80] hover:bg-[#F7F9FC] hover:text-[#1B263A] transition-colors"
                onClick={() => setShowTags((cur) => !cur)}
              >
                <IconTag size={15} />
              </button>
              <button
                aria-label="Listar atendimentos arquivados"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#DDE6F2] bg-white text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-[#F7F9FC] hover:text-[#1B263A] transition-colors"
                onClick={() => setShowArchived(true)}
              >
                Arquivados
              </button>
              {showTags && (
                <ModalTagsAtendimento
                  open={showTags}
                  onClose={() => setShowTags(false)}
                  onChanged={(list) => {
                    const normalized = (list || [])
                      .filter((t) => typeof t.id === 'string' && !!t.id)
                      .map((t) => ({
                        id: t.id as string,
                        name: t.name,
                        color: t.color,
                        description: t.description,
                      }));
                    setAvailableTags(normalized);
                  }}
                />
              )}
              <PesquisarAtendimentos
                value={filtro.search || ''}
                onChange={(v) => setFiltro({ ...filtro, search: v })}
                className="py-4 md:min-w-[30rem]"
              />
            </div>
          </div>

          <div className="px-4 md:px-10 flex flex-wrap items-center gap-2 md:gap-3 mb-4">
            {filtro.employees && filtro.employees.length > 0 && (
              <button
                aria-label="Remover filtro por colaboradores"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => {
                  setFiltro({ ...filtro, employees: [] });
                  router.replace(pathname);
                }}
              >
                <span>Colaboradores</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.channels && filtro.channels.length > 0 && filtro.channels.length !== 4 && (
              <button
                aria-label="Remover filtro por canal"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, channels: [] })}
              >
                <span>Canais</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.period &&
              filtro.period.start !== undefined &&
              filtro.period.end !== undefined && (
                <button
                  aria-label="Remover filtro por período"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                  onClick={() => setFiltro({ ...filtro, period: undefined })}
                >
                  <span>Período</span>
                  <IconX size={12} />
                </button>
              )}

            {filtro.assignedTasks === 'true' && (
              <button
                aria-label="Remover filtro de tarefas atribuídas a mim"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, assignedTasks: 'false' })}
              >
                <span>Atribuídas a mim</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.isArchived && (
              <button
                aria-label="Remover filtro Arquivados"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, isArchived: undefined })}
              >
                <span>Arquivados</span>
                <IconX size={12} />
              </button>
            )}

            {Array.isArray(filtro.idsTags) &&
              filtro.idsTags.length > 0 &&
              filtro.idsTags.map((tagId) => {
                const tagInfo = availableTags.find((t) => t.id === tagId);
                return (
                  <button
                    key={tagId}
                    aria-label={`Remover etiqueta ${tagLabel(tagInfo?.name) || 'Etiqueta'}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                    onClick={() => {
                      const rest = filtro.idsTags!.filter((id) => id !== tagId);
                      setFiltro({ ...filtro, idsTags: rest.length > 0 ? rest : undefined });
                    }}
                  >
                    <span>{tagLabel(tagInfo?.name) || 'Etiqueta'}</span>
                    <IconX size={12} />
                  </button>
                );
              })}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {loading && <LoadingGlobal />}
            {!loading && colunas.length === 0 && <NoData />}
            {!loading && colunas && colunas.length > 0 && (
              <ColunasContainer
                reference={colunasRef}
                columns={colunas}
                availableTags={availableTags}
              />
            )}
          </div>
        </div>
      </section>
      {showArchived && (
        <ModalArquivados
          open={showArchived}
          onClose={() => setShowArchived(false)}
          filtro={filtro}
        />
      )}
    </main>
  );
}
