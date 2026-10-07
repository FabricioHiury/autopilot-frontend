import { presentationLabel } from './presentation-labels';

// Only use on application-generated messages, never on customer conversations.
export function systemMessage(
  text: string | null | undefined,
  fallback = 'Há uma atualização no atendimento.',
): string {
  if (!text) return fallback;
  const patterns: Array<[RegExp, (...parts: string[]) => string]> = [
    [/^Chat linked to deal (.+)$/i, (title) => 'Conversa vinculada ao atendimento ' + title],
    [/^One new deal was created for (.+)$/i, (names) => 'Novo atendimento criado para ' + names],
    [
      /^One new deal was assigned a you by (.+)$/i,
      (name) => 'Novo atendimento atribuído a você por ' + name,
    ],
    [
      /^O deal (.+) was removed of you by (.+)$/i,
      (title, name) => 'O atendimento ' + title + ' foi removido de você por ' + name,
    ],
    [
      /^O deal (.+) was assigned a you by (.+)$/i,
      (title, name) => 'O atendimento ' + title + ' foi atribuído a você por ' + name,
    ],
    [
      /^O deal (.+) was changed for (.+) by (.+)$/i,
      (title, status, name) =>
        'O atendimento ' +
        title +
        ' foi alterado para ' +
        presentationLabel(status) +
        ' por ' +
        name,
    ],
    [
      /^You have a task "(.+)" scheduled for today (.+)$/i,
      (name, hour) => 'Você tem a tarefa "' + name + '" agendada para hoje às ' + hour,
    ],
    [/^A task "(.+)" was completed$/i, (name) => 'A tarefa "' + name + '" foi concluída'],
    [
      /^Uma new task "(.+)" was assigned a you$/i,
      (name) => 'Uma nova tarefa "' + name + '" foi atribuída a você',
    ],
    [
      /^You have a visit of (.+) scheduled for today(.*) with (.+)$/i,
      (type, hour, name) =>
        'Você tem uma visita de ' +
        presentationLabel(type) +
        ' agendada para hoje' +
        hour.replace(' at ', ' às ') +
        ' com ' +
        name,
    ],
    [
      /^A visit of (.+) with (.+) was completed$/i,
      (type, name) => 'A visita de ' + presentationLabel(type) + ' com ' + name + ' foi concluída',
    ],
    [
      /^New visit of (.+) scheduled for (.+) with (.+)$/i,
      (type, date, name) =>
        'Nova visita de ' +
        presentationLabel(type) +
        ' agendada para ' +
        date.replace(' at ', ' às ') +
        ' com ' +
        name,
    ],
    [
      /^(.+) compartilhou a deal with you$/i,
      (name) => name + ' compartilhou um atendimento com você',
    ],
    [
      /^(.+) removeu o share of a deal with you$/i,
      (name) => name + ' removeu o compartilhamento de um atendimento com você',
    ],
  ];
  for (const [pattern, translate] of patterns) {
    const match = text.match(pattern);
    if (match) return translate(...match.slice(1));
  }
  if (
    /\b(was|with|for|assigned|created|deleted|changed|completed|scheduled|linked|removed|successfully)\b/i.test(
      text,
    )
  )
    return fallback;
  return text;
}
