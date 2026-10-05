'use client';

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import Link from 'next/link';

import AvatarUser from '@/components/commons/avatar-user';
import AvatarCanal from '@/components/commons/avatar-canal';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import IconCheck from '@/components/icons/icon-check';
import IconX from '@/components/icons/icon-x';

import { AppServices } from '@/services/app.services';
import { profileImageUrl } from '@/lib/profile.utils';
import { cn } from '@/lib/class-name.utils';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';
import toast from 'react-hot-toast';

import { DealDetails } from '@/types/deal';
import { TarefaInterface } from '../deals/card-tarefas';
import { DealVisit } from '@/types/visit';
import { ChatAttachment } from '@/types/deal-attachment';
import { AnexosChatEmAtendimento } from './anexo-chat-em-atendimento';

interface CardAtendimentoModalProps {
  dealId: string;
}

export function CardAtendimentoModal({ dealId }: CardAtendimentoModalProps) {
  const apiRef = useRef<AppServices>();
  if (!apiRef.current) apiRef.current = new AppServices();
  const api = apiRef.current;

  const [loading, setLoading] = useState(true);

  const [ticket, setTicket] = useState<DealDetails>();
  const [tasks, setTasks] = useState<TarefaInterface[]>([]);
  const [chatAttachments, setChatAttachments] = useState<ChatAttachment[]>([]);
  const [visits, setVisits] = useState<DealVisit[]>([]);

  const [taskIndex, setTaskIndex] = useState(0);
  const tasksTotal = tasks.length;
  const currentTask = tasks[taskIndex];

  const nextTask = useCallback(() => {
    setTaskIndex((i) => (i + 1 < tasksTotal ? i + 1 : i));
  }, [tasksTotal]);

  const prevTask = useCallback(() => {
    setTaskIndex((i) => (i - 1 >= 0 ? i - 1 : i));
  }, []);

  const fetchTicket = useCallback(async () => {
    const [data, error] = await api.deal.get(dealId);
    if (error || !data) {
      toast.error('Erro ao buscar atendimento');
      console.error('Erro ao buscar atendimento', error);
      return;
    }
    setTicket(data);
  }, [api, dealId]);

  const fetchTasks = useCallback(async () => {
    const [data, error] = await api.deal.listTasks(dealId);
    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }
    setTasks(data);
    setTaskIndex(0);
  }, [api, dealId]);

  const fetchVisits = useCallback(async () => {
    const [data, error] = await api.deal.listVisits(dealId);
    if (error || !data) {
      if (error) console.error(error);
      return;
    }
    setVisits(data);
  }, [api, dealId]);

  const fetchChatFiles = useCallback(async () => {
    const [data, error] = await api.deal.chatAttachments({ dealId });
    if (error) {
      toast.error(error.message);
      return;
    }
    setChatAttachments(data || []);
  }, [api, dealId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([fetchTicket(), fetchTasks(), fetchVisits(), fetchChatFiles()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTicket, fetchTasks, fetchVisits, fetchChatFiles]);

  const handleToggleTaskDone = useCallback(
    async (taskId: string) => {
      const [response, error] = await api.deal.completeTask(dealId, taskId);
      if (error) {
        toast.error(error.message);
        console.error(error);
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: response.status, completed: response.completed } : t,
        ),
      );
      toast.success('Tarefa alterada com sucesso');
    },
    [api, dealId],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const [, error] = await api.deal.deleteTask(dealId, taskId);
      if (error) {
        toast.error(error.message);
        console.error(error);
        return;
      }
      await fetchTasks();
      setTaskIndex((i) => (i >= 1 ? i - 1 : 0));
      toast.success('Tarefa excluída com sucesso');
    },
    [api, dealId, fetchTasks],
  );

  const createdAtLabel = useMemo(() => {
    if (!ticket?.createdAt) return '';
    try {
      return new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [ticket?.createdAt]);

  return (
    <div className="w-full h-full px-6 py-3">
      {loading && <LoadingGlobal />}

      {ticket && (
        <>
          <span className="text-[#7f8999] text-xs font-normal leading-[0,875rem]">
            Iniciado em {createdAtLabel}
          </span>

          <div className="inline-flex justify-start items-center gap-2 max-w-full py-5 truncate">
            <AvatarUser
              name={ticket.customer?.name || ticket.temporaryCustomer?.name || 'Sem nome'}
              src={ticket.customer?.avatarUrl || ticket.temporaryCustomer?.avatar || ''}
              size={3.5}
            />

            <div className="flex flex-col justify-start items-start truncate">
              <div className="w-full truncate">
                <h2 className="text-[#1b263a] text-2xl font-semibold leading-[1.75rem] truncate">
                  {ticket.customer?.name || ticket.temporaryCustomer?.name || 'Sem nome'}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.50098 1.25C10.9529 1.25 13.751 4.04812 13.751 7.5C13.751 10.9519 10.9529 13.75 7.50098 13.75C6.39647 13.7518 5.3114 13.4595 4.35724 12.9031L1.25349 13.75L2.09849 10.645C1.54167 9.69055 1.24914 8.605 1.25099 7.5C1.25099 4.04812 4.04911 1.25 7.50098 1.25ZM5.37099 4.5625L5.24598 4.5675C5.16506 4.57243 5.08597 4.59369 5.01348 4.63C4.94569 4.66839 4.8838 4.71639 4.82974 4.7725C4.75473 4.84312 4.71223 4.90437 4.66661 4.96375C4.43544 5.26431 4.31097 5.63332 4.31286 6.0125C4.31411 6.31875 4.39411 6.61687 4.51911 6.89562C4.77473 7.45937 5.19536 8.05625 5.75036 8.60937C5.88411 8.7425 6.01536 8.87625 6.15661 9.00062C6.84623 9.60779 7.66802 10.0456 8.55661 10.2794L8.91161 10.3337C9.02723 10.34 9.14286 10.3312 9.25911 10.3256C9.44113 10.3162 9.61887 10.2669 9.77973 10.1812C9.86158 10.1391 9.94146 10.0932 10.0191 10.0437C10.0191 10.0437 10.046 10.0262 10.0972 9.9875C10.1816 9.925 10.2335 9.88062 10.3035 9.8075C10.3554 9.75375 10.4004 9.69062 10.4347 9.61875C10.4835 9.51687 10.5322 9.3225 10.5522 9.16062C10.5672 9.03687 10.5629 8.96937 10.561 8.9275C10.5585 8.86062 10.5029 8.79125 10.4422 8.76187L10.0785 8.59875C10.0785 8.59875 9.53473 8.36187 9.20223 8.21062C9.16744 8.19543 9.13016 8.18675 9.09223 8.185C9.04947 8.18061 9.00627 8.18542 8.96552 8.19911C8.92477 8.2128 8.88742 8.23505 8.85598 8.26437C8.85286 8.26312 8.81098 8.29875 8.35911 8.84625C8.33317 8.8811 8.29745 8.90744 8.25649 8.92191C8.21552 8.93638 8.17118 8.93833 8.12911 8.9275C8.08839 8.91658 8.0485 8.9028 8.00973 8.88625C7.93223 8.85375 7.90536 8.84125 7.85223 8.81875C7.49353 8.66222 7.16141 8.45072 6.86786 8.19187C6.78911 8.12312 6.71598 8.04812 6.64098 7.97562C6.3951 7.74014 6.18081 7.47375 6.00348 7.18312L5.96661 7.12375C5.94012 7.08385 5.91871 7.04081 5.90286 6.99562C5.87911 6.90375 5.94098 6.83 5.94098 6.83C5.94098 6.83 6.09286 6.66375 6.16349 6.57375C6.23223 6.48625 6.29036 6.40125 6.32786 6.34062C6.40161 6.22187 6.42473 6.1 6.38598 6.00562C6.21098 5.57812 6.02973 5.1525 5.84348 4.73C5.80661 4.64625 5.69724 4.58625 5.59786 4.57437C5.56411 4.57062 5.53036 4.56687 5.49661 4.56437C5.41268 4.5602 5.32857 4.56104 5.24473 4.56687L5.37099 4.5625Z"
                    fill="#485B80"
                  />
                </svg>
                <div className="text-[#485b7f] text-sm font-normal leading-[18.20px]">
                  {ticket.customer?.whatsapp || ticket.temporaryCustomer?.whatsapp || '-'}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6663 3.16663H3.33301C2.80257 3.16663 2.29387 3.37734 1.91879 3.75241C1.54372 4.12749 1.33301 4.63619 1.33301 5.16663V11.8333C1.33301 12.3637 1.54372 12.8724 1.91879 13.2475C2.29387 13.6226 2.80257 13.8333 3.33301 13.8333H12.6663C13.1968 13.8333 13.7055 13.6226 14.0806 13.2475C14.4556 12.8724 14.6663 12.3637 14.6663 11.8333V5.16663C14.6663 4.63619 14.4556 4.12749 14.0806 3.75241C13.7055 3.37734 13.1968 3.16663 12.6663 3.16663ZM12.6663 4.49996L8.33301 7.47996C8.23166 7.53847 8.1167 7.56928 7.99967 7.56928C7.88265 7.56928 7.76769 7.53847 7.66634 7.47996L3.33301 4.49996H12.6663Z"
                    fill="#485B80"
                  />
                </svg>
                <div className="text-[#485b7f] text-sm font-normal leading-[18.20px]">
                  {ticket.customer?.email || ticket.temporaryCustomer?.email || '-'}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateToDeal(ticket.id)}
            className="h-9 p-2.5 bg-[#485b7f] rounded flex justify-center items-center gap-2 w-full"
          >
            <span className="text-center text-[#f2f4f7] text-xs font-semibold">
              Acessar Página do atendimento
            </span>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {ticket?.chats?.map((chat) => (
              <div
                key={chat.id}
                className="flex px-1 py-2 bg-[#f2f4f7] rounded-lg border border-[#dce5f1] justify-start items-center gap-1.5"
              >
                <AvatarCanal
                  channel={chat.channel as 'other' | 'whatsapp' | 'instagram' | 'facebook' | 'olx'}
                  size={1.8}
                />
                <div className="flex flex-col gap-0.5">
                  <div className="text-[#1b263a] text-sm font-semibold font-['BR Sonoma'] leading-tight capitalize">
                    {chat.channel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="border-t border-[#e4e7eb] py-4 mt-6 flex flex-col gap-4">
        <div className="justify-start items-start gap-44 inline-flex">
          <div className="text-[#1b263a] text-base font-semibold font-['BR Sonoma'] leading-tight">
            Agendamento
          </div>
        </div>

        {visits.length === 0 && (
          <NoData className="min-h-fit gap-1" sizeIcon={20} label="Nenhuma visita" />
        )}

        {visits.map((visit) => (
          <div key={visit.id} className="text-[hsl(var(--secondary))]">
            <div className="grid grid-cols-[fit-content(100%),1fr,fit-content(100%)] gap-3 items-center">
              <div className="p-2.5 flex flex-col items-center justify-center bg-[#F2F4F7] rounded-[0.5rem]">
                <span className="font-semibold">
                  {new Date(visit.data).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
                <span className="text-sm">{visit.hourStart}</span>
              </div>

              <div>
                <span className="font-semibold">{visit.type}</span>
                <div className="flex items-center gap-1.5">
                  <AvatarUser
                    src={
                      visit.deal.customer?.avatarUrl ||
                      visit.deal.temporaryCustomer?.avatar ||
                      profileImageUrl('')
                    }
                    name={
                      visit.deal.customer?.name || visit.deal.temporaryCustomer?.name || 'Sem nome'
                    }
                    size={1.15}
                  />
                  <span className="text-xs truncate">
                    {visit.deal.customer?.name || visit.deal.temporaryCustomer?.name || 'Sem nome'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-y border-[#e4e7eb] py-4 mt-2 flex flex-col gap-4">
        {chatAttachments && <AnexosChatEmAtendimento attachments={chatAttachments} />}
      </div>

      <div className="h-36 flex-col justify-start items-start gap-4 inline-flex mt-6">
        <div className="justify-start items-start gap-44 inline-flex">
          <div className="text-[#1b263a] text-base font-semibold font-['BR Sonoma'] leading-tight">
            Tarefas
          </div>
          <div className="justify-start items-start gap-0.5 flex">
            <button type="button" onClick={prevTask}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                className="rotate-[90deg] hover:bg-[hsl(var(--secondary))] p-0.5 hover:text-secondary-foreground rounded-full duration-300 ease-in-out"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
            <button type="button" onClick={nextTask}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                className="rotate-[270deg] hover:bg-[hsl(var(--secondary))] p-0.5 hover:text-secondary-foreground rounded-full duration-300 ease-in-out"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </button>
          </div>
        </div>

        {tasks.length === 0 && (
          <NoData className="min-h-fit gap-1" sizeIcon={20} label="Nenhuma tarefa" />
        )}

        <div className="flex flex-col gap-6">
          {tasks.length > 0 && currentTask && (
            <TaskNav
              task={currentTask}
              onToggleDone={() => handleToggleTaskDone(currentTask.id)}
              onDelete={() => handleDeleteTask(currentTask.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskNavProps {
  task: TarefaInterface;
  onToggleDone: () => void;
  onDelete: () => void;
}

const TaskNav = memo(function TaskNav({ task, onToggleDone, onDelete }: TaskNavProps) {
  const formatTime = (time: string) => {
    const [hour = '00', minute = '00'] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  return (
    <div className="w-72 justify-start items-center gap-2 inline-flex">
      <div className="grow shrink basis-0 flex-col justify-start items-start gap-2 inline-flex">
        <div className="self-stretch justify-start items-center gap-3 inline-flex">
          <div className="grow shrink basis-0 justify-start items-center gap-3 flex">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.61209 5.85376L5.83584 3.62851C7.35609 2.10601 8.11584 1.34626 8.93259 1.52626C9.74859 1.70626 10.1183 2.71651 10.8586 4.73626L11.3596 6.10351C11.5568 6.64201 11.6558 6.91126 11.8336 7.11976C11.9132 7.21333 12.0039 7.29693 12.1036 7.36876C12.3256 7.52851 12.6016 7.60426 13.1536 7.75651C14.3986 8.10001 15.0218 8.27176 15.2566 8.67901C15.3581 8.85526 15.4109 9.05536 15.4096 9.25876C15.4066 9.72901 14.9498 10.1858 14.0371 11.1L12.9751 12.162L16.3321 15.522C16.4344 15.6305 16.4904 15.7745 16.4882 15.9236C16.486 16.0726 16.4259 16.215 16.3205 16.3204C16.215 16.4258 16.0727 16.486 15.9236 16.4881C15.7746 16.4903 15.6305 16.4343 15.5221 16.332L12.1658 12.972L11.0663 14.073C10.1468 14.9925 9.68709 15.453 9.21384 15.453C9.01509 15.453 8.81934 15.402 8.64609 15.303C8.23509 15.0683 8.06259 14.4413 7.71684 13.1865C7.56534 12.6353 7.48959 12.36 7.33059 12.1373C7.26084 12.0405 7.17984 11.952 7.08909 11.8733C6.88284 11.6948 6.61509 11.5943 6.08034 11.3933L4.69734 10.8735C2.69934 10.1235 1.70034 9.74776 1.52484 8.93401C1.34859 8.11951 2.10234 7.36426 3.61209 5.85376Z"
                fill="#567CC6"
              />
            </svg>
            <div>
              <div className="grow shrink basis-0 text-[#283855] text-sm font-semibold">
                {task.name}
              </div>
            </div>
          </div>
        </div>

        <div className="justify-start items-center gap-2 inline-flex">
          <AvatarUser
            name={task.employee.user.name}
            src={profileImageUrl(task.employee.user.id)}
            size={1.8}
          />
          <div className="p-1 bg-[#dce5f1] rounded-lg justify-start items-center gap-0.5 flex">
            <div className="w-3.5 h-3.5 justify-center items-center flex overflow-hidden">
              <div className="w-3 h-3 relative">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Group"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    stroke="#485B80"
                  >
                    <path id="Vector" d="M4.37697 11.5428L3.50293 13.1199" />
                    <path id="Vector_2" d="M9.62256 11.5428L10.4966 13.1199" />
                    <path
                      id="Vector_3"
                      d="M6.99975 12.2457C9.89668 12.2457 12.2451 9.89728 12.2451 7.00036C12.2451 4.10343 9.89668 1.755 6.99975 1.755C4.10282 1.755 1.75439 4.10343 1.75439 7.00036C1.75439 9.89728 4.10282 12.2457 6.99975 12.2457Z"
                    />
                    <path
                      id="Vector_4"
                      d="M1.93008 5.60211C1.52739 5.30028 1.22003 4.88896 1.0447 4.41724C0.869361 3.94552 0.833447 3.43332 0.941239 2.94174C1.04903 2.45017 1.29598 1.99999 1.65261 1.64492C2.00925 1.28985 2.46051 1.04488 2.95255 0.939253C3.44459 0.833622 3.95664 0.871787 4.42758 1.04919C4.89853 1.2266 5.30849 1.53576 5.60854 1.93978"
                    />
                    <path id="Vector_5" d="M7 1.75505L7.00004 0.880829" />
                    <path id="Vector_6" d="M7 4.37772V7.00038" />
                    <path id="Vector_7" d="M7 7.00037L8.8545 8.85487" />
                    <path
                      id="Vector_8"
                      d="M12.0696 5.60211C12.4723 5.30028 12.7796 4.88896 12.955 4.41724C13.1303 3.94552 13.1662 3.43332 13.0584 2.94174C12.9506 2.45017 12.7037 1.99999 12.347 1.64492C11.9904 1.28985 11.5391 1.04488 11.0471 0.939253C10.5551 0.833622 10.043 0.871787 9.57207 1.04919C9.10113 1.2266 8.69117 1.53576 8.39111 1.93978"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <div className="text-[#485b7f] text-xs font-semibold pl-1 leading-none">
              {new Date(task.data).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              - {formatTime(task.hourEnd)}
            </div>
          </div>
        </div>

        <div className="justify-start items-start gap-2 flex">
          <button
            type="button"
            className={cn(
              'w-5 h-5 rounded-full justify-center items-center flex',
              task.completed
                ? 'bg-[#485b7f]'
                : 'bg-[#ebeef2] hover:bg-[#dce5f1] duration-300 ease-in-out',
            )}
            onClick={onToggleDone}
          >
            <IconCheck color={task.completed ? '#ffffff' : '#485b7f'} size={14} />
          </button>

          <button
            type="button"
            className="w-5 h-5 bg-[#ebeef2] rounded-full flex justify-center items-center hover:bg-[#dce5f1] duration-300 ease-in-out"
            onClick={onDelete}
          >
            <IconX color="#cc3333" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});
