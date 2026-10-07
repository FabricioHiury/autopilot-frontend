'use client';
import { roleLabel } from '@/lib/presentation-labels';
import toast from 'react-hot-toast';
import IconCompartilhar from './icons/icon-compartilhar';
import { useEffect, useState, useRef } from 'react';
import IconX from '@/components/icons/icon-x';
import { Input } from '@/components/ui/input';
import AvatarUser from '@/components/commons/avatar-user';
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from '@/components/commons/inputs/combobox-select-person';
import { Button } from '@/components/ui/button';
import { AppServices } from '@/services/app.services';
import { profileImageUrl } from '@/lib/profile.utils';
import { useClickOutside } from '@/hooks/use-click-outside';

export interface CompartilharAtendimentoProps {
  dealId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const CompartilharAtendimento = ({
  dealId,
  isOpen = false,
  onToggle,
}: CompartilharAtendimentoProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [employees, setColaboradores] = useState<
    {
      id: string;
      employee: {
        id: string;
        name: string;
        whatsapp: string;
        userId: string;
        roles: {
          role: string;
        }[];
      };
    }[]
  >([]);
  const [novosColaboradores, setNovosColaboradores] = useState<SelectPersonItemInterface[]>([]);
  const api = new AppServices();

  const handleSearchResponsaveis = async (search: string) => {
    const [data, error] = await api.employee.list({ search: search });
    if (error) {
      toast.error(error.message);
      console.error(error);
      return [];
    }
    const assignees = data?.employees || [];
    return assignees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      avatar: profileImageUrl(employee.userId),
    }));
  };

  const handleAdicionarColaboradores = async () => {
    if (novosColaboradores.length === 0) {
      toast.error('Selecione ao menos um colaborador');
      return;
    }
    const idsEmployees = novosColaboradores.map((employee) => employee.id);

    await Promise.all(
      idsEmployees.map(async (employeeId) => {
        const [data, error] = await api.deal.addShare(dealId, employeeId);
        if (error) {
          toast.error(error.message);
          return;
        }
      }),
    );

    if (novosColaboradores.length > 0) {
      toast.success('Colaboradores adicionados com sucesso');
    } else {
      toast.success('Colaborador adicionado com sucesso');
    }

    setNovosColaboradores([]);
    fecthColaboradores();
  };

  const handleRemoverColaborador = async (employeeId: string) => {
    const [data, error] = await api.deal.removeShare(dealId, employeeId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Colaborador removido com sucesso');
    fecthColaboradores();
  };

  const fecthColaboradores = async () => {
    const [data, error] = await api.deal.listShares(dealId);
    if (error) {
      toast.error(error.message);
      return;
    }
    const employees = data || [];
    setColaboradores(employees);
  };

  useEffect(() => {
    fecthColaboradores();
  }, [dealId]);

  useClickOutside(
    dropdownRef,
    () => {
      if (isOpen && onToggle) {
        onToggle();
      }
    },
    isOpen,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-[#DDE6F2] rounded-[0.5rem] w-12 h-10 flex items-center justify-center"
        onClick={() => {
          onToggle && onToggle();
        }}
      >
        <IconCompartilhar />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] z-50 md:right-1">
          <div className="w-[300px] sm:w-96 md:w-72 left-3 p-5 bg-white rounded-xl shadow-lg inline-flex flex-col justify-start gap-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/70 scrollbar-track-slate-100">
            {/* link */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-[#283855] text-base font-semibold leading-tight">
                  Endereço para compartilhar
                </h2>
                <button
                  onClick={() => {
                    onToggle && onToggle();
                  }}
                >
                  <IconX />
                </button>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  value={window.location.toString()}
                  readOnly
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.toString());
                    toast.success('Endereço copiado');
                  }}
                  className="w-full h-10 bg-[#fdfdfd] rounded-lg outline outline-1 outline-offset-[-1px] outline-[#dce5f1] text-[#6b7687] text-sm font-normal leading-tight cursor-pointer"
                />

                <div
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.toString());
                    toast.success('Endereço copiado');
                  }}
                >
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.0742 7.25952H3.74089C2.82172 7.25952 2.07422 8.00702 2.07422 8.92619V17.2595C2.07422 18.1787 2.82172 18.9262 3.74089 18.9262H12.0742C12.9934 18.9262 13.7409 18.1787 13.7409 17.2595V8.92619C13.7409 8.00702 12.9934 7.25952 12.0742 7.25952Z"
                      fill="#7F8999"
                    />
                    <path
                      d="M17.0742 2.25952H8.74089C8.29886 2.25952 7.87494 2.43512 7.56237 2.74768C7.24981 3.06024 7.07422 3.48416 7.07422 3.92619V5.59285H13.7409C14.1829 5.59285 14.6068 5.76845 14.9194 6.08101C15.232 6.39357 15.4076 6.81749 15.4076 7.25952V13.9262H17.0742C17.5162 13.9262 17.9402 13.7506 18.2527 13.438C18.5653 13.1255 18.7409 12.7015 18.7409 12.2595V3.92619C18.7409 3.48416 18.5653 3.06024 18.2527 2.74768C17.9402 2.43512 17.5162 2.25952 17.0742 2.25952Z"
                      fill="#7F8999"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* compartilhar com */}
            <div className="flex flex-col gap-4">
              <h2 className="flex-1 justify-start text-[#283855] text-base font-semibold leading-tight">
                Atendimento compartilhado
              </h2>

              <div className="flex flex-col divide-y">
                {employees &&
                  employees.length > 0 &&
                  employees.map((c) => (
                    <div className="flex justify-between items-center gap-1 py-3">
                      <div className="flex gap-2 justify-start items-center">
                        <AvatarUser
                          name={c.employee.name}
                          size={2}
                          src={profileImageUrl(c.employee.userId)}
                        />
                        <div className="inline-flex flex-col justify-start items-start">
                          <div className="justify-start text-[#283855] text-sm font-semibold leading-tight">
                            {c.employee.name}
                          </div>
                          <div className="justify-start text-[#7f8999] text-xs font-normal leading-none">
                            {c.employee.roles.length > 0
                              ? roleLabel(c.employee.roles[0].role)
                              : 'Sem cargo'}{' '}
                            | ID.{c.id}
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-slate-300 transition-colors hover:text-[#E84C43]"
                        onClick={() => handleRemoverColaborador(c.employee.id)}
                      >
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 19 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="currentColor"
                            d="M4.90723 5.84277H4.15723V15.5928C4.15723 15.9906 4.31526 16.3721 4.59657 16.6534C4.87787 16.9347 5.2594 17.0928 5.65723 17.0928H13.1572C13.5551 17.0928 13.9366 16.9347 14.2179 16.6534C14.4992 16.3721 14.6572 15.9906 14.6572 15.5928V5.84277H4.90723ZM12.8707 3.59277L11.6572 2.09277H7.15723L5.94373 3.59277H2.65723V5.09277H16.1572V3.59277H12.8707Z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Compartilhar com outros */}
            <div className="flex flex-col gap-4">
              <h2 className="flex-1 justify-start text-[#283855] text-base font-semibold leading-tight">
                Compartilhar com outros
              </h2>
              <ComboboxSelectPerson
                onSearch={handleSearchResponsaveis}
                placeholder="Procurar por colaborador"
                onValueChange={(value) => setNovosColaboradores(value)}
                value={novosColaboradores}
              />

              <Button
                disabled={novosColaboradores.length === 0}
                className="bg-[#283855] rounded-lg text-[#f2f4f7] text-sm font-semibold leading-tight cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
                onClick={handleAdicionarColaboradores}
              >
                Salvar alterações
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
