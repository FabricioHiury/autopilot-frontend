"use client"

import { Button } from "@/components/ui/button";
import { getStoreStorageId } from "@/lib/user.utils";
import api from "@/utils/classes/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/commons/modais/confirm-dialog";

export function RemoverWhatsAppIntegracao() {
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

    const handleRemoveIntegration = async () => {
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
        <div className="flex flex-col gap-4">
            <b className="text-[16px]">Sua conta está integrada ao Whatsapp</b>

            <div className="flex w-full justify-between items-center gap-4 border border-[#D9D9D9] rounded-[0.5rem] p-4">
                <div className="flex-1">
                    <p className="text-sm mb-2">Integração ativa e funcionando.</p>
                    <p className="text-xs text-gray-600">Para remover a integração, você pode revogar o acesso nas configurações do seu aplicativo (dispositivos conectados) ou usar o botão abaixo para deletar todos os dados de conexão do sistema.</p>
                </div>
                <div className="flex-shrink-0">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setConfirmDialog({
                                message: 'Tem certeza que deseja remover a integração do WhatsApp?\n\nTodos os dados de conexão serão deletados do sistema.',
                                onConfirm: handleRemoveIntegration
                            });
                        }}
                        disabled={loading}
                        size="sm"
                    >
                        {loading ? 'Removendo...' : 'Remover Integração'}
                    </Button>
                </div>
            </div>

            {confirmDialog && (
                <ConfirmDialog
                    message={confirmDialog.message}
                    variant="danger"
                    confirmText="Remover"
                    cancelText="Cancelar"
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    )
}