'use-client';
import { useEffect, useState } from 'react';
import CriarTarefa from './criar-tarefa';
import ListaTarefas from './lista-tarefas';
import { AppServices } from '@/services/app.services';
import EditarTarefa from './editar-tarefa';

export interface TarefaInterface {
  updatedAt: string;
  completed: boolean;
  createdAt: string;
  data: string;
  hourEnd: string;
  hourStart: string;
  id: string;
  dealId: string;
  assigneeId: string;
  name: string;
  notes: string;
  employee: {
    user: {
      id: string;
      name: string;
    };
  };
}

interface CardTarefasProps {
  dealId: string;
}

export default function CardTarefas({ dealId }: CardTarefasProps) {
  const [novaTarefa, setNovaTarefa] = useState(false);
  const [editarTarefa, setEditarTarefa] = useState<string | undefined>(undefined);
  const [tasks, setTarefas] = useState<TarefaInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const api = new AppServices();

  const handleNovaTarefa = () => {
    setNovaTarefa(!novaTarefa);
  };

  const fetchTarefas = async () => {
    setLoading(true);
    const [data, error] = await api.deal.listTasks(dealId);
    if (error) {
      console.log(error);
      return;
    }
    setTarefas(data);

    setLoading(false);
  };

  const handleExcluirTarefa = async (taskId: string) => {
    const [data, error] = await api.deal.deleteTask(dealId, taskId);
    if (error) {
      console.log(error);
      return;
    }

    const tarefasAtualizadas = tasks.filter((tarefa) => tarefa.id !== taskId);
    setTarefas(tarefasAtualizadas);
  };

  const handleEditarTarefa = (taskId: string) => {
    setEditarTarefa(taskId);
  };

  useEffect(() => {
    fetchTarefas();
  }, [novaTarefa]);

  return (
    <>
      {novaTarefa && (
        <CriarTarefa
          dealId={dealId}
          onCancelar={() => setNovaTarefa(false)}
          onSalvar={handleNovaTarefa}
        />
      )}
      {editarTarefa && (
        <EditarTarefa
          dealId={dealId}
          taskId={editarTarefa}
          onCancelar={() => setEditarTarefa(undefined)}
          onSalvar={() => {
            fetchTarefas();
            setEditarTarefa(undefined);
          }}
          tarefa={tasks.find((tarefa) => tarefa.id === editarTarefa) as TarefaInterface}
        />
      )}
      {!novaTarefa && !editarTarefa && (
        <ListaTarefas
          dealId={dealId}
          tasks={tasks}
          setTarefas={setTarefas}
          loading={loading}
          onNovaTarefa={() => setNovaTarefa(true)}
          onExcluir={handleExcluirTarefa}
          onEditar={handleEditarTarefa}
        />
      )}
    </>
  );
}
