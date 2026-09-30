import React from 'react';
import AvatarUser from '@/components/commons/avatar-user';
import AvatarCanal from '@/components/commons/avatar-canal';
import { cn } from '@/lib/class-name.utils';
import { ChevronDown, EyeIcon, SearchIcon } from 'lucide-react';

interface ChatHeaderProps {
  selectedChat: string | null;
  loadingMessages: boolean;
  enableListChat: boolean;
  modalAtendimentoChat: string | null;
  searchMessage: string;
  isSearchExpanded: boolean;
  isSearchFocused: boolean;
  searchFocusRef: React.RefObject<boolean>;
  onToggleListChat: () => void;
  onToggleSearch: () => void;
  onSearchChange: (value: string) => void;
  onFocusSearch: () => void;
  onBlurSearch: () => void;
  onViewAtendimento: (id: string) => void;
  onNavigateToAtendimento: (id: string) => void;
  findChatId: (id: string) => any;
  getSelectedChatName: () => string | null;
  getSelectedChatAvatar: () => string | null;
  calcLastMessage: () => string;
  getOrigin: () => React.ReactNode;
  getServiceStatus: () => string;
  profileImageUrl: (id: string) => string | null;
  renderNewChat: () => React.ReactNode;
  NewService: React.ComponentType;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  loadingMessages,
  enableListChat,
  modalAtendimentoChat,
  searchMessage,
  isSearchExpanded,
  isSearchFocused,
  searchFocusRef,
  onToggleListChat,
  onToggleSearch,
  onSearchChange,
  onFocusSearch,
  onBlurSearch,
  onViewAtendimento,
  onNavigateToAtendimento,
  findChatId,
  getSelectedChatName,
  getSelectedChatAvatar,
  calcLastMessage,
  getOrigin,
  getServiceStatus,
  profileImageUrl,
  renderNewChat,
  NewService
}) => {
  const chatData = selectedChat ? findChatId(selectedChat) : null;
  const hasAtendimento = !!chatData?.idAtendimento;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 w-full bg-[#E3E5E740] backdrop-blur-md",
        "border-b border-gray-200 shadow-sm",
        "px-4 py-2 flex flex-col gap-2",
        "lg:flex-row lg:items-center lg:justify-between lg:h-[64px]",
        (loadingMessages || !selectedChat) && "hidden"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 min-w-0 lg:flex-1">
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0 justify-between lg:justify-start">
          <div className='flex gap-1 items-center'>
            <button
              onClick={onToggleListChat}
              className="md:hidden rounded-full hover:bg-gray-100 transition"
            >
              <svg className="rotate-180 text-gray-700" width={20} height={20}>
                <path stroke="currentColor" strokeWidth={2} d="M9 5l7 7-7 7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className='flex items-center gap-2 bg-white rounded-full p-1 px-2'>
              <div className="relative flex-shrink-0">
                <AvatarUser
                  name={getSelectedChatName() ?? ""}
                  src={getSelectedChatAvatar() ?? ""}
                />

                <div className="absolute -bottom-1 -right-1">
                  <AvatarCanal
                    canal={(selectedChat && chatData?.canal) || "outros"}
                    size={1.5}
                  />
                </div>
              </div>

              {hasAtendimento && !modalAtendimentoChat && (
                <button
                  onClick={() => onViewAtendimento(chatData.idAtendimento)}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F2F4F7] hover:bg-gray-50 transition"
                >
                  <img src='/icons/eye.svg' alt='Ver Atendimento' className='w-4 h-4' />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 lg:hidden">
            <div className="lg:block">
              {renderNewChat()}
            </div>

            {!isSearchExpanded && (
              <div className="lg:block">
                <NewService />
              </div>
            )}

            <div
              className={cn(
                "flex items-center rounded-full bg-[#FFFFFF]",
                "h-10 transition-all",
                "focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30",
                isSearchExpanded ? "px-3" : "px-2"
              )}
            >
              <button
                onClick={onToggleSearch}
                className="p-1 text-gray-500 hover:text-gray-700 transition"
              >
                <SearchIcon size={14} />
              </button>

              <input
                value={searchMessage}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onFocusSearch}
                onBlur={onBlurSearch}
                placeholder="Buscar..."
                className={cn(
                  "bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 transition-all",
                  isSearchExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex items-end">
          {hasAtendimento ? (
            <button
              onClick={() => onNavigateToAtendimento(chatData.idAtendimento)}
              className="flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-50 transition w-full lg:w-auto"
            >
              <div className="flex items-center gap-2">
                {chatData?.atendimento?.atendimentoResponsaveis?.map((obj: any, index: number) => (
                  <AvatarUser
                    key={`${obj.id}-${index}`}
                    name={obj.colaborador.nome}
                    src={profileImageUrl(obj.colaborador.idUsuario) || undefined}
                    size={1.5}
                    className="ring-2 ring-white"
                  />
                ))}
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {getServiceStatus()}
                </span>
              </div>
              <ChevronDown size={16} color="#808080" />
            </button>
          ) : (
            <div className="hidden lg:flex flex-col min-w-0 leading-tight">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {getSelectedChatName()}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {calcLastMessage()}
              </span>
            </div>
          )}
          <div>
            {getOrigin()}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-end gap-1">
        <div className="hidden lg:block">
          {renderNewChat()}
        </div>

        {!isSearchExpanded && (
          <div className="hidden lg:block">
            <NewService />
          </div>
        )}

        <div
          className={cn(
            "flex items-center rounded-full bg-white",
            "h-[40px] transition-all",
            "focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30",
            isSearchExpanded ? "px-3" : "px-2"
          )}
        >
          <button
            onClick={onToggleSearch}
            className="p-1 text-gray-500 hover:text-gray-700 transition"
          >
            <SearchIcon size={14} />
          </button>

          <input
            value={searchMessage}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onFocusSearch}
            onBlur={onBlurSearch}
            placeholder="Buscar..."
            className={cn(
              "bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 transition-all",
              isSearchExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
            )}
          />
        </div>
      </div>

    </header>
  );
};

export default ChatHeader;