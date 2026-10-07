import { z } from 'zod';

z.setErrorMap((issue) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return {
        message:
          issue.received === 'undefined'
            ? 'Preenchimento obrigatório.'
            : 'Informe um valor válido.',
      };
    case z.ZodIssueCode.invalid_string:
      return {
        message:
          issue.validation === 'email'
            ? 'Informe um e-mail válido.'
            : issue.validation === 'url'
              ? 'Informe um endereço válido.'
              : 'Formato inválido.',
      };
    case z.ZodIssueCode.too_small:
      return {
        message:
          issue.type === 'string'
            ? 'Use pelo menos ' + issue.minimum + ' caracteres.'
            : issue.type === 'array'
              ? 'Selecione pelo menos ' + issue.minimum + ' opção(ões).'
              : 'O valor deve ser maior ou igual a ' + issue.minimum + '.',
      };
    case z.ZodIssueCode.too_big:
      return {
        message:
          issue.type === 'string'
            ? 'Use no máximo ' + issue.maximum + ' caracteres.'
            : 'O valor excede o limite permitido.',
      };
    case z.ZodIssueCode.invalid_enum_value:
    case z.ZodIssueCode.invalid_union:
      return { message: 'Selecione uma opção válida.' };
    case z.ZodIssueCode.invalid_date:
      return { message: 'Informe uma data válida.' };
    default:
      return { message: 'Confira o valor informado.' };
  }
});
export * from 'zod';
export default z;
