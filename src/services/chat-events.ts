import type { Message } from '@/types/message';
/** Delivery events may refer to messages outside the loaded history page. */
export function mergeChatMessage(
  messages: Message[],
  incoming: Message,
  statusOnly = false,
): Message[] {
  const index = messages.findIndex((item) => item.id === incoming.id);
  if (index < 0) return statusOnly ? messages : [...messages, incoming];
  return messages.map((item, position) => (position === index ? { ...item, ...incoming } : item));
}
