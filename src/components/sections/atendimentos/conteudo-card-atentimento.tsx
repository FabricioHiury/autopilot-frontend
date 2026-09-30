"use client"
import AvatarCanal from "@/components/commons/avatar-canal"
import IconEditar from "./icons/icon-editar"
import AvatarUser from "@/components/commons/avatar-user"
import IconCheck from "@/components/icons/icon-check"
import IconDescricao from "./icons/icon-descricao"
import IconComentarios from "./icons/icon-comentarios"
import IconEnviar from "../../icons/icon-enviar"
import IconEmail from "./icons/icon-email"
import IconTelefoneFill from "./icons/icon-telefone-fill"
import CenterModal from "@/components/commons/modais/center-modal"
import ConteudoAlterarStatus from "./conteudo-alterar-status"
import Link from "next/link"
import UploadArquivosAtandimento from "./upload-arquivos"
import CardTarefas from "./card-tarefas"
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal"
import toast from "react-hot-toast"
import Spinner from "@/components/loading/Spinner"
import IconX from "@/components/icons/icon-x"
import NoData from "@/components/commons/estados/NoData"
import IconMais from "./icons/icon-mais"
import CriarVisitaMini from "@/components/commons/modais/criar-visita-mini"
import SelectComLabel from "@/components/commons/inputs/select-com-label"
import IconTag from "@/components/icons/icon-tag"
import OriginIcon from "@/components/icons/origin"
import { AlertDialog } from "@/components/commons/modais/alert-dialog"
import { SelectEtapa } from "./select-etapa"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { STATUS_ATENDIMENTO, STATUS_ATENDIMENTO_COLOR, STATUS_ATENDIMENTO_HISTORICO, STATUS_ATENDIMENTO_LABEL } from "@/utils/types/status-atentimento-enum"
import { SectionTitle } from "./section-title"
import { Comentarios } from "./comentarios"
import { ApiApp } from "@/lib/api-app"
import { AtendimentoCompletoType } from "@/utils/types/atentimento-lista-type"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ComentarioType } from "@/lib/api-response-types"
import { useAppAuth } from "@/contexts/auth-app-context"
import { profileImageUrl } from "@/lib/profile.utils"
import { VisitaType } from "@/utils/types/visita-type"
import { ComboboxSelectPerson, SelectPersonItemInterface } from "@/components/commons/inputs/combobox-select-person"
import { SelectChat } from "./select-chat"
import { CompartilharAtendimento } from "./compartilhar-atendimento"
import { maskCPF } from "@/utils/classes/format/maskCpf";
import { maskCelular } from "@/utils/classes/format/maskCelular";
import { maskCNPJ } from "@/utils/classes/format/maskCnpj";
import { maskCEP } from "@/utils/classes/format/maskCep";
import { fetchAddressFromCep } from "@/utils/classes/cep/fetchAddressFromCep";
import { useDropdownManager } from "@/hooks/use-dropdown-manager";
import { TIPO_EVENTO_LOG } from "@/utils/types/log-evento";
import { optionsAtendimento } from "@/lib/atendimento-schema"
import { IconDots } from "@/components/icons/icon-dots"
import { ChevronRightIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/class-name.utils"
import { EditIcon } from "lucide-react"

export default function ConteudoCardAtendimento({ idAtendimento }: { idAtendimento: string }) {
    const api = new ApiApp()
    const usuario = useAppAuth().getUser()
    const { isOpen, toggleDropdown } = useDropdownManager(`card-${idAtendimento}`)

    const [nomeAtentimento, setNomeAtentimento] = useState<string>('Fernando Rocha')
    const [editarNomeAtend, setEditarNomeAtend] = useState<boolean>(false)
    const [etapa, setEtapa] = useState<STATUS_ATENDIMENTO>()
    const [descricao, setDescricao] = useState<string>(`Cliente demonstrou interesse em uma Range Roger e explicou que tem interesse em trocar seu veículo com adição de pagamento à vista. Deseja também visitar a loja para ver outros modelos que possam interessar.`)
    const [editarDescricao, setEditarDescricao] = useState<boolean>(false)
    const [adicionarComentario, setAdicionarComentario] = useState<boolean>(false)
    const [mudarEtapa, setMudarEtapa] = useState<boolean>(false)
    const [novaEtapa, setNovaEtapa] = useState<STATUS_ATENDIMENTO | null>(null)
    const [atendimento, setAtendimento] = useState<AtendimentoCompletoType>()
    const [comentarios, setComentarios] = useState<ComentarioType[]>([])
    const [novoComentario, setNovoComentario] = useState<string>('')
    const [loadingComentarios, setLoadingComentarios] = useState<boolean>(false)
    const atendimentoInputRef = useRef<HTMLInputElement>(null)
    const descricaoInputRef = useRef<HTMLTextAreaElement>(null)
    const comentarioInputRef = useRef<HTMLTextAreaElement>(null)
    const [visitas, setVisitas] = useState<VisitaType[]>([])
    const [editarCliente, setEditarCliente] = useState<boolean>(false)
    const [selectedCliente, setSelectedCliente] = useState<SelectPersonItemInterface | undefined>();
    const [cadastrarCliente, setCadastrarCliente] = useState<boolean>(false)
    const [alertDialog, setAlertDialog] = useState<{ message: string; variant: "info" | "error" | "success" | "warning" } | null>(null)
    const [novoCliente, setNovoCliente] = useState({
        nome: '',
        tipoPessoa: 'fisica' as 'fisica' | 'juridica',
        documentoFiscal: '',
        rg: '',
        estrangeiro: false,
        genero: 'outro' as 'masculino' | 'feminino' | 'outro',
        dataNascimento: format(new Date(), 'yyyy-MM-dd'),
        telefone: '',
        whatsapp: '',
        email: '',
        observacoes: '',
        cep: '',
        uf: '',
        municipio: '',
        endereco: '',
        bairro: '',
        numero: '',
        complemento: ''
    });

    const [loadingCadastro, setLoadingCadastro] = useState<boolean>(false)
    type AtendimentoLog = {
        id: string;
        idAtendimento: string;
        idUsuario: string;
        tipoEvento: string;
        mensagem: string;
        dadosAntigos?: any;
        dadosNovos?: any;
        criadoEm: string;
        usuario?: { id: string; nome: string; urlFoto?: string } | null;
    };

    const [logs, setLogs] = useState<AtendimentoLog[]>([])
    const [logsMeta, setLogsMeta] = useState({ total: 0, pagina: 1, quantidade: 8, totalPaginas: 0 })
    const [mostrarTodosHistorico, setMostrarTodosHistorico] = useState<boolean>(false)
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

    // === Origem & Tags state ===
    const [editOrigem, setEditOrigem] = useState<boolean>(false)
    const [origem, setOrigem] = useState<string | undefined>(undefined)
    const [savingOrigem, setSavingOrigem] = useState<boolean>(false)

    type TagItemUI = { id?: string; name: string; color?: string; description?: string }
    const [tagsDisponiveis, setTagsDisponiveis] = useState<TagItemUI[]>([])
    const [tagsSelecionadas, setTagsSelecionadas] = useState<TagItemUI[]>([])

    const [tagPickerOpen, setTagPickerOpen] = useState<boolean>(false)
    const [savingTagId, setSavingTagId] = useState<string | null>(null)
    const [removingTagId, setRemovingTagId] = useState<string | null>(null)

    const [optionsOpen, setOptionsOpen] = useState<boolean>(false)
    const [showStatusSubmenu, setShowStatusSubmenu] = useState<boolean>(false)
    const [tagSubmenuOpen, setTagSubmenuOpen] = useState<boolean>(false)
    const [origemSubmenuOpen, setOrigemSubmenuOpen] = useState<boolean>(false)
    const optionsRef = useRef<HTMLDivElement | null>(null)

    const optionsButtonRef = useRef<HTMLButtonElement>(null);
    const tagButtonRef = useRef<HTMLButtonElement>(null);
    const origemButtonRef = useRef<HTMLButtonElement>(null);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [submenuSide, setSubmenuSide] = useState<'right' | 'left'>('right');
    const [optionsPosition, setOptionsPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [submenuOffsets, setSubmenuOffsets] = useState<{ tag: number; origem: number }>({ tag: 0, origem: 0 });

    const syncSubmenuOffsets = useCallback(() => {
        if (!optionsRef.current) return;
        const menuRect = optionsRef.current.getBoundingClientRect();
        setSubmenuOffsets((prev) => ({
            tag: tagButtonRef.current ? tagButtonRef.current.getBoundingClientRect().top - menuRect.top : prev.tag,
            origem: origemButtonRef.current ? origemButtonRef.current.getBoundingClientRect().top - menuRect.top : prev.origem
        }));
    }, []);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            const target = e.target as Node
            const clickedMenu = optionsRef.current && optionsRef.current.contains(target)
            const clickedBtn = optionsButtonRef.current && optionsButtonRef.current.contains(target)
            if (!clickedMenu && !clickedBtn) {
                setOptionsOpen(false)
                setShowStatusSubmenu(false)
                setTagSubmenuOpen(false)
                setOrigemSubmenuOpen(false)
            }
        }
        if (optionsOpen) {
            document.addEventListener('mousedown', onClickOutside)
            return () => document.removeEventListener('mousedown', onClickOutside)
        }
    }, [optionsOpen])



    const placeMenu = useCallback(() => {
        if (!optionsOpen || !optionsButtonRef.current || !optionsRef.current) return;

        const btn = optionsButtonRef.current.getBoundingClientRect();
        const menuEl = optionsRef.current;

        const viewportScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const viewportScrollX = window.scrollX || document.documentElement.scrollLeft || 0;
        const isMobile = window.innerWidth < 768;
        const buttonGap = isMobile ? 8 : 2;
        const viewportPadding = 8;

        let top = btn.bottom + viewportScrollY + buttonGap;
        let left = btn.left + viewportScrollX;

        menuEl.style.top = `${top}px`;
        menuEl.style.left = "84px";

        menuEl.style.maxHeight = "";

        const rect = menuEl.getBoundingClientRect();
        const mh = rect.height;
        const mw = rect.width;

        const viewportTop = viewportScrollY + viewportPadding;
        const viewportBottom = viewportScrollY + window.innerHeight - viewportPadding;

        if (top + mh > viewportBottom) {

            if (btn.top + viewportScrollY - buttonGap >= mh + viewportTop) {
                top = btn.top + viewportScrollY - mh - buttonGap;
                setOpenUpwards(true);
            } else {

                top = Math.max(viewportTop, viewportBottom - mh);
                setOpenUpwards(false);
            }
        } else {
            setOpenUpwards(false);
        }

        const viewportLeft = viewportScrollX + viewportPadding;
        const viewportRight = viewportScrollX + window.innerWidth - viewportPadding;

        if (left + mw > viewportRight) {
            left = Math.max(btn.right + viewportScrollX - mw, viewportLeft);
        }
        if (left < viewportLeft) left = viewportLeft;

        menuEl.style.top = `${top}px`;
        menuEl.style.left = `${left}px`;
        const availableHeight = viewportBottom - viewportTop;
        const desiredMaxHeight = isMobile ? Math.min(availableHeight, Math.round(window.innerHeight * 0.6)) : availableHeight;
        menuEl.style.maxHeight = `${desiredMaxHeight}px`;
        menuEl.style.overflowY = isMobile ? "auto" : (tagSubmenuOpen || origemSubmenuOpen ? "visible" : "auto");
        setOptionsPosition({ top, left });

        const r = menuEl.getBoundingClientRect();
        const rightSpace = window.innerWidth - r.right;
        setSubmenuSide(rightSpace < 260 ? 'left' : 'right');
    }, [optionsOpen, tagSubmenuOpen, origemSubmenuOpen]);

    useEffect(() => {
        if (!optionsOpen) return;
        placeMenu();
        syncSubmenuOffsets();
        const handler = () => {
            placeMenu();
            syncSubmenuOffsets();
        };
        window.addEventListener('resize', handler);
        window.addEventListener('scroll', handler, true);
        return () => {
            window.removeEventListener('resize', handler);
            window.removeEventListener('scroll', handler, true);
        };
    }, [optionsOpen, placeMenu, syncSubmenuOffsets]);

    const hexToRGBA = (hex: string, alpha: number) => {
        try {
            const normalized = hex.replace('#', '')
            const fullHex = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized
            const r = parseInt(fullHex.substring(0, 2), 16)
            const g = parseInt(fullHex.substring(2, 4), 16)
            const b = parseInt(fullHex.substring(4, 6), 16)
            const a = Math.min(Math.max(alpha, 0), 1)
            return `rgba(${r}, ${g}, ${b}, ${a})`
        } catch {
            return hex
        }
    }

    const fetchTagsDisponiveis = async () => {
        const [data, error] = await api.atendimento.buscarTags()
        if (error) {
            toast.error(error.message)
            return
        }
        const normalized = (data || []).map((t: any) => ({ id: t.id, name: t.name ?? t.nome, color: t.color ?? t.cor, description: t.description ?? t.descricao }))
        setTagsDisponiveis(normalized)
    }

    const handleSalvarOrigem = async () => {
        if (!origem || !atendimento) { setEditOrigem(false); return }
        setSavingOrigem(true)
        const responsaveisIds = (atendimento.responsaveis || []).map(r => r.idColaborador).filter(Boolean)
        const currentTagIds = (tagsSelecionadas || []).map(t => t.id!).filter(Boolean) as string[]
        const [, err] = await api.atendimento.editarOrigem(atendimento.id, origem, responsaveisIds.length ? responsaveisIds : undefined, currentTagIds.length ? currentTagIds : undefined)
        setSavingOrigem(false)
        if (err) {
            toast.error(err.message)
            return
        }
        setAtendimento(prev => prev ? { ...prev, origemAtendimento: origem as any } : prev)
        setEditOrigem(false)
        toast.success('Origem atualizada')
    }

    const handleSalvarOrigemSelecionada = async (novaOrigem: string) => {
        if (!atendimento) return
        setSavingOrigem(true)
        const responsaveisIds = (atendimento.responsaveis || []).map(r => r.idColaborador).filter(Boolean)
        const currentTagIds = (tagsSelecionadas || []).map(t => t.id!).filter(Boolean) as string[]
        const [, err] = await api.atendimento.editarOrigem(atendimento.id, novaOrigem, responsaveisIds.length ? responsaveisIds : undefined, currentTagIds.length ? currentTagIds : undefined)
        setSavingOrigem(false)
        if (err) {
            toast.error(err.message)
            return
        }
        setAtendimento(prev => prev ? { ...prev, origemAtendimento: novaOrigem as any } : prev)
        toast.success('Origem atualizada')
    }

    const handleCancelarOrigem = () => {
        setOrigem(atendimento?.origemAtendimento)
        setEditOrigem(false)
    }

    const handleTagAdd = async (tagId?: string) => {
        if (!atendimento || !tagId) return
        setSavingTagId(tagId)
        try {
            const newIds = Array.from(new Set([...(tagsSelecionadas.map(t => t.id!).filter(Boolean) as string[]), tagId]))
            const responsaveisIds = (atendimento.responsaveis || []).map(r => r.idColaborador).filter(Boolean)
            const origemAtual = atendimento.origemAtendimento ?? origem
            const [, err] = await api.atendimento.vincularTag(atendimento.id, newIds, responsaveisIds.length ? responsaveisIds : [], origemAtual)
            if (err) {
                toast.error(err.message)
            } else {
                const selectedTag = tagsDisponiveis.find(t => t.id === tagId)
                if (selectedTag && !tagsSelecionadas.find(t => t.id === tagId)) {
                    setTagsSelecionadas(prev => [...prev, selectedTag])
                }
                toast.success('Etiqueta vinculada')
            }
        } catch (e) {
            toast.error('Erro ao vincular etiqueta')
        } finally {
            setSavingTagId(null)
            setTagPickerOpen(false)
        }
    }

    const handleTagRemove = async (tagId?: string) => {
        if (!atendimento || !tagId) return
        setRemovingTagId(tagId)
        try {
            const remaining = tagsSelecionadas.filter(t => t.id !== tagId)
            const remainingIds = remaining.map(t => t.id!).filter(Boolean) as string[]
            const responsaveisIds = (atendimento.responsaveis || []).map(r => r.idColaborador).filter(Boolean)
            const origemAtual = atendimento.origemAtendimento ?? origem
            const [, err] = await api.atendimento.vincularTag(atendimento.id, remainingIds, responsaveisIds.length ? responsaveisIds : [], origemAtual)
            if (err) {
                toast.error(err.message)
            } else {
                setTagsSelecionadas(remaining)
                toast.success('Etiqueta removida')
            }
        } catch (e) {
            toast.error('Erro ao remover etiqueta')
        } finally {
            setRemovingTagId(null)
        }
    }

    useEffect(() => {
        fetchTagsDisponiveis()
    }, [])

    useEffect(() => {
        if (!atendimento) return
        setOrigem(atendimento.origemAtendimento)
        const rawTags = (atendimento as any).tags ?? (atendimento as any).atendimentoTags ?? []
        if (Array.isArray(rawTags) && rawTags.length > 0) {
            const normalized = rawTags.map((t: any) => {
                const tag = t?.tag ?? t
                return {
                    id: tag?.id,
                    name: tag?.name ?? tag?.nome,
                    color: tag?.color ?? tag?.cor,
                    description: tag?.description ?? tag?.descricao
                }
            })
            setTagsSelecionadas(normalized)
        }
    }, [atendimento])

    const extractDigits = (value: string) => value.replace(/\D/g, "")
    const isFormValid = useMemo(() => {
        const hasNome = novoCliente.nome.trim().length > 0
        const isCpf = novoCliente.tipoPessoa === "fisica"
        const fiscalDigits = extractDigits(novoCliente.documentoFiscal)
        const hasDocumentoFiscal = isCpf ? fiscalDigits.length === 11 : fiscalDigits.length === 14
        const whatsappDigits = extractDigits(novoCliente.whatsapp)
        const hasWhatsapp = whatsappDigits.length === 11
        const cepDigits = extractDigits(novoCliente.cep)
        const hasCep = cepDigits.length === 8
        const hasUf = (novoCliente.uf || "").trim().length === 2
        const hasMunicipio = (novoCliente.municipio || "").trim().length > 0
        const hasEndereco = (novoCliente.endereco || "").trim().length > 0
        const hasBairro = (novoCliente.bairro || "").trim().length > 0
        const hasNumero = (novoCliente.numero || "").trim().length > 0

        return (
            hasNome &&
            hasDocumentoFiscal &&
            hasWhatsapp &&
            hasCep &&
            hasUf &&
            hasMunicipio &&
            hasEndereco &&
            hasBairro &&
            hasNumero
        )
    }, [novoCliente])

    const statusAtendimentos = Object.keys(STATUS_ATENDIMENTO).map((key) => {
        const chave = key as keyof typeof STATUS_ATENDIMENTO
        return {
            label: STATUS_ATENDIMENTO_LABEL[chave],
            value: STATUS_ATENDIMENTO[chave],
            color: STATUS_ATENDIMENTO_COLOR[chave]
        }
    })
    const [, ...statusAtendimentosValidos] = statusAtendimentos
    const [novaVisita, setNovaVisita] = useState<boolean>(false)

    const id = String(idAtendimento)

    const fetchAtendimento = async () => {
        const [data, error] = await api.atendimento.pegar(id)
        if (error || !data) {
            setAlertDialog({ message: 'Erro ao buscar atendimento', variant: 'error' })
            console.error('Erro ao buscar atendimento')
            return
        }
        setAtendimento(data)
        await listarHistoricoClienteAtendimento();

        if (data.cliente) {
            setSelectedCliente({
                id: data.cliente.id,
                name: data.cliente.nome,
                avatar: data.cliente.urlAvatar,
                metaData: []
            })
        }
    }

    const handleCadastrarCliente = async () => {
        if (!isFormValid) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }

        setLoadingCadastro(true)

        const userDataString = localStorage.getItem('usuario')
        let idLoja = null

        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                if (userData && userData.idLoja) {
                    idLoja = userData.idLoja
                }
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error)
            }
        }

        const [data, error] = await api.cliente.cadastrar({
            ...novoCliente,
            tipoPessoa: novoCliente.tipoPessoa as "fisica" | "juridica",
            genero: novoCliente.genero as "masculino" | "feminino" | "outro",
            dataNascimento: novoCliente.dataNascimento,
            cep: novoCliente.cep || '',
            uf: novoCliente.uf || '',
            municipio: novoCliente.municipio || '',
            endereco: novoCliente.endereco || '',
            bairro: novoCliente.bairro || '',
            numero: novoCliente.numero || ''
        })

        if (error || !data) {
            toast.error(error?.message || 'Erro ao cadastrar cliente')
            setLoadingCadastro(false)
            return
        }

        const novoClienteObj: SelectPersonItemInterface = {
            id: data.id,
            name: data.nome,
            avatar: data.urlAvatar,
            metaData: []
        }

        setSelectedCliente(novoClienteObj)

        const [updateData, updateError] = await api.atendimento.editarCliente(id, data.id)

        if (updateError || !updateData) {
            toast.error('Erro ao vincular cliente ao atendimento')
            setLoadingCadastro(false)
            return
        }

        toast.success('Cliente cadastrado e vinculado com sucesso')
        setCadastrarCliente(false)
        setLoadingCadastro(false)
        await fetchAtendimento()
        setEditarCliente(false)
    }

    const fetchComentarios = async () => {
        const [data, error] = await api.atendimento.comentarios(id, { pagina: 1, itensPagina: 1000 })
        if (error || !data) {
            setAlertDialog({ message: 'Erro ao buscar comentários', variant: 'error' })
            console.error('Erro ao buscar comentários')
            return
        }

        setComentarios(data.comentarios)
    }

    const fecthVisitas = async () => {
        const [data, error] = await api.atendimento.visitasListar(id);
        if (error || !data) {
            console.log(error);
            return;
        }
        setVisitas(data)
    }

    const handleToggleVisita = async (visitaId: string) => {
        const [data, error] = await api.atendimento.visitasAlterarStatus(id, visitaId);
        if (error || !data) {
            console.log(error);
            return;
        }

        setVisitas(prev => prev.map(visita => {
            if (visita.id === visitaId) {
                return {
                    ...visita,
                    concluida: true
                }
            }
            return visita
        }))

        toast.success('Visita concluída com sucesso')

        setTimeout(() => {
            fecthVisitas()
        }, 2000)
    }

    const handleDeletarVisita = async (visitaId: string) => {
        const [data, error] = await api.atendimento.visitasDeletar(id, visitaId);
        if (error || !data) {
            console.log(error);
            return;
        }
        fecthVisitas()
        toast.success('Visita deletada com sucesso')
    }

    const handleCancelar = () => {
        setMudarEtapa(false)

    }

    const handleEditarTitulo = async () => {
        setEditarNomeAtend(false)
        const [data, error] = await api.atendimento.editarTitulo({
            id: id,
            titulo: nomeAtentimento
        })
        if (error || !data) {
            toast.error('Erro ao editar título')
            return
        }
    }

    const handleEditarDescricao = async () => {
        setEditarDescricao(false)
        const [data, error] = await api.atendimento.editarDescricao({
            id: id,
            descricao: descricao
        })
        if (error || !data) {
            toast.error('Erro ao editar descrição')
            return
        }
    }

    const handleAdicionarComentario = async () => {
        if (!novoComentario) {
            toast.error('Comentário não pode estar vazio')
            return;
        }
        setLoadingComentarios(true)
        const tmp = novoComentario
        setNovoComentario('')
        const [data, error] = await api.atendimento.adicionarComentario({
            idAtendimento: id,
            comentario: tmp
        })
        if (error || !data) {
            toast.error('Erro ao adicionar comentário')
            return
        }
        setAdicionarComentario(false)
        await fetchComentarios()
        setLoadingComentarios(false)
    }

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedCep = maskCEP(e.target.value);
        setNovoCliente({ ...novoCliente, cep: maskedCep });

        if (maskedCep.length === 9) {
            toast.loading('Buscando endereço...', { id: 'cep-loading' });

            const addressData = await fetchAddressFromCep(maskedCep);

            toast.dismiss('cep-loading');

            if (addressData) {
                setNovoCliente({
                    ...novoCliente,
                    cep: maskedCep,
                    endereco: addressData.endereco,
                    bairro: addressData.bairro,
                    municipio: addressData.municipio,
                    uf: addressData.uf,
                });

                toast.success('Endereço encontrado!');
            } else {
                toast.error('CEP não encontrado');
            }
        }
    };

    const comentariosUsuarioUnicos = (comentarios: ComentarioType[]) => {
        const comentariosUnicos: ComentarioType[] = []
        comentarios.forEach(comentario => {
            if (!comentariosUnicos.find(c => c.idUsuario === comentario.idUsuario)) {
                comentariosUnicos.push(comentario)
            }
        })
        return comentariosUnicos
    }

    const pesquisarClientes = async (search: string): Promise<SelectPersonItemInterface[]> => {
        const [data, error] = await api.cliente.listar({
            pesquisa: search,
        });

        if (error || !data) {
            console.log(error);
            return [];
        }

        if (data.clientes) {
            return data.clientes.map(cliente => {
                return {
                    id: cliente.id,
                    name: cliente.nome,
                    avatar: cliente.urlAvatar,
                    metadata: []
                }
            })
        } else return [];

    }

    const handleEditarCliente = async (selected: SelectPersonItemInterface[]) => {
        setSelectedCliente(selected[0]);
        const [data, error] = await api.atendimento.editarCliente(id, selected[0].id);

        if (error || !data) {
            return;
        }

        await fetchAtendimento();
        setEditarCliente(false);
    }

    const listarHistoricoClienteAtendimento = async () => {
        const [data, error] = await api.atendimento.listarHistoricoCliente(id);
        if (!error && data) {
            setLogs(data.logs || []);
            setLogsMeta({
                total: data.total || (data.logs?.length || 0),
                pagina: 1,
                quantidade: data.quantidade || (data.logs?.length || 0),
                totalPaginas: 1
            });
        } else {
            setLogs([]);
            if (error) console.error('Erro ao listar logs do atendimento:', error);
        }
    }

    useEffect(() => {
        fetchAtendimento()
        fetchComentarios()
        fecthVisitas()
    }, [])

    useEffect(() => {
        if (!cadastrarCliente) return;
        const raw = atendimento?.clienteTemporario?.whatsapp || atendimento?.cliente?.whatsapp || "";
        let digits = raw.replace(/\D/g, "");
        if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
        if (digits.length > 11) digits = digits.slice(-11);
        setNovoCliente(prev => ({
            ...prev,
            nome: prev.nome || atendimento?.clienteTemporario?.nome || atendimento?.cliente?.nome || "",
            email: prev.email || atendimento?.clienteTemporario?.email || atendimento?.cliente?.email || "",
            whatsapp: prev.whatsapp || (digits ? maskCelular(digits) : prev.whatsapp),
            telefone: prev.telefone || (digits ? maskCelular(digits) : prev.telefone)
        }))
    }, [cadastrarCliente])

    useEffect(() => {
        if (atendimento) {
            setNomeAtentimento(atendimento.titulo)
            setEtapa(atendimento.status as STATUS_ATENDIMENTO)
            setDescricao(atendimento.descricaoAtendimento)
        }
    }, [atendimento])

    useEffect(() => {
        if (editarNomeAtend) {
            atendimentoInputRef.current?.focus()
        }
    }, [editarNomeAtend])

    useEffect(() => {
        if (editarDescricao) {
            descricaoInputRef.current?.focus()
        }
    }, [editarDescricao])

    useEffect(() => {
        if (adicionarComentario) {
            comentarioInputRef.current?.focus()
        }
    }, [adicionarComentario])


    if (!atendimento) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <LoadingGlobal />
            </div>
        )
    }

    return (
        <div className="bg-[#F2F4F7] pb-10 overflow-x-hidden">
            <div className="w-full h-[13.5rem] md:h-[14.5rem] bg-black bg-[url('/images/car-bg-atendimento.png')] bg-cover bg-center bg-no-repeat">
            </div>
            <div className="px-4 md:px-8 -mt-20 md:-mt-16">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-5 md:p-5 flex flex-col gap-4 w-full mx-auto max-w-[22rem] sm:max-w-[26rem] md:max-w-none">
                    <div className="flex flex-col md:flex-row md:justify-between  flex-wrap gap-4">
                        <div className="flex items-start gap-4 flex-wrap">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F2F4F7] rounded-full flex items-center justify-center">
                                <AvatarCanal
                                    canal={atendimento.origemAtendimento}
                                    size={1.5}
                                />
                            </div>

                            <div className="flex flex-1 items-start gap-4 min-w-0">
                                <div className="flex flex-col">
                                    {!editarNomeAtend ? (
                                        <h1 className="font-semibold text-lg sm:text-xl md:text-md leading-tight md:leading-snug text-slate-900 truncate flex-1">
                                            {nomeAtentimento}
                                        </h1>
                                    ) : (
                                        <Input
                                            value={nomeAtentimento}
                                            onChange={(e) => setNomeAtentimento(e.target.value)}
                                            ref={atendimentoInputRef}
                                            className="flex-1 text-lg sm:text-xl md:text-2xl leading-tight font-semibold border-slate-300 focus:ring-slate-500"
                                        />
                                    )}

                                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-[#485B80]">
                                        Atendimento iniciado em{" "}
                                        {format(new Date(atendimento.criadoEm), "dd 'de' MMMM yyyy", {
                                            locale: ptBR,
                                        })}
                                    </p>
                                </div>

                                {editarNomeAtend ? (
                                    <button
                                        onClick={handleEditarTitulo}
                                    >
                                        <IconCheck />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditarNomeAtend(true)}
                                    >
                                        <EditIcon color="#293856" size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* RESPONSÁVEIS + ETAPA */}
                        <div className="flex gap-2 md:gap-3 flex-wrap">
                            <div className="flex items-start gap-2 flex-col lg:flex-row lg:item-center flex-1">
                                <div className="flex -space-x-2 md:-space-x-3">
                                    {atendimento.responsaveis.map((r) => (
                                        <AvatarUser
                                            key={r.idColaborador}
                                            src={r.avatarUrl}
                                            name={r.nome}
                                            size={2}
                                            className="ring-2 ring-white shadow-sm"
                                        />
                                    ))}
                                </div>

                                {etapa && (
                                    <SelectEtapa
                                        options={statusAtendimentosValidos}
                                        value={etapa}
                                        onChange={(value) => {
                                            setNovaEtapa(value)
                                            setMudarEtapa(true)
                                        }}
                                        isOpen={isOpen('etapa')}
                                        className="w-full md:w-auto min-w-[12rem]"
                                        onToggle={() => toggleDropdown('etapa')}
                                    />
                                )}
                            </div>

                            {/* AÇÕES LATERAIS */}
                            <div className="flex items-end lg:items-start gap-2 md:gap-3 flex-wrap">
                                <CompartilharAtendimento
                                    idAtendimento={id}
                                    isOpen={isOpen("compartilhar")}
                                    onToggle={() => toggleDropdown("compartilhar")}
                                />

                                <SelectChat
                                    options={atendimento.chats.map((chat) => ({
                                        id: chat.id,
                                        canal: chat.canal,
                                    }))}
                                    idAtendimento={id}
                                    isOpen={isOpen("chat")}
                                    onToggle={() => toggleDropdown("chat")}
                                />

                                {/* Três pontos */}
                                <button
                                    ref={optionsButtonRef}
                                    className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition shadow-sm ring-1 ring-slate-200/50"
                                    onClick={() => {
                                        setOptionsOpen((p) => !p);
                                        setTagSubmenuOpen(false);
                                        setOrigemSubmenuOpen(false);
                                        setTimeout(() => {
                                            placeMenu();
                                            syncSubmenuOffsets();
                                        }, 0);
                                    }}
                                >
                                    <IconDots size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TAGS / STATUS */}
                    <div className="flex items-center flex-wrap gap-1 sm:gap-2 overflow-visible px-0 sm:px-5 pb-1">

                        {tagsSelecionadas.length === 0 && (
                            <span className="text-xs text-slate-400">Nenhuma etiqueta vinculada</span>
                        )}

                        {tagsSelecionadas.map((t) => (
                            <span
                                key={(t.id || t.name) + (t.color || "")}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[11px] md:text-xs font-semibold border shadow-sm shrink-0 snap-start"
                                style={{
                                    backgroundColor: t.color ? hexToRGBA(t.color, 0.18) : "#F3F4F6",
                                    borderColor: t.color || "#CBD5E1",
                                    color: t.color || "#334155",
                                }}
                            >
                                {t.name}
                                <button
                                    aria-label="Remover etiqueta"
                                    onClick={() => handleTagRemove(t.id)}
                                    className="ml-1 text-slate-600 hover:text-slate-900"
                                >
                                    <IconX size={12} />
                                </button>
                            </span>
                        ))}

                        <span className="inline-flex items-center gap-2 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md bg-slate-100 text-[11px] md:text-xs font-semibold text-slate-700 shrink-0 snap-start">
                            <AvatarCanal
                                canal={atendimento.origemAtendimento}
                                size={1.5}
                            />
                            <span>{atendimento.origemAtendimento}</span>
                        </span>

                        {statusChip(etapa)}
                    </div>

                    {/* EDIÇÃO DE ORIGEM */}
                    {editOrigem && (
                        <div className="flex items-center gap-3">
                            <SelectComLabel
                                value={origem}
                                label="Origem"
                                options={optionsAtendimento}
                                onChange={setOrigem}
                                className="w-full md:min-w-[14rem]"
                            />

                            <button
                                onClick={handleSalvarOrigem}
                                disabled={savingOrigem}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {savingOrigem ? (
                                    <Spinner color="white" width="16px" />
                                ) : (
                                    <>
                                        Salvar <IconCheck size={14} />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleCancelarOrigem}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {/* MENU DE OPÇÕES (três pontos) */}
                    {optionsOpen && (
                        <div
                            ref={optionsRef}
                            className={cn(
                                "fixed z-50 bg-white rounded-2xl shadow-2xl animate-in fade-in w-[calc(100vw-3.5rem)] max-w-[18rem] p-2 max-h-[200px] overflow-y-auto md:overflow-visible",
                                openUpwards ? "slide-in-from-bottom-2 origin-bottom" : "slide-in-from-top-2 origin-top",
                                "md:w-auto"
                            )}
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <div className="flex flex-col">
                                <button
                                    ref={tagButtonRef}
                                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                                    onClick={() => {
                                        if (!tagSubmenuOpen) {
                                            fetchTagsDisponiveis();
                                        }
                                        setTagSubmenuOpen((p) => !p);
                                        setOrigemSubmenuOpen(false);
                                        syncSubmenuOffsets();
                                        placeMenu();
                                    }}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <IconTag size={14} />
                                        <span>Vincular etiqueta</span>
                                    </span>
                                    <ChevronRightIcon
                                        className={cn(
                                            "w-4 h-4 text-slate-400 transition-transform",
                                            tagSubmenuOpen ? "-rotate-90" : "rotate-90 md:rotate-0"
                                        )}
                                    />
                                </button>

                                {/* ——— SUBMENU: ETIQUETAS ——— */}
                                {tagSubmenuOpen && (
                                    <div
                                        className={cn(
                                            "mt-2 w-full p-3 md:p-4 max-h-[60vh] rounded-xl md:shadow-md bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300/70 scrollbar-track-slate-100",
                                            "md:absolute md:mt-0 md:min-w-[240px]",
                                            submenuSide === "right"
                                                ? "md:left-full md:ml-2"
                                                : "md:right-full md:mr-2"
                                        )}
                                        style={{ top: submenuOffsets.tag }}
                                    >
                                        <div className="flex flex-col gap-1">
                                            {tagsDisponiveis.map((item) => (
                                                <button
                                                    key={(item.id || item.name) + (item.color || "")}
                                                    onClick={() => handleTagAdd(item.id)}
                                                    className="group flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors duration-150"
                                                >
                                                    <span
                                                        className="px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm group-hover:scale-[1.02] transition-transform"
                                                        style={{
                                                            backgroundColor: item.color
                                                                ? hexToRGBA(item.color, 0.18)
                                                                : "#E5E7EB",
                                                            color: item.color || "#485B80",
                                                        }}
                                                    >
                                                        {savingTagId === item.id ? "Salvando..." : item.name}
                                                    </span>

                                                    <span className="text-[12px] text-slate-500 truncate opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {item.description || ""}
                                                    </span>
                                                </button>
                                            ))}

                                            {tagsDisponiveis.length === 0 && (
                                                <span className="text-xs text-slate-400 px-3 py-4 text-center">
                                                    Nenhuma etiqueta disponível
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ——— OPÇÃO: Alterar origem ——— */}
                                <button
                                    ref={origemButtonRef}
                                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                                    onClick={() => {
                                        setOrigemSubmenuOpen((p) => !p);
                                        setTagSubmenuOpen(false);
                                        syncSubmenuOffsets();
                                        placeMenu();
                                    }}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <OriginIcon size={14} />
                                        <span>Alterar origem</span>
                                    </span>
                                    <ChevronRightIcon
                                        className={cn(
                                            "w-4 h-4 text-slate-400 transition-transform",
                                            origemSubmenuOpen ? "-rotate-90" : "rotate-90 md:rotate-0"
                                        )}
                                    />
                                </button>

                                {/* ——— SUBMENU: ORIGEM ——— */}
                                {origemSubmenuOpen && (
                                    <div
                                        className={cn(
                                            "mt-2 w-full rounded-xl bg-white md:shadow-md p-3 md:p-4 overflow-y-auto max-h-32 md:max-h-[calc(100vh-20rem)]",
                                            "md:absolute md:mt-0 md:min-w-[240px]",
                                            submenuSide === "right" ? "md:left-full md:ml-2" : "md:right-full md:mr-2"
                                        )}
                                        style={{ top: submenuOffsets.origem }}
                                    >
                                        <div className="flex flex-col">
                                            {optionsAtendimento.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        handleSalvarOrigemSelecionada(opt.value);
                                                        setOrigemSubmenuOpen(false);
                                                        setOptionsOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 rounded-lg capitalize"
                                                >
                                                    <AvatarCanal
                                                        canal={opt.value}
                                                        size={1.25}
                                                        className="border-slate-200"
                                                    />
                                                    <span>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,21rem] xl:grid-cols-[1fr,24rem] 2xl:grid-cols-[1fr,28rem] gap-8 mt-6 md:mt-7">
                    <div className="flex flex-col gap-10">
                        <div className="md:px-4 flex flex-col gap-8">
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IconDescricao />
                                        <SectionTitle title="Descrição do Atendimento" />
                                    </div>
                                    {!editarDescricao && <button onClick={() => setEditarDescricao(true)} className="flex items-center gap-1 text-sm">
                                        Editar
                                        <IconEditar size={16} />
                                    </button>}
                                    {editarDescricao && <button onClick={handleEditarDescricao} className="flex items-center gap-1 text-sm">Salvar <IconCheck size={16} /></button>}
                                </div>

                                <div className="w-full mt-3">
                                    {!editarDescricao && <p className="text-sm text-[#485B80] font-semibold whitespace-pre-wrap">{descricao}</p>}
                                    {editarDescricao &&
                                        <textarea
                                            className="w-full h-24 p-2 text-sm rounded-md bg-transparent border font-semibold border-[#DDE6F2] focus:border-[#D33632] focus:ring-transparent bg-white focus:ring-1 focus:outline-none"
                                            placeholder="Adicione uma obeservação"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            ref={descricaoInputRef}
                                        ></textarea>
                                    }
                                </div>

                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-2">
                                    <IconComentarios />
                                    <SectionTitle title="Comentários do time" />
                                    <div className="flex -space-x-2">
                                        {
                                            comentariosUsuarioUnicos(comentarios).map(comentario => (
                                                <AvatarUser key={comentario.id} src={comentario.avatar} name={comentario.nome} size={1.75} />
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {usuario &&
                                        <AvatarUser src={profileImageUrl(usuario.id)} name={usuario.nome} size={2.5} />
                                    }
                                    {!adicionarComentario && <button
                                        className="w-full h-fit p-4 text-sm rounded-md bg-white border border-[#DDE6F2] text-zinc-400 flex items-start"
                                        onClick={() => setAdicionarComentario(!adicionarComentario)}
                                    >
                                        Adicione um comentário
                                    </button>}
                                    {adicionarComentario &&
                                        <div className="w-full relative">
                                            <textarea
                                                className="resize-none w-full h-fit p-4 pb-12 text-sm rounded-md bg-white border border-[#DDE6F2] focus:border-[#D33632] focus:ring-transparent focus:ring-1 focus:outline-none"
                                                placeholder="Adicione um comentário"
                                                ref={comentarioInputRef}
                                                value={novoComentario}
                                                onChange={(e) => setNovoComentario(e.target.value)}
                                            ></textarea>
                                            <button
                                                disabled={loadingComentarios}
                                                onClick={handleAdicionarComentario}
                                                className="bg-[#293856] rounded-[0.5rem] h-10 px-3 text-white font-semibold text-sm flex items-center justify-center gap-2 absolute bottom-5 right-3"
                                            >
                                                {loadingComentarios ?
                                                    <Spinner color="white" width="20px" />
                                                    :
                                                    <>
                                                        Enviar
                                                        <IconEnviar />
                                                    </>
                                                }

                                            </button>
                                        </div>
                                    }
                                </div>

                                <div className="">
                                    <Comentarios comentarios={comentarios} />
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <SectionTitle title="Atividades vinculadas a este atendimento" />
                            </div>

                            <div className="">
                                <CardTarefas idAtendimento={id} />

                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Cabeçalho da seção */}
                            <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-2 md:mb-3">
                                <SectionTitle title="Histórico do atendimento" />
                                {logs?.length > 0 && (
                                    <span className="text-xs text-[#7F8999] font-medium">
                                        Total: <span className="text-[#293856] font-semibold">{logs.length}</span>
                                    </span>
                                )}
                            </div>

                            {/* Card do histórico */}
                            <div
                                className="
                                    bg-white rounded-xl 
                                    p-4 sm:p-5 md:p-6 
                                    shadow-sm ring-1 ring-[#E5E9F2]
                                    max-h-[50vh] md:max-h-[65vh] xl:max-h-[60vh]
                                    transition-all duration-300 
                                    hover:shadow-md
                                    overflow-y-auto
                                    "
                            >
                                {logs && logs.length > 0 ? (
                                    <>
                                        {/* Cabeçalho fixo dentro do histórico */}
                                        <div
                                            className="
                                                px-0 py-1 md:py-2 
                                                border-b border-[#EBEEF2] 
                                                flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
                                            "
                                        >
                                            <div className="flex items-center gap-2 text-[11px] text-[#7F8999] flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Criação</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span>Mudança</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                                                    <span>Outros</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista de logs */}
                                        <div className="divide-y divide-[#F1F3F7]">
                                            {(mostrarTodosHistorico ? logs : logs.slice(0, 8)).map((log: AtendimentoLog, idx: number) => {
                                                const isLast = idx === logs.length - 1;

                                                const dotClass = (t: string | undefined) => {
                                                    const v = (t || '').toUpperCase();
                                                    if (v === 'CRIACAO' || v === 'CRIAÇÃO') return 'bg-emerald-500';
                                                    if (v === 'MUDANCA_STATUS' || v === 'MUDANÇA_STATUS') return 'bg-amber-500';
                                                    return 'bg-slate-400';
                                                };

                                                return (
                                                    <div
                                                        key={log.id}
                                                        className="relative flex flex-col gap-2 py-3 pl-7 sm:pl-9 pr-2 group hover:bg-slate-50 rounded-lg transition-all"
                                                    >
                                                        {/* Ponto e linha */}
                                                        <span className={`absolute left-2 top-4 w-2 h-2 rounded-full ${dotClass(log.tipoEvento)}`} />
                                                        {!isLast && <span className="absolute left-[1.05rem] top-6 bottom-0 w-px bg-[#EBEEF2]" />}

                                                        {/* Conteúdo principal */}
                                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                                                            <div className="flex items-start gap-3 w-full min-w-0">
                                                                {log.usuario?.urlFoto ? (
                                                                    <img
                                                                        src={log.usuario.urlFoto}
                                                                        alt={log.usuario?.nome || ''}
                                                                        className="w-6 h-6 rounded-full object-cover mt-0.5"
                                                                    />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-[#DDE6F2] mt-0.5" />
                                                                )}

                                                                <div className="flex flex-col gap-1 min-w-0">
                                                                    <p className="text-[13px] sm:text-sm font-medium text-[#293856] leading-4 break-words">
                                                                        {(() => {
                                                                            const v = (log.tipoEvento || '').toUpperCase();
                                                                            if (v === 'MUDANCA_STATUS' || v === 'MUDANÇA_STATUS') {
                                                                                return (
                                                                                    <>
                                                                                        Status alterado de{' '}
                                                                                        {statusChip((log as any).dadosAntigos?.status)} para{' '}
                                                                                        {statusChip((log as any).dadosNovos?.status)}
                                                                                    </>
                                                                                );
                                                                            }
                                                                            return log.mensagem;
                                                                        })()}
                                                                    </p>

                                                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#667085]">
                                                                        {log.usuario?.nome && <span>por {log.usuario.nome}</span>}
                                                                        <span>• {format(new Date(log.criadoEm), 'dd/MM/yyyy HH:mm')}</span>
                                                                        <span className="px-1.5 py-0.5 rounded-full bg-[#F2F4F7] text-[#293856] font-semibold">
                                                                            {TIPO_EVENTO_LOG[(log.tipoEvento as keyof typeof TIPO_EVENTO_LOG) || 'CRIACAO']}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Botão detalhes */}
                                                            <button
                                                                onClick={() =>
                                                                    setExpandedIds(prev => ({ ...prev, [log.id]: !prev[log.id] }))
                                                                }
                                                                className="text-[#1f2a44] text-xs font-semibold underline hover:text-[#111a2b] self-end md:self-auto transition-colors rounded px-2 py-1 hover:bg-slate-100"
                                                            >
                                                                {expandedIds[log.id] ? 'Ocultar' : 'Detalhes'}
                                                            </button>
                                                        </div>

                                                        {/* Área expandida */}
                                                        <div
                                                            className={`transition-all overflow-hidden ${expandedIds[log.id] ? 'max-h-[999px]' : 'max-h-0'
                                                                }`}
                                                        >
                                                            {expandedIds[log.id] && (
                                                                <div className="mt-3 bg-[#F8FAFC] border border-[#EBEEF2] rounded-lg p-3 text-xs text-[#485B80] shadow-sm">
                                                                    {log.dadosAntigos || log.dadosNovos ? (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            <div>
                                                                                <h4 className="text-[#293856] font-semibold mb-1">
                                                                                    Dados antigos
                                                                                </h4>
                                                                                <pre className="bg-white p-2 border border-[#EBEEF2] rounded max-h-40 overflow-auto text-[11px] leading-4">
                                                                                    {JSON.stringify(log.dadosAntigos ?? {}, null, 2)}
                                                                                </pre>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-[#293856] font-semibold mb-1">
                                                                                    Dados novos
                                                                                </h4>
                                                                                <pre className="bg-white p-2 border border-[#EBEEF2] rounded max-h-40 overflow-auto text-[11px] leading-4">
                                                                                    {JSON.stringify(log.dadosNovos ?? {}, null, 2)}
                                                                                </pre>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span>Nenhum detalhe adicional.</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Botões de ver mais/menos */}
                                        {logs.length > 8 && (
                                            <div className="mt-4 flex justify-center">
                                                <button
                                                    onClick={() => setMostrarTodosHistorico(!mostrarTodosHistorico)}
                                                    className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg border border-[#DDE6F2] text-[#293856] hover:bg-[#F2F4F7] transition-colors"
                                                >
                                                    {mostrarTodosHistorico ? 'Ver menos' : 'Ver mais'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <NoData
                                        className="min-h-[5rem] gap-1"
                                        sizeIcon={24}
                                        label="Nenhum histórico disponível"
                                    />
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col gap-5">

                        <div className="flex flex-col gap-3">

                            <div className="flex items-center gap-2 w-full justify-between">
                                <SectionTitle title="Cliente Vinculado" />
                                {!editarCliente && <button onClick={() => setEditarCliente(true)} className="flex items-center gap-1 text-sm">Editar<IconEditar size={16} /></button>}
                                {editarCliente && <button onClick={() => setEditarCliente(false)} className="flex items-center gap-1 text-sm">Cancelar <IconX size={16} /></button>}
                            </div>

                            {editarCliente && (
                                <div className="bg-white rounded-[0.5rem] p-4">
                                    <h3 className="text-[#293856] text-sm font-semibold pb-4">Selecione um cliente</h3>
                                    <ComboboxSelectPerson
                                        value={selectedCliente ? [selectedCliente] : []}
                                        onValueChange={handleEditarCliente}
                                        placeholder="Procure por cliente"
                                        onSearch={pesquisarClientes}
                                        unique
                                    />

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() => setCadastrarCliente(true)}
                                            className="w-full h-10 py-2 bg-[#f2f4f7] text-[#485B80] rounded-[0.5rem] border border-dashed border-[#c8ccd2] justify-center items-center gap-2 inline-flex text-sm font-semibold"
                                        >
                                            <IconMais fill="#485B80" />
                                            Cadastrar novo cliente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {cadastrarCliente && (
                                <CenterModal idSelector="content-container" onClose={() => setCadastrarCliente(false)} className="w-full max-w-[900px] md:w-[900px]">
                                    <div className="bg-white rounded-lg p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-semibold text-[#293856]">Cadastrar Novo Cliente</h2>
                                            <button onClick={() => setCadastrarCliente(false)}>
                                                <IconX />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="nome" className="block text-sm font-medium text-[#293856] mb-1">
                                                    Nome<span className="text-red-600">*</span>
                                                </label>
                                                <Input
                                                    id="nome"
                                                    value={novoCliente.nome}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                                                    placeholder="Nome completo"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-[#293856] mb-1">
                                                    Tipo de Pessoa<span className="text-red-600">*</span>
                                                </label>
                                                <div className="flex gap-4 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            id="fisica"
                                                            name="tipoPessoa"
                                                            checked={novoCliente.tipoPessoa === "fisica"}
                                                            onChange={() => setNovoCliente({ ...novoCliente, tipoPessoa: "fisica" })}
                                                            className="h-4 w-4 text-[#293856]"
                                                        />
                                                        <label htmlFor="fisica" className="text-sm text-[#293856]">Física</label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            id="juridica"
                                                            name="tipoPessoa"
                                                            checked={novoCliente.tipoPessoa === "juridica"}
                                                            onChange={() => setNovoCliente({ ...novoCliente, tipoPessoa: "juridica" })}
                                                            className="h-4 w-4 text-[#293856]"
                                                        />
                                                        <label htmlFor="juridica" className="text-sm text-[#293856]">Jurídica</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="documentoFiscal" className="block text-sm font-medium text-[#293856] mb-1">
                                                    {novoCliente.tipoPessoa === "fisica" ? "CPF" : "CNPJ"}
                                                    <span className="text-red-600">*</span>
                                                </label>
                                                <Input
                                                    id="documentoFiscal"
                                                    value={novoCliente.documentoFiscal}
                                                    onChange={(e) => setNovoCliente({
                                                        ...novoCliente,
                                                        documentoFiscal: novoCliente.tipoPessoa === "fisica"
                                                            ? maskCPF(e.target.value)
                                                            : maskCNPJ(e.target.value)
                                                    })}
                                                    placeholder={novoCliente.tipoPessoa === "fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                                                    className="w-full"
                                                />
                                            </div>

                                            {novoCliente.tipoPessoa === "fisica" && (
                                                <>
                                                    <div>
                                                        <label htmlFor="rg" className="block text-sm font-medium text-[#293856] mb-1">RG</label>
                                                        <Input
                                                            id="rg"
                                                            value={novoCliente.rg}
                                                            onChange={(e) => setNovoCliente({ ...novoCliente, rg: e.target.value })}
                                                            placeholder="00.000.000-0"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label htmlFor="telefone" className="block text-sm font-medium text-[#293856] mb-1">Telefone</label>
                                                <Input
                                                    id="telefone"
                                                    value={novoCliente.telefone}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, telefone: maskCelular(e.target.value) })}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="whatsapp" className="block text-sm font-medium text-[#293856] mb-1">
                                                    WhatsApp<span className="text-red-600">*</span>
                                                </label>
                                                <Input
                                                    id="whatsapp"
                                                    value={novoCliente.whatsapp}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, whatsapp: maskCelular(e.target.value) })}
                                                    placeholder="(00) 00000-0000"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-[#293856] mb-1">Email</label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={novoCliente.email}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                                                    placeholder="email@exemplo.com"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="observacoes" className="block text-sm font-medium text-[#293856] mb-1">Observações</label>
                                                <textarea
                                                    id="observacoes"
                                                    className="w-full h-20 p-2 text-sm rounded-md border border-[#DDE6F2] focus:border-[#D33632] focus:ring-transparent focus:ring-1 focus:outline-none"
                                                    value={novoCliente.observacoes}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, observacoes: e.target.value })}
                                                    placeholder="Observações sobre o cliente"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="cep" className="block text-sm font-medium text-[#293856] mb-1">
                                                    CEP<span className="text-red-600">*</span>
                                                </label>
                                                <Input
                                                    id="cep"
                                                    value={novoCliente.cep}
                                                    onChange={handleCepChange}
                                                    placeholder="00000-000"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="uf" className="block text-sm font-medium text-[#293856] mb-1">
                                                        UF<span className="text-red-600">*</span>
                                                    </label>
                                                    <Input
                                                        id="uf"
                                                        value={novoCliente.uf}
                                                        onChange={(e) => setNovoCliente({ ...novoCliente, uf: e.target.value })}
                                                        placeholder="UF"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="municipio" className="block text-sm font-medium text-[#293856] mb-1">
                                                        Cidade<span className="text-red-600">*</span>
                                                    </label>
                                                    <Input
                                                        id="municipio"
                                                        value={novoCliente.municipio}
                                                        onChange={(e) => setNovoCliente({ ...novoCliente, municipio: e.target.value })}
                                                        placeholder="Cidade"
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="endereco" className="block text-sm font-medium text-[#293856] mb-1">
                                                    Endereço<span className="text-red-600">*</span>
                                                </label>
                                                <Input
                                                    id="endereco"
                                                    value={novoCliente.endereco}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                                                    placeholder="Rua, Avenida, etc."
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="bairro" className="block text-sm font-medium text-[#293856] mb-1">
                                                        Bairro<span className="text-red-600">*</span>
                                                    </label>
                                                    <Input
                                                        id="bairro"
                                                        value={novoCliente.bairro}
                                                        onChange={(e) => setNovoCliente({ ...novoCliente, bairro: e.target.value })}
                                                        placeholder="Bairro"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="numero" className="block text-sm font-medium text-[#293856] mb-1">
                                                        Número<span className="text-red-600">*</span>
                                                    </label>
                                                    <Input
                                                        id="numero"
                                                        value={novoCliente.numero}
                                                        onChange={(e) => setNovoCliente({ ...novoCliente, numero: e.target.value })}
                                                        placeholder="Número"
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="complemento" className="block text-sm font-medium text-[#293856] mb-1">Complemento</label>
                                                <Input
                                                    id="complemento"
                                                    value={novoCliente.complemento}
                                                    onChange={(e) => setNovoCliente({ ...novoCliente, complemento: e.target.value })}
                                                    placeholder="Complemento"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => setCadastrarCliente(false)}
                                                className="px-4 py-2 border border-[#DDE6F2] rounded-md text-[#293856] font-semibold"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleCadastrarCliente}
                                                disabled={loadingCadastro || !isFormValid}
                                                className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 ${loadingCadastro || !isFormValid ? 'bg-[#9aa6bf] cursor-not-allowed text-white' : 'bg-[#293856] text-white'}`}
                                            >
                                                {loadingCadastro ?
                                                    <Spinner color="white" width="20px" /> :
                                                    "Cadastrar Cliente"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </CenterModal>
                            )}

                            {!editarCliente && !atendimento.cliente &&
                                <div className="bg-white rounded-[0.5rem] p-4">
                                    <NoData className="min-h-[5rem] gap-1" sizeIcon={24} label="Nenhum cliente vinculado" />
                                </div>
                            }


                            {!editarCliente && atendimento.cliente &&
                                <div className="bg-white rounded-[0.5rem] p-4">

                                    <div className="flex gap-3">
                                        <AvatarUser name={atendimento.cliente.nome || 'C'} size={4}
                                            src={atendimento.cliente.urlAvatar || ''}
                                        />
                                        <div>
                                            <h4 className="font-semibold text-[#293856] text-lg truncate">{atendimento.cliente.nome}</h4>
                                            <div className="flex items-center gap-2 text-sm">
                                                <IconTelefoneFill />
                                                <span className="truncate">{atendimento.cliente.whatsapp}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <IconEmail />
                                                <span className="truncate">{atendimento.cliente.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/app/clientes/${atendimento.cliente.id}`} className="bg-white text-[#7F8999] rounded-[0.5rem] w-full p-2.5 flex items-center justify-center mt-4 text-sm font-semibold border border-[#7F8999] transition-transform hover:scale-[1.015]">
                                        Ver página do cliente
                                    </Link>

                                </div>
                            }
                        </div>


                        <div className="flex flex-col gap-3">
                            <SectionTitle title="Visita agendada" />

                            {!novaVisita && visitas.length === 0 &&
                                <div className="bg-white rounded-[0.5rem] p-4">
                                    <NoData className="min-h-[5rem] gap-1" sizeIcon={24} label="Nenhuma visita" />

                                    <div className="mt-7">
                                        <button onClick={() => setNovaVisita(true)} className="w-full h-10 py-2 bg-[#f2f4f7] text-[#485B80] rounded-[0.5rem] border border-dashed border-[#c8ccd2] justify-center items-center gap-2 inline-flex text-sm font-semibold">
                                            <IconMais fill="#485B80" />
                                            Adicionar visita
                                        </button>
                                    </div>
                                </div>
                            }

                            {novaVisita &&
                                <CriarVisitaMini idAtendimento={id} onCancelar={() => setNovaVisita(false)} onSalvar={() => {
                                    fecthVisitas()
                                    setNovaVisita(false)
                                }} />
                            }

                            {visitas.map((visita: VisitaType) => (
                                <div key={visita.id} className="bg-white rounded-[0.5rem] p-2 text-[#293856]">
                                    <div className="grid grid-cols-[fit-content(100%),1fr,fit-content(100%)] gap-3 items-center">
                                        <div className="p-2.5 flex flex-col items-center justify-center bg-[#F2F4F7] rounded-[0.5rem]">
                                            <span className="font-semibold">{
                                                new Date(visita.data).toLocaleDateString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                })}</span>
                                            <span className="text-sm">{visita.horaInicio}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">{visita.tipo}</span>
                                            <div className="flex items-center gap-1.5">
                                                <AvatarUser src={
                                                    visita.atendimento.cliente?.urlAvatar || visita.atendimento.clienteTemporario?.avatar || profileImageUrl("")
                                                } name={visita.atendimento.cliente?.nome || visita.atendimento.clienteTemporario?.nome || "Sem nome"} size={1.15} />
                                                <span className="text-xs truncate">{visita.atendimento.cliente?.nome || visita.atendimento.clienteTemporario?.nome || "Sem nome"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 pr-1">
                                            {visita.concluida ?
                                                <div className="bg-[#EBEEF2] flex items-center gap-2 rounded-full">
                                                    <span className="text-xs text-[#485B80] pl-2">Concluída</span>
                                                    <button className="bg-[#293856] flex items-center justify-center h-6 w-6 rounded-full" onClick={() => handleToggleVisita(visita.id)}><IconCheck color="#ffffff" size={16} /></button>
                                                </div>
                                                :
                                                <div className="flex gap-2">
                                                    <button className="bg-[#EBEEF2] flex items-center justify-center h-6 w-6 rounded-full" onClick={() => handleToggleVisita(visita.id)}><IconCheck color="#777777" size={16} /></button>
                                                    <button className="bg-[#EBEEF2] flex items-center justify-center h-6 w-6 rounded-full" onClick={() => handleDeletarVisita(visita.id)}><IconX color="#E84C43" /></button>
                                                </div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <SectionTitle title="Anexos" />
                            <div className="bg-white rounded-[0.5rem] p-4">
                                <UploadArquivosAtandimento idAtendimento={id} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {etapa && mudarEtapa && novaEtapa &&
                <CenterModal idSelector="content-container" onClose={() => { setMudarEtapa(false) }}>
                    <ConteudoAlterarStatus
                        atendimento={{
                            id: atendimento.id,
                            responsaveis: atendimento.responsaveis,
                            status: etapa,
                            novoStatus: novaEtapa,
                            temperatura: atendimento.temperatura,
                            origem: atendimento.origemAtendimento,
                        }}
                        onSuccess={() => {
                            setMudarEtapa(false)
                            fetchAtendimento()
                            fetchComentarios()
                        }}
                        onCancel={handleCancelar}
                    />
                </CenterModal>
            }

            {alertDialog && (
                <AlertDialog
                    message={alertDialog.message}
                    variant={alertDialog.variant}
                    onClose={() => setAlertDialog(null)}
                />
            )}

        </div>
    )
}

const statusChip = (status?: string) => {
    const color = STATUS_ATENDIMENTO_COLOR[status as keyof typeof STATUS_ATENDIMENTO_COLOR] || '#7F8999';
    const label = STATUS_ATENDIMENTO_HISTORICO[status ?? ""] ?? "";
    return (
        <span className="px-1.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap" style={{ borderColor: color, color }}>
            {label}
        </span>
    );
}
