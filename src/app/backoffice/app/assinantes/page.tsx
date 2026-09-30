"use client"
import { PlanPremiumSvg } from "@/components/cards/SignatureIcons"
import AvatarUser from "@/components/commons/avatar-user"
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal"
import SideModal from "@/components/commons/modais/side-modal"
import { ModalTitle } from "@/components/commons/modal-title"
import Pagination from "@/components/commons/pagination/Pagination"
import Search from "@/components/inputs/search/Search"
import CalendarSelect from "@/components/inputs/select/CalendarSelect"
import FilterSelect from "@/components/inputs/select/FilterSelect"
import PopAssinante from "@/components/sections/backoffice/PopAssinante"
import { profileImageUrl } from "@/lib/profile.utils"
import { cn } from "@/lib/class-name.utils"
import { RootState, sendSignal } from "@/redux/store"
import { apiAdmin } from "@/utils/classes/api"
import handleText from "@/utils/classes/format/text"
import handleDate from "@/utils/classes/format/time"
import sanitizar from "@/utils/classes/sanitizer/sanitizer"
import { Assinante } from "@/utils/types/dataTypes"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"

export interface LojaI {
    id: string;
    idLojista: string;
    idFoto: number | null;
    cnpj: string;
    nomeEmpresa: string;
    inscricaoMunicipal: string;
    inscricaoEstadual: string;
    regimeTributario: string;
    portalEmpresa: string;
    atividadePrincipal: string;
    descricaoAtividade: string;
    wppConfigurado: boolean;
    wppInstancia: string | null;
    integracoesLiberadas?: boolean;
    criadoEm: string;  // ou Date, se preferir
    atualizadoEm: string;  // ou Date, se preferir
    assinatura?: {
        idPlano: string;
        plano: {
            nome: string;
            valor: number;
        }
    };
    lojista: Lojista;
    contatoLoja: ContatoLoja[];
    enderecoLoja: EnderecoLoja[];
}

interface Lojista {
    id: string;
    idUsuario: string;
    status: string;
    tokenClienteMeta: string | null;
    tokenClienteOlx: string | null;
    deviceToken: string | null;
    criadoEm: string;  // ou Date
    atualizadoEm: string;  // ou Date
    usuario: Usuario;
}

interface Usuario {
    id: string;
    email: string;
}

interface ContatoLoja {
    telefone: string;
    celular: string;
}

interface EnderecoLoja {
    id: string;
    idLoja: string;
    cep: string;
    uf: string;
    cidade: string;
    rua: string;
    numero: string;
    bairro: string;
    complemento: string | null;
    filial: boolean;
    criadoEm: string;  // ou Date
    atualizadoEm: string;  // ou Date
}

interface props {
    filtros: any,
    setFiltros: Function
}

const padding = "p-8 px-4 lg:px-12"

