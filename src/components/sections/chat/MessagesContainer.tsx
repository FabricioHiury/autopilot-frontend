'use client';

import { useEffect, useMemo, useState, memo, useRef, useCallback } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import { cn } from '@/lib/class-name.utils';
import {
  checkSocialMediaMp4Type,
  getFileTypeByExtension,
  getFileTypeByMimeType,
} from '@/lib/files.utils';

import AvatarUser from '@/components/commons/avatar-user';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import Spinner from '@/components/loading/Spinner';
import { formatMessageText } from '@/components/sections/chat/utils/formatMessage';

import { AnexoImageChat } from '@/components/sections/chat/attachments/AnexoImageChat';
import { AnexoDocumentoChat } from '@/components/sections/chat/attachments/AnexoDocumentoChat';
import { AnexoAudioChat } from '@/components/sections/chat/attachments/AnexoAudioChat';
import { AnexoVideoChat } from '@/components/sections/chat/attachments/AnexoVideoChat';
import { AnexoReelChat } from '@/components/sections/chat/attachments/AnexoReelChat';
import { AnexoPdfChat } from '@/components/sections/chat/attachments/AnexoPdfChat';

import { LocationMessageCard } from '@/components/sections/chat/cards/LocationMessageCard';
import { ContactMessageCard } from '@/components/sections/chat/cards/ContactMessageCard';
import { PixMessageCard } from '@/components/sections/chat/cards/PixMessageCard';
import { LinkMessageCard } from '@/components/sections/chat/cards/LinkMessageCard';
import { CallMessageCard } from '@/components/sections/chat/cards/CallMessageCard';
import { MessageOriginBadge } from '@/components/sections/chat/cards/MessageOriginBadge';

import { analyzeMessage } from '@/components/sections/chat/utils/messageParser';

type Pessoa = {
  name?: string | null;
  avatar?: string | null;
};

type Message = {
  id: string;
  userId: string | null;
  chatId: string;
  externalRecipientId: string;
  externalMessageId: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  type?: string | null;
  quotedMessageId?: string | null;
  originalMessage?: {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    attachmentType: string | null;
    createdAt: string;
    person: Pessoa | null;
  } | null;
  metadata?: {
    origemMensagem?: string;
    detalhesOrigem?: string;
    storyId?: string;
    storyUrl?: string;
    postId?: string;
    reelId?: string;
  } | null;
  reaction?: string | null;
  sender: 'CUSTOMER' | 'STORE' | 'SYSTEM' | string;
  content: string;
  channel: string;
  createdAt: string;
  person: Pessoa | null;
  isRead: boolean;
  deliveryStatus?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
};

type TemporaryCustomer = {
  id: string;
  avatar: string | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  channel: string;
  externalContactId: string;
  createdAt: string;
  updatedAt: string;
};

type Chat = {
  id: string;
  storeId: string;
  customerId: number | null;
  temporaryCustomerId: string;
  dealId: number | null;
  externalRecipientId: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  createdAt: string;
  updatedAt: string;
  customer: unknown;
  temporaryCustomer: TemporaryCustomer;
  message: Message[];
};

const isOlxAudioUrl = (rawUrl: string): boolean => {
  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const isOlxHost = /(^|\.)chat-bff\.olx\.com\.br$/i.test(url.host);
    const hasAudioType = url.searchParams.get('type') === 'audio';
    const looksMediaPath = /\/medias\//.test(url.pathname);
    return isOlxHost && (hasAudioType || looksMediaPath);
  } catch {
    return false;
  }
};

