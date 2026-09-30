"use client"
import { PlanBasicSvg, PlanPremiumSvg, PlanStarterSvg } from "@/components/cards/SignatureIcons"
import Avatar from "@/components/cards/Avatar"
import BarCustom from "@/components/commons/graphs/bar"
import PieDash from "@/components/commons/graphs/pie"
import InputPesquisarBlue from "@/components/commons/inputs/input-pesquisar-blue"
import { SelectMin } from "@/components/commons/inputs/select-min"
import Pagination from "@/components/commons/pagination/Pagination"
import CalendarSelect from "@/components/inputs/select/CalendarSelect"
import Spinner from "@/components/loading/Spinner"
import { profileImageUrl } from "@/lib/profile.utils"
import { cn } from "@/lib/class-name.utils"
import api, { apiAdmin } from "@/utils/classes/api"
import handleText from "@/utils/classes/format/text"
import handleDate from "@/utils/classes/format/time"
import { Assinante } from "@/utils/types/dataTypes"
import { ReactElement, ReactNode, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Link from "next/link"


const padding = "p-8 px-4 lg:px-12"
const anosOptions = Array.from({ length: 9 }, (_, index) => {
    const year = 2025 + index;
    return { label: year.toString(), value: year.toString() };
});

function SvgProgressive() {
    return (
        <svg width="62" height="20" viewBox="0 0 62 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 18.5C2 18.5 7.06073 9.35893 12.875 12.5064C18.6893 15.6539 19.4428 18.5 24.6111 16.6115C29.7793 14.723 30.1028 -1.23779 34.625 1.90971C39.1472 5.0572 50.3095 11.3522 60 1.90971" stroke="url(#paint0_linear_3634_156150)" strokeWidth="2.37343" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_3634_156150" x1="38.6719" y1="-2.67513" x2="27.3499" y2="26.8658" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#50DE9A" />
                    <stop offset="1" stopColor="#24AE6C" />
                </linearGradient>
            </defs>
        </svg>

    )
}

function SvgRegressive() {
    return (
        <svg width="63" height="22" viewBox="0 0 63 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M61 20C61 20 55.686 8.64059 49.5806 12.1417C43.4753 15.6429 37.7836 15.6922 28.4563 5.07641C19.129 -5.53935 12.1755 15.5799 2 5.07641" stroke="url(#paint0_linear_3634_156174)" strokeWidth="2.37343" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_3634_156174" x1="5.11168" y1="-7.56437" x2="22.0602" y2="35.3109" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3030" stopOpacity="0.01" />
                    <stop offset="1" stopColor="#F97272" />
                </linearGradient>
            </defs>
        </svg>

    )
}

function SvgPerson() {
    return (

        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_3634_156145)">
                <circle cx="11.0008" cy="5.85631" r="3.42857" stroke="#FEFEFE" strokeWidth="1.5" />
                <path d="M16.1426 8.42829C17.5627 8.42829 18.714 7.4689 18.714 6.28544C18.714 5.10197 17.5627 4.14258 16.1426 4.14258" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5.85742 8.42829C4.43726 8.42829 3.28599 7.4689 3.28599 6.28544C3.28599 5.10197 4.43726 4.14258 5.85742 4.14258" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="11.0003" cy="15.285" rx="5.14286" ry="3.42857" stroke="#FEFEFE" strokeWidth="1.5" />
                <path d="M17.8574 16.9996C19.3611 16.6698 20.4289 15.8348 20.4289 14.8567C20.4289 13.8787 19.3611 13.0436 17.8574 12.7139" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4.14258 16.9996C2.63894 16.6698 1.57115 15.8348 1.57115 14.8567C1.57115 13.8787 2.63894 13.0436 4.14258 12.7139" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <defs>
                <clipPath id="clip0_3634_156145">
                    <rect width="20.5714" height="20.5714" fill="white" transform="translate(0.714844 0.713867)" />
                </clipPath>
            </defs>
        </svg>
    )
}

