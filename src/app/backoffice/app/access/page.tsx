'use client';

import InputPesquisarBlue from '@/components/commons/inputs/input-pesquisar-blue';
import Pagination from '@/components/commons/pagination/Pagination';
import CalendarSelect from '@/components/inputs/select/CalendarSelect';
import { cn } from '@/lib/class-name.utils';
import { useEffect, useState } from 'react';
import CardStatus from '@/components/cards/CardStatus';
import { IconEdit } from '@/components/icons/icon-edit';
import { IconDelete } from '@/components/icons/icon-delete';
import SideModal from '@/components/commons/modais/side-modal';
import { ModalTitle } from '@/components/commons/modal-title';
import PopAdministrador from '@/components/sections/backoffice/PopAdministrador';
import { Admin } from '@/types/customer';
import { apiAdmin } from '@/utils/classes/api';
import toast from 'react-hot-toast';
import handleDate from '@/utils/classes/format/time';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import CenterModal from '@/components/commons/modais/center-modal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, sendSignal } from '@/redux/store';
import Search from '@/components/inputs/search/Search';
import Spinner from '@/components/loading/Spinner';
import NoData from '@/components/commons/estados/NoData';
import ButtonAdd from '@/components/commons/buttons/button-add';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import AvatarUser from '@/components/commons/avatar-user';
import { profileImageUrl } from '@/lib/profile.utils';

const padding = 'p-8 px-4 lg:px-12';

