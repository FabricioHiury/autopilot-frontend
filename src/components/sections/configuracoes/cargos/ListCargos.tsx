'use client'
import ButtonAdd from "@/components/commons/buttons/button-add";
import { IconEdit } from "@/components/icons/icon-edit";
import { CargoCreatedType, CargoType } from "@/utils/types/cargo-type";
import { PERMISSOES_LOJA } from "@/utils/types/permissoes_funcionalidades.enum";

interface ListCargosProps {
  cargos: CargoCreatedType[];
  onSelecionarCargo: (cargo: CargoType) => void;
  onNovoCargo: () => void;
}

export function ListCargos(props: ListCargosProps) {
  const formatarFuncionalidades = (funcionalidade: string) => {
    const indicePermissao = Object.keys(PERMISSOES_LOJA).findIndex((key) => key === funcionalidade);

    if (indicePermissao === -1) {
      return funcionalidade;
    }

    return Object.values(PERMISSOES_LOJA)[indicePermissao];
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-[#283855] text-xl font-semibold leading-snug">
          Cargos cadastrados
        </h2>
        <ButtonAdd title="Cadastrar novo cargo" onClick={props.onNovoCargo} />
      </div>

      <ul className="grid grid-cols-1 gap-4 mt-4">
        {props.cargos && props.cargos.length > 0 && props.cargos.map((cargo) => (
          <li key={cargo.id}>
            <button onClick={() => props.onSelecionarCargo(cargo)} className="group block w-full p-4 text-left bg-[#EBEEF2] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#283855] text-xl mb-2">{cargo.cargo}</div>
                <div className="block transition-opacity opacity-20 group-hover:opacity-100">
                  <IconEdit fill="#434D56" />
                </div>
              </div>

              <div className="w-full flex flex-wrap justify-start items-center">
                <span className="text-xs">{cargo.funcionalidades.map(formatarFuncionalidades).join(", ")}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}