function SvgGrow() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.28711 15.2853L8.42997 10.1424L11.8585 13.571L18.7157 6.71387" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.7148 6.71387H18.7148V12.7139" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
function SvgDesativado() {
    return (<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.57227 6.71373C7.57227 7.62304 7.93349 8.49511 8.57647 9.13809C9.21945 9.78108 10.0915 10.1423 11.0008 10.1423C11.9102 10.1423 12.7822 9.78108 13.4252 9.13809C14.0682 8.49511 14.4294 7.62304 14.4294 6.71373C14.4294 5.80441 14.0682 4.93234 13.4252 4.28936C12.7822 3.64638 11.9102 3.28516 11.0008 3.28516C10.0915 3.28516 9.21945 3.64638 8.57647 4.28936C7.93349 4.93234 7.57227 5.80441 7.57227 6.71373Z" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.85742 18.7141V16.9999C5.85742 16.0905 6.21865 15.2185 6.86163 14.5755C7.50461 13.9325 8.37668 13.5713 9.28599 13.5713H12.286" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.5728 19.5709L15.2871 15.2852" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.2871 19.5709L19.5728 15.2852" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    )
}
function SvgDesaprovado() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.28711 13.571C3.28711 13.3437 3.37742 13.1257 3.53816 12.9649C3.69891 12.8042 3.91692 12.7139 4.14425 12.7139H5.0014C5.22872 12.7139 5.44674 12.8042 5.60749 12.9649C5.76823 13.1257 5.85854 13.3437 5.85854 13.571V16.1424C5.85854 16.3698 5.76823 16.5878 5.60749 16.7485C5.44674 16.9093 5.22872 16.9996 5.0014 16.9996H4.14425C3.91692 16.9996 3.69891 16.9093 3.53816 16.7485C3.37742 16.5878 3.28711 16.3698 3.28711 16.1424V13.571Z" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.85742 13.571C5.85742 13.3437 5.94773 13.1257 6.10847 12.9649C6.26922 12.8042 6.48724 12.7139 6.71456 12.7139H9.93399C10.1184 12.7139 10.2979 12.7733 10.4458 12.8834C10.5937 12.9935 10.7022 13.1484 10.7551 13.325L11.7837 15.8964C11.8608 16.1562 11.8977 16.4364 11.7357 16.6542C11.5746 16.8719 11.2711 16.9996 11.0003 16.9996H9.28599V19.1142C9.28589 19.3164 9.22073 19.5133 9.10015 19.6757C8.97956 19.8382 8.80993 19.9575 8.61632 20.0161C8.42271 20.0747 8.21539 20.0695 8.02497 20.0012C7.83455 19.933 7.67113 19.8053 7.55885 19.637L5.85742 16.9996V13.571Z" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.7148 3.28516V6.71373C12.7148 6.94106 12.8051 7.15907 12.9659 7.31982C13.1266 7.48056 13.3447 7.57087 13.572 7.57087H17.0006" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10.1423V4.99944C5 4.54479 5.18061 4.10875 5.5021 3.78726C5.82359 3.46577 6.25963 3.28516 6.71429 3.28516H12.7143L17 7.57087V16.9994C17 17.4541 16.8194 17.8901 16.4979 18.2116C16.1764 18.5331 15.7404 18.7137 15.2857 18.7137H13.1429" stroke="#FEFEFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
}
function CardEstatistica({ details, loading }: {
    loading: boolean, details: {
        label: string,
        qtd: number,
        icon: ReactElement
        positive: boolean
    }
}) {
    return (
        <>
            <div className="flex items-center relative flex-shrink-0 gap-2 bg-white shadow-md px-5 border border-[rgba(0,0,0,.045)] p-3 pt-3 pb-1 rounded-xl">

                <div className="bg-[#1B263A] self-start flex items-center justify-center aspect-square w-[36px] h-[36px] rounded-lg flex-shrink-0">
                    {details.icon}
                </div>
                <div className="flex flex-col mr-2">
                    <span className="text-[#0F1522] leading-3 text-[10px] font-semibold">{details.label}</span>
                    {loading
                        ?
                        <div className="p-2">
                            <Spinner color="#1B263A" width="24px" />
                        </div>
                        :
                        <b className="text-[32px] leading-10 text-[#293856] font-bold">
                            {details.qtd}
                        </b>
                    }
                </div>
                <div className="flex absolute right-5">
                    {
                        !loading
                        &&
                        (details.positive
                            ?
                            <SvgProgressive />
                            :
                            <SvgRegressive />
                        )
                    }

                </div>


            </div>
        </>
    )
}

