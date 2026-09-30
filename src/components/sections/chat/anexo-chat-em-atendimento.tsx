'use cliente'

import NoData from "@/components/commons/estados/NoData"
import ImageModal from "@/components/commons/modais/image-modal"
import { fetchFileMetadata } from "@/lib/file-metadata.utils"
import { formatSizeFile } from "@/lib/files.utils"
import { AtentimentoAnexosChatType } from "@/utils/types/atendimento-anexos-type"
import Link from "next/link"
import { useEffect, useState } from "react"

interface AnexosChatEmAtendimentoProps {
    anexos: AtentimentoAnexosChatType[]
}

export function AnexosChatEmAtendimento({ anexos }: AnexosChatEmAtendimentoProps) {

    const [imagens, setImagens] = useState<AtentimentoAnexosChatType[]>([])
    const [documentos, setDocumentos] = useState<AtentimentoAnexosChatType[]>([])
    const itemsImagens = 3
    const itemsDocumentos = 2
    const [paginaImagens, setPaginaImagens] = useState(1)
    const [paginaDocumentos, setPaginaDocumentos] = useState(1)
    const [imagensPagina, setImagensPagina] = useState<AtentimentoAnexosChatType[]>([])
    const [documentosPagina, setDocumentosPagina] = useState<AtentimentoAnexosChatType[]>([])
    const [indiceImagemModal, setIndiceImagemModal] = useState<number | null>(null)

    useEffect(() => {
        const anexosSemSticker = anexos.filter(
            (file) => !(file.tipoAnexo && file.tipoAnexo.toLowerCase().includes("sticker"))
        )

        const imagens = anexosSemSticker.filter(
            (file) => file.tipoAnexo && file.tipoAnexo.includes("image")
        )

        const documentos = anexosSemSticker.filter(
            (file) => file.tipoAnexo && !file.tipoAnexo.includes("image")
        )

        setImagens(imagens)
        setDocumentos(documentos)
    }, [anexos])

    useEffect(() => {
        const start = (paginaImagens - 1) * itemsImagens
        const end = start + itemsImagens
        setImagensPagina(imagens.slice(start, end))
    }, [paginaImagens, imagens])

    useEffect(() => {
        const start = (paginaDocumentos - 1) * itemsDocumentos
        const end = start + itemsDocumentos
        setDocumentosPagina(documentos.slice(start, end))
    }, [paginaDocumentos, documentos])

    const handleNextImagens = () => {
        if (paginaImagens < Math.ceil(imagens.length / itemsImagens)) {
            setPaginaImagens(paginaImagens + 1)
        }
    }

    const handlePrevImagens = () => {
        if (paginaImagens > 1) {
            setPaginaImagens(paginaImagens - 1)
        }
    }

    const handleNextDocumentos = () => {
        if (paginaDocumentos < Math.ceil(documentos.length / itemsDocumentos)) {
            setPaginaDocumentos(paginaDocumentos + 1)
        }
    }

    const handlePrevDocumentos = () => {
        if (paginaDocumentos > 1) {
            setPaginaDocumentos(paginaDocumentos - 1)
        }
    }

    return (
        <>
            {/* IMAGENS */}
            <div className="flex flex-col gap-3">
                <div className="justify-between items-start gap-4 inline-flex">
                    <div className="text-[#1b263a] text-base font-semibold font-['BR Sonoma'] leading-tight">Fotos enviadas</div>
                    <div className="justify-start items-start gap-0.5 flex">
                        <button onClick={handlePrevImagens} className="">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                className="rotate-[90deg] hover:bg-[#293856] p-0.5 hover:text-white rounded-full duration-300 ease-in-out"
                                fill="currentColor" viewBox="0 0 256 256"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                            </svg>
                        </button>
                        <button onClick={handleNextImagens} className="">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                className="rotate-[270deg] hover:bg-[#293856] p-0.5 hover:text-white rounded-full duration-300 ease-in-out"
                                fill="currentColor" viewBox="0 0 256 256"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                            </svg>
                        </button>
                    </div>

                </div>

                {imagens.length === 0 && <NoData className="min-h-[4rem] gap-1" sizeIcon={20} label="Nenhuma imagem" />}

                <div className="grid grid-cols-3 gap-1.5">
                    {imagensPagina.map((file) => {
                        const globalIndex = imagens.indexOf(file)
                        return (
                            <button
                                key={file.id}
                                onClick={() => setIndiceImagemModal(globalIndex)}
                                className="block h-16 rounded-md border border-slate-400 bg-slate-300 bg-cover bg-center"
                                style={{ backgroundImage: `url(${file.anexoMensagem})` }}
                            >
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* DOCUMENTOS */}
            <div className="flex flex-col gap-3 pt-5">
                <div className="justify-between items-start gap-4 inline-flex">
                    <div className="text-[#1b263a] text-base font-semibold font-['BR Sonoma'] leading-tight">Arquivos enviados</div>
                    <div className="justify-start items-start gap-0.5 flex">
                        <button onClick={handlePrevDocumentos} className="">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                className="rotate-[90deg] hover:bg-[#293856] p-0.5 hover:text-white rounded-full duration-300 ease-in-out"
                                fill="currentColor" viewBox="0 0 256 256"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                            </svg>
                        </button>
                        <button onClick={handleNextDocumentos} className="">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                className="rotate-[270deg] hover:bg-[#293856] p-0.5 hover:text-white rounded-full duration-300 ease-in-out"
                                fill="currentColor" viewBox="0 0 256 256"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                            </svg>
                        </button>
                    </div>

                </div>

                {documentos.length === 0 && <NoData className="min-h-[3rem] gap-1 flex-row" sizeIcon={20} label="Nenhum arquivo" />}

                <div className="grid grid-cols-2 gap-1.5">
                    {documentosPagina.map((file) => {
                        return (
                            <AnexoDocumento key={file.id} {...file} />
                        )
                    })}
                </div>
            </div>

            {indiceImagemModal !== null && typeof window !== 'undefined' && (
                <ImageModal idSelector={"content-container"} onClose={() => setIndiceImagemModal(null)}>
                    <div className="w-full relative flex items-center justify-center gap-4">
                        {/* Botão imagem anterior */}
                        {imagens.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setIndiceImagemModal((prev) =>
                                        prev !== null ? (prev - 1 + imagens.length) % imagens.length : prev
                                    )
                                }
                                className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" className="rotate-90" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80A8 8 0 0 1 53.66 90.34L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" /></svg>
                            </button>
                        )}

                        {/* Imagem */}
                        <div className="max-h-[80vh] max-w-full">
                            <img
                                src={imagens[indiceImagemModal].anexoMensagem}
                                alt="Imagem anexada"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Botão próxima imagem */}
                        {imagens.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setIndiceImagemModal((prev) =>
                                        prev !== null ? (prev + 1) % imagens.length : prev
                                    )
                                }
                                className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" className="-rotate-90" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80A8 8 0 0 1 53.66 90.34L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" /></svg>
                            </button>
                        )}
                    </div>
                </ImageModal>
            )}
        </>
    )
}

