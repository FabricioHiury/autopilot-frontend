'use client';
import { TextareaComLabel } from '@/components/commons/inputs/textarea-com-label';
import IconTarefa from './icons/icon-tarefa';
import { DatePicker } from '@/components/commons/inputs/date-picker';
import { TimePicker } from '@/components/commons/inputs/time-picker';
import { AppServices } from '@/services/app.services';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/loading/Spinner';
import { Employee } from '@/lib/api-response-types';
import { ComboboxSelectPerson } from '@/components/commons/inputs/combobox-select-person';
import { profileImageUrl } from '@/lib/profile.utils';

export interface EditarTarefaProps {
  dealId: string;
  taskId: string;
  onCancelar: () => void;
  onSalvar: () => void;
  tarefa: {
    name: string;
    notes?: string;
    assigneeId: string;
    hourEnd: string;
    data: string;
  };
}

const taskSchema = z
  .object({
    name: z.string().min(1, { message: 'Insira o nome da tarefa' }),
    notes: z.string().optional(),
    assigneeId: z.string().min(1, { message: 'É necessário um responsavel para a tarefa' }),
    hourEnd: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, { message: 'Informe a hora de fim' }),
    data: z.string().min(1, { message: 'Informe a data' }),
    dealId: z.string(),
    taskId: z.string(),
  })
  .transform(async (obj, ctx) => {
    const api = new AppServices();
    let { dealId, data, ...form } = obj;

    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const [response, error] = await api.deal.editTask(obj.dealId, obj.taskId, {
      name: form.name,
      notes: form.notes,
      assigneeId: form.assigneeId,
      hourEnd: form.hourEnd,
      data: formattedDate,
    });

    if (error) {
      ctx.addIssue({
        code: 'custom',
        message: error.message,
      });
      return z.NEVER;
    }
  });
export default function EditarTarefa({
  dealId,
  taskId,
  onCancelar,
  onSalvar,
  tarefa,
}: EditarTarefaProps) {
  const defaultTask = {
    name: tarefa.name,
    notes: tarefa.notes,
    assigneeId: tarefa.assigneeId,
    dealId: dealId,
    taskId: taskId,
    hourEnd: tarefa.hourEnd,
    data: tarefa.data,
  };

  const [form, setForm] = useState(defaultTask);
  const [loading, setLoading] = useState<boolean>(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<{
    id: string;
    name: string;
    avatar: string;
    metaData: string[];
  }>();

  async function loadResponsaveis(search: string) {
    const [response, error] = await api.get(
      '/employees/search-employees' +
        api.query.searchInMemoryQuerys({
          search: search,
        }),
    );
    if (error) {
      toast.error(error.message);
      return [];
    }
    return response.data.employees.map((obj: Employee) => {
      return {
        id: obj.id,
        name: obj.name,
        avatar: profileImageUrl(obj.userId),
        metaData: [obj.whatsapp],
      };
    });
  }

  async function pegarResponsavel(assigneeId: string) {
    const [response, error] = await api.get(`/employees/search-employee/${assigneeId}`);
    if (error) {
      toast.error(error.message);
      return [];
    }
    const assignee = {
      id: response.data.id,
      name: response.data.name,
      avatar: '',
      metaData: [],
    };

    setResponsavelSelecionado(assignee);
  }

  function updateForm(value: any, type: string) {
    setForm((prev) => ({
      ...prev,
      [type]: value,
    }));
  }
  const handleSalvar = async () => {
    setLoading(true);
    const x = await taskSchema.safeParseAsync(form);
    setLoading(false);
    if (!x.success) {
      return toast.error(x.error.issues[0].message);
    }
    onSalvar();
  };

  useEffect(() => {
    console.log(form);
    pegarResponsavel(form.assigneeId);
  }, [form]);

  return (
    <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
      <div className="bg-[hsl(var(--secondary))] text-secondary-foreground font-semibold flex gap-2 py-3 px-4">
        <IconTarefa />
        <h3>Editar tarefa</h3>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <TextareaComLabel
          value={form.name}
          label="Qual a tarefa?"
          onChange={(value) => updateForm(value, 'name')}
          placeholder="Descreva a tarefa"
        />

        <div>
          <label className="text-xs text-[#485B80] font-semibold">Selecione o responsável</label>
          {responsavelSelecionado && (
            <ComboboxSelectPerson
              value={[responsavelSelecionado]}
              onValueChange={(value) => updateForm(value[0].id, 'assigneeId')}
              placeholder="Procure pelo responsável"
              onSearch={(search: string) => {
                return loadResponsaveis(search);
              }}
              unique={true}
            />
          )}
        </div>

        <TextareaComLabel
          value={form.notes}
          label="Adicionar uma observação"
          onChange={(value) => updateForm(value, 'notes')}
          placeholder="Insira uma observação"
        />

        <div className="grid grid-rows-2 grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold text-xs">Data</label>
            <DatePicker
              value={form.data}
              onChange={(value) => {
                updateForm(value, 'data');
              }}
            />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-xs">Hora</label>
            <TimePicker
              value={form.hourEnd}
              onChange={(value) => {
                updateForm(value, 'hourEnd');
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!loading && (
            <button
              onClick={onCancelar}
              className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
            >
              Cancelar
            </button>
          )}

          <button
            disabled={loading}
            onClick={handleSalvar}
            className="lg:self-end flex justify-center items-center gap-1 w-full h-10 rounded-md bg-[hsl(var(--secondary))] text-secondary-foreground font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? <Spinner color="white" width="20px" /> : <>Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