const Header: React.FC<props> = ({ filtros, setFiltros }) => {

    async function loadEstatisticas() {
        const [response, error] = await apiAdmin.get(`/backoffice/assinatura/estatisticas`)
        if (error) {
            return toast.error(error.message)
        }
        setEstatisticas(response.data)
    }

    const router = useRouter()
    const [estatisticas, setEstatisticas] = useState<{ totalAssinaturas: number, planos: { plano: string, total: number, percentual: number }[] }>()
    function setPesquisa(value: any) {
        setFiltros((old: any) => {
            return {
                ...old,
                pesquisa: value ?? ""
            }
        })
    }
    function setPeriodo(value: any) {
        setFiltros((old: any) => {
            return {
                ...old,
                periodo: value ?? {
                    from: null,
                    to: null
                }
            }
        })
    }
    useEffect(() => {
        loadEstatisticas()
    }, [])

    return (

        <div className={padding + " bg-white"}>

            <div className="flex flex-col justify-start items-start gap-4">
                <div className="flex justify-between items-center gap-2 w-full">

                    <h1 className="text-[#1B263A] text-[28px] font-semibold">Lista de Assinantes</h1>

                    <div className="hidden lg:flex items-center gap-2">
                        <Search placeholder="Procurar em assinantes" value={filtros.pesquisa} setValue={setPesquisa} onSearch={() => { }} />
                        <CalendarSelect range={filtros.periodo} setRange={(value) => { setPeriodo(value) }} />
                        <FilterSelect
                            onChange={(filters) => {
                                setFiltros((old: any) => ({
                                    ...old,
                                    estado: filters.estado,
                                    searchTerm: filters.searchTerm
                                }));
                            }}
                            config={{
                                showGender: false,
                                showState: true,
                                showSourceChannel: false,
                                showStatus: false,
                            }}
                        />
                    </div>
                    <div className="lg:hidden flex items-center gap-2">
                        <CalendarSelect range={filtros.periodo} setRange={(value) => { setPeriodo(value) }} />
                    </div>
                </div>

                <div className="lg:hidden w-full flex items-center gap-2">
                    <FilterSelect
                        onChange={(filters) => {
                            setFiltros((old: any) => ({
                                ...old,
                                estado: filters.estado,
                                searchTerm: filters.searchTerm
                            }));
                        }}
                        config={{
                            showGender: false,
                            showState: true,
                            showSourceChannel: false,
                            showStatus: false,
                        }}
                    />
                    <Search placeholder="Procurar em assinantes" value={filtros.pesquisa} setValue={setPesquisa} onSearch={() => { }} />
                </div>

                <div className="w-full flex flex-wrap gap-4 justify-between items-center mt-6">
                    {estatisticas
                        &&
                        <div className="flex flex-wrap gap-3 bg-[#EBEEF2] p-2 rounded-lg justify-start items-center">
                            {estatisticas.planos.map((obj, i) => {
                                return <PlanoTipo tipo={obj.plano} porcentagem={obj.percentual.toFixed(2).toString()} key={i} />

                            })}

                        </div>

                    }
                    {/* <button onClick={()=>router.push("/backoffice/app/dashboard")} 
                className="bg-[#293856] lg:flex-grow-0 flex-grow justify-center flex items-center gap-2 p-3 px-8 text-[14px] font-semibold rounded-lg text-white">
                    Ver desempenho
                    <img src="/icons/check.svg" alt="" className="w-4"/>
                </button> */}
                </div>
            </div>

        </div>

    )
}


function PlanoTipo({ tipo, porcentagem }: { tipo: string, porcentagem: string }) {
    return (
        <>
            <div className="flex flex-grow justify-between  items-center p-2 px-3 gap-4 bg-white text-[#334568] font-semibold rounded-lg text-[14px]">
                <div className="flex items-center gap-2">
                    <img src={"/icons/plano_premium.svg"} alt="" />
                    {handleText.capitalizeFirstLetter(tipo)}
                </div>
                <div className="flex items-center justify-center p-1 px-2 rounded-lg bg-[#485B80] text-white">
                    {porcentagem}%
                </div>
            </div>
        </>
    )
}


