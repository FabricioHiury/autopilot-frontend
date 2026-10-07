import { useEffect, useRef, useState } from 'react';
import Input from '@/components/inputs/text/Input';
import Pass from '@/components/inputs/password/Pass';
import UploadImage from '@/components/cards/UploadImage';
import InputPesquisarBlue from '@/components/commons/inputs/input-pesquisar-blue';
import { cn } from '@/lib/class-name.utils';
import { apiAdmin } from '@/utils/classes/api';
import toast from 'react-hot-toast';
import { z } from '@/lib/zod';
import validateInputs from '@/utils/classes/sanitizer/validate';
import Spinner from '@/components/loading/Spinner';
import { Admin } from '@/types/customer';
import Avatar from '@/components/cards/Avatar';
import CardStatus from '@/components/cards/CardStatus';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, resetSignal, sendSignal } from '@/redux/store';
import { profileImageUrl } from '@/lib/profile.utils';

const conviteJson = [
  {
    title: 'Detalhes do E-mail',
    content: 'Um e-mail com instruções e dados de acesso foi enviado para fernando@radial.com',
  },
  {
    title: 'Próximo passo',
    content:
      'O usuário deverá seguir o endereço no e-mail para configurar sua senha e acessar o sistema.',
  },
  {
    title: 'Informações de Suporte',
    content:
      'Caso o usuário não receba o e-mail em alguns minutos, verifique a pasta de spam ou entre em contato com o suporte.',
  },
];

