'use client';
import { mergeChatMessage } from '@/services/chat-events';

import AvatarCanal from '@/components/commons/avatar-canal';
import IconEnviar from '@/components/icons/icon-enviar';
import PesquisarChat from '@/components/sections/chat/pesquisa-chat';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import SideModal from '@/components/commons/modais/side-modal';
import ConfirmationModal from '@/components/commons/modais/confirmation-modal';
import toast from 'react-hot-toast';
import IconX from '@/components/icons/icon-x';
import Link from 'next/link';
import NoData from '@/components/commons/estados/NoData';
import ActionChatButton from '@/components/sections/chat/action-chat-button';
import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';
import ChipFilter from '@/components/sections/chat/chip-filter';
import ChatHeader from './components/ChatHeader';
import CenterModal from '@/components/commons/modais/center-modal';
import { useEffect, useRef, useState } from 'react';
import { ButtonFilter } from '@/components/sections/chat/button-filter';
import { ChatFiltersPopover } from '@/components/sections/chat/ChatFiltersPopover';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessagesContainer } from '@/components/sections/chat/MessagesContainer';
import { cn } from '@/lib/class-name.utils';
import { ConteudoNovoAtendimento } from '@/components/sections/deals/conteudo-novo-atendimento';
import { InstagramWindowExpiredWarning } from '@/components/sections/chat/InstagramWindowExpiredWarning';
import { profileImageUrl } from '@/lib/profile.utils';
import { AppServices } from '@/services/app.services';
import { CardAtendimentoModal } from '@/components/sections/chat/card-atendimento-modal';
import { dealStatusNames } from '@/lib/deal-name';
import { DealStatus } from '@/types/deal-status';
import { getFileTypeByMimeType } from '@/lib/files.utils';
import {
  AnexoAudio,
  AnexoDocumento,
  AnexoImage,
  AnexoVideo,
} from '@/components/sections/chat/attachments';
import { GravadorMp3 } from '@/components/sections/chat/gravador-mp3';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';
import { GravadorMp4 } from '@/components/sections/chat/gravador-mp4';
import { convertImageToJpeg } from '@/lib/convert-image.utils';
import { PreviewAudio } from '@/components/sections/chat/preview-audio';
import { ConteudoNovoChat } from '@/components/sections/chat/conteudo-novo-chat';
import { analyzeMessage } from '@/components/sections/chat/utils/messageParser';
import { EmployeeList } from '@/types/employee-list';
import { DateRange } from 'react-day-picker';
import { Chat } from '@/types/chat';
import { Message } from '@/types/message';
import { ChatItemSwipe } from '@/components/sections/chat/chat-item-swipe';
import { MensagensPadraoDropdown } from '@/components/sections/chat/MensagensPadraoDropdown';
import { useChatSocket } from '@/contexts/RealtimeContext';
import { useAppAuth } from '@/contexts/auth-app-context';
import type { ChatEvent } from '@/services/socket.client';
import { LeadDossierPanel } from '@/components/sections/chat/copilot/LeadDossierPanel';
import { StorePermission } from '@/types/permissions';
import { Button } from '@/components/ui/button';

const QTND_MAX_MESSAGES = 10;
const QTD_MAX_SIZE_ATTACHMENT = 5 * 1024 * 1024;

const EmojiPickerDynamic = dynamic(() => import('@emoji-mart/react'), { ssr: false }) as any;

type FilterKeySnapshot = {
  search: string;
  myChats: boolean;
  channelSelected?: string | null;
  channelStatus?: string | null;
  sortOrder: 'recent' | 'previous';
  dateStart?: string | null;
  dateEnd?: string | null;
  collaborator?: string | null;
};

