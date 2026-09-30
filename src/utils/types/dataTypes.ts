
export type UserType = {
  id?: string,
  nome: string,
  icon: string | null
}
export type ClienteType = {
  id: string;
  idLoja: string;
  idFoto: string | null;
  nome: string;
  tipoPessoa: "juridica" | "fisica";
  documentoFiscal: string;
  rg: string;
  estrangeiro: boolean;
  genero: "masculino" | "feminino" | "outro";
  status: "ativo" | "inativo";
  dataNascimento: string; // ISO 8601 format
  observacoes: string | null;
  telefone: string;
  whatsapp: string;
  email: string;
  versao: number;
  criadoEm: string; // ISO 8601 format
  urlAvatar: string;
  atualizadoEm: string; // ISO 8601 format
  enderecoCliente: {
    id: string;
    idCliente: string;
    cep: string;
    uf: string;
    municipio: string;
    endereco: string;
    bairro: string;
    numero: string;
    complemento: string | null;
    criadoEm: string; // ISO 8601 format
    atualizadoEm: string; // ISO 8601 format
  };
  totalAtendimentos: number;
};


export type optionType = {
  name: string,
  value: string
}

export interface PopWrapperRef {
  show: () => void;
  drop: () => void;
}

export interface ActionsRef {
  show: () => void;
}

export type Admin = {
  id: string;
  email: string;
  nome: string;
  status: "ativo" | "inativo";
  perfil: string;
  criadoEm: string;
  avatarUrl: string;
  permissoes: string[];
};

export type Assinante = {
  idAssinatura: string;
  plano: string; // "starter", "pro", etc., ou outro tipo específico se necessário
  duracaoPlano: number; // Duração em meses, suponho
  valorPlano: number; // Valor em reais ou outra moeda
  status: 'ativo' | 'inativo' | 'cancelado'; // Use um tipo union para os valores possíveis
  formaPagamento: 'cartao' | 'boleto' | 'pix'; // Especifique os métodos de pagamento possíveis
  dataAquisicao: string; // Use Date se você for manipular como um objeto Date
  dataRenovacao: string | null; // Permite null para casos em que a renovação não está disponível
  dataCancelamento: string | null; // Permite null para casos de assinatura ativa
  loja: {
    idLoja: string;
    nomeEmpresa: string;
    criadoEm: string;
    cnpj: string; // Pode adicionar validação adicional para CNPJ se necessário
    email: string; // Pode usar uma biblioteca para validação de e-mail
    avatarUrl: string;
    telefone: string; // Formatação depende do país
    celular: string; // Formatação depende do país
    enderecosLoja: {

      rua?: string;
      cep?: string;
      cidade: string;
      uf: string;
      bairro?: string;
      numero?: string;
      complemento?: string;
      filial: boolean;
    }[]
  };
};
