import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function relativeTime(data: Date): string {
  return formatDistanceToNow(data, { locale: ptBR, addSuffix: true });
}
