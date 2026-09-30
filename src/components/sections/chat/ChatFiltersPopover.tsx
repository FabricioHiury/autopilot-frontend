import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerRange } from "@/components/commons/inputs/date-picker-range";
import ChipFilter from "@/components/sections/chat/chip-filter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AvatarUser from "@/components/commons/avatar-user";
import { cn } from "@/lib/class-name.utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { profileImageUrl } from "@/lib/profile.utils";

export type ChipsChannelFilter = { id: string; label: string };
export type Collaborator = { id: string; name: string; idUsuario: string };

type Props = {
  pendingDateRange?: DateRange;
  setPendingDateRange: (range?: DateRange) => void;
  dateStart?: string;
  dateEnd?: string;
  setDateStart: (value?: string) => void;
  setDateEnd: (value?: string) => void;
  parseYMDToLocalDate: (ymd: string) => Date;
  chipsChannelFilter: ChipsChannelFilter[];
  channelSelected?: string;
  onToggleChannel: (id: string) => void;
  sortOrder: "recentes" | "antigos";
  setSortOrder: (order: "recentes" | "antigos") => void;
  collaborators: Collaborator[];
  selectedCollaboratorIdUsuario?: string;
  onToggleCollaborator: (idUsuario: string) => void;
};

export function ChatFiltersPopover({
  pendingDateRange,
  setPendingDateRange,
  dateStart,
  dateEnd,
  setDateStart,
  setDateEnd,
  parseYMDToLocalDate,
  chipsChannelFilter,
  channelSelected,
  onToggleChannel,
  sortOrder,
  setSortOrder,
  collaborators,
  selectedCollaboratorIdUsuario,
  onToggleCollaborator,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded-full bg-white border border-[#DDE6F2] text-[#485B80] hover:bg-[#E6EDF8] flex items-center justify-center shadow-sm hover:shadow-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#293856]"
          aria-label="Filtros"
        >
          <img src="/icons/filter.svg" alt="Filtros" className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-5 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E3EAF5] transition-all duration-300">
        <div className="flex flex-col gap-4">
          {/* PERÍODO */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#334155] font-semibold flex items-center gap-2">
              <img src="/icons/calendar.svg" alt="Calendário" className="w-4 h-4 opacity-70" />
              Período
            </p>
            {(dateStart || dateEnd) && (
              <span className="text-xs text-[#64748B] italic">
                {format(parseYMDToLocalDate(dateStart ?? dateEnd!), "dd/MM")}
                {dateEnd ? ` – ${format(parseYMDToLocalDate(dateEnd), "dd/MM")}` : ""}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePickerRange
              value={
                pendingDateRange ??
                ((dateStart || dateEnd)
                  ? {
                    from: dateStart ? parseYMDToLocalDate(dateStart) : undefined,
                    to: dateEnd
                      ? parseYMDToLocalDate(dateEnd)
                      : dateStart
                        ? parseYMDToLocalDate(dateStart)
                        : undefined,
                  }
                  : undefined)
              }
              onChange={setPendingDateRange}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPendingDateRange(undefined);
                  setDateStart(undefined);
                  setDateEnd(undefined);
                }}
                className="text-xs text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                Limpar
              </button>
              <button
                disabled={!pendingDateRange || !pendingDateRange.from}
                onClick={() => {
                  if (!pendingDateRange?.from) {
                    setDateStart(undefined);
                    setDateEnd(undefined);
                    return;
                  }
                  const fromIso = format(pendingDateRange.from, "yyyy-MM-dd");
                  const toIso = pendingDateRange.to ? format(pendingDateRange.to, "yyyy-MM-dd") : fromIso;
                  setDateStart(fromIso);
                  setDateEnd(toIso);
                  setPendingDateRange(undefined);
                }}
                className="text-xs text-white bg-[#0F172A] hover:bg-[#1E293B] px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Filtrar
              </button>
            </div>
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* PLATAFORMA */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#334155] font-semibold flex items-center gap-2">
              <img src="/icons/filter.svg" alt="Filtro" className="w-4 h-4 opacity-70" />
              Plataforma
            </p>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent">
              {chipsChannelFilter.map((chip) => (
                <ChipFilter
                  key={chip.id}
                  id={chip.id}
                  label={chip.label}
                  active={channelSelected === chip.id}
                  className={channelSelected === chip.id
                    ? "bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all duration-200"
                    : "bg-[#F8FAFC] text-[#334155] hover:bg-[#E2E8F0] transition-all duration-200"
                  }
                  onClick={() => onToggleChannel(chip.id)}
                />
              ))}
            </div>
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* ORDENAÇÃO */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#334155] font-semibold flex items-center gap-2">
              <img src="/icons/relogio.svg" alt="Ordenar" className="w-4 h-4 opacity-70" />
              Ordenação
            </p>
            <div className="flex gap-2 flex-wrap">
              {["recentes", "antigos"].map((ord) => (
                <ChipFilter
                  key={ord}
                  id={ord}
                  label={ord.charAt(0).toUpperCase() + ord.slice(1)}
                  active={sortOrder === ord}
                  className={sortOrder === ord
                    ? "bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all duration-200"
                    : "bg-[#F8FAFC] text-[#334155] hover:bg-[#E2E8F0] transition-all duration-200"
                  }
                  onClick={() => setSortOrder(ord as "recentes" | "antigos")}
                />
              ))}
            </div>
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* COLABORADOR */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#334155] font-semibold flex items-center gap-2">
              <img src="/icons/cliente.svg" alt="Colaborador" className="w-4 h-4 opacity-70" />
              Colaborador
            </p>
            <div className="flex gap-2 flex-wrap pb-2 max-h-28 overflow-y-scroll pr-1 scrollbar-mini">
              {collaborators.map((c) => (
                <TooltipProvider delayDuration={200} key={c.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onToggleCollaborator(c.idUsuario)}
                        className={cn(
                          "rounded-full border border-[#E2E8F0] bg-white p-1.5 hover:bg-[#F1F5F9] transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E293B]",
                          selectedCollaboratorIdUsuario === c.idUsuario ? "ring-2 ring-[#1E293B]" : ""
                        )}
                      >
                        <AvatarUser
                          name={c.name}
                          src={profileImageUrl(c.idUsuario)}
                          size={2.5}
                          tooltip={false}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{c.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}