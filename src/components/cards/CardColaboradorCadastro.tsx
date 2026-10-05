'use client';
import { roleLabel } from '@/lib/presentation-labels';
import { cn } from '@/lib/class-name.utils';
import AvatarUser from '../commons/avatar-user';
import { IconDelete } from '../icons/icon-delete';
import { IconEdit } from '../icons/icon-edit';
import { useRouter } from 'next/navigation';
import api from '@/utils/classes/api';
import { Employee } from '@/types/employee';
import { profileImageUrl } from '@/lib/profile.utils';
import Link from 'next/link';
import { useState } from 'react';
import CenterModal from '../commons/modais/center-modal';
import { Button } from '../ui/button';

interface CardPermissionUserProps {
  employee: Employee;
  onDelete?: () => void;
  onEdit?: () => void;
  variant?: 'default' | 'blue';
}
export function CardColaboradorUser(props: CardPermissionUserProps) {
  const variant = props.variant || 'default';
  const bgColor = variant === 'blue' ? 'bg-[#F2F4F7]' : 'bg-white';
  const tagBgColor = variant === 'blue' ? 'bg-[#DDE6F2]' : 'bg-[#DDE6F2]';
  const router = useRouter();

  const name = props.employee.name;
  const mail = props.employee.email;
  const avatar = props.employee.avatar || profileImageUrl(props.employee.userId);
  const role = props.employee.roles?.map((role) => roleLabel(role.role)) || [];

  const [openDelete, setOpenDelete] = useState(false);

  const handleEdit = () => {
    router.push(
      `/app/settings/access/user?id=${props.employee.id}&userId=${props.employee.userId}`,
    );
    if (props.onEdit) {
      props.onEdit();
    }
  };

  const handleDelete = async () => {
    api.put(`/employees/update-status/${props.employee.id}`, {
      status: 'inactive',
    });

    if (props.onDelete) {
      props.onDelete();
    }
  };

  return (
    <div
      className={cn(
        'card flex flex-col gap-2 col-span-1 md:gap-3 w-full p-5 rounded-xl shadow-md',
        bgColor,
      )}
    >
      <div className="flex justify-between w-full">
        <div className="tags flex flex-wrap gap-2">
          {role.map((role: any, index: number) => (
            <span
              key={index}
              className={cn(
                'text-[hsl(var(--secondary))] text-xs font-semibold px-2 py-[6px] rounded-md',
                tagBgColor,
              )}
            >
              {role}
            </span>
          ))}
        </div>
        <div className="btns-wrapper flex md:hidden items-center gap-3">
          <button onClick={handleEdit}>
            <IconEdit fill="#657380" size={17} />
          </button>
          <button onClick={handleDelete}>
            <IconDelete fill="#657380" size={17} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center ">
        <div className="avatar-wrapper flex gap-3 items-start">
          <AvatarUser name={props.employee.name} src={avatar} />

          <div className="flex flex-col">
            <p className="text-[#24292E] text-[1.25rem] font-semibold md:text-[1.75rem] leading-none">
              {name}
            </p>
            <p className="text-[#657380] text-[.875rem]">{mail}</p>
          </div>
        </div>

        <div className="btns-wrapper hidden md:flex items-center gap-3">
          <Link
            href={`/app/settings/access/user?id=${props.employee.id}&userId=${props.employee.userId}`}
            className="opacity-40 hover:opacity-100"
          >
            <IconEdit fill="#657380" />
          </Link>
          <button onClick={() => setOpenDelete(true)} className="opacity-40 hover:opacity-100">
            <IconDelete fill="#657380" />
          </button>
        </div>

        {openDelete && (
          <CenterModal onClose={() => setOpenDelete(false)}>
            <div className="flex flex-col gap-4">
              <h3 className="text-[hsl(var(--secondary))] font-semibold text-[1.5rem]">
                Deseja excluir o colaborador?
              </h3>
              <p className="text-[#657380] text-[1rem]">Essa ação não poderá ser desfeita.</p>
              <div className="flex gap-4 justify-end">
                <Button onClick={() => setOpenDelete(false)} className="btn-cancelar">
                  Cancelar
                </Button>
                <Button onClick={handleDelete} className="btn-excluir">
                  Excluir
                </Button>
              </div>
            </div>
          </CenterModal>
        )}
      </div>
    </div>
  );
}
