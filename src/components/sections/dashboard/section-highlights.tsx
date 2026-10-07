import HighlightItem from './highlight-item';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Highlight } from '@/types/highlights';

export default function SectionHighlights() {
  const [highlight, setHighlight] = useState<Highlight>();

  async function load() {
    const [response, error] = await api.get(`/store/dashboard/report-weekly`);
    if (error) {
      return toast.error(error.message);
    }
    setHighlight(response.data);
  }

  useEffect(() => {
    load();
  }, []);

  if (!highlight)
    return (
      <div className="py-8 px-1 text-[14px] flex items-center justify-center opacity-50 w-full">
        <p>Carregando...</p>
      </div>
    );

  return (
    <div
      className="flex flex-col gap-3 p-2 md:flex-row md:gap-6 md:overflow-y-hidden md:overflow-x-auto md:max-h-[180px] md:max-w-full"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <HighlightItem
        title="ATENDIMENTOS EM ABERTO"
        value={highlight.dealsAtOpen.limit}
        percentage={highlight.dealsAtOpen.percentage}
      />
      <HighlightItem
        title="VENDAS REALIZADAS (SUCESSO)"
        value={highlight.salesCompleted.limit}
        percentage={highlight.salesCompleted.percentage}
      />
      <HighlightItem
        title="CHATS SEM RESPOSTA"
        value={highlight.chatsWithoutReply.limit}
        percentage={highlight.chatsWithoutReply.percentage}
      />
      <HighlightItem
        title="TAREFAS PENDENTES"
        value={highlight.tasksPending.limit}
        percentage={highlight.tasksPending.percentage}
      />
    </div>
  );
}
