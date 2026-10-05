'use client';

import { ActionsRef, CustomerType } from '@/types/customer';
import CustomerActions from './CustomerActions';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import handleDate from '@/utils/classes/format/time';
import sanitizar from '@/utils/classes/sanitizer/sanitizer';
import { useObserver } from '@/contexts/observer.context';
import AvatarUser from '../commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';
import toast from 'react-hot-toast';

interface CardCustomerTableProps {
  customer: CustomerType;
  isFirstElement: boolean;
  canEditFromParent?: boolean;
}

const CustomerListItem: React.FC<CardCustomerTableProps> = ({
  customer,
  isFirstElement,
  canEditFromParent,
}) => {
  const router = useRouter();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);

  const appAuth = useAppAuth();
  const { setObserver } = useObserver();

  const actionsRef = useRef<ActionsRef>(null);

  const checkPermission = useCallback(async () => {
    if (typeof canEditFromParent === 'boolean') {
      setCanEdit(canEditFromParent);
      return;
    }
    const access = await appAuth.fetchPermissions();
    if (!access) {
      setCanEdit(false);
      return;
    }
    setCanEdit(access.permissions.includes(StorePermission.STORE_REGISTER_EDIT_CUSTOMERS));
  }, [appAuth, canEditFromParent]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleOpenActions = useCallback(() => {
    setIsActionsOpen(true);
  }, []);

  const handleViewCustomer = useCallback(() => {
    router.push(`/app/customers/${customer.id}`);
  }, [router, customer.id]);

  const handleEditCustomer = useCallback(() => {
    if (!canEdit) {
      toast.error('Você não possui permissão para editar clientes.');
      return;
    }
    setObserver({
      type: 'abrirPopClienteEditar',
      data: customer,
    });
  }, [canEdit, customer, setObserver]);

  const avatarSrc = useMemo(() => profileImageUrl(customer.id), [customer.id]);
  const cpfCnpj = useMemo(() => sanitizar.cpfcnpj(customer.taxId), [customer.taxId]);
  const whatsapp = useMemo(() => sanitizar.phone(customer.whatsapp, false), [customer.whatsapp]);
  const aniversario = useMemo(
    () => handleDate.formatISODate(customer.birthDate, "dd 'de' MMMM 'de' yyyy"),
    [customer.birthDate],
  );

  return (
    <ul className="flex flex-row lg:flex-col w-full">
      <ul
        className={
          'flex-[1] flex flex-col lg:flex-row lg:p-2 lg:px-4 justify-between w-full bg-[#E3E6EC] rounded-md text-[#7F8999] text-sm font-medium ' +
          (isFirstElement ? 'lg:rounded-b-none' : 'lg:hidden')
        }
      >
        <li className="flex-[3] lg:flex-[2] flex items-center justify-center lg:justify-start p-6 lg:p-0">
          Cliente
        </li>
        <li className="flex-[2] flex items-center justify-center lg:justify-start p-3 lg:p-0">
          Whatsapp
        </li>
        <li className="flex-[2] flex items-center justify-center lg:justify-start p-3 lg:p-0">
          Aniversario
        </li>
        <li className="flex-[2] flex items-center justify-center lg:justify-start p-3 lg:p-0">
          Historíco
        </li>
        <li className="flex-[1] flex items-center justify-center lg:justify-start p-3 lg:p-0">
          Ações
        </li>
      </ul>

      <ul
        className={
          'flex-[4] lg:flex-[1] flex flex-col lg:flex-row p-3 lg:px-4 lg:items-center w-full rounded-md text-[#6C7788] text-sm font-normal duration-300 ' +
          (isActionsOpen ? 'bg-white' : 'bg-[#F2F4F7] hover:bg-white')
        }
      >
        <li className="flex-[3] lg:flex-[2] flex overflow-hidden p-1 lg:p-0 items-center gap-2">
          <AvatarUser name={customer.name} src={avatarSrc} />
          <div className="flex flex-col pr-1">
            <b className="text-[hsl(var(--secondary))] text-[15px] font-semibold">
              {customer.name}
            </b>
            <span className="text-[#6C7788] text-[13px]">{cpfCnpj}</span>
          </div>
        </li>

        <li className="flex-[2] flex items-center p-1 gap-2 lg:p-0">
          <img className="translate-y-[-1px]" src="/icons/zap.svg" alt="Whatsapp" />
          <span>{whatsapp}</span>
        </li>

        <li className="flex-[2] flex items-center p-1 gap-2 lg:p-0">
          <img className="translate-y-[-2px]" src="/icons/cake.svg" alt="Aniversário" />
          <span>{aniversario}</span>
        </li>

        <li className="flex-[2] flex items-center p-1 gap-2 lg:p-0">
          <img className="translate-y-[-2px]" src="/icons/atendimento.svg" alt="Histórico" />
          <span>{customer.totalDeals} atendimentos</span>
        </li>

        <li className="flex-1 relative flex items-center p-1 lg:p-0">
          <CustomerActions
            ref={actionsRef}
            setVisible={setIsActionsOpen}
            visible={isActionsOpen}
            canEdit={canEdit}
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
          />
          <button
            onClick={handleOpenActions}
            className="px-2 font-semibold hover:bg-slate-200 rounded-md"
            aria-haspopup="menu"
            aria-expanded={isActionsOpen}
            aria-label="Abrir ações do cliente"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 256 256"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"></path>
            </svg>
          </button>
        </li>
      </ul>
    </ul>
  );
};

export default CustomerListItem;
