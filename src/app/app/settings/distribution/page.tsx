'use client';
import { PageTitle } from '@/components/commons/page-title';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import PesquisarSuspensoes from '@/components/sections/deals/pesquisar-suspensoes';
import { ModalSuspensaoFiltro } from '@/components/sections/deals/modal-suspensao-filtro';
import { ModalNovaSuspensao } from '@/components/sections/deals/modal-nova-suspensao';
import { useEffect, useState } from 'react';
import { SuspensionFilter, Suspension } from '@/types/suspension';
import { AppServices } from '@/services/app.services';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';
import toast from 'react-hot-toast';
import PaginationSimple from '@/components/commons/pagination/PaginationSimple';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { IconEdit } from '@/components/icons/icon-edit';
import IconTrash from '@/components/icons/icon-trash';
import SideModal from '@/components/commons/modais/side-modal';
import { ConteudoNovaSuspensao } from '@/components/sections/deals/conteudo-nova-suspensao';
import CenterModal from '@/components/commons/modais/center-modal';
import IconX from '@/components/icons/icon-x';

type ConfiguracaoDistribuicao = {
  distributionAutomatic: boolean;
  limiteDiferencaAtendimentos?: number;
};

export default function SuspensoesDistribuicaoPage() {
  const api = new AppServices();
  const appContext = useAppAuth();

  const [permitirSuspensoes, setPermitirSuspensoes] = useState<boolean>(false);
  const [permitirDistribuicao, setPermitirDistribuicao] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);

  const [suspensoes, setSuspensoes] = useState<Suspension[]>([]);
  const [search, setPesquisa] = useState<string>('');
  const [showFiltro, setShowFiltro] = useState(false);
  const [filtro, setFiltro] = useState<SuspensionFilter>({
    description: '',
    ativas: false,
    page: 1,
    itemsPage: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalSuspensoes, setTotalSuspensoes] = useState(0);
  const [editSuspensao, setEditSuspensao] = useState<Suspension | null>(null);
  const [deleteSuspensao, setDeleteSuspensao] = useState<Suspension | null>(null);

  const [loadingDistribuicao, setLoadingDistribuicao] = useState<boolean>(true);
  const [savingDistribuicao, setSavingDistribuicao] = useState<boolean>(false);
  const [configuracaoDistribuicao, setConfiguracaoDistribuicao] =
    useState<ConfiguracaoDistribuicao | null>(null);
  const [distribuicaoAtiva, setDistribuicaoAtiva] = useState<boolean>(false);

  const validarPermissoes = async () => {
    const access = await appContext.fetchPermissions();
    if (!access) {
      setPermitirSuspensoes(false);
      setPermitirDistribuicao(false);
      setCarregando(false);
      return;
    }

    setPermitirSuspensoes(access.permissions.includes(StorePermission.STORE_EDIT_DATA_OF_STORE));
    setPermitirDistribuicao(access.permissions.includes(StorePermission.STORE_MANAGE_USERS));
    setCarregando(false);
  };

  const carregarConfiguracaoDistribuicao = async () => {
    if (!permitirDistribuicao) return;

    setLoadingDistribuicao(true);
    const [config, error] = await api.distributionAutomatic.getConfiguration();

    if (error) {
      toast.error(error.message);
      setLoadingDistribuicao(false);
      return;
    }

    if (config) {
      setConfiguracaoDistribuicao(config);
      setDistribuicaoAtiva(config.distributionAutomatic || false);
    }
    setLoadingDistribuicao(false);
  };

  const salvarConfiguracaoDistribuicao = async () => {
    setSavingDistribuicao(true);

    const [_, error] = await api.distributionAutomatic.configure({
      distributionAutomatic: distribuicaoAtiva,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Configurações de distribuição salvas com sucesso!');
      await carregarConfiguracaoDistribuicao();
    }

    setSavingDistribuicao(false);
  };

  const listarSuspensoes = async () => {
    if (!permitirSuspensoes) return;

    setCarregando(true);

    const [response, error] = await api.deal.listSuspensions({
      ...filtro,
      description: search || filtro.description,
    });

    if (error || !response) {
      toast.error(error?.message || 'Erro ao listar suspensões');
      setCarregando(false);
      return;
    }

    setSuspensoes(response.data);
    setTotalPages(response.meta.totalPages);
    setTotalSuspensoes(response.meta.total);
    setCarregando(false);
  };

  const handleFiltro = (novoFiltro: SuspensionFilter) => {
    setFiltro({
      ...novoFiltro,
      page: 1,
      itemsPage: filtro.itemsPage,
    });
    setShowFiltro(false);
  };

  const handleChangePage = (page: number) => {
    setFiltro((prev) => ({
      ...prev,
      page: page,
    }));
  };

  const handleEditSuspensao = (suspensao: Suspension) => {
    setEditSuspensao(suspensao);
  };

  const handleDeleteSuspensao = (suspensao: Suspension) => {
    setDeleteSuspensao(suspensao);
  };

  const confirmDeleteSuspensao = async () => {
    if (!deleteSuspensao) return;

    const [response, error] = await api.deal.removeSuspension(deleteSuspensao.id);

    if (error) {
      toast.error(error.message || 'Erro ao excluir suspensão');
      return;
    }

    toast.success('Suspensão excluída com sucesso');
    setDeleteSuspensao(null);
    listarSuspensoes();
  };

  const isSuspensaoAtiva = (suspensao: Suspension) => {
    const now = new Date();
    const startDate = new Date(suspensao.startDate);
    const endDate = new Date(suspensao.endDate);
    return isAfter(endDate, now) && !isAfter(startDate, now);
  };

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  useEffect(() => {
    validarPermissoes();
  }, []);

  useEffect(() => {
    if (permitirDistribuicao) {
      carregarConfiguracaoDistribuicao();
    }
  }, [permitirDistribuicao]);

  useEffect(() => {
    if (permitirSuspensoes) {
      listarSuspensoes();
    }
  }, [permitirSuspensoes, filtro, search]);

  if (carregando && !suspensoes.length && loadingDistribuicao) {
    return <LoadingGlobal />;
  }

  if (!permitirSuspensoes && !permitirDistribuicao) {
    return (
      <div className="h-full flex items-center justify-center">
        <NoData label="Você não tem permissão para acessar esta página" />
      </div>
    );
  }

  return (
    <main className="min-h-full flex flex-col">
      <div className="w-full p-4 flex flex-col gap-2 lg:gap-8 md:px-10 md:pt-10 bg-white top-0 z-10">
        <div className="flex lg:flex-row flex-col items-center gap-6 w-full justify-between">
          <div className="flex items-center w-full justify-between">
            <PageTitle title="Suspensões e Distribuição" />
            <ModalNotificacoes />
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-12 bg-[#F4F7FA] min-h-full space-y-8">
        {permitirDistribuicao && (
          <div className="bg-white rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#24292E] mb-2">
                Configuração de Distribuição Automática
              </h2>
              <p className="text-[#657380] text-sm">
                Configure se os novos atendimentos devem ser distribuídos automaticamente.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={distribuicaoAtiva}
                    onChange={(e) => setDistribuicaoAtiva(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--primary))]"></div>
                </label>
                <span className="text-[#24292E] font-medium">Ativar distribuição automática</span>
              </div>
              <p className="text-[#657380] text-sm ml-14">
                Quando ativado, novos atendimentos sem responsável definido serão automaticamente
                distribuídos entre os colaboradores disponíveis.
              </p>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={salvarConfiguracaoDistribuicao}
                disabled={savingDistribuicao}
                className="bg-[hsl(var(--primary))] text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-[#B12A26] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {savingDistribuicao && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {savingDistribuicao ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        )}

        {permitirSuspensoes && (
          <div className="bg-white rounded-lg">
            <div className="p-6 border-b border-[#DDE6F2]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#24292E] mb-2">
                    Suspensões de Atendimento
                  </h2>
                  <p className="text-[#657380] text-sm">
                    Gerencie as suspensões temporárias de usuários para atendimentos.
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    className="bg-[#F2F4F7] p-2 rounded-[0.5rem] hover:bg-[#E3E6EC]"
                    onClick={() => setShowFiltro(!showFiltro)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.3334 5H1.66675"
                        stroke="#1B263A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14.1667 10H5.83342"
                        stroke="#1B263A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11.6667 15H8.33342"
                        stroke="#1B263A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="flex-grow md:flex-grow-0">
                    <ModalNovaSuspensao onCreated={listarSuspensoes} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <PesquisarSuspensoes
                  value={search}
                  onChange={setPesquisa}
                  className="md:min-w-[30rem]"
                />

                {showFiltro && (
                  <div className="absolute z-10 top-full left-0 w-full md:w-[37.5rem] mt-2">
                    <ModalSuspensaoFiltro value={filtro} onFilter={handleFiltro} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {carregando ? (
                <LoadingGlobal />
              ) : suspensoes.length === 0 ? (
                <NoData label="Nenhuma suspensão encontrada" />
              ) : (
                <>
                  <div className="mb-4 text-sm text-[#7F8999] flex justify-between items-center">
                    <span>
                      {totalSuspensoes}{' '}
                      {totalSuspensoes === 1 ? 'suspensão encontrada' : 'suspensões encontradas'}
                    </span>
                    <span className="text-xs text-[#7F8999] italic md:hidden">
                      ← Deslize para ver mais →
                    </span>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 md:hidden"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 md:hidden"></div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#DDE6F2] scrollbar-track-transparent scrollbar-thumb-rounded-full pb-2">
                      <div className="min-w-[800px] overflow-hidden rounded-lg border border-[#DDE6F2]">
                        <div className="flex flex-row w-full bg-[#E3E6EC] text-[#7F8999] text-sm font-medium sticky top-0">
                          <div className="flex-[3] p-4 whitespace-nowrap">Usuário</div>
                          <div className="flex-[3] p-4 whitespace-nowrap">Período</div>
                          <div className="flex-[1] p-4 whitespace-nowrap">Situação</div>
                          <div className="flex-[1] p-4 text-center whitespace-nowrap">Ações</div>
                        </div>

                        <div className="divide-y divide-[#DDE6F2]">
                          {suspensoes.map((suspensao) => (
                            <div
                              key={suspensao.id}
                              className="flex flex-row w-full items-center hover:bg-[#F2F4F7] transition-colors"
                            >
                              <div className="flex-[3] p-4">
                                <div className="flex items-center gap-2">
                                  <AvatarUser
                                    name={suspensao.user?.name || ''}
                                    src={
                                      suspensao.user?.avatar?.file?.url ||
                                      profileImageUrl(suspensao.user?.id ?? null)
                                    }
                                    size={2.5}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-[hsl(var(--secondary))] truncate">
                                      {suspensao.user?.name}
                                    </span>
                                    <span className="text-xs text-[#485B80] truncate">
                                      {suspensao.user?.email}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-[3] p-4">
                                <div className="flex flex-col space-y-1">
                                  <div className="flex items-center flex-wrap gap-1">
                                    <span className="text-xs font-medium bg-[#DDE6F2] px-2 py-0.5 rounded">
                                      Início:
                                    </span>
                                    <span className="text-sm text-[hsl(var(--secondary))] whitespace-nowrap">
                                      {formatarData(suspensao.startDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center flex-wrap gap-1">
                                    <span className="text-xs font-medium bg-[#DDE6F2] px-2 py-0.5 rounded">
                                      Fim:
                                    </span>
                                    <span className="text-sm text-[hsl(var(--secondary))] whitespace-nowrap">
                                      {formatarData(suspensao.endDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-[1] p-4">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isSuspensaoAtiva(suspensao)
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {isSuspensaoAtiva(suspensao) ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>

                              <div className="flex-[1] p-4 flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleEditSuspensao(suspensao)}
                                  className="p-2 hover:bg-[#DDE6F2] rounded-full transition-colors"
                                >
                                  <IconEdit size={18} fill="#485B80" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSuspensao(suspensao)}
                                  className="p-2 hover:bg-[#DDE6F2] rounded-full transition-colors"
                                >
                                  <IconTrash size={18} fill="hsl(var(--primary))" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <PaginationSimple
                        totalPages={totalPages}
                        currentPage={filtro.page || 1}
                        onPageChange={handleChangePage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {editSuspensao && (
        <SideModal onClose={() => setEditSuspensao(null)} idSelector="content-container">
          <ConteudoNovaSuspensao
            suspensao={editSuspensao}
            onCancel={() => setEditSuspensao(null)}
            onSucess={() => {
              setEditSuspensao(null);
              listarSuspensoes();
            }}
          />
        </SideModal>
      )}

      {deleteSuspensao && (
        <CenterModal onClose={() => setDeleteSuspensao(null)} idSelector="content-container">
          <div className="p-6 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1B263A]">Confirmar exclusão</h2>
              <button onClick={() => setDeleteSuspensao(null)}>
                <IconX />
              </button>
            </div>

            <p className="text-[#485B80] mb-6">
              Tem certeza que deseja excluir a suspensão de{' '}
              <span className="font-semibold">{deleteSuspensao.user?.name}</span>? Esta ação não
              pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteSuspensao(null)}
                className="px-4 py-2 rounded-[0.5rem] border border-[#DDE6F2] text-[#485B80] hover:bg-[#F2F4F7]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSuspensao}
                className="px-4 py-2 rounded-[0.5rem] bg-red-600 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </CenterModal>
      )}
    </main>
  );
}
