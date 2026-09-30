"use client";
import {
  ColaboradorType,
  CriarColaboradorDto,
} from "@/utils/types/colaborador-type";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  ApiResponseLoginType,
  ComentarioListType,
  ComentarioType,
} from "./api-response-types";
import { CargoCreatedType } from "@/utils/types/cargo-type";
import {
  AtendimentoCompletoType,
  ResponseListAtentimentoType,
} from "@/utils/types/atentimento-lista-type";
import { STATUS_ATENDIMENTO } from "@/utils/types/status-atentimento-enum";
import { ChatEmListaType, MensagemType } from "@/utils/types/chat.type";
import {
  AtendimentoAnexosListarType,
  AtentimentoAnexosChatType,
} from "@/utils/types/atendimento-anexos-type";
import { VisitaType } from "@/utils/types/visita-type";
import { ListarTicketsType } from "@/utils/types/ticket-type";
import {
  NotificacaoI,
  StatusNotificacaoEnum,
} from "@/utils/types/notificacao-type";
import { ClienteType } from "@/utils/types/dataTypes";
import {
  KEY_PERMISSOES_LOJA,
} from "@/utils/types/permissoes_funcionalidades.enum";
import { getStoreStorageId } from './user.utils';
import { RelatorioGeral } from "@/model/relatorio-geral";
import { RelatorioAtendimentoCanal } from "@/model/relatorio-atendimento-canal";
import { RelatorioVendedorEspecifico } from "@/model/relatorio-vendedor-especifico";
import { RelatorioVendedor } from "@/model/relatorio-vendedor";
import { Colaborador } from "@/model/colaborador";
import { TagAtendimento } from "@/model/tag";

