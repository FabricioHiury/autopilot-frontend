"use client";

import IconQuente from "./icons/icon-quente";
import IconMorno from "./icons/icon-morno";
import IconFrio from "./icons/icon-frio";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { ApiApp } from "@/lib/api-app";
import { STATUS_ATENDIMENTO_ARQUIVADOS } from "@/utils/types/status-atentimento-enum";
import type { FiltroAtendimentoType } from "@/components/sections/atendimentos/modal-atendimento-filtro";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { navigateToAtendimento } from "@/utils/navigation/atendimento-navigation";
import { ConfirmDialog } from "@/components/commons/modais/confirm-dialog";

// Mapeamento minimalista de ícones por canal
const CHANNEL_ICON_MAP: Record<string, string> = {
  whatsapp: "/icons/whatsapp.svg",
  instagram: "/icons/instagram.svg",
  facebook: "/icons/facebook.svg",
  olx: "/icons/olx.svg",
  webmotors: "/icons/webmotors.svg",
  usadosbr: "/icons/usadosbr.svg",
  icarros: "/icons/icarros.svg",
  mobiauto: "/icons/mobiauto.svg",
  showroom: "/icons/showroom.svg",
  ligacao: "/icons/phone.svg",
  site: "/icons/site.svg",
  outros: "/icons/outros.svg",
};

function channelIconSrc(canal?: string): string | undefined {
  if (!canal) return undefined;
  const key = canal.toLowerCase();
  return CHANNEL_ICON_MAP[key] || CHANNEL_ICON_MAP["outros"];
}

const TEMPERATURE_INFO = {
  quente: { label: "Quente", color: "#D33632", icon: <IconQuente /> },
  morno: { label: "Morno", color: "#F59E0B", icon: <IconMorno /> },
  frio: { label: "Frio", color: "#485B80", icon: <IconFrio /> },
} as const;

type ArchivedItem = {
  id: string;
  nome: string;
  titulo?: string;
  status?: string;
  avatar?: string;
  atualizadoEm?: string;
  origemAtendimento?: string;
  temperatura?: "quente" | "morno" | "frio";
};

