export type Cliente = {
    id: string;
    idLoja: string;
    idFoto: string | null;
    nome: string;
    urlAvatar?: string;
    tipoPessoa: "fisica" | "juridica";
    documentoFiscal: string;
    rg: string;
    estrangeiro: boolean;
    genero: string;
    status: "ativo" | "inativo";
    dataNascimento: string; // ISO 8601 date string
    observacoes: string | null;
    telefone: string;
    whatsapp: string;
    email: string;
    versao: number;
    criadoEm: string; // ISO 8601 date string
    atualizadoEm: string; // ISO 8601 date string
    enderecoCliente: {
        id: string;
        idCliente: string;
        cep: string;
        uf: string; // e.g., "sp", "rj", "al"
        municipio: string;
        endereco: string;
        bairro: string;
        numero: string;
        complemento: string | null;
        criadoEm: string; // ISO 8601 date string
        atualizadoEm: string; // ISO 8601 date string
    };
    atendimentos: Atendimento[]; // Adjust type if atendimentos has a specific structure
    totalAtendimentos: number;
    usuarioCriador:{
        id: string,
        nome:string,
        perfil:string,
    }
};
export type Atendimento = {
    tarefasAtendimento: any[]; // Substitua `any[]` por um tipo específico se necessário
    criadoEm: string; // ISO string para data
    descricaoAtendimento: string;
    id: string;
    anexos: any[]; // Substitua `any[]` por um tipo específico se necessário
    observacao: string;
    status: string;
    titulo: string;
    temperatura: string;
    origemAtendimento: string;
    modoAtendimento: string;
    logsAtividadesAtendimento: {
      mensagem: string;
      id: string;
      criadoEm: string; // ISO string para data
    }[];
    comentariosAtendimento: any[]; // Substitua `any[]` por um tipo específico se necessário
    atendimentoResponsaveis: {
      colaborador: {
        nome: string;
        idUsuario: string;
      };
    }[];
    chat: any[]; // Substitua `any[]` por um tipo específico se necessário
    selecionado: boolean;
    visitasAtendimento:{
      concluida:boolean,
      criadoEm:string,
      data:string,
      horaFim:string,
      horaInicio:string,
      id: string,
      observacoes:string,
      tipo:string
    }[]
  };
  

type LogAtividadeAtendimento = {
    id: string;
    idAtendimento: string;
    mensagem: string;
    criadoEm: string; // ISO date string
};