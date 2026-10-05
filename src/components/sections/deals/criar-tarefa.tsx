'use client';
import { TextareaComLabel } from '@/components/commons/inputs/textarea-com-label';
import IconTarefa from './icons/icon-tarefa';
import { DatePicker } from '@/components/commons/inputs/date-picker';
import { TimePicker } from '@/components/commons/inputs/time-picker';
import { z } from 'zod';
import { useState } from 'react';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/loading/Spinner';
import { Employee } from '@/lib/api-response-types';
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from '@/components/commons/inputs/combobox-select-person';
import { profileImageUrl } from '@/lib/profile.utils';

export interface CriarTarefaProps {
  dealId: string;
  onCancelar: () => void;
  onSalvar: () => void;
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
  })
  .transform(async (obj, ctx) => {
    let { dealId, data, ...form } = obj;

    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const [response, error] = await api.post(`/deals/${dealId}/tasks`, {
      ...form,
      data: new Date(formattedDate).toISOString(),
    });
    if (error) {
      ctx.addIssue({
        code: 'custom',
        message: error.message,
      });
      return z.NEVER;
    }
  });
export default function CriarTarefa({ dealId, onCancelar, onSalvar }: CriarTarefaProps) {
  const defaultTask = {
    name: '',
    notes: '',
    assigneeId: '',
    dealId: dealId,
    // horaInicio: "",
    hourEnd: '',
    data: '',
  };

  const [form, setForm] = useState(defaultTask);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<SelectPersonItemInterface[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [assignees, setResponsaveis] = useState<{ label: string; value: string }[]>([]);
  const [search, setPesquisa] = useState<string>('');
  const [loadingResponsaveis, setLoadingResponsaveis] = useState<boolean>(true);

  // async function loadResponsaveis(){
  //     setLoadingResponsaveis(true)
  //     const [response,error] = await api.get("/employees/search-employees"+api.query.searchInMemoryQuerys({
  //         pesquisa
  //     }));

  //     if(error){
  //         toast.error(error.message)
  //         return []
  //     }
  //     console.log(response.data)
  //     setResponsaveis(response.data.colaboradores.map((obj:ColaboradorType)=>{
  //         return {
  //             label:obj.nome,
  //             value:obj.id
  //         }
  //     }))

  //         setLoadingResponsaveis(false)
  // }

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

  // useEffect(()=>{
  //     loadResponsaveis()
  // },[pesquisa])

  return (
    <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
      <div className="bg-[hsl(var(--secondary))] text-secondary-foreground font-semibold flex gap-2 py-3 px-4">
        <IconTarefa />
        <h3>Criar uma tarefa</h3>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <TextareaComLabel
          value={form.name}
          label="Qual a tarefa?"
          onChange={(value) => updateForm(value, 'name')}
          placeholder="Descreva a tarefa"
        />

        {/* <SelectComLabel 
                    value={form.idResponsavel.toString()}
                    label="Responsável"
                    loading={loadingResponsaveis}
                    placeholder="Selecione um responsável"
                    onChange={(value) => updateForm(parseInt(value),"idResponsavel")}
                    options={responsaveis}
                /> */}

        <div>
          <label className="text-xs text-[#485B80] font-semibold">Selecione o responsável</label>
          <ComboboxSelectPerson
            value={responsavelSelecionado}
            onValueChange={(value) => {
              setResponsavelSelecionado(value);
              updateForm(value[0]?.id || 0, 'assigneeId');
            }}
            placeholder="Procure pelo responsável"
            onSearch={(search: string) => {
              return loadResponsaveis(search);
            }}
            unique={true}
          />
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
