'use client';
import { useState } from 'react';
import { ConteudoNovaSuspensao } from './conteudo-nova-suspensao';
import SideModal from '@/components/commons/modais/side-modal';
import ButtonAdd from '@/components/commons/buttons/button-add';

interface ModalNovaSuspensaoProps {
  onCreated?: () => void;
}

export function ModalNovaSuspensao({ onCreated }: ModalNovaSuspensaoProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSucess = () => {
    handleClose();
    if (onCreated) {
      onCreated();
    }
  };

  return (
    <>
      <ButtonAdd title="Nova suspensão" onClick={handleOpen} />
      {open && (
        <SideModal onClose={handleClose} idSelector="content-container">
          <ConteudoNovaSuspensao onCancel={handleClose} onSucess={onSucess} />
        </SideModal>
      )}
    </>
  );
}
