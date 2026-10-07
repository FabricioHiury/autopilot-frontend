'use client';

import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import IconEnviar from '@/components/icons/icon-enviar';
import IconX from '@/components/icons/icon-x';
import Input from '@/components/inputs/text/Input';
import toast from 'react-hot-toast';
import CenterModal from '@/components/commons/modais/center-modal';
import { AppServices } from '@/services/app.services';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { convertImageToJpeg } from '@/lib/convert-image.utils';
import { GravadorMp3 } from '@/components/sections/chat/gravador-mp3';
import { MensagensPadraoDropdown } from '@/components/sections/chat/MensagensPadraoDropdown';

function MiniAudioPlayer({
  src,
  fileName,
  sizeLabel,
}: {
  src: string;
  fileName: string;
  sizeLabel?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play();
    }
  };

  const onLoadedMetadata = () => {
    const a = audioRef.current;
    if (!a) return;
    setDuration(a.duration || 0);
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
  };

  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onEnded = () => setPlaying(false);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setCurrentTime(t);
  };

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex w-full items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E5EEF8] text-[#1B263A] hover:bg-white"
        aria-label={playing ? 'Pausar áudio' : 'Reproduzir áudio'}
        title={playing ? 'Pausar' : 'Reproduzir'}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[hsl(var(--primary))]"
          />
          <span className="text-[11px] text-[#6c7a96] whitespace-nowrap">
            {fmt(currentTime)} / {fmt(duration)}
          </span>
        </div>
        <div className="text-xs text-[#1B263A] truncate">
          {fileName}
          {sizeLabel ? ` • ${sizeLabel}` : ''}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}

export interface ConteudoNovoAtendimentoProps {
  onSucess?: (chatId: string) => void;
  onCancel?: () => void;
  onError?: () => void;
  clienteId?: string;
  chatId?: string;
  atendimentoId?: string | null;
  prefillNome?: string;
  prefillWhatsapp?: string;
}