export default function PageAcessos() {
  const dispatch = useDispatch();

  const messager = useSelector((state: RootState) => state);

  useEffect(() => {
    if (messager.signal === 'reloadUsers') {
      loadUsuarios();
    }
  }, [messager]);

  const [filtros, setFiltros] = useState<any>({
    period: {
      from: null,
      to: null,
    },
    search: '',
    status: 'all',
  });

  const [popVisible, setPopVisible] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalUsers, setTotalUsuarios] = useState<number>(0);
  const [limit, setLimit] = useState<number>(4);
  const [data, setData] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentUsuario, setCurrentUsuario] = useState<Admin>();

  async function loadUsuarios() {
    setLoading(true);
    const [response, error] = await apiAdmin.get(
      `/backoffice/admin/users${apiAdmin.query.searchInMemoryQuerys({
        page: page,
        itemsByPage: limit,
        search: filtros.search,
        status: filtros.status,
        dataInitial: filtros.period.from ? filtros.period.from.toISOString() : null,
        dataFinal: filtros.period.to ? filtros.period.to.toISOString() : null,
      })}`,
    );
    setLoading(false);
    if (error) {
      return toast.error(error.message);
    }
    setData(response.data.users);
    setTotalPage(response.data.totalPages);
    setTotalUsuarios(response.data.totalUsers);
  }

  useEffect(() => {
    loadUsuarios();
  }, [filtros, page, limit]);

  useEffect(() => {
    if (currentUsuario) {
      setPopVisible(true);
    }
  }, [currentUsuario]);

  return (
    <main className=" flex flex-col gap-0 overflow-hidden justify-between lg:h-[100%]  relative">
      <Header
        setPopVisible={() => {
          setCurrentUsuario(undefined);
          setPopVisible(true);
        }}
        filtros={filtros}
        setFiltros={setFiltros}
      />

      <div className={cn('overflow-y-auto scroll-padrao p-0 h-full')}>
        <div className={cn('flex flex-wrap gap-6 justify-center items-start p-2 lg:p-6')}>
          {loading && (
            <div className="w-full h-full">
              <LoadingGlobal />
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="w-full h-full">
              <NoData />
            </div>
          )}
          {!loading && data.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.map((admin, i) => {
                return (
                  <Card
                    key={i}
                    setCurrentUsuario={(value: Admin) => {
                      setCurrentUsuario(value);
                      setPopVisible(true);
                    }}
                    admin={admin}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={'flex p-4 lg:p-0' + ' ' + (totalPage === 0 ? 'hidden' : '')}>
        <Pagination
          background="bg-white"
          padding={padding + ' p-4 rounded-xl lg:rounded-none '}
          totalPages={totalPage}
          setLimitItens={setLimit}
          limitItens={limit}
          limitNumberPages={2}
          label="assinantes"
          setPage={setPage}
          page={page}
          total={totalUsers}
          currentLength={data.length}
        />
      </div>
      {popVisible && (
        <SideModal
          onClose={() => {
            setCurrentUsuario(undefined);
            setPopVisible(false);
          }}
          idSelector="content-container"
        >
          <ModalTitle
            onClose={() => {
              setCurrentUsuario(undefined);
              setPopVisible(false);
            }}
            title="Criar novo usuário admin"
          />
          <PopAdministrador
            close={() => {
              setCurrentUsuario(undefined);
              setPopVisible(false);
            }}
            currentUsuario={currentUsuario}
          />
        </SideModal>
      )}
    </main>
  );
}

function Header({
  filtros,
  setFiltros,
  setPopVisible,
}: {
  filtros: any;
  setFiltros: Function;
  setPopVisible: Function;
}) {
  const [list, setList] = useState([
    {
      icon: '/icons/todos.svg',
      label: 'Todos',
      value: 'all',
      selected: true,
    },
    {
      icon: '/icons/redX.svg',
      label: 'Inativos',
      value: 'inactive',
      selected: false,
    },
    {
      icon: '/icons/redCheck.svg',
      label: 'Ativos',
      value: 'active',
      selected: false,
    },
  ]);

  function setPesquisa(value: any) {
    setFiltros((old: any) => {
      return {
        ...old,
        search: value ?? '',
      };
    });
  }
  function setPeriodo(value: any) {
    setFiltros((old: any) => {
      return {
        ...old,
        period: value ?? {
          from: null,
          to: null,
        },
      };
    });
  }

  useEffect(() => {
    setFiltros((old: any) => {
      return {
        ...old,
        status: list.find((obj) => obj.selected)?.value,
      };
    });
  }, [list]);

  return (
    <div className={padding + ' bg-white'}>
      <div className="flex flex-row justify-between items-end gap-4 flex-wrap w-full">
        <div className="lg:block flex items-center gap-8 w-full lg:w-fit justify-between lg:justify-start ">
          <h2 className="text-[#24292E] text-[20px] lg:text-[36px] font-semibold">
            Gestão de permissões e acessos
          </h2>
          <div className="items-center gap-1 hidden lg:flex">
            <svg
              width="18"
              height="18"
              className="translate-y-[-2px]"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 9C1 5.22876 1 3.34315 2.17157 2.17157C3.34315 1 5.22876 1 9 1C12.7712 1 14.6569 1 15.8284 2.17157C17 3.34315 17 5.22876 17 9C17 12.7712 17 14.6569 15.8284 15.8284C14.6569 17 12.7712 17 9 17C5.22876 17 3.34315 17 2.17157 15.8284C1 14.6569 1 12.7712 1 9Z"
                stroke="#434D56"
                strokeWidth="1.3"
              />
              <path
                d="M6.2002 9.4L7.8002 11L11.8002 7"
                stroke="#434D56"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <b className="text-[#657380] text-[18px]">Descrição</b>
          </div>
          <div className="block lg:hidden">
            <ModalNotificacoes />
          </div>
        </div>
        <div className="flex gap-4 lg:w-auto w-full items-center">
          <ButtonAdd
            onClick={() => {
              setPopVisible();
            }}
            title="Criar novo login"
          />
          <div className="hidden lg:block">
            <ModalNotificacoes />
          </div>
        </div>
      </div>
      <div className="flex lg:flex-row flex-col-reverse items-center flex-wrap w-full mt-6 justify-between gap-6">
        <FiltroBacana list={list} setList={setList} />
        <div className="flex gap-2 flex-grow lg:w-auto w-full">
          <div className="lg:hidden flex flex-grow w-full">
            <Search
              placeholder="Procurar por Cliente"
              setValue={setPesquisa}
              onSearch={() => {}}
              value={filtros.search}
            />
          </div>
          <div className="lg:flex hidden items-center flex-grow w-full">
            <InputPesquisarBlue
              classNameBar="w-full flex-grow"
              placeholder="Procurar por Cliente"
              onChange={(value) => {
                setPesquisa(value);
              }}
              value={filtros.search}
            />
          </div>
          <div className="lg:flex hidden">
            <CalendarSelect
              range={filtros.period}
              setRange={(value) => {
                setPeriodo(value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltroBacana({
  list,
  setList,
}: {
  list: { icon: string; label: string; value: string; selected: boolean }[];
  setList: Function;
}) {
  function select(index: number) {
    setList((old: any) => {
      const updatedList = old.map((item: any, i: number) => ({
        ...item,
        selected: i === index,
      }));
      return updatedList;
    });
  }

  return (
    <>
      <div className="flex lg:flex-grow-0 flex-grow lg:w-auto w-full gap-3 p-2 bg-[#E3EBF3] rounded-lg">
        {list.map((obj, i) => {
          return (
            <button
              key={i}
              className={cn(
                'p-2 flex-grow lg:w-[169px] flex items-center justify-center duration-300 ease-in-out gap-2 rounded-lg font-semibold',
                obj.selected ? 'bg-[#2A3E65] text-white' : 'text-[#434D56]',
              )}
              onClick={() => select(i)}
            >
              <img src={obj.icon} alt="" />
              {obj.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Card({ admin, setCurrentUsuario }: { admin: Admin; setCurrentUsuario: Function }) {
  const info = [
    {
      label: 'Possui acesso á',
      value: `${separarCamelCase(admin.permissions.slice(0, 2).join(','))}${admin.permissions.length > 2 ? '...' : ''}`,
    },
    {
      label: 'Data de criação',
      value: handleDate.formatISODate(admin.createdAt, `dd 'de' MMM yyyy`),
    },
  ];
  const [deletarModal, setDeletarModal] = useState<boolean>(false);

  function separarCamelCase(frase: string) {
    return frase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/\b[Cc]opiloto\b/g, '');
  }
  return (
    <div className="flex flex-col gap-3 p-5 w-full rounded-2xl shadow-md bg-white">
      <PopDeletarCard admin={admin} deletarModal={deletarModal} setDeletarModal={setDeletarModal} />
      <div className="w-full flex justify-between gap-4 lg:gap-32 items-center">
        <div className="flex items-center gap-2 truncate">
          <AvatarUser name={admin.name} src={profileImageUrl(admin.id)} />
          <div className="w-full flex flex-col gap-0 lg:leading-5 truncate">
            <b className="text-[#24292E] text-[12px] lg:text-[20px]">{admin.name}</b>
            <span className="text-[10px] lg:text-[16px] text-[#657380] truncate">
              {admin.email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CardStatus status={admin.status === 'active' ? true : false} />
          <button onClick={() => setCurrentUsuario(admin)} className="ml-1">
            <IconEdit fill="hover:fill-[black] duration-300 ease-in-out fill-[#657380]" />
          </button>
          <button onClick={() => setDeletarModal(true)}>
            <IconDelete className="group-hover:fill-[black] duration-300 ease-in-out fill-[#657380]" />
          </button>
        </div>
      </div>
      <div className="flex justify-between lg:flex-row gap-2 items-start flex-col border-t border-[#E3EBF3] pt-4 mt-2">
        {info.map((obj, i) => {
          return (
            <div key={i} className="flex flex-col gap-0">
              <span
                className="text-[10px] text-[#657380]"
                title={separarCamelCase(admin.permissions.join(','))}
              >
                {obj.label}
              </span>
              <b
                className="text-[12px] text-[#434D56] break-words"
                title={separarCamelCase(admin.permissions.join(','))}
              >
                {obj.value}
              </b>
            </div>
          );
        })}
        <div className="bg-[#EDF2F7] p-2 text-[#24292E] text-[10px] rounded-lg font-semibold">
          Gerente comercial
        </div>
      </div>
    </div>
  );
}

function PopDeletarCard({
  admin,
  setDeletarModal,
  deletarModal,
}: {
  admin: Admin | undefined;
  deletarModal: boolean;
  setDeletarModal: Function;
}) {
  const dispatch = useDispatch();

  const messager = useSelector((state: RootState) => state);
  const [loading, setLoading] = useState<boolean>(false);
  async function deleteUser() {
    setLoading(true);
    const [response, error] = await apiAdmin.delete(`/backoffice/admin/user/${admin?.id}/delete`);
    if (error) {
      return toast.error(error.message);
    }
    setDeletarModal(false);
    setLoading(false);
    dispatch(
      sendSignal({
        signal: 'openModalSucessMiddle',
        data: {
          label: 'Usuário removido do sistema',
          subLabel: `O usuário "${admin?.name}" foi removido permanentemente do sistema`,
        },
      }),
    );
    setTimeout(
      () =>
        dispatch(
          sendSignal({
            signal: 'reloadUsers',
            data: {},
          }),
        ),
      120,
    );
  }

  return (
    <>
      {deletarModal && admin && (
        <CenterModal
          onClose={() => {
            setDeletarModal(false);
          }}
          idSelector="content-container"
        >
          <div className="flex flex-col items-center p-4 px-6 max-w-[460px]">
            <svg
              width="40"
              height="40"
              className="self-center"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.3999 12V21.6"
                stroke="hsl(var(--primary))"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle
                cx="20.3998"
                cy="26.3998"
                r="0.95"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--primary))"
                strokeWidth="1.3"
              />
              <path
                d="M13.7489 6.88338C16.9949 4.96113 18.6178 4 20.4 4C22.1821 4 23.8051 4.96113 27.0511 6.88338L28.1489 7.53353C31.3949 9.45579 33.0178 10.4169 33.9089 12C34.8 13.5831 34.8 15.5053 34.8 19.3499V20.6501C34.8 24.4947 34.8 26.4169 33.9089 28C33.0178 29.5831 31.3949 30.5442 28.1489 32.4665L27.0511 33.1166C23.8051 35.0389 22.1821 36 20.4 36C18.6178 36 16.9949 35.0389 13.7489 33.1166L12.6511 32.4665C9.40512 30.5442 7.78215 29.5831 6.89107 28C6 26.4169 6 24.4947 6 20.6501V19.3499C6 15.5053 6 13.5831 6.89107 12C7.78215 10.4169 9.40512 9.45579 12.6511 7.53353L13.7489 6.88338Z"
                stroke="hsl(var(--primary))"
                strokeWidth="1.3"
              />
            </svg>
            <b className="text-[#24292E] text-[18px] text-center mt-2">
              Tem certeza que deseja excluir o usuário <br /> "{admin.name}"?
            </b>
            <span className="text-[#788590] text-[14px] mt-2 text-center">
              Esta ação é irreversivel e resultará na perda de acesso e dados relacionados a este
              usuário
            </span>
            <div className="grid grid-cols-2 grid-rows-1 items-center w-full justify-around gap-3 mt-4">
              <button
                onClick={() => setDeletarModal(false)}
                className="p-3 border h-full row-span-1 col-span-2 lg:col-span-1 flex-grow text-[#586E9D] border-[#586E9D] rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                disabled={loading}
                className="p-3 border row-span-1 h-full col-span-2 lg:col-span-1 flex-grow text-secondary-foreground bg-[hsl(var(--secondary))] flex justify-center items-center font-semibold rounded-lg"
              >
                {loading ? <Spinner color="white" width="20px" /> : <>Excluir</>}
              </button>
            </div>
          </div>
        </CenterModal>
      )}
    </>
  );
}
