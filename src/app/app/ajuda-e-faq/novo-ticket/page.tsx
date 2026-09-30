"use client";

import SelectComLabel from "@/components/commons/inputs/select-com-label";
import { TextareaComLabel } from "@/components/commons/inputs/textarea-com-label";
import { ModalNotificacoes } from "@/components/commons/modais/modal-notificacoes";
import { PageTitle } from "@/components/commons/page-title";
import GoBackPage from "@/components/sections/go-back-page";
import { Input } from "@/components/ui/input";
import { ApiApp } from "@/lib/api-app";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type TicketForm = {
    titulo: string;
    categoria: string;
    assunto: string;
    mensagem: string;
};

type PreviewFile = {
    file: File;
    url: string;
};

export default function Page() {
    const router = useRouter();
    const api = useMemo(() => new ApiApp(), []);

    const [form, setForm] = useState<TicketForm>({
        titulo: "",
        categoria: "",
        assunto: "",
        mensagem: "",
    });

    const [files, setFiles] = useState<PreviewFile[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const keyOf = useCallback((f: File) => `${f.name}-${f.size}-${f.lastModified}`, []);

    const addFiles = useCallback((list: FileList | null) => {
        if (!list || list.length === 0) return;

        setFiles((prev) => {
            const existingKeys = new Set(prev.map((p) => keyOf(p.file)));
            const next: PreviewFile[] = [...prev];

            for (let i = 0; i < list.length; i++) {
                const f = list.item(i)!;
                const k = keyOf(f);
                if (existingKeys.has(k)) continue;
                const url = URL.createObjectURL(f);
                next.push({ file: f, url });
                existingKeys.add(k);
            }
            return next;
        });
    }, [keyOf]);

    const removeFileAt = useCallback((idx: number) => {
        setFiles((prev) => {
            const copy = [...prev];
            const removed = copy.splice(idx, 1)[0];
            if (removed?.url) URL.revokeObjectURL(removed.url);
            return copy;
        });
    }, []);

    useEffect(() => {
        return () => {
            files.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(e.target.files);
        e.target.value = "";
    }, [addFiles]);

    const triggerFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const sendAttachments = useCallback(
        async (ticketId: string) => {
            if (files.length === 0) return;

            const tasks = files.map(async (p) => {
                const formData = new FormData();
                formData.append("file", p.file);
                const [res, err] = await api.suporte.enviarAnexoTicket(ticketId, formData);
                if (err) throw err;
                return res;
            });

            const results = await Promise.allSettled(tasks);
            const failed = results.filter((r) => r.status === "rejected");
            if (failed.length > 0) {
                console.error("Falhas ao enviar anexos:", failed);
                toast.error("Alguns anexos não foram enviados");
            }
        },
        [api.suporte, files]
    );

    const handleValueChange = useCallback((key: keyof TicketForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const fetchCategorias = useCallback(async () => {
        const [data, error] = await api.suporte.listarCategorias();
        if (error) {
            console.error(error);
            return;
        }
        setCategorias(data);
    }, [api.suporte]);

    const handleSubmit = useCallback(async () => {
        if (loading) return;

        if (!form.titulo || !form.categoria || !form.assunto || !form.mensagem) {
            toast.error("Preencha todos os campos");
            return;
        }

        setLoading(true);
        try {
            const [data, error] = await api.suporte.criar(form);
            if (error) {
                toast.error("Erro ao criar ticket");
                console.error(error);
                setLoading(false);
                return;
            }

            await sendAttachments(data.id);
            toast.success(`O ticket "${data.titulo}" foi criado com sucesso!`);

            if (data.id) {
                router.push(`/app/ajuda-e-faq/tickets/${data.id}`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao criar ticket");
            setLoading(false);
        }
    }, [api.suporte, form, loading, router, sendAttachments]);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    return (
        <div className="flex flex-col items-start h-full justify-start pb-20 md:pb-4">
            <div className="flex flex-col gap-3 w-full p-9 bg-white">
                <GoBackPage />
                <div className="flex justify-between items-center">
                    <PageTitle title="Novo Ticket" />
                    <div className="flex items-center gap-3">
                        <ModalNotificacoes />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[22rem,1fr] gap-4 p-12 md:px-28 w-full">
                <div className="bg-[url(/images/fundo-ticket-novo.png)] bg-slate-600 bg-cover bg-bottom px-6 py-12 rounded-3xl h-full flex flex-col justify-end">
                    <div className="pb-6">
                        <p className="text-[#7e8ac3] text-xs font-medium leading-3 tracking-wide uppercase">
                            Central de ajuda AutoPilot
                        </p>
                        <h2 className="text-white text-2xl font-bold">Não encontrou o que estava buscando?</h2>
                        <p className="text-[#e3ebf3] text-sm font-normal leading-tight">Preencha os dados ao lado!</p>
                    </div>
                </div>

                <div className="p-8 bg-white rounded-2xl shadow-[0px_4px_6px_-4px_rgba(149,163,178,0.10)] flex-col justify-start items-start gap-6 inline-flex">
                    <div>
                        <div className="text-[#24292e] text-2xl font-semibold leading-7 pb-2">
                            Adicione aqui sua <br /> dúvida ou sugestão
                        </div>
                        <div className="text-[#434d56] text-xs font-normal">
                            Estamos sempre <strong>a postos</strong> para lhe ajudar!
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <div className="w-full">
                            <label className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none">
                                Título
                            </label>
                            <Input
                                placeholder="Descreva em poucas palavras o acontecimento"
                                className="w-full"
                                value={form.titulo}
                                onChange={(e) => handleValueChange("titulo", e.target.value)}
                                required
                            />
                        </div>

                        <div className="w-full">
                            <label className="text-[#434d56] text-xs font-semibold leading-none -mb-1">Categoria</label>
                            <SelectComLabel
                                label=""
                                placeholder="Selecione"
                                options={categorias.map((c) => ({ label: c, value: c }))}
                                value={form.categoria}
                                onChange={(value) => handleValueChange("categoria", value)}
                            />
                        </div>

                        <div className="w-full">
                            <label className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none">
                                Assunto
                            </label>
                            <Input
                                placeholder="Descreva o assunto em poucas palavras"
                                className="w-full"
                                value={form.assunto}
                                onChange={(e) => handleValueChange("assunto", e.target.value)}
                                required
                            />
                        </div>

                        <div className="w-full flex flex-col">
                            <label className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none">
                                Mensagem
                            </label>
                            <TextareaComLabel
                                placeholder="Descreva em detalhes o que aconteceu"
                                className="w-full min-h-[9rem]"
                                value={form.mensagem}
                                label={""}
                                onChange={(value: string) => handleValueChange("mensagem", value)}
                            />

                            <div className="flex justify-end items-center gap-2 self-end mt-1 w-full overflow-hidden">
                                <div className="flex items-center gap-2 overflow-x-auto w-[100px] grow py-1 scroll-padrao">
                                    {files.map((obj, index) => (
                                        <div
                                            key={`${obj.file.name}-${obj.file.size}-${obj.file.lastModified}`}
                                            className="flex items-center text-[12px] px-3 py-1.5 rounded-md bg-gray-100 gap-3 hover:bg-gray-200 transition-colors"
                                            title={obj.file.name}
                                        >
                                            <img
                                                src={obj.url}
                                                alt={obj.file.name}
                                                className="w-6 h-6 rounded object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <span className="text-gray-700 whitespace-nowrap max-w-[12rem] truncate">
                                                {obj.file.name}
                                            </span>
                                            <button
                                                onClick={() => removeFileAt(index)}
                                                className="text-gray-500 text-[15px] hover:text-red-600 font-medium transition-colors"
                                                aria-label={`Remover arquivo ${obj.file.name}`}
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={triggerFileDialog}
                                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200"
                                    type="button"
                                    aria-label="Adicionar anexos"
                                >
                                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M2.08203 10.4997C2.08203 6.76772 2.08203 4.90175 3.2414 3.74237C4.40077 2.58301 6.26675 2.58301 9.9987 2.58301C13.7306 2.58301 15.5966 2.58301 16.756 3.74237C17.9154 4.90175 17.9154 6.76772 17.9154 10.4997C17.9154 14.2316 17.9154 16.0976 16.756 17.257C15.5966 18.4163 13.7306 18.4163 9.9987 18.4163C6.26675 18.4163 4.40077 18.4163 3.2414 17.257C2.08203 16.0976 2.08203 14.2316 2.08203 10.4997Z"
                                            stroke="#24292E"
                                            strokeWidth="1.3"
                                        />
                                        <path
                                            d="M13.75 8C14.4404 8 15 7.44036 15 6.75C15 6.05964 14.4404 5.5 13.75 5.5C13.0596 5.5 12.5 6.05964 12.5 6.75C12.5 7.44036 13.0596 8 13.75 8Z"
                                            stroke="#24292E"
                                            strokeWidth="1.3"
                                        />
                                        <path
                                            d="M13.3333 18.8336C12.8171 16.9794 11.6121 15.3187 9.89708 14.1121C8.04801 12.8111 5.72636 12.1225 3.34641 12.1692C3.06382 12.1686 2.78147 12.1776 2.5 12.1962"
                                            stroke="#24292E"
                                            strokeWidth="1.25"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M10.832 15.4996C12.2499 14.3941 13.7774 13.827 15.3205 13.8331C16.1955 13.8321 17.0664 14.0176 17.9154 14.3844"
                                            stroke="#24292E"
                                            strokeWidth="1.25"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden pointer-events-none fixed z-0"
                                    multiple
                                    onChange={handleFileInput}
                                />
                            </div>
                        </div>

                        <div className="w-full flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="bg-[#1b2841] rounded-lg text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                type="button"
                            >
                                Criar ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
