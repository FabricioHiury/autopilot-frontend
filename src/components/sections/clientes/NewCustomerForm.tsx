import ButtonDefault from "@/components/inputs/buttons/ButtonDefault";
import ButtonIcon from "@/components/inputs/buttons/ButtonIcon";
import Ratio from "@/components/inputs/ratio/Ratio";
import Select from "@/components/inputs/select/Select";
import Input from "@/components/inputs/text/Input";
import ImageInput from "@/components/inputs/media/ImageInput";
import { useObserver } from "@/contexts/observer.context";
import api from "@/utils/classes/api";
import handleDate from "@/utils/classes/format/time";
import sanitizar from "@/utils/classes/sanitizer/sanitizer";
import { states } from "@/utils/mock/states";
import { Cliente } from "@/utils/types/cliente.type";
import { optionType } from "@/utils/types/dataTypes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ZodError, z } from "zod";
import axios from "axios";
import { TextareaComLabel } from "@/components/commons/inputs/textarea-com-label";
import { customerSchema } from "@/lib/client.schema";

interface NewCustomerFormProps {
    onNewCustomer?: (payload?: unknown) => void;
    onExitPop: () => void;
    data?: Cliente;
    editing?: boolean;
}

const personTypeOptions: optionType[] = [
    { name: "CPF", value: "fisica" },
    { name: "CNPJ", value: "juridica" },
];

const foreignerOptions: optionType[] = [
    { name: "Não", value: "nao" },
    { name: "Sim", value: "sim" },
];

const genderOptions: optionType[] = [
    { name: "Masculino", value: "masculino" },
    { name: "Feminino", value: "feminino" },
];


const initialForm = {
    nome: "",
    dataNascimento: "",
    rg: "",
    documentoFiscal: "",
    telefone: "",
    whatsapp: "",
    email: "",
    cep: "",
    uf: "AC",
    observacoes: "",
    municipio: "",
    endereco: "",
    bairro: "",
    numero: "",
    complemento: "",
    tipoPessoa: "fisica",
    estrangeiro: "nao",
    genero: "masculino",
};

