'use client';
import { PageTitle } from '@/components/commons/page-title';
import PesquisarSuspensoes from '@/components/sections/deals/pesquisar-suspensoes';
import { ModalSuspensaoFiltro } from '@/components/sections/deals/modal-suspensao-filtro';
import { ModalNovaSuspensao } from '@/components/sections/deals/modal-nova-suspensao';
import { useEffect, useState } from 'react';
import { SuspensionFilter, Suspension } from '@/types/suspension';
import { AppServices } from '@/services/app.services';
import IconFilter from '@/components/icons/icon-filter';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';
import toast from 'react-hot-toast';
import PaginationSimple from '@/components/commons/pagination/PaginationSimple';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';
import { IconEdit } from '@/components/icons/icon-edit';
import IconTrash from '@/components/icons/icon-trash';
import SideModal from '@/components/commons/modais/side-modal';
import { ConteudoNovaSuspensao } from '@/components/sections/deals/conteudo-nova-suspensao';
import CenterModal from '@/components/commons/modais/center-modal';
import IconX from '@/components/icons/icon-x';

export default function SuspensoesPage() {
  const api = new AppServices();
  const appContext = useAppAuth();
  const [permitir, setPermitir] = useState<boolean>(false);
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

  const validarPermissao = async () => {
    const access = await appContext.fetchPermissions();
    if (!access) {
      setPermitir(false);
      setCarregando(false);
      return;
    }
    setPermitir(access.permissions.includes(StorePermission.STORE_EDIT_DATA_OF_STORE));
    setCarregando(false);
  };

  const listarSuspensoes = async () => {
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

  useEffect(() => {
    validarPermissao();
  }, []);

  useEffect(() => {
    if (permitir) {
      listarSuspensoes();
    }
  }, [permitir, filtro, search]);

  // Função auxiliar para verificar se a suspensão está ativa
  const isSuspensaoAtiva = (suspensao: Suspension) => {
    const now = new Date();
    const startDate = new Date(suspensao.startDate);
    const endDate = new Date(suspensao.endDate);
    return isAfter(endDate, now) && !isAfter(startDate, now);
  };

  // Função auxiliar para formatar datas
  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (carregando && !suspensoes.length) {
    return <LoadingGlobal />;
  }

  if (!permitir) {
    return (
      <div className="h-full flex items-center justify-center">
        <NoData label="Você não tem permissão para acessar esta página" />
      </div>
    );
  }

  return (
    <main className="min-h-full flex flex-col">
      <section className="bg-[#F2F4F7]">
        <div className="container mx-auto">
          <div className="py-6 md:py-10 px-4 md:px-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <PageTitle title="Suspensões de Atendimento" />

              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button
                  className="bg-white p-2 rounded-[0.5rem]"
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
        </div>
      </section>

      <section className="flex-1 px-4 md:px-10 py-6 bg-white">
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
              {/* Indicadores de sombra para rolagem horizontal */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 md:hidden"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 md:hidden"></div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#DDE6F2] scrollbar-track-transparent scrollbar-thumb-rounded-full pb-2">
                <div className="min-w-[800px] overflow-hidden rounded-lg border border-[#DDE6F2]">
                  {/* Cabeçalho da tabela */}
                  <div className="flex flex-row w-full bg-[#E3E6EC] text-[#7F8999] text-sm font-medium sticky top-0">
                    <div className="flex-[3] p-4 whitespace-nowrap">Usuário</div>
                    <div className="flex-[3] p-4 whitespace-nowrap">Período</div>
                    <div className="flex-[1] p-4 whitespace-nowrap">Status</div>
                    <div className="flex-[1] p-4 text-center whitespace-nowrap">Ações</div>
                  </div>

                  {/* Linhas da tabela */}
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
      </section>

      {/* Modal de edição */}
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

      {/* Modal de confirmação de exclusão */}
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
