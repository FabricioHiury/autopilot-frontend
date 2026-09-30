"use client"
import { BtnStrong, BtnTransparent } from "@/components/commons/buttons/buttons";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import SelectSweet from "@/components/commons/inputs/select-lego";
import { IconCheckRed } from "@/components/icons/icon-check";
import Input from "@/components/inputs/text/Input";
import { PropsButtonOption } from "@/components/legoComponents/button-select";
import IconArrow from "@/components/nav/icons/arrow-icon";
import { BellFillAnimation } from "@/components/nav/icons/bell-icon";
import { ConfigIconAnimation } from "@/components/nav/icons/config-icon";
import { ExitBoldIcon } from "@/components/nav/icons/exit-icon";
import IconAdd from "@/components/nav/icons/plus-icon";
import { ModalFaq } from "@/components/sections/ModalFaq";
import { SubTitle, Title } from "@/components/sections/Text";
import GoBackPage from "@/components/sections/go-back-page";
import Tiptap from "@/components/tiptap/TipTapEditor";
import { cn } from "@/lib/class-name.utils";
import { apiAdmin } from "@/utils/classes/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const categorias = [
    { label: "Anúncios", value: "anuncios" },
    { label: "Contas", value: "contas" },
    { label: "Estoque", value: "estoque" },
];

const schema = z.object({
    titulo: z.string(),
    categoria: z.string().min(1, "A categoria não pode estar vazia"),
    status: z.string().min(1, "Insira o status"),
    tags: z.array(z.string()).min(1, "Escolha pelo menos uma tag"),
    conteudo: z.string(),
    id: z.string().optional()
}).transform(async (obj, ctx) => {
    const post = async () => {
        delete obj.id
        const [r, e] = await apiAdmin.post("/faq", obj);
        if (e) {
            ctx.addIssue({
                code: "custom",
                message: e.message
            })
            return z.NEVER
        }
        console.log(r, "post")
        return r.data.id
    }

    const put = async () => {
        const { id, ...form } = obj
        const [r, e] = await apiAdmin.put("/faq/" + id, form);
        if (e) {
            ctx.addIssue({
                code: "custom",
                message: e.message
            })
            return z.NEVER
        }
        console.log(r, "put")
        return id
    }

    if (obj.id === "") {
        return await post()
    }
    else {
        return await put()
    }
});


export default function PagePublicar() {

    const [form, setForm] = useState({
        titulo: '',
        tags: [],
        status: "",
        categoria: "",
        conteudo: "",
        id: -1
    })

    const [loadingEdit, setLoadingEdit] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadingR, setLoadingR] = useState<boolean>(false)

    const [currentFaq, setCurrentFaq] = useState()

    const [pops, setPops] = useState({
        rascunho: false,
        publicacao: false,
        exclusao: false
    })

    function upPops(value: boolean, obj: string) {
        setPops((old) => ({
            ...old,
            [obj]: value,
        }));
    }
    function upForm(value: any, obj: string) {
        setForm((old) => ({
            ...old,
            [obj]: value,
        }));
    }

    async function rascunho() {
        setLoadingR(true)
        const parse = await schema.safeParseAsync({
            ...form,
            status: "rascunho"
        })
        setLoadingR(false)
        if (!parse.success) {
            return toast.error(parse.error.issues[0].message)
        }
        setCurrentFaq(parse.data)
        if (form.id === -1)
            setForm(old => {
                return {
                    id: -1,
                    titulo: '',
                    tags: [],
                    status: "",
                    categoria: "asdas",
                    conteudo: "",
                }
            })
        upPops(true, "rascunho")

    }

    async function salvar() {
        setLoading(true)
        const parse = await schema.safeParseAsync({
            ...form,
            status: "publicado"
        })
        setLoading(false)
        if (!parse.success) {
            return toast.error(parse.error.issues[0].message)
        }
        setCurrentFaq(parse.data)
        if (form.id === -1)
            setForm(old => {
                return {
                    id: -1,
                    titulo: '',
                    tags: [],
                    status: "",
                    categoria: "",
                    conteudo: "",
                }
            })
        upPops(true, "publicacao")
    }

    async function load() {
        setLoadingEdit(true)
        const id = apiAdmin.query.getQueryKey("id")
        if (!id) {
            setLoadingEdit(false)
            return
        }
        const [r, e] = await apiAdmin.get(`/faq/${id}`)
        if (e) {
            setLoadingEdit(false)
            return
        }
        const data = r.data
        setForm({
            categoria: data.categoria,
            conteudo: data.conteudo,
            id: data.id,
            tags: data.tags,
            titulo: data.titulo,
            status: ""
        })
        setLoadingEdit(false)
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div className="p-9 flex flex-col items-start h-full  justify-start">

            <div className="flex flex-col gap-3 w-full">
                <GoBackPage />
                <div className="flex justify-between items-center">
                    <Title label="Ajuda & FAQs" />
                    <div className="flex items-center gap-3">
                        <ConfigIconAnimation />
                        <BellFillAnimation />
                    </div>
                </div>
            </div>
            {loadingEdit
                ?
                <LoadingGlobal />
                :
                <>
                    <div className="flex flex-col w-full  mt-8 gap-4">
                        <SubTitle label="Informação Geral" />
                        <div className="grid grid-cols-2 gap-4 items-start  w-full">

                            <Input label="Título da publicação" value={form.titulo}
                                onChange={(event) => { upForm(event.target.value, "titulo") }} placeholder="Adicione um titulo" />
                            <SelectSweet value={form.categoria} ButtonComponent={CategoriaBtn} options={categorias}
                                placeholder="Selecione uma categoria" multiValue={false} setValue={(v) => upForm(v, "categoria")} />
                        </div>

                        <TagsGen form={form} upForm={(c, v) => upForm(c, v)} />
                    </div>
                    <div className="mt-6 h-full flex-grow w-full ">

                        <Tiptap content={form.conteudo} onChange={(v: string) => {
                            upForm(v, "conteudo")
                        }} />

                    </div>
                    <div className="mt-6 w-full">
                        <div className="flex justify-between w-full items-center pb-6">

                            <BtnTransparent label="Voltar" onClick={() => { }} />
                            <div className="flex items-center gap-3">
                                {!loading
                                    &&
                                    <BtnTransparent loading={loadingR} label="Salvar como rascunho" onClick={() => { rascunho() }} />
                                }
                                {!loadingR
                                    &&
                                    <BtnStrong loading={loading} label="Publicar FAQ" onClick={() => { salvar() }} />
                                }
                            </div>
                        </div>
                    </div>
                </>
            }

            <ModalFaq onClick={() => { window.location.href = "/backoffice/app/faq/publicar?id=" + currentFaq }} icon={<IconCheckRed />} onClose={() => { upPops(false, "rascunho") }} visible={pops.rascunho}
                text="Continue editando de onde você parou" title="Rascunho Salvo com sucesso" textBtn="Visualizar rascunho" />

            <ModalFaq onClick={() => { window.location.href = "/backoffice/app/faq/postagem/" + currentFaq }} icon={<IconCheckRed />} onClose={() => upPops(false, "publicacao")} visible={pops.publicacao}
                text="Agora todos os usuários podem visualizar a publicação e ter suas dúvidas respondidadas. Bom trabalho!" title="Publicação feita com sucesso" textBtn="Visualizar FAQ" />





        </div>
    )
}