function ConviteJson() {
  return (
    <div className="flex flex-col gap-3">
      {conviteJson.map((obj, i) => {
        return (
          <div className="flex flex-col" key={i}>
            <b className="text-[#24292E] text-[16px] font-semibold">{obj.title}</b>
            <span className="text-[10px] text-[#788590] font-medium text-left">{obj.content}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PopAdministrador({
  currentUsuario,
  close,
}: {
  currentUsuario: Admin | undefined;
  close: Function;
}) {
  const criarAdmin = z
    .object({
      name: z.string().min(1, 'Campo nome não pode ser vazio').default(''),
      email: z.string().email({ message: 'Email não é valido' }).default(''),
      password: z.string().default(''),
      notes: z.string().default(''),
      permissions: z.string().array().default([]),
      file: z.instanceof(File).optional(),
    })
    .default({})
    .superRefine(async (obj, ctx) => {
      if (!validateInputs.senhaForte(obj.password) && !currentUsuario) {
        ctx.addIssue({
          code: 'custom',
          message: 'Senha não é forte o suficiente',
        });
        return z.NEVER;
      }
      if (obj.permissions.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Forneça pelo menos uma permissão ao usuário',
        });
        return z.NEVER;
      }

      const { file, ...form } = obj;

      if (currentUsuario) {
        const [response, error] = await apiAdmin.put(
          `/backoffice/admin/user/${currentUsuario.id}/edit`,
          {
            name: form.name,
            email: form.email,
            status: status ? 'active' : 'inactive',
          },
        );
        if (error) {
          ctx.addIssue({
            code: 'custom',
            message: error.message,
          });
          return z.NEVER;
        }

        const novasPermissoes = form.permissions.filter((obj, i) => {
          if (!currentUsuario.permissions.includes(obj)) {
            return obj;
          }
        });
        const deletarPermissoes = currentUsuario.permissions.filter((obj, i) => {
          if (!form.permissions.includes(obj)) {
            return obj;
          }
        });

        const [responsePermissoes, errorPermissoes] = await apiAdmin.put(
          `/backoffice/admin/user/${currentUsuario.id}/grant-permissions`,
          {
            permissions: novasPermissoes,
          },
        );

        if (errorPermissoes) {
          ctx.addIssue({
            code: 'custom',
            message: errorPermissoes.message,
          });
          return z.NEVER;
        }
        const [responseDelPermissoes, errorDelPermissoes] = await apiAdmin.delete(
          `/backoffice/admin/user/${currentUsuario.id}/remove-permissions`,
          {
            permissions: deletarPermissoes,
          },
        );

        if (errorDelPermissoes) {
          ctx.addIssue({
            code: 'custom',
            message: errorPermissoes.message,
          });
          return z.NEVER;
        }
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          await apiAdmin.formData(`/avatar/user/${currentUsuario.id}`, formData, 'POST');
        }

        dispatch(
          sendSignal({
            signal: 'openModalSucess',
            data: {
              label: 'Alterações salvas com sucesso',
              subLabel: `As configuraçõs de ${form.name} foram salvas com sucesso`,
            },
          }),
        );
      } else {
        const [response, error] = await apiAdmin.post(
          `/backoffice/admin/register-user-admin`,
          form,
        );
        if (error) {
          ctx.addIssue({
            code: 'custom',
            message: error.message,
          });
          return z.NEVER;
        }
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          await apiAdmin.formData(`/avatar/user/${response.data.id}`, formData, 'POST');
        }
        dispatch(
          sendSignal({
            signal: 'openModalSucess',
            data: {
              label: 'Convite enviado com sucesso',
              subLabel: `O usuário ${form.name} foi convidado para acessar o sistema`,
              extra: <ConviteJson />,
            },
          }),
        );
      }
      setTimeout(() => {
        dispatch(
          sendSignal({
            signal: 'reloadUsers',
            data: {},
          }),
        );
      }, 80);
      setTimeout(() => dispatch(resetSignal()), 120);
    });

  const dispatch = useDispatch();

  const messager = useSelector((state: RootState) => state);

  const [search, setPesquisa] = useState<string>('');
  const [recursos, setRecursos] = useState<{ label: string; selected: boolean }[]>([]);
  const [loadingRecursos, setLoadingRecursos] = useState<boolean>(true);
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    notes: '',
    permissions: [],
    file: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean>(false);
  const [finish, setFinish] = useState<boolean>(true);

  function updateForm(value: any, type: string) {
    setData((prev) => ({
      ...prev,
      [type]: value,
    }));
  }
  function setFile(file: File) {
    updateForm(file, 'file');
  }

  async function postData() {
    setLoading(true);
    const form = await criarAdmin.safeParseAsync(data);
    setLoading(false);
    if (!form.success) {
      return toast.error(form.error.issues[0].message);
    }
    toast.success(
      currentUsuario ? `${data.name} editado com sucesso` : `${data.name} cadastrado com sucesso`,
    );
    return close();
  }
  async function loadRecursos() {
    setLoadingRecursos(true);
    const [response, error] = await apiAdmin.get(`/backoffice/admin/list-permissions`);
    if (error) {
      return toast.error(error.message);
    }
    setRecursos(
      response.data.map((obj: string) => {
        return { label: obj, selected: false };
      }),
    );
    setTimeout(() => {
      setLoadingRecursos(false);
    }, 400);
  }

  useEffect(() => {
    loadRecursos();
  }, []);

  useEffect(() => {
    if (loadingRecursos) return;
    if (!currentUsuario) {
      setData({
        name: '',
        email: '',
        password: '',
        notes: '',
        permissions: [],
        file: undefined,
      });
      return;
    }
    setData({
      name: currentUsuario.name ?? '',
      email: currentUsuario.email ?? '',
      password: '',
      notes: '',
      permissions: [],
      file: undefined,
    });
    setRecursos((old: any) =>
      old.map((obj: any) => ({
        ...obj,
        selected: currentUsuario.permissions.includes(obj.label),
      })),
    );
    setStatus(currentUsuario.status === 'active' ? true : false);
  }, [currentUsuario, loadingRecursos]);

  useEffect(() => {
    updateForm(
      recursos
        .map((obj) => {
          if (obj.selected) {
            return obj.label;
          }
        })
        .filter((obj) => obj),
      'permissions',
    );
  }, [recursos]);

  return (
    <>
      <div className="flex flex-col items-start w-full mt-4">
        {currentUsuario ? (
          <div className="flex flex-row w-full justify-between">
            <AvatarExistente currentUsuario={currentUsuario} file={data.file} setFile={setFile} />
            <Switch ativo={status} setAtivo={setStatus} />
          </div>
        ) : (
          <UploadImage
            label="Insira uma imagem"
            file={data.file}
            userId={''}
            setFile={(file) => setFile(file as File)}
            onUpload={() => {}}
          />
        )}

        <div className="flex flex-col gap-5 mt-7 w-full">
          <Input
            value={data.name || ''}
            label="Nome do usuário"
            placeholder="e.g Lucas Silva"
            onChange={(event) => {
              updateForm(event.target.value, 'name');
            }}
          />
          <Input
            value={data.email || ''}
            label="E-mail"
            placeholder="e.g lucas@email.com"
            onChange={(event) => {
              updateForm(event.target.value, 'email');
            }}
          />
          {currentUsuario ? (
            ''
          ) : (
            <Pass
              label="Senha inicial"
              placeholder="e.g Senha@1234"
              onChange={(event) => {
                updateForm(event.target.value, 'password');
              }}
            />
          )}
        </div>
        <h2 className="text-[hsl(var(--secondary))] text-[20px] font-semibold mt-7">
          Quais recursos o usuário terá acesso
        </h2>
        <Recursos
          search={search}
          setPesquisa={setPesquisa}
          recursos={recursos}
          setRecursos={setRecursos}
        />
        <h2 className="text-[hsl(var(--secondary))] text-[16px] font-semibold mt-6">
          Adicionar observações
        </h2>
        <textarea
          className="outline-none scroll-padrao border rounded-md mt-2 resize-none w-full text-[14px] p-4"
          placeholder="Adicione uma observação"
          onChange={(event) => {
            updateForm(event.target.value, 'notes');
          }}
          value={data.notes}
        ></textarea>
        <div className="grid grid-cols-2 mt-4 gap-2 w-full">
          <button
            onClick={postData}
            disabled={loading}
            className="bg-[hsl(var(--secondary))]   justify-center
                text-white p-4 rounded-lg col-span-2 lg:col-span-1 flex-grow flex items-center font-semibold text-[14px] gap-2"
          >
            {loading ? (
              <Spinner color="white" width="20px" />
            ) : (
              <>{currentUsuario ? 'Finalizar' : 'Enviar convite'}</>
            )}
          </button>
          <button
            onClick={() => close()}
            disabled={loading}
            className="justify-center col-span-2 lg:col-span-1
                text-[#586E9D] border border-[#586E9D] p-4 rounded-lg flex-grow flex items-center font-semibold text-[14px] gap-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}

function Recursos({
  setPesquisa,
  search,
  recursos,
  setRecursos,
}: {
  search: string;
  setPesquisa: Function;
  recursos: { label: string; selected: boolean }[];
  setRecursos: Function;
}) {
  const filtrados = recursos.filter((obj) =>
    obj.label.toLowerCase().includes(search.toLowerCase()),
  );

  function select(obj: any) {
    setRecursos((old: any) => {
      const updatedList = old.map((item: any, i: number) => ({
        ...item,
        selected: obj.label === item.label ? !item.selected : item.selected,
      }));
      return updatedList;
    });
  }
  return (
    <div className="flex flex-col mt-2 gap-3 w-full items-start">
      <div className="flex flex-wrap gap-3">
        {recursos
          .filter((obj) => obj.selected)
          .map((obj, i) => {
            return (
              <div
                key={i}
                className="flex items-center bg-[#E3EBF3] rounded-lg p-2 gap-2 text-[12px] text-[#24292E] font-semibold"
              >
                {obj.label}
                <button onClick={() => select(obj)}>
                  <svg width="8" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.229 0.757812L0.743723 9.24309"
                      stroke="#24292E"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0.743652 0.757812L9.22893 9.24309"
                      stroke="#24292E"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
      </div>
      <div className="flex flex-col w-full">
        <InputPesquisarBlue
          className="w-full"
          placeholder="Pesquisar"
          onChange={(value) => {
            setPesquisa(value);
          }}
          value={search}
        />
      </div>
      <div className="flex flex-col gap-3 h-[180px] w-full scroll-padrao overflow-y-auto">
        {filtrados.map((obj, i) => {
          return (
            <div
              key={i}
              className="flex items-center w-full justify-between text-[#434D56] text-[14px] font-semibold p-5 py-4 border-b border-[#EDF2F7]"
            >
              {obj.label}
              <button
                className={cn(
                  'p-[2px] rounded-sm  border border-[#586E9D] aspect-square',
                  obj.selected ? 'bg-[#586E9D]' : '',
                )}
                onClick={() => select(obj)}
              >
                <img src="/icons/check.svg" className={obj.selected ? '' : 'opacity-0'} alt="" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvatarExistente({
  currentUsuario,
  file,
  setFile,
}: {
  currentUsuario: Admin;
  file: File | undefined;
  setFile: Function;
}) {
  const imageContainer = useRef<HTMLInputElement>(null);
  const [tmpImage, setTmpImage] = useState<string>('');
  async function onInputFile(event: any) {
    const tmp = event.target.files[0];

    if (tmp) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        setTmpImage(result);
      };
      reader.readAsDataURL(tmp);
      setFile(tmp);
    }
  }
  function abrirInput() {
    if (imageContainer.current) imageContainer.current.click();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex relative">
        {file ? (
          <button
            className="w-12 lg:w-14 overflow-hidden rounded-full aspect-square "
            onClick={abrirInput}
          >
            <img className="object-cover" src={tmpImage} alt="" />
          </button>
        ) : (
          <Avatar
            width="w-12 lg:w-14"
            user={{
              name: currentUsuario.name,
              icon: profileImageUrl(currentUsuario.id).toString(),
            }}
            onClick={abrirInput}
          />
        )}
        <div className="flex p-1 bg-[#DDE6F2] border-2 pointer-events-none border-white absolute bottom-0 rounded-full right-0">
          <svg
            width="12"
            height="10"
            viewBox="0 0 12 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.0691528 2.62804C0.0691528 2.15612 0.256626 1.70351 0.59033 1.36981C0.924035 1.03611 1.37664 0.848633 1.84856 0.848633H10.1525C10.6244 0.848633 11.077 1.03611 11.4107 1.36981C11.7444 1.70351 11.9319 2.15612 11.9319 2.62804V7.37314C11.9319 7.84507 11.7444 8.29767 11.4107 8.63138C11.077 8.96508 10.6244 9.15255 10.1525 9.15255H1.84856C1.37664 9.15255 0.924035 8.96508 0.59033 8.63138C0.256626 8.29767 0.0691528 7.84507 0.0691528 7.37314V2.62804ZM5.40739 5.00059C5.40739 4.84328 5.46988 4.69242 5.58111 4.58118C5.69235 4.46995 5.84322 4.40746 6.00052 4.40746C6.15783 4.40746 6.3087 4.46995 6.41994 4.58118C6.53117 4.69242 6.59366 4.84328 6.59366 5.00059C6.59366 5.1579 6.53117 5.30877 6.41994 5.42C6.3087 5.53124 6.15783 5.59373 6.00052 5.59373C5.84322 5.59373 5.69235 5.53124 5.58111 5.42C5.46988 5.30877 5.40739 5.1579 5.40739 5.00059ZM6.00052 3.22118C5.5286 3.22118 5.076 3.40865 4.74229 3.74236C4.40859 4.07606 4.22111 4.52866 4.22111 5.00059C4.22111 5.47252 4.40859 5.92512 4.74229 6.25883C5.076 6.59253 5.5286 6.78001 6.00052 6.78001C6.47245 6.78001 6.92505 6.59253 7.25876 6.25883C7.59246 5.92512 7.77994 5.47252 7.77994 5.00059C7.77994 4.52866 7.59246 4.07606 7.25876 3.74236C6.92505 3.40865 6.47245 3.22118 6.00052 3.22118Z"
              fill="hsl(var(--secondary))"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-0 lg:leading-5">
        <b className="text-[#24292E] text-[12px] lg:text-[20px]">{currentUsuario.name}</b>
        <span className="text-[10px] lg:text-[16px] text-[#657380]">{currentUsuario.email}</span>
      </div>
      <input
        type="file"
        accept=".png,.jpeg,.webp,.jpg"
        onChange={onInputFile}
        className="absolute hidden"
        ref={imageContainer}
      />
    </div>
  );
}

function Switch({ setAtivo, ativo }: { setAtivo: Function; ativo: boolean }) {
  return (
    <div className="flex flex-row items-center justify-start w-[120px] gap-3">
      <button
        className="w-[40px] h-[22px] items-center flex px-1 rounded-3xl bg-[#E3EBF3] relative"
        onClick={() => setAtivo((old: boolean) => !old)}
      >
        <div
          className={cn(
            'absolute bg-[#586E9D] h-[14px] rounded-full aspect-square duration-500 ease-in-out',
            ativo ? 'translate-x-[18px]' : 'translate-x-0',
          )}
        ></div>
      </button>
      <CardStatus status={ativo} />
    </div>
  );
}