export default function PageAssinantes() {

    const dispatch = useDispatch();

    const messager = useSelector((state: RootState) => state);

    const [filtros, setFiltros] = useState<any>({
        periodo: {
            from: null,
            to: null
        },
        pesquisa: ""
    })
    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>(1)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [limit, setLimit] = useState<number>(5)

    const [assinantes, setAssinantes] = useState<Assinante[]>([])
    const [lojas, setLojas] = useState<LojaI[]>([])

    const [loading, setLoading] = useState<boolean>(false)


    async function loadAssinantes() {
        setLoading(true)
        const [response, error] = await apiAdmin.get(`/backoffice/assinatura${apiAdmin.query.searchInMemoryQuerys({
            pagina: page,
            itensPorPagina: limit,
            pesquisa: filtros.pesquisa,
            status: filtros.status,
            estado: filtros.estado,
            dataInicial: filtros.periodo.from ? filtros.periodo.from.toISOString() : null,
            dataFinal: filtros.periodo.to ? filtros.periodo.to.toISOString() : null
        })}`);
        setLoading(false)
        if (error) {
            return toast.error(error.message)
        }
        console.log(response.data)
        setAssinantes(response.data.assinantes)
        setTotalPage(response.data.totalPaginas)
    }

    async function fetchLojas() {
        setLoading(true)
        const [response, error] = await apiAdmin.get(`/backoffice/assinatura/lojas${apiAdmin.query.searchInMemoryQuerys({
            pagina: page,
            itensPorPagina: limit,
            pesquisa: filtros.pesquisa,
            status: filtros.status,
            estado: filtros.estado,
            dataInicial: filtros.periodo.from ? filtros.periodo.from.toISOString() : null,
            dataFinal: filtros.periodo.to ? filtros.periodo.to.toISOString() : null
        })}`);
        setLoading(false)
        if (error) {
            return toast.error(error.message)
        }
        console.log(response.data)
        setLojas(response.data.lojas as LojaI[])
        setTotalPage(response.data.totalPaginas)
        setTotalItems(response.data.total ?? 0)
    }

    useEffect(() => {
        loadAssinantes()
        fetchLojas()
    }, [filtros, page, limit])

    useEffect(() => {
        if (messager.signal === "reloadUsers") {
            loadAssinantes()
        }
    }, [messager])

    return (
        <main className=" flex flex-col gap-4 justify-between lg:h-[100%]  relative">
            <Header filtros={filtros} setFiltros={setFiltros} />
            <div className={"flex flex-col justify-start items-start flex-grow" + " " + padding}>

                {/* <Lista loading={loading} assinantes={assinantes}/> */}

                <ListaLojas loading={loading} lojas={lojas} />

            </div>
            <div className={"flex p-4 lg:p-0" + " " + (totalPage === 0 ? "hidden" : "")}>
                <Pagination background="bg-white" padding={padding + " p-4 rounded-xl lg:rounded-none "} totalPages={totalPage}
                    setLimitItens={setLimit} limitItens={limit} limitNumberPages={2} label="assinantes"
                    setPage={setPage} page={page} total={totalItems} currentLength={assinantes.length} />
            </div>

        </main>
    )
}


function ListaLojas({ lojas: lojas, loading }: { lojas: LojaI[], loading: boolean }) {
    if (loading) return <LoadingGlobal />
    if (lojas.length === 0) {
        return <div className="flex flex-col justify-center items-center gap-4 w-full">
            <p className="text-[#6C7788] text-[16px] font-medium">Nenhum assinante encontrado</p>
        </div>
    }

    return (
        <div className="flex flex-col lg:gap-0 gap-8 w-full">
            {lojas.map((loja, i) => {
                return <CardTabelaLoja key={loja.id} loja={loja} isFirstElement={i === 0} />
            })}
        </div>
    )
}

