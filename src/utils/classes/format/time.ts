import { format, formatDistance, formatRelative, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/*
Classe utilitária que lida com formatação de data
*/
class HandleDate {
  /**
   * Função para formatar uma data em um formato específico.
   *
   * @param {Date} date - A data a ser formatada.
   * @param {string} [dateFormat='dd/MM/yyyy'] - O formato desejado para a data.
   * @returns {string} - A data formatada como uma string.
   */
  formatDate = (date: Date, dateFormat: string = 'dd/MM/yyyy'): string => {
    date.setDate(date.getDate() + 1);
    return format(new Date(date), dateFormat, { locale: ptBR });
  };

  /**
   * Função para formatar uma data com base na distância de tempo até o presente.
   *
   * @param {Date} date - A data a ser comparada com o presente.
   * @returns {string} - A distância de tempo até o presente, formatada como uma string.
   */
  formatDistanceToNow = (date: Date) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: ptBR });
  };

  /**
   * Função para formatar uma data de forma relativa (ex: "há 3 dias", "em 2 semanas").
   *
   * @param {Date} date - A data a ser formatada de forma relativa.
   * @param {Date} [baseDate=new Date()] - A data base para calcular a distância relativa.
   * @returns {string} - A data formatada de forma relativa, como uma string.
   */
  formatRelativeDate = (date: Date, baseDate = new Date()) => {
    return formatRelative(new Date(date), baseDate, { locale: ptBR });
  };

  /**
   * Função para adicionar dias a uma data.
   *
   * @param {Date} date - A data original.
   * @param {number} days - O número de dias a serem adicionados.
   * @param {string} [dateFormat='dd/MM/yyyy'] - O formato desejado para a data resultante.
   * @returns {string} - A nova data, com os dias adicionados, formatada
   */
  addDaysToDate = (date: Date, days: number, dateFormat: string = 'dd/MM/yyyy') => {
    return format(addDays(new Date(date), days), dateFormat);
  };

  /**
   * Função para converter uma string ISO em uma data formatada.
   *
   * @param {string} isoDate - A string ISO a ser convertida em data.
   * @param {string} [dateFormat='dd/MM/yyyy'] - O formato desejado para a data resultante.
   * @returns {string} - A data formatada, convertida a partir da string ISO.
   */
  formatISODate = (isoDate: string, dateFormat: string = 'dd/MM/yyyy') => {
    if (isoDate.includes('T00:00:00.000Z')) {
      const tmpDate = new Date(isoDate);
      tmpDate.setDate(tmpDate.getDate() + 1);
      isoDate = tmpDate.toISOString();
    }
    return format(parseISO(isoDate), dateFormat, { locale: ptBR });
  };
}

const handleDate = new HandleDate();
export default handleDate;
