'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { TextareaComLabel } from '@/components/commons/inputs/textarea-com-label';
import SelectComLabel from '@/components/commons/inputs/select-com-label';
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from '@/components/commons/inputs/combobox-select-person';
import { profileImageUrl } from '@/lib/profile.utils';
import { DatePicker } from '@/components/commons/inputs/date-picker';
import { TimePicker } from '@/components/commons/inputs/time-picker';
import Spinner from '@/components/loading/Spinner';
import IconTarefa from '../deals/icons/icon-tarefa';

import api from '@/utils/classes/api';
import { Employee } from '@/lib/api-response-types';

export interface CriarTarefaProps {
  dealId: string;
  onCancelar: () => void;
  onSave: () => void;
}

type SelectOption = { label: string; value: string };

type FormState = {
  name: string;
  notes?: string;
  assigneeId: string | null;
  dealId: string;
  hourEnd: string;
  data: string;
};

const taskSchema = z.object({
  name: z.string().min(1, { message: 'Insira o nome da tarefa' }),
  notes: z.string().optional(),
  assigneeId: z.string().min(1, { message: 'É necessário um responsavel para a tarefa' }),
  hourEnd: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, { message: 'Informe a hora de fim' }),
  data: z.string().min(1, { message: 'Informe a data' }), // dd/MM/yyyy
});

function toIsoDateFromPtBR(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  const formatted = `${year}-${month}-${day}T00:00:00`;
  return new Date(formatted).toISOString();
}

export default function CriarTarefaChat({ dealId, onCancelar, onSave }: CriarTarefaProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    notes: '',
    assigneeId: null,
    dealId,
    hourEnd: '',
    data: '',
  });

  const [loading, setLoading] = useState(false);
  const [responsibles, setResponsibles] = useState<SelectOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loadingResponsibles, setLoadingResponsibles] = useState(true);
  const [selectedResponsible, setSelectedResponsible] = useState<SelectPersonItemInterface[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const options = useMemo(() => responsibles, [responsibles]);

  const loadResponsibles = useCallback(async () => {
    setLoadingResponsibles(true);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const query = api.query.searchInMemoryQuerys({ search: search });
      const [response, error] = await api.get(`/employees/search-employees${query}`, {
        signal: abortRef.current.signal,
      });

      if (error) {
        toast.error(error.message);
        setResponsibles([]);
        return;
      }

      const list: SelectOption[] = (response.data.employees as Employee[]).map((c) => ({
        label: c.name,
        value: c.id,
      }));

      setResponsibles(list);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Falha ao carregar responsáveis');
      }
    } finally {
      setLoadingResponsibles(false);
    }
  }, [search]);

  useEffect(() => {
    loadResponsibles();
    return () => abortRef.current?.abort();
  }, [loadResponsibles]);

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTimeChange = useCallback(
    (value: string) => {
      updateForm('hourEnd', value);
    },
    [updateForm],
  );

  const handleSave = useCallback(async () => {
    setLoading(true);

    const parsed = taskSchema.safeParse({
      name: form.name,
      notes: form.notes ?? '',
      assigneeId: form.assigneeId ?? '',
      hourEnd: form.hourEnd,
      data: form.data,
    });

    if (!parsed.success) {
      setLoading(false);
      toast.error(parsed.error.issues[0].message);
      return;
    }

    try {
      const isoDate = toIsoDateFromPtBR(form.data);
      const payload = {
        name: form.name,
        notes: form.notes,
        assigneeId: form.assigneeId,
        hourEnd: form.hourEnd,
        data: isoDate,
      };

      const [response, error] = await api.post(`/deals/${dealId}/tasks`, payload);

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      onSave();
    } catch {
      toast.error('Não foi possível salvar a tarefa.');
    } finally {
      setLoading(false);
    }
  }, [form, dealId, onSave]);

  return (
    <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
      <div className="bg-[hsl(var(--secondary))] text-secondary-foreground font-semibold flex gap-2 py-3 px-4">
        <IconTarefa />
        <h3>Criar uma tarefa</h3>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <TextareaComLabel
          value={form.name}
          label="Qual a tarefa?"
          onChange={(value) => updateForm('name', value)}
          placeholder="Descreva a tarefa"
        />

        <div className="bg-[#f7f9fc] rounded-md p-4 border border-[#e5eaf2]">
          <label className="text-xs font-semibold text-[#485B80] block mb-2">Responsável</label>
          <ComboboxSelectPerson
            value={selectedResponsible}
            onValueChange={(items) => {
              setSelectedResponsible(items);
              updateForm('assigneeId', items[0]?.id ?? null);
            }}
            onSearch={async (q) => {
              setSearch(q);
              try {
                const query = api.query.searchInMemoryQuerys({ search: q });
                const [response, error] = await api.get(`/employees/search-employees${query}`);
                if (error) return [];
                return (response.data.employees as Employee[]).map((c) => ({
                  id: c.id,
                  name: c.name,
                  avatar: profileImageUrl(c.userId),
                  metaData: [String(c.whatsapp || '')],
                }));
              } catch {
                return [];
              }
            }}
            placeholder="Procure pelo responsável"
            unique
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          <div className="col-span-1">
            <label className="font-semibold text-xs">Data</label>
            <DatePicker onChange={(value) => updateForm('data', value)} />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-xs">Hora</label>
            <TimePicker value={form.hourEnd} onChange={handleTimeChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && (
            <button
              type="button"
              onClick={onCancelar}
              className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="md:self-end flex justify-center items-center gap-1 w-full h-10 rounded-md bg-[hsl(var(--secondary))] text-secondary-foreground font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
          >
            {loading ? <Spinner color="white" width="20px" /> : <>Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}
