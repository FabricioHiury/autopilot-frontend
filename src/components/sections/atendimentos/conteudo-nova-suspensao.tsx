'use client';
import { ApiApp } from '@/lib/api-app';
import { SuspensaoType } from '@/utils/types/suspensao-type';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { ColaboradorType } from '@/utils/types/colaborador-type';
import { ComboboxSelectPerson, SelectPersonItemInterface } from '@/components/commons/inputs/combobox-select-person';
import IconX from '@/components/icons/icon-x';

interface ConteudoNovaSuspensaoProps {
    onCancel: () => void;
    onSucess: () => void;
    suspensao?: SuspensaoType;
}

export function ConteudoNovaSuspensao({ onCancel, onSucess, suspensao }: ConteudoNovaSuspensaoProps) {
    const api = new ApiApp();
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        idUsuario: string;
        descricao: string;
        startDate: string;
        endDate: string;
    }>({
        idUsuario: "",
        descricao: '',
        startDate: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
        endDate: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
    });
    
    const [selectedUser, setSelectedUser] = useState<SelectPersonItemInterface[]>([]);

    useEffect(() => {
        if (suspensao) {
            console.log("Suspensão recebida:", suspensao);
            
            setFormData({
                idUsuario: suspensao.idUsuario,
                descricao: suspensao.descricao,
                startDate: format(new Date(suspensao.startDate), 'yyyy-MM-dd\'T\'HH:mm'),
                endDate: format(new Date(suspensao.endDate), 'yyyy-MM-dd\'T\'HH:mm'),
            });
            
            if (suspensao.usuario) {
                console.log("Usuário da suspensão:", suspensao.usuario);
                
                const userToSelect = {
                    id: suspensao.idUsuario,
                    name: suspensao.usuario.nome,
                    avatar: suspensao.usuario.avatar?.arquivo?.url || profileImageUrl(suspensao.idUsuario),
                    metaData: [suspensao.usuario.email || '']
                };
                
                console.log("Setando usuário:", userToSelect);
                setSelectedUser([userToSelect]);
            }
        }
    }, [suspensao]);

    // Carregar os dados do usuário quando o componente é montado em modo de edição
    useEffect(() => {
        const loadUserData = async () => {
            if (suspensao?.idUsuario) {
                setLoading(true);
                const [data, error] = await api.colaborador.pegar(suspensao.idUsuario);
                
                if (data && !error) {
                    const userToSelect = {
                        id: data.idUsuario,
                        name: data.nome,
                        avatar: profileImageUrl(data.idUsuario),
                        metaData: [data.email || '']
                    };
                    
                    console.log("Usuário carregado:", userToSelect);
                    setSelectedUser([userToSelect]);
                } else {
                    console.error("Erro ao carregar usuário:", error);
                }
                
                setLoading(false);
            }
        };
        
        loadUserData();
    }, [suspensao?.idUsuario]);

    const handleSearchResponsaveis = async (search: string) => {
        const [data, error] = await api.colaborador.listar({pesquisa: search});
        if(error) {
            toast.error(error.message);
            console.error(error);
            return [];
        }
        const colaboradores = data?.colaboradores || [];
        return colaboradores.map((colaborador) => ({
            id: colaborador.idUsuario,
            name: colaborador.nome,
            avatar: profileImageUrl(colaborador.idUsuario),
            metaData: [colaborador.email || '']
        }));
    }

    const handleChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        if (selectedUser.length === 0 || !formData.idUsuario) {
            toast.error('Selecione um usuário');
            return;
        }

        if (!formData.descricao) {
            toast.error('Informe uma descrição');
            return;
        }

        if (!formData.startDate) {
            toast.error('Informe a data de início');
            return;
        }

        if (!formData.endDate) {
            toast.error('Informe a data de fim');
            return;
        }

        // Verificar se a data de fim é maior que a data de início
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            toast.error('A data de fim deve ser maior que a data de início');
            return;
        }

        setLoading(true);

        try {
            let response, error;

            if (suspensao) {
                [response, error] = await api.atendimento.suspensaoAtualizar(suspensao.id, formData);
            } else {
                [response, error] = await api.atendimento.suspensaoCriar(formData);
            }

            if (error || !response) {
                toast.error(error?.message || 'Erro ao salvar suspensão');
                setLoading(false);
                return;
            }

            toast.success(suspensao ? 'Suspensão atualizada com sucesso' : 'Suspensão criada com sucesso');
            onSucess();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao processar a solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#1B263A]">
                    {suspensao ? 'Editar Suspensão' : 'Nova Suspensão'}
                </h2>
                <button onClick={onCancel}>
                    <IconX />
                </button>
            </div>

            {loading && <LoadingGlobal />}

            {!loading && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#1B263A] mb-2">
                            Usuário a ser suspenso
                        </label>
                        
                        {!suspensao ? (
                            <ComboboxSelectPerson
                                value={selectedUser}
                                onValueChange={(users) => {
                                    setSelectedUser(users);
                                    if (users.length > 0) {
                                        handleChange('idUsuario', users[0].id);
                                    } else {
                                        handleChange('idUsuario', "");
                                    }
                                }}
                                onSearch={handleSearchResponsaveis}
                                placeholder="Buscar usuário pelo nome"
                                unique={true}
                                selectColor="red"
                            />
                        ) : (
                            <div className="flex items-center p-3 bg-[#F2F4F7] rounded-lg">
                                {selectedUser.length > 0 && (
                                    <>
                                        <AvatarUser 
                                            name={selectedUser[0].name} 
                                            src={selectedUser[0].avatar} 
                                            size={2.5} 
                                        />
                                        <div className="ml-2">
                                            <div className="font-medium text-[#1B263A]">{selectedUser[0].name}</div>
                                            {selectedUser[0].metaData && selectedUser[0].metaData[0] && (
                                                <div className="text-xs text-[#485B80]">{selectedUser[0].metaData[0]}</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-[#1B263A] mb-2">
                            Motivo da suspensão
                        </label>
                        <textarea
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => handleChange('descricao', e.target.value)}
                            className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
                            rows={4}
                            placeholder="Descreva o motivo da suspensão"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-[#1B263A] mb-2">
                                Data de início
                            </label>
                            <input
                                id="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-[#1B263A] mb-2">
                                Data de fim
                            </label>
                            <input
                                id="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[#D33632] focus:border-[#D33632]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-[0.5rem] bg-white border border-[#DDE6F2] text-[#7F8999] hover:bg-[#F2F4F7] text-sm font-medium"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-[0.5rem] bg-[#1B263A] text-white hover:bg-[#293856] text-sm font-medium"
                            disabled={loading}
                        >
                            {suspensao ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 