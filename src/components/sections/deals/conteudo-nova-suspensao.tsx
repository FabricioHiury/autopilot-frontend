'use client';
import { AppServices } from '@/services/app.services';
import { Suspension } from '@/types/suspension';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { Employee } from '@/types/employee';
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from '@/components/commons/inputs/combobox-select-person';
import IconX from '@/components/icons/icon-x';

interface ConteudoNovaSuspensaoProps {
  onCancel: () => void;
  onSucess: () => void;
  suspensao?: Suspension;
}

export function ConteudoNovaSuspensao({
  onCancel,
  onSucess,
  suspensao,
}: ConteudoNovaSuspensaoProps) {
  const api = new AppServices();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    userId: string;
    description: string;
    startDate: string;
    endDate: string;
  }>({
    userId: '',
    description: '',
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
  });

  const [selectedUser, setSelectedUser] = useState<SelectPersonItemInterface[]>([]);

  useEffect(() => {
    if (suspensao) {
      console.log('Suspensão recebida:', suspensao);

      setFormData({
        userId: suspensao.userId,
        description: suspensao.description,
        startDate: format(new Date(suspensao.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(suspensao.endDate), "yyyy-MM-dd'T'HH:mm"),
      });

      if (suspensao.user) {
        console.log('Usuário da suspensão:', suspensao.user);

        const userToSelect = {
          id: suspensao.userId,
          name: suspensao.user.name,
          avatar: suspensao.user.avatar?.file?.url || profileImageUrl(suspensao.userId),
          metaData: [suspensao.user.email || ''],
        };

        console.log('Setando usuário:', userToSelect);
        setSelectedUser([userToSelect]);
      }
    }
  }, [suspensao]);

  // Carregar os dados do usuário quando o componente é montado em modo de edição
  useEffect(() => {
    const loadUserData = async () => {
      if (suspensao?.userId) {
        setLoading(true);
        const [data, error] = await api.employee.get(suspensao.userId);

        if (data && !error) {
          const userToSelect = {
            id: data.userId,
            name: data.name,
            avatar: profileImageUrl(data.userId),
            metaData: [data.email || ''],
          };

          console.log('Usuário carregado:', userToSelect);
          setSelectedUser([userToSelect]);
        } else {
          console.error('Erro ao carregar usuário:', error);
        }

        setLoading(false);
      }
    };

    loadUserData();
  }, [suspensao?.userId]);

  const handleSearchResponsaveis = async (search: string) => {
    const [data, error] = await api.employee.list({ search: search });
    if (error) {
      toast.error(error.message);
      console.error(error);
      return [];
    }
    const employees = data?.employees || [];
    return employees.map((employee) => ({
      id: employee.userId,
      name: employee.name,
      avatar: profileImageUrl(employee.userId),
      metaData: [employee.email || ''],
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (selectedUser.length === 0 || !formData.userId) {
      toast.error('Selecione um usuário');
      return;
    }

    if (!formData.description) {
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
        [response, error] = await api.deal.updateSuspension(suspensao.id, formData);
      } else {
        [response, error] = await api.deal.createSuspension(formData);
      }

      if (error || !response) {
        toast.error(error?.message || 'Erro ao salvar suspensão');
        setLoading(false);
        return;
      }

      toast.success(
        suspensao ? 'Suspensão atualizada com sucesso' : 'Suspensão criada com sucesso',
      );
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
                    handleChange('userId', users[0].id);
                  } else {
                    handleChange('userId', '');
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
            <label htmlFor="description" className="block text-sm font-medium text-[#1B263A] mb-2">
              Motivo da suspensão
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
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
                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
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
                className="w-full px-3 py-2 rounded-[0.5rem] border border-[#DDE6F2] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
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
              className="px-4 py-2 rounded-[0.5rem] bg-[#1B263A] text-secondary-foreground hover:bg-[hsl(var(--secondary))] text-sm font-medium"
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
