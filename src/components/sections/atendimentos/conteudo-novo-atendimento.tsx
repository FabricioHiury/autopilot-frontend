"use client";
import Input from "@/components/inputs/text/Input";
import sanitizar from "@/utils/classes/sanitizer/sanitizer";
import Spinner from "@/components/loading/Spinner";
import toast from "react-hot-toast";
import IconX from "@/components/icons/icon-x";
import AvatarUser from "@/components/commons/avatar-user";
import CenterModal from "@/components/commons/modais/center-modal";
import api from "@/utils/classes/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormDirty } from "@/hooks/use-form-dirty";
import { IconCarIn } from "../../icons/icon-car-in";
import { IconCarOut } from "../../icons/icon-car-out";
import {
  ComboboxSelectPerson,
  SelectPersonItemInterface,
} from "../../commons/inputs/combobox-select-person";
import InputRadioOption from "../../commons/inputs/input-radio-option";
import SelectComLabel from "../../commons/inputs/select-com-label";
import IconFrio from "./icons/icon-frio";
import IconMorno from "./icons/icon-morno";
import IconQuente from "./icons/icon-quente";
import {
  atendimentoSchema,
  optionsAtendimento,
} from "@/lib/atendimento-schema";
import { ColaboradorType } from "@/lib/api-response-types";
import { IconEdit } from "@/components/icons/icon-edit";
import { fetchAddressFromCep } from "@/utils/classes/cep/fetchAddressFromCep";
import { maskCEP } from "@/utils/classes/format/maskCep";
import { maskCPF } from "@/utils/classes/format/maskCpf";
import { maskCNPJ } from "@/utils/classes/format/maskCnpj";
import { maskCelular } from "@/utils/classes/format/maskCelular";
import { ApiApp } from "@/lib/api-app";
import {
  STATUS_ATENDIMENTO,
  STATUS_ATENDIMENTO_LABEL,
} from "@/utils/types/status-atentimento-enum";
import { useAppAuth } from "@/contexts/auth-app-context";

export interface ConteudoNovoAtendimentoProps {
  onSucess?: (createdAtendimentoId?: number, atendimentoData?: {
    titulo: string;
    temperatura: string;
    descricaoAtendimento: string;
  }) => void;
  onCancel?: () => void;
  onError?: () => void;
  onDistribuicaoAutomaticaChange?: (isActive: boolean) => void;
  onForceClose?: () => void;
  initialData?: {
    chatId?: string;
    origemAtendimento?: string;
    nome?: string;
    email?: string;
    telefone?: string;
    avatar?: string;
    status?: STATUS_ATENDIMENTO;
    atendimentoManual?: boolean;
  };
}

