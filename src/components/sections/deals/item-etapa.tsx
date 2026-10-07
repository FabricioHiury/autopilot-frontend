'use client';
import { tagLabel, channelLabel } from '@/lib/presentation-labels';

import React from 'react';
import AvatarUser from '@/components/commons/avatar-user';
import AvatarCanal from '@/components/commons/avatar-canal';
import IconFrio from './icons/icon-frio';
import IconMorno from './icons/icon-morno';
import IconQuente from './icons/icon-quente';
import toast from 'react-hot-toast';
import IconTag from '@/components/icons/icon-tag';
import IconX from '@/components/icons/icon-x';
import { CSS } from '@dnd-kit/utilities';
import { PipelineDeal } from '@/types/deal';
import { profileImageUrl } from '@/lib/profile.utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/class-name.utils';
import { useSortable } from '@dnd-kit/sortable';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';
import { AppServices } from '@/services/app.services';
import { createPortal } from 'react-dom';
import { DealStatus } from '@/types/deal-status';
import { useRouter } from 'next/navigation';

interface ItemEtapaProps {
  itemAtendimento: PipelineDeal;
  etapaId: string;
  availableTags?: Array<{ id: string; name: string; color: string; description?: string }>;
}

export default function ItemEtapa({ itemAtendimento, etapaId, availableTags }: ItemEtapaProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `${etapaId}-${itemAtendimento.id}`,
  });

  const router = useRouter();
  const api = new AppServices();
  const [expanded, setExpanded] = React.useState(false);

  const [savingTagId, setSavingTagId] = React.useState<string | null>(null);
  const [removingTagId, setRemovingTagId] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState(itemAtendimento.data.tags || []);

  const [optionsOpen, setOptionsOpen] = React.useState<boolean>(false);
  const [optionsPosition, setOptionsPosition] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [openUpwards, setOpenUpwards] = React.useState(false);
  const [submenuSide, setSubmenuSide] = React.useState<'right' | 'left'>('right');
  const optionsRef = React.useRef<HTMLDivElement>(null);
  const optionsButtonRef = React.useRef<HTMLButtonElement>(null);

  const [showMoveSubmenu, setShowMoveSubmenu] = React.useState<boolean>(false);
  const [showTagSubmenu, setShowTagSubmenu] = React.useState<boolean>(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = React.useState<boolean>(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = React.useState<boolean>(false);

  React.useEffect(() => {
    setTags(itemAtendimento.data.tags || []);
  }, [itemAtendimento.id, itemAtendimento.data.tags]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideOptions = optionsRef.current && optionsRef.current.contains(target);
      const clickedOnOptionsBtn =
        optionsButtonRef.current && optionsButtonRef.current.contains(target);
      if (clickedInsideOptions || clickedOnOptionsBtn) return;
      setOptionsOpen(false);
      setShowMoveSubmenu(false);
      setShowTagSubmenu(false);
      setShowRemoveConfirm(false);
    };

    if (optionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [optionsOpen]);

  const placeMenu = React.useCallback(() => {
    if (!optionsOpen || !optionsButtonRef.current || !optionsRef.current) return;

    const btn = optionsButtonRef.current.getBoundingClientRect();
    const menuEl = optionsRef.current;

    // Calcula posição relativa à viewport, sem somar scroll de contêineres
    const viewportScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const viewportScrollX = window.scrollX || document.documentElement.scrollLeft || 0;

    // posição inicial (abaixo do botão)
    let top = btn.bottom + viewportScrollY + 8;
    let left = btn.left + viewportScrollX;

    // aplica para medir
    menuEl.style.top = `${top}px`;
    menuEl.style.left = `${left}px`;

    // Evita scrollbar interno no container do menu
    menuEl.style.overflowY = 'visible';
    menuEl.style.maxHeight = '';

    // mede tamanho real (com submenus)
    const rect = menuEl.getBoundingClientRect();
    const mh = rect.height;
    const mw = rect.width;

    // ---- VERTICAL: flip/clamp ----
    const viewportTop = viewportScrollY + 8;
    const viewportBottom = viewportScrollY + window.innerHeight - 8;

    // se estourar pra baixo
    if (top + mh > viewportBottom) {
      // cabe pra cima?
      if (btn.top + viewportScrollY - 8 >= mh + viewportTop) {
        top = btn.top + viewportScrollY - mh - 8; // abre pra cima
        setOpenUpwards(true);
      } else {
        // não cabe por completo: clampa dentro da viewport
        top = Math.max(viewportTop, viewportBottom - mh);
        setOpenUpwards(false);
      }
    } else {
      setOpenUpwards(false);
    }

    // ---- HORIZONTAL: shift/clamp ----
    const viewportLeft = viewportScrollX + 8;
    const viewportRight = viewportScrollX + window.innerWidth - 8;

    if (left + mw > viewportRight) {
      left = Math.max(btn.right + viewportScrollX - mw, viewportLeft);
    }
    if (left < viewportLeft) left = viewportLeft;

    // aplica posição final
    menuEl.style.top = `${top}px`;
    menuEl.style.left = `${left}px`;
    setOptionsPosition({ top, left });

    // decide lado dos submenus
    const r = menuEl.getBoundingClientRect();
    const rightSpace = window.innerWidth - r.right;
    setSubmenuSide(rightSpace < 260 ? 'left' : 'right');
  }, [optionsOpen]);

  React.useEffect(() => {
    if (!optionsOpen) return;
    placeMenu();

    const onScroll = () => placeMenu();
    const onResize = () => placeMenu();

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [optionsOpen, placeMenu, showMoveSubmenu, showTagSubmenu]);

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

  const handleTagSelect = async (tagId: string) => {
    setSavingTagId(tagId);
    try {
      const responsavelId = itemAtendimento.data.assignees[0].id;
      const origemAtual = itemAtendimento.data.dealOrigin;
      const [result, error] = await api.deal.linkTag(
        itemAtendimento.id,
        [tagId],
        [responsavelId],
        origemAtual,
      );
      if (error) {
        toast.error('Erro ao vincular etiqueta', { id: `tag-${tagId}` });
      } else {
        const selectedTag = availableTags?.find((tag) => tag.id === tagId);
        if (selectedTag) {
          setTags((prev) =>
            prev.find((t) => t.id === selectedTag.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: selectedTag.id,
                    name: selectedTag.name,
                    description: selectedTag.description,
                    color: selectedTag.color,
                  },
                ],
          );
        }
      }
    } catch (error) {
      toast.error('Erro ao vincular etiqueta');
    } finally {
      setSavingTagId(null);
      setOptionsOpen(false);
      setShowTagSubmenu(false);
    }
  };

  const handleTagRemove = async (tagId: string) => {
    setRemovingTagId(tagId);
    try {
      const remainingTags = tags.filter((t) => t.id !== tagId);
      const remainingTagIds = remainingTags.map((t) => t.id);
      const responsaveisIds = (itemAtendimento.data.assignees || []).map((r) => r.id);
      const origemAtual = itemAtendimento.data.dealOrigin;
      const [result, error] = await api.deal.linkTag(
        itemAtendimento.id,
        remainingTagIds,
        responsaveisIds.length > 0 ? responsaveisIds : [],
        origemAtual,
      );
      if (error) {
        toast.error('Erro ao remover etiqueta', { id: `tag-remove-${tagId}` });
      } else {
        setTags(remainingTags);
        toast.success('Etiqueta removida', { id: `tag-remove-${tagId}` });
      }
    } catch (error) {
      toast.error('Erro ao remover etiqueta');
    } finally {
      setRemovingTagId(null);
    }
  };

  const handleArchiveChat = async (id: string) => {
    const [, error] = await api.chat.archive(id);
    if (error) {
      toast.error(error.message || 'Erro ao arquivar conversa');
      return;
    }
    toast.success('Conversa arquivada');
    setOptionsOpen(false);
    setShowArchiveConfirm(false);
    try {
      window.dispatchEvent(new CustomEvent('atendimento:arquivado', { detail: { dealId: id } }));
    } catch {}
  };

  const handleArchiveAtendimento = async (id: string) => {
    const [, error] = await api.deal.archive(id);
    if (error) {
      toast.error(error.message || 'Erro ao arquivar atendimento');
      return;
    }
    toast.success('Atendimento arquivado');
    setOptionsOpen(false);
    setShowArchiveConfirm(false);
    try {
      window.dispatchEvent(new CustomEvent('atendimento:arquivado', { detail: { dealId: id } }));
    } catch {}
  };

  const handleRemoveAtendimento = async (id: string) => {
    const [, error] = await api.deal.remove(id);
    if (error) {
      toast.error(error.message || 'Erro ao remover atendimento');
      return;
    }
    toast.success('Atendimento removido');
    setOptionsOpen(false);
    setShowRemoveConfirm(false);
    try {
      window.dispatchEvent(new CustomEvent('atendimento:removido', { detail: { dealId: id } }));
    } catch {}
  };

  const handleOptionsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsOpen((prev: boolean) => !prev);
    setShowMoveSubmenu(false);
    setShowTagSubmenu(false);
    setShowArchiveConfirm(false);
  };

  const handleMove = (novoStatus: DealStatus) => {
    try {
      window.dispatchEvent(
        new CustomEvent('atendimento:move', {
          detail: {
            itemId: String(itemAtendimento.id),
            currentColumnId: String(etapaId),
            novoStatus,
          },
        }),
      );
      setOptionsOpen(false);
      setShowMoveSubmenu(false);
    } catch (e) {
      toast.error('Não foi possível mover o atendimento');
    }
  };

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    visibility: isDragging ? 'hidden' : 'visible',
  } as React.CSSProperties;

  const atentimento = itemAtendimento.data;

  const truncateName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  const qtdTarefas = atentimento.totalTasks || 0;
  const qtdNotas = atentimento.commentCount || 0;

  const isChat = atentimento.status === 'chat' || etapaId === '0';

  const getDisplayName = () => {
    if (isChat) {
      if (atentimento.title && atentimento.title.trim() !== '' && atentimento.title !== 'Chat') {
        return atentimento.title;
      }
      return atentimento.name || 'Desconhecido';
    } else {
      return atentimento.title || atentimento.name || 'Sem título';
    }
  };

  const displayName = getDisplayName();
  const isNameTruncated = displayName.length > 25;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group relative w-full bg-white',
        'rounded-[0.5rem] overflow-hidden',
        'shadow-sm border border-[#DDE6F2]',
        'min-w-0',
        !isDragging && 'transition-shadow duration-200 ease-out hover:shadow-md',
        isDragging && 'opacity-0 invisible',
      )}
      style={style}
      data-dragging={isDragging}
    >
      <div className="bg-[#F2F4F7] px-4 py-2.5 flex items-center justify-between border-b border-[#DDE6F2]">
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-2">
            {atentimento.channels.slice(0, 2).map((channel) => (
              <div key={channel} className="relative">
                <AvatarCanal
                  channel={channel}
                  size={1.8}
                  className={cn(
                    'bg-white border-white shadow-sm ring-1 ring-[#DDE6F2]',
                    !isDragging && 'transition-transform group-hover:scale-105',
                  )}
                />
              </div>
            ))}
            {atentimento.channels.length > 2 && (
              <div className="bg-[#F7F9FC] rounded-full w-7 h-7 flex items-center justify-center text-xs font-medium text-[#485B80] border-2 border-white shadow-sm ring-1 ring-[#DDE6F2]">
                +{atentimento.channels.length - 2}
              </div>
            )}
          </div>

          {atentimento.temperature && (
            <TemperatureIcon temperature={atentimento.temperature} isDragging={isDragging} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2">
            {!isChat && (
              <button
                type="button"
                onClick={() => {
                  navigateToDeal(itemAtendimento.id);
                  setOptionsOpen(false);
                }}
                title="Abrir atendimento"
                className={cn(
                  'bg-white hover:bg-[#F7F9FC] text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] rounded-full w-8 h-8 flex items-center justify-center border border-[#DDE6F2]',
                )}
                aria-expanded={optionsOpen}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            )}

            {Array.isArray(atentimento.chats) && atentimento.chats.length > 0 && (
              <div className="inline-flex items-center gap-1">
                {atentimento.chats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => {
                      router.push(`/app/deals/chat?id=${chat.id}`);
                      setOptionsOpen(false);
                    }}
                    title={`Abrir conversa (${channelLabel(chat.channel) || '?'})`}
                    className={cn(
                      'bg-white hover:bg-[#F7F9FC] text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] rounded-full w-8 h-8 flex items-center justify-center border border-[#DDE6F2]',
                    )}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Three-dot options menu */}
          <button
            type="button"
            ref={optionsButtonRef}
            onClick={handleOptionsToggle}
            className={cn(
              'bg-white hover:bg-[#F7F9FC] text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] rounded-full w-8 h-8 flex items-center justify-center border border-[#DDE6F2]',
            )}
            aria-expanded={optionsOpen}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>

          {optionsOpen &&
            typeof window !== 'undefined' &&
            createPortal(
              <div
                ref={optionsRef}
                className={cn('fixed z-[9999] min-w-[240px] max-w-[320px]')}
                style={{ top: `${optionsPosition.top}px`, left: `${optionsPosition.left}px` }}
              >
                <div
                  className={cn(
                    'bg-white rounded-xl ring-1 ring-[#E8EEF8] shadow-[0_8px_24px_rgba(29,41,63,0.12)] animate-in fade-in',
                    openUpwards
                      ? 'slide-in-from-bottom-2 origin-bottom'
                      : 'slide-in-from-top-2 origin-top',
                  )}
                >
                  <div className="py-1">
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowMoveSubmenu((v: boolean) => !v);
                          setShowTagSubmenu(false);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                          <span>Mover</span>
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>

                      {showMoveSubmenu && (
                        <div
                          className={cn(
                            'absolute top-0 bg-white rounded-lg ring-1 ring-[#E8EEF8] shadow-[0_8px_24px_rgba(29,41,63,0.12)] min-w-[220px]',
                            submenuSide === 'right' ? 'left-full ml-2' : 'right-full mr-2',
                          )}
                        >
                          {[
                            { label: 'Pré-atendimento', value: DealStatus.PRE_DEAL },
                            { label: 'Atendimento Inicial', value: DealStatus.DEAL_INITIAL },
                            { label: 'Visita', value: DealStatus.VISIT },
                            { label: 'Em negociação', value: DealStatus.AT_NEGOTIATION },
                            { label: 'Sucesso', value: DealStatus.SUCCESS },
                            { label: 'Resgate', value: DealStatus.RECOVERY },
                            { label: 'Perdido', value: DealStatus.LOST },
                          ].map((opt) => (
                            <button
                              key={String(opt.value)}
                              onClick={() => handleMove(opt.value)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]"
                            >
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Vincular etiqueta (submenu) */}
                    {!isChat && availableTags && availableTags.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowTagSubmenu((v: boolean) => !v);
                            setShowMoveSubmenu(false);
                          }}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <IconTag size={14} />
                            <span>Vincular etiqueta</span>
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>

                        {showTagSubmenu && (
                          <div
                            className={cn(
                              'absolute top-0 bg-white rounded-lg ring-1 ring-[#E8EEF8] shadow-[0_8px_24px_rgba(29,41,63,0.12)] min-w-[240px] max-h-[280px] overflow-y-auto',
                              submenuSide === 'right' ? 'left-full ml-2' : 'right-full mr-2',
                            )}
                          >
                            {availableTags.map((tag) => {
                              const isSaving = savingTagId === tag.id;
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => handleTagSelect(tag.id)}
                                  disabled={isSaving}
                                  className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]',
                                    isSaving && 'opacity-50 cursor-not-allowed',
                                  )}
                                >
                                  <span
                                    className="inline-flex items-center px-1 h-6 rounded-md font-medium whitespace-nowrap"
                                    style={{
                                      backgroundColor: tag.color
                                        ? hexToRGBA(tag.color, 0.18)
                                        : '#E5E7EB',
                                      color: tag.color || '#485B80',
                                    }}
                                  >
                                    {tagLabel(tag.name)}
                                  </span>
                                  {tag.description && (
                                    <span className="text-[11px] text-[#7F8999] truncate">
                                      {tag.description}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {isChat && (
                      <div className="relative">
                        {!showArchiveConfirm ? (
                          <button
                            onClick={() => setShowArchiveConfirm(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="4" />
                              <path d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                              <path d="M10 12h4" />
                            </svg>
                            <span>Arquivar conversa</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 flex items-center justify-between gap-2">
                            <span className="text-[12px] text-[#485B80]">
                              Confirmar arquivamento?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleArchiveChat(String(itemAtendimento.id))}
                                className="px-2 py-1 text-[12px] rounded-md bg-[#EDF2F7] hover:bg-[#E6ECF3] text-[hsl(var(--secondary))]"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setShowArchiveConfirm(false)}
                                className="px-2 py-1 text-[12px] rounded-md hover:bg-[#F7F9FC] text-[#485B80]"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isChat && (
                      <div className="relative">
                        {!showArchiveConfirm ? (
                          <button
                            onClick={() => setShowArchiveConfirm(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#F7F9FC]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="4" />
                              <path d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                              <path d="M10 12h4" />
                            </svg>
                            <span>Arquivar atendimento</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 flex items-center justify-between gap-2">
                            <span className="text-[12px] text-[#485B80]">
                              Confirmar arquivamento?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleArchiveAtendimento(String(itemAtendimento.id))}
                                className="px-2 py-1 text-[12px] rounded-md bg-[#EDF2F7] hover:bg-[#E6ECF3] text-[hsl(var(--secondary))]"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setShowArchiveConfirm(false)}
                                className="px-2 py-1 text-[12px] rounded-md hover:bg-[#F7F9FC] text-[#485B80]"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isChat && (
                      <div className="relative">
                        {!showRemoveConfirm ? (
                          <button
                            onClick={() => setShowRemoveConfirm(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[#FEE2E2] text-[hsl(var(--primary))]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                              <path d="M10 10v8" />
                              <path d="M14 10v8" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                            <span>Remover</span>
                          </button>
                        ) : (
                          <div className="px-3 py-2 flex items-center justify-between gap-2">
                            <span className="text-[12px] text-[#485B80]">Confirmar remoção?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRemoveAtendimento(String(itemAtendimento.id))}
                                className="px-2 py-1 text-[12px] rounded-md bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#7F1D1D]"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setShowRemoveConfirm(false)}
                                className="px-2 py-1 text-[12px] rounded-md hover:bg-[#F7F9FC] text-[#485B80]"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body,
            )}

          <div
            className={cn(
              'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1.5 rounded-md',
              !isDragging && 'hover:bg-gray-100/50 transition-all duration-200',
            )}
            {...listeners}
            {...attributes}
            style={{ touchAction: 'none' }}
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="6" cy="2" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="2" cy="6" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="2" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="6" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>
      <div
        className="p-4 cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Tags vinculadas ao atendimento */}
        {!isChat && tags && tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 h-6 rounded-md text-[11px] font-medium"
                style={{
                  backgroundColor: tag.color ? hexToRGBA(tag.color, 0.18) : '#E5E7EB',
                  color: tag.color || '#485B80',
                }}
              >
                <span className="truncate max-w-[140px]">{tagLabel(tag.name)}</span>
                <button
                  type="button"
                  aria-label="Remover etiqueta"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagRemove(tag.id);
                  }}
                  disabled={removingTagId === tag.id}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-sm hover:bg-white/20 disabled:opacity-60"
                  title="Remover etiqueta"
                >
                  {removingTagId === tag.id ? (
                    <span className="inline-block w-3 h-3 border-2 border-white/60 border-t-transparent rounded-sm animate-spin" />
                  ) : (
                    <IconX size={10} />
                  )}
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mb-3">
          {isNameTruncated ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className={cn(
                      'font-semibold text-[hsl(var(--secondary))] text-base leading-tight cursor-help',
                      !isDragging && 'transition-colors duration-200',
                    )}
                  >
                    {truncateName(displayName, 25)}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <div className="font-medium">{displayName}</div>
                    {atentimento.email && (
                      <div className="text-gray-300 mt-1 text-xs">{atentimento.email}</div>
                    )}
                    {atentimento.phone && (
                      <div className="text-gray-300 text-xs">{atentimento.phone}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <h3
              className={cn(
                'font-semibold text-[hsl(var(--secondary))] text-base leading-tight',
                !isDragging && 'transition-colors duration-200',
              )}
            >
              {displayName}
            </h3>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {atentimento.assignees && atentimento.assignees.length > 0 ? (
              <>
                <div className="flex -space-x-2 items-center">
                  {atentimento.assignees.slice(0, 3).map((assignee) => (
                    <AvatarUser
                      key={assignee.id}
                      name={assignee.name}
                      src={profileImageUrl(assignee.userId)}
                      size={1.8}
                      className={cn(
                        'border-3 border-white shadow-md ring-2 ring-gray-100/50',
                        !isDragging && 'transition-transform hover:scale-110 hover:z-10',
                      )}
                    />
                  ))}
                  {atentimento.assignees.length > 3 && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold text-blue-700 border-3 border-white shadow-md ring-2 ring-gray-100/50 cursor-help',
                              !isDragging && 'hover:scale-110 transition-transform',
                            )}
                          >
                            +{atentimento.assignees.length - 3}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-medium">Outros responsáveis:</div>
                            {atentimento.assignees.slice(3).map((assignee) => (
                              <div key={assignee.id} className="text-xs mt-1">
                                {assignee.name}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </>
            ) : (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center cursor-help shadow-sm ring-2 ring-gray-100/50',
                        !isDragging && 'hover:scale-110 transition-transform',
                      )}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-400"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Nenhum responsável atribuído</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#485B80] text-xs leading-snug">
              {truncateName(atentimento.name, 10)}
            </span>
            <AvatarUser
              src={atentimento.avatar}
              name={atentimento.name}
              size={1.8}
              className={cn(
                'border-3 border-white shadow-md ring-2 ring-[#DDE6F2]',
                !isDragging && 'transition-transform hover:scale-105',
              )}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 -mt-2 pb-2 text-xs text-[#485B80]">
          <div className="grid grid-cols-1 gap-2">
            {atentimento.email && (
              <div>
                <span className="font-semibold">Email:</span> {atentimento.email}
              </div>
            )}
            {atentimento.phone && (
              <div>
                <span className="font-semibold">Telefone:</span> {atentimento.phone}
              </div>
            )}
            {Array.isArray(atentimento.channels) && atentimento.channels.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="font-semibold">Canais:</span>
                {atentimento.channels.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!isChat && (
        <div className="px-4 py-2 border-t border-[#DDE6F2] bg-[#F7F9FC] flex items-center justify-between text-xs text-[#485B80]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#7F8999]"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span>
                {qtdTarefas} {qtdTarefas === 1 ? 'tarefa' : 'tasks'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#7F8999]"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>
                {qtdNotas} {qtdNotas === 1 ? 'nota' : 'notas'}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </div>
  );
}

function TemperatureIcon({
  temperature,
  isDragging,
}: {
  temperature: 'HOT' | 'WARM' | 'COLD';
  isDragging?: boolean;
}) {
  const temperatureInfo = {
    HOT: {
      icon: <IconQuente />,
      iconColor: 'hsl(var(--primary))',
      dotColor: 'hsl(var(--primary))',
      label: 'Quente',
    },
    WARM: {
      icon: <IconMorno />,
      iconColor: '#F59E0B',
      dotColor: '#F59E0B',
      label: 'Morno',
    },
    COLD: {
      icon: <IconFrio />,
      iconColor: '#485B80',
      dotColor: '#485B80',
      label: 'Frio',
    },
  } as const;

  const info = temperatureInfo[temperature];
  if (!info) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full w-7 h-7 flex items-center justify-center',
              'bg-[#F7F9FC] border border-[#DDE6F2] ring-1 ring-[#E3E6EC]',
              !isDragging && 'transition-transform duration-150 hover:scale-105',
            )}
            aria-label={`Temperatura: ${info.label}`}
          >
            <div
              className="w-4 h-4 flex items-center justify-center"
              style={{ color: (temperatureInfo as any)[temperature].iconColor }}
            >
              {info.icon}
            </div>
            <span
              className="absolute bottom-0 right-0 block w-2 h-2 rounded-full border border-white"
              style={{ backgroundColor: (temperatureInfo as any)[temperature].dotColor }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>Temperatura: {info.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