export type MensagemPadrao = {
  id: string;
  titulo: string;
  conteudo: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Retorno<retornoType> = [retornoType | null, { message: string } | null];

export class ApiApp {
  static axios: AxiosInstance;
  constructor() {
    ApiApp.axios = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    ApiApp.axios.interceptors.request.use((config) => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("token-backoffice");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  auth = {
    login: this.login,
    recuperarSenha: this.recuperarSenha,
    redefinirSenha: this.redefinirSenha,
    acesso: this.pegarAcesso,
  };

  private async login(
    email: string,
    senha: string
  ): Promise<Retorno<ApiResponseLoginType>> {
    try {
      const { data: response } = await ApiApp.axios.post("/auth/login", {
        email,
        senha,
      });
      return [response.data as ApiResponseLoginType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Erro ao efetuar o login.";
        return [null, { message: errorMessage }];
      }

      return [null, { message: "Erro ao efetuar o login." }];
    }
  }

  private async recuperarSenha(email: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(`/auth/esqueci-senha/${email}`);

      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Email inválido." }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao recuperar a senha." }];
    }
  }

  private async redefinirSenha(
    token: string,
    senha: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/auth/redefinir-senha`,
        { senha, token }
      );
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Token inválido." }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao redefinir a senha." }];
    }
  }

  private async pegarAcesso(): Promise<
    Retorno<{
      cargo: string[];
      permissao: KEY_PERMISSOES_LOJA[];
      consultaEm: Date;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get("/loja/meu-acesso");

      if (!response.data) {
        return [null, { message: "Erro ao pegar o acesso." }];
      }

      return [
        {
          cargo: response.data.cargo,
          permissao: response.data.permissao,
          consultaEm: new Date(response.data.consultaEm),
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para acessar essa funcionalidade" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao pegar o acesso." }];
    }
  }

  cargo = {
    salvar: this.saveCargo,
    listar: this.listCargos,
    deletar: this.deleteCargo,
  };

  async saveCargo(
    cargo: string,
    funcionalidades: string[],
    id?: string
  ): Promise<Retorno<CargoCreatedType>> {
    try {
      const { data: response } = await ApiApp.axios.put("/loja/cargo", {
        cargo,
        funcionalidades,
        id,
      });
      return [response.data as CargoCreatedType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para criar cargos" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao criar o cargo." }];
    }
  }

  async listCargos(): Promise<Retorno<CargoCreatedType[]>> {
    try {
      const { data: response } = await ApiApp.axios.get("/loja/cargo");
      return [response.data.cargos as CargoCreatedType[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar os cargos" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao listar os cargos." }];
    }
  }

  async deleteCargo(id: string): Promise<Retorno<void>> {
    try {
      await ApiApp.axios.delete(`/loja/cargo`, { data: { id } });
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para deletar cargos" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao deletar o cargo." }];
    }
  }

  integracoes = {
    listar: this.listarIntegracoes,
  };

  async listarIntegracoes(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        "/integracao/status-integracoes"
      );
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar as integrações" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao listar as integrações." }];
    }
  }

  colaborador = {
    criar: this.criarColaborador,
    listar: this.listarColaboradores,
    pegar: this.pegarColaborador,
    atualizar: this.atualizarColaborador,
  };

  async criarColaborador(
    colaborador: CriarColaboradorDto
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        "/colaborador/criar-colaborador",
        colaborador
      );
      return [response.data as any, null];
    } catch (error) {
      const errorAxios = error as AxiosError<{ message: string }>;
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para criar colaboradores" }];
      }

      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: "E-mail já cadastrado, utilize outro e-mail" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      if (errorAxios.response?.data.message.includes("email")) {
        return [null, { message: "Email já cadastrado no banco" }];
      }

      return [null, { message: "Erro ao criar o colaborador" }];
    }
  }

  async atualizarColaborador(
    idColaborador: string,
    colaborador: CriarColaboradorDto
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/colaborador/editar-colaborador/${idColaborador}`,
        colaborador
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para atualizar colaboradores" }];
      }

      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: "E-mail já cadastrado, utilize outro e-mail" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao atualizar o colaborador." }];
    }
  }

  async listarColaboradores(params: {
    pagina?: number;
    quantidade?: number;
    pesquisa?: string;
    cargo?: string;
  }): Promise<
    Retorno<{
      pagina: number;
      quantidade: number;
      totalPaginas: number;
      totalColaboradores: number;
      colaboradores: ColaboradorType[];
    }>
  > {
    const pagina = params.pagina || 1;
    const quantidade = params.quantidade || 10;
    const pesquisa = params.pesquisa || "";
    const cargo = params.cargo || "";

    try {
      const { data: response } = await ApiApp.axios.get(
        "/colaborador/busca-colaboradores",
        {
          params: { pagina, quantidade, pesquisa, cargo },
        }
      );
      return [
        response.data as {
          pagina: number;
          quantidade: number;
          totalPaginas: number;
          totalColaboradores: number;
          colaboradores: ColaboradorType[];
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar os colaboradores" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar os colaboradores" }];
    }
  }

  async pegarColaborador(
    idColaborador: string
  ): Promise<Retorno<ColaboradorType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/colaborador/busca-colaborador/${idColaborador}`
      );
      return [response.data as ColaboradorType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para pegar os colaboradores" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível pegar o colaborador" }];
    }
  }

  cliente = {
    listar: this.listarClientes,
    cadastrar: this.cadastrarCliente,
  };

  async cadastrarCliente(cliente: {
    nome: string;
    tipoPessoa: "fisica" | "juridica";
    documentoFiscal: string;
    rg?: string;
    estrangeiro: boolean;
    genero?: "masculino" | "feminino" | "outro";
    dataNascimento: string;
    telefone?: string;
    whatsapp: string;
    email?: string;
    observacoes?: string;
    cep: string;
    uf: string;
    municipio: string;
    endereco: string;
    bairro: string;
    numero: string;
    complemento?: string;
  }): Promise<Retorno<ClienteType>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        "/cliente/criar",
        cliente
      );
      return [response.data as ClienteType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para cadastrar clientes" }];
      }

      if (error instanceof AxiosError && error.response?.status === 409) {
        return [null, { message: "Cliente já cadastrado com este documento ou whatsapp" }];
      }

      if (error instanceof AxiosError && error.response?.status === 400) {
        return [null, { message: "Dados inválidos para cadastro de cliente" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível cadastrar o cliente" }];
    }
  }

  async listarClientes(
    params?:
      | string
      | {
        pesquisa?: string;
        pagina?: number;
        quantidade?: number;
        dataInicial?: string;
        dataFinal?: string;
        genero?: string;
        estado?: string;
        canalOrigem?: string;
        uf?: string;
        termo?: string;
      }
  ): Promise<
    Retorno<{
      pagina: number;
      quantidade: number;
      totalPaginas: number;
      totalClientes: number;
      clientes: ClienteType[];
    }>
  > {
    try {
      let url = "/cliente/listar";
      let queryParams = {};

      if (typeof params === "string") {
        url += params;
      } else if (params) {
        const pagina = params.pagina || 1;
        const quantidade = params.quantidade || 100;

        queryParams = {
          pagina,
          quantidade,
          ...(params.pesquisa && { pesquisa: params.pesquisa }),
          ...(params.termo && { termo: params.termo }),
          ...(params.dataInicial && { dataInicial: params.dataInicial }),
          ...(params.dataFinal && { dataFinal: params.dataFinal }),
          ...(params.genero && { genero: params.genero }),
          ...(params.estado && { estado: params.estado }),
          ...(params.uf && { uf: params.uf }),
          ...(params.canalOrigem && { canalOrigem: params.canalOrigem }),
        };
      }

      const { data: response } = await ApiApp.axios.get(url, {
        params: typeof params === "string" ? {} : queryParams,
      });

      return [
        response.data as {
          pagina: number;
          quantidade: number;
          totalPaginas: number;
          totalClientes: number;
          clientes: ClienteType[];
        },
        null,
      ];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar os clientes" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar os clientes" }];
    }
  }

  atendimento = {
    listar: this.listarAtendimentos,
    listarChats: this.listarChatsAtendimento,
    pegar: this.pegarAtendimento,
    alterarStatus: this.alterarStatusAtendimento,
    editarOrigem: this.editarOrigemAtendimento,
    editarTitulo: this.editarTituloAtendimento,
    editarDescricao: this.editarDescricaoAtendimento,
    comentarios: this.listarComentariosAtendimento,
    adicionarComentario: this.adicionarComentarioAtendimento,
    tarefasListar: this.listarTarefasAtendimento,
    tarefasCriar: this.criarTarefaAtendimento,
    tarefasEditar: this.editarTarefaAtendimento,
    tarefasPegar: this.pegarTarefaAtendimento,
    tarefasConcluir: this.concluirTarefaAtendimento,
    tarefasDeletar: this.deletarTarefaAtendimento,
    anexosListar: this.listarAnexosAtendimento,
    anexosChat: this.listarAnexosAtendimentoChat,
    criarVisita: this.criarVisitaAtendimento,
    visitasListar: this.listarVisitasAtendimento,
    visitasAlterarStatus: this.alterarStatusVisita,
    visitasDeletar: this.deletarVisita,
    editarCliente: this.editarClienteAtendimento,
    compartilhamentoAdicionar: this.adicionarCompatilhamentoAtendimento,
    compartilhamentoRemover: this.removerCompatilhamentoAtendimento,
    compartilhamentoListar: this.listarCompartilhamentoAtendimento,
    suspensaoListar: this.listarSuspensaoAtendimento,
    suspensaoCriar: this.criarSuspensaoAtendimento,
    suspensaoAtualizar: this.atualizarSuspensaoAtendimento,
    suspensaoRemover: this.removerSuspensaoAtendimento,
    suspensaoVerificar: this.verificarSuspensaoAtendimento,
    listarHistoricoCliente: this.listarHistoricoClienteAtendimento,
    criarTag: this.registrarTagAtendimento,
    buscarTags: this.buscarTagsAtendimento,
    atualizarTag: this.atualizarTagAtendimento,
    removerTag: this.removerTagAtendimento,
    vincularTag: this.vincularTagAtendimento,
    arquivar: this.arquivarAtendimento,
    desarquivar: this.desarquivarAtendimento,
    remover: this.removerAtendimento,
  };

  private async listarAtendimentos({
    pesquisa,
    modoAtendimento,
    origem,
    colaboradorIds,
    pagina,
    status,
    itensPagina,
    dataInicial,
    dataFinal,
    orderBy,
    orderDirection,
    tarefasAtribuidas,
    telefoneLike,
    isArchived,
    idTag,
  }: {
    pesquisa?: string;
    modoAtendimento?: string;
    origem?: string;
    colaboradorIds?: string[];
    pagina?: number;
    status?: STATUS_ATENDIMENTO;
    itensPagina?: number;
    dataInicial?: Date;
    dataFinal?: Date;
    orderBy?: "criadoEm" | "atualizadoEm" | "status";
    orderDirection?: "asc" | "desc" | "status";
    tarefasAtribuidas?: string;
    telefoneLike?: string;
    isArchived?: boolean;
    idTag?: string;
  }): Promise<Retorno<ResponseListAtentimentoType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        "/atendimento/listar-atendimentos",
        {
          params: {
            pesquisa,
            modoAtendimento,
            status,
            origem,
            colaboradorIds,
            pagina,
            itensPagina,
            dataInicial,
            dataFinal,
            orderBy,
            orderDirection,
            tarefasAtribuidas,
            telefoneLike,
            isArchived,
            idTag,
          },
        }
      );
      return [response.data as ResponseListAtentimentoType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar os atendimentos" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar os atendimentos" }];
    }
  }

  private async listarChatsAtendimento({
    pesquisa,
    modoAtendimento,
    origem,
    colaboradorIds,
    pagina,
    status,
    itensPagina,
    dataInicial,
    dataFinal,
    orderBy,
    orderDirection,
    telefoneLike,
  }: {
    pesquisa?: string;
    modoAtendimento?: string;
    origem?: string;
    colaboradorIds?: string[];
    pagina?: number;
    status?: STATUS_ATENDIMENTO;
    itensPagina?: number;
    dataInicial?: Date;
    dataFinal?: Date;
    orderBy?: "criadoEm" | "atualizadoEm" | "status";
    orderDirection?: "asc" | "desc" | "status";
    telefoneLike?: string;
  }): Promise<Retorno<ResponseListAtentimentoType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        "/atendimento/listar-chats",
        {
          params: {
            pesquisa,
            modoAtendimento,
            origem,
            colaboradorIds,
            pagina,
            itensPagina,
            dataInicial,
            dataFinal,
            orderBy,
            orderDirection,
            telefoneLike,
          },
        }
      );
      return [response.data as ResponseListAtentimentoType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar os chats" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar os chats" }];
    }
  }

  private async pegarAtendimento(
    idAtendimento: string
  ): Promise<Retorno<AtendimentoCompletoType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/atendimento/${idAtendimento}`
      );
      return [response.data as AtendimentoCompletoType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para pegar os atendimentos" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível pegar o atendimento" }];
    }
  }

  private async alterarStatusAtendimento(params: {
    id: string;
    status: STATUS_ATENDIMENTO;
    origemAtendimento?: string;
    temperatura: "frio" | "quente" | "morno";
    idResponsaveis: string[];
    observacao: string;
  }): Promise<Retorno<any>> {
    try {
      const { id, ...data } = params;
      await ApiApp.axios.put(`/atendimento/${id}/editar`, data);
      return [{ message: "ok" }, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para alterar o status do atendimento",
          },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 403) {
        return [
          null,
          { message: "Você não tem permissão para alterar o status do atendimento" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível alterar o status do atendimento" }];
    }
  }

  private async editarOrigemAtendimento(
    id: string,
    origemAtendimento: string,
    idResponsaveis?: string[],
    idTags?: string[]
  ): Promise<Retorno<any>> {
    try {
      const body: any = { origemAtendimento };
      if (idResponsaveis && idResponsaveis.length) {
        body.idResponsaveis = idResponsaveis;
      }
      if (idTags && idTags.length) {
        body.idTags = idTags;
      }
      await ApiApp.axios.put(`/atendimento/${id}/editar`, body);
      return [{ message: "ok" }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para alterar o atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 403) {
        return [null, { message: "Você não tem permissão para alterar o atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível alterar o atendimento" }];
    }
  }

  private async editarTituloAtendimento(params: {
    id: string;
    titulo: string;
  }): Promise<Retorno<any>> {
    try {
      const { id, ...data } = params;
      await ApiApp.axios.patch(`/atendimento/${id}/alterar-titulo`, data);
      return [{ message: "ok" }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para alterar o atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível alterar o atendimento" }];
    }
  }

  private async editarDescricaoAtendimento(params: {
    id: string;
    descricao: string;
  }): Promise<Retorno<any>> {
    try {
      const { id, ...data } = params;
      await ApiApp.axios.patch(`/atendimento/${id}/alterar-descricao`, data);
      return [{ message: "ok" }, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para alterar o atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível alterar o atendimento" }];
    }
  }

  private async listarComentariosAtendimento(
    idAtendimento: string,
    params?: { pagina: number; itensPagina: number }
  ): Promise<Retorno<ComentarioListType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/atendimento/${idAtendimento}/comentarios?pagina=${params?.pagina || 1
        }&itensPagina=${params?.itensPagina || 10}`
      );
      return [response.data as ComentarioListType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar os comentários do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar os comentários do atendimento" }];
    }
  }

  private async adicionarComentarioAtendimento(params: {
    idAtendimento: string;
    comentario: string;
  }): Promise<Retorno<ComentarioType>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/atendimento/${params.idAtendimento}/comentario`,
        { comentario: params.comentario }
      );

      return [response.data as ComentarioType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para adicionar comentários ao atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível adicionar comentários ao atendimento" }];
    }
  }

  private async listarTarefasAtendimento(
    idAtendimento: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/atendimento/${idAtendimento}/tarefas`);

      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar as tarefas do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar as tarefas do atendimento" }];
    }
  }

  private async criarTarefaAtendimento(
    idAtendimento: string,
    tarefa: {
      nome: string;
      observacoes: string;
      idResponsavel: string;
      horaInicio?: string;
      horaFim: string;
      data: string;
    }
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/atendimento/${idAtendimento}/tarefas`,
        tarefa
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para criar tarefas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível criar tarefas no atendimento" }];
    }
  }

  private async editarTarefaAtendimento(
    idAtendimento: string,
    idTarefa: string,
    tarefa: {
      nome: string;
      observacoes?: string;
      idResponsavel: string;
      horaInicio?: string;
      horaFim: string;
      data: string;
    }
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/atendimento/${idAtendimento}/tarefas/${idTarefa}`,
        tarefa
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para editar tarefas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível editar tarefas no atendimento" }];
    }
  }

  private async pegarTarefaAtendimento(
    idAtendimento: string,
    idTarefa: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/atendimento/${idAtendimento}/tarefas/${idTarefa}`);

      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para pegar tarefas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível pegar tarefas no atendimento" }];
    }
  }

  private async concluirTarefaAtendimento(
    idAtendimento: string,
    idTarefa: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(`/atendimento/${idAtendimento}/tarefas/${idTarefa}`);

      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para concluir tarefas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível concluir tarefas no atendimento" }];
    }
  }

  private async deletarTarefaAtendimento(
    idAtendimento: string,
    idTarefa: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.delete(`/atendimento/${idAtendimento}/tarefas/${idTarefa}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para deletar tarefas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível deletar tarefas no atendimento" }];
    }
  }

  private async listarAnexosAtendimento(params: {
    idAtendimento: string;
    quantidade: number;
    pagina: number;
  }): Promise<Retorno<AtendimentoAnexosListarType>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/atendimento/${params.idAtendimento}/anexos?itensPorPagina=${params.quantidade}&pagina=${params.pagina}`
      );
      return [response.data as AtendimentoAnexosListarType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar anexos no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar anexos no atendimento" }];
    }
  }

  private async listarAnexosAtendimentoChat(params: {
    idAtendimento: string;
  }): Promise<Retorno<AtentimentoAnexosChatType[]>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/atendimento/${params.idAtendimento}/anexos-chat`);

      return [response.data as AtentimentoAnexosChatType[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar anexos no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar anexos no atendimento" }];
    }
  }

  private async criarVisitaAtendimento(visita: {
    tipo: string;
    idAtendimento: string;
    horaInicio: string;
    horaFim?: string;
    data: string;
  }): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/atendimento/${visita.idAtendimento}/visitas`,
        {
          tipo: visita.tipo,
          horaInicio: visita.horaInicio,
          horaFim: visita.horaFim,
          data: visita.data,
        }
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para criar visitas no atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [
        null,
        { message: "Não foi possível criar visitas no atendimento" },
      ];
    }
  }

  private async listarVisitasAtendimento(
    idAtendimento: string
  ): Promise<Retorno<VisitaType[]>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/atendimento/${idAtendimento}/visitas`);
      return [response.data as VisitaType[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar as tarefas do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [
        null,
        { message: "Não foi possível listar as tarefas do atendimento" },
      ];
    }
  }

  private async alterarStatusVisita(
    idAtendimento: string,
    idVisita: string
  ): Promise<Retorno<VisitaType>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/atendimento/${idAtendimento}/visitas/${idVisita}`
      );
      return [response.data as VisitaType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para alterar visitas do atendimento",
          },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [
        null,
        { message: "Não foi possível listar alterar visita do atendimento" },
      ];
    }
  }

  private async deletarVisita(
    idAtendimento: string,
    idVisita: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.delete(`/atendimento/${idAtendimento}/visitas/${idVisita}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para deletar visitas do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível deletar visita do atendimento" }];
    }
  }

  private async editarClienteAtendimento(
    idAtendimento: string,
    idCliente: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/atendimento/${idAtendimento}/alterar-cliente/${idCliente}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para editar o cliente do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao editar o cliente do atendimento" }];
    }
  }

  private async adicionarCompatilhamentoAtendimento(
    idAtendimento: string,
    idColaborador: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/atendimento/${idAtendimento}/compartilhamento/${idColaborador}`
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para adicionar compartilhamento no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao adicionar compartilhamento no atendimento" },
      ];
    }
  }

  private async removerCompatilhamentoAtendimento(
    idAtendimento: string,
    idColaborador: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.delete(
        `/atendimento/${idAtendimento}/compartilhamento/${idColaborador}`
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para remover compartilhamento no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao remover compartilhamento no atendimento" },
      ];
    }
  }

  private async listarCompartilhamentoAtendimento(
    idAtendimento: string
  ): Promise<
    Retorno<
      {
        id: string;
        colaborador: {
          id: string;
          nome: string;
          whatsapp: string;
          idUsuario: string;
          cargos: {
            cargo: string;
          }[];
        };
      }[]
    >
  > {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/atendimento/${idAtendimento}/compartilhamento`
      );
      return [
        response.data as {
          id: string;
          colaborador: {
            id: string;
            nome: string;
            whatsapp: string;
            idUsuario: string;
            cargos: {
              cargo: string;
            }[];
          };
        }[],
        null,
      ];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para listar compartilhamento no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao listar compartilhamento no atendimento" },
      ];
    }
  }

  private async registrarTagAtendimento(data: TagAtendimento): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(`/tags`, data);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para registrar tag no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao registrar tag no atendimento" },
      ];
    }
  }

  private async buscarTagsAtendimento(): Promise<Retorno<TagAtendimento[]>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/tags`);
      return [response.data.tags as TagAtendimento[], null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para buscar tags no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao buscar tags no atendimento" },
      ];
    }
  }

  private async atualizarTagAtendimento(idTag: string, data: TagAtendimento): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/tags/${idTag}`, data);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para atualizar tag no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao atualizar tag no atendimento" },
      ];
    }
  }

  private async removerTagAtendimento(idTag: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.delete(`/tags/${idTag}`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para remover tag no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao remover tag no atendimento" },
      ];
    }
  }

  private async vincularTagAtendimento(idAtendimento: string, idTags: string[], idResponsaveis: string[], origemAtendimento?: string): Promise<Retorno<any>> {
    try {
      const payload: any = { idTags, idResponsaveis };
      if (origemAtendimento) payload.origemAtendimento = origemAtendimento;
      const { data: response } = await ApiApp.axios.put(`/atendimento/${idAtendimento}/editar`, payload);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message:
              "Você não tem permissão para vincular tag no atendimento",
          },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [
        null,
        { message: "Erro ao vincular tag no atendimento" },
      ];
    }
  }

  private async arquivarAtendimento(idAtendimento: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.patch(`/atendimento/${idAtendimento}/arquivar`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para arquivar o atendimento" }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [null, { message: "Erro ao arquivar o atendimento" }];
    }
  }

  private async desarquivarAtendimento(idAtendimento: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.patch(`/atendimento/${idAtendimento}/desarquivar`);
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para desarquivar o atendimento" }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [null, { message: "Erro ao desarquivar o atendimento" }];
    }
  }

  private async removerAtendimento(idAtendimento: string): Promise<Retorno<void>> {
    try {
      await ApiApp.axios.delete(`/atendimento/${idAtendimento}`);
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para remover o atendimento" }];
      }
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }
      return [null, { message: "Erro ao remover o atendimento" }];
    }
  }

  chat = {
    listarChats: this.listarChats,
    listarMensagensChat: this.listarMensagensChat,
    enviarMensagemChat: this.enviarMensagemChat,
    gerarAnexo: this.gerarAnexoChat,
    novoChat: this.novoChatWhatsapp,
    alterarAtendimento: this.alterarAtendimento,
    pegarChat: this.pegarChat,
    verificarWhastapp: this.verificarWhastapp,
    buscarMensagem: this.buscarMensagem,
    encontrarPaginaMensagem: this.encontrarPaginaMensagem,
    marcarMensagemLida: this.marcarMensagemLida,
    marcarChatLido: this.marcarChatLido,
    arquivar: this.arquivarChat,
    desarquivar: this.desarquivarChat,
  };

  mensagensPadroes = {
    listar: this.listarMensagensPadroes,
    criar: this.criarMensagemPadrao,
    atualizar: this.atualizarMensagemPadrao,
    remover: this.removerMensagemPadrao,
  };

  private async pegarChat(idChat: string): Promise<Retorno<ChatEmListaType>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/chat/${idChat}`);
      return [response.data as ChatEmListaType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarChats(params: {
    pesquisa: string;
    pagina: number;
    quantidade: number;
    meusChats: boolean;
    canal?: string;
    statusChat?: string;
    ordenacao?: 'recentes' | 'antigos';
    dataInicio?: string;
    dataFim?: string;
    idUsuarioResponsavel?: string;

  }): Promise<
    Retorno<{
      chats: ChatEmListaType[];
      pagina: number;
      quantidade: number;
    }>
  > {
    try {
      let url = `/chat/listar-chats?pesquisa=${params.pesquisa}&pagina=${params.pagina}&quantidade=${params.quantidade}&proprios=${params.meusChats}`;
      if (params.canal) {
        url += `&canal=${params.canal}`;
      }
      if (params.statusChat) {
        url += `&statusChat=${params.statusChat}`;
      }
      if (params.ordenacao) {
        url += `&ordenacao=${params.ordenacao}`;
      }
      if (params.dataInicio) {
        url += `&dataInicio=${params.dataInicio}`;
      }
      if (params.dataFim) {
        url += `&dataFim=${params.dataFim}`;
      }
      if (params.idUsuarioResponsavel) {
        url += `&idUsuarioResponsavel=${params.idUsuarioResponsavel}`;
      }
      const { data: response } = await ApiApp.axios.get(url);
      return [
        response.data as {
          chats: ChatEmListaType[];
          pagina: number;
          quantidade: number;
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarMensagensChat(
    idChat: string,
    params: { pesquisa: string; pagina: number; quantidade: number }
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/chat/mensagens/${idChat}?pesquisa=${params.pesquisa}&pagina=${params.pagina}&quantidade=${params.quantidade}`
      );
      return [
        response.data as {
          mensagens: MensagemType[];
          pagina: number;
          quantidade: number;
          canal: string;
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async enviarMensagemChat(
    idChat: string,
    bodyMenssagem: {
      destinatario: string;
      mensagem: string;
      canal: string;
      anexoMensagem?: string;
      tipoAnexo?: string;
      mensagemReferencia?: string;
    }
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `/chat/enviar-mensagem/${idChat}`,
        bodyMenssagem
      );
      return [response.data as any, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async gerarAnexoChat(
    idChat: string,
    file: File
  ): Promise<Retorno<{ src: string; mimetype: string }>> {
    try {
      const formData = new FormData();
      formData.append("arquivos", file);

      const { data: response } = await ApiApp.axios.post(
        `/chat/gerar-anexo/${idChat}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return [response.data as { src: string; mimetype: string }, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async novoChatWhatsapp(
    params: {
      idCliente: string;
      tipoCliente: "cliente" | "temporario";
      nome: string;
    },
    bodyMenssagem: {
      destinatario: string;
      mensagem: string;
      canal: string;
      anexoMensagem?: string;
      tipoAnexo?: string;
      mensagemReferencia?: string;
    }
  ): Promise<Retorno<{ idChat: string }>> {
    try {
      const nome = params.nome;
      const celular = bodyMenssagem.destinatario;

      const { data: response } = await ApiApp.axios.post(
        `/chat/novo-chat?tipoCliente=${params.tipoCliente}&idCliente=${params.idCliente}&nome=${nome}&celular=${celular}`,
        {
          ...bodyMenssagem,
          canal: "whatsapp",
        }
      );
      return [response.data as { idChat: string }, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async alterarAtendimento(params: {
    idChat: string;
    idAtendimento: string;
  }): Promise<
    Retorno<{
      id: string;
      idLoja: string;
      idCliente: string | null;
      idClienteTemporario: string | null;
      idAtendimento: string | null;
      idDestinatarioApiExterna: string;
      canal: string;
      criadoEm: Date;
      atualizadoEm: Date;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/chat/${params.idChat}/alterar-atendimento/${params.idAtendimento}`
      );
      return [
        response.data as {
          id: string;
          idLoja: string;
          idCliente: string;
          idClienteTemporario: string;
          idAtendimento: string;
          idDestinatarioApiExterna: string;
          canal: string;
          criadoEm: Date;
          atualizadoEm: Date;
        },
        null,
      ];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async verificarWhastapp(numero: string): Promise<
    Retorno<{
      existe: boolean;
      numero: string | null;
      numeroPesquisa: string;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/chat/numero-whatsapp-disponivel?numero=${numero}`
      );
      return [
        response.data as {
          existe: boolean;
          numero: string | null;
          numeroPesquisa: string;
        },
        null,
      ];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async buscarMensagem(messageId: string): Promise<Retorno<MensagemType>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/chat/mensagem/${messageId}`);
      return [response.data as MensagemType, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Mensagem não encontrada" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível buscar a mensagem" }];
    }
  }

  private async encontrarPaginaMensagem(messageId: string): Promise<Retorno<{
    messageId: string;
    pagina: number;
    quantidade: number;
    totalMensagensPosteriores: number;
    chatId: string;
  }>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/chat/mensagem/${messageId}/pagina`);
      return [response.data as {
        messageId: string;
        pagina: number;
        quantidade: number;
        totalMensagensPosteriores: number;
        chatId: string;
      }, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Mensagem não encontrada" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível localizar a página da mensagem" }];
    }
  }

  private async marcarMensagemLida(mensagemId: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/chat/mensagem/${mensagemId}/lida`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Mensagem não encontrada" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao marcar mensagem como lida" }];
    }
  }

  private async marcarChatLido(chatId: string): Promise<Retorno<{ mensagensAtualizadas: number }>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/chat/${chatId}/marcar-lido`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Chat não encontrado" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao marcar chat como lido" }];
    }
  }

  private async arquivarChat(chatId: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/chat/${chatId}/arquivar`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Chat não encontrado" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao arquivar chat" }];
    }
  }

  private async desarquivarChat(chatId: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(`/chat/${chatId}/desarquivar`);
      return [response.data, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Chat não encontrado" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao desarquivar chat" }];
    }
  }

  private async listarMensagensPadroes(): Promise<Retorno<MensagemPadrao[]>> {
    try {
      const { data: response } = await ApiApp.axios.get(`/mensagens-padroes`);
      const raw = response?.data ?? response;
      const mensagens: MensagemPadrao[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.mensagens)
          ? raw.mensagens
          : [];
      return [mensagens, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao listar mensagens automáticas" }];
    }
  }

  private async criarMensagemPadrao(payload: { titulo: string; conteudo: string }): Promise<Retorno<MensagemPadrao>> {
    try {
      const { data: response } = await ApiApp.axios.post(`/mensagens-padroes`, payload);
      return [response.data as MensagemPadrao, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao criar mensagem automática" }];
    }
  }

  private async atualizarMensagemPadrao(id: string, payload: { titulo: string; conteudo: string }): Promise<Retorno<MensagemPadrao>> {
    try {
      const { data: response } = await ApiApp.axios.patch(`/mensagens-padroes/${id}`, payload);
      return [response.data as MensagemPadrao, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Mensagem não encontrada" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao atualizar mensagem automática" }];
    }
  }

  private async removerMensagemPadrao(id: string): Promise<Retorno<void>> {
    try {
      await ApiApp.axios.delete(`/mensagens-padroes/${id}`);
      return [undefined, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Mensagem não encontrada" }];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }
      return [null, { message: "Erro ao remover mensagem automática" }];
    }
  }

  notificacoes = {
    listar: this.listarNotificacoes,
    marcarLida: this.marcarNotificacaoLida,
    todasLidas: this.todasNotificacoesLidas,
  };

  private async listarNotificacoes(status?: StatusNotificacaoEnum): Promise<
    Retorno<{
      total: number;
      totalVisualizadas: number;
      totalPendentes: number;
      notificacoes: NotificacaoI[];
    }>
  > {
    try {
      const query = status ? `?status=${status}` : "";

      const { data: response } = await ApiApp.axios.get(
        `/notificacoes/listar${query}`
      );
      return [
        response.data as {
          total: number;
          totalVisualizadas: number;
          totalPendentes: number;
          notificacoes: NotificacaoI[];
        },
        null,
      ];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async marcarNotificacaoLida(
    id: string,
    status: StatusNotificacaoEnum
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/notificacoes/alterar-status/${id}`,
        {
          status,
        }
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async todasNotificacoesLidas(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/notificacoes/todas-visualizadas`
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  faq = {
    listar: this.listarFaq,
    pegar: this.pegarFaq,
    registrarVisualizacao: this.registrarVisualizacaoFaq,
  };

  private async listarFaq(params: {
    pagina: number;
    quantidade: number;
    pesquisa?: string;
    tags?: string[];
  }): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get("faq", {
        params: {
          pagina: params.pagina,
          quantidade: params.quantidade,
          pesquisa: params.pesquisa,
          tags: params.tags?.join(","),
        },
      });
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async pegarFaq(id: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(`faq/${id}`);
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async registrarVisualizacaoFaq(id: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(`/faq/views/${id}`);
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  suporte = {
    listar: this.listarSuporte,
    pegar: this.pegarSuporte,
    criar: this.criarSuporte,
    responder: this.responderSuporte,
    alterarStatus: this.alterarStatusSuporte,
    listarStatus: this.listarStatusSuporte,
    listarCategorias: this.listarCategoriasSuporte,
    enviarAnexoTicket: this.enviarAnexoTicket,
    listarPrioridades: this.listarPrioridadesSuporte,
    pegarAnexos: this.pegarAnexosTicket,
  };

  private async listarSuporte(params: {
    pesquisa?: string;
    prioridade?: "normal" | "urgente";
    status?: "aberto" | "em resolução" | "fechado";
    categoria?: string;
    dataInicial?: Date;
    dataFinal?: Date;
    pagina?: number;
    itensPagina?: number;
  }): Promise<Retorno<ListarTicketsType>> {
    try {
      const { data: response } = await ApiApp.axios.get("suporte", { params });
      return [response.data as ListarTicketsType, null];
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async enviarAnexoTicket(
    id: string,
    formData: FormData
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.postForm(
        `/suporte/${id}/anexos`,
        formData
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async alterarStatusSuporte(
    id: string,
    status: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        `backoffice/suporte/${id}/alterar-status`,
        {
          status,
        }
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async pegarSuporte(id: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(`suporte/${id}`);
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async pegarAnexosTicket(idTicket: string): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        `suporte/${idTicket}/anexos`
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async criarSuporte(body: {
    titulo: string;
    categoria: string;
    assunto: string;
    mensagem: string;
  }): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post("suporte", body);
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async responderSuporte(
    id: string,
    body: { resposta: string }
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post(
        `suporte/${id}/responder`,
        body
      );
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarStatusSuporte(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get("suporte/status");
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarCategoriasSuporte(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get("suporte/categorias");
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarPrioridadesSuporte(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get("suporte/prioridades");
      return [response.data as any, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível realizar a requisição" }];
    }
  }

  private async listarSuspensaoAtendimento({
    idUsuario,
    descricao,
    startDateInicio,
    startDateFim,
    ativas,
    pagina = 1,
    itensPagina = 10,
  }: {
    idUsuario?: string;
    descricao?: string;
    startDateInicio?: string;
    startDateFim?: string;
    ativas?: boolean;
    pagina?: number;
    itensPagina?: number;
  }): Promise<
    Retorno<{
      data: {
        id: string;
        idUsuario: string;
        descricao: string;
        startDate: string;
        endDate: string;
        criadoEm: string;
        atualizadoEm: string;
        usuario: {
          id: string;
          nome: string;
          email: string;
          avatar: {
            arquivo: {
              url: string;
            };
          };
        };
      }[];
      meta: {
        pagina: number;
        itensPagina: number;
        total: number;
        totalPaginas: number;
      };
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get("/suspensao", {
        params: {
          idUsuario,
          descricao,
          startDateInicio,
          startDateFim,
          ativas,
          pagina: Number(pagina),
          itensPagina: Number(itensPagina),
        },
      });
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar suspensões" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível listar as suspensões" }];
    }
  }

  private async criarSuspensaoAtendimento(dados: {
    idUsuario: string;
    descricao: string;
    startDate: string;
    endDate: string;
  }): Promise<
    Retorno<{
      id: string;
      idUsuario: string;
      descricao: string;
      startDate: string;
      endDate: string;
      criadoEm: string;
      atualizadoEm: string;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.post("/suspensao", dados);
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para criar suspensões" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Usuário não encontrado" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível criar a suspensão" }];
    }
  }

  private async atualizarSuspensaoAtendimento(
    id: string,
    dados: {
      idUsuario?: string;
      descricao?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<
    Retorno<{
      id: string;
      idUsuario: string;
      descricao: string;
      startDate: string;
      endDate: string;
      criadoEm: string;
      atualizadoEm: string;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.put(
        `/suspensao/${id}`,
        dados
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para atualizar suspensões" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Suspensão ou usuário não encontrado" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível atualizar a suspensão" }];
    }
  }

  private async removerSuspensaoAtendimento(id: string): Promise<
    Retorno<{
      message: string;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.delete(`/suspensao/${id}`);
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para remover suspensões" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Suspensão não encontrada" }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível remover a suspensão" }];
    }
  }

  private async verificarSuspensaoAtendimento(idUsuario: string): Promise<
    Retorno<{
      suspenso: boolean;
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get(
        `/suspensao/verificar/${idUsuario}`
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para verificar suspensões" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Não foi possível verificar a suspensão" }];
    }
  }

  private async listarHistoricoClienteAtendimento(
    idAtendimento: string,
  ): Promise<Retorno<{ logs: any[]; total: number; pagina: number; quantidade: number; totalPaginas: number }>> {
    try {
      if (!idAtendimento) {
        return [null, { message: "É necessário informar idAtendimento." }];
      }

      const { data: response } = await ApiApp.axios.get(
        `/atendimento/${idAtendimento}/logs`,
      );

      return [
        response.data as { logs: any[]; total: number; pagina: number; quantidade: number; totalPaginas: number },
        null
      ];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [null, { message: "Você não tem permissão para listar os logs do atendimento" }];
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Logs do atendimento não encontrados." }];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao buscar os logs do atendimento." }];
    }
  }

  private async obterConfiguracaoDistribuicao(): Promise<
    Retorno<{
      distribuicaoAutomatica: boolean;
      colaboradores: {
        id: string;
        nome: string;
        ativo: boolean;
      }[];
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get(
        "/loja/distribuicao-automatica/configuracao"
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para acessar as configurações" },
        ];
      }
      return [
        null,
        { message: "Erro ao carregar configurações de distribuição" },
      ];
    }
  }

  private async configurarDistribuicaoAutomatica(dados: {
    distribuicaoAutomatica: boolean;
  }): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.put(
        "/loja/distribuicao-automatica/configuracao",
        dados
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para alterar as configurações" },
        ];
      }
      return [
        null,
        { message: "Erro ao salvar configurações de distribuição" },
      ];
    }
  }

  distribuicaoAutomatica = {
    obterConfiguracao: this.obterConfiguracaoDistribuicao,
    configurar: this.configurarDistribuicaoAutomatica,
  };

  assinatura = {
    buscarAtual: this.buscarAssinaturaAtual,
    cancelar: this.cancelarAssinatura,
    criar: this.criarAssinatura,
  };

  planos = {
    listar: this.listarPlanos,
  };

  private async buscarAssinaturaAtual(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.get(
        "/loja/assinatura/status"
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, null];
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          {
            message: "Você não tem permissão para acessar esta funcionalidade",
          },
        ];
      }
      return [null, { message: "Erro ao buscar assinatura atual" }];
    }
  }

  private async cancelarAssinatura(): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.delete(
        `/loja/assinatura/cancelar`
      );
      return [response.data, null];
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para cancelar assinaturas" },
        ];
      }
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [null, { message: "Assinatura não encontrada" }];
      }
      return [null, { message: "Erro ao cancelar assinatura" }];
    }
  }

  private async criarAssinatura(
    idPlano: string,
    idMetodoPagamentoStripe: string
  ): Promise<Retorno<any>> {
    try {
      const { data: response } = await ApiApp.axios.post("/loja/assinatura", {
        idPlano,
        idMetodoPagamentoStripe,
        idLoja: getStoreStorageId(),
      });
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para criar assinaturas" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 400) {
        return [
          null,
          { message: error.response.data?.message || "Dados inválidos" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao criar assinatura." }];
    }
  }

  private async listarPlanos(): Promise<
    Retorno<{
      planos?: any[];
      data?: {
        planos: any[];
        paginacao: {
          paginaAtual: number;
          itensPorPagina: number;
          totalItens: number;
          totalPaginas: number;
        };
      };
    }>
  > {
    try {
      const { data: response } = await ApiApp.axios.get("loja/planos");
      return [response.data, null];
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar os planos" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao listar os planos." }];
    }
  }

  relatorio = {
    listarGeral: this.listarRelatorioGeral,
    listarAtendimentoCanal: this.listarRelatorioAtendimentoCanal,
    listarPorVendedor: this.listarRelatorioVendedorEspecifico,
    listarRelatorioVendedor: this.listarRelatorioVendedor,
    buscarColaborador: this.buscarColaborador,
  }

  private async listarRelatorioGeral(
    dataInicio: string,
    dataFim: string,
    idVendedor?: string
  ): Promise<Retorno<RelatorioGeral>> {
    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });
      if (idVendedor) {
        params.append('idColaborador', idVendedor);
      }
      const { data: response } = await ApiApp.axios.get(
        `/loja/${getStoreStorageId()}/relatorios/atendimentos/geral?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar o relatório geral" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao listar o relatório geral." }];
    }
  }

  private async listarRelatorioAtendimentoCanal(
    dataInicio: string,
    dataFim: string,
    idVendedor?: string
  ): Promise<Retorno<RelatorioAtendimentoCanal>> {
    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });
      if (idVendedor) {
        params.append('idColaborador', idVendedor);
      }
      const { data: response } = await ApiApp.axios.get(
        `/loja/${getStoreStorageId()}/relatorios/atendimentos/canal?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar o relatório de atendimentos por canal" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao buscar relatório de atendimentos por canal" }];
    }
  }

  private async listarRelatorioVendedorEspecifico(
    dataInicio: string,
    dataFim: string,
    idVendedor?: string): Promise<Retorno<RelatorioVendedorEspecifico>> {
    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });

      if (idVendedor) {
        params.append('idColaborador', idVendedor);
      }
      const { data: response } = await ApiApp.axios.get(
        `/loja/${getStoreStorageId()}/relatorios/atendimentos/vendedor/detalhado?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar o relatório de atendimentos por vendedor" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao buscar relatório de atendimentos por vendedor" }];
    }
  }

  private async listarRelatorioVendedor(
    dataInicio: string,
    dataFim: string,
    idVendedor?: string
  ): Promise<Retorno<RelatorioVendedor>> {
    try {
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      });

      if (idVendedor) {
        params.append('idColaborador', idVendedor);
      }
      const { data: response } = await ApiApp.axios.get(
        `/loja/${getStoreStorageId()}/relatorios/atendimentos/vendedor?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.log(error);

      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para listar o relatório de atendimentos por vendedor" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao buscar relatório de atendimentos por vendedor" }];
    }
  }

  private async buscarColaborador(): Promise<Retorno<Colaborador>> {
    try {
      const { data: response } = await ApiApp.axios.get('/colaborador/busca-colaboradores');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [
          null,
          { message: "Você não tem permissão para buscar os colaboradores" },
        ];
      }

      if (error instanceof AxiosError && error.response?.status === 500) {
        return [null, { message: "Erro no servidor." }];
      }

      return [null, { message: "Erro ao buscar os colaboradores." }];
    }
  }
}
