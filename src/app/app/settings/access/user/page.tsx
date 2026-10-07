'use client';
import { roleLabel } from '@/lib/presentation-labels';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from '@/lib/zod';

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

import { StorePermissionLabels } from '@/types/permissions';
import { Role } from '@/types/role';
import { Employee } from '@/types/employee';
import { maskCPF } from '@/utils/classes/format/maskCpf';
import { maskCelular } from '@/utils/classes/format/maskCelular';
import { AppServices } from '@/services/app.services';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';

const CriarDadosUsuarioSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.').nonempty('E-mail é obrigatório.'),
  password: z.string().min(4, 'A senha é obrigatória.'),
  notes: z.string().optional(),
  mobile: z
    .string()
    .min(1, 'O número de celular é obrigatório.')
    .regex(/^\(\d{2}\)\s?\d\s?\d{4}-\d{4}$/, 'Formato inválido. Use: (00) 0 0000-0000'),
  taxId: z
    .string()
    .min(1, 'O CPF é obrigatório.')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use: 000.000.000-00'),
});

const EditarDadosUsuarioSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('E-mail inválido.').min(5, 'E-mail é obrigatório.'),
  password: z.string().optional(),
  notes: z.string().optional(),
  mobile: z
    .string()
    .min(1, 'O número de celular é obrigatório.')
    .regex(/^\(\d{2}\)\s?\d\s?\d{4}-\d{4}$/, 'Formato inválido. Use: (00) 0 0000-0000'),
  taxId: z
    .string()
    .min(1, 'O CPF é obrigatório.')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use: 000.000.000-00'),
});

export default function ConfigAdicionarUsuarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const colabId = searchParams.get('id');
  const userId = searchParams.get('userId');

  const apiApp = useMemo(() => new AppServices(), []);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);
  const [loadingApi, setLoadingApi] = useState<boolean>(false);

  const [listaUsuarios, setListaUsuarios] = useState<Employee[]>([]);
  const [cargosDisponiveis, setCargosDisponiveis] = useState<Role[]>([]);
  const [colaboradorData, setColaboradorData] = useState<Employee | null>(null);

  const [file, setFile] = useState<File | undefined>(undefined);
  const [cargosSelecionados, setCargosSelecionados] = useState<Role[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);

  const [dadosUsuario, setDadosUsuario] = useState({
    name: '',
    email: '',
    password: '',
    notes: '',
    mobile: '',
    taxId: '',
  });

  const permissions = useMemo(
    () => Object.entries(StorePermissionLabels).map(([key, label]) => ({ key, label })),
    [],
  );

  const formatarFuncionalidadesDoCargo = useCallback(
    (funcs: string[]) =>
      funcs
        .map((f) => StorePermissionLabels[f as keyof typeof StorePermissionLabels] ?? f)
        .join(', '),
    [],
  );

  const syncPermissoesComCargos = useCallback((roles: Role[]) => {
    const set = new Set<string>();
    roles.forEach((c) => c.features.forEach((f) => set.add(f)));
    setPermissoesSelecionadas(Array.from(set));
  }, []);

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    const [data, error] = await apiApp.employee.list({ limit: 100 });
    if (!error && data?.employees) setListaUsuarios(data.employees);
    setLoadingUsuarios(false);
  }, [apiApp]);

  const fetchCargos = useCallback(async () => {
    const [data] = await apiApp.role.list();
    if (data) setCargosDisponiveis(data);
  }, [apiApp]);

  const fetchColaborador = useCallback(
    async (id: string) => {
      const [data] = await apiApp.employee.get(id);
      if (!data) return;

      setColaboradorData(data);
      setDadosUsuario({
        name: data.name,
        email: data.email,
        notes: data.notes || '',
        mobile: data.whatsapp,
        taxId: data.taxId,
        password: '',
      });

      setCargosSelecionados(data.roles || []);
      setPermissoesSelecionadas(data.features || []);
    },
    [apiApp],
  );

  const uploadAvatar = useCallback(
    async (userId: string, fileToUpload: File) => {
      if (!userId || userId.trim() === '') {
        toast.error('ID do usuário não encontrado');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      try {
        const [response, error] = await api.uploadFile(`/avatar/user/${userId}`, formData, 'POST');
        if (error) {
          toast.error(error.message || 'Erro ao enviar da imagem');
        } else {
          toast.success('Imagem atualizada com sucesso!');

          const avatarUrl = response?.url || response?.avatar || '';

          if (colaboradorData) {
            setColaboradorData({
              ...colaboradorData,
              avatar: avatarUrl,
            });
          }

          setListaUsuarios((prevLista) =>
            prevLista.map((user) =>
              user.userId === userId ? { ...user, avatar: avatarUrl } : user,
            ),
          );
        }
      } catch (err) {
        console.error('Erro no upload:', err);
        toast.error('Erro ao enviar da imagem');
      }
    },
    [colaboradorData],
  );

  const handleCargoChange = useCallback(
    (role: Role) => {
      const selected = cargosSelecionados.some((c) => c.id === role.id);
      const novos = selected
        ? cargosSelecionados.filter((c) => c.id !== role.id)
        : [...cargosSelecionados, role];

      setCargosSelecionados(novos);
      syncPermissoesComCargos(novos);
    },
    [cargosSelecionados, syncPermissoesComCargos],
  );

  const handlePermissaoChange = useCallback((permissaoKey: string) => {
    setPermissoesSelecionadas((prev) =>
      prev.includes(permissaoKey)
        ? prev.filter((p) => p !== permissaoKey)
        : [...prev, permissaoKey],
    );
  }, []);

  const createColaborador = useCallback(async () => {
    return apiApp.employee.create({
      name: dadosUsuario.name,
      email: dadosUsuario.email,
      password: dadosUsuario.password,
      notes: dadosUsuario.notes,
      whatsapp: dadosUsuario.mobile,
      roles: cargosSelecionados.map((c) => c.id ?? ''),
      features: permissoesSelecionadas,
      taxId: dadosUsuario.taxId,
    });
  }, [apiApp, cargosSelecionados, dadosUsuario, permissoesSelecionadas]);

  const updateColaborador = useCallback(async () => {
    if (!colabId) return [null, { message: 'Usuário não encontrado' }];

    return apiApp.employee.update(colabId, {
      name: dadosUsuario.name,
      email: dadosUsuario.email,
      password: dadosUsuario.password.trim().length > 0 ? dadosUsuario.password : undefined,
      notes: dadosUsuario.notes,
      whatsapp: dadosUsuario.mobile,
      roles: cargosSelecionados.map((c) => c.id ?? ''),
      features: permissoesSelecionadas,
      taxId: dadosUsuario.taxId,
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
        router.push('/app/settings/access');
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
    ],
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
              href="/app/settings/access"
              className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3"
            >
              Permissões e Acessos
            </Link>
            <div className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3">
              {'>'}
            </div>
            <div className="text-[hsl(var(--primary))] text-[10px] font-medium font-['BR Sonoma'] leading-3">
              {colabId ? 'Edição de usuário' : 'Adição de usuário'}
            </div>
          </div>
        </div>

        <UploadImage
          label="Editar foto"
          userId={colaboradorData?.userId || userId || ''}
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
                <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                  (
                </span>
                <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                  *
                </span>
                <span className="text-[#6b7687] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                  ) Campos obrigatorios
                </span>
              </div>
            </div>

            <div>
              <Label>
                Nome
                <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                  *
                </span>
              </Label>
              <Input
                placeholder="Escreva o nome do usuário"
                className="bg-white"
                value={dadosUsuario.name}
                onChange={(e) => setDadosUsuario((s) => ({ ...s, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              <div>
                <Label>
                  E-mail
                  <span className="text-[hsl(var(--primary))] text=[10px] font-semibold font-['BR Sonoma'] leading-3">
                    *
                  </span>
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
                  <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                    *
                  </span>
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  className="bg-white"
                  value={dadosUsuario.taxId}
                  onChange={(e) =>
                    setDadosUsuario((s) => ({ ...s, taxId: maskCPF(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Adicionar observações</Label>
              <textarea
                className="w-full h-[10rem] text-[#6C7788] bg-white resize-none focus-visible:ring-transparent rounded-[0.5rem] border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-red-600"
                placeholder="Escreva aqui"
                value={dadosUsuario.notes}
                onChange={(e) => setDadosUsuario((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              <div>
                <Label>
                  Celular (WhatsApp)
                  <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                    *
                  </span>
                </Label>
                <Input
                  placeholder="(00) 0 0000-0000"
                  className="bg-white"
                  value={dadosUsuario.mobile}
                  onChange={(e) =>
                    setDadosUsuario((s) => ({ ...s, mobile: maskCelular(e.target.value) }))
                  }
                />
              </div>

              <div>
                <Label>
                  Senha temporária
                  {!colabId && (
                    <span className="text-[hsl(var(--primary))] text-[10px] font-semibold font-['BR Sonoma'] leading-3">
                      *
                    </span>
                  )}
                </Label>
                <Input
                  placeholder="Senha temporária"
                  className="bg-white"
                  value={dadosUsuario.password}
                  onChange={(e) => setDadosUsuario((s) => ({ ...s, password: e.target.value }))}
                />
              </div>
            </div>

            {cargosDisponiveis.length > 0 && (
              <>
                <div className="text-[#283855] text-lg font-semibold leading-snug">
                  Selecione o cargo do usuário
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {cargosDisponiveis.map((role) => {
                    const selected = cargosSelecionados.some((c) => c.id === role.id);
                    return (
                      <div key={role.id} className="flex gap-2 items-start justify-start text-sm">
                        <InputRadioOption
                          id={role.id ?? ''}
                          selected={selected}
                          onChange={() => handleCargoChange(role)}
                        />
                        <label htmlFor={role.id ?? ''}>
                          <p className="text-sm pb-1">{roleLabel(role.role)}</p>
                          <div className="text-[#657380] text-xs font-normal">
                            {formatarFuncionalidadesDoCargo(role.features)}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="text-[#283855] text-lg font-semibold leading-snug">
              Permissões do usuário
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map((p) => (
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
                  <CardColaboradorUser key={user.id} employee={user} onDelete={() => {}} />
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
