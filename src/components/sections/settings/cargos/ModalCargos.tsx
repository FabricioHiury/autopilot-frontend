'use client';

import ButtonCircle from '@/components/commons/buttons/button-circle/button-circle';
import SideModal from '@/components/commons/modais/side-modal';
import { ModalTitle } from '@/components/commons/modal-title';
import { useEffect, useState } from 'react';
import { FormCargos } from './FormCargos';
import { ListCargos } from './ListCargos';
import { RoleDetails, Role } from '@/types/role';
import { AppServices } from '@/services/app.services';
import { AlertDialog } from '@/components/commons/modais/alert-dialog';

export function ModalCargos() {
  const api = new AppServices();
  const [open, setOpen] = useState(false);
  const [roles, setCargos] = useState<RoleDetails[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<Role | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    message: string;
    variant: 'info' | 'error' | 'success' | 'warning';
  } | null>(null);

  const fetchCargos = async () => {
    const [response, error] = await api.role.list();
    if (error) {
      setAlertDialog({ message: error.message, variant: 'error' });
      return;
    }
    if (response) {
      setCargos(response);
    }
  };

  const handleNewCargo = () => {
    setSelectedCargo({
      id: null,
      role: '',
      features: [],
    });
  };

  const handleEditCargo = (role: Role) => {
    setSelectedCargo(role);
  };

  const onCargosChange = async () => {
    await fetchCargos();
    setSelectedCargo(null);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  return (
    <>
      <ButtonCircle icon={<IconCargo />} onClick={handleOpen} />

      {open && (
        <SideModal onClose={handleClose} idSelector="content-container">
          <div className="flex flex-col gap-5 pb-8">
            <div className="flex justify-start gap-2 flex-shrink-0 items-center">
              <ModalTitle title="Configuração de Cargos" onClose={handleClose} />
            </div>

            <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
              <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
            </div>

            <div>
              {selectedCargo ? (
                <FormCargos
                  onExcluir={onCargosChange}
                  onCancelar={() => setSelectedCargo(null)}
                  onSalvar={onCargosChange}
                  {...selectedCargo}
                />
              ) : (
                <ListCargos
                  roles={roles}
                  onNovoCargo={handleNewCargo}
                  onSelecionarCargo={handleEditCargo}
                />
              )}
            </div>
          </div>
        </SideModal>
      )}

      {alertDialog && (
        <AlertDialog
          message={alertDialog.message}
          variant={alertDialog.variant}
          onClose={() => setAlertDialog(null)}
        />
      )}
    </>
  );
}

const IconCargo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H216a8,8,0,0,0,0-16H115.32l112-112A16,16,0,0,0,227.32,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"></path>
    </svg>
  );
};
