import validateInputs from "@/utils/classes/sanitizer/validate";
import { z } from "zod";
import { telefoneSchema } from "./schemas";
import { isCampoObrigatorio } from "@/utils/validacao-empresa-brasil";

export const lojaSchema = z.object({
  nomeEmpresa: z.string({ message: "Insira o nome da empresa" }),
  inscricaoMunicipal: z.string({ message: "Insira a inscrição municipal" }),
  inscricaoEstadual: z.string({ message: "Insira a inscrição estadual" }),
  regimeTributario: z.string({ message: "Insira o regime tributario" }),
  portalEmpresa: z.string({ message: "Insira o portal da empresa" }),
  atividadePrincipal: z.string({ message: "Insira a atividade Principal" }),
  descricaoAtividade: z.string({ message: "Insira a descrição da atividade" }),
  cnpj: z.string().refine((value) => {
    if (validateInputs.cnpj(value))
      return true;
    else
      return false
  }, { message: "Insira um cnpj valido" })
})

export function createLojaSchemaCondicional(dadosValidacao: {
  uf: string;
  portalEmpresa: string;
  atividadePrincipal: string;
}) {
  const inscricaoMunicipalObrigatoria = isCampoObrigatorio('inscricaoMunicipal', dadosValidacao);
  const inscricaoEstadualObrigatoria = isCampoObrigatorio('inscricaoEstadual', dadosValidacao);

  return z.object({
    nomeEmpresa: z.string({ message: "Insira o nome da empresa" }),

    inscricaoMunicipal: inscricaoMunicipalObrigatoria
      ? z.string({ message: "Insira a inscrição municipal" }).min(1, { message: "Inscrição municipal é obrigatória para este tipo de empresa/estado" })
      : z.string().optional().or(z.literal("")),

    inscricaoEstadual: inscricaoEstadualObrigatoria
      ? z.string({ message: "Insira a inscrição estadual" }).min(1, { message: "Inscrição estadual é obrigatória para este tipo de empresa/estado" })
      : z.string().optional().or(z.literal("")),

    regimeTributario: z.string({ message: "Insira o regime tributario" }),
    portalEmpresa: z.string({ message: "Insira o portal da empresa" }),
    atividadePrincipal: z.string({ message: "Insira a atividade Principal" }),
    descricaoAtividade: z.string({ message: "Insira a descrição da atividade" }),

    cnpj: z.string().refine((value) => {
      if (validateInputs.cnpj(value))
        return true;
      else
        return false
    }, { message: "Insira um cnpj valido" })
  });
}


export const enderecoSchema = z.object({
  id: z.string().optional(),
  idEndereco: z.string().optional().nullable(),
  cep: z.string({ message: "CEP não pode ser vazio" }).min(9, {
    message: "O CEP deve estar no formato 00000-000.",
  }),

  uf: z
    .string()
    .length(2, { message: "O estado (UF) deve conter 2 letras." })
    .refine((value) => /^[A-Z]{2}$/.test(value), {
      message: "A UF deve conter apenas letras maiúsculas (ex: SP, RJ).",
    }),

  cidade: z.string().min(1, { message: "Cidade não pode ser vazia" }),

  rua: z.string().min(1, { message: "A rua não deve ser vazia" }),

  numero: z.string().min(1, {
    message: "O numero do endereço é obrigatorio",
  }),

  bairro: z
    .string().min(1, { message: "O bairro não pode ser vazio" }),

  complemento: z
    .string()
    .nullable()
    .optional(),
  filial: z.boolean({ invalid_type_error: "A filial deve ser um valor booleano." }),
}).transform(value => {
  if (value.id === "") {
    const { id, idEndereco, ...form } = value;
    return {
      ...form
    }
  }
  const { id, ...form } = value
  return {
    ...form,
    idEndereco: id
  }
});

export const contatoSchema = z.object({
  id: z.string(),
  idContato: z.string().optional(),
  site: z.string().nullable(),
  nome: z.string({ message: "Insira o seu nome de contato" }),
  celular: telefoneSchema,
  telefone: telefoneSchema,
  email: z.string({ message: "Insira um email valido para contato" }).email({ message: "Insira um email valido para contato" })
}).transform(value => {
  const { id, ...form } = value
  return {
    ...form,
    idContato: id
  }
});


export type LojaEdit = {
  nomeEmpresa: string; // Nome da empresa proprietária (obrigatório)
  inscricaoMunicipal?: string; // Inscrição Municipal
  inscricaoEstadual?: string; // Inscrição Estadual
  qtdFuncionarios?: string; // Quantidade de funcionários
  regimeTributario?: string; // Regime tributário
  portalEmpresa?: string; // Portal da empresa
  atividadePrincipal?: string; // Atividade principal
  descricaoAtividade?: string; // Descrição da atividade
};

export type EnderecoLoja = {
  id: string;
  idLoja: string;
  cep: string | null;
  uf: string;
  cidade: string;
  rua: string;
  numero: string | null;
  bairro: string;
  complemento: string | null;
  filial: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type Usuario = {
  email: string;
  nome: string;
  criadoEm: string;
};

type Lojista = {
  usuario: Usuario;
};

type AtendimentoResponsavel = {
  id: string;
  idAtendimento: string;
  idColaborador: string;
  idLoja: string;
  criadoEm: string;
  atualizadoEm: string;
};

type Colaborador = {
  id: string;
  idLoja: string;
  idUsuario: string;
  idFoto: string | null;
  nome: string;
  documentoFiscal: string | null;
  whatsapp: string | null;
  telefoneComplementar: string | null;
  status: string;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type ContatoLoja = {
  id: string;
  idLoja: string;
  nome: string | null;
  celular: string | null;
  telefone: string | null;
  email: string | null;
  site: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type Loja = {
  urlFoto: string | null;
  enderecoLoja: EnderecoLoja[];
  assinatura: string | null;
  lojista: Lojista;
  nomeEmpresa: string;
  atendimentoResponsaveis: AtendimentoResponsavel[];
  atividadePrincipal: string | null;
  atualizadoEm: string;
  cnpj: string;
  colaborador: Colaborador[];
  contatoLoja: ContatoLoja[];
  descricaoAtividade: string | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  portalEmpresa: string | null;
  regimeTributario: string
  qtdFuncionarios: string
}  
