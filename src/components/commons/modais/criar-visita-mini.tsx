'use client';
import SelectComLabel from '@/components/commons/inputs/select-com-label';
import { DatePicker } from '@/components/commons/inputs/date-picker';
import { z } from '@/lib/zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '@/components/loading/Spinner';
import { TimePicker } from '../inputs/time-picker';
import { AppServices } from '@/services/app.services';

export interface CriarVisitaProps {
  dealId: string;
  onCancelar: () => void;
  onSalvar: () => void;
}

const taskSchema = z
  .object({
    type: z.string().min(1, { message: 'Insira o tipo da visita' }),
    hourStart: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, { message: 'Informe a hora de inicio' }),
    data: z.string().min(1, { message: 'Informe a data' }),
    dealId: z.string(),
  })
  .transform(async (obj, ctx) => {
    let { dealId, data, ...form } = obj;

    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const api = new AppServices();

    const [response, error] = await api.deal.createVisit({
      dealId,
      hourStart: form.hourStart,
      type: form.type,
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
export default function CriarVisitaMini({ dealId, onCancelar, onSalvar }: CriarVisitaProps) {
  const defaultVisita = {
    type: '',
    dealId: dealId,
    hourStart: '',
    hourEnd: '',
    data: '',
  };

  const [form, setForm] = useState(defaultVisita);
  const [loading, setLoading] = useState<boolean>(false);

  function updateForm(value: any, type: string) {
    setForm((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function updateTime(value: string) {
    setForm((prev) => ({
      ...prev,
      hourStart: value,
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
  }, [form]);

  return (
    <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
      <div className="p-6 flex flex-col gap-4">
        <SelectComLabel
          value={form.type}
          label="Tipo de visita"
          loading={false}
          placeholder="Selecione um tipo"
          onChange={(value) => updateForm(value, 'type')}
          options={[
            { label: 'Recebimento', value: 'Recebimento' },
            { label: 'Teste de direção', value: 'Test Drive' },
            { label: 'Assinatura', value: 'Assinatura' },
          ]}
        />

        <div className="grid grid-cols-2 gap-4 pb-4">
          <div className="col-span-1">
            <label className="font-semibold  text-xs">Data</label>
            <DatePicker
              onChange={(value) => {
                updateForm(value, 'data');
              }}
            />
          </div>
          <div className="col-span-1">
            <label className="font-semibold text-xs">Hora</label>
            <TimePicker value={form.hourStart} onChange={updateTime} />
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
            {loading ? <Spinner color="white" width="20px" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
