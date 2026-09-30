'use client'

import { BtnStrong } from "@/components/commons/buttons/buttons";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import SideModal from "@/components/commons/modais/side-modal";
import { ModalTitle } from "@/components/commons/modal-title";
import handleDate from "@/utils/classes/format/time";
import { Ticket, TicketItemListaType } from "@/utils/types/ticket-type";
import { SVGProps } from "react";


interface ConteudoModalTicketProps {
    tick: Ticket | null;
    loading: boolean
    open: boolean
    onClose: VoidFunction
    onRedirect: VoidFunction
}

export function ConteudoModalTicket({ tick, loading, open, onClose, onRedirect }: ConteudoModalTicketProps) {

    if (open)
        return (
            <SideModal idSelector="content-container" onClose={onClose} bg="bg-[#EDF2F7]">
                {
                    (loading || !tick) ?
                        <div className="flex justify-center items-center h-full">
                            <LoadingGlobal />
                        </div>
                        :
                        <InfoTicket />

                }
            </SideModal>

        )


    function InfoTicket() {
        if (!tick) return
        return (
            <>
                <ModalTitle title="Ticket #213213" padrao={1} onClose={onClose} />
                <div className="flex flex-col justify-start items-start mt-1 gap-4 w-full">
                    <h1 className="text-[32px] font-semibold">{tick.assunto}</h1>
                    <div className="gap-[1px] grid grid-cols-3 w-full">
                        <div className="bg-white flex flex-col gap-1 p-4 items-start">
                            <span className="text-[#95A3B2] font-semibold text-[12px]">Status</span>
                            <div className="rounded-full text-white text-[11px] font-semibold bg-[#586E9D] px-2 p-1">
                                {tick.status}
                            </div>
                        </div>
                        <div className="bg-white flex flex-col gap-1 p-4 items-start">
                            <span className="text-[#95A3B2] font-semibold text-[12px]">Tipo</span>
                            <div className="rounded-full text-[#757E87] text-[11px] font-semibold bg-[#E3EBF3] px-2 p-1">
                                {tick.categoria}
                            </div>
                        </div>
                        <div className="bg-white flex flex-col gap-1 p-4 items-start">
                            <span className="text-[#95A3B2] font-semibold text-[12px]">Abertura</span>
                            <b className="text-[12px] font-medium">{handleDate.formatISODate(tick.criadoEm)}</b>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <b className="text-[12px] font-medium">Resposta Final</b>
                            <b className="text-[12px] font-medium">{handleDate.formatISODate(tick.atualizadoEm)}</b>
                        </div>
                        <div className="my-3 w-full h-[1px] bg-neutral-300"></div>
                        <p className="text-[#95A3B2] text-[12px]">
                            {tick.mensagem[0]}
                        </p>
                    </div>
                    <div className="w-full bg-white rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <b className="text-[12px] font-medium">Documentos anexados</b>
                            <b className="text-[12px] font-medium">
                                {handleDate.formatISODate(tick.atualizadoEm)}
                            </b>
                        </div>
                        <div className="my-3 w-full h-[1px] bg-neutral-300"></div>
                        {tick.arquivos.map((obj, i) => {
                            return (
                                <div className="flex flex-col gap-3" key={i}>
                                    <div className="p-4 bg-[#EDF2F7] rounded-lg flex items-center gap-2">
                                        <div className="p-3 px-5 bg-[#DDE6F2] rounded-lg">
                                            <img src="/images/pdf.png" alt="" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-[12px] text-[#7F8999]">
                                                80kb  - Enviado {handleDate.formatRelativeDate(new Date(obj.criadoEm))}
                                            </div>
                                            <b className="text-[14px] text-[#293856]">Nome temporario</b>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="w-full bg-white rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <b className="text-[14px] font-medium">Histórico dos tickets</b>
                        </div>
                        <div className="flex flex-col gap-4 mt-3">
                            {tick.historico.map((obj) => {
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className="aspect-square w-[40px] h-[40px] flex-shrink-0 flex items-center justify-center bg-[#586E9D] rounded-full">
                                            <Icon acao={obj.acao} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex font-semibold items-center text-[14px]  text-[#293856]">
                                                {obj.acao}                                      {obj.usuario.nome}
                                            </div>
                                            <b className="text-[12px] font-medium text-[#7F8999] ">
                                                {handleDate.formatISODate(obj.criadoEm, "EEEE',' dd 'de' MMMM 'de' yyyy")}
                                            </b>
                                        </div>

                                    </div>

                                )
                            })}

                        </div>

                    </div>
                    <div className="grid w-full">
                        <BtnStrong label="Visualizar Mensagens" padding="p-[10px]" onClick={onRedirect} />
                    </div>
                </div>
            </>

        )
    }


}


const Icon = ({ acao }: { acao: string }) => {


    if (acao.includes("criado")) {
        return <SvgCreated />
    }
    if (acao.includes("enviada")) {
        return <SvgDone />
    }
}

const Timer = (props: SVGProps<SVGSVGElement>) => (
    <svg
        width={11}
        height={15}
        viewBox='0 0 11 15'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
    >
        <path
            d='M5.67922 7.64829L3.78629 9.52281C1.9159 11.375 0.980701 12.3011 1.24252 13.1001C1.26502 13.1688 1.29297 13.2356 1.3261 13.3C1.71151 14.0483 3.03408 14.0483 5.67922 14.0483C8.32436 14.0483 9.64692 14.0483 10.0323 13.3C10.0655 13.2356 10.0934 13.1688 10.1159 13.1001C10.3777 12.3011 9.44254 11.375 7.57214 9.52281L5.67922 7.64829ZM5.67922 7.64829L7.57215 5.77377C9.44254 3.92157 10.3777 2.99547 10.1159 2.19644C10.0934 2.12776 10.0655 2.06094 10.0323 1.99662C9.64692 1.24829 8.32436 1.24829 5.67922 1.24829C3.03408 1.24829 1.71151 1.24829 1.3261 1.99662C1.29297 2.06094 1.26502 2.12776 1.24252 2.19644C0.980701 2.99547 1.9159 3.92157 3.78629 5.77377L5.67922 7.64829Z'
            stroke='#586E9D'
            strokeWidth={1.3}
        />
    </svg>
)



const SvgCreated = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        {...props}
    >
        <path
            stroke="#fff"
            strokeWidth={1.5}
            d="m14.544 6.831.37-.37a1.573 1.573 0 1 1 2.225 2.224l-.37.371m-2.225-2.225s.046.788.741 1.483c.695.696 1.483.742 1.483.742m-2.224-2.225-3.409 3.409c-.23.23-.346.346-.445.473-.117.15-.218.313-.3.485-.07.146-.12.3-.224.61l-.33.992-.108.32m7.04-4.064-3.408 3.409c-.231.23-.347.346-.474.445-.15.117-.313.217-.484.3-.146.069-.301.12-.61.224l-.992.33-.321.107m0 0-.321.107a.424.424 0 0 1-.537-.536l.107-.321m.75.75-.75-.75"
        />
        <path
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M6.4 10.8h2M6.4 7.6h5.2M6.4 14h1.2M15.863 2.937C14.926 2 13.417 2 10.4 2H8.8c-3.017 0-4.525 0-5.462.937C2.4 3.875 2.4 5.383 2.4 8.4v3.2c0 3.017 0 4.525.938 5.463C4.275 18 5.783 18 8.8 18h1.6c3.017 0 4.526 0 5.463-.937.755-.755.902-1.88.93-3.863"
        />
    </svg>
)

const SvgDone = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        {...props}
    >
        <path
            stroke="#fff"
            strokeWidth={1.3}
            d="M2 10c0-3.771 0-5.657 1.172-6.828C4.343 2 6.229 2 10 2c3.771 0 5.657 0 6.828 1.172C18 4.343 18 6.229 18 10c0 3.771 0 5.657-1.172 6.828C15.657 18 13.771 18 10 18c-3.771 0-5.657 0-6.828-1.172C2 15.657 2 13.771 2 10Z"
        />
        <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.3}
            d="M7.2 10.4 8.8 12l4-4"
        />
    </svg>
)