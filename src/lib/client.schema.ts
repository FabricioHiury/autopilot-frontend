import z from '@/lib/zod';

export const phoneSchema = z
  .string()
  .refine(
    (phone) => {
      const digits = phone.replace(/\D/g, '');

      if (digits.length === 13) {
        return /^\+\d{2} \(\d{2}\) \d{5}-\d{4}$/.test(phone);
      }
      if (digits.length === 11) {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
      }
      if (digits.length === 10) {
        return /^\(\d{2}\) \d{4}-\d{4}$/.test(phone);
      }
      return false;
    },
    {
      message:
        'Telefone inválido. Use um dos seguintes formatos: (XX) XXXX-XXXX, (XX) XXXXX-XXXX, +XX (XX) XXXXX-XXXX',
    },
  )
  .transform((value) => {
    const digits = value.replace(/[^\d]/g, '');
    return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  });

export const customerSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome completo deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome completo não pode ter mais de 100 caracteres' })
    .default(''),
  birthDate: z
    .string()
    .min(10, { message: 'Data de nascimento inválida' })
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: 'Formato de data inválido. Use DD/MM/AAAA',
    })
    .transform((value) => {
      const [d, m, y] = value.split('/');
      return new Date(`${y}-${m}-${d}`).toISOString();
    })
    .default(''),

  identityNumber: z.string().default(''),
  notes: z.string(),
  taxId: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: 'CPF inválido. Use o formato XXX.XXX.XXX-XX',
    })
    .or(
      z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
        message: 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX',
      }),
    )
    .default(''),
  phone: phoneSchema.default(''),
  whatsapp: phoneSchema.default(''),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  postalCode: z
    .string()
    .regex(/^\d{5}-\d{3}$/, { message: 'CEP inválido. Use o formato XXXXX-XXX' })
    .default(''),

  state: z
    .string()
    .min(2, { message: 'Selecione o estado' })
    .max(2, { message: 'Estado inválido' })
    .default(''),
  city: z.string().min(3, { message: 'Município deve ter pelo menos 3 caracteres' }).default(''),
  address: z.string().min(3, { message: 'Endereço deve ter pelo menos 3 caracteres' }).default(''),
  district: z.string().min(3, { message: 'Bairro deve ter pelo menos 3 caracteres' }).default(''),
  number: z.string().min(1, { message: 'Número é obrigatório' }).default(''),
  complement: z.string().optional().default(''),
  typePerson: z
    .enum(['individual', 'legalEntity'], { message: 'Selecione o tipo de documento' })
    .default('individual'),
  foreigner: z
    .enum(['sim', 'nao'], { message: 'Você é estrangeiro?' })
    .transform((value) => (value === 'sim' ? true : false))
    .default('sim'),
  gender: z
    .enum(['masculino', 'feminino', 'outro'], { message: 'Selecione um gênero' })
    .default('masculino'),
});
