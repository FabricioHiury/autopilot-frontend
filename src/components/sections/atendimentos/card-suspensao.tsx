'use client';
import { SuspensaoType } from '@/utils/types/suspensao-type';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { useState } from 'react';
import { ApiApp } from '@/lib/api-app';
import toast from 'react-hot-toast';
import { ConteudoNovaSuspensao } from './conteudo-nova-suspensao';
import SideModal from '@/components/commons/modais/side-modal';
import { IconEdit } from '@/components/icons/icon-edit';
import CenterModal from '@/components/commons/modais/center-modal';
import IconX from '@/components/icons/icon-x';
import IconTrash from '@/components/icons/icon-trash';

interface CardSuspensaoProps {
    suspensao: SuspensaoType;
    onDelete: () => void;
    onUpdate: () => void;
}

export function CardSuspensao({ suspensao, onDelete, onUpdate }: CardSuspensaoProps) {
    const api = new ApiApp();
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const isActive = isBefore(new Date(), new Date(suspensao.endDate)) && 
                    isAfter(new Date(), new Date(suspensao.startDate));

    const handleDelete = async () => {
        setLoading(true);
        const [response, error] = await api.atendimento.suspensaoRemover(suspensao.id);

        if (error || !response) {
            toast.error(error?.message || 'Erro ao excluir suspensão');
            setLoading(false);
            return;
        }

        toast.success('Suspensão excluída com sucesso');
        setOpenConfirmDelete(false);
        onDelete();
        setLoading(false);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    };

    return (
        <>
            <div className="bg-white rounded-[0.5rem] p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                        {suspensao.usuario && (
                            <div className="flex items-center gap-2">
                                <AvatarUser
                                    name={suspensao.usuario.nome}
                                    src={suspensao.usuario.avatar?.arquivo?.url || profileImageUrl(suspensao.usuario.id)}
                                    size={2.5}
                                />
                                <span className="font-medium text-[#1B263A]">{suspensao.usuario.nome}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setOpenEdit(true)}
                            className="p-2 rounded-full hover:bg-[#F2F4F7] transition-colors"
                        >
                            <IconEdit size={16} />
                        </button>
                        <button 
                            onClick={() => setOpenConfirmDelete(true)}
                            className="p-2 rounded-full hover:bg-[#F2F4F7] transition-colors"
                        >
                            <IconTrash size={16} />
                        </button>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="text-sm text-[#7F8999] mb-1">Motivo:</div>
                    <p className="text-[#1B263A]">{suspensao.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <div className="text-sm text-[#7F8999] mb-1">Início:</div>
                        <p className="text-[#1B263A]">{formatDate(suspensao.startDate)}</p>
                    </div>
                    <div>
                        <div className="text-sm text-[#7F8999] mb-1">Fim:</div>
                        <p className="text-[#1B263A]">{formatDate(suspensao.endDate)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7F8999]">
                        Criado {formatDistanceToNow(new Date(suspensao.criadoEm), { locale: ptBR, addSuffix: true })}
                    </span>
                    {isActive && (
                        <span className="px-2 py-1 bg-[#E84C43] text-white rounded-full">
                            Ativa
                        </span>
                    )}
                </div>
            </div>

            {openConfirmDelete && (
                <CenterModal idSelector="content-container" onClose={() => setOpenConfirmDelete(false)}>
                    <div className="p-6 max-w-md">
                        <div className="flex justify-end">
                            <button onClick={() => setOpenConfirmDelete(false)} className="text-[#7F8999]">
                                <IconX />
                            </button>
                        </div>
                        <h2 className="text-xl font-semibold text-[#1B263A] mb-4">Confirmar exclusão</h2>
                        <p className="text-[#485B80] mb-6">
                            Tem certeza que deseja excluir esta suspensão? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setOpenConfirmDelete(false)}
                                className="px-4 py-2 rounded-[0.5rem] bg-white border border-[#DDE6F2] text-[#7F8999] hover:bg-[#F2F4F7] text-sm font-medium"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-[0.5rem] bg-[#E84C43] text-white hover:bg-[#d13c34] text-sm font-medium"
                                disabled={loading}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </CenterModal>
            )}

            {openEdit && (
                <SideModal onClose={() => setOpenEdit(false)} idSelector="content-container">
                    <ConteudoNovaSuspensao
                        suspensao={suspensao}
                        onCancel={() => setOpenEdit(false)}
                        onSucess={() => {
                            setOpenEdit(false);
                            onUpdate();
                        }}
                    />
                </SideModal>
            )}
        </>
    );
} 