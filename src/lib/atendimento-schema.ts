import { z } from 'zod';
import { STATUS_ATENDIMENTO } from '@/utils/types/status-atentimento-enum';


export const optionsAtendimento = [
  { label: 'Carteira', value: 'carteira' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Icarros', value: 'icarros' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Ligação', value: 'ligacao' },
  { label: 'MobiAuto', value: 'mobiauto' },
  { label: 'OLX', value: 'olx' },
  { label: 'Outros', value: 'outros' },
  { label: 'Showroom', value: 'showroom' },
  { label: 'UsadosBR', value: 'usadosbr' },
  { label: 'Webmotors', value: 'webmotors' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Indicação', value: 'indicacao' },
  { label: 'Site', value: 'site' }
];

export const optionsTemperatura = [

  { label: 'Quente', value: 'quente' },
  { label: 'Frio', value: 'frio' },
  { label: 'Morno', value: 'morno' }

]


export const optionsModoAtendimento = [

  { label: 'Compra', value: 'compra' },
  { label: 'Venda', value: 'venda' },

]

export const atendimentoSchema = z.object({
  titulo: z.string().min(1, "O campo 'titulo' é obrigatório."),
  idChat: z.string().optional(),
  descricaoAtendimento: z.string().optional(),
  vincularCliente: z.boolean(),
  observacao: z.string(),
  distribuicaoAutomatica: z.boolean().optional().default(false),
  status: z.nativeEnum(STATUS_ATENDIMENTO, {
    message: "O campo 'status' deve ser preenchido com um status válido."
  }).optional(),
  origemAtendimento: z.enum([
    'facebook',
    'instagram',
    'whatsapp',
    'olx',
    'showroom',
    'usadosbr',
    'icarros',
    'mobiauto',
    'webmotors',
    'ligacao',
    'outros',
    'carteira',
    'indicacao',
    'site'
  ], { message: "O campo 'origemAtendimento' deve ser preenchido com uma das opções: facebook, instagram, whatsapp, olx ou outros." }),
  temperatura: z.enum([
    'quente',
    'frio',
    'morno'
  ], { message: "O campo 'temperatura' deve ser preenchido com uma das opções: quente, frio ou morno." }),
  modoAtendimento: z.enum([
    'compra',
    'venda',
    'consignado'
  ], { message: "O campo 'modoAtendimento' deve ser preenchido com uma das opções: compra ou venda." }),

  idResponsaveis: z.array(z.string()),
  idCliente: z.string({ message: "Id do cliente é necessário" }).optional(),
  nomeCompleto: z.string(),
  email: z.string().optional(),
  telefone: z.string().optional(),
  atendimentoManual: z.boolean().optional().default(false),
}).superRefine((schema, ctx) => {
  if (!schema.distribuicaoAutomatica && schema.idResponsaveis.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: "O atendimento deve ter pelo menos um responsável quando a distribuição automática não estiver ativa",
      path: ['idResponsaveis']
    });
  }

  if (!schema.vincularCliente) {
    if (schema.nomeCompleto === "") {
      ctx.addIssue({
        message: "Nome completo não pode ser vazio",
        code: 'custom'
      })
      return z.never
    }
  }
  else {
    if (!schema.idCliente || schema.idCliente === "") {
      ctx.addIssue({
        code: 'custom',
        message: "Insira um id do cliente"
      })
    }
  }

})
  .transform((schema) => {
    //Esse transform é usado para converter o objeto do jeitinho que a gente quer quando for parsear

    //Para criar cliente novo
    if (!schema.vincularCliente) {
      const { idCliente, vincularCliente, ...form } = schema
      return form;
    }

    //Caso já tenha um cliente cadastrado, enviamos só o id
    else {
      const { nomeCompleto, email, telefone, vincularCliente, ...form } = schema
      return form;
    }

  });

type Atendimento = {
  titulo: string;
  descricaoAtendimento: string;
  observacao: string;
  origemAtendimento: string;
  vincularCliente: boolean;
  modoAtendimento: string; // Adicione outros modos conforme necessário
  temperatura: string;
  idResponsaveis: number[]; // Opcional
  idCliente: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  chatId?: string;
};