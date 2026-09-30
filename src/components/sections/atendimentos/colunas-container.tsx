"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";

import ColunaEtapa from "./coluna-etapa";
import ItemEtapa from "./item-etapa";

import {
  ColunaEtapaType,
  ItemAtendimentoType,
} from "@/utils/types/atentimento-lista-type";

import {
  STATUS_ATENDIMENTO,
} from "@/utils/types/status-atentimento-enum";

import CenterModal from "@/components/commons/modais/center-modal";
import ConfirmationModal from "@/components/commons/modais/confirmation-modal";
import ConteudoAlterarStatus from "./conteudo-alterar-status";
import { ConteudoNovoAtendimento } from "./conteudo-novo-atendimento";

import { ApiApp } from "@/lib/api-app";
import toast from "react-hot-toast";

interface ColumnsContainerProps {
  reference?: React.RefObject<HTMLDivElement>;
  columns: ColunaEtapaType[];
  className?: string;
  availableTags?: Array<{ id: string; nome: string; cor: string; descricao?: string }>; 
}

const toStr = (v: string | number | undefined | null): string =>
  v === undefined || v === null ? "" : String(v);

const parseActiveId = (rawId: string) => {
  const parts = String(rawId).split("-");
  const columnId = parts.shift() as string;
  const itemId = parts.join("-");
  return { columnId, itemId };
};

function findItemLocation(
  cols: ColunaEtapaType[],
  itemId: string
): { colIndex: number; itemIndex: number } | null {
  for (let ci = 0; ci < cols.length; ci++) {
    const ii = cols[ci].items.findIndex((i) => toStr(i.id) === itemId);
    if (ii !== -1) return { colIndex: ci, itemIndex: ii };
  }
  return null;
}

function cloneCols(cols: ColunaEtapaType[]): ColunaEtapaType[] {
  return cols.map((c) => ({
    ...c,
    items: c.items.map((i) => ({ ...i, data: { ...i.data } })),
  }));
}

