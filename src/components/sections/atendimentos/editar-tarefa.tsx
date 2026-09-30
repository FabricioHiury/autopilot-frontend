'use client'
import { TextareaComLabel } from "@/components/commons/inputs/textarea-com-label";
import IconTarefa from "./icons/icon-tarefa";
import { DatePicker } from "@/components/commons/inputs/date-picker";
import { TimePicker } from "@/components/commons/inputs/time-picker";
import { ApiApp } from "@/lib/api-app";
import { z } from "zod";
import { useEffect, useState } from "react";
import api from "@/utils/classes/api";
import toast from "react-hot-toast";
import Spinner from "@/components/loading/Spinner";
import { ColaboradorType } from "@/lib/api-response-types";
import { ComboboxSelectPerson } from "@/components/commons/inputs/combobox-select-person";
import { profileImageUrl } from "@/lib/profile.utils";

export interface EditarTarefaProps {
    idAtendimento: string;
    idTarefa: string;
    onCancelar: () => void;
    onSalvar: () => void;
    tarefa: {
        nome: string,
        observacoes?: string,
        idResponsavel: string,
        horaFim: string,
        data: string
    }
}

const taskSchema = z.object({
    nome: z.string().min(1, { message: "Insira o nome da tarefa" }),
    observacoes: z.string().optional(),
    idResponsavel: z.string().min(1, { message: "É necessário um responsavel para a tarefa" }),
    horaFim: z.string().regex(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, { message: "Informe a hora de fim" }),
    data: z.string().min(1, { message: "Informe a data" }),
    idAtendimento: z.string(),
    idTarefa: z.string()
}).transform(async (obj, ctx) => {

    const api = new ApiApp();
    let { idAtendimento, data, ...form } = obj

    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    const [response, error] = await api.atendimento.tarefasEditar(
        obj.idAtendimento,
        obj.idTarefa,
        {
            nome: form.nome,
            observacoes: form.observacoes,
            idResponsavel: form.idResponsavel,
            horaFim: form.horaFim,
            data: formattedDate
        }
    )

    if (error) {
        ctx.addIssue({
            code: "custom",
            message: error.message
        })
        return z.NEVER;
    }
});
export default function EditarTarefa({ idAtendimento, idTarefa, onCancelar, onSalvar, tarefa }: EditarTarefaProps) {

    const defaultTask = {
        nome: tarefa.nome,
        observacoes: tarefa.observacoes,
        idResponsavel: tarefa.idResponsavel,
        idAtendimento: idAtendimento,
        idTarefa: idTarefa,
        horaFim: tarefa.horaFim,
        data: tarefa.data,
    };

    const [form, setForm] = useState(defaultTask)
    const [loading, setLoading] = useState<boolean>(false)
    const [responsavelSelecionado, setResponsavelSelecionado] = useState<{
        id: string;
        name: string;
        avatar: string;
        metaData: string[];
    }>();

    async function loadResponsaveis(search: string) {
        const [response, error] = await api.get("/colaborador/busca-colaboradores" + api.query.searchInMemoryQuerys({
            pesquisa: search
        }));
        if (error) {
            toast.error(error.message)
            return []
        }
        return response.data.colaboradores.map((obj: ColaboradorType) => {
            return {
                id: obj.id,
                name: obj.nome,
                avatar: profileImageUrl(obj.idUsuario),
                metaData: [obj.whatsapp]
            }
        });
    }

    async function pegarResponsavel(idResponsavel: string) {
        const [response, error] = await api.get(`/colaborador/busca-colaborador/${idResponsavel}`);
        if (error) {
            toast.error(error.message)
            return []
        }
        const responsavel = {
            id: response.data.id,
            name: response.data.nome,
            avatar: '',
            metaData: []
        }

        setResponsavelSelecionado(responsavel);
    }

    function updateForm(value: any, tipo: string) {
        setForm(prev => ({
            ...prev,
            [tipo]: value
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
        pegarResponsavel(form.idResponsavel)
    }, [form])


    return (
        <div className="bg-white rounded-[0.5rem] overflow-hidden animate-fade-in-top">
            <div className="bg-[#293856] text-white font-semibold flex gap-2 py-3 px-4">
                <IconTarefa />
                <h3>Editar tarefa</h3>
            </div>

            <div className="p-6 flex flex-col gap-4">
                <TextareaComLabel
                    value={form.nome}
                    label="Qual a tarefa?"
                    onChange={(value) => updateForm(value, "nome")}
                    placeholder="Descreva a tarefa"
                />

                <div>
                    <label className="text-xs text-[#485B80] font-semibold">Selecione o responsável</label>
                    {responsavelSelecionado && <ComboboxSelectPerson
                        value={[responsavelSelecionado]}
                        onValueChange={(value) => updateForm(value[0].id, "idResponsavel")}
                        placeholder="Procure pelo responsável"
                        onSearch={(search: string) => {
                            return loadResponsaveis(search)
                        }}
                        unique={true}
                    />}
                </div>


                <TextareaComLabel
                    value={form.observacoes}
                    label="Adicionar uma observação"
                    onChange={(value) => updateForm(value, "observacoes")}
                    placeholder="Insira uma observação"
                />

                <div className="grid grid-rows-2 grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="font-semibold text-xs">Data</label>
                        <DatePicker value={form.data} onChange={(value) => { updateForm(value, "data") }} />
                    </div>
                    <div className="col-span-1">
                        <label className="font-semibold text-xs">Hora</label>
                        <TimePicker
                            value={form.horaFim}
                            onChange={(value) => { updateForm(value, "horaFim") }}
                        />
                    </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                    {
                        !loading &&
                        <button onClick={onCancelar} className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border border-[#293856] text-[#293856] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80">
                            Cancelar
                        </button>
                    }

                    <button disabled={loading} onClick={handleSalvar} className="lg:self-end flex justify-center items-center gap-1 w-full h-10 rounded-md bg-[#293856] text-white font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80">
                        {loading
                            ?
                            <Spinner color="white" width="20px" />
                            :
                            <>
                                Salvar
                            </>
                        }
                    </button>
                </div>
            </div>

        </div>
    )
}