const findOlxAudioUrlInText = (text?: string | null): string | null => {
  if (!text) return null;
  const matches: string[] = [];

  const urlRegex = /(https?:\/\/[^\s<>'"\)\]]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(text)) !== null) {
    matches.push(m[1]);
  }

  const bareOlxRegex = /(\bchat-bff\.olx\.com\.br[^\s<>'"\)\]]*)/gi;
  while ((m = bareOlxRegex.exec(text)) !== null) {
    matches.push(m[1]);
  }
  for (const candidate of matches) {
    const urlStr = candidate.startsWith('http') ? candidate : `https://${candidate}`;
    if (isOlxAudioUrl(urlStr)) {
      return urlStr;
    }
  }
  return null;
};

const findOlxImageUrlInText = (text?: string | null): string | null => {
  if (!text) return null;
  const urls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s<>'"\)\]]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(text)) !== null) urls.push(m[1]);
  const bareRegex = /(\bchat-images\.olx\.com\.br[^\s<>'"\)\]]*)/gi;
  while ((m = bareRegex.exec(text)) !== null) urls.push(m[1]);
  for (const u of urls) {
    const normalized = u.startsWith('http') ? u : `https://${u}`;
    try {
      const parsed = new URL(normalized);
      const okHost = /(^|\.)chat-images\.olx\.com\.br$/i.test(parsed.host);
      const looksImg = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(parsed.pathname);
      if (okHost && looksImg) return normalized;
    } catch {}
  }
  return null;
};

export interface MessagesContainerProps {
  messages?: Message[];
  loading: boolean;
  chat?: Chat;
  search: string;
  onLoadMore: () => void;
  end: boolean;
  onScroolOnTop: () => boolean;
  onOpenNovoChat?: (payload: {
    name?: string;
    whatsapp?: string;
    atendimentoId?: number | null;
  }) => void;
  onNavigateToMessage?: (messageId: string) => Promise<void>;
  onReplyToMessage?: (message: Message) => void;
  onReactToMessage?: (message: Message, reaction: string) => void;
}

const hasNonEmptyText = (text?: string | null): text is string =>
  typeof text === 'string' && text.trim().length > 0;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const dayLabel = (isoDateStr: string): string => {
  const dateObj = new Date(`${isoDateStr}T00:00:00`);
  const today = new Date();
  const yesterday = subDays(today, 1);
  const dayBeforeYesterday = subDays(today, 2);

  if (isSameDay(dateObj, today)) return 'Hoje';
  if (isSameDay(dateObj, yesterday)) return 'Ontem';
  if (isSameDay(dateObj, dayBeforeYesterday)) return 'Anteontem';
  return format(dateObj, 'dd/MM/yyyy');
};

const ReactionBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-white text-[#485b7f] text-[12px] border border-[#d7deea] shadow-sm">
    <span className="leading-none text-base">{text}</span>
  </span>
);

function useSocialMediaMp4Type(
  url: string | null | undefined,
  channel: string,
  messageType?: string | null,
): 'audio' | 'video' | null {
  const [type, setType] = useState<'audio' | 'video' | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!url) {
        if (!cancelled) setType(null);
        return;
      }

      if (channel === 'instagram' || channel === 'facebook') {
        const ext = url.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') {
          if (messageType?.toLowerCase() === 'audio') {
            if (!cancelled) setType('audio');
            return;
          }
          if (messageType?.toLowerCase() === 'video') {
            if (!cancelled) setType('video');
            return;
          }

          try {
            const t = await checkSocialMediaMp4Type(url);
            if (!cancelled) setType(t ?? null);
          } catch {
            if (!cancelled) setType(null);
          }
          return;
        }
      }

      if (!cancelled) setType(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [url, channel, messageType]);

  return type;
}

export function MessagesContainer({
  messages,
  loading,
  chat,
  search,
  onLoadMore,
  end,
  onScroolOnTop,
  onOpenNovoChat,
  onNavigateToMessage,
  onReplyToMessage,
  onReactToMessage,
}: MessagesContainerProps) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  const endRef = useRef<HTMLDivElement | null>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentChatId = chat?.id ?? null;
    const chatChanged = previousChatIdRef.current !== currentChatId;
    if (chatChanged && !loading) {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      });
    }
    previousChatIdRef.current = currentChatId;
  }, [chat?.id, loading]);

  useEffect(() => {
    const isNearBottom = () => {
      const el = containerRef.current;
      if (!el) return false;
      const threshold = 120;
      return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    };
    if (isNearBottom()) {
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [safeMessages.length]);

  useEffect(() => {
    if (!hasNonEmptyText(search)) return;
    const first = safeMessages.find(
      (m) => hasNonEmptyText(m.content) && normalize(m.content).includes(normalize(search)),
    );
    if (first?.id) {
      const el = document.getElementById(`message-${first.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [search, safeMessages]);

  const filteredAndGrouped = useMemo(() => {
    const acc: Record<string, Message[]> = {};

    const matchesSearch = (m: Message): boolean => {
      const hasAttachment = hasNonEmptyText(m.attachmentUrl);
      const hasText = hasNonEmptyText(m.content);
      if (hasAttachment) return true;
      if (!hasText) return false;
      if (!hasNonEmptyText(search)) return true;
      const normT = normalize(m.content!);
      const normQ = normalize(search);
      return normT.includes(normQ);
    };

    const sorted = [...safeMessages]
      .filter((m) => matchesSearch(m))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const message of sorted) {
      const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(message);
    }

    return acc;
  }, [safeMessages, search]);

  if (!chat) {
    return (
      <div className="flex flex-col gap-4 h-full flex-grow items-center">
        <LoadingGlobal />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      {loading && (
        <div className="self-center mt-12 flex justify-center items-center flex-col z-20 left-0 h-full w-full text-white font-semibold">
          <Spinner color="black" width="24px" />
        </div>
      )}

      {(() => {
        const showLoadMore = !end && onScroolOnTop() && !loading && safeMessages.length > 0;
        return (
          showLoadMore && (
            <div className="self-center">
              <button
                className="p-2 px-4 bg-white hover:bg-slate-50 font-semibold text-[12px] rounded-2xl shadow-md"
                onClick={onLoadMore}
                aria-label="Carregar mais mensagens"
              >
                Carregar mais mensagens
              </button>
            </div>
          )
        );
      })()}

      <div className="mx-auto w-full px-4 max-w-[24rem]">
        <p className="text-center text-[#485b7f] text-xs font-semibold">
          Você está iniciando o atendimento pelo {chat.channel}.
        </p>
        <p className="text-center text-[#485b7f] text-xs font-normal">
          As mensagens em outros canais ficarão disponíveis nas informações sobre o atendimento.
        </p>
      </div>

      {hasNonEmptyText(search) && Object.keys(filteredAndGrouped).length === 0 && !loading && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-[#485b7f]">
            <p className="text-sm">Nenhuma mensagem encontrada neste chat.</p>
          </div>
        </div>
      )}

      {Object.entries(filteredAndGrouped)
        .sort(
          ([, itemsA], [, itemsB]) =>
            new Date(itemsA[itemsA.length - 1]?.createdAt || 0).getTime() -
            new Date(itemsB[itemsB.length - 1]?.createdAt || 0).getTime(),
        )
        .map(([date, items]) => (
          <MessageDayGroup
            key={date}
            stringDay={dayLabel(date)}
            messages={items}
            chat={chat}
            onOpenNovoChat={onOpenNovoChat}
            onNavigateToMessage={onNavigateToMessage}
            onReplyToMessage={onReplyToMessage}
            onReactToMessage={onReactToMessage}
            search={search}
          />
        ))}

      <div ref={endRef} />
    </div>
  );
}

const MessageDayGroup = memo(function MessageDayGroup({
  stringDay,
  messages,
  chat,
  onOpenNovoChat,
  onNavigateToMessage,
  onReplyToMessage,
  onReactToMessage,
  search,
}: {
  stringDay: string;
  messages: Message[];
  chat?: Chat;
  onOpenNovoChat?: MessagesContainerProps['onOpenNovoChat'];
  onNavigateToMessage?: MessagesContainerProps['onNavigateToMessage'];
  onReplyToMessage?: MessagesContainerProps['onReplyToMessage'];
  onReactToMessage?: MessagesContainerProps['onReactToMessage'];
  search: string;
}) {
  const imageGallery = useMemo(() => {
    const imgs: { src: string; data?: string; id: string }[] = [];
    for (const m of messages) {
      if (m.type === 'reaction') continue;
      const attachment = m.attachmentUrl;
      if (!attachment) continue;
      const resolvedType: string = m.attachmentType
        ? getFileTypeByMimeType(m.attachmentType)
        : getFileTypeByExtension(attachment);
      if (resolvedType === 'image') {
        imgs.push({ src: attachment, data: m.createdAt, id: m.id });
      }
    }
    return imgs;
  }, [messages]);

  const indexByMessageId = useMemo(() => {
    const map = new Map<string, number>();
    imageGallery.forEach((img, index) => map.set(img.id, index));
    return map;
  }, [imageGallery]);

  const showHeader = (index: number): boolean => {
    if (index <= 0) return true;
    const prev = messages[index - 1];
    const curr = messages[index];

    const sameSender = curr.sender === prev.sender;
    const diffMs = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    const closeInTime = diffMs < 5 * 60 * 1000;

    return !(sameSender && closeInTime);
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => m.type !== 'reaction');
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex justify-center">
        <span className="w-fit block text-[#485b7f] text-sm font-semibold px-1.5 py-1 bg-[#ebeef2] rounded">
          {stringDay}
        </span>
      </div>

      {filteredMessages.map((message, renderIdx) => (
        <MessageItem
          key={message.id ?? renderIdx}
          message={message}
          header={showHeader(renderIdx)}
          onOpenNovoChat={onOpenNovoChat}
          onNavigateToMessage={onNavigateToMessage}
          onReplyToMessage={onReplyToMessage}
          onReactToMessage={onReactToMessage}
          chat={chat}
          atendimentoId={chat?.dealId ?? null}
          imageGallery={imageGallery}
          imageIndex={indexByMessageId.get(message.id)}
          search={search}
          allMessages={messages}
        />
      ))}
    </div>
  );
});

function MessageItem({
  message,
  header = true,
  onOpenNovoChat,
  onNavigateToMessage,
  onReplyToMessage,
  onReactToMessage,
  chat,
  atendimentoId,
  imageGallery,
  imageIndex,
  search,
  allMessages,
}: {
  message: Message;
  header?: boolean;
  onOpenNovoChat?: MessagesContainerProps['onOpenNovoChat'];
  onNavigateToMessage?: MessagesContainerProps['onNavigateToMessage'];
  onReplyToMessage?: MessagesContainerProps['onReplyToMessage'];
  onReactToMessage?: MessagesContainerProps['onReactToMessage'];
  chat?: Chat;
  atendimentoId?: number | null;
  imageGallery?: { src: string; data?: string; id: string }[];
  imageIndex?: number;
  search: string;
  allMessages?: Message[];
}) {
  const timeFormatted = useMemo(
    () => format(new Date(message.createdAt || Date.now()), 'HH:mm'),
    [message.createdAt],
  );

  const referencedMessage = useMemo(() => {
    const hasReference = message.quotedMessageId || message.quotedMessageId;
    if (message.originalMessage) {
      return message.originalMessage;
    }

    const referenceId = message.quotedMessageId || message.quotedMessageId;
    if (!referenceId || !allMessages) return null;

    const extractExternalId = (id: string) => {
      const match = id.match(/([A-F0-9]{20,})$/i);
      return match ? match[1] : id;
    };

    const cleanReferenceId = extractExternalId(referenceId);

    const foundMessage = allMessages.find((msg) => {
      if (!msg.externalMessageId) return msg.id === referenceId;

      const cleanMsgId = extractExternalId(msg.externalMessageId);

      return (
        msg.externalMessageId === referenceId ||
        msg.id === referenceId ||
        msg.externalMessageId.endsWith(referenceId) ||
        msg.externalMessageId.endsWith(cleanReferenceId) ||
        cleanMsgId === cleanReferenceId
      );
    });

    if (foundMessage) {
      return {
        id: foundMessage.id,
        content: foundMessage.content,
        attachmentUrl: foundMessage.attachmentUrl,
        attachmentType: foundMessage.attachmentType,
        createdAt: foundMessage.createdAt,
        person: foundMessage.person,
      };
    }

    return null;
  }, [message.originalMessage, message.quotedMessageId, message.quotedMessageId, allMessages]);

  const handleNavigateToOriginal = useCallback(async () => {
    if (!referencedMessage?.id || !onNavigateToMessage) return;

    try {
      await onNavigateToMessage(referencedMessage.id);
    } catch (error) {
      console.error('Erro ao navegar para mensagem original:', error);
    }
  }, [referencedMessage?.id, onNavigateToMessage]);

  const [errorSending, setErrorSending] = useState(false);
  const socialMediaType = useSocialMediaMp4Type(
    message.attachmentUrl,
    message.channel,
    message.type,
  );

  const { isPix, callInfo, locationInfo, contactInfo, linkInfo } = analyzeMessage(
    message.content || '',
  );

  useEffect(() => {
    setErrorSending(false);

    if (message.sender !== 'STORE') return;
    if (message.externalMessageId) return;

    const timer = setTimeout(() => {
      if (!message.externalMessageId) {
        setErrorSending(true);
      }
    }, 10_000);

    return () => clearTimeout(timer);
  }, [message.id, message.sender, message.externalMessageId]);

  const hasText = hasNonEmptyText(message.content);
  const hasAttachment = hasNonEmptyText(message.attachmentUrl);
  if (!hasText && !hasAttachment && message.type !== 'reaction') return null;

  const displayName = message.person?.name || 'Usuário';
  const avatarSrc = message.person?.avatar || undefined;

  const isPureLinkText = useMemo(() => {
    if (!hasText) return false;
    const trimmed = message.content!.trim();
    const urlOnly =
      /^(https?:\/\/[^\s<>'"\)\]]+)$/i.test(trimmed) ||
      /^(?:www\.)?[^\s<>'"\)\]]+\.[a-z]{2,}[^\s]*$/i.test(trimmed);
    return urlOnly;
  }, [hasText, message.content]);

  const shouldHideTextBecauseAttachment = useMemo(() => {
    if (!hasAttachment) return false;
    if (!hasText) return false;
    if (isPureLinkText) return true;
    if (findOlxImageUrlInText(message.content) || findOlxAudioUrlInText(message.content))
      return true;
    const looksLikeFilename = /[^\s]+\.[a-z0-9]{2,4}$/i.test(message.content.trim());
    if (looksLikeFilename) return true;
    return false;
  }, [hasAttachment, hasText, isPureLinkText, message.content]);

  const renderAttachment = (m: Message) => {
    const attachment = m.attachmentUrl;
    if (!attachment) return null;

    const attachmentClass =
      m.sender === 'CUSTOMER' ? 'message-attachment-cliente' : 'message-attachment-loja';

    const isStoryReply = m.channel === 'instagram' && m.metadata?.origemMensagem === 'story_reply';

    if ((m.type === 'sticker' || m.type === 'STICKER') && attachment) {
      const alignRightClass = m.sender === 'STORE' ? 'ml-auto' : '';
      return (
        <div
          className={`${attachmentClass} inline-flex w-36 h-36 rounded-lg bg-transparent overflow-hidden ${alignRightClass}`}
        >
          <img
            src={attachment}
            alt="Sticker"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>
      );
    }

    let resolvedType: string;

    if (m.channel === 'instagram' || m.channel === 'facebook') {
      if (
        m.type &&
        ['audio', 'voice', 'video', 'image', 'reel', 'sticker', 'document', 'pdf'].includes(
          m.type.toLowerCase(),
        )
      ) {
        resolvedType = m.type.toLowerCase();
      } else if (socialMediaType) {
        resolvedType = socialMediaType;
      } else if (m.attachmentType) {
        resolvedType = getFileTypeByMimeType(m.attachmentType);
      } else {
        resolvedType = getFileTypeByExtension(attachment);
      }
    } else {
      if (socialMediaType) {
        resolvedType = socialMediaType;
      } else if (m.attachmentType) {
        resolvedType = getFileTypeByMimeType(m.attachmentType);
      } else {
        resolvedType = getFileTypeByExtension(attachment);
      }
    }

    switch (resolvedType) {
      case 'image':
        return (
          <div className={attachmentClass}>
            <div className="relative">
              <AnexoImageChat
                src={attachment}
                data={m.createdAt}
                idContainer="content-container"
                gallery={imageGallery?.map((g) => ({ src: g.src, data: g.data }))}
                currentIndex={imageIndex}
              />
              {isStoryReply && (
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                    <circle cx="12" cy="12" r="6" fill="currentColor" />
                  </svg>
                  <span className="text-white text-xs font-semibold">Story</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'audio':
      case 'voice':
        return (
          <div className={attachmentClass}>
            <AnexoAudioChat src={attachment} />
          </div>
        );
      case 'reel':
      case 'ig_reel':
        return (
          <div className={attachmentClass}>
            <AnexoReelChat src={attachment} data={m.createdAt} idContainer="content-container" />
          </div>
        );
      case 'video':
        return (
          <div className={attachmentClass}>
            <div className="relative">
              <AnexoVideoChat src={attachment} data={m.createdAt} idContainer="content-container" />
              {isStoryReply && (
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                    <circle cx="12" cy="12" r="6" fill="currentColor" />
                  </svg>
                  <span className="text-white text-xs font-semibold">Story</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className={attachmentClass}>
            <AnexoPdfChat src={attachment} idContainer="content-container" />
          </div>
        );
      case 'document':
      case 'file':
        return (
          <div className={attachmentClass}>
            <AnexoDocumentoChat src={attachment} title={m.content || undefined} />
          </div>
        );
      case 'sticker':
        return (
          <div className={attachmentClass}>
            <img
              src={attachment}
              alt="Sticker"
              className="max-w-[150px] max-h-[150px] object-contain"
            />
          </div>
        );
      default:
        console.log('[MessagesContainer] Tipo não suportado:', {
          resolvedType,
          type: m.type,
          attachmentType: m.attachmentType,
          channel: m.channel,
          attachment: attachment?.substring(0, 100),
        });
        return (
          <div className={attachmentClass}>
            <span className="text-slate-400 text-xs">
              Tipo de anexo não suportado ({resolvedType})
            </span>
          </div>
        );
    }
  };

  const ReactionBadge = ({ text }: { text: string }) => (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 text-[#485b7f] text-[11px] border border-[#d7deea]">
      <span className="text-base leading-none">{text}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="opacity-60"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </span>
  );

  const highlightClass = useMemo(() => {
    if (!hasNonEmptyText(search)) return '';
    const normT = message.content ? normalize(message.content) : '';
    const normQ = normalize(search);
    if (!normT.includes(normQ)) return '';
    return 'animate-[ping_0.6s_ease-in-out_1]';
  }, [search, message.content]);

  if (message.sender === 'CUSTOMER') {
    return (
      <div
        id={`message-${message.id}`}
        className={cn(
          'lg:w-[26rem] justify-start items-start gap-3 inline-flex animate-fade-in group',
          highlightClass,
        )}
      >
        <AvatarUser
          name={displayName}
          src={avatarSrc}
          size={3}
          className={header ? '' : 'opacity-0'}
        />
        <div className="grow shrink basis-0 flex-col justify-start items-start gap-2 inline-flex relative">
          <div
            className={cn(
              'self-stretch justify-start items-center gap-[9px] inline-flex',
              header ? '' : 'hidden',
            )}
          >
            <div className="text-[#283855] text-sm font-semibold">{displayName}</div>
            <div className="text-[#7f8999] text-xs font-normal">{timeFormatted}</div>
            {message.channel === 'instagram' &&
              message.metadata?.origemMensagem &&
              message.metadata.origemMensagem !== 'direct_message' && (
                <MessageOriginBadge
                  origin={message.metadata.origemMensagem}
                  details={message.metadata.detalhesOrigem}
                />
              )}
          </div>
          {/* Reação desabilitada para Instagram - API não suporta receber reações via webhook */}
          {/* {chat?.canal === 'instagram' && message.remetente === 'cliente' && onReactToMessage && (
            <button
              onClick={() => onReactToMessage(message, 'love')}
              className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-[#F2F4F7] rounded-full"
              title="Reagir com ❤️"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#657380]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          )} */}

          <div className="grid grid-cols-1 gap-4 w-full">
            {hasAttachment && renderAttachment(message)}

            {hasText && message.content === 'Mensagem não identificada' && (
              <span className="text-slate-400 text-xs">
                Ação realizada pelo(a) interlocutor(a) não suportada
              </span>
            )}

            {(hasText || message.type === 'reaction') &&
              !shouldHideTextBecauseAttachment &&
              (message.content !== 'Mensagem não identificada' || message.type === 'reaction') && (
                <div className="message-content-cliente self-stretch p-4 bg-[#e2e6ec] rounded-tr-xl rounded-bl-xl rounded-br-xl justify-center items-center gap-2.5 inline-flex">
                  <div className="w-full">
                    {referencedMessage && (
                      <div
                        className="mb-3 p-2 bg-[#d1d5db] border-l-4 border-[#485b7f] rounded-lg cursor-pointer"
                        onClick={handleNavigateToOriginal}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigateToOriginal()}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-[#485b7f]"
                          >
                            <path
                              d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="text-xs font-medium text-[#485b7f]">
                            {referencedMessage.person?.name || 'Usuário'}
                          </span>
                          <span className="text-xs text-[#7f8999] ml-auto">↗</span>
                        </div>
                        <div className="text-xs text-[#283855] truncate max-w-full">
                          {referencedMessage.attachmentUrl ? (
                            <span className="italic">📎 Anexo</span>
                          ) : referencedMessage.content && referencedMessage.content.length > 40 ? (
                            `${referencedMessage.content.substring(0, 40)}...`
                          ) : (
                            referencedMessage.content || 'Mensagem sem conteúdo'
                          )}
                        </div>
                      </div>
                    )}

                    {isPix ? (
                      <PixMessageCard code={message.content} tone="light" />
                    ) : callInfo.isCall ? (
                      <CallMessageCard info={callInfo} tone="light" />
                    ) : locationInfo.isLocation ? (
                      <LocationMessageCard info={locationInfo} tone="light" />
                    ) : contactInfo.isContact ? (
                      <ContactMessageCard
                        info={contactInfo}
                        tone="light"
                        onOpenNovoChat={onOpenNovoChat}
                        atendimentoId={atendimentoId ?? null}
                      />
                    ) : message.type === 'reaction' ? (
                      <div className="flex items-center gap-2">
                        <ReactionBadge text={message.content} />
                      </div>
                    ) : message.type === 'list_response' ? (
                      <span className="text-[#283855] text-sm">{message.content}</span>
                    ) : message.type === 'buttons_response' ? (
                      <span className="text-[#283855] text-sm">{message.content}</span>
                    ) : message.type === 'sticker' ? (
                      <span className="text-[#485b7f] text-xs">Sticker</span>
                    ) : findOlxImageUrlInText(message.content) ? (
                      <AnexoImageChat
                        src={findOlxImageUrlInText(message.content) as string}
                        data={message.createdAt}
                        idContainer="content-container"
                      />
                    ) : findOlxAudioUrlInText(message.content) ? (
                      <AnexoAudioChat src={findOlxAudioUrlInText(message.content) as string} />
                    ) : linkInfo.isLink ? (
                      <LinkMessageCard url={linkInfo.url} tone="light" />
                    ) : (
                      <div className="grow shrink basis-0 text-[#283855] text-sm font-normal leading-[18.20px] whitespace-pre-wrap break-words">
                        {formatMessageText(message.content)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            {message.reaction && (
              <div className="pl-2 pt-0.5">
                <ReactionBadge text={message.reaction} />
              </div>
            )}
          </div>
        </div>
        {chat?.channel === 'whatsapp' && onReplyToMessage && message.sender === 'CUSTOMER' && (
          <button
            onClick={() => onReplyToMessage(message)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-[#F2F4F7] rounded-full ml-2 self-center"
            title="Responder"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#657380]"
            >
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (message.sender === 'SYSTEM') {
    if (!hasText) return null;
    return (
      <div id={`message-${message.id}`} className="w-full flex justify-center">
        <p className="w-fit block text-center text-[#485b7f] text-xs font-semibold px-1.5 py-1 bg-[#ebeef2] rounded whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      id={`message-${message.id}`}
      className="lg:w-[26rem] justify-end items-start gap-3 inline-flex self-end animate-fade-in relative"
    >
      <div className="grow shrink basis-0 flex-col justify-start items-end gap-2 inline-flex">
        <div
          className={cn(
            'self-stretch justify-end items-center gap-[9px] inline-flex',
            header ? '' : 'hidden',
          )}
        >
          <div className="text-[#283855] text-sm font-semibold">{displayName}</div>
          <div className="text-[#7f8999] text-xs font-normal">
            {timeFormatted}{' '}
            {message.deliveryStatus && (
              <span
                title={
                  {
                    PENDING: 'Enviando',
                    SENT: 'Enviada',
                    DELIVERED: 'Entregue',
                    READ: 'Lida',
                    FAILED: 'Falha no envio',
                  }[message.deliveryStatus]
                }
                className={
                  message.deliveryStatus === 'FAILED'
                    ? 'text-red-600'
                    : message.deliveryStatus === 'READ'
                      ? 'text-primary'
                      : ''
                }
              >
                {message.deliveryStatus === 'FAILED'
                  ? '! Falha'
                  : message.deliveryStatus === 'PENDING'
                    ? '◷'
                    : message.deliveryStatus === 'SENT'
                      ? '✓'
                      : '✓✓'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          {hasAttachment && renderAttachment(message)}

          {(hasText || message.type === 'reaction') && !shouldHideTextBecauseAttachment && (
            <div className="message-content-loja self-stretch p-4 bg-[#34486e] rounded-tl-xl rounded-bl-xl rounded-br-xl justify-start items-center gap-2.5 inline-flex">
              <div className="w-full">
                {referencedMessage && (
                  <div
                    className="mb-3 p-2 bg-[#2a3f5f] border-l-4 border-[#ebeef2] rounded-lg cursor-pointer"
                    onClick={handleNavigateToOriginal}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigateToOriginal()}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#ebeef2]"
                      >
                        <path
                          d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="text-xs font-medium text-[#ebeef2]">
                        {referencedMessage.person?.name || 'Usuário'}
                      </span>
                      <span className="text-xs text-[#7f8999] ml-auto">↗</span>
                    </div>
                    <div className="text-xs text-[#d7deea] truncate max-w-full">
                      {referencedMessage.attachmentUrl ? (
                        <span className="italic">📎 Anexo</span>
                      ) : referencedMessage.content && referencedMessage.content.length > 40 ? (
                        `${referencedMessage.content.substring(0, 40)}...`
                      ) : (
                        referencedMessage.content || 'Mensagem sem conteúdo'
                      )}
                    </div>
                  </div>
                )}

                {isPix ? (
                  <PixMessageCard code={message.content} tone="dark" />
                ) : callInfo.isCall ? (
                  <CallMessageCard info={callInfo} tone="dark" />
                ) : locationInfo.isLocation ? (
                  <LocationMessageCard info={locationInfo} tone="dark" />
                ) : contactInfo.isContact ? (
                  <ContactMessageCard
                    info={contactInfo}
                    tone="dark"
                    onOpenNovoChat={onOpenNovoChat}
                    atendimentoId={atendimentoId ?? null}
                  />
                ) : message.type === 'reaction' ? (
                  <div className="flex items-center justify-end gap-2">
                    <ReactionBadge text={message.content} />
                  </div>
                ) : message.type === 'list_response' ? (
                  <span className="text-white text-sm">{message.content}</span>
                ) : message.type === 'buttons_response' ? (
                  <span className="text-white text-sm">{message.content}</span>
                ) : message.type === 'sticker' ? (
                  <span className="text-blue-100 text-xs">Sticker</span>
                ) : findOlxImageUrlInText(message.content) ? (
                  <AnexoImageChat
                    src={findOlxImageUrlInText(message.content) as string}
                    data={message.createdAt}
                    idContainer="content-container"
                  />
                ) : findOlxAudioUrlInText(message.content) ? (
                  <AnexoAudioChat src={findOlxAudioUrlInText(message.content) as string} />
                ) : linkInfo.isLink ? (
                  <LinkMessageCard url={linkInfo.url} tone="dark" />
                ) : (
                  <div className="grow shrink basis-0 text-[#fdfdfd] text-sm font-normal whitespace-pre-wrap break-words">
                    {formatMessageText(message.content, 'text-blue-200')}
                  </div>
                )}
              </div>
            </div>
          )}
          {message.reaction && (
            <div className="pr-2 pt-0.5 self-end">
              <ReactionBadge text={message.reaction} />
            </div>
          )}
        </div>
      </div>

      <AvatarUser
        name={displayName}
        src={avatarSrc}
        size={3}
        className={header ? '' : 'opacity-0'}
      />

      {errorSending && (
        <div
          className="absolute bottom-4 -left-8 text-red-500"
          role="img"
          aria-label="Erro ao enviar mensagem"
          title="Erro ao enviar mensagem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