export function ConteudoNovoChat(props: ConteudoNovoAtendimentoProps) {
  const router = useRouter();
  const api = new AppServices();
  const [carregandoIntegracao, setCarregandoIntegracao] = useState<boolean>(true);
  const [integracaoDisponivel, setIntegracaoDisponivel] = useState<boolean>(true);
  const [name, setNome] = useState<string>(props.prefillNome || '');
  const [whatsapp, setWhatsapp] = useState<string>(props.prefillWhatsapp || '');
  const [typeCustomer, setTipoCliente] = useState<string>('customer');
  const [clienteId, setClienteId] = useState<string | undefined>(props.clienteId);
  const [chat, setChat] = useState<{
    customer: { id: string; name: string; whatsapp: string } | null;
    temporaryCustomer: { id: string; name: string; whatsapp: string } | null;
  }>();
  const [whatsappError, setWhatsappError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [message, setMensagem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [verificado, setVerificado] = useState<boolean>(false);
  const [bloqueado, setBloqueado] = useState<boolean>(false);
  const [validandoWhatsapp, setValidandoWhatsapp] = useState<boolean>(false);

  // Anexos
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const previewUrls = useMemo(
    () => selectedFiles.map((f) => URL.createObjectURL(f)),
    [selectedFiles],
  );
  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);
  const fileCards = useMemo(
    () => selectedFiles.map((f, i) => ({ file: f, url: previewUrls[i], index: i })),
    [selectedFiles, previewUrls],
  );

  const filesByType = useMemo(() => {
    const g = {
      image: [] as { file: File; url: string; index: number }[],
      video: [] as { file: File; url: string; index: number }[],
      audio: [] as { file: File; url: string; index: number }[],
      pdf: [] as { file: File; url: string; index: number }[],
      doc: [] as { file: File; url: string; index: number }[],
      other: [] as { file: File; url: string; index: number }[],
    };
    fileCards.forEach((it) => {
      const t = it.file.type;
      if (t.startsWith('image/')) g.image.push(it);
      else if (t.startsWith('video/')) g.video.push(it);
      else if (t.startsWith('audio/')) g.audio.push(it);
      else if (t === 'application/pdf') g.pdf.push(it);
      else if (
        t === 'application/msword' ||
        t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        t === 'application/vnd.ms-excel' ||
        t === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
        g.doc.push(it);
      else g.other.push(it);
    });
    return g;
  }, [fileCards]);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Controle da modal de mensagens automáticas
  const [showMensagensPadrao, setShowMensagensPadrao] = useState<boolean>(false);

  const QTD_MAX_SIZE_ATTACHMENT = 5 * 1024 * 1024; // 5MB

  const isMimeAllowedForWhatsapp = useCallback((mime: string): boolean => {
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
  }, []);

  const formatarNumero = (number: string) => {
    return number.replace(/[^0-9]/g, '');
  };

  const fetchData = async () => {
    if (props.prefillWhatsapp) {
      const number = formatarNumero(props.prefillWhatsapp || '');
      setWhatsapp(number);
      checarNumeroWhatsapp(number);
    }

    if (props.prefillNome) {
      setNome(props.prefillNome);
    }

    if (props.chatId) {
      const [data, error] = await api.chat.getChat(props.chatId);
      if (error || !data) {
        setWhatsappError('Erro ao carregar dados');
        if (props.onError) {
          props.onError();
        }
        return;
      }

      setLoading(false);
      setChat(data as any);

      if (data.customer) {
        setNome(data.customer.name);
        const number = formatarNumero(data.customer.whatsapp || '');
        setWhatsapp(number);
        checarNumeroWhatsapp(number);
        setTipoCliente('customer');
        setClienteId(data.customer.id);
      }

      if (data.temporaryCustomer) {
        setNome(data.temporaryCustomer.name || '');
        const number = formatarNumero(data.temporaryCustomer.whatsapp || '');
        setWhatsapp(number);
        checarNumeroWhatsapp(number);
        setTipoCliente('temporary');
        setClienteId(data.temporaryCustomer.id);
      }
    }

    if (props.atendimentoId) {
      const [data, error] = await api.deal.get(props.atendimentoId);
      if (error || !data) {
        setWhatsappError('Erro ao carregar dados');
        if (props.onError) {
          props.onError();
        }
        return;
      }

      setLoading(false);

      if (data.customer) {
        setNome(data.customer.name);
        const number = parseCodigoPais(data.customer.whatsapp || '');
        setWhatsapp(number);
        checarNumeroWhatsapp(number);
        setTipoCliente('customer');
        setClienteId(data.customerId);
      } else if (data.temporaryCustomer) {
        setNome(data.temporaryCustomer.name || '');
        const number = parseCodigoPais(data.temporaryCustomer.whatsapp || '');
        setWhatsapp(number);
        checarNumeroWhatsapp(number);
        setTipoCliente('temporary');
        setClienteId(data.temporaryCustomer?.id);
      }

      if (data.chats && data.chats.length > 0) {
        const chatWhatsJaExiste = data.chats.find((c) => c.channel === 'whatsapp');
        if (chatWhatsJaExiste) {
          setBloqueado(true);
        }
      }
    }

    const [response, error] = await api.integrations.list();
    if (error) {
      return toast.error(error.message);
    }
    setCarregandoIntegracao(false);
    const whatsappIntegracao = response.statusIntegrations.find(
      (i: any) => i.channel === 'whatsapp',
    );
    setIntegracaoDisponivel(whatsappIntegracao && whatsappIntegracao.status === 'ok');
  };

  const checarNumeroWhatsapp = useCallback(async (number: string) => {
    const whatsapp = formatarNumero(number);

    if (!whatsapp || whatsapp.length < 10) {
      setWhatsappError('Número muito curto');
      setVerificado(false);
      return;
    }

    if (whatsapp.length > 15) {
      setWhatsappError('Número muito longo');
      setVerificado(false);
      return;
    }

    setValidandoWhatsapp(true);
    setWhatsappError(undefined);
    setVerificado(false);

    try {
      const [data, error] = await api.chat.verifyWhatsapp(whatsapp);

      if (error) {
        setWhatsappError(error.message || 'Erro ao verificar WhatsApp');
        return;
      }

      if (!data) {
        setWhatsappError('Resposta inválida do servidor');
        return;
      }

      if (data.exists && data.number) {
        setVerificado(true);
        setWhatsapp(data.number);
        setWhatsappError(undefined);
      } else {
        setWhatsappError('Número não encontrado no WhatsApp');
      }
    } catch (err) {
      setWhatsappError('Falha na conexão');
    } finally {
      setValidandoWhatsapp(false);
    }
  }, []);

  const handleWhatsappChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = formatarNumero(e.target.value);
    setWhatsapp(v);
    setVerificado(false);
    setWhatsappError(undefined);
  }, []);

  useEffect(() => {
    if (!whatsapp) return;

    const timer = setTimeout(() => {
      checarNumeroWhatsapp(whatsapp);
    }, 800);

    return () => clearTimeout(timer);
  }, [whatsapp, checarNumeroWhatsapp]);

  // Handlers de anexos
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);

      const validated: File[] = [];
      for (const f of list) {
        if (f.size > QTD_MAX_SIZE_ATTACHMENT) {
          toast.error('Arquivo muito grande. O limite é de 5 MB.');
          continue;
        }
        if (!isMimeAllowedForWhatsapp(f.type)) {
          toast.error('Tipo de arquivo não permitido para WhatsApp.');
          continue;
        }
        validated.push(f);
      }

      if (validated.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validated]);
      }
    },
    [isMimeAllowedForWhatsapp],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        addFiles(files);
        // limpar para permitir adicionar o mesmo arquivo novamente, se necessário
        e.target.value = '';
      }
    },
    [addFiles],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.files;
      if (items && items.length > 0) {
        addFiles(items);
      }
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (!typeCustomer || !whatsapp || !verificado) {
      if (!whatsapp) setWhatsappError('WhatsApp é obrigatório');
      if (whatsapp && !verificado) setWhatsappError('Número não verificado');
      return;
    }
    let idClienteParaEnviar: string | undefined;

    if (clienteId) {
      idClienteParaEnviar = clienteId;
    } else if (props.clienteId) {
      idClienteParaEnviar = props.clienteId;
    } else if (typeCustomer === 'customer' && chat?.customer?.id) {
      idClienteParaEnviar = chat.customer.id;
    } else if (typeCustomer === 'temporary' && chat?.temporaryCustomer?.id) {
      idClienteParaEnviar = chat.temporaryCustomer.id;
    }

    setLoading(true);

    // 1) Criar o chat com a mensagem de texto (se houver)
    const [newChat, error] = await api.chat.newChat(
      {
        customerId: idClienteParaEnviar ?? '',
        typeCustomer: typeCustomer as 'customer' | 'temporary',
        name: name || '',
      },
      {
        recipient: whatsapp,
        message: message || '',
        channel: 'whatsapp',
      },
    );

    if (error || !newChat) {
      setFormError('Erro ao criar conversa');
      setLoading(false);
      return;
    }

    // 2) Vincular ao atendimento, se necessário
    if (props.atendimentoId) {
      const [data, error] = await api.chat.updateDeal({
        chatId: newChat.chatId,
        dealId: props.atendimentoId,
      });
      if (error || !data) {
        setFormError('Erro ao vincular conversa ao atendimento');
        setLoading(false);
        return;
      }
    }

    // 3) Enviar anexos (cada um em uma mensagem separada)
    for (const f of selectedFiles) {
      try {
        const fileToSend = f.type.startsWith('image/') ? await convertImageToJpeg(f) : f;
        const [attachment, errAnexo] = await api.chat.generateAttachment(
          newChat.chatId,
          fileToSend,
        );
        if (errAnexo || !attachment) {
          toast.error('Falha ao processar um dos arquivos');
          continue;
        }

        await api.chat.sendMessageChat(newChat.chatId, {
          recipient: whatsapp,
          message: '',
          attachmentUrl: attachment.src,
          attachmentType: attachment.mimetype,
          channel: 'whatsapp',
        });
      } catch (e) {
        console.error(e);
        toast.error('Falha ao enviar um dos arquivos');
      }
    }

    if (props.onSucess) {
      props.onSucess(newChat.chatId);
    }

    setLoading(false);
  };

  const parseCodigoPais = (number: string) => {
    const numeroFormatado = formatarNumero(number);
    const temCodigo = numeroFormatado.startsWith('55');
    if (temCodigo) {
      return numeroFormatado;
    } else {
      return `55${numeroFormatado}`;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (bloqueado) {
    return (
      <div>
        <div className="flex flex-col gap-5 pb-8">
          <button onClick={() => props.onCancel && props.onCancel()} className="self-end">
            <IconX />
          </button>
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
                Nova conversa de WhatsApp
              </h2>
            </div>
          </div>

          <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
            <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <NoData label="Já existe uma conversa de Whatsapp para este atendimento" />
        </div>
      </div>
    );
  }

  if (carregandoIntegracao) {
    return (
      <div>
        <div className="flex flex-col gap-5 pb-8">
          <button onClick={() => props.onCancel && props.onCancel()} className="self-end">
            <IconX />
          </button>
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
                Nova conversa de WhatsApp
              </h2>
            </div>
          </div>

          <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
            <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <LoadingGlobal />
        </div>
      </div>
    );
  }

  if (!carregandoIntegracao && !integracaoDisponivel) {
    return (
      <div>
        <div className="flex flex-col gap-5 pb-8">
          <button onClick={() => props.onCancel && props.onCancel()} className="self-end">
            <IconX />
          </button>
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
                Nova conversa de WhatsApp
              </h2>
            </div>
          </div>

          <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
            <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <NoData label="Ops! A integração com o WhatsApp não está disponível" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5 pb-8">
        <button onClick={() => props.onCancel && props.onCancel()} className="self-end">
          <IconX />
        </button>
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
              Nova conversa de WhatsApp
            </h2>
          </div>
        </div>

        <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
          <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-[#1B263A] text-lg ">Dados do contato</h3>

        <Input
          label="Nome do contato"
          value={name}
          onChange={(e) => setNome(e.target.value)}
          placeholder={'Insira um nome'}
          disabled={loading}
        />

        <div className="relative">
          <Input
            label="Whatsapp"
            placeholder="Ex: 11999999999"
            value={whatsapp}
            onChange={handleWhatsappChange}
            disabled={loading || validandoWhatsapp}
          />

          <div className="absolute bottom-[0.075rem] right-2 transform -translate-y-1/2">
            {validandoWhatsapp && (
              <div className="text-blue-600 animate-spin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </div>
            )}

            {!validandoWhatsapp && verificado && (
              <div className="text-green-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            )}

            {!validandoWhatsapp &&
              !verificado &&
              whatsapp &&
              whatsapp.length >= 10 &&
              whatsappError && (
                <div className="text-red-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
              )}
          </div>
        </div>

        {whatsappError && (
          <p className="text-red-500 font-semibold text-xs pb-2">{whatsappError}</p>
        )}
      </div>

      <div className="flex flex-col pt-6">
        <h3 className="font-semibold text-[#1B263A] text-lg pb-2">Mensagem</h3>

        {/* Área de drag & drop e colar */}
        <div
          className={`relative ${dragOver ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            className="resize-none w-full h-40 p-4 pb-12 text-sm rounded-md bg-white border border-[#DDE6F2] disabled:opacity-50 disabled:cursor-not-allowed focus:border-[hsl(var(--primary))] focus:ring-transparent focus:ring-1 focus:outline-none"
            placeholder="Digite sua mensagem ou arraste/cole arquivos aqui"
            value={message}
            onChange={(e) => setMensagem(e.target.value)}
            onPaste={handlePaste}
            disabled={loading || !verificado}
          ></textarea>

          {/* Pré-visualização de anexos selecionados */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 max-h-48 w-full overflow-y-auto">
              <div className="flex flex-col gap-2 pr-2">
                {(['image', 'video', 'audio', 'pdf', 'doc', 'other'] as const).map((key) => {
                  const items = filesByType[key];
                  if (items.length === 0) return null;
                  const label =
                    key === 'image'
                      ? 'Imagens'
                      : key === 'video'
                        ? 'Vídeos'
                        : key === 'audio'
                          ? 'Áudios'
                          : key === 'pdf'
                            ? 'PDFs'
                            : key === 'doc'
                              ? 'Documentos'
                              : 'Outros';
                  return (
                    <div key={key} className="w-full flex flex-col gap-2">
                      <div className="text-[12px] text-[#6c7a96] font-medium px-1">
                        {label} ({items.length})
                      </div>
                      {items.map(({ file, url, index }) => {
                        const sizeKb = file.size / 1024;
                        const sizeLabel =
                          sizeKb >= 1024
                            ? `${(sizeKb / 1024).toFixed(1)} MB`
                            : `${Math.round(sizeKb)} KB`;
                        const isAudio = key === 'audio';
                        if (isAudio) {
                          return (
                            <div
                              key={index}
                              className="flex w-full items-center gap-3 rounded-xl border border-[#E5EEF8] bg-white px-3 py-2 shadow-sm hover:shadow transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <MiniAudioPlayer
                                  src={url}
                                  fileName={file.name}
                                  sizeLabel={sizeLabel}
                                />
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                aria-label="Remover anexo"
                                type="button"
                                className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md border border-[#E5EEF8] text-[#1B263A] hover:bg-[#F8FAFC]"
                                title="Remover"
                              >
                                ×
                              </button>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={index}
                            className="flex w-full items-center gap-3 rounded-xl border border-[#E5EEF8] bg-white px-3 py-2 shadow-sm hover:shadow transition-all"
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden">
                              {key === 'image' && (
                                <img src={url} alt={file.name} className="w-10 h-10 object-cover" />
                              )}
                              {key === 'video' && (
                                <video src={url} className="w-10 h-10" controls muted />
                              )}
                              {key === 'pdf' && (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="text-[hsl(var(--primary))]"
                                  fill="currentColor"
                                >
                                  <path
                                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                                    opacity=".2"
                                  />
                                  <path d="M14 2v6h6M8 13h2a2 2 0 0 1 0 4H8v-4zm5 0h1.5a1.5 1.5 0 0 1 0 3H13v-3zm-8 0h1v4H5v-4z" />
                                </svg>
                              )}
                              {key !== 'image' && key !== 'video' && key !== 'pdf' && (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="text-[#6c7a96]"
                                  fill="currentColor"
                                >
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                </svg>
                              )}
                            </div>

                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col flex-1 min-w-0 max-w-full"
                            >
                              <span className="text-sm font-semibold text-[#1B263A] truncate">
                                {file.name}
                              </span>
                              <span className="text-[11px] text-[#6c7a96]">{sizeLabel}</span>
                            </a>

                            <button
                              onClick={() => removeFile(index)}
                              aria-label="Remover anexo"
                              type="button"
                              className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md border border-[#E5EEF8] text-[#1B263A] hover:bg-[#F8FAFC]"
                              title="Remover"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Botão para adicionar mais arquivos */}
                <button
                  onClick={() => inputFileRef.current?.click()}
                  disabled={loading || !verificado}
                  type="button"
                  title="Adicionar anexos"
                  className="flex-none inline-flex items-center justify-center w-12 h-12 rounded-xl border border-dashed border-[#E5EEF8] bg-white text-[#6c7a96] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {formError && <p className="text-red-500 font-semibold text-xs py-2">{formError}</p>}

          {/* Ações */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
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
                          setMensagem((prev) => {
                            if (!prev) return content;
                            const sep = prev.endsWith('\n') ? '' : '\n';
                            return prev + sep + content;
                          });
                          setShowMensagensPadrao(false);
                        }}
                        api={api}
                        className="w-full max-h-[60vh] shadow-none border-transparent"
                      />
                    </div>
                  </div>
                </CenterModal>
              )}

              {/* Botão enviar anexo (selecionar arquivos) */}
              <input
                ref={inputFileRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
              <button
                onClick={() => inputFileRef.current?.click()}
                disabled={loading || !verificado}
                className="bg-[#DDE6F2] hover:bg-[hsl(var(--secondary))] duration-300 ease-in-out h-10 aspect-square group flex justify-center items-center p-2 rounded-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adicionar anexos"
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Gravador de áudio */}
              <GravadorMp3
                inputFileRef={inputFileRef}
                onRecordStart={() => {}}
                onRecordStop={() => {}}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => props.onCancel && props.onCancel()}
                disabled={loading}
                className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border px-3
                            border-[hsl(var(--secondary))] text-[hsl(var(--secondary))] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !verificado}
                aria-busy={loading}
                className="w-full bg-[hsl(var(--secondary))] rounded-[0.5rem] h-10 px-3 text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="31.416"
                        strokeDashoffset="15.708"
                      />
                    </svg>
                    <span className="hidden md:block">Enviando...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden md:block">Enviar</span>
                    <IconEnviar />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
