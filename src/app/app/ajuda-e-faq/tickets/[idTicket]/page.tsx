'use client';

import AvatarUser from "@/components/commons/avatar-user";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import NoData from "@/components/commons/estados/NoData";
import CenterModal from "@/components/commons/modais/center-modal";
import { PageTitle } from "@/components/commons/page-title";
import IconEnviar from "@/components/icons/icon-enviar";
import Spinner from "@/components/loading/Spinner";
import GoBackPage from "@/components/sections/go-back-page";
import { ApiApp } from "@/lib/api-app";
import { relativeTime } from "@/lib/relative-time";
import { profileImageUrl } from "@/lib/profile.utils";
import api from "@/utils/classes/api";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type Ticket = {
  id: string;
  idUsuario: string;
  idLoja: string;
  titulo: string;
  assunto: string;
  mensagem: string;
  prioridade: string;
  status: string;
  tipo: null;
  categoria: string;
  criadoEm: string;
  atualizadoEm: string;
  usuario: { id: string; nome: string };
  respostas: {
    id: string;
    idTicket: string;
    idUsuario: string;
    resposta: string;
    criadoEm: string;
    atualizadoEm: string;
    arquivos: any[];
    usuario: { id: string; nome: string };
  }[];
  arquivos: {
    id: string;
    criadoEm: string;
    atualizadoEm: string;
    idResposta: null;
    idTicket: string;
    idArquivo: string;
    url: string;
  }[];
  historico: {
    id: string;
    evento: string;
    acao: string;
    idTicket: string;
    idUsuario: string;
    criadoEm: string;
    usuario: { id: string; nome: string };
  }[];
  loja: {
    id: string;
    idLojista: string;
    idFoto: null;
    cnpj: string;
    nomeEmpresa: string;
    inscricaoMunicipal: null;
    inscricaoEstadual: null;
    regimeTributario: null;
    portalEmpresa: null;
    atividadePrincipal: null;
    descricaoAtividade: null;
    wppConfigurado: boolean;
    wppInstancia: null;
    criadoEm: string;
    atualizadoEm: string;
    lojista: {
      id: string;
      idUsuario: string;
      status: string;
      tokenClienteMeta: null;
      tokenClienteOlx: null;
      deviceToken: null;
      criadoEm: string;
      atualizadoEm: string;
      usuario: { id: string; email: string };
    };
  };
};

type User = { id: string; nome: string; perfil: string };

type PreviewFile = {
  file: File;
  url: string;
};