export default function ChatPage() {
  const router = useRouter();
  const socket = useChatSocket();
  const auth = useAppAuth();
  const storeId = auth.getUser()?.storeId;
  const [canReply, setCanReply] = useState(false);
  useEffect(() => {
    let active = true;
    void auth.fetchPermissions().then((access) => {
      if (active) setCanReply(!!access?.permissions.includes(StorePermission.STORE_REPLY_CHAT));
    });
    return () => {
      active = false;
    };
  }, [auth]);

  const searchParams = useSearchParams();
  const initialChatId = searchParams.get('id');
  const apiApp = new AppServices();

  const containerMessagensref = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [isNewServiceOpen, setIsNewServiceOpen] = useState<boolean>(false);
  const [showConfirmNewService, setShowConfirmNewService] = useState<boolean>(false);
  const [openNewChat, setOpenNewChat] = useState<boolean>(false);

  const [newChatPrefill, setNewChatPrefill] = useState<{
    name?: string;
    whatsapp?: string;
    atendimentoId?: string | null;
  } | null>(null);
  const [enableListChat, setEnableListChat] = useState(true);

  const [myChats, setMyChats] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const [chatsRender, setChatsRender] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(initialChatId);
  const selectedChatRef = useRef(selectedChat);
  selectedChatRef.current = selectedChat;
  const [selectedChatData, setSelectedChatData] = useState<Chat | null>(null);
  const [message, setMessage] = useState<string>('');
  const chatsCacheRef = useRef<Map<string, Chat[]>>(new Map());
  const currentFilterKeyRef = useRef<string>('');

  type ChatDraft = { text: string; attachment: { src: string; mimetype: string } | null };

  const draftsRef = useRef<Map<string, ChatDraft>>(new Map());
  const [messages, setMessages] = useState<
    Map<string, { messages: Message[]; page: number; end: boolean }>
  >(new Map());
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [loadingSearchMessages, setLoadingSearchMessages] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [filters, setFilters] = useState({ search: '' });
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [searchMessage, setSearchMessage] = useState<string>('');
  const [debouncedSearchMessage, setDebouncedSearchMessage] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [modalAtendimentoChat, setModalAtendimentoChat] = useState<string | null>(null);
  const [attachmentToSend, setAttachmentToSend] = useState<{
    src: string;
    mimetype: string;
  } | null>(null);
  const [loadingAttachment, setLoadingAttachment] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const prevInputValueRef = useRef<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMensagensPadrao, setShowMensagensPadrao] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const searchFocusRef = useRef<boolean>(false);

  const [channelSelected, setChannelSelected] = useState<string | undefined>(undefined);
  const [channelStatus, setChannelStatus] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'recent' | 'previous'>('recent');
  const [dateStart, setDateStart] = useState<string | undefined>(undefined);
  const [dateEnd, setDateEnd] = useState<string | undefined>(undefined);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>(undefined);
  const chipsChannelFilter = [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'olx', label: 'OLX' },
  ];
  const [collaborators, setCollaborators] = useState<
    { id: string; name: string; userId: string }[]
  >([]);
  const [selectedCollaboratorIdUsuario, setSelectedCollaboratorIdUsuario] = useState<
    string | undefined
  >(undefined);

  const createFilterKey = (overrides: Partial<FilterKeySnapshot> = {}) => {
    const snapshot: FilterKeySnapshot = {
      search: overrides.search ?? debouncedSearch ?? '',
      myChats: overrides.myChats ?? myChats,
      channelSelected: overrides.channelSelected ?? channelSelected ?? null,
      channelStatus: overrides.channelStatus ?? channelStatus ?? null,
      sortOrder: overrides.sortOrder ?? sortOrder,
      dateStart: overrides.dateStart ?? dateStart ?? null,
      dateEnd: overrides.dateEnd ?? dateEnd ?? null,
      collaborator: overrides.collaborator ?? selectedCollaboratorIdUsuario ?? null,
    };
    return JSON.stringify(snapshot);
  };

  const applyRenderSlice = (source: Chat[]) => {
    const baseSlice = source.slice(0, 200) as Chat[];
    if (!selectedCollaboratorIdUsuario) return baseSlice;
    return baseSlice.filter((chat) =>
      chat.deal?.dealAssignee?.some((obj) => obj.employee.userId === selectedCollaboratorIdUsuario),
    );
  };

  function parseYMDToLocalDate(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  useEffect(() => {
    searchForCollaborator();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (modalAtendimentoChat || isNewServiceOpen || openNewChat || showConfirmNewService) return;
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        return;
      }
      if (selectedChat) {
        try {
          const basePath =
            typeof window !== 'undefined' ? window.location.pathname : '/app/deals/chat';
          router.replace(basePath);
        } catch {
          router.replace('/app/deals/chat');
        }
        setSelectedChat(null);
      }
      setEnableListChat(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    enableListChat,
    modalAtendimentoChat,
    isNewServiceOpen,
    openNewChat,
    showConfirmNewService,
    selectedChat,
    router,
    showEmojiPicker,
  ]);

  function getAcceptValue() {
    if (!selectedChat) return '';
    const chat = findChatId(selectedChat ?? '-1');
    if (!chat) return '';
    if (chat.channel === 'instagram') return 'image/*,audio/aac,audio/mp4,audio/x-m4a,audio/wav';

    return 'image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,video/*';
  }

  const handleEnviarAnexo = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const isMimeAllowedForChannel = (mime: string, channel: Chat['channel']): boolean => {
    if (channel === 'instagram') {
      if (!mime) return false;
      if (mime.startsWith('image/')) return true;
      if (mime.startsWith('audio/')) return true;
      return false;
    }
    if (channel === 'olx') {
      return false;
    }
    if (!mime) return false;
    if (mime.startsWith('image/')) return true;
    if (mime.startsWith('audio/')) return true;
    if (mime.startsWith('video/')) return true;
    if (mime === 'application/pdf') return true;
    if (mime === 'application/msword') return true;
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return true;
    if (mime === 'application/vnd.ms-excel') return true;
    if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return true;
    return false;
  };

  const processFileUpload = async (file: File) => {
    if (!selectedChat) return;
    const chat = findChatId(selectedChat);
    if (!chat) return;

    if (file.size > QTD_MAX_SIZE_ATTACHMENT) {
      toast.error('Arquivo muito grande. O limite é de 5 MB.');
      return;
    }

    if (!isMimeAllowedForChannel(file.type, chat.channel)) {
      toast.error('Este tipo de arquivo não é permitido para este canal.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const fileToSend = isImage ? await convertImageToJpeg(file) : file;

    try {
      setLoadingAttachment(true);
      const [data, error] = await apiApp.chat.generateAttachment(selectedChat as any, fileToSend);

      if (error || !data) {
        toast.error('Falha ao enviar o arquivo');
        return;
      }

      setMessage('');
      setAttachmentToSend(data);
      const map = draftsRef.current;
      const existing = map.get(selectedChat) || { text: '', attachment: null };
      map.set(selectedChat, { ...existing, attachment: data });
    } catch (err) {
      toast.error('Falha ao enviar o arquivo');
    } finally {
      setLoadingAttachment(false);
      if (inputFileRef.current) inputFileRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > QTD_MAX_SIZE_ATTACHMENT) {
      toast.error('Arquivo muito grande. O limite é de 5 MB.');
      return;
    }

    await processFileUpload(file);
    event.target.value = '';
  };

  function updateFilter(value: any, name: string) {
    setFilters((old: any) => {
      return {
        ...old,
        [name]: value,
      };
    });
  }

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const addMessages = (
    key: string,
    newMessage: Message[],
    page: number,
    end?: boolean,
    insercaoReversa?: boolean,
  ) => {
    setMessages((prevMessages) => {
      const newMap = new Map(prevMessages);

      let existingMessages = newMap.get(key);
      if (existingMessages) {
        const refreshedById = new Map(newMessage.map((item) => [item.id, item]));
        existingMessages = {
          ...existingMessages,
          messages: existingMessages.messages.map((item) =>
            refreshedById.has(item.id) ? { ...item, ...refreshedById.get(item.id) } : item,
          ),
        };
        const mensagensNovas = newMessage.filter(
          (obj) => !existingMessages?.messages.some((obj2) => obj2.id === obj.id),
        );

        if (mensagensNovas.length > 0 && !insercaoReversa && page === 1) {
          const latestNewMessage = mensagensNovas.reduce((latest, msg) => {
            return new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest;
          });

          if (latestNewMessage.id) {
            updateChatList(key, latestNewMessage);
          }
        }

        existingMessages = {
          ...existingMessages,
          page: page ?? existingMessages.page,
          end: end ?? existingMessages.end,
          messages: !insercaoReversa
            ? [...mensagensNovas, ...existingMessages.messages]
            : [...existingMessages.messages, ...mensagensNovas],
        };
        newMap.set(key, existingMessages);
      } else {
        newMap.set(key, { page, messages: newMessage, end: false });
        if (newMessage.length > 0 && page === 1) {
          const latestMessage = newMessage.reduce((latest, msg) => {
            return new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest;
          });
          if (latestMessage.id) {
            updateChatList(key, latestMessage);
          }
        }
      }

      return newMap;
    });
  };

  const fetchChats = async (search?: string, onlyMine?: boolean, filterKey?: string) => {
    const effectiveKey =
      filterKey ??
      createFilterKey({
        search: search ?? debouncedSearch ?? '',
        myChats: onlyMine ?? myChats,
      });

    const [response, error] = await apiApp.chat.listChats({
      search: search ?? debouncedSearch,
      page: 1,
      limit: 10000,
      ownChats: onlyMine ?? myChats,
      channel: channelSelected,
      statusChat: channelStatus,
      sorting: sortOrder,
      dataStart: dateStart,
      dataEnd: dateEnd,
      idUserAssignee: selectedCollaboratorIdUsuario,
    });

    if (error || !response) {
      if (currentFilterKeyRef.current === effectiveKey) {
        setLoadingChats(false);
      }
      return;
    }

    const baseChats = ((response.chats || []) as unknown as Chat[]).slice();

    const term = (search ?? debouncedSearch)?.trim();
    const messageChatsRaw =
      term && (response as any)?.messages?.chats
        ? ((response as any).messages.chats as Chat[])
        : [];

    const byId = new Map<string, any>();
    for (const c of baseChats) byId.set(c.id, { ...c });
    for (const mc of messageChatsRaw) {
      const existing = byId.get(mc.id);
      if (existing) {
        const mensagemEncontrada = (mc as any).mensagemEncontrada;
        const mergedMensagens =
          Array.isArray(existing.message) && existing.message.length > 0
            ? existing.message
            : Array.isArray(mc.message)
              ? mc.message
              : [];
        byId.set(mc.id, { ...existing, message: mergedMensagens, mensagemEncontrada });
      } else {
        byId.set(mc.id, { ...mc });
      }
    }

    const mergedChats = Array.from(byId.values()) as Chat[];

    chatsCacheRef.current.set(effectiveKey, mergedChats);

    if (currentFilterKeyRef.current !== effectiveKey) {
      return;
    }

    setLoadingChats(false);

    setChats(mergedChats);
    setChatsRender(applyRenderSlice(mergedChats));
  };

  const handleArchiveChat = async (id: string) => {
    const [, error] = await apiApp.chat.archive(id);
    if (error) {
      toast.error(error.message || 'Erro ao arquivar conversa');
      return;
    }
    toast.success('Conversa arquivada');
    await fetchChats(undefined, undefined, currentFilterKeyRef.current);
  };

  const handleUnarchiveChat = async (id: string) => {
    const [, error] = await apiApp.chat.unarchive(id);
    if (error) {
      toast.error(error.message || 'Erro ao desarquivar conversa');
      return;
    }
    toast.success('Conversa desarquivada');
    await fetchChats(undefined, undefined, currentFilterKeyRef.current);
  };

  const fetchMessages = async (chatId: string, morePages?: boolean, scroll?: Function) => {
    const currentChat = messages.get(chatId);
    let page = 1;
    if (morePages) {
      page = currentChat ? currentChat.page + 1 : 1;
      scrollTop();
    }

    const [response, error] = await apiApp.chat.listMessagesChat(chatId, {
      search: debouncedSearchMessage,
      limit: QTND_MAX_MESSAGES,
      page: page,
    });

    if (error || !response) {
      setLoadingSearchMessages(false);
      setLoadingMessages(false);
      toast.error(error?.message || 'Não foi possível carregar as mensagens.');

      return;
    }

    setLoadingSearchMessages(false);

    addMessages(
      chatId,
      response.messages,
      morePages ? (currentChat?.page ? currentChat.page + 1 : 1) : 1,
      false,
      true,
    );
    setLoadingMessages(false);

    if (morePages) scrollTop();

    if (scroll) {
      scroll();
    }
  };

  const calcLastMessage = () => {
    const mensagensChat = messages.get(selectedChat ?? '-1');
    if (!mensagensChat) return '';
    const lastMessage =
      mensagensChat.messages.length > 0
        ? `Última mensagem ${formatDistanceToNow(new Date(mensagensChat.messages[mensagensChat.messages.length - 1].createdAt), { locale: ptBR, addSuffix: true })}`
        : ' ';
    return lastMessage;
  };

  const handleKeyEnterDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    if (containerMessagensref.current) {
      containerMessagensref.current.scrollTop = containerMessagensref.current.scrollHeight;
    }
  };

  const handleReplyToMessage = (message: Message) => {
    if (!selectedChat) return;
    const chat = findChatId(selectedChat);
    if (chat?.channel === 'whatsapp') {
      setReplyingTo(message);
      messageInputRef.current?.focus();
    }
  };

  const handleReactToMessage = async (message: Message, reaction: string) => {
    if (!selectedChat) return;
    const chat = findChatId(selectedChat);
    if (!chat || chat.channel !== 'instagram') return;

    try {
      const data = {
        recipient: chat.externalRecipientId,
        channel: chat.channel,
        quotedMessageId: message.externalMessageId || message.id,
        message: reaction,
        type: 'reaction',
      };

      await apiApp.chat.sendMessageChat(selectedChat as any, data);
      toast.success('Reação enviada!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar reação');
    }
  };

  const scrollTop = () => {
    if (containerMessagensref.current) {
      containerMessagensref.current.scrollTop = 0;
    }
  };

  const insertEmojiAtCursor = (emoji: string) => {
    const textarea = messageInputRef.current;
    if (!textarea) {
      const newValue = (message || '') + emoji;
      setMessage(newValue);
      if (selectedChat) {
        const map = draftsRef.current;
        const existing = map.get(selectedChat) || { text: '', attachment: null };
        map.set(selectedChat, { ...existing, text: newValue });
      }
      prevInputValueRef.current = newValue;
      return;
    }
    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;
    const before = message.slice(0, start);
    const after = message.slice(end);
    const newValue = before + emoji + after;
    setMessage(newValue);
    if (selectedChat) {
      const map = draftsRef.current;
      const existing = map.get(selectedChat) || { text: '', attachment: null };
      map.set(selectedChat, { ...existing, text: newValue });
    }
    prevInputValueRef.current = newValue;
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + emoji.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  function autoCompleteMathExpression(input: string): string {
    try {
      const lastNewline = Math.max(input.lastIndexOf('\n'), input.lastIndexOf('\r'));
      const tail = input.slice(lastNewline + 1);
      const match = tail.match(/(.+)=\s*$/);
      if (!match) return input;

      let expr = match[1] || '';

      expr = expr.replace(/×/g, '*').replace(/[xX]/g, '*');

      expr = expr.replace(/(\d+(?:[.,]\d+)?)\s*[kK]\b/g, (_, num) => {
        const n = parseFloat(String(num).replace(/\./g, '').replace(/,/g, '.'));
        if (!isFinite(n)) return _ as string;
        return String(n * 1000);
      });

      expr = expr.replace(/\b(\d{1,3}(?:\.\d{3})+(?:,\d+)?)\b/g, (m) => {
        return m.replace(/\./g, '').replace(/,/g, '.');
      });

      expr = expr.replace(/,/g, '.');
      expr = expr.replace(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g, (_m, a, b) =>
        `(($${''}{a}/100)*($${''}{b}))`.replace('$' + '{a}', a).replace('$' + '{b}', b),
      );
      expr = expr.replace(/(\d+(?:\.\d+)?)\s*%\b/g, (_m, a) =>
        `(($${''}{a}/100))`.replace('$' + '{a}', a),
      );
      expr = expr.replace(/\s+/g, ' ').trim();

      if (!/^[0-9+\-*/().\s]+$/.test(expr)) return input;

      const result = new Function('return (' + expr + ')')();
      if (typeof result !== 'number' || !isFinite(result)) return input;

      const resultStr = Number.isInteger(result)
        ? String(result)
        : String(parseFloat(result.toFixed(6)));

      const prefix = input.slice(0, lastNewline + 1);
      const updatedTail = tail.replace(/=\s*$/, `= ${resultStr}`);
      return prefix + updatedTail;
    } catch {
      return input;
    }
  }

  const handleSelectMessage = async (newChatId: string) => {
    setEnableListChat(false);
    router.replace(`?id=${newChatId}`);
    setSelectedChat(newChatId);

    const chat = chats.find((c) => c.id === newChatId);
    if (chat) {
      setSelectedChatData(chat);
    }

    if (chat && getUnreadCount(chat) > 0) {
      try {
        const [result, error] = await apiApp.chat.markChatRead(newChatId);

        if (!error && result) {
          const updateChatMessages = (chatList: Chat[]) =>
            chatList.map((c) =>
              c.id === newChatId
                ? {
                    ...c,
                    message: c.message.map((msg) => ({ ...msg, isRead: true })),
                  }
                : c,
            );

          setChats(updateChatMessages);
          setChatsRender(updateChatMessages);
        }
      } catch (error) {
        console.error('Erro ao marcar chat como lido:', error);
      }
    }
  };

  const userData = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const findChatId = (id: string): Chat | undefined => {
    return (
      chats.find((obj) => obj.id === id) ||
      (selectedChatData?.id === id ? selectedChatData : undefined)
    );
  };

  const getUnreadCount = (chat: Chat) => {
    if (chat.message.length > 0) {
      return chat.message.filter((msg) => !msg.isRead && msg.sender === 'CUSTOMER').length;
    }
    return 0;
  };

  const isInstagramWindowExpired = (chat: Chat | undefined): boolean => {
    if (!chat || chat.channel !== 'instagram') return false;
    if (!chat.lastMessageCustomerAt) return true;

    const lastMessage = new Date(chat.lastMessageCustomerAt);
    const agora = new Date();
    const diferencaHoras = (agora.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);

    return diferencaHoras > 24;
  };

  const getLastMessageDate = (chat: Chat): Date => {
    try {
      if (chat.message && chat.message.length > 0) {
        const latest = chat.message.reduce<string>((latestDate, msg) => {
          return new Date(msg.createdAt) > new Date(latestDate) ? msg.createdAt : latestDate;
        }, chat.message[0].createdAt);
        return new Date(latest);
      }
      return new Date(chat.updatedAt || chat.createdAt);
    } catch {
      return new Date(0);
    }
  };

  const formatChatDate = (date: Date): string => {
    try {
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: ptBR });
      }

      if (isYesterday(date)) {
        return 'Ontem';
      }

      if (isThisWeek(date)) {
        return format(date, 'EEEE', { locale: ptBR });
      }

      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const updateChatList = (chatId: string, newMessage: Message) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            updatedAt: newMessage.createdAt,
            message: [newMessage, ...chat.message.slice(1)],
          };
          return updatedChat;
        }
        return chat;
      });

      const sortedChats = updatedChats.sort(
        (a, b) => getLastMessageDate(b).getTime() - getLastMessageDate(a).getTime(),
      );

      return sortedChats;
    });

    setChatsRender((prevChatsRender) => {
      const updatedRender = prevChatsRender.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            updatedAt: newMessage.createdAt,
            message: [newMessage, ...chat.message.slice(1)],
          };
        }
        return chat;
      });

      const sortedRender = updatedRender.sort(
        (a, b) => getLastMessageDate(b).getTime() - getLastMessageDate(a).getTime(),
      );

      return sortedRender;
    });
  };

  const handleSendMessage = async () => {
    if (!canReply) {
      toast.error('Você não tem permissão para responder a conversas.');
      return;
    }
    if (message === '' && !attachmentToSend) return;
    if (!selectedChat) return;
    const chat = findChatId(selectedChat);
    if (!chat) return;

    if (chat.channel === 'instagram' && message.length > 1000) {
      toast.error('Mensagem muito longa. Instagram permite até 1000 caracteres.');
      return;
    }

    const currentChat = selectedChat;
    const currentMap = messages.get(currentChat);
    if (!currentMap) return;

    const fakeId = `temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const newMessageItem: Message = {
      content: message,
      createdAt: new Date().toISOString(),
      id: fakeId,
      chatId: selectedChat,
      externalRecipientId: chat.externalRecipientId,
      attachmentType: attachmentToSend?.mimetype || null,
      sender: 'STORE',
      deliveryStatus: 'PENDING',
      userId: userData()?.id ?? null,
      person: {
        name: userData()?.name,
        avatar: userData() ? profileImageUrl(userData().id) : undefined,
      },
      attachmentUrl: attachmentToSend?.src || null,
      channel: chat.channel,
      externalMessageId: '',
      isRead: true,
      ...(replyingTo
        ? {
            quotedMessageId: replyingTo.externalMessageId || replyingTo.id,
            originalMessage: {
              id: replyingTo.id,
              content: replyingTo.content,
              attachmentUrl: replyingTo.attachmentUrl,
              attachmentType: replyingTo.attachmentType,
              createdAt: replyingTo.createdAt,
              person: replyingTo.person,
            },
          }
        : {}),
    };

    addMessages(selectedChat as string, [newMessageItem], currentMap?.page, false);
    updateChatList(selectedChat as string, newMessageItem);

    setMessage('');
    setAttachmentToSend(null);
    setReplyingTo(null);
    if (selectedChat) {
      draftsRef.current.set(selectedChat, { text: '', attachment: null });
    }

    const quotedMessageId = replyingTo?.externalMessageId || '';

    const [response, error] = await apiApp.chat.sendMessageChat(selectedChat as any, {
      recipient: chat.externalRecipientId,
      message: message,
      attachmentUrl: attachmentToSend?.src || undefined,
      attachmentType: attachmentToSend?.mimetype || undefined,
      quotedMessageId,
      channel: chat.channel,
    });

    if (error || !response || !response.messageSent) {
      toast.error(error?.message || 'Não foi possível enviar a mensagem.');
      if (selectedChatRef.current === currentChat) {
        setMessage((previous) => previous || message);
        setAttachmentToSend((previous) => previous || attachmentToSend);
        setReplyingTo((previous) => previous || replyingTo);
      }
      draftsRef.current.set(currentChat, {
        text: draftsRef.current.get(currentChat)?.text || message,
        attachment: draftsRef.current.get(currentChat)?.attachment || attachmentToSend,
      });
      setMessages((previous) => {
        const next = new Map(previous);
        const entry = next.get(currentChat);
        if (entry)
          next.set(currentChat, {
            ...entry,
            messages: entry.messages.map((item) =>
              item.id === fakeId ? { ...item, deliveryStatus: 'FAILED' } : item,
            ),
          });
        return next;
      });
      return;
    }

    setMessages((previous) => {
      const next = new Map(previous);
      const entry = next.get(currentChat);
      if (entry)
        next.set(currentChat, {
          ...entry,
          messages: mergeChatMessage(
            entry.messages.filter((item) => item.id !== fakeId),
            response.messageSent,
          ),
        });
      return next;
    });
    void fetchMessages(currentChat, false);

    scrollToBottom();
  };

  const getSelectedChatName = (): string => {
    if (!selectedChat) return '-';
    const chat = findChatId(selectedChat);
    if (!chat) return '';
    if (chat) {
      if (chat.customer) {
        return chat.customer.name ?? '';
      }
      if (chat.temporaryCustomer) {
        return chat.temporaryCustomer.name ?? '';
      }
    }
    return 'Unknow';
  };

  const getSelectedChatAvatar = (): string => {
    if (!selectedChat) return '';
    const chat = findChatId(selectedChat);

    if (!chat) return '';

    if (chat) {
      if (chat.customer) {
        return chat.customer.avatarUrl?.trim() ?? '';
      }
      if (chat.temporaryCustomer) {
        return chat.temporaryCustomer.avatar?.trim() ?? '';
      }
    }
    return '';
  };

  const getInitialData = () => {
    if (!selectedChat) return;
    const chat = findChatId(selectedChat);
    if (!chat) return;

    return {
      chatId: chat.id,
      dealOrigin: chat.channel,
      name: chat.customer?.name ?? chat.temporaryCustomer?.name ?? '',
      email: chat.customer?.email ?? chat.temporaryCustomer?.email ?? '',
      phone: chat.customer?.whatsapp ?? chat.temporaryCustomer?.whatsapp ?? '',
      avatar: chat.customer?.avatarUrl ?? chat.temporaryCustomer?.avatar ?? '',
    };
  };

  const closeNewService = () => {
    setIsNewServiceOpen(false);
    setOpenNewChat(false);
  };

  const requestCloseNewService = () => {
    setShowConfirmNewService(true);
  };

  const confirmCloseNewService = () => {
    setShowConfirmNewService(false);
    closeNewService();
  };

  const cancelCloseNewService = () => {
    setShowConfirmNewService(false);
  };

  const closeNewChat = () => {
    setIsNewServiceOpen(false);
    setOpenNewChat(false);
  };

  const onNewChatCreated = async (chatId: string) => {
    await fetchChats(undefined, undefined, currentFilterKeyRef.current);
    handleSelectMessage(chatId.toString());
    setOpenNewChat(false);
  };

  const getServiceStatus = () => {
    if (!selectedChat) return 'Atendimento';
    const statusKey =
      (findChatId(selectedChat)?.deal?.status as DealStatus) ?? DealStatus.DEAL_INITIAL;
    return dealStatusNames[statusKey];
  };

  const getOrigin = () => {
    if (!selectedChat) return <></>;
    const chat = findChatId(selectedChat);
    if (!chat) return <></>;
    if (chat.channel !== 'olx' || !chat.externalAdId) return <></>;
    return (
      <Button variant="link" asChild className="text-[#485B80]">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`https://mg.olx.com.br/a-${chat.externalAdId}`}
          title="Ver anúncio de origem"
        >
          <span>Ver anúncio</span>
        </Link>
      </Button>
    );
  };

  const onRecordStart = () => {
    setRecording(true);
  };

  const onRecordStop = () => {
    setRecording(false);
  };

  const renderAttachmentPreview = (attachment: { src: string; mimetype: string }) => {
    const type = getFileTypeByMimeType(attachment.mimetype);

    switch (type) {
      case 'image':
        return <AnexoImage src={attachment.src} idContainer="content-container" />;
      case 'audio':
        return <AnexoAudio src={attachment.src} />;
      case 'video':
        return <AnexoVideo src={attachment.src} />;
      default:
        return <AnexoDocumento src={attachment.src} />;
    }
  };

  // Escapa caracteres especiais para RegExp
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderPreviewText = (text: string, term?: string) => {
    if (!text) return 'Conversa vazia';
    const { callInfo, linkInfo } = analyzeMessage(text);

    if (callInfo?.isCall) {
      const label = callInfo.isVideo ? 'Chamada de vídeo' : 'Chamada de voz';
      const status = callInfo.missed
        ? ' • Perdida'
        : callInfo.ended
          ? ' • Encerrada'
          : callInfo.accepted
            ? ' • Atendida'
            : '';
      return (
        <span className="inline-flex items-center gap-1 text-[#485B80]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {callInfo.isVideo ? (
              <path d="M17 10.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4Z" />
            ) : (
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h3.49a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.24 1.01Z" />
            )}
          </svg>
          <span>
            {label}
            {status}
            {callInfo.duration ? ` • ${callInfo.duration}` : ''}
          </span>
        </span>
      );
    }

    if (linkInfo?.isLink && linkInfo.url) {
      const display = (() => {
        try {
          const u = new URL(
            linkInfo.url.startsWith('http') ? linkInfo.url : `https://${linkInfo.url}`,
          );
          return u.host + (u.pathname !== '/' ? u.pathname : '');
        } catch {
          return linkInfo.url.length > 40 ? linkInfo.url.slice(0, 40) + '…' : linkInfo.url;
        }
      })();
      return (
        <span className="inline-flex items-center gap-1 text-[#485B80]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 0 0 0 6h3v2h-3a5 5 0 0 1-5-5Zm7.1 1h2v-2h-2v2Zm4-6h-3v2h3a3 3 0 0 1 0 6h-3v2h3a5 5 0 0 0 0-10Z" />
          </svg>
          <span>{display}</span>
        </span>
      );
    }

    if (/```[\s\S]*?```/.test(text)) {
      return (
        <span className="inline-flex items-center gap-1 text-[#485B80]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6zM4 6h2v12H4z" />
          </svg>
          <span>Bloco de código</span>
        </span>
      );
    }

    const nodes: any[] = [];
    let cursor = 0;
    const re = /(`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const idx = match.index;
      if (idx > cursor) nodes.push(text.slice(cursor, idx));
      const token = match[0];
      const wrapper = token[0];
      const content = token.slice(1, -1);
      if (wrapper === '`') {
        nodes.push(
          <code
            key={`c-${idx}`}
            className="bg-[#e2e6ec] text-[#283855] text-[11px] rounded px-1 py-0.5"
          >
            {content}
          </code>,
        );
      } else if (wrapper === '*') {
        nodes.push(<strong key={`b-${idx}`}>{content}</strong>);
      } else if (wrapper === '_') {
        nodes.push(<em key={`i-${idx}`}>{content}</em>);
      } else if (wrapper === '~') {
        nodes.push(
          <span key={`s-${idx}`} style={{ textDecoration: 'line-through' }}>
            {content}
          </span>,
        );
      }
      cursor = idx + token.length;
    }
    if (cursor < text.length) nodes.push(text.slice(cursor));

    if (term && term.trim().length > 0) {
      const rx = new RegExp(escapeRegExp(term), 'ig');
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (typeof n === 'string') {
          const parts = n.split(rx);
          const matches = n.match(rx);
          if (!matches) continue;
          const interleaved: any[] = [];
          parts.forEach((p, idx) => {
            interleaved.push(p);
            if (idx < matches.length) {
              interleaved.push(
                <mark
                  key={`h-${i}-${idx}`}
                  className="px-[1px] rounded bg-[#FFE082] text-[#1B263A]"
                >
                  {matches[idx]}
                </mark>,
              );
            }
          });
          nodes[i] = <span key={`s-${i}`}>{interleaved}</span>;
        }
      }
    }

    return nodes;
  };

  const NewService = () => {
    return (
      <>
        {(!findChatId(selectedChat ?? '')?.dealId ||
          findChatId(selectedChat ?? '')?.deal?.status === DealStatus.LOST) && (
          <button
            onClick={() => setIsNewServiceOpen(true)}
            className="flex items-center p-[10px] pr-[40px] flex-grow justify-between hover:bg-[hsl(var(--secondary))] duration-300 ease-in-out bg-white group outline-none font-semibold relative text-[14px] gap-2 rounded-lg"
          >
            <b className="font-semibold text-[#1B263A] group-hover:text-white translate-y-[1px] duration-300 ease-in-out lg:group-hover:translate-x-7 text-nowrap">
              Iniciar atendimento
            </b>
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              className="group-hover:lg:translate-x-[-140px] absolute duration-300 ease-in-out right-[10px] "
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.99935 0.166626C7.35118 0.166626 5.74001 0.655367 4.3696 1.57105C2.99919 2.48672 1.93109 3.78821 1.30036 5.31093C0.669626 6.83365 0.504599 8.5092 0.826142 10.1257C1.14769 11.7422 1.94136 13.2271 3.1068 14.3925C4.27223 15.558 5.75709 16.3516 7.3736 16.6732C8.99011 16.9947 10.6657 16.8297 12.1884 16.199C13.7111 15.5682 15.0126 14.5001 15.9283 13.1297C16.8439 11.7593 17.3327 10.1481 17.3327 8.49996C17.3327 7.40561 17.1171 6.32198 16.6983 5.31093C16.2796 4.29988 15.6657 3.38122 14.8919 2.6074C14.1181 1.83358 13.1994 1.21975 12.1884 0.800963C11.1773 0.382174 10.0937 0.166626 8.99935 0.166626ZM7.33269 12.25V4.74996L12.3327 8.49996L7.33269 12.25Z"
                className="group-hover:fill-[#7B96CB] ease-in-out duration-500 fill-[#485B80]"
              />
            </svg>
          </button>
        )}
      </>
    );
  };

  const processNotification = async () => {
    if (!selectedChat) return;
    const dealId = findChatId(selectedChat)?.dealId;
    if (!dealId) return;

    const [data, error] = await apiApp.deal.listVisits(dealId);
    if (error || !data) return;
    if (data.length === 0) return;

    const visita = data[0];

    if (!visita.completed) {
      setNotification(
        `Visita agendada para ${new Date(visita.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${visita.hourStart}`,
      );
    }
  };

  const handleNavigateToMessage = async (messageId: string) => {
    if (!selectedChat) return;

    try {
      const [pageResponse, pageError] = await apiApp.chat.findPageMessage(messageId);

      if (pageError || !pageResponse) {
        toast.error('Não foi possível localizar a mensagem');
        return;
      }

      const { page, chatId } = pageResponse;

      if (chatId !== selectedChat) {
        handleSelectMessage(chatId);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const currentMessages = messages.get(selectedChat);
      const currentPage = currentMessages?.page || 1;

      if (page > currentPage) {
        for (let p = currentPage + 1; p <= page; p++) {
          await fetchMessages(selectedChat, true);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        messageElement.classList.add('message-highlight');

        setTimeout(() => {
          messageElement.classList.remove('message-highlight');
        }, 4000);
      } else {
        toast.error('Mensagem não encontrada na página atual');
      }
    } catch (error) {
      console.error('Erro ao navegar para mensagem:', error);
      toast.error('Erro ao localizar a mensagem');
    }
  };

  const renderNewChat = () => {
    if (!selectedChat) return <></>;
    const chat = findChatId(selectedChat);

    if (!chat) return <></>;
    if (chat.channel === 'whatsapp') return <></>;

    return (
      <button
        onClick={() => setOpenNewChat(true)}
        className="flex relative items-center gap-2 rounded-full p-1 h-full bg-white group duration-500 transition-all"
      >
        <AvatarCanal channel="whatsapp" size={2} />
      </button>
    );
  };

  useEffect(() => {
    setModalAtendimentoChat(null);
    setNotification(null);
    if (selectedChat) {
      const draft = draftsRef.current.get(selectedChat) || { text: '', attachment: null };
      setMessage(draft.text || '');
      setAttachmentToSend(draft.attachment || null);
    } else {
      setMessage('');
      setAttachmentToSend(null);
    }
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }

    if (selectedChat) {
      // Usa loader interno quando há termo de busca
      if (debouncedSearchMessage) {
        setLoadingSearchMessages(true);
      } else {
        setLoadingMessages(true);
      }
      fetchMessages(selectedChat, false, scrollToBottom);
      processNotification();
    }
  }, [selectedChat, debouncedSearchMessage]);

  useEffect(() => {
    const filterKey = createFilterKey();
    currentFilterKeyRef.current = filterKey;

    const cachedChats = chatsCacheRef.current.get(filterKey);
    if (cachedChats) {
      setChats(cachedChats);
      setChatsRender(applyRenderSlice(cachedChats));
      setLoadingChats(false);
    } else {
      setLoadingChats(true);
      setChats([]);
      setChatsRender([]);
    }

    fetchChats(debouncedSearch, myChats, filterKey);
  }, [
    debouncedSearch,
    myChats,
    channelSelected,
    channelStatus,
    sortOrder,
    dateStart,
    dateEnd,
    selectedCollaboratorIdUsuario,
  ]);

  useEffect(() => {
    if (!socket) return;
    const sync = () => {
      chatsCacheRef.current.clear();
      void fetchChats(debouncedSearch, myChats, currentFilterKeyRef.current);
      if (selectedChat) void fetchMessages(selectedChat, false);
    };
    const changed = (event: ChatEvent, statusOnly = false) => {
      if (event.storeId !== storeId) return;
      setMessages((previous) => {
        const current = previous.get(event.chatId);
        if (!current) return previous;
        const next = new Map(previous);
        next.set(event.chatId, {
          ...current,
          messages: mergeChatMessage(current.messages, event.message, statusOnly),
        });
        return next;
      });
      void fetchChats(debouncedSearch, myChats, currentFilterKeyRef.current);
    };
    const visibility = () => {
      if (document.visibilityState === 'visible') sync();
    };
    const statusChanged = (event: ChatEvent) => changed(event, true);
    socket.on('message:received', changed);
    socket.on('message:status', statusChanged);
    socket.on('connect', sync);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      socket.off('message:received', changed);
      socket.off('message:status', statusChanged);
      socket.off('connect', sync);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [
    socket,
    storeId,
    selectedChat,
    debouncedSearch,
    debouncedSearchMessage,
    myChats,
    channelSelected,
    channelStatus,
    sortOrder,
    dateStart,
    dateEnd,
  ]);

  useEffect(() => {
    if (!selectedChat) return;
    setLoadingSearchMessages(true);
    fetchMessages(selectedChat, false);
  }, [debouncedSearchMessage]);

  useEffect(() => {
    if (loadingChats) return;
    if (!currentFilterKeyRef.current) return;
    chatsCacheRef.current.set(currentFilterKeyRef.current, chats);
  }, [chats, loadingChats]);

  useEffect(() => {
    const h = setTimeout(() => {
      // Só atualiza se realmente mudou para evitar re-renders desnecessários
      if (debouncedSearchMessage !== searchMessage) {
        setDebouncedSearchMessage(searchMessage);
      }
    }, 400);
    return () => clearTimeout(h);
  }, [searchMessage, debouncedSearchMessage]);

  useEffect(() => {
    const chatId = searchParams.get('id');
    setSelectedChat(chatId);
    setEnableListChat(!chatId);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedChat) {
      setSelectedChatData(null);
      return;
    }

    const chatFromList = chats.find((chat) => chat.id === selectedChat);
    if (chatFromList) {
      setSelectedChatData((prev) => {
        if (!prev) return chatFromList;
        if (prev.id !== chatFromList.id) return chatFromList;
        if (prev.updatedAt !== chatFromList.updatedAt) return chatFromList;
        return prev;
      });
    }
  }, [selectedChat, chats]);

  useEffect(() => {
    setSearchMessage('');
    setDebouncedSearchMessage('');
    if (!searchFocusRef.current) {
      setIsSearchExpanded(false);
    }
  }, [selectedChat]);

  const searchForCollaborator = async () => {
    const response = await apiApp.reports.findEmployee();

    if (response) {
      const data = response as unknown as EmployeeList;
      setCollaborators(
        data.employees.map((item) => ({
          id: item.id || '',
          name: item.name || '',
          userId: item.userId || '',
        })),
      );
    }
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <main
      className={cn(
        'w-full h-full grid grid-cols-1 md:grid-cols-[20rem,1fr] grid-rows-1',
        modalAtendimentoChat ? 'md:md:grid-cols-[20rem,21rem,1fr]' : '',
      )}
    >
      <div
        className="hidden data-[open=true]:flex lg:pb-0 md:flex flex-col bg-[#DEE1E8] h-full min-h-0"
        data-open={enableListChat && !modalAtendimentoChat}
      >
        <div className="px-4 lg:pb-6 pt-6 md:px-6 flex flex-col gap-4">
          <div className="w-full flex items-center justify-between gap-2">
            <p className="font-semibold text-xl text-[#1B263A]">Caixa de entrada</p>
            <div className="flex items-center gap-1">
              <ChatFiltersPopover
                pendingDateRange={pendingDateRange}
                setPendingDateRange={setPendingDateRange}
                dateStart={dateStart}
                dateEnd={dateEnd}
                setDateStart={setDateStart}
                setDateEnd={setDateEnd}
                parseYMDToLocalDate={parseYMDToLocalDate}
                chipsChannelFilter={chipsChannelFilter}
                channelSelected={channelSelected}
                onToggleChannel={(id) =>
                  setChannelSelected((prev) => (prev === id ? undefined : id))
                }
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                collaborators={collaborators}
                selectedCollaboratorIdUsuario={selectedCollaboratorIdUsuario}
                onToggleCollaborator={(userId) =>
                  setSelectedCollaboratorIdUsuario((prev) => (prev === userId ? undefined : userId))
                }
              />
              <button
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-white border border-[#DDE6F2] text-[#485B80] hover:bg-[#F2F4F7] flex items-center justify-center"
                aria-label="Buscar"
              >
                <img src="/icons/search.svg" alt="Buscar" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isSearchOpen && (
            <PesquisarChat
              value={filters.search}
              onChange={(value) => {
                updateFilter(value, 'search');
              }}
            />
          )}

          <div className="flex gap-2 items-center overflow-x-auto pb-2 w-full flex-nowrap whitespace-nowrap scrollbar-mini">
            {[
              {
                label: 'Todos',
                active: !myChats && !channelStatus,
                onClick: () => {
                  setMyChats(false);
                  setChannelStatus(undefined);
                },
                total: chats.length,
              },
              {
                label: 'Atribuidos a mim',
                active: myChats,
                onClick: () => {
                  setMyChats(true);
                  setChannelStatus(undefined);
                },
                total: chats.length,
              },
              {
                label: 'Aguardando Resposta',
                active: channelStatus === 'awaiting_reply',
                onClick: () => {
                  setChannelStatus('awaiting_reply');
                  setMyChats(false);
                },
                total: chats.length,
              },
              {
                label: 'Em Aberto',
                active: channelStatus === 'at_open',
                onClick: () => {
                  setChannelStatus('at_open');
                  setMyChats(false);
                },
                total: chats.length,
              },
              {
                label: 'Finalizados',
                active: channelStatus === 'finalizados',
                onClick: () => {
                  setChannelStatus('finalizados');
                  setMyChats(false);
                },
                total: chats.length,
              },
              {
                label: 'Arquivados',
                active: channelStatus === 'arquivados',
                onClick: () => {
                  setChannelStatus('arquivados');
                  setMyChats(false);
                },
                total: chats.length,
              },
            ].map((btn) => (
              <ButtonFilter key={btn.label} {...btn} />
            ))}
          </div>

          {(dateStart || dateEnd) && (
            <div className="flex gap-2 items-center overflow-x-auto pb-2 w-full flex-nowrap whitespace-nowrap scrollbar-mini">
              <ChipFilter
                id="period"
                label={`${format(parseYMDToLocalDate(dateStart ?? dateEnd!), 'dd/MM/yyyy')} – ${format(parseYMDToLocalDate(dateEnd ?? dateStart!), 'dd/MM/yyyy')}`}
                active
                removable
                onRemove={() => {
                  setDateStart(undefined);
                  setDateEnd(undefined);
                }}
                className="data-[selected=true]:hover:bg-[#1B263A] data-[selected=true]:hover:border-[#1B263A]"
              />
            </div>
          )}
          <div className="hidden"></div>

          <div className="hidden"></div>

          <div className="hidden"></div>

          {channelSelected && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-[#485B80] font-medium">Canal:</span>
              <ChipFilter
                key={`selected-${channelSelected}`}
                id={channelSelected}
                label={
                  chipsChannelFilter.find((c) => c.id === channelSelected)?.label || channelSelected
                }
                active
                removable
                onRemove={() => setChannelSelected(undefined)}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-mini">
          <div className="pt-4 flex flex-col">
            {loadingChats && <LoadingGlobal />}
            {!loadingChats && chatsRender.length === 0 && <NoData />}
            {!loadingChats &&
              chatsRender.length > 0 &&
              chatsRender.map((chat) => (
                <ChatItemSwipe
                  key={chat.id}
                  chat={chat}
                  onArchive={handleArchiveChat}
                  onUnarchive={handleUnarchiveChat}
                  isArchivedList={channelStatus === 'arquivados'}
                  debouncedSearch={debouncedSearch}
                  selectedChat={selectedChat}
                  onSelectMessage={handleSelectMessage}
                  onNavigateToMessage={handleNavigateToMessage}
                  getUnreadCount={getUnreadCount}
                  formatChatDate={formatChatDate}
                  getLastMessageDate={getLastMessageDate}
                  renderPreviewText={renderPreviewText}
                />
              ))}
          </div>
        </div>
      </div>

      {modalAtendimentoChat && (
        <div className="bg-white relative max-h-full overflow-y-auto scrollbar-mini">
          <button
            onClick={() => setModalAtendimentoChat(null)}
            className="absolute top-3 right-4 z-10"
          >
            <IconX />
          </button>

          <CardAtendimentoModal dealId={`${modalAtendimentoChat}`} />
        </div>
      )}

      <div
        className="h-full  hidden data-[open=true]:flex md:flex flex-col relative"
        data-open={!enableListChat && !modalAtendimentoChat}
      >
        <ChatHeader
          selectedChat={selectedChat}
          loadingMessages={loadingMessages}
          enableListChat={enableListChat}
          modalAtendimentoChat={modalAtendimentoChat}
          searchMessage={searchMessage}
          isSearchExpanded={isSearchExpanded}
          isSearchFocused={isSearchFocused}
          searchFocusRef={searchFocusRef}
          onToggleListChat={() => setEnableListChat(!enableListChat)}
          onToggleSearch={() => setIsSearchExpanded(!isSearchExpanded)}
          onSearchChange={setSearchMessage}
          onFocusSearch={() => {
            setIsSearchFocused(true);
            searchFocusRef.current = true;
            setIsSearchExpanded(true);
          }}
          onBlurSearch={() => {
            setIsSearchFocused(false);
            searchFocusRef.current = false;
            if (!searchMessage) {
              setIsSearchExpanded(false);
            }
          }}
          onViewAtendimento={(id) => setModalAtendimentoChat(id)}
          onNavigateToAtendimento={navigateToDeal}
          findChatId={findChatId}
          getSelectedChatName={getSelectedChatName}
          getSelectedChatAvatar={getSelectedChatAvatar}
          calcLastMessage={calcLastMessage}
          getOrigin={getOrigin}
          getServiceStatus={getServiceStatus}
          profileImageUrl={profileImageUrl}
          renderNewChat={renderNewChat}
          NewService={NewService}
        />

        <div
          className={
            'flex-1 overflow-y-auto relative scrollbar-mini overflow-x-hidden scroll-smooth'
          }
          ref={containerMessagensref}
          id="message-container"
        >
          {loadingMessages && !debouncedSearchMessage && (
            <div className="h-full flex items-center justify-center">
              <LoadingGlobal />
            </div>
          )}
          {!loadingMessages && !selectedChat && (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center text-[#485B80] gap-2">
                <img
                  src="/images/logo_autopilot_dark.svg"
                  alt="AutoPilot"
                  className="w-24 opacity-70 bg-cover"
                />
                <span className="text-sm">Selecione uma conversa ou pesquise mensagens</span>
              </div>
            </div>
          )}
          {!loadingMessages && selectedChat && (
            <div className="lg:min-h-[40rem] p-2 lg:p-6 bg-[#F2F4F7]">
              <MessagesContainer
                chat={findChatId(selectedChat ?? '') as any}
                loading={loadingSearchMessages}
                search={searchMessage}
                messages={messages.get(selectedChat ?? '0')?.messages as any}
                onLoadMore={() => {
                  fetchMessages(selectedChat ?? '', true);
                }}
                end={messages.get(selectedChat ?? '0')?.end ?? false}
                onScroolOnTop={() => {
                  if (!containerMessagensref.current) return false;
                  return containerMessagensref.current.scrollTop === 0;
                }}
                onOpenNovoChat={(p) => {
                  setNewChatPrefill({
                    ...p,
                    atendimentoId:
                      p.atendimentoId !== undefined && p.atendimentoId !== null
                        ? String(p.atendimentoId)
                        : null,
                  });
                  setOpenNewChat(true);
                }}
                onNavigateToMessage={handleNavigateToMessage}
                onReplyToMessage={handleReplyToMessage}
                onReactToMessage={handleReactToMessage}
              />
            </div>
          )}
        </div>

        {selectedChat && (
          <div className="p-0 lg:p-4 px-6 pt-1">
            {notification && (
              <div className="pb-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DDE6F2] bg-white px-3 py-1.5 shadow-sm">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F2F4F7] text-[hsl(var(--secondary))]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM6 6H5a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V6H9v1a1 1 0 1 1-2 0V6Z" />
                    </svg>
                  </span>
                  <span className="text-[hsl(var(--secondary))] text-xs font-semibold leading-none">
                    {notification}
                  </span>
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="mb-3 p-3 bg-[#F8F9FA] border-l-4 border-[hsl(var(--primary))] rounded-r-md flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-[#657380] font-medium mb-1">
                    Respondendo a {replyingTo.person?.name || 'Cliente'}
                  </div>
                  <div className="text-sm text-[hsl(var(--secondary))] truncate">
                    {replyingTo.content || 'Mídia'}
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-3 p-1 hover:bg-[#E2E8F0] rounded-full transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            {findChatId(selectedChat ?? '')?.channel === 'instagram' && (
              <InstagramWindowExpiredWarning
                lastMessageCustomerAt={findChatId(selectedChat ?? '')?.lastMessageCustomerAt}
              />
            )}

            {selectedChat && (
              <LeadDossierPanel
                key={selectedChat}
                chatId={selectedChat}
                dealId={findChatId(selectedChat)?.dealId}
                replyDisabled={!canReply || isInstagramWindowExpired(findChatId(selectedChat))}
                onReply={(text) => {
                  setMessage(text);
                  messageInputRef.current?.focus();
                }}
              />
            )}
            <div className="w-full relative" onBlur={() => {}}>
              {!loadingAttachment && !recording && !attachmentToSend && (
                <textarea
                  className="resize-none w-full h-fit p-4 pb-12 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder={
                    isInstagramWindowExpired(findChatId(selectedChat ?? ''))
                      ? 'Aguardando mensagem do cliente...'
                      : 'Digite sua mensagem'
                  }
                  disabled={!canReply || isInstagramWindowExpired(findChatId(selectedChat ?? ''))}
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => {
                    const value = e.target.value;
                    const native: any = (e as any).nativeEvent;
                    const inputType: string | undefined = native?.inputType;
                    const isDeletion =
                      typeof inputType === 'string' && inputType.startsWith('delete');

                    let nextValue = value;
                    if (!isDeletion) {
                      const justTypedEqual =
                        value.endsWith('=') && !prevInputValueRef.current.endsWith('=');
                      if (justTypedEqual) {
                        nextValue = autoCompleteMathExpression(value);
                      }
                    }

                    setMessage(nextValue);
                    if (selectedChat) {
                      const map = draftsRef.current;
                      const existing = map.get(selectedChat) || { text: '', attachment: null };
                      map.set(selectedChat, { ...existing, text: nextValue });
                    }
                    prevInputValueRef.current = nextValue;
                  }}
                  onPaste={async (e) => {
                    if (!selectedChat) return;
                    const chat = findChatId(selectedChat);
                    if (!chat) return;
                    const items = Array.from(e.clipboardData?.items || []);
                    const fileItem = items.find((it) => it.kind === 'file');
                    const file = fileItem
                      ? fileItem.getAsFile()
                      : e.clipboardData?.files?.[0] || null;
                    if (file) {
                      if (chat.channel === 'olx' && file.type.startsWith('image/')) {
                        e.preventDefault();
                        toast.error('Não é permitido colar imagem no canal OLX.');
                        return;
                      }
                      e.preventDefault();
                      await processFileUpload(file);
                    }
                  }}
                  onKeyDown={handleKeyEnterDown}
                ></textarea>
              )}

              {loadingAttachment && (
                <div className="resize-none w-full h-fit p-4 pb-16 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none">
                  <div className="md:w-2/3 relative bg-[#ebeef2] rounded-xl p-4">
                    <p className="text-[#485b7f] text-sm animate-pulse">Processando arquivo...</p>
                  </div>
                </div>
              )}

              {recording && (
                <div className="resize-none w-full h-fit p-4 pb-16 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none">
                  <div className="md:w-2/3 relative bg-[#ebeef2] rounded-xl p-4">
                    <p className="text-[#485b7f] text-sm animate-pulse">Gravando áudio...</p>
                  </div>
                </div>
              )}

              {attachmentToSend && getFileTypeByMimeType(attachmentToSend.mimetype) !== 'audio' && (
                <div className="resize-none w-full h-fit p-4 pb-12 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none">
                  <div className="md:w-2/3 max-w-[30rem] relative">
                    {renderAttachmentPreview(attachmentToSend)}
                    <button
                      onClick={() => {
                        setAttachmentToSend(null);
                        if (selectedChat) {
                          const map = draftsRef.current;
                          const existing = map.get(selectedChat) || {
                            text: message,
                            attachment: null,
                          };
                          map.set(selectedChat, { ...existing, attachment: null });
                        }
                      }}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full"
                    >
                      <IconX />
                    </button>
                  </div>
                </div>
              )}

              {attachmentToSend && getFileTypeByMimeType(attachmentToSend.mimetype) === 'audio' && (
                <div className="relative">
                  <div className="mb-2">
                    <PreviewAudio
                      src={attachmentToSend.src}
                      onCancel={() => setAttachmentToSend(null)}
                      onSend={handleSendMessage}
                    />
                  </div>
                  <div className="w-full h-fit p-4 pb-12 pt-7 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none"></div>
                </div>
              )}

              <input
                type="file"
                ref={inputFileRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept={getAcceptValue()}
              />

              <div className="flex items-end justify-between absolute bottom-4 w-full px-3">
                <div className="flex items-center gap-1">
                  <div className="relative" ref={emojiPickerRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker((v) => !v);
                      }}
                      className="p-2 rounded-lg bg-[#DDE6F2] hover:bg-[hsl(var(--secondary))] text-[hsl(var(--secondary))] hover:text-secondary-foreground transition"
                      aria-label="Inserir emoji"
                    >
                      <span className="text-lg">😊</span>
                    </button>
                    {showEmojiPicker ? (
                      <div
                        className="absolute bottom-12 left-0 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EmojiPickerDynamic
                          data={data}
                          onEmojiSelect={(e: any) => {
                            insertEmojiAtCursor(e.native);
                            setShowEmojiPicker(false);
                          }}
                          theme="light"
                          locale="pt"
                          previewPosition="none"
                          skinTonePosition="search"
                          navPosition="top"
                        />
                      </div>
                    ) : null}
                  </div>
                  {message.trim().length === 0 &&
                    findChatId(selectedChat ?? '')?.channel === 'whatsapp' && (
                      <GravadorMp3
                        inputFileRef={inputFileRef}
                        onRecordStart={onRecordStart}
                        onRecordStop={onRecordStop}
                      />
                    )}
                  {message.trim().length === 0 &&
                    findChatId(selectedChat ?? '')?.channel === 'instagram' && (
                      <GravadorMp4
                        inputFileRef={inputFileRef}
                        onRecordStart={onRecordStart}
                        onRecordStop={onRecordStop}
                      />
                    )}
                </div>

                <div className="flex gap-2 items-center justify-end">
                  <button
                    onClick={() => setShowMensagensPadrao(true)}
                    className="bg-[#DDE6F2] hover:bg-[hsl(var(--secondary))] duration-300 ease-in-out h-10 aspect-square group flex justify-center items-center p-2 rounded-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Automação / Robô"
                    type="button"
                  >
                    <img src="/icons/robot.png" alt="Robô" className="w-6 h-6" />
                  </button>

                  {showMensagensPadrao && (
                    <CenterModal
                      idSelector="content-container"
                      onClose={() => setShowMensagensPadrao(false)}
                      allowClickOutsideToClose={false}
                    >
                      <div className="w-[400px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 p-4 border-b border-[#E5EEF8]">
                          <div>
                            <h3 className="text-base font-semibold text-[#1B263A]">
                              Mensagens automáticas
                            </h3>
                            <p className="text-xs text-[#6c7a96]">
                              Crie, edite e reutilize respostas padrão.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMensagensPadrao(false)}
                            className="text-[#6c7a96] hover:text-[#1B263A] p-1"
                            aria-label="Fechar"
                            title="Fechar"
                          >
                            <IconX />
                          </button>
                        </div>
                        <div className="p-4">
                          <MensagensPadraoDropdown
                            onSelect={(content) => {
                              setMessage((prev) => {
                                if (!prev) return content;
                                const sep = prev.endsWith('\n') ? '' : '\n';
                                return prev + sep + content;
                              });
                              setShowMensagensPadrao(false);
                            }}
                            api={apiApp}
                            className="w-full max-h-[60vh] shadow-none border-transparent"
                          />
                        </div>
                      </div>
                    </CenterModal>
                  )}

                  {!attachmentToSend && findChatId(selectedChat ?? '')?.channel !== 'olx' && (
                    <button
                      onClick={() => handleEnviarAnexo()}
                      className="bg-[#DDE6F2] hover:bg-[hsl(var(--secondary))] duration-300 ease-in-out h-10 aspect-square group flex justify-center items-center p-2 rounded-lg lg:right-28 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        !canReply ||
                        loadingAttachment ||
                        isInstagramWindowExpired(findChatId(selectedChat ?? ''))
                      }
                    >
                      <svg
                        width="17"
                        height="18"
                        viewBox="0 0 17 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6425 4.83333L5.15412 10.3217C4.99494 10.4754 4.86797 10.6593 4.78062 10.8627C4.69327 11.066 4.64729 11.2847 4.64537 11.506C4.64345 11.7273 4.68562 11.9468 4.76942 12.1516C4.85322 12.3564 4.97697 12.5425 5.13346 12.699C5.28995 12.8555 5.47604 12.9792 5.68086 13.063C5.88569 13.1468 6.10516 13.189 6.32646 13.1871C6.54776 13.1852 6.76646 13.1392 6.9698 13.0518C7.17314 12.9645 7.35704 12.8375 7.51079 12.6783L12.8558 7.18999C13.463 6.56132 13.799 5.71931 13.7914 4.84532C13.7838 3.97133 13.4332 3.13529 12.8152 2.51727C12.1972 1.89924 11.3611 1.54868 10.4871 1.54108C9.61314 1.53349 8.77113 1.86947 8.14245 2.47666L2.79662 7.96416C1.85886 8.90192 1.33203 10.1738 1.33203 11.5C1.33203 12.8262 1.85886 14.0981 2.79662 15.0358C3.73438 15.9736 5.00626 16.5004 6.33245 16.5004C7.65865 16.5004 8.93053 15.9736 9.86829 15.0358L15.0825 9.83333"
                          className="group-hover:stroke-[#DDE6F2] stroke-[hsl(var(--secondary))] duration-300 ease-in-out"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  {findChatId(selectedChat ?? '')?.dealId && (
                    <ActionChatButton
                      atendimentoId={findChatId(selectedChat ?? '')?.dealId}
                      onAction={setNotification}
                    />
                  )}

                  <button
                    onClick={handleSendMessage}
                    className="bg-[hsl(var(--secondary))] rounded-[0.5rem] h-10 px-3 text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!canReply || isInstagramWindowExpired(findChatId(selectedChat ?? ''))}
                  >
                    <span className="hidden md:block">Enviar</span>
                    <IconEnviar />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isNewServiceOpen && (
        <SideModal onClose={requestCloseNewService} allowClickOutsideToClose={false}>
          <ConteudoNovoAtendimento
            onCancel={requestCloseNewService}
            onSucess={() => {
              fetchChats(undefined, undefined, currentFilterKeyRef.current);
              setIsNewServiceOpen(false);
            }}
            initialData={selectedChat ? getInitialData() : undefined}
            onForceClose={closeNewService}
          />
        </SideModal>
      )}

      <ConfirmationModal
        isOpen={showConfirmNewService}
        title="Você tem informações não salvas"
        message="Deseja realmente sair? Todas as informações preenchidas serão perdidas."
        onConfirm={confirmCloseNewService}
        onCancel={cancelCloseNewService}
      />

      {openNewChat && selectedChat && (
        <SideModal onClose={closeNewChat} idSelector="content-container">
          <ConteudoNovoChat
            onCancel={closeNewChat}
            onSucess={(id) => onNewChatCreated(String(id))}
            chatId={selectedChat as any}
            atendimentoId={
              newChatPrefill?.atendimentoId ??
              (findChatId(selectedChat)?.dealId ? findChatId(selectedChat)?.dealId : undefined)
            }
            prefillNome={newChatPrefill?.name}
            prefillWhatsapp={newChatPrefill?.whatsapp}
          />
        </SideModal>
      )}
    </main>
  );
}
