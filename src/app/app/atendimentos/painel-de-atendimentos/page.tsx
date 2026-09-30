"use client";

import { PageTitle } from "@/components/commons/page-title";
import { useEffect, useRef, useState } from "react";
import { ModalNovoAtendimento } from "@/components/sections/atendimentos/modal-novo-atendimento";
import { ModalNotificacoes } from "@/components/commons/modais/modal-notificacoes";
import {
  FiltroAtendimentoType,
  ModalAtendimentoFiltro,
} from "@/components/sections/atendimentos/modal-atendimento-filtro";
import { ApiApp } from "@/lib/api-app";
import {
  ColunaEtapaType,
  ResponseListAtentimentoType,
} from "@/utils/types/atentimento-lista-type";
import {
  STATUS_ATENDIMENTO,
  STATUS_ATENDIMENTO_LABEL,
  STATUS_ATENDIMENTO_COLOR,
} from "@/utils/types/status-atentimento-enum";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TagAtendimento } from "@/model/tag";
import NoData from "@/components/commons/estados/NoData";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import toast from "react-hot-toast";
import IconX from "@/components/icons/icon-x";
import PesquisarAtendimentos from "@/components/sections/atendimentos/pesquisar-atentimentos";
import RadioTipoAtendimentos from "@/components/sections/atendimentos/radio-tipo-atendimento";
import ColunasContainer from "@/components/sections/atendimentos/colunas-container";
import IconFilter from "@/components/icons/icon-filter";
import IconTag from "@/components/icons/icon-tag";
import ModalTagsAtendimento from "@/components/sections/atendimentos/modal-tags-atendimento";
import ModalArquivados from "@/components/sections/atendimentos/modal-arquivados";

const configEtapas: ColunaEtapaType[] = [
  {
    id: '0',
    etapa: STATUS_ATENDIMENTO.CHAT,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.CHAT,
    color: STATUS_ATENDIMENTO_COLOR.CHAT,
    items: [],
  },
  {
    id: '1',
    etapa: STATUS_ATENDIMENTO.PRE_ATENDIMENTO,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.PRE_ATENDIMENTO,
    color: STATUS_ATENDIMENTO_COLOR.PRE_ATENDIMENTO,
    items: [],
  },
  {
    id: '2',
    etapa: STATUS_ATENDIMENTO.ATENDIMENTO_INICIAL,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.ATENDIMENTO_INICIAL,
    color: STATUS_ATENDIMENTO_COLOR.ATENDIMENTO_INICIAL,
    items: [],
  },
  {
    id: '3',
    etapa: STATUS_ATENDIMENTO.VISITA,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.VISITA,
    color: STATUS_ATENDIMENTO_COLOR.VISITA,
    items: [],
  },
  {
    id: '4',
    etapa: STATUS_ATENDIMENTO.EM_NEGOCIACAO,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.EM_NEGOCIACAO,
    color: STATUS_ATENDIMENTO_COLOR.EM_NEGOCIACAO,
    items: [],
  },
  {
    id: '5',
    etapa: STATUS_ATENDIMENTO.SUCESSO,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.SUCESSO,
    color: STATUS_ATENDIMENTO_COLOR.SUCESSO,
    items: [],
  },
  {
    id: '6',
    etapa: STATUS_ATENDIMENTO.RESGATE,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.RESGATE,
    color: STATUS_ATENDIMENTO_COLOR.RESGATE,
    items: [],
  },
  {
    id: '7',
    etapa: STATUS_ATENDIMENTO.PERDIDO,
    nomeEtapa: STATUS_ATENDIMENTO_LABEL.PERDIDO,
    color: STATUS_ATENDIMENTO_COLOR.PERDIDO,
    items: [],
  },
];

