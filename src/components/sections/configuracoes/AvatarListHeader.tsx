"use client"

import AvatarUser from "@/components/commons/avatar-user";
import LinkButtonAdd from "@/components/commons/buttons/link-button-add";
import CenterModal from "@/components/commons/modais/center-modal";
import { IconDivider } from "@/components/icons/icon-divider";
import { IconEdit } from "@/components/icons/icon-edit";
import Pass from "@/components/inputs/password/Pass";
import Spinner from "@/components/loading/Spinner";
import { ApiApp } from "@/lib/api-app";
import { getUserStorageId, loadStoreInfo } from "@/lib/user.utils";
import { profileImageUrl } from "@/lib/profile.utils";
import { cn } from "@/lib/class-name.utils";
import api from "@/utils/classes/api";
import validateInputs from "@/utils/classes/sanitizer/validate";
import { ColaboradorType } from "@/utils/types/colaborador-type";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Loja } from "@/lib/loja-schema";
import { AlertDialog } from "@/components/commons/modais/alert-dialog";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/webp", "image/png"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const schemaPassword = z.object({ senha: z.string(), repetirSenha: z.string() }).superRefine(async (obj, ctx) => {
  if (obj.senha.length > 0) {
    if (!validateInputs.senhaForte(obj.senha)) {
      ctx.addIssue({
        message: "Senha não é forte suficiente",
        code: "custom",
      })
      return
    }

    if (obj.senha !== obj.repetirSenha) {
      ctx.addIssue({
        message: "Senhas devem ser iguais",
        code: "custom",
      })
      return
    }

    const [_, error] = await api.put(`/usuario/${getUserStorageId()}/alterar-senha`, {
      senha: obj.senha
    })

    if (error) {
      ctx.addIssue({
        message: error.message,
        code: "custom"
      })
      return
    }
  }
})

interface AvatarListHeaderProps {
  title: string;
  total: number;
  users: {
    id: string;
    nome: string;
  }[];
}

