'use client';
import { useDroppable } from '@dnd-kit/core';
import ItemEtapa from './item-etapa';
import { PipelineColumn } from '@/types/deal';
import React, { useRef, useCallback } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ColunaEtapaProps {
  coluna: PipelineColumn;
  availableTags?: Array<{ id: string; name: string; color: string; description?: string }>;
}

const ColunaEtapa = ({ coluna, availableTags }: ColunaEtapaProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });
  const parentRef = useRef<HTMLDivElement | null>(null);

  const combinedRef = (node: HTMLDivElement) => {
    parentRef.current = node;
    setNodeRef(node);
  };

  const estimateSize = useCallback(() => {
    const cardHeight = coluna.stage === 'chat' ? 120 : 230;
    const gap = 12;

    return cardHeight + gap;
  }, [coluna.stage]);

  const rowVirtualizer = useVirtualizer({
    count: coluna.items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  return (
    <div className="flex flex-col gap-2 w-full h-full" style={{ zIndex: 1 }}>
      <div
        className="border-t-2 font-semibold bg-white rounded-[.5rem] px-4 py-2 flex-shrink-0"
        style={{ borderColor: coluna.color }}
      >
        {coluna.stageLabel} ({coluna.items.length})
      </div>

      <div
        ref={combinedRef}
        data-active={isOver}
        className="h-[720px] bg-[#E2E6ED] rounded-[1rem] data-[active=true]:border-2 border-[#485B80] overflow-y-auto"
      >
        <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          <SortableContext
            items={coluna.items.map((i) => `${coluna.id}-${i.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const item = coluna.items[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    padding: '8px',
                  }}
                >
                  <ItemEtapa
                    itemAtendimento={item}
                    etapaId={coluna.id}
                    availableTags={availableTags}
                  />
                </div>
              );
            })}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default ColunaEtapa;