export function AnexoDocumento({ anexoMensagem, tipoAnexo }: AtentimentoAnexosChatType) {
    const [nome, setNome] = useState('documento');
    const [tamanho, setTamanho] = useState(0);

    const loadFileMetadata = async () => {
        const metadata = await fetchFileMetadata(anexoMensagem, "documento");
        setNome(metadata.nome);
        setTamanho(metadata.tamanho);
    };

    useEffect(() => {
        if (anexoMensagem) {
            loadFileMetadata();
        }
    }, [anexoMensagem]);


    return (
        <Link target="_blank" href={anexoMensagem} className="w-full flex p-2 bg-[#f1f3f6] rounded items-center justify-between gap-1.5">

            <div className="flex gap-2 items-center w-full truncate">
                <div className="w-8 h-8 flex items-center justify-center">
                    {tipoAnexo === "application/pdf" ? <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="bxs:file-pdf">
                            <path id="Vector" d="M9.64494 17.5798C9.43027 17.5798 9.2856 17.6008 9.21094 17.6218V18.9961C9.2996 19.0171 9.41044 19.0229 9.56327 19.0229C10.1221 19.0229 10.4663 18.7406 10.4663 18.2634C10.4663 17.8364 10.1699 17.5798 9.64494 17.5798ZM13.7131 17.5938C13.4798 17.5938 13.3281 17.6148 13.2383 17.6358V20.6808C13.3281 20.7018 13.4728 20.7018 13.6034 20.7018C14.5566 20.7088 15.1773 20.1838 15.1773 19.0731C15.1843 18.1048 14.6184 17.5938 13.7131 17.5938Z" fill="#D36060" />
                            <path id="Vector_2" d="M16.3337 2.78662H7.00033C6.38149 2.78662 5.78799 3.03245 5.35041 3.47004C4.91282 3.90762 4.66699 4.50112 4.66699 5.11995V23.7866C4.66699 24.4055 4.91282 24.999 5.35041 25.4365C5.78799 25.8741 6.38149 26.12 7.00033 26.12H21.0003C21.6192 26.12 22.2127 25.8741 22.6502 25.4365C23.0878 24.999 23.3337 24.4055 23.3337 23.7866V9.78662L16.3337 2.78662ZM11.0813 19.3416C10.7208 19.68 10.1888 19.8316 9.56932 19.8316C9.44921 19.8329 9.32914 19.8259 9.20999 19.8106V21.4743H8.16699V16.8823C8.63769 16.8121 9.1133 16.7801 9.58916 16.7866C10.239 16.7866 10.701 16.9103 11.0125 17.1588C11.3088 17.3945 11.5095 17.7806 11.5095 18.2356C11.5083 18.693 11.3567 19.0791 11.0813 19.3416ZM15.5228 20.9225C15.0328 21.3296 14.2873 21.5233 13.3762 21.5233C12.8302 21.5233 12.444 21.4883 12.1815 21.4533V16.8835C12.6524 16.8147 13.1278 16.7824 13.6037 16.7866C14.4868 16.7866 15.0608 16.9453 15.5088 17.2836C15.993 17.643 16.2963 18.2158 16.2963 19.0383C16.2963 19.9285 15.9708 20.5433 15.5228 20.9225ZM19.8337 17.685H18.0463V18.7478H19.717V19.6041H18.0463V21.4755H16.9893V16.8216H19.8337V17.685ZM16.3337 10.9533H15.167V5.11995L21.0003 10.9533H16.3337Z" fill="#D36060" />
                        </g>
                    </svg> :

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 32 32">
                            <path fill="#788795" d="M18.7,2.7h-10.7c-.7,0-1.4.3-1.9.8-.5.5-.8,1.2-.8,1.9v21.3c0,.7.3,1.4.8,1.9.5.5,1.2.8,1.9.8h16c.7,0,1.4-.3,1.9-.8.5-.5.8-1.2.8-1.9V10.7L18.7,2.7ZM18.7,12h-1.3v-6.7l6.7,6.7h-5.3Z" />
                        </svg>}
                </div>

                <div className="flex-col justify-start items-start inline-flex w-full truncate">
                    <div className="text-[#1b263a] text-xs font-semibold font-['BR Sonoma'] leading-none w-full truncate">{nome}</div>
                    <div className="text-[#485b7f] text-xs font-medium font-['BR Sonoma'] leading-none">{formatSizeFile(tamanho)}</div>
                </div>
            </div>

            <div className="w-6 h-6 flex items-center justify-center">
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="&#195;&#141;cones 16">
                        <path id="Vector" d="M14 10.4531V13.1198C14 13.4734 13.8595 13.8126 13.6095 14.0626C13.3594 14.3126 13.0203 14.4531 12.6667 14.4531H3.33333C2.97971 14.4531 2.64057 14.3126 2.39052 14.0626C2.14048 13.8126 2 13.4734 2 13.1198V10.4531M4.66667 7.11979L8 10.4531M8 10.4531L11.3333 7.11979M8 10.4531V2.45312" stroke="#485B80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </svg>
            </div>
        </Link>
    )
}