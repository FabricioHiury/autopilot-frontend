/**
 * Classe para sanitização e formatação de diversos tipos de documentos e números de telefone.
 */
class Sanitizer {
  /**
   * Formata uma data no formato DD/MM/AAAA.
   * @param inputDate - A data a ser formatada, como uma string no formato AAAAMMDD ou AAAA-MM-DD.
   * @returns A data formatada no estilo DD/MM/AAAA.
   */
  data(inputDate: string): string {
    // Remove quaisquer caracteres que não sejam números
    inputDate = inputDate.replace(/\D/g, '');
    inputDate = inputDate.substring(0, 8);

    if (inputDate.length == 3) {
      //Retorna dia/
      inputDate = inputDate.replace(/(\d{2})/, '$1/');
    } else if (inputDate.length == 5 || inputDate.length == 6) {
      //Retorna dia/
      inputDate = inputDate.replace(/(\d{2})(\d{2})/, '$1/$2/');
    } else if (inputDate.length <= 8) {
      // Retorna dia/mês/ano
      inputDate = inputDate.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }

    return inputDate;
  }

  number(input: string, limite?: number, minimo?: number): string {
    input = input.replace(/[^0-9]/g, '');

    if (limite && parseInt(input, 10) >= limite) {
      input = limite.toString();
    }
    if (minimo && parseInt(input, 10) < minimo) {
      input = minimo.toString();
    }

    return input;
  }

  /**
   * Formata um número de CPF.
   * @param cpf - O número de CPF a ser formatado, como uma string.
   * @returns O número de CPF formatado.
   */
  cpf(cpf: string): string {
    if (cpf.length > 14) {
      return cpf.substring(0, 14);
    }
    let doc = cpf.replace(/[^0-9]/g, '');
    if (doc.length <= 11) {
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return doc;
  }

  /**
   * Formata um número de CPF ou CNPJ dependendo da quantidade de dígitos.
   * @param cpf - O número do documento a ser formatado, como uma string.
   * @returns O número do documento formatado.
   */
  cpfcnpj(cpf: string): string {
    let doc = cpf.replace(/[^0-9]/g, '');
    if (doc.length > 14) {
      doc = doc.substring(0, 14);
    }
    if (doc.length <= 11) {
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d)/, '$1.$2');
      doc = doc.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (doc.length <= 14) {
      doc = doc.replace(/^(\d{2})(\d)/, '$1.$2');
      doc = doc.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      doc = doc.replace(/\.(\d{3})(\d)/, '.$1/$2');
      doc = doc.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return doc;
  }

  /**
   * Formata um número de CNPJ.
   * @param inputValue - O número de CNPJ a ser formatado, como uma string.
   * @returns O número de CNPJ formatado.
   */
  taxId(inputValue: string): string {
    inputValue = inputValue.replace(/\D/g, '');

    if (inputValue.length > 14) {
      inputValue = inputValue.slice(0, 14);
    }
    if (inputValue.length > 2) {
      inputValue = inputValue.replace(/^(\d{2})(\d)/, '$1.$2');
    }
    if (inputValue.length > 5) {
      inputValue = inputValue.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    }
    if (inputValue.length > 8) {
      inputValue = inputValue.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
    }
    if (inputValue.length > 12) {
      inputValue = inputValue.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    }

    return inputValue;
  }

  /**
   * Formata um número de RG (Registro Geral).
   * @param inputValue - O número de RG a ser formatado, como uma string.
   * @returns O número de RG formatado.
   */
  identityNumber(inputValue: string): string {
    inputValue = inputValue.replace(/\D/g, '');

    // Limita o número de caracteres para no máximo 9
    if (inputValue.length > 9) {
      inputValue = inputValue.slice(0, 9);
    }

    // Formata o RG no formato XX.XXX.XXX-X
    if (inputValue.length > 6) {
      inputValue = inputValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
    } else if (inputValue.length > 3) {
      inputValue = inputValue.replace(/^(\d{2})(\d{3})(\d{1})$/, '$1.$2.$3');
    }

    return inputValue;
  }

  /**
   * Formata um número de CEP (Código de Endereçamento Postal).
   * @param inputValue - O número de CEP a ser formatado, como uma string.
   * @returns O número de CEP formatado.
   */
  postalCode(inputValue: string): string {
    inputValue = inputValue.replace(/\D/g, '');

    if (inputValue.length > 8) {
      inputValue = inputValue.slice(0, 8);
    }

    if (inputValue.length === 8) {
      inputValue = inputValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    return inputValue;
  }

  /**
   * Formata um número de telefone.
   * @param input - O número de telefone a ser formatado, como uma string.
   * @param countryCode - Um booleano indicando se deve incluir o código do país na formatação.
   * @returns O número de telefone formatado.
   */
  phone(input: string, countryCode: boolean, limit?: number): string {
    input = input.replace(/[^0-9]/g, '');
    let phone = input.replace(/\D/g, '');

    phone = phone.substring(0, countryCode ? 13 : 11);
    if (limit) {
      phone = phone.substring(0, limit);
    }
    if (phone.length === 11) {
      phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      phone = phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 13 && countryCode) {
      phone = phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    } else {
      return input;
    }
    return phone;
  }
}

const sanitizar = new Sanitizer();
export default sanitizar;