function TagsGen({ form, upForm }: { form: any, upForm: (c: any, v: string) => void }) {

    const [editMode, setEditMode] = useState<boolean>(false)
    const [tag, setTag] = useState<string>("")

    function nova() {
        const array = form.tags;
        if (array.some((obj: string) => obj === tag)) {
            return
        }
        array.push(tag)
        setTag("")
        setEditMode(false)
        upForm(array, "tags")
    }
    function keyDown(e: any) {
        if (e.key === "Enter") {
            nova()
        }
    }

    return (
        <div className="flex flex-col w-full bg-white text-[#95A3B2] text-[12px] p-4 py-2 border rounded-md">
            <b className="text-[#485B80]  text-[12px] font-semibold">Tags</b>
            <div className="flex flex-wrap gap-2 items-center w-full mt-2">
                {form.tags.map((ca: any, i: number) => {
                    return (
                        <CategoriaTag key={i} onDelete={() => {
                            const mock = form.tags.filter((obj: any) => obj !== ca);
                            upForm(mock, "tags")
                        }} label={ca} />
                    )
                })}
                {editMode
                    ?
                    <input type="text" placeholder="Escreva uma tag" onKeyDown={keyDown}
                        className="p-1 pb-[2px] text-neutral-900 focus:border-b outline-none " value={tag} onChange={(e) => setTag(e.target.value)} />
                    :
                    <button onClick={() => setEditMode(true)} className="px-2 flex items-center gap-1 group hover:bg-slate-500 hover:text-white p-1 border ease-in-out duration-500 rounded-xl font-semibold text-[12px]">
                        Adicionar Tag
                        <IconAdd className="group-hover:rotate-[180deg] group-hover:brightness-200 ease-in-out duration-500" />
                    </button>

                }
            </div>
        </div>
    )
}
function CategoriaTag({ onDelete, label }: { onDelete: VoidFunction, label: string }) {
    return (
        <div className="p-1 gap-1 flex font-semibold justify-around px-2 bg-[#586E9D] text-[12px] rounded-full min-w-[60px] text-white">
            {label}
            <button onClick={onDelete}>
                <ExitBoldIcon />
            </button>
        </div>
    )
}


function CategoriaBtn({ isDrop, placeholder, setDrop }: PropsButtonOption) {
    return (
        <div className={"flex flex-col gap-1 relative flex-shrink-0 flex-grow w-full"}>
            <span className="text-[12px] text-[#485B80] font-semibold">Categorias</span>
            <button onClick={() => setDrop()} className="bg-white text-[#6C7788] border text-[14px] p-2 rounded-md w-full flex items-center justify-between">
                {placeholder}
                <IconArrow className={cn(isDrop ? "rotate-[180deg]" : "", "ease-in-out duration-300")} />
            </button>
        </div>
    )
}

