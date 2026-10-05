'use client';
import { roleLabel } from '@/lib/presentation-labels';
import ButtonAdd from '@/components/commons/buttons/button-add';
import { IconEdit } from '@/components/icons/icon-edit';
import { RoleDetails, Role } from '@/types/role';
import { StorePermissionLabels } from '@/types/permissions';

interface ListCargosProps {
  roles: RoleDetails[];
  onSelecionarCargo: (role: Role) => void;
  onNovoCargo: () => void;
}

export function ListCargos(props: ListCargosProps) {
  const formatarFuncionalidades = (feature: string) => {
    const indicePermissao = Object.keys(StorePermissionLabels).findIndex((key) => key === feature);

    if (indicePermissao === -1) {
      return feature;
    }

    return Object.values(StorePermissionLabels)[indicePermissao];
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-[#283855] text-xl font-semibold leading-snug">Cargos cadastrados</h2>
        <ButtonAdd title="Cadastrar novo cargo" onClick={props.onNovoCargo} />
      </div>

      <ul className="grid grid-cols-1 gap-4 mt-4">
        {props.roles &&
          props.roles.length > 0 &&
          props.roles.map((role) => (
            <li key={role.id}>
              <button
                onClick={() => props.onSelecionarCargo(role)}
                className="group block w-full p-4 text-left bg-[#EBEEF2] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#283855] text-xl mb-2">
                    {roleLabel(role.role)}
                  </div>
                  <div className="block transition-opacity opacity-20 group-hover:opacity-100">
                    <IconEdit fill="#434D56" />
                  </div>
                </div>

                <div className="w-full flex flex-wrap justify-start items-center">
                  <span className="text-xs">
                    {role.features.map(formatarFuncionalidades).join(', ')}
                  </span>
                </div>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