function Header() {

    async function loadEstatisticasHeader() {
        setLoading(true)
        const [response, error] = await apiAdmin.get(`/backoffice/dashboard/estatisticas-cadastro`);
        if (error) {
            return toast.error(error.message)
        }
        setEstatisticas(response.data.estatisticas)
        setLoading(false)
    }
    useEffect(() => {
        loadEstatisticasHeader()
    }, [])


    const [estatisticas, setEstatisticas] = useState<{ novosCadastros: number, novosUpgrades: number, desativacoesConta: number, cancelamentosPlano: number }>()
    const [loading, setLoading] = useState<boolean>(true)

    return (
        <>
            <div className={"flex flex-col bg-white relative"}>
                <div className={"flex flex-col p-8 px-4 lg:px-12"}>
                    <h1 className="text-[#1B263A] text-[28px] font-semibold">Central do administrador</h1>
                    <span className="text-[#1B263A] text-[16px] font-medium mt-1 mb-20 lg:mb-4">Seja bem vindo Admin 👋</span>
                </div>

                <div className="md:-mb-[3rem] md:-mt-[2rem] grid grid-cols-2 md:grid-cols-4 gap-4 w-full p-4 px-3 lg:px-12">
                    <CardEstatistica loading={loading} details={{ label: "Novos cadastros", qtd: estatisticas?.novosCadastros ?? 0, icon: <SvgPerson />, positive: true }} />
                    <CardEstatistica loading={loading} details={{ label: "Novos upgrades", qtd: estatisticas?.novosUpgrades ?? 0, icon: <SvgGrow />, positive: true }} />
                    <CardEstatistica loading={loading} details={{ label: "Desativações de conta", qtd: estatisticas?.desativacoesConta ?? 0, icon: <SvgDesativado />, positive: false }} />
                    <CardEstatistica loading={loading} details={{ label: "Cancelamentos de planos", qtd: estatisticas?.desativacoesConta ?? 0, icon: <SvgDesaprovado />, positive: false }} />
                </div>

            </div>
        </>)
}

