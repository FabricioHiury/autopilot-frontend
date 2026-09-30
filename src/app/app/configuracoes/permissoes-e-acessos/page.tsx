'use client'
import { PageTitle } from "@/components/commons/page-title";
import Pagination from "@/components/commons/pagination/Pagination";
import { useEffect, useState } from "react";
import { CardColaboradorUser } from "@/components/cards/CardColaboradorCadastro";
import { UsersListHeader } from "@/components/sections/configuracoes/AvatarListHeader";
import { ModalCargos } from "@/components/sections/configuracoes/cargos/ModalCargos";
import { SelectPadrao } from "@/components/commons/inputs/select-padrao";
import { ApiApp } from "@/lib/api-app";
import { ColaboradorType } from "@/utils/types/colaborador-type";
import { CargoCreatedType } from "@/utils/types/cargo-type";
import InputPesquisarBlue from "@/components/commons/inputs/input-pesquisar-blue";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import NoData from "@/components/commons/estados/NoData";
import toast from "react-hot-toast";


export default function ConfigPermissiesAcessosPage() {
  const api = new ApiApp();
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(true);
  const [listaUsuarios, setListaUsuarios] = useState<ColaboradorType[]>([]);
  const [cargosDisponiveis, setCargosDisponiveis] = useState<CargoCreatedType[]>([]);
  const [page, setPage] = useState<number>(1)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0)
  const [limit, setLimit] = useState<number>(6)
  const [cargoSelecionado, setCargoSelecionado] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const padding = "px-8"

  const fetchColaboradores = async () => {
    setLoadingUsuarios(true);
    const [data, error] = await api.colaborador.listar({
      pagina: page,
      quantidade: limit,
      cargo: cargoSelecionado,
      pesquisa: search,
    });

    if (error || !data) {
      toast.error('Erro ao buscar usuários');
      setLoadingUsuarios(false);
      return;
    }

    const colaboradores = data.colaboradores;

    setListaUsuarios(colaboradores);
    setTotalPage(data.totalPaginas);
    setTotalUsuarios(data.totalColaboradores);

    setLoadingUsuarios(false);
  }

  const removerDaLista = (idColaborador: string) => {
    const colaboradoresFiltrados = listaUsuarios.filter((colaborador) => colaborador.id !== idColaborador);
    setListaUsuarios(colaboradoresFiltrados);
  }

  const fecthCargos = async () => {
    const [data, error] = await api.cargo.listar();
    if (data) {
      setCargosDisponiveis(data);
    }
  }

  const onCargoChange = (cargo?: string) => {
    if (cargo === 'todos') {
      setCargoSelecionado('');
      return;
    }
    setCargoSelecionado(cargo || '');
  }

  useEffect(() => {
    fecthCargos();
  }, []);

  useEffect(() => {
    fetchColaboradores();
  }, [cargoSelecionado, page, limit, search]);

  return (
    <main className="grid grid-rows-[auto_1fr_auto] min-h-full h-full">
      <div className="w-full p-4 flex flex-col gap-2 lg:gap-6 md:px-10 md:pt-10 bg-white top-0 z-10">
        <div className="flex flex-col gap-4 lg:flex-row w-full items-start justify-between">
          <div className="flex items-center gap-4 w-full justify-between md:justify-start">
            <PageTitle title="Permissões e Acessos" />
            <ModalCargos />
          </div>

          <div className="flex gap-3 items-center md:justify-end w-full flex-1">
            <InputPesquisarBlue
              placeholder="Pesquisar"
              value={search}
              onChange={setSearch}
              className="sm:w-full md:min-w-[24rem]  bg-white rounded-lg flex items-center pl-10 py-6 text-[14px]"
              classNameBar=" w-full md:w-[24rem]"
            />

            <div className="hidden md:block">
              <SelectPadrao
                options={[
                  { label: 'Todos', value: 'todos' },
                  ...cargosDisponiveis.map((c) => {
                    return { label: c.cargo, value: c.cargo }
                  })]}
                value={cargoSelecionado}
                placeholder="Todos"
                className="h-[49px] px-3"
                onChange={onCargoChange}
              />
            </div>
          </div>
        </div>

        <UsersListHeader />
      </div>

      {loadingUsuarios &&
        <div className="flex w-full h-full justify-center items-center">
          <LoadingGlobal />
        </div>}

      {!loadingUsuarios && listaUsuarios.length === 0 &&
        <div className="flex w-full h-full justify-center items-center">
          <NoData />
        </div>}

      {!loadingUsuarios && listaUsuarios.length > 0 &&
        <div className="content sm:mt-1 px-4 py-6 gap-2 md:gap-6 md:p-10 md:pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listaUsuarios.map((user) => (
              <CardColaboradorUser key={user.id} colaborador={user} onDelete={() => { removerDaLista(user.id) }} onEdit={() => fetchColaboradores()} />
            ))}
          </div>
        </div>
      }

      <div className="w-full bg-white">
        <Pagination
          background="bg-white"
          padding={padding + " p-4"}
          totalPages={totalPage}
          setLimitItens={setLimit}
          limitItens={limit}
          limitNumberPages={2}
          setPage={setPage}
          page={page}
          total={totalUsuarios}
          currentLength={listaUsuarios.length}
        />
      </div>
    </main>
  );
}

