"use client"
import Spinner from "@/components/loading/Spinner"
import { getStoreStorageId } from "@/lib/user.utils"
import api from "@/utils/classes/api"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

export default function InstagramIntegracao() {

    const [loading, setLoading] = useState<boolean>(false)
    const [needsSubscription, setNeedsSubscription] = useState(false)

    async function cadastrar() {
        setLoading(true)
        const [response, error] = await api.put(`/integracao/instagram`, {
            storeId: getStoreStorageId()
        })
        if (error) {
            setLoading(false)
            if (error.statusCode === 403 || error.status === 403) {
                let errorMessage = error.message;
                try {
                    const parsedMessage = JSON.parse(errorMessage);
                    errorMessage = parsedMessage.message || errorMessage;
                } catch {
                }
                
                if (errorMessage.includes("assinatura ativa")) {
                    setNeedsSubscription(true)
                    return;
                } else {
                    toast.error(errorMessage)
                }
            } else {
                toast.error(error.message || "Erro ao conectar com Instagram")
            }
            return;
        }
        window.location.href = response.data.url
    }

    if (needsSubscription) {
        return (
            <div className="flex flex-col gap-6 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-amber-800">Assinatura Necessária</h3>
                        <p className="text-amber-700">É necessária uma assinatura ativa para usar as integrações.</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <p className="text-sm text-amber-700">
                        Para conectar sua conta do Instagram e aproveitar todos os recursos de integração, 
                        você precisa ter uma assinatura ativa.
                    </p>
                    
                    <div className="flex gap-3">
                        <Link href="/app/assinaturas">
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                Ver Planos e Assinar
                            </Button>
                        </Link>
                        <Link href="/app/configuracoes/integracoes">
                            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-0 ">
            <b className="text-[16px]">Faça login no instagram</b>

            <div className="flex w-full justify-between items-center mt-4 mb-6">
                <button disabled={loading}
                    onClick={() => cadastrar()}
                    className="text-white bg-[#1B2841] rounded-lg p-3 px-4 flex items-center justify-center font-semibold text-[14px]">
                    {!loading
                        ?
                        "Fazer login"
                        :
                        <Spinner width="22px" color="white" />
                    }
                </button>

            </div>

        </div>
    )
}