export default function PageDashboard() {

    const [dataPie, setDataPie] = useState<{ taxaChurn: number, receita: number }>()
    const [loadingPie, setLoadinPie] = useState<boolean>(true)
    const [filtrosPie, setFiltrosPie] = useState<any>({
        periodo: {
            from: null,
            to: null
        }
    })
    async function loadReceita() {
        setLoadinPie(true)
        const [response, error] = await apiAdmin.get(`/backoffice/dashboard/receita-taxachurn${apiAdmin.query.searchInMemoryQuerys({
            dataInicial: filtrosPie.periodo.from ? filtrosPie.periodo.from.toISOString() : null,
            dataFinal: filtrosPie.periodo.to ? filtrosPie.periodo.to.toISOString() : null
        })}`)
        if (error) {
            return toast.error(error.message)
        }
        setDataPie(response.data.dados)
        setLoadinPie(false)

    }
    useEffect(() => {
        loadReceita()
    }, [filtrosPie])


    const [dataBar, setDataBar] = useState<{ ano: string, assinaturas: number, cancelamentos: number, meses: { mes: string, assinaturas: number, cancelamentos: number }[] }>()
    const [loadingBar, setLoadingBar] = useState<boolean>(true)
    const [anoBar, setAnoBar] = useState<string>("")

    async function loadAssinaturas() {
        setLoadingBar(true)
        const [response, error] = await apiAdmin.get(`/backoffice/dashboard/assinaturas-ano${apiAdmin.query.searchInMemoryQuerys({
            ano: anoBar
        })}`)
        if (error) {
            return toast.error(error.message)
        }
        setDataBar(response.data)
        setLoadingBar(false)

    }
    useEffect(() => {
        loadAssinaturas()
    }, [anoBar])


    return (
        <>
            <Header />

            <div className="flex flex-col xl:grid grid-cols-5 w-full gap-5 p-3 lg:p-12 lg:pb-0 mt-8">

                <div className="flex flex-grow flex-col p-4 lg:p-4 bg-white rounded-xl shadow-[0px_2px_20px_rgba(0,0,0,.05)] col-span-2">
                    <div className="flex items-center justify-between ">
                        <span className="text-[#1B263A] text-[16px] font-semibold">Taxa de churn</span>

                        <CalendarSelect range={filtrosPie.periodo} setRange={(value) => {
                            setFiltrosPie((old: any) => {
                                return {    
                                    ...old,
                                    periodo: value ?? {
                                        from: null,
                                        to: null
                                    }
                                }
                            })
                        }} />

                    </div>
                    <div className="flex h-full items-center">
                        {
                            loadingPie
                                ?
                                <div className="flex w-full justify-center p-4">
                                    <Spinner color="black" width="24px" />
                                </div>
                                :
                                <div className="grid grid-cols-2 gap-2 items-center justify-around w-full">
                                    <PieDash mainValue={dataPie?.taxaChurn + "%"} qtd={dataPie?.taxaChurn ?? 0} data={[
                                        { name: 'taxaChurn', value: 50, color: '#D33632' },
                                        { name: 'taxaChurn', value: 50, color: '#F9E1E0' },
                                    ]} label="Clientes" />
                                    <PieDash mainValue={"R$" + dataPie?.receita} qtd={dataPie?.receita ?? 0} data={[
                                        { name: 'A', value: 80, color: '#485B80' },
                                        { name: 'A', value: 80, color: '#E4E7EC' },
                                    ]} label="Receita" />
                                </div>

                        }
                    </div>
                </div>

                <div className="flex flex-grow flex-col p-4 lg:p-4 bg-white rounded-xl shadow-[0px_2px_20px_rgba(0,0,0,.05)] col-span-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[#1B263A] gap-2 flex items-center text-[16px] font-semibold">
                            Usuários ativos e inativos
                            <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.3327 6.50033C11.3327 9.44584 8.94487 11.8337 5.99935 11.8337C3.05383 11.8337 0.666016 9.44584 0.666016 6.50033C0.666016 3.55481 3.05383 1.16699 5.99935 1.16699C8.94487 1.16699 11.3327 3.55481 11.3327 6.50033ZM5.99935 10.3545C6.51712 10.3545 6.93685 9.93476 6.93685 9.41699V5.91699C6.93685 5.58469 6.76395 5.29276 6.50321 5.12627C6.84775 4.94492 7.08268 4.58339 7.08268 4.16699C7.08268 3.56868 6.59766 3.08366 5.99935 3.08366C5.40104 3.08366 4.91602 3.56868 4.91602 4.16699C4.91602 4.58339 5.15094 4.94492 5.49548 5.12627C5.23474 5.29276 5.06185 5.58469 5.06185 5.91699V9.41699C5.06185 9.93476 5.48158 10.3545 5.99935 10.3545Z" stroke="#D33632" />
                            </svg>

                        </span>
                        <SelectMin onChange={(value) => setAnoBar(value ?? "")} options={anosOptions} value={anosOptions[0].value} />
                    </div>
                    <div className="flex w-full h-full">
                        {
                            loadingBar
                                ?
                                <div className="flex w-full justify-center p-4">
                                    <Spinner color="black" width="24px" />
                                </div>
                                :
                                (
                                    dataBar &&
                                    <BarCustom totalAssinaturas={dataBar.assinaturas} totalCancelamentos={dataBar.cancelamentos} data={dataBar?.meses} />
                                )
                        }
                    </div>
                </div>

                {/* <div className="flex flex-grow flex-col p-4 lg:p-4 bg-white rounded-xl shadow-[0px_2px_20px_rgba(0,0,0,.05)]">
                <div className="flex items-center justify-between">
                    <span className="text-[#1B263A] text-[16px] font-semibold">Custos de Aquisição Cliente (CAC)</span>
                </div>
                <div className="flex h-full items-center mt-4">
                   <AreaCustom/>   
                </div>
            </div> */}

            </div>

            <div className="flex p-3 lg:px-12 pt-6">
                <div className="flex flex-grow flex-col p-4 lg:p-4 bg-white rounded-xl shadow-[0px_2px_20px_rgba(0,0,0,.05)]">
                    <div className="flex items-center justify-between">
                        <span className="text-[#1B263A] text-[20px] font-semibold">Últimas Assinaturas</span>
                        <Link href="/backoffice/app/assinantes" className="text-[#1B263A] text-[14px] font-semibold">
                            Ver todas
                        </Link>
                    </div>
                    <ListCardTable />
                </div>
            </div>

            <div className="flex p-3 lg:px-12 pt-6 pb-12">
                <Wrapper>
                    <Clv />
                </Wrapper>
            </div>

        </>
    )
}


function Wrapper({ children, col, row, minH }: { children: ReactNode, col?: string, row?: string, minH?: string }) {
    return (
        <>
            <div className={"flex flex-grow flex-col p-4 lg:p-4 bg-white rounded-xl shadow-[0px_2px_20px_rgba(0,0,0,.05)] " + col + " " + row + " " + minH}>
                {children}
            </div>
        </>)

}

