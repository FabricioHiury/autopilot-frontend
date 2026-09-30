'use client'
import SelectComLabel from "@/components/commons/inputs/select-com-label";
import { DatePicker } from "@/components/commons/inputs/date-picker";
import { z } from "zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "@/components/loading/Spinner";
import { TimePicker } from "../inputs/time-picker";
import { ApiApp } from "@/lib/api-app";

export interface CriarVisitaProps {
    idAtendimento: string;
    onCancelar: () => void;
    onSalvar: () => void;
}

const taskSchema = z.object({
    tipo: z.string().min(1, { message: "Insira o tipo da visita" }),
    horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, { message: "Informe a hora de inicio" }),
    data: z.string().min(1, { message: "Informe a data" }),
    idAtendimento: z.string()
}).transform(async (obj, ctx) => {
    let { idAtendimento, data, ...form } = obj

    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const api = new ApiApp();

    const [response, error] = await api.atendimento.criarVisita({
        idAtendimento,
        horaInicio: form.horaInicio,
        tipo: form.tipo,
        data: formattedDate
    })

    if (error) {
        ctx.addIssue({
            code: "custom",
            message: error.message
        })
        return z.NEVER;
    }
});
export default function CriarVisitaMini({ idAtendimento, onCancelar, onSalvar }: CriarVisitaProps) {
    const defaultVisita = {
        tipo: "",
        idAtendimento: idAtendimento,
        horaInicio: "",
        horaFim: "",
        data: "",
    };

    const [form, setForm] = useState(defaultVisita)
    const [loading, setLoading] = useState<boolean>(false)


    function updateForm(value: any, tipo: string) {
        setForm(prev => ({
            ...prev,
            [tipo]: value
        }));
    }

    function updateTime(value: string) {
        setForm(prev => ({
            ...prev,
            horaInicio: value,
        }));
    }

    const handleSalvar = async () => {
        setLoading(true)
        const x = await taskSchema.safeParseAsync(form)
        setLoading(false)
        if (!x.success) {
            return toast.error(x.error.issues[0].message)
        }
        onSalvar();
    }
    useEffect(() => {
        console.log(form)
    }, [form])


    return (
        <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
            <div className="p-6 flex flex-col gap-4">
                <SelectComLabel
                    value={form.tipo}
                    label="Tipo de visita"
                    loading={false}
                    placeholder="Selecione um tipo"
                    onChange={(value) => updateForm(value, "tipo")}
                    options={[
                        { label: "Recebimento", value: "Recebimento" },
                        { label: "Test Drive", value: "Test Drive" },
                        { label: "Assinatura", value: "Assinatura" },
                    ]}
                />

                <div className="grid grid-cols-2 gap-4 pb-4">
                    <div className="col-span-1">
                        <label className="font-semibold  text-xs">Data</label>
                        <DatePicker onChange={(value) => { updateForm(value, "data") }} />
                    </div>
                    <div className="col-span-1">
                        <label className="font-semibold text-xs">Hora</label>
                        <TimePicker
                            value={form.horaInicio}
                            onChange={updateTime}
                        />
                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                    {!loading &&
                        <button onClick={onCancelar} className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border border-[#293856] text-[#293856] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80">
                            Cancelar
                        </button>
                    }

                    <button disabled={loading} onClick={handleSalvar} className="lg:self-end flex justify-center items-center gap-1 w-full h-10 rounded-md bg-[#293856] text-white font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80">
                        {loading
                            ? <Spinner color="white" width="20px" />
                            : "Salvar"
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}