export default function ModalArquivados({
  open,
  onClose,
  filtro,
}: {
  open: boolean;
  onClose: () => void;
  filtro: FiltroAtendimentoType;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [query, setQuery] = useState("");
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);
  const [confirmUnarchiveId, setConfirmUnarchiveId] = useState<string | null>(null);

  const api = useMemo(() => new ApiApp(), []);


  const normalize = (s?: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    if (!open) return;

    const sanitizeDigits = (input?: string) => (input ? input.replace(/\D/g, "") : "");
    const telefoneLike = (v?: string) => {
      const digits = sanitizeDigits(v || "");
      return digits.length >= 3 ? digits : undefined;
    };

    const fetchArchived = async () => {
      setLoading(true);
      try {
        const filtros: any = {
          pesquisa: filtro.pesquisa,
          telefoneLike: telefoneLike(filtro.pesquisa),
          colaboradorIds:
            filtro.colaboradores && filtro.colaboradores.length > 0
              ? filtro.colaboradores.join(",")
              : undefined,
          origem:
            filtro.canais && filtro.canais.length > 0
              ? filtro.canais.join(",")
              : undefined,
          dataInicial:
            filtro.periodo?.inicio && filtro.periodo.inicio !== undefined && filtro.periodo.fim !== undefined
              ? filtro.periodo.inicio
              : undefined,
          dataFinal:
            filtro.periodo?.fim && filtro.periodo.inicio !== undefined && filtro.periodo.fim !== undefined
              ? filtro.periodo.fim
              : undefined,
          orderBy: "atualizadoEm",
          orderDirection: "desc",
          itensPagina: 50,
          isArchived: true,
        };

        if (filtro.tipoAtendimento && filtro.tipoAtendimento !== "todos") {
          filtros.modoAtendimento = filtro.tipoAtendimento;
        }

        const [dataResponse] = await api.atendimento.listar(filtros);

        const list: ArchivedItem[] = Array.isArray(dataResponse?.atendimentos)
          ? dataResponse!.atendimentos.map((a: any) => ({
            id: a.id,
            nome: a.cliente?.nome || "Sem nome",
            titulo: a.titulo || undefined,
            status: a.status,
            avatar: a.cliente?.avatar?.trim() || undefined,
            atualizadoEm: a.atualizadoEm,
            origemAtendimento: a.origemAtendimento || undefined,
            temperatura: a.temperatura || undefined,
          }))
          : [];

        setItems(list);
      } catch (e) {
        console.error("Erro ao listar arquivados:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchived();
  }, [open, filtro, api]);

  if (!open) return null;

  const visibleItems = items.filter((i) => {
    if (!query) return true;
    const n = normalize(i.nome);
    const t = normalize(i.titulo);
    const q = normalize(query);
    return n.includes(q) || (t && t.includes(q));
  });

  const desarquivar = async (id: string) => {
    setUnarchivingId(id);
    try {
      const [, err] = await api.atendimento.desarquivar(id);
      if (err) throw new Error(err.message);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Atendimento desarquivado com sucesso.");
    } catch {
      toast.error("Não foi possível desarquivar o atendimento.");
    } finally {
      setUnarchivingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <button
        aria-label="Fechar arquivados"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog central */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative h-full w-full md:w-[32rem] bg-white rounded-[20px] shadow-xl border-l border-[#E3EAF5] overflow-y-auto"
      >
        {/* Cabeçalho */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-5 pt-5 pb-4 border-b border-[#E3EAF5] flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-[#0F172A] text-xl font-semibold">Atendimentos arquivados</h3>
            <div className="mt-2 h-1.5 w-14 bg-[#D33632] rounded-full" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:shadow-sm transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Busca */}
        <div className="px-5 pt-4">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar arquivado por nome ou título"
              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 pr-9 text-sm placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E293B]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/search.svg" alt="" className="absolute right-3 top-2.5 h-4 w-4 opacity-60" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-5 py-4">
          {loading && (
            <div className="text-[#64748B] text-sm">Carregando arquivados...</div>
          )}

          {!loading && visibleItems.length === 0 && (
            <div className="text-[#64748B] text-sm">Nenhum atendimento arquivado encontrado.</div>
          )}

          {!loading && visibleItems.length > 0 && (
            <ul className="flex flex-col gap-3">
              {visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[#E3EAF5] bg-white hover:bg-[#F8FAFC] transition-colors p-0 flex flex-col gap-2 cursor-pointer"
                  aria-label={`Atendimento arquivado de ${item.nome}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigateToAtendimento(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigateToAtendimento(item.id);
                    }
                  }}
                >
                  {/* Cabeçalho do item */}
                  <div className="flex items-center justify-between w-full bg-[#F8FAFC] border border-[#E3EAF5] rounded-t-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.origemAtendimento && (
                        <span className="w-7 h-7 rounded-full border border-[#E3EAF5] bg-white flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={channelIconSrc(item.origemAtendimento) as string}
                            alt={String(item.origemAtendimento)}
                            className="w-4 h-4 opacity-90"
                          />
                        </span>
                      )}

                      {item.temperatura && (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="w-7 h-7 rounded-full border border-[#E3EAF5] bg-white flex items-center justify-center"
                                aria-label={`Temperatura: ${TEMPERATURE_INFO[item.temperatura].label}`}
                              >
                                <span
                                  className="w-4 h-4 flex items-center justify-center"
                                  style={{ color: TEMPERATURE_INFO[item.temperatura].color }}
                                >
                                  {TEMPERATURE_INFO[item.temperatura].icon}
                                </span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Temperatura: {TEMPERATURE_INFO[item.temperatura].label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmUnarchiveId(item.id);
                      }}
                      disabled={unarchivingId === item.id}
                      className="inline-flex items-center gap-1.5 text-white text-xs rounded-full px-3 py-1.5 border border-[#0e1621] shadow-sm hover:bg-[#0e1621]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8]/30 disabled:opacity-60"
                    >
                      {unarchivingId === item.id ? (
                        <span className="inline-block w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <img src="/icons/archive.svg" alt="desarquivar" className="w-4 h-4" />

                          <span className="text-[#0e1621]">Desarquivar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    {/* Nome e avatar */}
                    <div className="mt-1 flex items-center justify-between w-full">
                      <h3 className="text-[#0F172A] text-lg font-semibold leading-tight truncate">
                        {item.nome}
                      </h3>

                      {item.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatar}
                          alt={item.nome}
                          className="w-9 h-9 rounded-full object-cover border border-[#E3EAF5]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569] text-sm font-semibold border border-[#E3EAF5]">
                          {item.nome?.slice(0, 1) || "?"}
                        </div>
                      )}
                    </div>

                    {/* Título e status */}
                    <div className="mt-1 flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/cliente.svg" alt="cliente" className="w-4 h-4 opacity-80" />
                        </span>
                        <p className="text-[#475569] text-sm leading-snug truncate">
                          {item.titulo || (item.origemAtendimento ? String(item.origemAtendimento) : "-")}
                        </p>
                      </div>

                      {item.status && (
                        <span className="inline-block text-[0.75rem] text-[#0F172A] bg-[#E9EEF5] rounded-full px-1.5 py-0.5 border border-[#E3EAF5] shrink-0">
                          {STATUS_ATENDIMENTO_ARQUIVADOS[item.status as keyof typeof STATUS_ATENDIMENTO_ARQUIVADOS] || item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {confirmUnarchiveId && (
        <ConfirmDialog
          title="Desarquivar atendimento"
          message={"Tem certeza que deseja desarquivar este atendimento?\nEle voltará para a lista padrão."}
          confirmText="Desarquivar"
          cancelText="Cancelar"
          variant="info"
          onConfirm={() => desarquivar(confirmUnarchiveId)}
          onCancel={() => setConfirmUnarchiveId(null)}
        />
      )}
    </div>
  );
}