function ListCardTable() {
    const [assinantes, setAssinantes] = useState<{ plano: string, assinaturas: Assinante[] }[]>()
    const [loading, setLoading] = useState<boolean>(false)
    const [plano, setPlano] = useState<string>("basic")
    const [planosOptions, setPlanosOptions] = useState<{ value: string, icon: ReactElement }[]>([])


    async function load() {
        const [response, error] = await apiAdmin.get(`/backoffice/dashboard/ultimas-assinaturas`)
        if (error) {
            return toast.error(error.message)
        }
        setAssinantes(response.data.planos)
        setPlanosOptions(response.data.planos.map((obj: any) => {
            return {
                value: obj.plano,
                icon: obj.plano === "premium" ? <PlanPremiumSvg /> : (obj.plano === "basic" ? <PlanBasicSvg /> : <PlanStarterSvg />)
            }
        }))
    }
    useEffect(() => {
        load()
    }, [])

    if (loading || !assinantes) {
        return (
            <div className="flex w-full justify-center p-4">
                <Spinner color="black" width="24px" />
            </div>
        )
    }

    return (

        <div className="flex flex-col w-full mt-6">
            <div className="flex gap-6 w-full">
                {planosOptions.map((obj, i) => {
                    return (
                        <button onClick={() => setPlano(obj.value)} key={i} className={cn(plano === obj.value ? "bg-[#293856] text-white" : "text-[#293856]",
                            "flex gap-3 items-center font-medium p-2 pl-4 rounded-md text-[16px] flex-grow max-w-[400px]")}>
                            {obj.icon}
                            {handleText.capitalizeFirstLetter(obj.value)}
                        </button>
                    )
                })}
            </div>
            {assinantes.map((obj, i) => {
                if (obj.plano === plano) {
                    if (obj.assinaturas.length > 0)
                        return obj.assinaturas.map((assinante, index) => {
                            return <Table assinante={assinante} key={i} isFirstElement={index === 0} />
                        })
                }
            })}
        </div>

    )

}

function Table({ assinante, isFirstElement }: { assinante: Assinante, isFirstElement: boolean }) {


    const table = {
        header: [
            {
                label: "Cliente",
                level: "flex-[5] lg:flex-[2]"
            },

            {
                label: "Data",
                level: "flex-[4] lg:flex-[1]"
            },

            {
                label: "Status",
                level: "flex-[4] lg:flex-[1]"
            }
        ],
        body: [
            {
                content: <>
                    <Avatar width="w-[36px] lg:flex hidden" textSize="text-[16px]" user={{ nome: assinante.loja.nomeEmpresa, icon: assinante.loja.avatarUrl }} />
                    <div className="flex flex-col">
                        <b className="text-[#293856] text-[12px] lg:text-[18px] font-semibold">{assinante.loja.nomeEmpresa}</b>
                        <div className="flex gap-[6px] items-center">
                            <span className="text-[#6C7788] text-[10px] lg:text-[14px]">{assinante.loja.cnpj}</span>
                        </div>
                    </div>
                </>
            },
            {
                content: <span className="text-[12px] lg:text-[14px]">{handleDate.formatISODate(assinante.dataAquisicao, "dd MMM, yyyy")}</span>
            },
            {
                content: <span className="bg-[#EBEEF2] text-[#293856] p-1 px-2 lg:px-4 font-semibold rounded-xl text-[12px] lg:text-[14px]">Recorrente</span>
            }
        ]
    }

    return (

        <ul className={cn("flex flex-col w-full mt-4")}>
            <ul className={"flex-[1] flex flex-row px-4  justify-between w-full rounded-md lg:text-[#7F8999] text-[16px] font-medium"
                + " " + (isFirstElement ? "lg:rounded-b-none" : "lg:hidden ")}>

                {table.header.map((obj, i) => {
                    return <li key={i} className={" flex items-center justify-start text-[#7F8999] font-semibold " + obj.level}>{obj.label}</li>

                })}

            </ul>
            <ul className=
                {"flex-[1] flex border-t flex-row p-3 py-4 mt-3 lg:px-4 items-center w-full rounded-md text-[#6C7788] text-[16px] font-medium duration-300 "}>
                {table.body.map((obj, i) => {
                    return (
                        <li key={i} className={" flex overflow-hidden  items-center gap-2 " + table.header[i].level}>
                            {obj.content}
                        </li>
                    )
                })}

            </ul>
        </ul>
    )
}