function CardTabelaLoja({ loja, isFirstElement }: { loja: LojaI, isFirstElement: boolean }) {

    const router = useRouter()
    const [visible, setVisible] = useState(false)
    const [popVisible, setPopVisible] = useState<boolean>(false)

    const [confirmar, setConfirmar] = useState<boolean>(false)

    const actions = [

        {
            action: () => {
                setConfirmar(false)
                setPopVisible(true)
            },
            icon: "/icons/doc.svg",
            label: "Ver dados do assinante"
        },
        {
            action: () => {
                setConfirmar(true);
                setPopVisible(true)
            },
            icon: "/icons/banir.svg",
            label: "Bloquear assinante"
        }
    ]

    return (
        <>
            {
                (popVisible &&
                    <SideModal onClose={() => setPopVisible(false)} idSelector="content-container">
                        <ModalTitle onClose={() => setPopVisible(false)} title="Dados do Assinante" />
                        <PopAssinante confirmar={confirmar} setConfirmar={setConfirmar} onClose={() => setPopVisible(false)} loja={loja} />
                    </SideModal>)

            }

            <ul className={cn("flex flex-row  lg:flex-col w-full")}>
                <ul className={"flex-[1] flex flex-col lg:flex-row lg:p-1 lg:px-4 justify-between w-full bg-[#E3E6EC] rounded-md text-[#191D23] lg:text-[#7F8999] text-[14px] font-medium" +
                    " " + (isFirstElement ? "lg:rounded-b-none" : "lg:hidden ")}>
                    <li className="flex-[5] flex items-center justify-center lg:justify-start p-6 lg:p-0">Cliente</li>
                    <li className="flex-[4] lg:flex hidden items-center justify-center lg:justify-start p-3 lg:p-0">Data de Cadastro</li>
                    <li className="flex-[4] flex items-center justify-center lg:justify-start p-3 lg:p-0 lg:hidden">Cadastro</li>
                    <li className="flex-[4] flex items-center justify-center lg:justify-start p-3 lg:p-0">E-mail</li>
                    <li className="flex-[4] flex items-center justify-center lg:justify-start p-3 lg:p-0">Telefone</li>
                    <li className="flex-[1] flex items-center justify-center lg:justify-start p-3 lg:p-0">Ações</li>
                </ul>
                <ul className=
                    {"flex-[4] lg:flex-[1] flex flex-col lg:flex-row p-3 lg:px-4 lg:items-center w-full rounded-md text-[#6C7788] text-[16px] font-medium duration-300 "
                        + (visible === true ? "bg-white" : "bg-[#F2F4F7] hover:bg-white")
                    }>
                    <li className="flex-[5] flex overflow-hidden p-1 lg:p-0 items-center gap-2">
                        {/* <Avatar user={{nome:loja.loja.nomeEmpresa,icon:((process.env.NEXT_PUBLIC_API_URL ?? "") + "/avatar/usuario/"+1).toString()}}/> */}
                        <AvatarUser name={loja.nomeEmpresa} src={profileImageUrl(loja.lojista.usuario.id)} />
                        <div className="flex flex-col">
                            <b className="text-[#293856] text-[18px] font-semibold">{loja.nomeEmpresa}</b>
                            <div className="flex gap-[6px] items-center">
                                <PlanPremiumSvg fill="#7F8999" className="w-3 -translate-y-[2px]" />
                                <span className="text-[#6C7788] text-[14px]">
                                    {loja.assinatura?.plano ? `Plano AutoPilot ${handleText.capitalizeFirstLetter(loja.assinatura.plano.nome)}` : "Sem plano"}
                                </span>

                            </div>

                        </div>
                    </li>

                    <li className="flex-[4] text-[14px] flex items-center p-1 gap-2 lg:p-0">
                        <span>{handleDate.formatISODate(loja.criadoEm, "dd 'de' MMMM 'de' yyyy")}</span>
                    </li>
                    <li className="flex-[4] flex items-center p-1 gap-2 lg:p-0">
                        <span className="text-[#6C7788] text-[14px]">{loja.lojista.usuario.email}</span>
                    </li>
                    <li className="flex-[4] flex items-center p-1 gap-2 lg:p-0 text-[14px]">
                        {loja.contatoLoja && loja.contatoLoja.length > 0 && loja.contatoLoja[0].celular
                            ?
                            <>
                                <img className="translate-y-[-1px]" src="/icons/zap.svg" alt="" />
                                <span>{sanitizar.telefone(loja.contatoLoja[0].celular, false)}</span>
                            </>
                            :
                            <span>Não informado</span>
                        }

                    </li>
                    <li className="flex-[1] relative  flex items-center p-1 lg:p-0">
                        {/* <OptionsCard list={actions} visible={visible} setVisible={setVisible}/> */}
                        <button className="flex justify-center items-center " onClick={() => {
                            setConfirmar(false)
                            setPopVisible(true)
                        }}>
                            <svg width="22" height="6" viewBox="0 0 22 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.83333 0.666992C1.55 0.666992 0.5 1.71699 0.5 3.00033C0.5 4.28366 1.55 5.33366 2.83333 5.33366C4.11667 5.33366 5.16667 4.28366 5.16667 3.00033C5.16667 1.71699 4.11667 0.666992 2.83333 0.666992ZM19.1667 0.666992C17.8833 0.666992 16.8333 1.71699 16.8333 3.00033C16.8333 4.28366 17.8833 5.33366 19.1667 5.33366C20.45 5.33366 21.5 4.28366 21.5 3.00033C21.5 1.71699 20.45 0.666992 19.1667 0.666992ZM11 0.666992C9.71667 0.666992 8.66667 1.71699 8.66667 3.00033C8.66667 4.28366 9.71667 5.33366 11 5.33366C12.2833 5.33366 13.3333 4.28366 13.3333 3.00033C13.3333 1.71699 12.2833 0.666992 11 0.666992Z"
                                    fill="#485B80" />
                            </svg>
                        </button>
                    </li>
                </ul>
            </ul>
        </>
    )
}


