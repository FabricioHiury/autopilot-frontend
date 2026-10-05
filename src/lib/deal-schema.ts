import { z } from 'zod';
import { DealStatus } from '@/types/deal-status';

export const dealOriginOptions = [
  { label: 'Carteira', value: 'carteira' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Icarros', value: 'icarros' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Ligação', value: 'ligacao' },
  { label: 'MobiAuto', value: 'mobiauto' },
  { label: 'OLX', value: 'olx' },
  { label: 'Outros', value: 'other' },
  { label: 'Showroom', value: 'showroom' },
  { label: 'UsadosBR', value: 'usadosbr' },
  { label: 'Webmotors', value: 'webmotors' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Indicação', value: 'indicacao' },
  { label: 'Site', value: 'site' },
];

export const temperatureOptions = [
  { label: 'Quente', value: 'HOT' },
  { label: 'Frio', value: 'COLD' },
  { label: 'Morno', value: 'WARM' },
];

export const dealModeOptions = [
  { label: 'Compra', value: 'BUY' },
  { label: 'Venda', value: 'SELL' },
];

export const dealSchema = z
  .object({
    title: z.string().min(1, "O campo 'titulo' é obrigatório."),
    chatId: z.string().optional(),
    descriptionDeal: z.string().optional(),
    vincularCliente: z.boolean(),
    note: z.string(),
    distributionAutomatic: z.boolean().optional().default(false),
    status: z
      .nativeEnum(DealStatus, {
        message: "O campo 'status' deve ser preenchido com um status válido.",
      })
      .optional(),
    dealOrigin: z.enum(
      [
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
        'other',
        'carteira',
        'indicacao',
        'site',
      ],
      {
        message:
          "O campo 'origemAtendimento' deve ser preenchido com uma das opções: facebook, instagram, whatsapp, olx ou outros.",
      },
    ),
    temperature: z.enum(['HOT', 'COLD', 'WARM'], {
      message:
        "O campo 'temperatura' deve ser preenchido com uma das opções: quente, frio ou morno.",
    }),
    dealMode: z.enum(['BUY', 'SELL', 'CONSIGNMENT'], {
      message: "O campo 'modoAtendimento' deve ser preenchido com uma das opções: compra ou venda.",
    }),

    idAssignees: z.array(z.string()),
    customerId: z.string({ message: 'Id do cliente é necessário' }).optional(),
    nomeCompleto: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    dealManual: z.boolean().optional().default(false),
  })
  .superRefine((schema, ctx) => {
    if (!schema.distributionAutomatic && schema.idAssignees.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message:
          'O atendimento deve ter pelo menos um responsável quando a distribuição automática não estiver ativa',
        path: ['idAssignees'],
      });
    }

    if (!schema.vincularCliente) {
      if (schema.nomeCompleto === '') {
        ctx.addIssue({
          message: 'Nome completo não pode ser vazio',
          code: 'custom',
        });
        return z.never;
      }
    } else {
      if (!schema.customerId || schema.customerId === '') {
        ctx.addIssue({
          code: 'custom',
          message: 'Insira um id do cliente',
        });
      }
    }
  })
  .transform((schema) => {
    //Esse transform é usado para converter o objeto do jeitinho que a gente quer quando for parsear

    //Para criar cliente novo
    if (!schema.vincularCliente) {
      const { customerId, vincularCliente, ...form } = schema;
      return form;
    }

    //Caso já tenha um cliente cadastrado, enviamos só o id
    else {
      const { nomeCompleto, email, phone, vincularCliente, ...form } = schema;
      return form;
    }
  });

type Deal = {
  title: string;
  descriptionDeal: string;
  note: string;
  dealOrigin: string;
  vincularCliente: boolean;
  dealMode: string; // Adicione outros modos conforme necessário
  temperature: string;
  idAssignees: number[]; // Opcional
  customerId: string;
  nomeCompleto: string;
  email: string;
  phone: string;
  chatId?: string;
};
