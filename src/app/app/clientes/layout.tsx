"use client";

import SideModal from "@/components/commons/modais/side-modal";
import { ModalTitle } from "@/components/commons/modal-title";
import NewCustomerForm from "@/components/sections/clientes/NewCustomerForm";
import { useObserver } from "@/contexts/observer.context";
import { Cliente } from "@/utils/types/cliente.type";
import { useEffect, useState } from "react";

export default function CustomerLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const { observer, setObserver } = useObserver();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [customerData, setCustomerData] = useState<Cliente>();

    useEffect(() => {
        if (observer.tipo === "abrirPopClienteNovo") {
            setIsEditing(false);
            setIsModalOpen(true);
            setCustomerData(undefined);
        } else if (observer.tipo === "abrirPopClienteEditar") {
            setCustomerData(observer.data);
            setIsEditing(true);
            setIsModalOpen(true);
        }
    }, [observer]);

    function closeModal() {
        setIsModalOpen(false);

        setTimeout(() => {
            setObserver({
                tipo: "",
                data: undefined,
            });
        }, 0);
    }

    return (
        <>
            {children}
            {isModalOpen && (
                <SideModal onClose={closeModal}>
                    <ModalTitle
                        title={isEditing ? "Editar Cliente" : "Adicionar novo cliente"}
                        onClose={closeModal}
                    />
                    <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2] my-4">
                        <div className="w-[7rem] h-1.5 rounded-full bg-[#D33632]"></div>
                    </div>
                    <NewCustomerForm
                        editing={isEditing}
                        data={customerData}
                        onExitPop={closeModal}
                        onNewCustomer={closeModal}
                    />
                </SideModal>
            )}
        </>
    );
}
