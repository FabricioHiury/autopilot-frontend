import { z } from '@/lib/zod';

export const telefoneSchema = z
  .string({
    message:
      'Telefone inválido. Use um dos seguintes formatos: (XX) XXXX-XXXX, (XX) XXXXX-XXXX, +XX (XX) XXXXX-XXXX',
  })
  .refine(
    (phone) => {
      const telefoneNumeros = phone.replace(/\D/g, '');

      if (telefoneNumeros.length === 11) {
        return true;
      }

      if (telefoneNumeros.length === 10) {
        return true;
      }

      if (telefoneNumeros.length === 13) {
        return true;
      }

      return false;
    },
    {
      message:
        'Telefone inválido. Use um dos seguintes formatos: (XX) XXXX-XXXX, (XX) XXXXX-XXXX, +XX (XX) XXXXX-XXXX',
    },
  )
  .transform((value) => {
    value = value.replace(/[^\d]/g, '');
    value = value.slice(0, 2) + ' ' + value.slice(2);
    return value;
  });