export default function Page() {
  const params = useParams();
  const ticketId = params.idTicket as string;
  const router = useRouter();
  const apiApp = useMemo(() => new ApiApp(), []);

  const [user, setUser] = useState<User | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [replying, setReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");

  const [sending, setSending] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyFiles, setReplyFiles] = useState<PreviewFile[]>([]);

  const fileKey = useCallback(
    (f: File) => `${f.name}-${f.size}-${f.lastModified}`,
    []
  );

  const addFiles = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;

    setReplyFiles((prev) => {
      const existing = new Set(prev.map((p) => fileKey(p.file)));
      const next = [...prev];
      for (let i = 0; i < list.length; i++) {
        const f = list.item(i)!;
        const k = fileKey(f);
        if (existing.has(k)) continue;
        const url = URL.createObjectURL(f);
        next.push({ file: f, url });
        existing.add(k);
      }
      return next;
    });
  }, [fileKey]);

  const removeFileAt = useCallback((idx: number) => {
    setReplyFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }, []);

  useEffect(() => {
    return () => {
      replyFiles.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    let mounted = true;
    try {
      const [data, error] = await apiApp.suporte.pegar(ticketId);
      if (!mounted) return;

      if (error || !data) {
        console.error(error);
        setTicket(null);
        setLoading(false);
        return;
      }
      setTicket(data);
    } catch (err) {
      if (!mounted) return;
      console.error(err);
      setTicket(null);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [apiApp.suporte, ticketId]);

  const fetchUserFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem("usuario");
      if (!stored) return;
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
    } catch {
    }
  }, []);

  const handleOpenFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const sendReply = useCallback(async () => {
    if (!replyText || replyText.trim() === "") return;

    setSending(true);
    try {
      const [data, error] = await apiApp.suporte.responder(ticketId, { resposta: replyText });

      if (!error && data && replyFiles.length > 0) {
        const uploads = replyFiles.map(async (p) => {
          const formData = new FormData();
          formData.append("file", p.file);
          const [res, err] = await api.formData(`/suporte/${ticketId}/anexos`, formData, "POST");
          if (err) throw err;
          return res;
        });

        const results = await Promise.allSettled(uploads);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          console.error("Falhas ao enviar anexos:", failed);
          toast.error("Alguns anexos não foram enviados");
        }
      }

      if (error) {
        console.error(error);
        toast.error("Erro ao enviar resposta");
        setSending(false);
        return;
      }

      toast.success("Resposta enviada com sucesso");
      setReplying(false);
      setReplyText("");
      setReplyFiles((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
      await fetchTicket();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar resposta");
    } finally {
      setSending(false);
    }
  }, [apiApp.suporte, replyText, replyFiles, ticketId, fetchTicket]);

  useEffect(() => {
    fetchTicket();
    fetchUserFromStorage();
  }, [fetchTicket, fetchUserFromStorage]);

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <LoadingGlobal />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <NoData label="Ticket não encontrado" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-y-auto">
      <div className="flex flex-col gap-3 w-full p-9">
        <GoBackPage />
        <div className="flex justify-between items-center">
          <PageTitle title={`Ticket #${ticketId}`} />
          <div className="flex items-center gap-3" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full flex-1 bg-white p-9 py-6 pb-20 md:pb-6">
        <div className="bg-[#EDF2F7] rounded-2xl p-4 w-full overflow-x-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <div className="h-3.5 rounded-xl justify-center items-center gap-1 inline-flex">
                <div className="w-2 h-2 bg-[#aa4f22] rounded-sm" />
                <div className="text-[#657380] text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">
                  {ticket.prioridade}
                </div>
              </div>
              <div className="text-[#24292e] text-xl font-semibold font-['BR Sonoma'] leading-normal">
                {ticket.titulo}
              </div>
            </div>

            <div className="h-5 justify-start items-start inline-flex">
              <div className="px-2 py-1 bg-[#586e9d] rounded-xl justify-center items-center gap-2.5 flex">
                <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">
                  {ticket.status}
                </div>
              </div>
            </div>
          </div>

          <div className="h-16 p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
            <div className="self-stretch justify-center items-center gap-6 inline-flex">
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
                <div className="text-[#434d56] text-base font-semibold font-['BR Sonoma'] leading-tight">
                  {ticket.usuario.nome}
                </div>
                <div className="justify-start items-start flex">
                  <div className="px-2 py-0.5 bg-[#e3ebf3] rounded-xl justify-center items-center gap-0.5 flex">
                    <div className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">
                      {ticket.categoria}
                    </div>
                  </div>
                </div>
                <div className="w-44 text-[#95a3b2] text-xs font-normal font-['BR Sonoma'] leading-none">{`Ticket #${ticket.id}`}</div>
              </div>
              <div className="justify-start items-center gap-2 flex">
                <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">
                  {relativeTime(new Date(ticket.criadoEm))}
                </div>
              </div>
              {!replying && (
                <button
                  onClick={() => setReplying(true)}
                  className="bg-[#1b2841] rounded-lg justify-center items-center flex"
                  type="button"
                  aria-label="Responder ticket"
                >
                  <div className="p-2 rounded-tl-lg rounded-bl-lg justify-center items-center flex">
                    <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none">Responder</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
            <div className="self-stretch justify-center items-center gap-6 inline-flex">
              <div className="grow shrink basis-0 justify-start items-center gap-3 flex">
                <div className="text-[#434d56] text-sm font-semibold font-['BR Sonoma'] leading-tight">Mensagem</div>
                <div className="justify-start items-start flex">
                  <div className="px-2 py-1 bg-[#e3ebf3] rounded-xl justify-center items-center gap-2.5 flex">
                    <div className="text-[#24292e] text-xs font-semibold font-['BR Sonoma'] leading-none">
                      {ticket.usuario.nome}
                    </div>
                  </div>
                </div>
              </div>
              <div className="justify-start items-center gap-2 flex">
                <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">
                  {relativeTime(new Date(ticket.criadoEm))}
                </div>
              </div>
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 13L10 7L16 13" stroke="#D33632" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="self-stretch flex-col justify-start items-start gap-4 flex">
              <div className="self-stretch text-[#485b7f] text-lg font-semibold font-['BR Sonoma'] leading-snug">
                {ticket.assunto}
              </div>
              <div className="self-stretch text-[#485b7f] text-sm font-medium font-['BR Sonoma'] leading-tight">
                {ticket.mensagem}
              </div>

              <div className="flex items-center gap-2 w-full overflow-x-auto scroll-padrao">
                {ticket.arquivos.map((obj) => (
                  <Attachment key={obj.id} url={obj.url} />
                ))}
              </div>
            </div>
          </div>

          {ticket.respostas.map((msg) => (
            <ReplyMessage key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInput}
      />

      {replying && (
        <div className="w-full sticky bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-20 md:pb-6 border-t border-gray-200 flex flex-col gap-3">
          <div className="text-[#657380]">
            Respondendo <span className="font-semibold">AutoPilot</span>
          </div>

          <div className="flex gap-3 items-start">
            <AvatarUser name={user ? user.nome : " "} src={user ? profileImageUrl(user.id) : undefined} />
            <textarea
              className="w-full h-20"
              placeholder="Digite sua resposta..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 items-stretch">
            {replyFiles.map((obj, index) => (
              <div
                key={`${obj.file.name}-${obj.file.size}-${obj.file.lastModified}`}
                className="flex items-center text-[12px] px-3 py-1.5 rounded-md bg-gray-100 gap-2 hover:bg-gray-200 transition-colors"
                title={obj.file.name}
              >
                {obj.file.type.startsWith("image/") ? (
                  <img
                    src={obj.url}
                    alt={obj.file.name}
                    className="w-5 h-5 rounded object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" fill="#4B5563" viewBox="0 0 256 256" aria-hidden="true">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                  </svg>
                )}
                <span className="text-gray-700 whitespace-nowrap max-w-[12rem] truncate">{obj.file.name}</span>
                <button
                  onClick={() => removeFileAt(index)}
                  className="text-gray-500 text-[15px] hover:text-red-600 font-medium transition-colors"
                  aria-label={`Remover arquivo ${obj.file.name}`}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="bg-[#EDF2F7] flex items-center gap-2 p-2 rounded-[0.5rem]">
              <button onClick={handleOpenFileDialog} type="button" aria-label="Adicionar anexos">
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6.37111 15.5212L13.3852 8.80719C14.2274 8.00109 14.2274 6.69414 13.3852 5.88804C12.5431 5.08195 11.1777 5.08194 10.3356 5.88804L3.37233 12.5534C1.77228 14.085 1.77228 16.5682 3.37233 18.0998C4.97237 19.6314 7.56655 19.6314 9.16659 18.0998L16.2315 11.3371C18.5895 9.08003 18.5895 5.42059 16.2315 3.16351C13.8736 0.906434 10.0506 0.906434 7.69261 3.16351L2 8.61258" stroke="#24292E" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <button
              disabled={sending}
              onClick={sendReply}
              className="bg-[#293856] rounded-[0.5rem] h-10 px-3 text-white font-semibold text-sm flex items-center justify-center gap-2 flex-shrink-0"
              type="button"
            >
              {sending ? (
                <Spinner color="white" width="20px" />
              ) : (
                <>
                  Adicionar Resposta
                  <IconEnviar />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyMessage({ message }: { message: Ticket["respostas"][number] }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
      <div className="self-stretch justify-center items-center gap-6 inline-flex">
        <div className="grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
          <div className="text-[#434d56] text-sm font-semibold font-['BR Sonoma'] leading-tight">Resposta</div>
          <div className="justify-start items-start flex">
            <div className="px-2 py-1 bg-[#e3ebf3] rounded-xl justify-center items-center gap-2.5 flex">
              <div className="text-[#24292e] text-xs font-semibold font-['BR Sonoma'] leading-none">
                {message.usuario.nome}
              </div>
            </div>
          </div>
        </div>
        <div className="justify-start items-center gap-2 flex">
          <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">
            {relativeTime(new Date(message.criadoEm))}
          </div>
        </div>
        <div className="relative">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 13L10 7L16 13" stroke="#D33632" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="self-stretch flex-col justify-start items-start gap-4 flex">
        <div className="self-stretch text-[#485b7f] text-sm font-medium font-['BR Sonoma'] leading-tight">
          {message.resposta}
        </div>

        {!!message.arquivos?.length && (
          <div className="flex items-center gap-2 w-full overflow-x-auto scroll-padrao">
            {message.arquivos.map((a: any) => (
              <Attachment key={a.id} url={a.url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Attachment = React.memo(function Attachment({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  const isImage = useMemo(() => {
    const lower = url.toLowerCase();
    return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif");
  }, [url]);

  const isPdf = useMemo(() => url.toLowerCase().includes(".pdf"), [url]);

  return (
    <>
      <div className="w-[190px] h-[140px] relative flex group items-center overflow-clip rounded-lg">
        <button
          onClick={() => setOpen(true)}
          className="absolute top-0 left-0  w-full h-full z-10"
          type="button"
          aria-label="Abrir anexo"
        />
        {isImage ? (
          <img
            src={url}
            alt="anexo"
            className="object-cover w-full h-full absolute top-0 left-0"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <object
            data={url}
            className="object-cover w-full h-full absolute top-0 left-0 overflow-hidden"
            aria-label="Pré-visualização do anexo"
          />
        )}
        {isPdf && (
          <div className="absolute right-0">
            <div className="bg-[#293856] rounded-sm rounded-r-none text-[12px] text-white px-8 py-1">PDF</div>
          </div>
        )}
      </div>

      {open && (
        <CenterModal onClose={() => setOpen(false)} idSelector="content-container">
          <div className="flex flex-col w-[55vw] h-[75vh]">
            {isImage ? (
              <img src={url} alt="anexo" className="h-full w-full object-contain" />
            ) : (
              <object data={url} className="h-full w-full" />
            )}
          </div>
        </CenterModal>
      )}
    </>
  );
});
