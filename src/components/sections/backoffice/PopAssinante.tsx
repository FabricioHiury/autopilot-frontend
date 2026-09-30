import { LojaI } from "@/app/backoffice/app/assinantes/page";
import { PlanBasicSvg, PlanPremiumSvg, PlanStarterSvg } from "@/components/cards/SignatureIcons";
import AvatarUser from "@/components/commons/avatar-user";
import IconX from "@/components/icons/icon-x";
import Spinner from "@/components/loading/Spinner";
import { profileImageUrl } from "@/lib/profile.utils";
import { resetSignal, sendSignal } from "@/redux/store";
import { apiAdmin } from "@/utils/classes/api";
import handleText from "@/utils/classes/format/text";
import handleDate from "@/utils/classes/format/time";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function PopAssinante({ loja, onClose, confirmar, setConfirmar }: { loja: LojaI, onClose: Function, confirmar: boolean, setConfirmar: Function }) {
    const dispatch = useDispatch();

    const detailsData = [
        {
            title: "Dados da Loja",
            content: [
                { label: "CNPJ", value: loja.cnpj },
                { label: "Criado em", value: handleDate.formatISODate(loja.criadoEm) },
                { label: "Localização", value: `${loja.enderecoLoja[0]?.cidade || ""} - ${loja.enderecoLoja[0]?.uf || ""}` },
                { label: "Nome da Loja", value: loja.nomeEmpresa },
                { label: "E-mail", value: loja.lojista.usuario.email },
            ]
        },
        {
            title: "Dados do Plano",
            content: [
                { label: "Plano atual", value: loja.assinatura ? handleText.capitalizeFirstLetter(loja.assinatura.plano.nome) : "Sem plano" },
                { label: "Valor do Plano", value: `R$ ${loja.assinatura?.plano.valor || ' 0,00'}` }
            ]
        },

    ];

    async function bloquear() {
        setLoading(true)

        const action = loja.lojista.status === "ativo" ? "desativar" : "ativar"
        const resultado = loja.lojista.status === "ativo" ? "desativada" : "reativada"
        const [response, error] = await apiAdmin.put(`/backoffice/assinatura/loja/${loja.id}/${action}`)
        if (error) {
            setLoading(false)
            return toast.error(error.message)
        }
        toast.success(`Loja ${resultado} com sucesso`)

        dispatch(sendSignal({
            data: {},
            signal: "reloadUsers"
        }))

        setTimeout(() => dispatch(resetSignal()), 50)
        onClose()
    }

    const [loading, setLoading] = useState<boolean>(false)

    return (
        <>

            <div className="flex flex-col w-full mt-8">
                <div className="flex gap-6 lg:flex-nowrap flex-wrap justify-between items-center w-full">
                    <div className="flex w-full gap-3 items-center">
                        <AvatarUser name={loja.nomeEmpresa} src={profileImageUrl(loja.lojista.idUsuario)} />
                        <div className="block">
                            <b>{loja.nomeEmpresa}</b>
                            <div className="flex gap-2 text-[16px] text-[#6C7788] items-center">
                                {
                                    loja.assinatura?.plano.nome === "premium"
                                    &&
                                    <PlanPremiumSvg className="w-[20px]" />
                                }
                                {
                                    loja.assinatura?.plano.nome === "basic"
                                    &&
                                    <PlanBasicSvg className="w-[20px]" />
                                }
                                {
                                    loja.assinatura?.plano.nome === "starter"
                                    &&
                                    <PlanStarterSvg className="w-[20px]" />
                                }
                                {loja.assinatura?.plano ? `Plano AutoPilot ${handleText.capitalizeFirstLetter(loja.assinatura.plano.nome)}` : "Sem plano"}
                            </div>
                        </div>
                    </div>
                    <button className="lg:w-auto w-full text-[14px] rounded-lg whitespace-nowrap gap-2 font-semibold 
                flex items-center justify-center px-8 p-2 border border-[#485B80] text-[#485B80] bg-transparent"
                        onClick={() => setConfirmar(true)}>
                        <img src="/icons/banir.svg" alt="" />
                        {loja.lojista.status === "ativo" ? "Bloquear" : "Desbloquear"} Assinante
                    </button>
                </div>

                {confirmar &&

                    <div className="flex flex-col gap-1 w-full mt-6">
                        <div className="flex w-full gap-2 text-[14px] items-start text-[#E84C43] font-medium">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0.666343 8.99967C0.666343 4.3973 4.3973 0.666341 8.99968 0.666341C13.602 0.666341 17.333 4.3973 17.333 8.99967C17.333 13.602 13.602 17.333 8.99967 17.333C4.3973 17.333 0.666342 13.602 0.666343 8.99967ZM8.99968 4.20801C8.6545 4.20801 8.37468 4.48783 8.37468 4.83301L8.37468 9.83301C8.37468 10.1782 8.6545 10.458 8.99968 10.458C9.34485 10.458 9.62468 10.1782 9.62468 9.83301L9.62468 4.83301C9.62468 4.48783 9.34485 4.20801 8.99968 4.20801ZM8.99968 13.1663C8.53944 13.1663 8.16634 12.7932 8.16634 12.333C8.16634 11.8728 8.53944 11.4997 8.99968 11.4997C9.45991 11.4997 9.83301 11.8728 9.83301 12.333C9.83301 12.7932 9.45991 13.1663 8.99968 13.1663Z"
                                    fill="#E84C43" />
                            </svg>
                            Tem certeza que deseja {loja.lojista.status === "ativo" ? "desativar" : "ativar"} esse assinante?
                        </div>
                        <p className="text-[14px] text-[#485B80]">
                            {loja.lojista.status === "ativo" ?
                                "O mesmo perderá o acesso á sua conta e não poderá utilizar a plataforma até que seja reativado novamente" :
                                "O acesso à plataforma será reativado novamente"
                            }

                        </p>
                        <div className="flex gap-4 w-full justify-end mt-2">
                            {
                                !loading
                                &&
                                <button className="w-1/2 text-[14px] rounded-lg whitespace-nowrap gap-2 font-semibold 
                        flex items-center justify-center px-8 p-2 border border-[#485B80] text-[#485B80] bg-transparent"
                                    onClick={() => setConfirmar(false)}>
                                    Cancelar
                                    <IconX />
                                </button>
                            }
                            <button className="w-1/2 self-end text-[14px] rounded-lg whitespace-nowrap gap-2 font-semibold 
                    flex items-center justify-center px-8 p-2 bg-[#293856] text-white" disabled={loading} onClick={bloquear}>
                                {loading
                                    ?
                                    <Spinner color="white" width="24px" />
                                    :
                                    <>
                                        Confirmar
                                        <img src="/icons/check2.svg" />
                                    </>
                                }
                            </button>
                        </div>
                    </div>

                }


                <div className="flex flex-wrap gap-4 items-center mt-8">
                    <MiniCard label="tickets abertos" qtd={2} />
                </div>
                <div className="flex flex-col gap-4 mt-8">
                    {detailsData.map((obj, i) => {
                        return (
                            <PrettyDetails details={obj} key={i} />
                        )
                    })}
                </div>

                <div>
                    <h2 className="text-[20px] font-semibold mt-8">Controle de Integrações</h2>
                    <FormIntegracoes integracoesLiberadas={loja.integracoesLiberadas} idLoja={loja.id} />
                </div>


            </div>


        </>)
}

function MiniCard({ qtd, label }: { qtd: number, label: string }) {
    return (
        <>
            <div className="flex text-[#485B80] px-4 rounded-md font-medium p-1 text-[14px] bg-[#EBEEF2] justify-center items-center">
                ({qtd}) {label}
            </div>
        </>
    )
}


function PrettyDetails({ details }: {
    details: {
        title: string,
        content: {
            label: string,
            value: string
        }[]
    }
}) {
    return (<>
        <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold">{details.title}</h2>
            <ul className="flex flex-col gap-3 lg:gap-1">
                {details.content.map((obj, i) => {
                    return (
                        <li key={i} className="flex flex-col gap-[2px] lg:grid w-full grid-cols-5">
                            <span className="font-medium lg:font-normal col-span-2 text-[14px] lg:text-[16px] text-[#6C7788]">{obj.label}</span>
                            <b className="text-[#485B80] col-span-3 text-[16px] font-medium lg:font-normal">{obj.value}</b>
                        </li>
                    )

                })}
            </ul>
        </div>

    </>)
}


function FormIntegracoes({ integracoesLiberadas, idLoja }: { integracoesLiberadas: boolean | undefined, idLoja: string }) {
    const [loading, setLoading] = useState<boolean>(false)
    const [habilitado, setHabilitado] = useState<boolean>(integracoesLiberadas || false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return

        setLoading(true)

        const body = {
            idLoja,
            integracoesLiberadas: habilitado
        }

        const [response, error] = await apiAdmin.post("/backoffice/lojas/configurar-wpp", body)

        setLoading(false)

        if (error) {
            return toast.error(error.message)
        }

        toast.success(`Integrações ${habilitado ? 'habilitadas' : 'desabilitadas'} com sucesso`)
    }

    return (
        <form
            className="flex flex-col gap-4 mt-4 mb-4"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-3">
                <label className="text-sm text-[#6C7788] font-semibold">Status das Integrações</label>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="integracoes"
                            checked={habilitado === true}
                            onChange={() => setHabilitado(true)}
                            className="w-4 h-4 text-[#293856] border-gray-300 focus:ring-[#293856]"
                        />
                        <span className="text-sm text-[#485B80] font-medium">Habilitadas</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="integracoes"
                            checked={habilitado === false}
                            onChange={() => setHabilitado(false)}
                            className="w-4 h-4 text-[#293856] border-gray-300 focus:ring-[#293856]"
                        />
                        <span className="text-sm text-[#485B80] font-medium">Desabilitadas</span>
                    </label>
                </div>

                <div className={`p-3 rounded-lg border ${habilitado
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    <p className="text-sm font-medium">
                        {habilitado
                            ? '✅ Esta loja poderá conectar integrações (WhatsApp, Instagram, Facebook, etc.)'
                            : '❌ Esta loja não poderá conectar nenhuma integração'
                        }
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full text-[14px] rounded-lg whitespace-nowrap gap-2 font-semibold flex items-center justify-center px-8 p-3 bg-[#293856] text-white disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                    </>
                ) : (
                    `${habilitado ? 'Habilitar' : 'Desabilitar'} Integrações`
                )}
            </button>
        </form>
    )
}