const ColumnsContainer = ({
  reference,
  columns: originalColumns,
  className,
  availableTags,
}: ColumnsContainerProps) => {
  const [undoSnapshot, setUndoSnapshot] = useState<string>(
    JSON.stringify(originalColumns)
  );
  const [columns, setColumns] = useState<ColunaEtapaType[]>(originalColumns);

  const [, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<ItemAtendimentoType | null>(null);
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

  const [changedItem, setChangedItem] = useState<{
    id: string;
    temperatura: "quente" | "morno" | "frio";
    status: STATUS_ATENDIMENTO;
    novoStatus: STATUS_ATENDIMENTO;
    responsaveis: {
      id?: string;
      idColaborador: string;
      nome: string;
      avatarUrl?: string | undefined;
      whatsapp?: string | null;
      cargos: string;
      idUsuario: string;
    }[];
    origem: string;
    nome?: string;
    email?: string;
    telefone?: string;
    avatar?: string;
    createdAtendimentoId?: number;
    _fromChat?: boolean;
  } | null>(null);

  const [showConfirmNewTicket, setShowConfirmNewTicket] = useState(false);

  const api = useMemo(() => new ApiApp(), []);
  const undoRef = useRef(undoSnapshot);

  useEffect(() => {
    undoRef.current = undoSnapshot;
  }, [undoSnapshot]);

  useEffect(() => {
    setColumns(originalColumns);
    setUndoSnapshot(JSON.stringify(originalColumns));
  }, [originalColumns]);

  const handleCancel = useCallback(() => {
    setChangedItem(null);
    try {
      const original: ColunaEtapaType[] = JSON.parse(undoRef.current || "[]");
      setColumns(original);
    } catch { }
  }, []);

  const requestCloseNewTicket = useCallback(() => {
    setShowConfirmNewTicket(true);
  }, []);

  const confirmCloseNewTicket = useCallback(() => {
    setShowConfirmNewTicket(false);
    handleCancel();
  }, [handleCancel]);

  const cancelCloseNewTicket = useCallback(() => {
    setShowConfirmNewTicket(false);
  }, []);

  const handleSuccess = useCallback(
    async (createdRequestId?: string, atendimentoData?: {
      titulo: string;
      temperatura: string;
      descricaoAtendimento: string;
    }) => {
      if (!changedItem) return;

      const originalId = toStr(changedItem.id);
      const fromChat = changedItem._fromChat === true;

      if (fromChat) {
        if (!createdRequestId) {
          toast.error("Erro ao criar atendimento");
          return;
        }

        setColumns((prev) => {
          const cols = cloneCols(prev);
          const loc = findItemLocation(cols, originalId);
          if (loc) {
            cols[loc.colIndex].items[loc.itemIndex].id = toStr(createdRequestId);
          }
          return cols;
        });

        setColumns((prev) => {
          const cols = cloneCols(prev);
          const loc = findItemLocation(cols, String(createdRequestId));
          if (!loc) return prev;
          const refItem = cols[loc.colIndex].items[loc.itemIndex];
          const filledName = toStr(changedItem.nome || (refItem as any)?.data?.nome || (refItem as any)?.data?.name || "");
          refItem.data = {
            ...refItem.data,
            etapa: changedItem.novoStatus,
            status: changedItem.novoStatus,
            ...(filledName ? { nome: filledName, name: filledName } : {}),
          };
          cols[loc.colIndex].items[loc.itemIndex] = { ...refItem };
          return cols;
        });

        if (atendimentoData) {
          setColumns((prev) => {
            const cols = cloneCols(prev);
            const loc = findItemLocation(cols, String(createdRequestId));
            if (!loc) return prev;
            const refItem = cols[loc.colIndex].items[loc.itemIndex];

            refItem.data = {
              ...refItem.data,
              titulo: atendimentoData.titulo,
              temperatura: atendimentoData.temperatura as "quente" | "morno" | "frio",
            };

            cols[loc.colIndex].items[loc.itemIndex] = { ...refItem };
            return cols;
          });
        }

        setChangedItem(null);
        return;
      }

      const resolvedId = toStr(changedItem.createdAtendimentoId ?? changedItem.id);
      const [data, error] = await api.atendimento.pegar(resolvedId);
      if (!data || error) {
        toast.error(error?.message || "Erro ao pegar atendimento");
        return;
      }

      setColumns((prev) => {
        const cols = cloneCols(prev);
        const loc = findItemLocation(cols, resolvedId);
        if (!loc) return prev;
        const refItem = cols[loc.colIndex].items[loc.itemIndex];
        const mappedResp = (data.responsaveis || []).map((r: any) => ({
          id: r.idColaborador ? toStr(r.idColaborador) : undefined,
          nome: toStr(r.nome),
          idUsuario: toStr(r.idUsuario),
        }));
        refItem.data = {
          ...refItem.data,
          responsaveis: mappedResp as any,
          temperatura: data.temperatura ?? refItem.data.temperatura,
        };
        return cols;
      });

      setChangedItem(null);
    },
    [api, changedItem]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(String(active.id));
      const { columnId, itemId } = parseActiveId(String(active.id));
      const col = columns.find((c) => c.id === columnId);
      const item = col?.items.find((i) => i.id === itemId);
      if (item) {
        setDraggedItem(item);
        setDraggedStageId(columnId);
      } else {
        setDraggedItem(null);
        setDraggedStageId(null);
      }
    },
    [columns]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedItem(null);
      setDraggedStageId(null);
      return;
    }

    const { columnId: sourceColumnId, itemId } = parseActiveId(String(active.id));
    const overStr = String(over.id);
    const destinationColumnId = overStr.includes("-")
      ? parseActiveId(overStr).columnId
      : overStr;

    if (sourceColumnId === destinationColumnId) {
      setActiveId(null);
      setDraggedItem(null);
      setDraggedStageId(null);
      return;
    }

    handleItemMoved(itemId, sourceColumnId, destinationColumnId);
  };

  React.useEffect(() => {
    const onExternalMove = (ev: Event) => {
      const e = ev as CustomEvent<{ itemId: string; currentColumnId: string; novoStatus: STATUS_ATENDIMENTO }>;
      const detail = e.detail;
      if (!detail) return;
      const { itemId, currentColumnId, novoStatus } = detail;
      const destinationCol = columns.find((c) => c.etapa === novoStatus);
      if (!destinationCol) {
        toast.error("Etapa destino não encontrada");
        return;
      }
      handleItemMoved(String(itemId), String(currentColumnId), String(destinationCol.id));
    };

    window.addEventListener("atendimento:move", onExternalMove as EventListener);
    return () => {
      window.removeEventListener("atendimento:move", onExternalMove as EventListener);
    };
  }, [columns]);

  const handleItemMoved = async (itemId: string, oldColId: string, newColId: string) => {
    const undoData = JSON.stringify(columns);

    setColumns((prevCols) => {
      const oldIndex = prevCols.findIndex((c) => c.id === oldColId);
      const newIndex = prevCols.findIndex((c) => c.id === newColId);
      if (oldIndex < 0 || newIndex < 0) return prevCols;

      const originalItem = prevCols[oldIndex].items.find((i) => i.id === itemId);
      if (!originalItem) return prevCols;

      const destinationStage = prevCols[newIndex].etapa;

      if (
        originalItem.data.etapa === STATUS_ATENDIMENTO.CHAT &&
        destinationStage !== STATUS_ATENDIMENTO.PRE_ATENDIMENTO
      ) {
        toast.error("Um chat só pode ser movido para a etapa de Pré-atendimento.");
        return prevCols;
      }

      if (
        originalItem.data.etapa !== STATUS_ATENDIMENTO.CHAT &&
        destinationStage === STATUS_ATENDIMENTO.CHAT
      ) {
        toast.error("Este atendimento não pode voltar para a coluna Chat.");
        return prevCols;
      }

      const newCols = prevCols.map((c) => ({ ...c, items: [...c.items] }));

      const moved = {
        ...originalItem,
        data: {
          ...originalItem.data,
          etapa: destinationStage,
          status: destinationStage,
        },
      };

      newCols[oldIndex].items = newCols[oldIndex].items.filter((i) => i.id !== itemId);
      newCols[newIndex].items.unshift(moved);

      setChangedItem({
        id: moved.id,
        status: originalItem.data.etapa === STATUS_ATENDIMENTO.CHAT ? STATUS_ATENDIMENTO.CHAT : destinationStage,
        novoStatus: destinationStage,
        temperatura: moved.data.temperatura ?? "frio",
        responsaveis: (moved.data.responsaveis || []).map((r: any) => ({
          idColaborador: r.id,
          nome: r.nome,
          avatarUrl: "",
          cargos: "",
          idUsuario: r.idUsuario,
        })),
        origem: moved.data.origemAtendimento || "outros",
        nome: moved.data.nome,
        email: moved.data.email,
        telefone: moved.data.telefone,
        avatar: (moved.data as any).avatar || "",
        _fromChat: originalItem.data.etapa === STATUS_ATENDIMENTO.CHAT,
      });

      return newCols;
    });

    setUndoSnapshot(undoData);
    setActiveId(null);
    setDraggedStageId(null);
    setDraggedItem(null);
  };

  React.useEffect(() => {
    const removeById = (id: string) => {
      setColumns((prev) => prev.map((c) => ({ ...c, items: c.items.filter((i) => String(i.id) !== String(id)) })));
    };

    const onRemoved = (ev: Event) => {
      const e = ev as CustomEvent<{ idAtendimento: string }>;
      const id = String(e.detail?.idAtendimento || "");
      if (!id) return;
      removeById(id);
    };

    const onArchived = (ev: Event) => {
      const e = ev as CustomEvent<{ idAtendimento: string }>;
      const id = String(e.detail?.idAtendimento || "");
      if (!id) return;
      removeById(id);
    };

    window.addEventListener("atendimento:removido", onRemoved as EventListener);
    window.addEventListener("atendimento:arquivado", onArchived as EventListener);

    return () => {
      window.removeEventListener("atendimento:removido", onRemoved as EventListener);
      window.removeEventListener("atendimento:arquivado", onArchived as EventListener);
    };
  }, []);

  return (
    <div
      className={"h-full min-h-0 flex flex-col overflow-hidden " + (className || "")}
      ref={reference}
    >
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        autoScroll={{
          threshold: { x: 0.5, y: 0.1 },
          acceleration: 2,
          interval: 20,
          canScroll: (element) => element !== document.scrollingElement,
        }}
      >
        <div className="flex-1 min-h-0 flex gap-3 w-full px-4 pb-8 md:px-6 overflow-x-auto overflow-y-auto">
          {columns.map((column) => (
            <div
              key={toStr(column.id)}
              className="flex-shrink-0 w-80 min-w-[320px] h-full"
            >
              <ColunaEtapa coluna={column} availableTags={availableTags} />
            </div>
          ))}
        </div>

        <DragOverlay>
          {draggedItem && draggedStageId ? (
            <ItemEtapa itemAtendimento={draggedItem} etapaId={draggedStageId as any} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {changedItem && (
        <CenterModal
          idSelector="content-container"
          onClose={requestCloseNewTicket}
          allowClickOutsideToClose={false}
        >
          {changedItem._fromChat ? (
            <ConteudoNovoAtendimento
              onCancel={requestCloseNewTicket}
              onSucess={(createdAtendimentoId, atendimentoData) => {
                if (createdAtendimentoId) {
                  handleSuccess(String(createdAtendimentoId), atendimentoData);
                } else {
                  setChangedItem(null);
                }
              }}
              onForceClose={handleCancel}
              initialData={{
                chatId: changedItem.id,
                origemAtendimento: changedItem.origem,
                nome: changedItem.nome,
                email: changedItem.email,
                telefone: changedItem.telefone,
                avatar: changedItem.avatar,
                status: changedItem.novoStatus,
              }}
            />
          ) : (
            <ConteudoAlterarStatus
              atendimento={{
                id: changedItem.id,
                responsaveis: changedItem.responsaveis,
                status: changedItem.status,
                novoStatus: changedItem.novoStatus,
                temperatura: changedItem.temperatura,
                origem: changedItem.origem,
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              fixedStatus
            />
          )}
        </CenterModal>
      )}

      <ConfirmationModal
        isOpen={showConfirmNewTicket}
        title="Você tem informações não salvas"
        message="Deseja realmente sair? Todas as informações preenchidas serão perdidas."
        onConfirm={confirmCloseNewTicket}
        onCancel={cancelCloseNewTicket}
      />
    </div>
  );
};

export default ColumnsContainer;