function Clv() {

    const [clientes, setClientes] = useState<{ id: string, nome: string, cnpj: string, totalGasto: number, frequencia: number, duracao: string, clv: number }[]>([])

    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>(1)
    const [totalUsuarios, setTotalUsuarios] = useState<number>(0)
    const [limit, setLimit] = useState<number>(10)
    const [pesquisa, setPesquisa] = useState<string>("")

    async function load() {
        const [response, error] = await apiAdmin.get(`/backoffice/dashboard/vida-util-clientes${apiAdmin.query.searchInMemoryQuerys({
            pagina: page,
            pesquisa: pesquisa
        })
            }`)
        console.log(response.data)
        setClientes(response.data.clientes)
        setTotalPage(response.data.totalPaginas)
    }

    useEffect(() => {
        load()
    }, [page, pesquisa])

    return (
        <>
            <div className="flex items-center gap-3 flex-wrap w-full justify-between">
                <span className="text-[#1B263A] lg:text-left text-center text-[20px] font-semibold">Vida Útil do Cliente (CLV)</span>
                <div className="flex w-full lg:w-[300px]">
                    <InputPesquisarBlue className="" onChange={(value) => { setPesquisa(value) }} value={pesquisa} placeholder="Procurar por cliente" />
                </div>
            </div>
            <div className="flex mb-2 flex-col lg:gap-0 gap-8     mt-6">
                {clientes.map((obj, i) => {
                    return <CardTable key={i} cliente={obj} isFirstElement={i === 0} />
                })}
            </div>
            <Pagination totalPages={totalPage}
                setLimitItens={setLimit} limitItens={limit} limitNumberPages={2} label="clientes"
                setPage={setPage} page={page} total={totalUsuarios} currentLength={clientes.length} />
        </>
    )
}

function CardTable({ cliente, isFirstElement }: { isFirstElement: boolean, cliente: any }) {
    const table = {
        header: [
            {
                label: "Nome",
                size: "flex-[1] lg:flex-[2]"
            },
            {
                label: "CLV",
                size: "flex-[1]"
            },
            {
                label: "Total Gasto",
                size: "flex-[1]"
            },
            {
                label: "Frequência",
                size: "flex-[1]"
            },
            {
                label: "Duração",
                size: "flex-[1]"
            }
        ],
        body: [
            {
                content: <div className="flex gap-1 relative items-start">
                    <Avatar width="w-[34px]" textSize="text-[14px]" user={{ nome: cliente.nome, icon: profileImageUrl(cliente.id) }} />
                    <div className="flex flex-col">
                        <span className="text-[#293856] text-[16px] max-w-[80%] lg:max-w-[100%] font-semibold truncate">{cliente.nome}</span>
                        <div className="flex gap-[6px] items-center">
                            <span className="text-[#6C7788] text-[12px] lg:text-[14px]  max-w-[100%] truncate">{cliente.cnpj}</span>
                        </div>
                    </div>
                </div>
            },
            {
                content: <span className="lg:text-[#293856] text-[#6C7788]">{cliente.clv}</span>
            },
            {
                content: <span className="lg:text-[#293856] text-[#6C7788]">R${cliente.totalGasto}</span>
            },
            {
                content: <span className="lg:text-[#293856] text-[#6C7788]">{cliente.frequencia}</span>
            },
            {
                content: <span className="lg:text-[#293856] text-[#6C7788]">{cliente.duracao}</span>
            }
        ]
    }

    return (
        <ul className={cn("flex flex-row lg:flex-col w-full")}>
            <ul className={"flex-[1] flex flex-col lg:mb-4 lg:flex-row justify-between w-full rounded-l-xl  font-medium " +
                "lg:bg-transparent  bg-[#E3E6EC] text-[#11151D] lg:text-[#7F8999] text-[14px] lg:text-[16px]" +
                "lg:p-1 lg:px-4" +
                " " + (!isFirstElement && "lg:hidden")}>
                {table.header.map((obj, i) => {
                    return <li key={i} className={"flex items-center justify-center text-center whitespace-nowrap  lg:text-left lg:justify-start p-4 lg:p-0 " + obj.size}>{obj.label}</li>
                })}
            </ul>
            <ul className=
                {"flex-[3] lg:flex-[1] flex lg:border-t lg:border-[rgba(0,0,0,.08)] flex-col lg:flex-row p-3 px-4 pr-0 lg:px-4 lg:items-center w-full rounded-r-xl text-[#6C7788] text-[16px] font-medium duration-300" + " " +
                    "lg:bg-transparent bg-[#F2F4F7]"
                }>
                {table.body.map((obj, i) => {
                    return (
                        <li key={i} className={"flex items-center lg:items-start gap-2 " + table.header[i].size}>
                            {obj.content}
                        </li>
                    )
                })}
            </ul>
        </ul>
    )
}