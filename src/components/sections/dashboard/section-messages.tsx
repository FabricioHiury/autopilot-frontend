import { channelLabel } from '@/lib/presentation-labels';
import AvatarUser from '@/components/commons/avatar-user';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { relativeTime } from '@/lib/relative-time';

export interface CardMessageProps {
  id: string;
  storeId: string;
  customerId: number | null;
  temporaryCustomerId: string;
  dealId: number | null;
  externalRecipientId: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  createdAt: string;
  updatedAt: string;
  customer: any;
  temporaryCustomer: any;
  message: any[];
}

export interface SectionMessagesProps {
  totalMessages: number;
  messages?: CardMessageProps[];
  onOpenClose?: () => void;
}

export function SectionMessages({ totalMessages, messages, onOpenClose }: SectionMessagesProps) {
  return (
    <div className="max-w-full">
      <div className="flex items-center justify-start gap-2">
        {onOpenClose && (
          <button onClick={onOpenClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.3996 13.6001L5.59961 8.0001L10.3996 2.4001"
                stroke="#485B80"
                strokeWidth="1.86667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h2 className="text-[hsl(var(--secondary))] font-semibold text-[1.5rem]">
          Últimas mensagens
        </h2>
        {totalMessages > 0 && (
          <span className="block text-xs text-primary-foreground bg-[hsl(var(--primary))] rounded-full px-2 py-0.5">
            {totalMessages}
          </span>
        )}
      </div>
      <div
        className="bg-[#EBEEF2] rounded-2xl w-full relative p-3 mt-4 min-h-[20rem] max-w-full overflow-y-auto
  sm:max-h-[30rem] md:max-h-[40rem] xl:max-h-[unset]
  flex flex-col gap-2
  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
"
      >
        {!messages &&
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[5rem] rounded-[.5rem] mb-2" />
          ))}

        {messages &&
          messages.length > 0 &&
          messages.map((message, index) => (
            <CardMessage key={message.id} active={index === 0} message={message} />
          ))}

        {messages && messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[15rem]">
            <span className="text-[#7F8999] text-sm">Nenhuma mensagem para exibir</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CardMessage({
  message,
  active,
}: {
  active: boolean;
  message: CardMessageProps;
}) {
  function processarNome(chat: CardMessageProps) {
    if (chat.temporaryCustomer) {
      return chat.temporaryCustomer.name ?? 'Desconhecido';
    }
    if (chat.customer) {
      return chat.customer.name ?? 'Desconhecido';
    }
  }
  function processarAvatar(chat: CardMessageProps) {
    if (chat.temporaryCustomer) {
      return chat.temporaryCustomer.avatar ?? 'Desconhecido';
    }
    if (chat.customer) {
      return chat.customer.avatar ?? 'Desconhecido';
    }
  }
  function processarConteudo(chat: CardMessageProps) {
    if (chat.message.length > 0) {
      if (chat.message[0].content) {
        return chat.message[0].content;
      } else {
        return 'Enviou um anexo';
      }
    }
    return 'Conversa vazia';
  }
  return (
    <div
      className="group w-full bg-transparent hover:bg-white transition-colors duration-300
  aria-selected:bg-white aria-selected:mb-2 rounded-[.5rem] p-3 flex flex-col gap-3
  md:p-4 md:gap-4
"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-2">
        <div className="flex items-center justify-start gap-2 min-w-0">
          <AvatarUser name={processarNome(message)} src={processarAvatar(message)} size={2.5} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-[hsl(var(--secondary))] text-[1.125rem] font-semibold leading-5 line-clamp-1 break-words">
              {processarNome(message)}
            </h3>
            <span className="block text-[#7F8999] text-xs leading-3">
              {relativeTime(new Date(message.updatedAt))}
            </span>
          </div>
        </div>
        <span className="bg-[hsl(var(--secondary))] uppercase rounded-full px-3 py-0.5 text-secondary-foreground text-xs flex-shrink-0 whitespace-nowrap mt-2 md:mt-0">
          {channelLabel(message.channel)}
        </span>
      </div>

      <div
        className="hidden group-hover:flex aria-selected:flex flex-col gap-4 animate-fade-in-top"
        aria-selected={active}
      >
        <span className="line-clamp-1 text-[#7F8999] text-xs leading-3 break-words">
          {processarConteudo(message)}
        </span>

        <Link
          href={`/app/deals/chat/?id=${message.id}`}
          className="w-full min-h-[2.5rem] rounded-[.5rem] mt-1 flex items-center justify-center gap-2 text-[hsl(var(--secondary))] text-sm font-semibold border border-[hsl(var(--secondary))]"
        >
          <span className="text-[hsl(var(--secondary))] text-xs">Acessar Conversa</span>

          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.9062 17.8232L11.3578 17.0598C11.7078 16.4682 11.8828 16.1715 12.1645 16.0082C12.4462 15.844 12.8003 15.8382 13.5087 15.8257C14.5553 15.8082 15.2112 15.744 15.7612 15.5157C16.2667 15.3063 16.726 14.9994 17.1129 14.6124C17.4998 14.2255 17.8068 13.7662 18.0162 13.2607C18.3337 12.4957 18.3337 11.5248 18.3337 9.58317V8.74984C18.3337 6.02234 18.3337 4.65817 17.7195 3.6565C17.3761 3.09584 16.905 2.62438 16.3445 2.28067C15.342 1.6665 13.9778 1.6665 11.2503 1.6665H8.75033C6.02283 1.6665 4.65866 1.6665 3.65699 2.28067C3.09632 2.62404 2.62487 3.09521 2.28116 3.65567C1.66699 4.65817 1.66699 6.02317 1.66699 8.74984V9.58317C1.66699 11.5248 1.66699 12.4957 1.98366 13.2607C2.19315 13.7663 2.50019 14.2257 2.88726 14.6126C3.27432 14.9995 3.73381 15.3064 4.23949 15.5157C4.78949 15.744 5.44533 15.8073 6.49199 15.8257C7.20033 15.8382 7.55449 15.844 7.83616 16.0082C8.11699 16.1715 8.29283 16.4673 8.64283 17.0598L9.09449 17.8232C9.49699 18.5032 10.5028 18.5032 10.9062 17.8232ZM13.3337 9.99984C13.5547 9.99984 13.7666 9.91204 13.9229 9.75576C14.0792 9.59948 14.167 9.38752 14.167 9.1665C14.167 8.94549 14.0792 8.73353 13.9229 8.57725C13.7666 8.42097 13.5547 8.33317 13.3337 8.33317C13.1126 8.33317 12.9007 8.42097 12.7444 8.57725C12.5881 8.73353 12.5003 8.94549 12.5003 9.1665C12.5003 9.38752 12.5881 9.59948 12.7444 9.75576C12.9007 9.91204 13.1126 9.99984 13.3337 9.99984ZM10.8337 9.1665C10.8337 9.38752 10.7459 9.59948 10.5896 9.75576C10.4333 9.91204 10.2213 9.99984 10.0003 9.99984C9.77931 9.99984 9.56735 9.91204 9.41107 9.75576C9.25479 9.59948 9.16699 9.38752 9.16699 9.1665C9.16699 8.94549 9.25479 8.73353 9.41107 8.57725C9.56735 8.42097 9.77931 8.33317 10.0003 8.33317C10.2213 8.33317 10.4333 8.42097 10.5896 8.57725C10.7459 8.73353 10.8337 8.94549 10.8337 9.1665ZM6.66699 9.99984C6.88801 9.99984 7.09997 9.91204 7.25625 9.75576C7.41253 9.59948 7.50033 9.38752 7.50033 9.1665C7.50033 8.94549 7.41253 8.73353 7.25625 8.57725C7.09997 8.42097 6.88801 8.33317 6.66699 8.33317C6.44598 8.33317 6.23402 8.42097 6.07774 8.57725C5.92146 8.73353 5.83366 8.94549 5.83366 9.1665C5.83366 9.38752 5.92146 9.59948 6.07774 9.75576C6.23402 9.91204 6.44598 9.99984 6.66699 9.99984Z"
              fill="hsl(var(--secondary))"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
