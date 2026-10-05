'use client';

import CenterModal from '@/components/commons/modais/center-modal';
import { Button } from '@/components/ui/button';
import api from '@/utils/classes/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function RemoverOlxIntegracao() {
  const [confirmacao, setConfirmacao] = useState<boolean>(false);

  const handleRemover = async () => {
    const [response, error] = await api.delete(`/integrations/olx/remove`);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (response) {
      toast.success('Integração removida com sucesso');
      setConfirmacao(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-0 ">
        <b className="text-[16px] pb-4">Sua conta está integrada ao OLX</b>

        <div className="flex w-full justify-between items-center gap-4 border border-[#D9D9D9] rounded-[0.5rem] p-4">
          <div className="flex-1">
            <p className="text-xs">Para remover a integração presione o botão ao lado.</p>
          </div>
          <button
            onClick={() => {
              setConfirmacao(true);
            }}
            className="text-primary-foreground bg-[hsl(var(--primary))] rounded-full p-3 px-4 flex items-center justify-center font-semibold text-sm"
          >
            Desconectar
          </button>
        </div>
      </div>

      {confirmacao && (
        <CenterModal onClose={() => setConfirmacao(false)}>
          <div className="flex flex-col gap-4">
            <h3 className="text-[hsl(var(--secondary))] font-semibold text-[1.5rem]">
              Deseja remover a integração?
            </h3>
            <p className="text-[#657380] text-[1rem]">
              Após a remoção não será possível a comunicação entre a sua conta da OLX e a AutoPilot.
            </p>
            <div className="flex gap-4 justify-end">
              <Button onClick={() => setConfirmacao(false)} className="btn-cancelar">
                Cancelar
              </Button>
              <Button onClick={handleRemover} className="btn-excluir">
                Remover
              </Button>
            </div>
          </div>
        </CenterModal>
      )}
    </>
  );
}
