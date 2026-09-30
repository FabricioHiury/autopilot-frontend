"use client"
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal"
import Input from "@/components/inputs/text/Input"
import Spinner from "@/components/loading/Spinner"
import { getStoreStorageId } from "@/lib/user.utils"
import api from "@/utils/classes/api"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"

interface OlxIntegrationState {
    loading: boolean;
    isSubmitting: boolean;
    clientId: string;
    clientSecret: string;
    linkRedirect?: string;
    storeName: string;
}

export default function OlxIntegracao() {
    const [state, setState] = useState<OlxIntegrationState>({
        loading: true,
        isSubmitting: false,
        clientId: "",
        clientSecret: "",
        storeName: '[NOME DA SUA LOJA]'
    });

    const fetchIntegrationInfo = useCallback(async () => {
        try {
            const [response, error] = await api.get("/integracao/olx-link-redirect");

            if (!response || error) {
                toast.error('Erro ao carregar o link de redirecionamento');
                return;
            }

            const { data } = response.data;
            setState(prev => ({ ...prev, linkRedirect: data }));
        } catch (error) {
            console.error("Error fetching integration info:", error);
            toast.error('Erro ao carregar informações de integração');
        }
    }, []);

    const fetchStoreInfo = useCallback(async () => {
        try {
            const [response, error] = await api.get("/loja");

            if (error) {
                toast.error('Erro ao carregar informações da loja');
                return;
            }

            const { nomeEmpresa } = response.data;

            if (nomeEmpresa) {
                setState(prev => ({ ...prev, storeName: nomeEmpresa }));
            } else {
                toast.error('Não foi possível identificar o nome da loja');
            }
        } catch (error) {
            console.error("Error fetching store info:", error);
            toast.error('Erro ao carregar informações da loja');
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setState(prev => ({ ...prev, loading: true }));
            await Promise.all([fetchIntegrationInfo(), fetchStoreInfo()]);
            setState(prev => ({ ...prev, loading: false }));
        };

        loadInitialData();

        return () => { };
    }, [fetchIntegrationInfo, fetchStoreInfo]);

    const handleInputChange = useCallback((field: 'clientId' | 'clientSecret', value: string) => {
        setState(prev => ({ ...prev, [field]: value.trim() }));
    }, []);

    const validateForm = useCallback((): string | null => {
        const { clientId, clientSecret } = state;

        if (!clientId.trim()) return "Client ID é obrigatório";
        if (!clientSecret.trim()) return "Client Secret é obrigatório";
        if (clientId.length < 5) return "Client ID inválido";
        if (clientSecret.length < 5) return "Client Secret inválido";

        return null;
    }, [state]);

    const handleSubmit = useCallback(async () => {
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setState(prev => ({ ...prev, isSubmitting: true }));
            const { clientId, clientSecret } = state;
            const storeId = getStoreStorageId();
    
            if (!storeId) {
                toast.error("ID da loja não encontrado");
                setState(prev => ({ ...prev, isSubmitting: false }));
                return;
            }
    
            const [response, error] = await api.put("/integracao/olx", {
                clientId: clientId.trim(),
                clientSecret: clientSecret.trim(),
                storeId: storeId
            });
    
            if (error) {
                console.error("Integration error:", error);
                
                if (error.status === 403) {
                    toast.error("Para usar esta integração, você precisa de uma assinatura ativa. Acesse a página de assinaturas para contratar um plano.");
                    setState(prev => ({ ...prev, isSubmitting: false }));
                    return;
                }
                
                toast.error("Erro ao realizar integração. Tente novamente.");
                setState(prev => ({ ...prev, isSubmitting: false }));
                return;
            }
    
            if (!response?.data?.data) {
                toast.error("Resposta inválida do servidor");
                setState(prev => ({ ...prev, isSubmitting: false }));
                return;
            }
    
            window.location.href = response.data.data;
        } catch (error) {
            console.error("Integration submission error:", error);
            toast.error("Erro inesperado ao realizar integração");
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [state, validateForm]);

    const copyToClipboard = useCallback((text: string) => {
        try {
            navigator.clipboard.writeText(text);
            toast.success("Texto copiado com sucesso");
        } catch (error) {
            console.error("Copy to clipboard error:", error);
            toast.error("Não foi possível copiar o texto");
        }
    }, []);

    const renderIntegrationForm = useCallback(() => (
        <>
            <div className="flex mt-3 gap-6 w-full">
                <Input
                    label="Client ID"
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    value={state.clientId}
                    placeholder="Seu Client ID"
                />
                <Input
                    label="Client Secret"
                    onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                    value={state.clientSecret}
                    placeholder="Seu Client Secret"
                />
            </div>
            <div className="flex w-full justify-between items-center mt-4 mb-6">
                <button
                    disabled={state.isSubmitting}
                    onClick={handleSubmit}
                    className="text-white bg-[#1B2841] rounded-lg p-3 px-4 flex items-center justify-center font-semibold text-[14px]"
                >
                    {!state.isSubmitting ? "Fazer integração" : <Spinner width="22px" color="white" />}
                </button>
            </div>
        </>
    ), [state.clientId, state.clientSecret, state.isSubmitting, handleInputChange, handleSubmit]);

    const templateText = useCallback(() => (
        `Prezados,

Solicito a integração da nossa plataforma com a OLX API, seguindo as informações abaixo:

DADOS DO SOLICITANTE:
• Nome da Empresa: ${state.storeName}
• Website: https://autopilot.com.br
• Email de Contato: [INSIRA SEU EMAIL COMERCIAL AQUI]

DADOS DA APLICAÇÃO:
• Nome da Aplicação: AutoPilot App - ${state.storeName}
• Tipo de Negócio: Marketplace de veículos
• Descrição: Plataforma especializada em gerenciamento e publicação de anúncios de veículos novos e usados
• Categoria Principal: Automóveis
• Finalidade da Integração: Publicação automática de anúncios e sincronização de estoque

DADOS TÉCNICOS:
• URI de Redirecionamento: ${state.linkRedirect}

Ficamos à disposição para quaisquer esclarecimentos adicionais que se façam necessários.

Atenciosamente,
Equipe ${state.storeName}`
    ), [state.storeName, state.linkRedirect]);

    const renderInstructions = useCallback(() => (
        <div className="flex mt-6 text-[14px] flex-col gap-5 pb-8">
            <h2 className="text-[18px] font-bold">Instruções para obtenção do "Client ID" e "Client Secret"</h2>
            <h3 className="text-[16px] font-bold">1. Enviando o e-mail</h3>

            <p>
                Envie um email para{" "}
                <button
                    className="text-red-600 cursor-pointer"
                    onClick={() => copyToClipboard("suporteintegrador@olxbr.com")}
                >
                    suporteintegrador@olxbr.com
                </button>{" "}
                com o assunto e corpo do e-mail contendo as seguintes informações:
            </p>

            {state.linkRedirect ? (
                <div>
                    <p className="text-xs">Assunto:</p>
                    <div
                        className="w-full h-fit bg-white border border-[#D9D9D9] rounded-lg p-4 py-2 mb-6 cursor-pointer"
                        onClick={() => copyToClipboard(`Solicitação de Integração - ${state.storeName} (AutoPilot App)`)}
                    >
                        {`Solicitação de Integração - ${state.storeName} (AutoPilot App)`}
                    </div>

                    <p className="text-xs">Corpo de e-mail:</p>
                    <div
                        className="w-full h-fit border border-[#D9D9D9] bg-white rounded-lg p-4 whitespace-pre-wrap cursor-pointer"
                        onClick={() => copyToClipboard(templateText())}
                    >
                        {templateText()}
                    </div>
                </div>
            ) : (
                <LoadingGlobal />
            )}

            <p>
                Certifique-se de preencher os campos corretamente antes de enviar o email.
                A equipe da OLX entrará em contato para confirmar a integração ou solicitar informações adicionais.
            </p>

            <h3 className="text-[16px] font-bold">2. Retorno da OLX</h3>

            <p>A equipe da OLX responderá o seu e-mail com as informações do "Client Id" e "Client Secret".</p>

            <div>
                <p className="text-xs">Exemplo da resposta:</p>
                <div className="w-full h-fit border border-[#D9D9D9] bg-white rounded-lg p-4 whitespace-pre-wrap">
                    Olá!<br />
                    <br />
                    A integração via API está homologada para o seu software. Segue abaixo os dados para prosseguir com a validação:<br />
                    <br />
                    Client ID: <span className="bg-red-600 text-white font-semibold px-1">[SEU CLIENT ID ESTARÁ AQUI]</span><br />
                    Client Secret: <span className="bg-red-600 text-white font-semibold px-1">[SEU CLIENT SECRET ESTARÁ AQUI]</span><br />
                    Redirect URL 1: {state.linkRedirect}<br />
                    <br />
                    Qualquer dúvida, consulte nosso Manual de Integração. Nosso time de especialistas também está disponível pelo chat!<br />
                    <br />
                    João Silva.<br />
                    Integração Grupo OLX<br />
                </div>
            </div>

            <p>Copie os valores do "Client ID" e "Client Secret" e insira nos campos solicitados para integração aqui na AutoPilot.</p>

            <p>
                Em caso de dúvidas, consulte nossa{" "}
                <Link href={'/app/ajuda-e-faq/duvidas'} className="text-red-600">
                    seção de suporte
                </Link>.
            </p>
        </div>
    ), [state.linkRedirect, state.storeName, copyToClipboard, templateText]);

    if (state.loading) {
        return <LoadingGlobal />;
    }

    return (
        <div className="flex flex-col gap-0">
            <h1 className="text-[16px] font-bold">Envie os dados para integrar com a OLX</h1>

            <p className="text-xs pt-4">
                Informe o "Client ID" e o "Client Secret" enviados pela OLX para o seu e-mail.
                Em caso de dúvida siga as instruções abaixo para solicitar essas informações.
            </p>

            {renderIntegrationForm()}
            {renderInstructions()}
        </div>
    );
}