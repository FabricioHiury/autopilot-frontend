"use client";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import { Button } from "@/components/ui/button";
import { getStoreStorageId } from "@/lib/user.utils";
import api from "@/utils/classes/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/commons/modais/confirm-dialog";

function ForceRemoveButton() {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const handleForceRemove = async () => {
    setLoading(true);

    try {
      const [response, error] = await api.delete(`/integracao/whatsapp/remover`);

      if (error) {
        toast.error(error.message || 'Erro ao remover integração');
        return;
      }

      toast.success('Integração do WhatsApp removida com sucesso!');

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      toast.error('Erro inesperado ao remover integração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setConfirmDialog({
            message: "Tem certeza que deseja desvincular forçadamente a integração do WhatsApp?\n\nEsta ação não pode ser desfeita.",
            onConfirm: handleForceRemove
          });
        }}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {loading ? "Removendo..." : "Desvincular Forçadamente"}
      </Button>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          variant="danger"
          confirmText="Desvincular"
          cancelText="Cancelar"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  );
}

export default function WhatsappIntegracao() {
  const [qr, setQr] = useState();
  const [error, setError] = useState();
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const router = useRouter();

  async function loadQr() {
    if (!loading) {
      setReloading(true);
    }

    const [response, error] = await api.put(`/integracao/whatsapp`, {
      storeId: getStoreStorageId(),
    });

    if (error) {
      if (error.statusCode === 403) {
        let errorMessage = error.message;

        try {
          const parsedMessage = JSON.parse(errorMessage);
          errorMessage = parsedMessage.message || errorMessage;
        } catch {
        }

        if (errorMessage.includes("assinatura ativa")) {
          setNeedsSubscription(true);
        } else {
          setError(errorMessage);
        }
      } else {
        setError(error.message);
      }
      setLoading(false);
      setReloading(false);
      return;
    }
    setQr(response.data.qrCode.base64);
    setLoading(false);
    setReloading(false);
    console.log(response.data);
  }

  const handlePronto = () => {
    setQr(undefined);
    router.push("/app/configuracoes/integracoes");
  };

  useEffect(() => {
    loadQr();
  }, []);

  if (loading) {
    return <LoadingGlobal />;
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
            Para conectar sua conta do WhatsApp e aproveitar todos os recursos de integração,
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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[18px] font-bold">
          Não foi possível carregar seu QR Code
        </p>
        <p>
          A instância de integração do Whatsapp Web não está disponível para
          esta conta.
        </p>
        <p>
          Entre em contato com{" "}
          <Link href={"/app/ajuda-e-faq/duvidas"} className="text-red-600">
            nosso suporte
          </Link>{" "}
          para mais informações.
        </p>
        <p className="text-xs">{error}</p>
        
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-red-500 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">Problemas com a integração?</h4>
              <p className="text-sm text-red-700 mb-3">
                Se você está enfrentando problemas persistentes, pode tentar desvincular forçadamente a integração do WhatsApp.
              </p>
              <ForceRemoveButton />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {qr && (
        <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Conecte a sua conta de WhatsApp:</h2>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center gap-2">
                {reloading ? (
                  <div className="w-[220px] h-[220px] flex items-center justify-center">
                    <LoadingGlobal />
                  </div>
                ) : (
                  <img src={qr} width={220} alt="QR Code" className="rounded-md" />
                )}
                <button
                  onClick={loadQr}
                  className="text-sm mt-2 text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                  disabled={reloading}
                >
                  <i className={`bx bx-refresh text-lg text-green-600 ${reloading ? 'animate-spin' : ''}`}></i>
                  {reloading ? "Recarregando..." : "Recarregar QR Code"}
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex gap-3">
                  <div className="text-blue-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Importante:</p>
                    <p className="text-sm text-blue-600">
                      Clique em "Pronto" apenas quando o WhatsApp no seu celular mostrar que o dispositivo foi conectado com sucesso e estiver com status "Ativo".
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePronto}
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Pronto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
