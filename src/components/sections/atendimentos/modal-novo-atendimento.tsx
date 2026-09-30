"use client";
import ButtonAdd from "@/components/commons/buttons/button-add";
import SideModal from "@/components/commons/modais/side-modal";
import ConfirmationModal from "@/components/commons/modais/confirmation-modal";
import { useState } from "react";
import { ConteudoNovoAtendimento } from "./conteudo-novo-atendimento";

interface ModalNovoAtendimentoProps {
    onCreated?: () => void;
}

export function ModalNovoAtendimento ({ onCreated }: ModalNovoAtendimentoProps) {

    const [open, setOpen] = useState(false);
    const [distribuicaoAutomaticaAtiva, setDistribuicaoAutomaticaAtiva] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleCloseRequest = () => {
        setShowConfirmModal(true);
    }

    const handleConfirmClose = () => {
        setShowConfirmModal(false);
        handleClose();
    }

    const handleCancelClose = () => {
        setShowConfirmModal(false);
    }

    const onSucess = () => {
        handleClose()
        onCreated?.()
    }

    const handleDistribuicaoAutomaticaChange = (isActive: boolean) => {
        setDistribuicaoAutomaticaAtiva(isActive);
    }

    return (
        <>
            <ButtonAdd title="Novo atendimento" onClick={handleOpen} />
            {open && (
                <SideModal 
                    onClose={handleCloseRequest} 
                    idSelector="content-container"
                    className={distribuicaoAutomaticaAtiva ? "lg:w-[450px]" : "lg:w-[600px]"}
                    allowClickOutsideToClose={false}
                >
                    <ConteudoNovoAtendimento 
                        onCancel={handleCloseRequest}
                        onSucess={onSucess}
                        onDistribuicaoAutomaticaChange={handleDistribuicaoAutomaticaChange}
                        initialData={{ atendimentoManual: true }}
                        onForceClose={handleClose}
                    />
                </SideModal>
            )}
            
            <ConfirmationModal
                isOpen={showConfirmModal}
                title="Você tem informações não salvas"
                message="Deseja realmente sair? Todas as informações preenchidas serão perdidas."
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
            />
        </>
    )
}


function ButtonTipoAtendimento({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button className="flex text-sm gap-1 items-center p-1.5 px-2 rounded-[.25rem] transition-colors text-[#7F8999] bg-transparent data-[active=true]:text-white data-[active=true]:bg-[#0F1522] data-[active=true]:font-semibold"  data-active={active} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </button>
    );
}