export function ConteudoNovoAtendimento({
  onSucess,
  onCancel,
  onError,
  onDistribuicaoAutomaticaChange,
  onForceClose,
  initialData,
}: ConteudoNovoAtendimentoProps) {
  const router = useRouter();
  const authContext = useAppAuth();

  const [loading, setLoading] = useState(false);
  const [distribuicaoAutomaticaAtiva, setDistribuicaoAutomaticaAtiva] =
    useState<boolean>(false);
  const [loadingDistribuicao, setLoadingDistribuicao] = useState<boolean>(true);

  const [usarDistribuicaoAutomatica, setUsarDistribuicaoAutomatica] =
    useState<boolean>(false);
  const [isVendedor, setIsVendedor] = useState<boolean>(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [colaboradorId, setColaboradorId] = useState<string | null>(null);

  const initialClienteState = {
    nome: "",
    tipoPessoa: "fisica" as "fisica" | "juridica",
    documentoFiscal: "",
    rg: "",
    telefone: "",
    whatsapp: "",
    email: "",
    observacoes: "",
    cep: "",
    endereco: "",
    bairro: "",
    municipio: "",
    uf: "",
    numero: "",
    complemento: "",
    dataNascimento: "",
    estrangeiro: false,
    genero: "masculino",
  };

  const [cadastrarCliente, setCadastrarCliente] = useState<boolean>(false);
  const [loadingCadastro, setLoadingCadastro] = useState<boolean>(false);
  const [novoCliente, setNovoCliente] = useState(initialClienteState);
  const [selected, setSelected] = useState<SelectPersonItemInterface[]>([]);
  const [selectedResponsavelAtribuicao, setSelectedResponsavelAtribuicao] = useState<SelectPersonItemInterface[]>([]);

  const [selectedCliente, setSelectedCliente] = useState<
    SelectPersonItemInterface | undefined
  >();
  const [vinculado, setVinculado] = useState<boolean>(false);

  const initialDataInfoAtendimento = {
    titulo: "",
    descricaoAtendimento: "",
    vincularCliente: false,
    observacao: "",
    origemAtendimento: initialData?.origemAtendimento || "outros",
    temperatura: "frio",
    modoAtendimento: "venda",
    status: initialData?.status ?? STATUS_ATENDIMENTO.ATENDIMENTO_INICIAL,
    idResponsaveis: [] as string[],
    idCliente: "",
    nomeCompleto: initialData?.nome || "",
    email: initialData?.email || "",
    telefone: initialData?.telefone || "",
    idChat: initialData?.chatId || undefined,
    atendimentoManual: initialData?.atendimentoManual ?? false,
  };

  const [dataInfoAtendimento, setDataInfoAtendimento] = useState(initialDataInfoAtendimento);

  const isDirty = useFormDirty(
    {
      novoCliente: initialClienteState,
      dataInfoAtendimento: initialDataInfoAtendimento,
      selectedCliente: undefined,
      vinculado: false,
      selectedResponsavelAtribuicao: []
    },
    {
      novoCliente,
      dataInfoAtendimento,
      selectedCliente,
      vinculado,
      selectedResponsavelAtribuicao
    }
  );

  const normalizePhone = (value?: string): string => {
    if (!value) return "";
    let digits = value.replace(/\D/g, "");
    if (digits.length > 11 && digits.startsWith("55")) {
      digits = digits.slice(2);
    }

    if (digits.length > 11) {
      digits = digits.slice(-11);
    }
    return digits;
  };

  useEffect(() => {
    if (!cadastrarCliente) return;
    const candidatePhone = normalizePhone(initialData?.telefone || dataInfoAtendimento.telefone);
    setNovoCliente((prev) => ({
      ...prev,
      nome: prev.nome || (initialData?.nome ?? ""),
      email: prev.email || (initialData?.email ?? ""),
      whatsapp: prev.whatsapp || (candidatePhone ? maskCelular(candidatePhone) : prev.whatsapp),
      telefone: prev.telefone || (candidatePhone ? maskCelular(candidatePhone) : prev.telefone),
    }));
  }, [cadastrarCliente, initialData, dataInfoAtendimento.telefone]);

  const statusOptions = [
    {
      value: STATUS_ATENDIMENTO.PRE_ATENDIMENTO,
      label: STATUS_ATENDIMENTO_LABEL.PRE_ATENDIMENTO,
    },
    {
      value: STATUS_ATENDIMENTO.ATENDIMENTO_INICIAL,
      label: STATUS_ATENDIMENTO_LABEL.ATENDIMENTO_INICIAL,
    },
    {
      value: STATUS_ATENDIMENTO.VISITA,
      label: STATUS_ATENDIMENTO_LABEL.VISITA,
    },
    {
      value: STATUS_ATENDIMENTO.EM_NEGOCIACAO,
      label: STATUS_ATENDIMENTO_LABEL.EM_NEGOCIACAO,
    },
    {
      value: STATUS_ATENDIMENTO.SUCESSO,
      label: STATUS_ATENDIMENTO_LABEL.SUCESSO,
    },
    {
      value: STATUS_ATENDIMENTO.PERDIDO,
      label: STATUS_ATENDIMENTO_LABEL.PERDIDO,
    },
  ];

  const statusOptionsFiltradas = isVendedor
    ? statusOptions
    : statusOptions;

  const handleSelectCliente = (persons: SelectPersonItemInterface[]) => {
    if (persons.length === 0) {
      setDataInfoAtendimento({
        ...dataInfoAtendimento,
        idCliente: "",
      });
      setSelectedCliente(undefined);
      return;
    }
    setDataInfoAtendimento({
      ...dataInfoAtendimento,
      idCliente: persons[0].id,
    });
    setSelectedCliente(persons[0]);
  };

  const buscarColaboradorPorUsuario = async (
    idUsuario: string
  ): Promise<string | null> => {
    try {
      const api = new ApiApp();
      const [colaboradores, error] = await api.colaborador.listar({
        pesquisa: "",
      });

      if (error || !colaboradores) {
        console.error("Erro ao buscar colaboradores:", error);
        return null;
      }

      const colaborador = colaboradores.colaboradores.find(
        (c) => c.idUsuario === idUsuario
      );
      return colaborador ? colaborador.id : null;
    } catch (error) {
      console.error("Erro ao buscar colaborador:", error);
      return null;
    }
  };

  useEffect(() => {
    const verificarUsuarioVendedor = async () => {
      try {
        const user = authContext.getUser();
        setUsuarioLogado(user);

        if (user?.id) {
          const permissoes = await authContext.fetchPermissions();
          const cargos = permissoes?.roles || [];

          const ehPreVendedor = cargos.some((cargo) => {
            const cargoLower = cargo.toLowerCase();
            return (
              cargoLower.includes("pré-vendedor") ||
              cargoLower.includes("pre-vendedor") ||
              cargoLower.includes("pré vendedor") ||
              cargoLower.includes("pre vendedor")
            );
          });

          const ehVendedor = cargos.some((cargo) => {
            const cargoLower = cargo.toLowerCase();
            return (
              cargoLower.includes("vendedor") &&
              !cargoLower.includes("pré") &&
              !cargoLower.includes("pre")
            );
          });

          const ehQualquerVendedor = ehVendedor || ehPreVendedor;

          setIsVendedor(ehQualquerVendedor);

          if (ehQualquerVendedor) {
            const idColaborador = await buscarColaboradorPorUsuario(user.id);
            setColaboradorId(idColaborador);

            const statusInicial = ehPreVendedor
              ? STATUS_ATENDIMENTO.PRE_ATENDIMENTO
              : STATUS_ATENDIMENTO.ATENDIMENTO_INICIAL;

            setDataInfoAtendimento((prev) => ({
              ...prev,
              idResponsaveis: idColaborador ? [idColaborador] : [],
              status: statusInicial,
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error);
      }
    };

    verificarUsuarioVendedor();
  }, [authContext]);

  useEffect(() => {
    const carregarConfiguracaoDistribuicao = async () => {
      setLoadingDistribuicao(true);
      const api = new ApiApp();
      const [config, error] =
        await api.distribuicaoAutomatica.obterConfiguracao();

      if (error) {
        console.error("Erro ao carregar configuração de distribuição:", error);
        setDistribuicaoAutomaticaAtiva(false);
        setUsarDistribuicaoAutomatica(false);
        onDistribuicaoAutomaticaChange?.(false);
      } else {
        const isActive = config?.distribuicaoAutomatica || false;
        setDistribuicaoAutomaticaAtiva(isActive);
        setUsarDistribuicaoAutomatica(isActive);
        onDistribuicaoAutomaticaChange?.(isActive);
      }

      setLoadingDistribuicao(false);
    };

    carregarConfiguracaoDistribuicao();
  }, [onDistribuicaoAutomaticaChange]);

  useEffect(() => {
    const carregarDadosResponsaveis = async () => {
      if (dataInfoAtendimento.idResponsaveis.length === 0) {
        setSelected([]);
        return;
      }

      if (distribuicaoAutomaticaAtiva || isVendedor) {
        try {
          const [response, error] = await api.get(
            "/colaborador/busca-colaboradores?ids=" + dataInfoAtendimento.idResponsaveis.join(",")
          );

          if (error) {
            console.error("Erro ao carregar dados dos responsáveis:", error);
            return;
          }

          const responsaveisAtualizados = response.data.colaboradores.map((colaborador: ColaboradorType) => ({
            id: colaborador.id,
            name: colaborador.nome,
            avatar: "",
            metaData: [colaborador.whatsapp],
          }));

          setSelected(responsaveisAtualizados);
        } catch (error) {
          console.error("Erro ao carregar dados dos responsáveis:", error);
        }
      }
    };

    carregarDadosResponsaveis();
  }, [dataInfoAtendimento.idResponsaveis, distribuicaoAutomaticaAtiva, isVendedor]);

  const handleCancelAttempt = () => {
    if (isDirty) {
      onCancel?.();
    } else {
      onForceClose?.();
    }
  };

  const handleSubmit = async () => {
    let responsaveisParaEnvio = dataInfoAtendimento.idResponsaveis;

    if (isVendedor && colaboradorId) {
      responsaveisParaEnvio = [colaboradorId];
    } else if (usarDistribuicaoAutomatica && !isVendedor) {
      responsaveisParaEnvio = [];
    }

    const dadosParaEnvio = {
      ...dataInfoAtendimento,
      status: dataInfoAtendimento.status,
      atendimentoManual: dataInfoAtendimento.atendimentoManual,
      distribuicaoAutomatica: usarDistribuicaoAutomatica && !isVendedor,
      idResponsaveis: responsaveisParaEnvio,
    };

    const form = atendimentoSchema.safeParse(dadosParaEnvio);

    if (form.success === false) {
      toast.error(form.error.issues[0].message, { duration: 6000, style: { zIndex: 9999 } });
      return;
    }
    try {
      setLoading(true);
      const [response, error] = await api.post("/atendimento", form.data);
      if (error) {
        toast.error(error.message || "Erro ao cadastrar atendimento", { duration: 6000, style: { zIndex: 9999 } });
        return;
      }
      toast.success("Atendimento cadastrado com sucesso", { duration: 4000, style: { zIndex: 9999 } });
      if (response?.data?.id) {
        router.push(`/app/atendimentos/painel-de-atendimentos/${response.data.id}`);
        onSucess?.(response.data.id, {
          titulo: dataInfoAtendimento.titulo,
          temperatura: dataInfoAtendimento.temperatura,
          descricaoAtendimento: dataInfoAtendimento.descricaoAtendimento,
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar atendimento:", error);
      toast.error("Erro ao cadastrar atendimento");
    } finally {
      setLoading(false);
    }
  };

  async function loadClientes(search: string) {
    const [response, error] = await api.get(
      "/cliente/listar?pesquisa=" + encodeURIComponent(search)
    );
    if (error) {
      toast.error(error.message);
      return [];
    }
    return response.data.clientes.map((obj: any) => {
      return {
        id: obj.id,
        name: obj.nome,
        avatar: "",
        metaData: [obj.whatsapp],
      };
    });
  }

  async function loadResponsaveis(search: string) {
    const [response, error] = await api.get(
      "/colaborador/busca-colaboradores?pesquisa=" + encodeURIComponent(search)
    );
    if (error) {
      toast.error(error.message);
      return [];
    }
    return response.data.colaboradores.map((obj: ColaboradorType) => {
      return {
        id: obj.id,
        name: obj.nome,
        avatar: "",
        metaData: [obj.whatsapp],
      };
    });
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedCep = maskCEP(e.target.value);
    setNovoCliente({ ...novoCliente, cep: maskedCep });

    if (maskedCep.length === 9) {
      toast.loading("Buscando endereço...", { id: "cep-loading" });

      const addressData = await fetchAddressFromCep(maskedCep);

      toast.dismiss("cep-loading");

      if (addressData) {
        setNovoCliente({
          ...novoCliente,
          cep: maskedCep,
          endereco: addressData.endereco,
          bairro: addressData.bairro,
          municipio: addressData.municipio,
          uf: addressData.uf,
        });

        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    }
  };

  const handleCadastrarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.whatsapp) {
      toast.error("Preencha os campos obrigatórios: Nome, Telefone e WhatsApp");
      return;
    }

    if (novoCliente.tipoPessoa === "fisica") {
      if (!novoCliente.documentoFiscal) {
        toast.error("CPF é obrigatório para pessoa física");
        return;
      }
    }

    if (novoCliente.tipoPessoa === "juridica" && !novoCliente.documentoFiscal) {
      toast.error("CNPJ é obrigatório para pessoa jurídica");
      return;
    }

    if (!novoCliente.dataNascimento) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }

    setLoadingCadastro(true);

    try {
      const formattedData = { ...novoCliente };

      if (formattedData.dataNascimento) {
        const parts = formattedData.dataNascimento.split("/");
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          formattedData.dataNascimento = `${year}-${month}-${day} 00:00:00`;
        }
      }

      const [response, error] = await api.post("/cliente/criar", formattedData);

      if (error) {
        toast.error(error.message || "Erro ao cadastrar cliente");
        setLoadingCadastro(false);
        return;
      }

      toast.success("Cliente cadastrado com sucesso!");

      if (response.data) {
        const novoClienteCadastrado = {
          id: response.data.id,
          name: response.data.nome,
          avatar: response.data.urlAvatar || "",
          metaData: [response.data.whatsapp],
        };

        setSelectedCliente(novoClienteCadastrado);
        setDataInfoAtendimento({
          ...dataInfoAtendimento,
          idCliente: response.data.id,
        });
        setVinculado(true);
      }

      setCadastrarCliente(false);
      setLoadingCadastro(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar cliente");
      setLoadingCadastro(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-5 pb-8">
        <button onClick={handleCancelAttempt} className="self-end">
          <IconX />
        </button>
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg md:text-[1.75rem] leading-none font-semibold text-[#1B263A]">
              Novo Atendimento
            </h2>
          </div>
          <div className="flex justify-end gap-1">
            <ButtonTipoAtendimento
              icon={<IconCarOut />}
              label="Venda"
              active={dataInfoAtendimento.modoAtendimento === "venda"}
              onClick={() =>
                setDataInfoAtendimento({
                  ...dataInfoAtendimento,
                  modoAtendimento: "venda",
                })
              }
            />
            <ButtonTipoAtendimento
              icon={<IconCarIn />}
              label="Compra"
              active={dataInfoAtendimento.modoAtendimento === "compra"}
              onClick={() =>
                setDataInfoAtendimento({
                  ...dataInfoAtendimento,
                  modoAtendimento: "compra",
                })
              }
            />
            <ButtonTipoAtendimento
              icon={<IconCarIn />}
              label="Consignado"
              active={dataInfoAtendimento.modoAtendimento === "consignado"}
              onClick={() =>
                setDataInfoAtendimento({
                  ...dataInfoAtendimento,
                  modoAtendimento: "consignado",
                })
              }
            />
          </div>
        </div>

        <div className="block w-full h-1.5 rounded-full bg-[#DDE6F2]">
          <div className="w-[7rem] h-1.5 rounded-full bg-[#D33632]"></div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <Input
            label="Entitule este atendimento"
            placeholder="Insira um título para este atendimento"
            value={dataInfoAtendimento.titulo}
            onChange={(e) =>
              setDataInfoAtendimento({
                ...dataInfoAtendimento,
                titulo: e.target.value,
              })
            }
          />
        </div>

        <div>
          <SelectComLabel
            label="Status do atendimento"
            value={dataInfoAtendimento.status}
            onChange={(value) =>
              setDataInfoAtendimento({
                ...dataInfoAtendimento,
                status: value as STATUS_ATENDIMENTO,
              })
            }
            options={statusOptionsFiltradas.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
          />
        </div>

        <div className="flex justify-between">
          <span className="text-sm font-semibold">
            Deseja vincular este atendimento a um cliente?
          </span>
          <div className="flex gap-3">
            <div className="flex gap-2 items-center">
              <InputRadioOption
                selected={dataInfoAtendimento.vincularCliente}
                color="#485B80"
                onChange={() =>
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    vincularCliente: true,
                  })
                }
                id="novo-atendimento-cliente-sim"
              />
              <label
                className="text-[#485B80] text-sm font-semibold cursor-pointer"
                htmlFor="novo-atendimento-cliente-sim"
              >
                Sim
              </label>
            </div>
            <div className="flex gap-2 items-center">
              <InputRadioOption
                selected={!dataInfoAtendimento.vincularCliente}
                color="#485B80"
                onChange={() =>
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    vincularCliente: false,
                  })
                }
                id="novo-atendimento-cliente-nao"
              />
              <label
                className="text-[#485B80] text-sm font-semibold cursor-pointer"
                htmlFor="novo-atendimento-cliente-nao"
              >
                Não
              </label>
            </div>
          </div>
        </div>

        {dataInfoAtendimento.vincularCliente && !vinculado && (
          <div>
            <ComboboxSelectPerson
              value={selectedCliente ? [selectedCliente] : []}
              onValueChange={handleSelectCliente}
              placeholder="Procure por cliente"
              onSearch={(search: string) => {
                return loadClientes(search);
              }}
              unique
            />

            {/* Add button to create a new client */}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setCadastrarCliente(true)}
                className="flex-1 h-10 py-2 bg-[#f2f4f7] text-[#485B80] rounded-[0.5rem] border border-dashed border-[#c8ccd2] justify-center items-center gap-2 inline-flex text-sm font-semibold"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.33334V12.6667"
                    stroke="#485B80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33331 8H12.6666"
                    stroke="#485B80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Cadastrar novo cliente
              </button>

              {dataInfoAtendimento.idCliente !== "" && !vinculado && (
                <button
                  className="flex-1 bg-[#293856] text-white p-2 rounded-lg"
                  onClick={() => setVinculado(true)}
                >
                  Vincular
                </button>
              )}
            </div>
          </div>
        )}
        {dataInfoAtendimento.vincularCliente &&
          vinculado &&
          selectedCliente && (
            <div className="flex w-full justify-between p-3 px-5 items-center rounded-lg bg-[#EBEEF2]">
              <div className="flex items-center gap-2">
                <AvatarUser
                  src={selectedCliente.avatar}
                  name={selectedCliente.name}
                  size={2.7}
                />
                <div className="flex flex-col items-start">
                  <div className="font-semibold text-[16px] text-[#1B263A]">
                    {selectedCliente.name}
                  </div>
                  <div className="flex text-[14px] text-[#293856]">
                    {selectedCliente.metaData &&
                      sanitizar.telefone(
                        selectedCliente.metaData[0].toString(),
                        false
                      )}
                  </div>
                </div>
              </div>
              <button onClick={() => setVinculado(false)}>
                <IconEdit fill="#1B263A" size={18} />
              </button>
            </div>
          )}

        {!dataInfoAtendimento.vincularCliente && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[#1B263A] text-lg ">
              Dados do cliente
            </h3>

            <div>
              <Input
                label="Nome Completo"
                placeholder="Nome e sobrenome"
                value={dataInfoAtendimento.nomeCompleto}
                onChange={(event) =>
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    nomeCompleto: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3">
              <div className="w-full">
                <Input
                  placeholder="email@email.com"
                  label="Email"
                  value={dataInfoAtendimento.email}
                  onChange={(event) =>
                    setDataInfoAtendimento({
                      ...dataInfoAtendimento,
                      email: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Input
                  id="whatsapp"
                  label="WhatsApp"
                  value={dataInfoAtendimento.telefone}
                  onChange={(event) => {
                    setDataInfoAtendimento({
                      ...dataInfoAtendimento,
                      telefone: maskCelular(event.target.value),
                    });
                  }}
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[#1B263A] text-lg pt-2">
            Informações do atendimento
          </h3>

          <div className="flex gap-3">
            <div className="w-full">
              <SelectComLabel
                value={dataInfoAtendimento.origemAtendimento}
                label="Origem do atendimento"
                placeholder="Selecione"
                onChange={(value) => {
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    origemAtendimento: value,
                  });
                }}
                options={optionsAtendimento}
              />
            </div>
            <div className="w-full">
              <SelectComLabel
                value={dataInfoAtendimento.temperatura}
                label="Temperatura"
                placeholder="Selecione"
                onChange={(v) =>
                  v &&
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    temperatura: v,
                  })
                }
                options={[
                  {
                    label: "Frio",
                    value: "frio",
                    icon: <IconFrio />,
                  },
                  {
                    label: "Morno",
                    value: "morno",
                    icon: <IconMorno />,
                  },
                  {
                    label: "Quente",
                    value: "quente",
                    icon: <IconQuente />,
                  },
                ]}
              />
            </div>
          </div>
        </div>
        {!distribuicaoAutomaticaAtiva && !isVendedor && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#1B263A]">
              Atribuir responsável a este atendimento
            </h3>

            <div className="w-full">
              <ComboboxSelectPerson
                value={selectedResponsavelAtribuicao}
                onValueChange={(novosResponsaveis) => {
                  setDataInfoAtendimento({
                    ...dataInfoAtendimento,
                    idResponsaveis: novosResponsaveis.map((obj) => obj.id),
                  });
                  setSelectedResponsavelAtribuicao(novosResponsaveis);
                }}
                placeholder="Procure pelos responsáveis"
                onSearch={(search: string) => {
                  return loadResponsaveis(search);
                }}
                unique={true}
              />
            </div>
          </div>
        )}

        {isVendedor && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#1B263A]">
              Responsável pelo atendimento
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="font-medium text-blue-800">
                  Responsável Automático
                </h4>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                Como vendedor, você será automaticamente definido como
                responsável por este atendimento.
              </p>
            </div>
          </div>
        )}
        {distribuicaoAutomaticaAtiva && !isVendedor && (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#1B263A]">
              Atribuição de responsável
            </h3>

            <div className="flex justify-between">
              <span className="text-sm font-semibold">
                Como deseja atribuir os responsáveis?
              </span>
              <div className="flex gap-3">
                <div className="flex gap-2 items-center">
                  <InputRadioOption
                    selected={usarDistribuicaoAutomatica}
                    color="#485B80"
                    onChange={() => {
                      setUsarDistribuicaoAutomatica(true);
                      setDataInfoAtendimento({
                        ...dataInfoAtendimento,
                        idResponsaveis: [],
                      });
                    }}
                    id="distribuicao-automatica"
                  />
                  <label
                    className="text-[#485B80] text-sm font-semibold cursor-pointer"
                    htmlFor="distribuicao-automatica"
                  >
                    Distribuição automática
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <InputRadioOption
                    selected={!usarDistribuicaoAutomatica}
                    color="#485B80"
                    onChange={() => setUsarDistribuicaoAutomatica(false)}
                    id="selecao-manual"
                  />
                  <label
                    className="text-[#485B80] text-sm font-semibold cursor-pointer"
                    htmlFor="selecao-manual"
                  >
                    Seleção manual
                  </label>
                </div>
              </div>
            </div>

            {usarDistribuicaoAutomatica ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h4 className="font-medium text-blue-800">
                    Distribuição Automática
                  </h4>
                </div>
                <p className="mt-2 text-sm text-blue-700">
                  Os responsáveis serão atribuídos automaticamente pelo sistema
                  quando este atendimento for criado.
                </p>
              </div>
            ) : (
              <div className="w-full">
                <ComboboxSelectPerson
                  value={selected}
                  onValueChange={(novosResponsaveis) => {
                    setDataInfoAtendimento({
                      ...dataInfoAtendimento,
                      idResponsaveis: novosResponsaveis.map((obj) => obj.id),
                    });
                    setSelected(novosResponsaveis);
                  }}
                  placeholder="Procure pelos responsáveis"
                  onSearch={(search: string) => {
                    return loadResponsaveis(search);
                  }}
                  unique={false}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[#1B263A]">
            Adicionar observações
          </h3>

          <div className="w-full">
            <textarea
              className="w-full h-24 p-2 text-sm rounded-md border border-[#DDE6F2] focus:border-[#D33632] focus:ring-transparent focus:ring-1 focus:outline-none"
              placeholder="Adicione uma obeservação"
              value={dataInfoAtendimento.descricaoAtendimento}
              onChange={(e) =>
                setDataInfoAtendimento({
                  ...dataInfoAtendimento,
                  descricaoAtendimento: e.target.value,
                })
              }
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            onClick={handleCancelAttempt}
            disabled={loading}
            className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-white border 
                        border-[#293856] text-[#293856] font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex justify-center items-center gap-1 w-full h-10 rounded-md bg-[#293856] text-white
                    font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-80"
          >
            {!loading ? (
              "Iniciar atendimento"
            ) : (
              <Spinner color="white" width="22px" />
            )}
          </button>
        </div>
      </div>

      {cadastrarCliente && (
        <CenterModal
          idSelector="content-container"
          onClose={() => setCadastrarCliente(false)}
          className="w-full max-w-[900px] md:w-[900px]"
        >
          <div
            className="bg-white rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#293856]">
                Cadastrar Novo Cliente
              </h2>
              <button onClick={() => setCadastrarCliente(false)}>
                <IconX />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Nome*
                </label>
                <Input
                  id="nome"
                  label=""
                  value={novoCliente.nome}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, nome: e.target.value })
                  }
                  placeholder="Nome completo"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#293856] mb-1">
                  Tipo de Pessoa*
                </label>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="fisica"
                      name="tipoPessoa"
                      checked={novoCliente.tipoPessoa === "fisica"}
                      onChange={() =>
                        setNovoCliente({ ...novoCliente, tipoPessoa: "fisica" })
                      }
                      className="h-4 w-4 text-[#293856]"
                    />
                    <label htmlFor="fisica" className="text-sm text-[#293856]">
                      Física
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="juridica"
                      name="tipoPessoa"
                      checked={novoCliente.tipoPessoa === "juridica"}
                      onChange={() =>
                        setNovoCliente({
                          ...novoCliente,
                          tipoPessoa: "juridica",
                        })
                      }
                      className="h-4 w-4 text-[#293856]"
                    />
                    <label
                      htmlFor="juridica"
                      className="text-sm text-[#293856]"
                    >
                      Jurídica
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="dataNascimento"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  {novoCliente.tipoPessoa === "fisica"
                    ? "Data de Nascimento*"
                    : "Data de Fundação*"}
                </label>
                <Input
                  id="dataNascimento"
                  label=""
                  placeholder="00/00/0000"
                  value={novoCliente.dataNascimento}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 0) {
                      value = value.substring(0, 8);
                      if (value.length > 4) {
                        value = `${value.substring(0, 2)}/${value.substring(
                          2,
                          4
                        )}/${value.substring(4)}`;
                      } else if (value.length > 2) {
                        value = `${value.substring(0, 2)}/${value.substring(
                          2
                        )}`;
                      }
                    }
                    setNovoCliente({ ...novoCliente, dataNascimento: value });
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="documentoFiscal"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  {novoCliente.tipoPessoa === "fisica" ? "CPF*" : "CNPJ*"}
                </label>
                <Input
                  id="documentoFiscal"
                  label=""
                  value={novoCliente.documentoFiscal}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      documentoFiscal:
                        novoCliente.tipoPessoa === "fisica"
                          ? maskCPF(e.target.value)
                          : maskCNPJ(e.target.value),
                    })
                  }
                  placeholder={
                    novoCliente.tipoPessoa === "fisica"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  className="w-full"
                />
              </div>

              {novoCliente.tipoPessoa === "fisica" && (
                <>
                  <div>
                    <label
                      htmlFor="rg"
                      className="block text-sm font-medium text-[#293856] mb-1"
                    >
                      RG
                    </label>
                    <Input
                      id="rg"
                      label=""
                      value={novoCliente.rg}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, rg: e.target.value })
                      }
                      placeholder="00.000.000-0"
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Telefone*
                </label>
                <Input
                  id="telefone"
                  label=""
                  value={novoCliente.telefone}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      telefone: maskCelular(e.target.value),
                    })
                  }
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  WhatsApp*
                </label>
                <Input
                  id="whatsapp"
                  label=""
                  value={novoCliente.whatsapp}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      whatsapp: maskCelular(e.target.value),
                    })
                  }
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Email*
                </label>
                <Input
                  id="email"
                  label=""
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="observacoes"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  className="w-full h-20 p-2 text-sm rounded-md border border-[#DDE6F2] focus:border-[#D33632] focus:ring-transparent focus:ring-1 focus:outline-none"
                  value={novoCliente.observacoes}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      observacoes: e.target.value,
                    })
                  }
                  placeholder="Observações sobre o cliente"
                />
              </div>

              <div>
                <label
                  htmlFor="cep"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  CEP*
                </label>
                <Input
                  id="cep"
                  label=""
                  value={novoCliente.cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="uf"
                    className="block text-sm font-medium text-[#293856] mb-1"
                  >
                    UF*
                  </label>
                  <Input
                    id="uf"
                    label=""
                    value={novoCliente.uf}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, uf: e.target.value })
                    }
                    placeholder="UF"
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="municipio"
                    className="block text-sm font-medium text-[#293856] mb-1"
                  >
                    Cidade*
                  </label>
                  <Input
                    id="municipio"
                    label=""
                    value={novoCliente.municipio}
                    onChange={(e) =>
                      setNovoCliente({
                        ...novoCliente,
                        municipio: e.target.value,
                      })
                    }
                    placeholder="Cidade"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="endereco"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Endereço*
                </label>
                <Input
                  id="endereco"
                  label=""
                  value={novoCliente.endereco}
                  onChange={(e) =>
                    setNovoCliente({ ...novoCliente, endereco: e.target.value })
                  }
                  placeholder="Rua, Avenida, etc."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bairro"
                    className="block text-sm font-medium text-[#293856] mb-1"
                  >
                    Bairro*
                  </label>
                  <Input
                    id="bairro"
                    label=""
                    value={novoCliente.bairro}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, bairro: e.target.value })
                    }
                    placeholder="Bairro"
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="numero"
                    className="block text-sm font-medium text-[#293856] mb-1"
                  >
                    Número*
                  </label>
                  <Input
                    id="numero"
                    label=""
                    value={novoCliente.numero}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, numero: e.target.value })
                    }
                    placeholder="Número"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="complemento"
                  className="block text-sm font-medium text-[#293856] mb-1"
                >
                  Complemento
                </label>
                <Input
                  id="complemento"
                  label=""
                  value={novoCliente.complemento}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      complemento: e.target.value,
                    })
                  }
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
                disabled={loadingCadastro}
                className="px-4 py-2 bg-[#293856] text-white rounded-md font-semibold flex items-center gap-2"
              >
                {loadingCadastro ? (
                  <Spinner color="white" width="20px" />
                ) : (
                  "Cadastrar Cliente"
                )}
              </button>
            </div>
          </div>
        </CenterModal>
      )}
    </div>
  );
}

function ButtonTipoAtendimento({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex text-sm gap-1 items-center p-1.5 px-2 rounded-[.25rem] transition-colors text-[#7F8999] bg-transparent data-[active=true]:text-white data-[active=true]:bg-[#0F1522] data-[active=true]:font-semibold"
      data-active={active}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
