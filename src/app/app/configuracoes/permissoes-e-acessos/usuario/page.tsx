'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { PageTitle } from '@/components/commons/page-title';
import { Label } from '@/components/commons/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardColaboradorUser } from '@/components/cards/CardColaboradorCadastro';
import UploadImage from '@/components/cards/UploadImage';
import InputRadioOption from '@/components/commons/inputs/input-radio-option';
import NoData from '@/components/commons/estados/NoData';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import Spinner from '@/components/loading/Spinner';

import { PERMISSOES_LOJA } from '@/utils/types/permissoes_funcionalidades.enum';
import { CargoType } from '@/utils/types/cargo-type';
import { ColaboradorType } from '@/utils/types/colaborador-type';
import { maskCPF } from '@/utils/classes/format/maskCpf';
import { maskCelular } from '@/utils/classes/format/maskCelular';
import { ApiApp } from '@/lib/api-app';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';

const CriarDadosUsuarioSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.').nonempty('E-mail é obrigatório.'),
  senha: z.string().min(4, 'A senha é obrigatória.'),
  observacoes: z.string().optional(),
  celular: z.string()
    .min(1, 'O número de celular é obrigatório.')
    .regex(/^\(\d{2}\)\s?\d\s?\d{4}-\d{4}$/, 'Formato inválido. Use: (00) 0 0000-0000'),
  documentoFiscal: z.string()
    .min(1, 'O CPF é obrigatório.')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use: 000.000.000-00'),
});

const EditarDadosUsuarioSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.').min(5, 'E-mail é obrigatório.'),
  senha: z.string().optional(),
  observacoes: z.string().optional(),
  celular: z.string()
    .min(1, 'O número de celular é obrigatório.')
    .regex(/^\(\d{2}\)\s?\d\s?\d{4}-\d{4}$/, 'Formato inválido. Use: (00) 0 0000-0000'),
  documentoFiscal: z.string()
    .min(1, 'O CPF é obrigatório.')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use: 000.000.000-00'),
});

export default function ConfigAdicionarUsuarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const colabId = searchParams.get('id');
  const userId = searchParams.get('idUsuario');

  const apiApp = useMemo(() => new ApiApp(), []);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);
  const [loadingApi, setLoadingApi] = useState<boolean>(false);

  const [listaUsuarios, setListaUsuarios] = useState<ColaboradorType[]>([]);
  const [cargosDisponiveis, setCargosDisponiveis] = useState<CargoType[]>([]);
  const [colaboradorData, setColaboradorData] = useState<ColaboradorType | null>(null);

  const [file, setFile] = useState<File | undefined>(undefined);
  const [cargosSelecionados, setCargosSelecionados] = useState<CargoType[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);

  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    observacoes: '',
    celular: '',
    documentoFiscal: '',
  });

  const permissoes = useMemo(
    () => Object.entries(PERMISSOES_LOJA).map(([key, label]) => ({ key, label })),
    []
  );

  const formatarFuncionalidadesDoCargo = useCallback(
    (funcs: string[]) =>
      funcs.map((f) => PERMISSOES_LOJA[f as keyof typeof PERMISSOES_LOJA] ?? f).join(', '),
    []
  );

  const syncPermissoesComCargos = useCallback((cargos: CargoType[]) => {
    const set = new Set<string>();
    cargos.forEach((c) => c.funcionalidades.forEach((f) => set.add(f)));
    setPermissoesSelecionadas(Array.from(set));
  }, []);

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    const [data, error] = await apiApp.listarColaboradores({ quantidade: 100 });
    if (!error && data?.colaboradores) setListaUsuarios(data.colaboradores);
    setLoadingUsuarios(false);
  }, [apiApp]);

  const fetchCargos = useCallback(async () => {
    const [data] = await apiApp.listCargos();
    if (data) setCargosDisponiveis(data);
  }, [apiApp]);

  const fetchColaborador = useCallback(
    async (id: string) => {
      const [data] = await apiApp.pegarColaborador(id);
      if (!data) return;

      setColaboradorData(data);
      setDadosUsuario({
        nome: data.nome,
        email: data.email,
        observacoes: data.observacoes || '',
        celular: data.whatsapp,
        documentoFiscal: data.documentoFiscal,
        senha: '',
      });

      setCargosSelecionados(data.cargos || []);
      setPermissoesSelecionadas(data.funcionalidades || []);
    },
    [apiApp]
  );

  const uploadAvatar = useCallback(async (idUsuario: string, fileToUpload: File) => {
    if (!idUsuario || idUsuario.trim() === '') {
      toast.error('ID do usuário não encontrado');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const [response, error] = await api.uploadFile(`/avatar/usuario/${idUsuario}`, formData, 'POST');
      if (error) {
        toast.error(error.message || 'Erro ao fazer upload da imagem');
      } else {
        toast.success('Imagem atualizada com sucesso!');

        const avatarUrl = response?.url || response?.avatar || '';

        if (colaboradorData) {
          setColaboradorData({
            ...colaboradorData,
            avatar: avatarUrl
          });
        }

        setListaUsuarios(prevLista =>
          prevLista.map(user =>
            user.idUsuario === idUsuario
              ? { ...user, avatar: avatarUrl }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      toast.error('Erro ao fazer upload da imagem');
    }
  }, [colaboradorData]);

  const handleCargoChange = useCallback(
    (cargo: CargoType) => {
      const selected = cargosSelecionados.some((c) => c.id === cargo.id);
      const novos = selected
        ? cargosSelecionados.filter((c) => c.id !== cargo.id)
        : [...cargosSelecionados, cargo];

      setCargosSelecionados(novos);
      syncPermissoesComCargos(novos);
    },
    [cargosSelecionados, syncPermissoesComCargos]
  );

  const handlePermissaoChange = useCallback(
    (permissaoKey: string) => {
      setPermissoesSelecionadas((prev) =>
        prev.includes(permissaoKey) ? prev.filter((p) => p !== permissaoKey) : [...prev, permissaoKey]
      );
    },
    []
  );

  const createColaborador = useCallback(async () => {
    return apiApp.colaborador.criar({
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      senha: dadosUsuario.senha,
      observacoes: dadosUsuario.observacoes,
      whatsapp: dadosUsuario.celular,
      cargos: cargosSelecionados.map((c) => c.id ?? ''),
      funcionalidades: permissoesSelecionadas,
      documentoFiscal: dadosUsuario.documentoFiscal,
    });
  }, [apiApp, cargosSelecionados, dadosUsuario, permissoesSelecionadas]);

  const updateColaborador = useCallback(async () => {
    if (!colabId) return [null, { message: 'Usuário não encontrado' }];

    return apiApp.colaborador.atualizar(colabId, {
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      senha: dadosUsuario.senha.trim().length > 0 ? dadosUsuario.senha : undefined,
      observacoes: dadosUsuario.observacoes,
      whatsapp: dadosUsuario.celular,
      cargos: cargosSelecionados.map((c) => c.id ?? ''),
      funcionalidades: permissoesSelecionadas,
      documentoFiscal: dadosUsuario.documentoFiscal,
    });
  }, [apiApp, colabId, cargosSelecionados, dadosUsuario, permissoesSelecionadas]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validation = colabId
        ? EditarDadosUsuarioSchema.safeParse(dadosUsuario)
        : CriarDadosUsuarioSchema.safeParse(dadosUsuario);

      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message ?? 'Dados inválidos', { duration: 3200 });
        return;
      }

      if (cargosSelecionados.length === 0) {
        toast.error('Selecione um cargo para o usuário');
        return;
      }

      if (permissoesSelecionadas.length === 0) {
        toast.error('Selecione pelo menos uma permissão para o usuário');
        return;
      }

      setLoadingApi(true);

      const [data, error] = colabId ? await updateColaborador() : await createColaborador();

      if (error) {
        toast.error(error.message);
        setLoadingApi(false);
        return;
      }

      if (data) {
        toast.success('Usuário salvo com sucesso');
        router.push('/app/configuracoes/permissoes-e-acessos');
      }
    },
    [
      colabId,
      createColaborador,
      updateColaborador,
      cargosSelecionados.length,
      permissoesSelecionadas.length,
      dadosUsuario,
      router,
    ]
  );

  useEffect(() => {
    (async () => {
      await Promise.all([fetchUsuarios(), fetchCargos()]);
      if (colabId) await fetchColaborador(colabId);
      setInitialLoading(false);
    })();
  }, [colabId, fetchUsuarios, fetchCargos, fetchColaborador]);

  if (initialLoading) {
    return (
      <main className="px-4 pt-6 pb-[12rem] md:px-10 md:py-10 bg-[#FEFEFE]">
        <LoadingGlobal />
      </main>
    );
  }

  return (
    <main className="px-4 pt-6 pb-[12rem] md:px-10 md:py-10 bg-[#FEFEFE]">
      <div className="w-full gap-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle title={colabId ? 'Editar usuário' : 'Adicionar usuário'} />
          <div className="h-3 justify-start items-start gap-2 inline-flex">
            <Link
              href="/app/configuracoes/permissoes-e-acessos"
              className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3"
            >
              Permissões e Acessos
            </Link>
            <div className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3">{'>'}</div>
            <div className="text-[#d33632] text-[10px] font-medium font-['BR Sonoma'] leading-3">
              {colabId ? 'Edição de usuário' : 'Adição de usuário'}
            </div>
          </div>
        </div>

        <UploadImage
          label="Editar foto"
          idUsuario={colaboradorData?.idUsuario || userId || ''}
          avatar={colaboradorData?.avatar}
          file={file}
          setFile={setFile}
          onUpload={uploadAvatar}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,25rem] gap-8 mt-8">
        {/* Formulário */}
        {cargosDisponiveis.length > 0 ? (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <div className="text-[#283855] text-lg font-semibold leading-snug">
                {colabId ? 'Editar dados de acesso' : 'Insira os dados de acesso'}
              </div>
              <div className="text-right">
                <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">(</span>
                <span className="text-[#d33632] text-[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
                <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                  ) Campos obrigatorios
                </span>
              </div>
            </div>

            <div>
              <Label>
                Nome
                <span className="text-[#d33632] text-[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
              </Label>
              <Input
                placeholder="Escreva o nome do usuário"
                className="bg-white"
                value={dadosUsuario.nome}
                onChange={(e) => setDadosUsuario((s) => ({ ...s, nome: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              <div>
                <Label>
                  E-mail
                  <span className="text-[#d33632] text=[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
                </Label>
                <Input
                  placeholder="Insira o e-mail do usuário"
                  className="bg-white"
                  value={dadosUsuario.email}
                  onChange={(e) => setDadosUsuario((s) => ({ ...s, email: e.target.value }))}
                />
              </div>

              <div>
                <Label>
                  CPF
                  <span className="text-[#d33632] text-[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  className="bg-white"
                  value={dadosUsuario.documentoFiscal}
                  onChange={(e) =>
                    setDadosUsuario((s) => ({ ...s, documentoFiscal: maskCPF(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Adicionar observações</Label>
              <textarea
                className="w-full h-[10rem] text-[#6C7788] bg-white resize-none focus-visible:ring-transparent rounded-[0.5rem] border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-red-600"
                placeholder="Escreva aqui"
                value={dadosUsuario.observacoes}
                onChange={(e) => setDadosUsuario((s) => ({ ...s, observacoes: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              <div>
                <Label>
                  Celular (WhatsApp)
                  <span className="text-[#d33632] text-[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
                </Label>
                <Input
                  placeholder="(00) 0 0000-0000"
                  className="bg-white"
                  value={dadosUsuario.celular}
                  onChange={(e) =>
                    setDadosUsuario((s) => ({ ...s, celular: maskCelular(e.target.value) }))
                  }
                />
              </div>

              <div>
                <Label>
                  Senha temporária
                  {!colabId && (
                    <span className="text-[#d33632] text-[10px] font-semibold font-['BR Sonoma'] leading-3">*</span>
                  )}
                </Label>
                <Input
                  placeholder="Senha temporária"
                  className="bg-white"
                  value={dadosUsuario.senha}
                  onChange={(e) => setDadosUsuario((s) => ({ ...s, senha: e.target.value }))}
                />
              </div>
            </div>

            {cargosDisponiveis.length > 0 && (
              <>
                <div className="text-[#283855] text-lg font-semibold leading-snug">
                  Selecione o cargo do usuário
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {cargosDisponiveis.map((cargo) => {
                    const selected = cargosSelecionados.some((c) => c.id === cargo.id);
                    return (
                      <div key={cargo.id} className="flex gap-2 items-start justify-start text-sm">
                        <InputRadioOption
                          id={cargo.id ?? ''}
                          selected={selected}
                          onChange={() => handleCargoChange(cargo)}
                        />
                        <label htmlFor={cargo.id ?? ''}>
                          <p className="text-sm pb-1">{cargo.cargo}</p>
                          <div className="text-[#657380] text-xs font-normal">
                            {formatarFuncionalidadesDoCargo(cargo.funcionalidades)}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="text-[#283855] text-lg font-semibold leading-snug">Permissões do usuário</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissoes.map((p) => (
                <div key={p.key} className="flex gap-2 items-center justify-start text-sm">
                  <InputRadioOption
                    id={p.key}
                    selected={permissoesSelecionadas.includes(p.key)}
                    onChange={() => handlePermissaoChange(p.key)}
                  />
                  <label htmlFor={p.key}>{p.label}</label>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-end mt-4">
              <Button type="submit" className="min-w-[140px]" disabled={loadingApi}>
                {loadingApi ? (
                  <Spinner color="white" width="22px" />
                ) : colabId ? (
                  'Atualizar dados'
                ) : (
                  'Adicionar acesso'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <NoData label="Sem cargos cadastrados para esta loja. Cadastre pelo menos um cargo para criar novos usuários." />
        )}

        {/* Últimos cadastrados */}
        <div className="flex flex-col gap-4 max-h-svh overflow-y-auto scrollbar-mini">
          <div className="text-[#485b7f] text-base font-semibold leading-tight md:block">
            Editar outros usuários
          </div>

          <div className="scrollbar-mini">
            <div className="grid grid-cols-1 gap-4">
              {!loadingUsuarios &&
                listaUsuarios.length > 0 &&
                listaUsuarios.map((user) => (
                  <CardColaboradorUser key={user.id} colaborador={user} onDelete={() => { }} />
                ))}

              {!loadingUsuarios && listaUsuarios.length === 0 && <NoData />}

              {loadingUsuarios && <LoadingGlobal />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
