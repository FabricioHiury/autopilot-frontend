import validateInputs from '@/utils/classes/sanitizer/validate';
import { z } from 'zod';
import { telefoneSchema } from './schemas';
import { isCampoObrigatorio } from '@/utils/validacao-empresa-brasil';

export const lojaSchema = z.object({
  companyName: z.string({ message: 'Insira o nome da empresa' }),
  registrationMunicipal: z.string({ message: 'Insira a inscrição municipal' }),
  registrationState: z.string({ message: 'Insira a inscrição estadual' }),
  regimeTax: z.string({ message: 'Insira o regime tributario' }),
  portalCompany: z.string({ message: 'Insira o portal da empresa' }),
  activityPrimary: z.string({ message: 'Insira a atividade Principal' }),
  descriptionActivity: z.string({ message: 'Insira a descrição da atividade' }),
  taxId: z.string().refine(
    (value) => {
      if (validateInputs.taxId(value)) return true;
      else return false;
    },
    { message: 'Insira um cnpj valido' },
  ),
});

export function createLojaSchemaCondicional(dadosValidacao: {
  state: string;
  portalCompany: string;
  activityPrimary: string;
}) {
  const inscricaoMunicipalObrigatoria = isCampoObrigatorio('registrationMunicipal', dadosValidacao);
  const inscricaoEstadualObrigatoria = isCampoObrigatorio('registrationState', dadosValidacao);

  return z.object({
    companyName: z.string({ message: 'Insira o nome da empresa' }),

    registrationMunicipal: inscricaoMunicipalObrigatoria
      ? z
          .string({ message: 'Insira a inscrição municipal' })
          .min(1, { message: 'Inscrição municipal é obrigatória para este tipo de empresa/estado' })
      : z.string().optional().or(z.literal('')),

    registrationState: inscricaoEstadualObrigatoria
      ? z
          .string({ message: 'Insira a inscrição estadual' })
          .min(1, { message: 'Inscrição estadual é obrigatória para este tipo de empresa/estado' })
      : z.string().optional().or(z.literal('')),

    regimeTax: z.string({ message: 'Insira o regime tributario' }),
    portalCompany: z.string({ message: 'Insira o portal da empresa' }),
    activityPrimary: z.string({ message: 'Insira a atividade Principal' }),
    descriptionActivity: z.string({ message: 'Insira a descrição da atividade' }),

    taxId: z.string().refine(
      (value) => {
        if (validateInputs.taxId(value)) return true;
        else return false;
      },
      { message: 'Insira um cnpj valido' },
    ),
  });
}

export const enderecoSchema = z
  .object({
    id: z.string().optional(),
    idAddress: z.string().optional().nullable(),
    postalCode: z.string({ message: 'CEP não pode ser vazio' }).min(9, {
      message: 'O CEP deve estar no formato 00000-000.',
    }),

    state: z
      .string()
      .length(2, { message: 'O estado (UF) deve conter 2 letras.' })
      .refine((value) => /^[A-Z]{2}$/.test(value), {
        message: 'A UF deve conter apenas letras maiúsculas (ex: SP, RJ).',
      }),

    city: z.string().min(1, { message: 'Cidade não pode ser vazia' }),

    street: z.string().min(1, { message: 'A rua não deve ser vazia' }),

    number: z.string().min(1, {
      message: 'O numero do endereço é obrigatorio',
    }),

    district: z.string().min(1, { message: 'O bairro não pode ser vazio' }),

    complement: z.string().nullable().optional(),
    branch: z.boolean({ invalid_type_error: 'A filial deve ser um valor booleano.' }),
  })
  .transform((value) => {
    if (value.id === '') {
      const { id, idAddress, ...form } = value;
      return {
        ...form,
      };
    }
    const { id, ...form } = value;
    return {
      ...form,
      idAddress: id,
    };
  });

export const contatoSchema = z
  .object({
    id: z.string(),
    idContact: z.string().optional(),
    site: z.string().nullable(),
    name: z.string({ message: 'Insira o seu nome de contato' }),
    mobile: telefoneSchema,
    phone: telefoneSchema,
    email: z
      .string({ message: 'Insira um email valido para contato' })
      .email({ message: 'Insira um email valido para contato' }),
  })
  .transform((value) => {
    const { id, ...form } = value;
    return {
      ...form,
      idContact: id || undefined,
      site: form.site ?? undefined,
    };
  });

export type LojaEdit = {
  companyName: string; // Nome da empresa proprietária (obrigatório)
  registrationMunicipal?: string; // Inscrição Municipal
  registrationState?: string; // Inscrição Estadual
  qtdFuncionarios?: string; // Quantidade de funcionários
  regimeTax?: string; // Regime tributário
  portalCompany?: string; // Portal da empresa
  activityPrimary?: string; // Atividade principal
  descriptionActivity?: string; // Descrição da atividade
};

export type StoreAddress = {
  id: string;
  storeId: string;
  postalCode: string | null;
  state: string;
  city: string;
  street: string;
  number: string | null;
  district: string;
  complement: string | null;
  branch: boolean;
  createdAt: string;
  updatedAt: string;
};

type User = {
  email: string;
  name: string;
  createdAt: string;
};

type StoreOwner = {
  user: User;
};

type AtendimentoResponsavel = {
  id: string;
  dealId: string;
  employeeId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
};

type EmployeeList = {
  id: string;
  storeId: string;
  userId: string;
  photoUrl: string | null;
  name: string;
  taxId: string | null;
  whatsapp: string | null;
  phoneAdditional: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoreContact = {
  id: string;
  storeId: string;
  name: string | null;
  mobile: string | null;
  phone: string | null;
  email: string | null;
  site: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Store = {
  photoUrl: string | null;
  storeAddress: StoreAddress[];
  storeOwner: StoreOwner;
  companyName: string;
  dealAssignee: AtendimentoResponsavel[];
  activityPrimary: string | null;
  updatedAt: string;
  taxId: string;
  employee: EmployeeList[];
  storeContact: StoreContact[];
  descriptionActivity: string | null;
  registrationState: string | null;
  registrationMunicipal: string | null;
  portalCompany: string | null;
  regimeTax: string;
  qtdFuncionarios: string;
};
