'use client';

import SideModal from '@/components/commons/modais/side-modal';
import { ModalTitle } from '@/components/commons/modal-title';
import NewCustomerForm from '@/components/sections/customers/NewCustomerForm';
import { useObserver } from '@/contexts/observer.context';
import { Customer } from '@/types/customer-details';
import { useEffect, useState } from 'react';

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { observer, setObserver } = useObserver();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<Customer>();

  useEffect(() => {
    if (observer.type === 'abrirPopClienteNovo') {
      setIsEditing(false);
      setIsModalOpen(true);
      setCustomerData(undefined);
    } else if (observer.type === 'abrirPopClienteEditar') {
      setCustomerData(observer.data);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  }, [observer]);

  function closeModal() {
    setIsModalOpen(false);

    setObserver((current: typeof observer) =>
      current.type.startsWith('abrirPopCliente') ? { type: '', data: undefined } : current,
    );
  }

  return (
    <>
      {children}
      {isModalOpen && (
        <SideModal onClose={closeModal}>
          <ModalTitle
            title={isEditing ? 'Editar Cliente' : 'Adicionar novo cliente'}
            onClose={closeModal}
          />
          <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2] my-4">
            <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
          </div>
          <NewCustomerForm
            editing={isEditing}
            data={customerData}
            onExitPop={closeModal}
          />
        </SideModal>
      )}
    </>
  );
}
