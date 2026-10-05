'use client';

import { useCallback, useState } from 'react';
import BottomModal from '@/components/commons/modais/bottom-modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CriarTarefaChat from './criar-tarefa-chat';
import CriarVisita from '../../commons/modais/criar-visita';

interface ActionChatButtonProps {
  atendimentoId?: string | null;
  onAction: (action: string) => void;
}

export default function ActionChatButton({ atendimentoId, onAction }: ActionChatButtonProps) {
  if (!atendimentoId) return null;

  const [openActions, setOpenActions] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [openVisit, setOpenVisit] = useState(false);

  const handleOpenActions = useCallback((setter: (v: boolean) => void) => {
    setOpenActions(false);
    setter(true);
  }, []);

  const handleSalvarTarefa = useCallback(() => {
    setOpenTask(false);
    onAction('Nova tarefa criada com sucesso!');
  }, [onAction]);

  const handleSalvarVisita = useCallback(() => {
    setOpenVisit(false);
    onAction('Novo agendamento de visita criado com sucesso!');
  }, [onAction]);

  return (
    <>
      <Popover open={openActions} onOpenChange={setOpenActions}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="bg-[#DDE6F2] hover:bg-[hsl(var(--secondary))] hover:text-[#DDE6F2] duration-300 ease-in-out h-10 aspect-square group flex justify-center items-center p-2 rounded-lg lg:right-28 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ações do atendimento"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
            </svg>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          alignOffset={10}
          sideOffset={10}
          className="p-0 w-fit"
        >
          <div className="flex flex-col divide-y divide-gray-200">
            <button
              type="button"
              className="flex items-center gap-3 p-4 px-6 hover:bg-[#DDE6F2]"
              onClick={() => handleOpenActions(setOpenVisit)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <g clipPath="url(#clip0_4508_33791)">
                  <path
                    d="M7.50008 16.6667H5.00008C4.11603 16.6667 3.26818 16.3155 2.64306 15.6903C2.01794 15.0652 1.66675 14.2174 1.66675 13.3333V5.83332C1.66675 4.94927 2.01794 4.10142 2.64306 3.4763C3.26818 2.85118 4.11603 2.49999 5.00008 2.49999H14.1667C15.0508 2.49999 15.8986 2.85118 16.5238 3.4763C17.1489 4.10142 17.5001 4.94927 17.5001 5.83332V8.33332M6.66675 1.66666V3.33332M12.5001 1.66666V3.33332M1.66675 6.66666H17.5001M15.4167 13.0358L14.1667 14.2858"
                    stroke="#7F8999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.1667 18.3333C16.4679 18.3333 18.3333 16.4679 18.3333 14.1667C18.3333 11.8655 16.4679 10 14.1667 10C11.8655 10 10 11.8655 10 14.1667C10 16.4679 11.8655 18.3333 14.1667 18.3333Z"
                    stroke="#7F8999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4508_33791">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-[#6b7687] text-sm font-semibold leading-tight">
                Agendar visita
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 p-4 px-6 hover:bg-[#DDE6F2]"
              onClick={() => handleOpenActions(setOpenTask)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M15.0001 12.5V18.3333M17.9167 15.4167H12.0834M5.83341 13.3333H9.16674M5.83341 9.16666H12.5001M5.41674 2.91666C4.12008 2.95582 3.34758 3.09999 2.81258 3.63499C2.08008 4.36832 2.08008 5.54749 2.08008 7.90666V13.3283C2.08008 15.6883 2.08008 16.8675 2.81258 17.6008C3.54424 18.3333 4.72341 18.3333 7.08008 18.3333H9.58341M12.9101 2.91666C14.2067 2.95582 14.9801 3.09999 15.5142 3.63499C16.2476 4.36832 16.2476 5.54749 16.2476 7.90666V9.99999"
                  stroke="#7F8999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.41333 3.12499C5.41333 2.31999 6.06666 1.66666 6.87166 1.66666H11.455C11.8418 1.66666 12.2127 1.8203 12.4862 2.09379C12.7597 2.36728 12.9133 2.73822 12.9133 3.12499C12.9133 3.51176 12.7597 3.8827 12.4862 4.15619C12.2127 4.42968 11.8418 4.58332 11.455 4.58332H6.87166C6.48489 4.58332 6.11396 4.42968 5.84047 4.15619C5.56698 3.8827 5.41333 3.51176 5.41333 3.12499Z"
                  stroke="#7F8999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#6b7687] text-sm font-semibold leading-tight">
                Criar Tarefa
              </span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {openTask && (
        <BottomModal idSelector="content-container" onClose={() => setOpenTask(false)}>
          <CriarTarefaChat
            dealId={atendimentoId}
            onSave={handleSalvarTarefa}
            onCancelar={() => setOpenTask(false)}
          />
        </BottomModal>
      )}

      {openVisit && (
        <BottomModal idSelector="content-container" onClose={() => setOpenVisit(false)}>
          <CriarVisita
            dealId={atendimentoId}
            onSalvar={handleSalvarVisita}
            onCancelar={() => setOpenVisit(false)}
          />
        </BottomModal>
      )}
    </>
  );
}