export default function ServicesPage() {
  const api = new ApiApp();

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const colaboradoresFiltro = params.get("colaboradores")?.split(",");
  const [showFiltro, setShowFiltro] = useState(false);
  const [filtro, setFiltro] = useState<FiltroAtendimentoType>({
    colaboradores:
      colaboradoresFiltro && colaboradoresFiltro.length > 0
        ? colaboradoresFiltro.map((c) => c)
        : [],
    tipoAtendimento: "todos",
  });
  const sectionTopRef = useRef<HTMLDivElement>(null);
  const colunasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [colunas, setColunas] = useState<ColunaEtapaType[]>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; nome: string; cor: string; descricao?: string }>>([]);

  function sanitizeDigits(input?: string) {
    if (!input) return "";
    return input.replace(/\D/g, "");
  }

  function deriveTelefoneLikeFromPesquisa(pesquisa?: string) {
    const digits = sanitizeDigits(pesquisa || "");
    return digits.length >= 3 ? digits : undefined;
  }

  async function fecthColunas() {
    setLoading(true);

    let houveErro = false;

    const colunasProcessadasPromise = configEtapas.map(async (etapa) => {
      try {
        const telefoneLike = deriveTelefoneLikeFromPesquisa(filtro.pesquisa);
        const baseFiltros: any = {
          pesquisa: filtro.pesquisa,
          telefoneLike,
          status: etapa.etapa,
          colaboradorIds:
            filtro.colaboradores && filtro.colaboradores.length > 0
              ? filtro.colaboradores.join(",")
              : undefined,
          origem:
            filtro.canais && filtro.canais.length > 0
              ? filtro.canais.join(",")
              : undefined,
          dataInicial:
            filtro.periodo?.inicio &&
            filtro.periodo.inicio !== undefined &&
            filtro.periodo.fim !== undefined
              ? filtro.periodo.inicio
              : undefined,
          dataFinal:
            filtro.periodo?.fim &&
            filtro.periodo.inicio !== undefined &&
            filtro.periodo.fim !== undefined
              ? filtro.periodo.fim
              : undefined,
          orderBy: "atualizadoEm",
          orderDirection: "desc",
          itensPagina: filtro.isArchived ? 50 : 1000,
          tarefasAtribuidas: filtro.tarefasAtribuidas,
          isArchived: filtro.isArchived ? true : undefined,
        };
        if (filtro.tipoAtendimento !== "todos") {
          baseFiltros.modoAtendimento = filtro.tipoAtendimento;
        }

        if (filtro.tipoAtendimento && filtro.tipoAtendimento !== "todos") {
          baseFiltros.modoAtendimento = filtro.tipoAtendimento;
        }

        let atendimentosRaw: any[] = [];

        if (etapa.etapa === STATUS_ATENDIMENTO.CHAT) {
          if (filtro.isArchived) {
            if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
              const results = await Promise.all(
                filtro.idsTags.map(async (tagId) => {
                  const [dr, er] = await api.atendimento.listar({
                    ...baseFiltros,
                    idTag: tagId,
                  });
                  if (er || !dr) {
                    return [] as any[];
                  }
                  return dr.atendimentos || [];
                })
              );
              const merged = results.flat();
              const uniqueMap = new Map<string, any>();
              for (const a of merged) {
                const id = String(a.id);
                if (!uniqueMap.has(id)) uniqueMap.set(id, a);
              }
              atendimentosRaw = Array.from(uniqueMap.values());
            } else {
              const [dataResponse, errorResponse] = await api.atendimento.listar({
                ...baseFiltros,
                idTag: filtro.idTag,
              });
              if (errorResponse || !dataResponse) {
                houveErro = true;
                return { ...etapa, items: [] };
              }
              atendimentosRaw = dataResponse.atendimentos || [];
            }
          } else {
            const [dataResponse, errorResponse] = await api.atendimento.listarChats(
              baseFiltros
            );
            if (errorResponse || !dataResponse) {
              houveErro = true;
              return { ...etapa, items: [] };
            }
            if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
              atendimentosRaw = (dataResponse.atendimentos || []).filter((a: any) =>
                Array.isArray(a.tags) && a.tags.some((t: any) => filtro.idsTags!.includes(t.id))
              );
            } else {
              atendimentosRaw = dataResponse.atendimentos || [];
            }
          }
        } else {
          if (Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0) {
            const results = await Promise.all(
              filtro.idsTags.map(async (tagId) => {
                const [dr, er] = await api.atendimento.listar({
                  ...baseFiltros,
                  idTag: tagId,
                });
                if (er || !dr) {
                  return [] as any[];
                }
                return dr.atendimentos || [];
              })
            );
            const merged = results.flat();
            const uniqueMap = new Map<string, any>();
            for (const a of merged) {
              const id = String(a.id);
              if (!uniqueMap.has(id)) uniqueMap.set(id, a);
            }
            atendimentosRaw = Array.from(uniqueMap.values());
          } else {
            const [dataResponse, errorResponse] = await api.atendimento.listar({
              ...baseFiltros,
              // Suporte legado caso ainda exista idTag simples
              idTag: filtro.idTag,
            });
            if (errorResponse || !dataResponse) {
              houveErro = true;
              return { ...etapa, items: [] };
            }
            atendimentosRaw = dataResponse.atendimentos || [];
          }
        }

        const items = atendimentosRaw.map((atendimento) => {
          const canaisUnicos = new Set(atendimento.chats.map((c: any) => c.canal));
          const canais = Array.from(canaisUnicos) as Array<
            "whatsapp" | "instagram" | "facebook" | "olx" | "outros"
          >;

          if (canais.length === 0 && atendimento.origemAtendimento) {
            canais.push(atendimento.origemAtendimento as any);
          }

          const clienteNome = atendimento.cliente?.nome || "Sem nome";
          const clienteAvatar = atendimento.cliente?.avatar?.trim() || undefined;
          const clienteEmail = atendimento.cliente?.email || "-";
          const clienteTelefone = atendimento.cliente?.telefone || "-";

          return {
            id: atendimento.id,
            data: {
              etapa: atendimento.status as STATUS_ATENDIMENTO,
              status: atendimento.status as STATUS_ATENDIMENTO,
              canais,
              origemAtendimento: atendimento.origemAtendimento,
              nome: clienteNome,
              titulo: atendimento.titulo || undefined,
              avatar: clienteAvatar,
              temperatura: atendimento.temperatura as
                | "quente"
                | "morno"
                | "frio"
                | undefined,
              email: clienteEmail,
              telefone: clienteTelefone,
              responsaveis: Array.isArray(atendimento.responsaveis)
                ? atendimento.responsaveis.map((r: any) => ({
                    id: r.id,
                    nome: r.nome,
                    whatsapp: r.whatsapp,
                    idUsuario: r.idUsuario,
                  }))
                : [],
              // Mapeia tags para exibição nos cards
              tags: Array.isArray(atendimento.tags)
                ? atendimento.tags.map((t: any) => ({ id: t.id, nome: t.nome, descricao: t.descricao, cor: t.cor }))
                : [],
              // Mapeia chats para permitir renderização de ícones no card
              chats: Array.isArray(atendimento.chats)
                ? atendimento.chats.map((c: any) => ({ id: c.id, canal: c.canal }))
                : [],
              totalTarefas: atendimento.tarefas || 0,
              totalNotas: atendimento.comentarios || 0,
            },
          };
        });

        return { ...etapa, items };
      } catch (e) {
        console.error(`Erro na etapa ${etapa.etapa}:`, e);
        houveErro = true;
        return { ...etapa, items: [] };
      }
    });

    const colunasProcessadas = await Promise.all(colunasProcessadasPromise);

    if (houveErro) {
      toast.error("Falha ao carregar alguns atendimentos. Tente novamente.");
    }

    setColunas(colunasProcessadas);
    setLoading(false);
  }

  useEffect(() => {
    fecthColunas();
  }, [filtro]);

  useEffect(() => {
    const fetchTags = async () => {
      const response = await api.atendimento.buscarTags();
      const raw: TagAtendimento[] = Array.isArray(response[0]) ? (response[0] as TagAtendimento[]) : [];

      const normalized = raw
        .filter((item) => typeof item.id === "string" && !!item.id)
        .map((item) => ({
          id: item.id as string,
          nome: item.nome,
          cor: item.cor || "#DDE6F2",
          descricao: item.descricao,
        }));

      setAvailableTags(normalized);
    };
    fetchTags();
  }, []);

  const handleFiltro = async (filtro: FiltroAtendimentoType, options?: { close?: boolean }) => {
    if (filtro.colaboradores && filtro.colaboradores.length > 0) {
      router.replace(`?colaboradores=${filtro.colaboradores?.join(",")}`);
    } else {
      router.replace(pathname);
    }
    if (options?.close) {
      setShowFiltro(false);
    }
    setFiltro(filtro);
  };

  return (
    <main className="flex flex-col h-full bg-[#F2F4F7]">
      <section ref={sectionTopRef}>
        <div className="bg-white px-4 pt-6 md:px-10 md:pt-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="w-full flex gap-4 items-start justify-between">
              <div className="flex flex-col gap-0.5 md:gap-2">
                <PageTitle title="Painel de atendimentos" />
              </div>

              <div className="flex gap-4">
                <div className="hidden md:block">
                  <ModalNovoAtendimento onCreated={() => fecthColunas()} />
                </div>
                <ModalNotificacoes />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between">
            <div className="px-4 md:px-10">
              <button
                className="group flex items-center gap-2 pb-[2.25rem] md:pb-[1.125rem]"
                onClick={() => setShowFiltro((cur) => !cur)}
              >
                <div
                  className="bg-[#1B263A] group-hover:bg-[#D33632] transition-colors duration-300 rounded-[0.5rem] w-8 h-8 flex items-center justify-center data-[active=true]:bg-[#D33632]"
                  data-active={showFiltro}
                >
                  <IconFilter />
                </div>
                <span className="text-sm font-semibold">
                  Faça uma busca segmentada
                </span>
              </button>
            </div>

            <div className="w-full block pb-6 px-4 md:hidden">
              <ModalNovoAtendimento onCreated={() => fecthColunas()} />
            </div>

            {showFiltro && (
              <div className="md:absolute z-10 top-full left-0 w-full md:w-[37.5rem] md:mx-10">
                <ModalAtendimentoFiltro
                  value={filtro}
                  onFilter={handleFiltro}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className="flex-1 min-h-0 overflow-hidden data-[hidden=true]:hidden md:data-[hidden=true]:block pt-6"
        data-hidden={showFiltro}
      >
        <div className="h-full min-h-0 flex flex-col">
          <div className="px-4 md:px-10 flex flex-col gap-4 md:flex-row justify-center md:justify-between pb-4">
            <div className="overflow-x-auto md:overflow-visible">
              <RadioTipoAtendimentos
                value={filtro.tipoAtendimento || "todos"}
                onChange={(v) => setFiltro({ ...filtro, tipoAtendimento: v })}
                className="text-[#7F8999] data-[active=true]:text-[#1B263A] data-[active=true]:bg-white"
              />
            </div>
            <div className="relative flex items-center gap-2">
              <button
                aria-label="Abrir etiquetas"
                className="group flex items-center justify-center w-8 h-8 rounded-md border border-[#DDE6F2] bg-white text-[#485B80] hover:bg-[#F7F9FC] hover:text-[#1B263A] transition-colors"
                onClick={() => setShowTags((cur) => !cur)}
              >
                <IconTag size={15} />
              </button>
              <button
                aria-label="Listar atendimentos arquivados"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#DDE6F2] bg-white text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-[#F7F9FC] hover:text-[#1B263A] transition-colors"
                onClick={() => setShowArchived(true)}
              >
                Arquivados
              </button>
              {showTags && (
                <ModalTagsAtendimento
                  open={showTags}
                  onClose={() => setShowTags(false)}
                  onChanged={(list) => {
                    const normalized = (list || [])
                      .filter((t) => typeof t.id === "string" && !!t.id)
                      .map((t) => ({ id: t.id as string, nome: t.name, cor: t.color, descricao: t.description }));
                    setAvailableTags(normalized);
                  }}
                />
              )}
              <PesquisarAtendimentos
                value={filtro.pesquisa || ""}
                onChange={(v) => setFiltro({ ...filtro, pesquisa: v })}
                className="py-4 md:min-w-[30rem]"
              />
            </div>
          </div>

          <div className="px-4 md:px-10 flex flex-wrap items-center gap-2 md:gap-3 mb-4">
            {filtro.colaboradores && filtro.colaboradores.length > 0 && (
              <button
                aria-label="Remover filtro por colaboradores"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => {
                  setFiltro({ ...filtro, colaboradores: [] });
                  router.replace(pathname);
                }}
              >
                <span>Colaboradores</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.canais && filtro.canais.length > 0 && filtro.canais.length !== 4 && (
              <button
                aria-label="Remover filtro por canal"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, canais: [] })}
              >
                <span>Canais</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.periodo && filtro.periodo.inicio !== undefined && filtro.periodo.fim !== undefined && (
              <button
                aria-label="Remover filtro por período"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, periodo: undefined })}
              >
                <span>Período</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.tarefasAtribuidas === 'true' && (
              <button
                aria-label="Remover filtro de tarefas atribuídas a mim"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, tarefasAtribuidas: 'false' })}
              >
                <span>Atribuídas a mim</span>
                <IconX size={12} />
              </button>
            )}

            {filtro.isArchived && (
              <button
                aria-label="Remover filtro Arquivados"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                onClick={() => setFiltro({ ...filtro, isArchived: undefined })}
              >
                <span>Arquivados</span>
                <IconX size={12} />
              </button>
            )}

            {Array.isArray(filtro.idsTags) && filtro.idsTags.length > 0 && filtro.idsTags.map((tagId) => {
              const tagInfo = availableTags.find((t) => t.id === tagId);
              return (
                <button
                  key={tagId}
                  aria-label={`Remover etiqueta ${tagInfo?.nome || 'Etiqueta'}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE6F2] bg-[#F7F9FC] text-[#485B80] text-xs font-semibold px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
                  onClick={() => {
                    const rest = filtro.idsTags!.filter((id) => id !== tagId);
                    setFiltro({ ...filtro, idsTags: rest.length > 0 ? rest : undefined });
                  }}
                >
                  <span>{tagInfo?.nome || 'Etiqueta'}</span>
                  <IconX size={12} />
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {loading && <LoadingGlobal />}
            {!loading && colunas.length === 0 && <NoData />}
            {!loading && colunas && colunas.length > 0 && (
              <ColunasContainer reference={colunasRef} columns={colunas} availableTags={availableTags} />
            )}
          </div>
        </div>
      </section>
      {showArchived && (
        <ModalArquivados open={showArchived} onClose={() => setShowArchived(false)} filtro={filtro} />
      )}
    </main>
  );
}
