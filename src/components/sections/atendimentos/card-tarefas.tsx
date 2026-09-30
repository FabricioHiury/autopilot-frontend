'use-client'
import { useEffect, useState } from "react";
import CriarTarefa from "./criar-tarefa";
import ListaTarefas from "./lista-tarefas";
import { ApiApp } from "@/lib/api-app";
import EditarTarefa from "./editar-tarefa";

export interface TarefaInterface {
        atualizadoEm: string;
        concluida: boolean;
        criadoEm: string;
        data: string;
        horaFim: string;
        horaInicio: string;
        id: string;
        idAtendimento: string;
        idResponsavel: string;
        nome: string;
        observacoes: string;
        colaborador: {
            usuario: {
                id: string;
                nome: string;
            }
        }
}

interface CardTarefasProps {
    idAtendimento: string;
}

export default function CardTarefas({idAtendimento}: CardTarefasProps) {

    const [novaTarefa, setNovaTarefa] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<string | undefined>(undefined);
    const [tarefas,setTarefas] = useState<TarefaInterface[]>([])
    const [loading,setLoading] = useState<boolean>(true)
    const api = new ApiApp();

    const handleNovaTarefa = () => {
        setNovaTarefa(!novaTarefa);
    }

    const fetchTarefas = async () => {
        setLoading(true)
        const [data, error] = await api.atendimento.tarefasListar(idAtendimento);
        if(error){
            console.log(error);
            return;
        }
        setTarefas(data)

        setLoading(false)
    }

    const handleExcluirTarefa = async (idTarefa: string) => {
        const [data, error] = await api.atendimento.tarefasDeletar(idAtendimento,idTarefa);
        if(error){
            console.log(error);
            return;
        }

        const tarefasAtualizadas = tarefas.filter(tarefa => tarefa.id !== idTarefa);
        setTarefas(tarefasAtualizadas);
    }

    const handleEditarTarefa = (idTarefa: string) => {
        setEditarTarefa(idTarefa);
    }

    useEffect(() => {
        fetchTarefas();
    }, [novaTarefa])

    return (
        <>
          {novaTarefa && <CriarTarefa idAtendimento={idAtendimento} onCancelar={() => setNovaTarefa(false)}  onSalvar={handleNovaTarefa}/> }
          { editarTarefa && <EditarTarefa 
                idAtendimento={idAtendimento} 
                idTarefa={editarTarefa} 
                onCancelar={() => setEditarTarefa(undefined)} 
                onSalvar={() => { fetchTarefas(); setEditarTarefa(undefined)} }
                tarefa={tarefas.find(tarefa => tarefa.id === editarTarefa) as TarefaInterface}
            /> }
          { !novaTarefa && !editarTarefa &&
           <ListaTarefas 
                idAtendimento={idAtendimento} 
                tarefas={tarefas} 
                setTarefas={setTarefas} 
                loading={loading} 
                onNovaTarefa={() => setNovaTarefa(true)}  
                onExcluir={handleExcluirTarefa}
                onEditar={handleEditarTarefa}
            />}  
        </>
    )
}