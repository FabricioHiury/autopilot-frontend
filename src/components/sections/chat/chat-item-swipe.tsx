import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useState, ReactNode, useEffect } from "react";
import { cn } from "@/lib/class-name.utils";
import { Chat } from "@/model/chat";
import { Archive, ArchiveRestore } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";
import AvatarUser from "@/components/commons/avatar-user";
import AvatarCanal from "@/components/commons/avatar-canal";

export function ChatItemSwipe({
  chat,
  onArchive,
  onUnarchive,
  isArchivedList,
  debouncedSearch,
  selectedChat,
  onSelectMessage,
  onNavigateToMessage,
  getUnreadCount,
  formatChatDate,
  getLastMessageDate,
  renderPreviewText,
}: {
  chat: Chat;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
  isArchivedList?: boolean;
  debouncedSearch?: string;
  selectedChat?: string | null;
  onSelectMessage?: (id: string) => void;
  onNavigateToMessage?: (id: string) => void;
  getUnreadCount?: (chat: Chat) => number;
  formatChatDate?: (date: Date) => string;
  getLastMessageDate?: (chat: Chat) => Date;
  renderPreviewText?: (text: string, term?: string) => ReactNode;
}) {
  const x = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  const [showArchiveButton, setShowArchiveButton] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // posição inicial do clique/touch
  const startX = useRef(0);
  const [preventClick, setPreventClick] = useState(false);

  const buttonScale = useTransform(x, [-20, -110], [0.8, 1]);
  const buttonOpacity = useTransform(x, [-5, -55], [0, 1]);

  useClickOutside(ref as any, () => {}, false);

  // Fecha o botão ao rolar
  useEffect(() => {
    if (!showArchiveButton) return;
    const handleScrollLike = () => {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      setShowArchiveButton(false);
    };
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    document.addEventListener("scroll", handleScrollLike, opts);
    document.addEventListener("wheel", handleScrollLike, opts);
    document.addEventListener("touchmove", handleScrollLike, opts);
    return () => {
      document.removeEventListener("scroll", handleScrollLike, true);
      document.removeEventListener("wheel", handleScrollLike, true);
      document.removeEventListener("touchmove", handleScrollLike, true);
    };
  }, [showArchiveButton, x]);

  const handleDragEnd = async (_: any, info: any) => {
    const thresholdClick = -60;

    if (info.offset.x < thresholdClick) {
      await animate(x, -110, { type: "spring", stiffness: 250, damping: 22 });
      setShowArchiveButton(true);
    } else {
      await animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      setShowArchiveButton(false);
    }
  };

  const handleActionClick = async () => {
    await animate(x, -110, { duration: 0.15 });
    if (isArchivedList && onUnarchive) onUnarchive(chat.id);
    else onArchive(chat.id);
    await animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    setShowArchiveButton(false);
  };

  // === HELPERS ===
  const processName = (chat: Chat) =>
    chat.clienteTemporario?.nome ?? chat.cliente?.nome ?? "Desconhecido";

  const processAvatar = (chat: Chat) =>
    chat.clienteTemporario?.avatar?.trim() ??
    chat.cliente?.urlAvatar?.trim() ??
    "";

  const processContent = (chat: Chat) => {
    const term = debouncedSearch?.trim();
    const candidate =
      term && (chat as any).mensagemEncontrada?.conteudo
        ? (chat as any).mensagemEncontrada.conteudo
        : chat.mensagem.length > 0
        ? chat.mensagem[0].conteudo ?? ""
        : "";

    if (candidate) return renderPreviewText ? renderPreviewText(candidate, term) : candidate;
    if (chat.mensagem.length > 0) return "Enviou um anexo";
    return "Chat vazio";
  };

  const unread = getUnreadCount ? getUnreadCount(chat) : 0;
  const lastDate = getLastMessageDate
    ? getLastMessageDate(chat)
    : new Date(chat.atualizadoEm || chat.criadoEm || Date.now());
  const dateLabel = formatChatDate ? formatChatDate(lastDate) : "";

  // Detecta movimento antes de soltar
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setPreventClick(false);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = Math.abs(e.clientX - startX.current);
    if (diff > 8) {
      setPreventClick(true); // arrasto detectado
      return;
    }
  };

  const handleClick = () => {
    if (preventClick) return; // evita abrir ao arrastar
    if (onSelectMessage) onSelectMessage(chat.id);
    if (debouncedSearch && (chat as any).mensagemEncontrada?.id && onNavigateToMessage) {
      setTimeout(() => onNavigateToMessage((chat as any).mensagemEncontrada!.id), 200);
    }
  };

  return (
    <div className="relative min-h-[72px] select-none px-2 overflow-hidden">
      {/* Botão de ação */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-2"
        style={{
          opacity: buttonOpacity,
          scale: buttonScale,
        }}
      >
        <button
          onClick={handleActionClick}
          className="flex items-center gap-2 bg-[#0e1621] hover:bg-[#253955] text-white px-3 py-2 rounded-lg shadow-sm h-full transition-colors"
        >
          {isArchivedList ? (
            <ArchiveRestore size={16} strokeWidth={2} />
          ) : (
            <Archive size={16} strokeWidth={2} />
          )}
          <span className="text-sm font-medium">
            {isArchivedList ? "Desarquivar" : "Arquivar"}
          </span>
        </button>
      </motion.div>

      {/* Chat card arrastável */}
      <motion.div
        ref={ref}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -130, right: 0 }}
        dragElastic={0.15}
        style={{ x }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          handleDragEnd(e, info);
        }}
        onClick={handleClick}
        className={cn(
          "relative z-10 cursor-pointer w-full",
          "flex gap-2 items-center px-5 py-[.875rem]",
          "rounded-lg transition-colors duration-200 hover:bg-[#cad0dc]",
          unread > 0 && "font-semibold",
          isDragging && "absolute left-0 right-0 top-0",
          // Estilo visual do chat selecionado
          selectedChat === chat.id && "bg-[#eaeef6] shadow-sm"
        )}
      >
        <div className="relative flex-shrink-0">
          <AvatarUser name={processName(chat)} src={processAvatar(chat)} size={3} />
          <div className="absolute right-0 bottom-0">
            <AvatarCanal canal={chat.canal} size={1.25} />
          </div>
          {unread > 0 && (
            <div className="absolute -top-1 -left-1 min-w-[20px] h-5 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold px-1">
                {unread > 99 ? "99+" : unread}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col w-full truncate">
          <div className="flex justify-between items-center">
            <h2
              className={cn(
                "text-[#293856] dark:text-gray-100 leading-5 truncate",
                unread > 0 ? "font-bold" : "font-medium"
              )}
            >
              {processName(chat)}
            </h2>
            <span
              className={cn(
                "text-xs text-[#485B80] dark:text-gray-400 ml-2 flex-shrink-0",
                unread > 0 ? "font-semibold" : ""
              )}
            >
              {dateLabel}
            </span>
          </div>
          <span
            className={cn(
              "text-xs text-[#485B80] dark:text-gray-400 truncate",
              unread > 0 ? "font-semibold" : ""
            )}
          >
            {processContent(chat) as any}
          </span>
        </div>
      </motion.div>
    </div>
  );
}