const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
    onExitPop,
    onNewCustomer,
    data,
    editing,
}) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState<File>();
    const { setObserver } = useObserver();

    function updateField(value: string, key: keyof typeof initialForm) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function loadAddressByCep(cep: string) {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const data = response.data;
            if (data.erro) return;

            setForm((prev) => ({
                ...prev,
                bairro: data.bairro,
                municipio: data.localidade,
                uf: data.uf,
                endereco: data.logradouro,
            }));
        } catch {
            // Silencia erros de CEP
        }
    }

    useEffect(() => {
        if (editing) loadExistingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        if (!editing) setForm(initialForm);
    }, [editing]);

    function loadExistingData() {
        if (!data) return;

        const next = {
            nome: data.nome || "",
            dataNascimento: handleDate.formatISODate(data.dataNascimento) || "",
            rg: sanitizar.rg(data.rg) || "",
            documentoFiscal: sanitizar.cpfcnpj(data.documentoFiscal) || "",
            telefone: sanitizar.telefone(data.telefone, false) || "",
            whatsapp: sanitizar.telefone(data.whatsapp, false) || "",
            email: data.email || "",
            cep: sanitizar.cep(data.enderecoCliente.cep) || "",
            uf: data.enderecoCliente.uf?.toUpperCase() || "",
            municipio: data.enderecoCliente.municipio || "",
            endereco: data.enderecoCliente.endereco || "",
            bairro: data.enderecoCliente.bairro || "",
            numero: data.enderecoCliente.numero || "",
            complemento: data.enderecoCliente.complemento || "",
            tipoPessoa: data.tipoPessoa || "fisica",
            estrangeiro: data.estrangeiro ? "sim" : "nao",
            observacoes: data.observacoes ?? "",
            genero: data.genero[0].toUpperCase() === "M" ? "masculino" : "feminino",
        };

        setForm(next as typeof initialForm);
    }

    async function createCustomer() {
        const parsed = customerSchema.safeParse(form);
        if (!parsed.success) {
            const error = parsed.error as ZodError;
            return toast.error(error.errors[0].message);
        }

        setLoading(true);
        try {
            if (parsed.data.email?.length === 0) {
                delete parsed.data.email;
            }

            const [response, error] = await api.post("/cliente/criar", parsed.data);
            if (error) {
                toast.error(error.message);
                return;
            }

            const newId = response?.data?.data?.id;
            if (file && newId) {
                await uploadAttachment(newId, file);
            }

            setObserver({ tipo: "atualizarDadosClientes", data: {} });
            setForm(initialForm);
            onNewCustomer?.(response?.data);
            onExitPop();
            toast.success("Cliente cadastrado com sucesso");
        } finally {
            setLoading(false);
        }
    }

    async function updateCustomer() {
        const parsed = customerSchema.safeParse(form);
        if (!parsed.success) {
            const error = parsed.error as ZodError;
            return toast.error(error.errors[0].message);
        }

        setLoading(true);
        try {
            const [response, error] = await api.put(`/cliente/editar/${data?.id}`, parsed.data);
            if (error) {
                toast.error(error.message);
                return;
            }
            setObserver({ tipo: "atualizarDadosClientes", data: {} });
            setForm(initialForm);
            onNewCustomer?.(response?.data);
            onExitPop();
            toast.success("Cliente editado com sucesso");
        } finally {
            setLoading(false);
        }
    }

    async function uploadAttachment(id: string, f: File) {
        const fd = new FormData();
        fd.append("file", f);
        const [response, error] = await api.formData(`/cliente/anexo/${id}`, fd, "POST");
        return { response, error };
    }

    async function handleUploadImage(f: File) {
        setFile(f);
        if (editing === false) return;
        if (data?.id) await uploadAttachment(data.id, f);
    }

    return (
        <div className="flex flex-col gap-3 mt-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                <p className="text-[#7F8999] text-[12px] w-full lg:w-[400px]">
                    Preencha os dados e envie uma foto com o documento do cliente
                </p>
                <div className="flex gap-2 items-center w-full lg:w-[300px]">
                    <ButtonDefault label="Enviar foto">
                        <ImageInput
                            accept=".pdf,.doc,.docx, .png, .jpg, .jpeg"
                            onImageUpload={handleUploadImage}
                        />
                    </ButtonDefault>
                </div>
            </div>

            <div className="flex flex-col w-full gap-4 pb-4">
                <Ratio
                    onChange={(option) => updateField(option.value, "tipoPessoa")}
                    label="O cadastro é no CPF ou no CNPJ"
                    options={personTypeOptions}
                    value={form.tipoPessoa}
                />
                <Ratio
                    onChange={(option) => updateField(option.value, "estrangeiro")}
                    label="O cliente é estrangeiro"
                    options={foreignerOptions}
                    value={form.estrangeiro}
                />
                <Ratio
                    onChange={(option) => updateField(option.value, "genero")}
                    label="Selecione o gênero do cliente"
                    options={genderOptions}
                    value={form.genero}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4 mt-2">
                <Input
                    flexLevel="flex-[2]"
                    label="Nome Completo"
                    placeholder="Seu nome"
                    onChange={(e) => updateField(e.target.value, "nome")}
                    value={form.nome ?? ""}
                />
                <Input
                    flexLevel="flex-[1]"
                    label={form.tipoPessoa === "fisica" ? "Data de Nascimento" : "Data de Fundação"}
                    placeholder="00/00/0000"
                    onChange={(e) => updateField(e.target.value, "dataNascimento")}
                    value={form.dataNascimento ?? ""}
                    onSanitizar={(v) => sanitizar.data(v)}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
                <Input
                    flexLevel="flex-[1]"
                    label="RG"
                    placeholder="Insira o número do RG"
                    value={form.rg}
                    onChange={(e) => updateField(e.target.value, "rg")}
                />
                <Input
                    flexLevel="flex-[1]"
                    label={form?.tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
                    placeholder={form?.tipoPessoa === "fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                    onChange={(e) => updateField(e.target.value, "documentoFiscal")}
                    value={form.documentoFiscal ?? ""}
                    onSanitizar={(v) => (form?.tipoPessoa === "fisica" ? sanitizar.cpf(v) : sanitizar.cnpj(v))}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
                <Input
                    flexLevel="flex-[1]"
                    label="Telefone"
                    placeholder="(88) 9999-9999"
                    value={form.telefone ?? ""}
                    onChange={(e) => updateField(e.target.value, "telefone")}
                    onSanitizar={(v) => sanitizar.telefone(v, false, 11)}
                />
                <Input
                    flexLevel="flex-[1]"
                    label="Whatsapp"
                    placeholder="(88) 9999-9999"
                    value={form.whatsapp ?? ""}
                    onChange={(e) => updateField(e.target.value, "whatsapp")}
                    onSanitizar={(v) => sanitizar.telefone(v, false, 11)}
                />
                <Input
                    flexLevel="flex-[1]"
                    label="Email"
                    placeholder="Insira seu email"
                    value={form.email ?? ""}
                    onChange={(e) => updateField(e.target.value, "email")}
                />
            </div>

            <TextareaComLabel
                label="Observações"
                placeholder="Insira os detalhes...."
                value={form.observacoes ?? ""}
                onChange={(v) => updateField(v, "observacoes")}
            />

            <div className="flex flex-col">
                <h1 className="text-[#0F1522] text-xl font-semibold mt-4">Dados de Endereço</h1>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
                <Input
                    flexLevel="flex-[1]"
                    label="CEP"
                    placeholder="00000-000"
                    value={form.cep ?? ""}
                    onChange={(e) => {
                        const value = sanitizar.cep(e.target.value);
                        updateField(value, "cep");
                        if (value.length === 9) {
                            loadAddressByCep(value);
                        }
                    }}
                    onSanitizar={(v) => sanitizar.cep(v)}
                />
                <Select
                    flexLevel="flex-[1]"
                    label="Estado"
                    options={states}
                    onChange={(opt) => updateField(opt.value, "uf")}
                    value={form.uf}
                />
                <Input
                    flexLevel="flex-[1]"
                    label="Municipio"
                    placeholder="Insira o municipio"
                    value={form.municipio}
                    onChange={(e) => updateField(e.target.value, "municipio")}
                />
            </div>

            <div className="flex">
                <Input
                    label="Endereço"
                    placeholder="Insira o endereço"
                    onChange={(e) => updateField(e.target.value, "endereco")}
                    value={form.endereco}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
                <Input
                    flexLevel="flex-[1]"
                    label="Numero"
                    placeholder="231"
                    onChange={(e) => updateField(e.target.value, "numero")}
                    value={form.numero ?? ""}
                />
                <Input
                    flexLevel="flex-[1]"
                    label="Complemento"
                    placeholder="Insira o complemento"
                    onChange={(e) => updateField(e.target.value, "complemento")}
                    value={form.complemento ?? ""}
                />
                <Input
                    flexLevel="flex-[1]"
                    label="Bairro"
                    placeholder="Insira seu bairro"
                    onChange={(e) => updateField(e.target.value, "bairro")}
                    value={form.bairro ?? ""}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4 mt-6">
                <ButtonIcon
                    border="1px solid #293856"
                    background="none"
                    color="#293856"
                    label="Cancelar"
                    onClick={() => onExitPop()}
                />
                <ButtonIcon
                    loading={loading}
                    label={data ? "Editar Cliente" : "Cadastrar Cliente"}
                    icon="/icons/check2.svg"
                    onClick={() => {
                        if (!editing) {
                            createCustomer();
                        } else {
                            updateCustomer();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default NewCustomerForm;
