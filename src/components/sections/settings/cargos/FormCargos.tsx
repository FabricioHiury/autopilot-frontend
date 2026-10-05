'use client';

import ButtonSave from '@/components/commons/buttons/button-save';
import InputRadioOption from '@/components/commons/inputs/input-radio-option';
import { Label } from '@/components/commons/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppServices } from '@/services/app.services';
import { StorePermissionLabels } from '@/types/permissions';
import { useState } from 'react';
import { AlertDialog } from '@/components/commons/modais/alert-dialog';
import { ConfirmDialog } from '@/components/commons/modais/confirm-dialog';

interface FormCargosProps {
  id: string | null;
  role: string;
  features: string[];
  onCancelar?: () => void;
  onExcluir?: () => void;
  onSalvar?: () => void;
}

export function FormCargos(props: FormCargosProps) {
  const api = new AppServices();
  const permissions = Object.entries(StorePermissionLabels).map((value) => {
    return {
      id: value[0],
      name: value[1],
    };
  });

  const [idCargo, setIdCargo] = useState<string | null>(props.id);
  const [nomeCargo, setNomeCargo] = useState(props.role);
  const [permissoesCargo, setPermissoesCargo] = useState<string[]>(props.features);
  const [loading, setLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    message: string;
    variant: 'info' | 'error' | 'success' | 'warning';
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleChangePermissao = (permission: string) => {
    if (permissoesCargo.includes(permission)) {
      setPermissoesCargo(permissoesCargo.filter((item) => item !== permission));
    } else {
      setPermissoesCargo([...permissoesCargo, permission]);
    }
  };

  const handleSave = async () => {
    if (!nomeCargo || nomeCargo === '') {
      setAlertDialog({ message: 'O nome do cargo é obrigatório.', variant: 'warning' });
      return;
    }

    setLoading(true);
    const [response, error] = await api.role.save(nomeCargo, permissoesCargo, idCargo || undefined);

    if (error) {
      setAlertDialog({ message: error.message, variant: 'error' });
      setLoading(false);
      return;
    }

    if (response) {
      setLoading(false);
      if (props.onSalvar) {
        props.onSalvar();
      }
    }
  };

  const handleCancel = () => {
    if (props.onCancelar) {
      props.onCancelar();
    }
  };

  const handleDelete = async () => {
    if (!idCargo) {
      return;
    }

    setConfirmDialog({
      message: 'Tem certeza que deseja excluir este cargo?',
      onConfirm: async () => {
        setLoading(true);
        const [_, error] = await api.role.delete(idCargo || '');
        if (error) {
          setAlertDialog({ message: error.message, variant: 'error' });
          setLoading(false);
          return;
        }

        setLoading(false);
        if (props.onExcluir) {
          props.onExcluir();
        }
      },
    });
  };

  return (
    <div>
      <h2 className="text-[#283855] text-xl font-semibold leading-snug">
        {idCargo ? 'Editar Cargo' : 'Adicionar Cargo'}
      </h2>

      <div className="text-sm text-[#434d56] grid grid-cols-[1.5rem,1fr] gap-2 hyphens-auto py-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
        </svg>
        Os cargos são utilizados para identificação das funções de cada colaborador dentro da sua
        loja, porém sua criação, edição ou exclusão não interferem nas permissões de acesso dos
        usuários existentes.
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>Nome do cargo</Label>
          <Input
            placeholder="ex. Vendedor"
            className="bg-white"
            value={nomeCargo}
            onChange={(e) => setNomeCargo(e.target.value)}
          />
        </div>

        <div>
          <Label>Permissões padrão do cargo</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => setPermissoesCargo(Object.keys(StorePermissionLabels))}
          >
            Selecionar todas
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex gap-2 items-center justify-start text-sm">
                <InputRadioOption
                  id={permission.id}
                  selected={permissoesCargo.includes(permission.id)}
                  onChange={() => handleChangePermissao(permission.id)}
                />
                <label htmlFor={permission.id}>{permission.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex items-center justify-between mt-3">
          <div>
            {idCargo && (
              <Button
                variant="outline"
                className="h-12 px-[1.875rem] border-transparent text-red-600 shadow-none"
                onClick={handleDelete}
                disabled={loading}
              >
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-3 w-2/3 justify-end">
            <Button
              variant="outline"
              className="h-12 px-[1.875rem] border-transparent shadow-none"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <ButtonSave onClick={handleSave} disabled={loading} />
          </div>
        </div>
      </div>

      {alertDialog && (
        <AlertDialog
          message={alertDialog.message}
          variant={alertDialog.variant}
          onClose={() => setAlertDialog(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          variant="danger"
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