export function AvatarListHeader(props: AvatarListHeaderProps) {
  const displayedImgs = props.users.slice(0, 10);
  const extraImgsCount = props.total - displayedImgs.length;
  
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[#434D56] text-[0.75rem] font-medium">{props.title}</p>
      <div className="flex -space-x-3 relative">
        {displayedImgs.map((item, index) => (
          <div key={item.id} className="relative">
            <AvatarUser
              name={item.nome}
              src={profileImageUrl(item.id)}
              size={2}
            />
            {index === displayedImgs.length - 1 && extraImgsCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <span className="text-xs font-semibold text-white">{`+${extraImgsCount + 1}`}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsersListHeader() {
  const api = new ApiApp();
  const [users, setUsers] = useState<ColaboradorType[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [alertDialog, setAlertDialog] = useState<{ message: string; variant: "info" | "error" | "success" | "warning" } | null>(null)

  const fetchUsers = async () => {
    const [data, error] = await api.colaborador.listar({
      pagina: 1,
      quantidade: 10,
    });

    if (error || !data) {
      setAlertDialog({ message: 'Erro ao buscar usuários', variant: 'error' });
      return;
    }

    const colaboradores = data.colaboradores;

    setUsers(colaboradores);
    setTotalUsers(data.totalColaboradores);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="hidden md:block text-[12px] text-[#434D56] font-semibold">LOGIN DE CADASTRO</p>
      <div className="flex flex-col flex-wrap gap-2 lg:gap-6 lg:flex-row justify-between items-start md:items-center w-full">
        <div className="flex flex-col flex-wrap md:flex-row items-start gap-2 lg:gap-6 md:items-center">
          <CardStoreAccess />
          <div className="flex flex-wrap md:flex-row items-start gap-6 md:items-center">
            <div className="hidden md:block">
              <IconDivider fill="#C8CCD2" />
            </div>
            <AvatarListHeader
              title="COLABORADORES CADASTRADOS"
              total={totalUsers}
              users={users.map((user) => {
                return {
                  nome: user.nome,
                  id: user.idUsuario
                }
              })
              } />
          </div>
        </div>

        <LinkButtonAdd title="Adicionar novo acesso" href={'/app/configuracoes/permissoes-e-acessos/usuario'} />
      </div>

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

export function CardStoreAccess() {
  const [data, setData] = useState<{ senha: string, repetirSenha: string }>({
    senha: "",
    repetirSenha: "",
  })

  const [store, setStore] = useState<Loja>();
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function loadStore() {
    const store = await loadStoreInfo()

    setData({
      senha: "",
      repetirSenha: ""
    })

    setStore(store)
    setImage(store.urlFoto)
  }

  async function savePassword() {
    setLoading(true)
    const form = await schemaPassword.safeParseAsync(data)
    setLoading(false)
    if (!form.success) {
      return toast.error(form.error.issues[0].message)
    }
    return toast.success("Dados de acesso salvos")
  }

  const uploadImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato de arquivo inválido. Use JPG, JPEG, PNG ou WEBP.");
      if (input.current) input.current.value = "";

      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Arquivo muito grande. Máximo de 5MB.");
      if (input.current) input.current.value = "";

      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const [response, error] = await api.uploadFile(
      `/loja/update-logo`,
      formData,
      "POST"
    );

    if (error) {
      throw new Error(error.message);
    }

    if (response?.url) {
      setImage(response.url);
    } else {
      setImage(null);
    }
  }, []);

  useEffect(() => {
    loadStore()
  }, [])

  return (
    <div className="flex items-center gap-5">
      <input
        type="file"
        name=""
        onChange={uploadImage}
        className="hidden absolute"
        accept={ACCEPTED_TYPES.join(",")}
        ref={input}
        id=""
      />

      <div className="flex gap-5 items-center">
        {(store && localStorage) &&
          <div className="flex items-center gap-2">
            <span className="text-white rounded-full h-[3.5rem] w-[3.5rem] flex items-center justify-center text-[1rem] font-semibold leading-none">
              <AvatarUser name={store?.nomeEmpresa ?? ""} size={3} src={image ?? ""} tooltip={false} />
            </span>

            <div className="flex flex-col">
              <p className="text-[#24292E] font-semibold text-[1rem] leading-none">{store?.nomeEmpresa ?? ""}</p>
              <p className="text-[#657380] text-[.75rem]">{store?.lojista.usuario.email ?? ""}</p>
            </div>
          </div>
        }
      </div>

      <button onClick={() => { setOpenModal(true) }} className="block transition-opacity opacity-20 hover:opacity-100">
        <IconEdit fill="#434D56" />
      </button>

      {(store && openModal) &&
        <CenterModal onClose={() => { setOpenModal(false) }} idSelector="content-container" >
          <div className="flex items-center gap-24 justify-between">
            <span className="text-[#293856] font-semibold">Editar dados de acesso</span>

            <button onClick={() => setOpenModal(false)}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.07406 0.926025L1.74072 8.25936M9.07406 8.25936L1.74072 0.926024" stroke="#293856" strokeWidth="1.54939" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              className="w-[56px] aspect-square flex-shrink-0"
              onClick={() => {
                if (input.current)
                  input.current.click()
              }}>

              <AvatarUser name={store?.nomeEmpresa ?? ""} size={3.5} src={image ?? ""} tooltip={false} />
            </button>

            <div className="flex flex-col">
              <b className="text-[16px] text-black font-semibold">{store?.nomeEmpresa ?? ""}</b>
              <span className="text-[12px] leading-3 font-normal text-[#7F8999]">{store?.lojista.usuario.email ?? ""}</span>
              <span className="text-[12px] font-normal text-[#7F8999]">{store?.cnpj}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Pass
              placeholder="Insira sua senha"
              icon="/icons/cad.svg"
              label="Editar senha"
              onChange={(value) => {
                setData((old: any) => { return { ...old, senha: value.target.value } })
              }}
            />

            <Pass
              placeholder="Repita sua senha"
              icon="/icons/cad.svg"
              label="Repetir senha"
              onChange={(value) => {
                setData((old: any) => { return { ...old, repetirSenha: value.target.value } })
              }}
            />

            <button
              onClick={savePassword}
              disabled={loading}
              className={cn("bg-[#293856] flex justify-center items-center hover:bg-slate-500 duration-500 ease-in-out text-[#F2F4F7] rounded-lg font-semibold text-[14px] p-2", (loading ? "bg-slate-500" : ""))}>
              {loading
                ?
                <Spinner width="24px" color="white" />
                :
                "Salvar e alterar"
              }

            </button>
          </div>
        </CenterModal>
      }
    </div>
  )
}