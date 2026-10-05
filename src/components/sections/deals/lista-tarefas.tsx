import InputRadioOption from '@/components/commons/inputs/input-radio-option';
import IconLista from './icons/icon-lista';
import IconMais from './icons/icon-mais';
import AvatarUser from '@/components/commons/avatar-user';
import { TarefaInterface } from './card-tarefas';
import { format } from 'date-fns';
import api from '@/utils/classes/api';
import { profileImageUrl } from '@/lib/profile.utils';
import { cn } from '@/lib/class-name.utils';

export interface ListaTarefasProps {
  tasks: TarefaInterface[];
  setTarefas: Function;
  onNovaTarefa: () => void;
  loading: boolean;
  dealId: string;
  onExcluir: (taskId: string) => void;
  onEditar: (taskId: string) => void;
}

function stringData(data: string) {
  const [day, month, year] = data.split('/');
  const formattedDate = `${year}-${month}-${day}`;
  return new Date(formattedDate);
}

export default function ListaTarefas({
  tasks,
  setTarefas,
  onNovaTarefa,
  loading,
  dealId,
  onExcluir,
  onEditar,
}: ListaTarefasProps) {
  if (loading || !tasks) {
    return (
      <div className="bg-white border border-[#DDE6F2] rounded-[0.5rem] p-6 animate-fade-in-top">
        <div className="border-b flex flex-col gap-3 pb-5 mb-7">
          <div className="flex items-center justify-between text-[#485B80]">
            <div className="flex items-center gap-2">
              <IconLista />
              <div className="h-4 w-28 bg-[#EBEEF2] rounded"></div>
            </div>
            <div className="h-4 w-10 bg-[#EBEEF2] rounded"></div>
          </div>
          <div className="bg-[#E3E6EC] w-full h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#C9D2E1] h-1.5 rounded-full w-1/3 animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-[#EBEEF2]"></div>
                <div className="h-6 w-40 rounded bg-[#EBEEF2]"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-[#EBEEF2]"></div>
                <div className="h-6 w-6 rounded-full bg-[#EBEEF2]"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7">
          <div className="w-full h-10 rounded-[0.5rem] bg-[#F2F4F7] border border-dashed border-[#c8ccd2]"></div>
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    // retorna formato 00:00
    const [hour, minute] = time.split(':');
    // Adiciona zero à esquerda se necessário
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  };

  const tarefasAtrasadas = tasks.filter(
    (tarefa) => !tarefa.completed && stringData(tarefa.data) < new Date(),
  );
  const tarefasConcluidas = tasks.filter((tarefa) => tarefa.completed);
  let progresso;
  progresso = (tarefasConcluidas.length / tasks.length) * 100;

  const Tarefa = ({ tarefa }: TarefaProps) => {
    const estaAtrasado = !tarefa.completed && stringData(tarefa.data) < new Date();

    function toggle(value: boolean) {
      api.post(`/deals/${dealId}/tasks/${tarefa.id}`);
      setTarefas((old: TarefaInterface[]) => {
        const tmp = old.map((obj) => {
          if (obj.id === tarefa.id) {
            return { ...obj, completed: value }; // Create a new object with the updated status
          }
          return obj; // Return the unchanged object
        });
        return tmp; // Return the updated array
      });
    }

    return (
      <div className={'group flex gap-2 text-sm justify-between'}>
        <div
          className={cn(
            'flex gap-2 text-sm justify-between',
            tarefa.notes ? 'items-start' : 'items-center',
          )}
        >
          <div className="flex gap-2 items-center">
            <InputRadioOption
              selected={tarefa.completed}
              onChange={(value) => toggle(value)}
              color="hsl(var(--primary))"
            />
            <div
              className="flex flex-nowrap items-center bg-white p-1 px-2 gap-1.5 rounded-[0.5rem]"
              style={{
                backgroundColor: estaAtrasado ? '#C94040' : '#DDE6F2',
                color: estaAtrasado ? '#FFFFFF' : 'hsl(var(--primary))',
              }}
            >
              <AvatarUser
                size={1.5}
                name={tarefa.employee.user.name}
                src={profileImageUrl(tarefa.employee.user.id)}
              />
              <span className="font-semibold text-xs">
                {format(tarefa.data, 'dd/MM')} {formatTime(tarefa.hourEnd || tarefa.hourStart)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-[#485B80] font-semibold whitespace-pre-wrap">{tarefa.name}</div>
            {tarefa.notes && (
              <div className="text-[#485B80] text-xs whitespace-pre-wrap">{tarefa.notes}</div>
            )}
          </div>
        </div>

        <div className="flex items-start justify-end gap-2 pt-3">
          <button onClick={() => onEditar(tarefa.id)} className="text-[#485B80]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
            </svg>
          </button>
          <button onClick={() => onExcluir(tarefa.id)} className="text-[#485B80]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#DDE6F2] rounded-[0.5rem] p-6">
      <div className="border-b flex flex-col gap-3 pb-5 mb-7">
        <div className="flex items-center justify-between text-[#485B80]">
          <div className="flex items-center gap-2">
            <IconLista />
            <h3 className="font-semibold">Tarefas</h3>
            {tarefasAtrasadas.length > 0 && (
              <div className="text-xs text-white bg-[#C94040] rounded-full px-2.5 py-0.5">
                {tarefasAtrasadas.length}
                {tarefasAtrasadas.length > 1 ? ' atrasadas' : ' atrasada'}
              </div>
            )}
          </div>

          <div className="font-semibold">
            {tarefasConcluidas.length}/{tasks.length}
          </div>
        </div>

        <div className="bg-[#E3E6EC] w-full h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[hsl(var(--primary))] h-1.5 rounded-full duration-500 transition-all w-full origin-left"
            style={{ transform: `scaleX(${progresso}%)` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {tasks.map((tarefa) => (
          <Tarefa key={tarefa.id} tarefa={tarefa} />
        ))}
      </div>

      <div className="mt-7">
        <button
          onClick={onNovaTarefa}
          className="w-full h-10 py-2 bg-[#f2f4f7] text-[#485B80] rounded-[0.5rem] border border-dashed border-[#c8ccd2] justify-center items-center gap-2 inline-flex text-sm font-semibold"
        >
          <IconMais fill="#485B80" />
          Adicionar nova tarefa
        </button>
      </div>
    </div>
  );
}

export interface TarefaProps {
  tarefa: TarefaInterface;
}
