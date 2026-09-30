


import Avatar from "@/components/cards/Avatar";
import AvatarBig from "@/components/cards/AvatarBig";
import IconImage from "@/components/ui/IconImage";
import { useEffect, useRef, useState } from "react";
import { Cliente } from "@/utils/types/cliente.type";
import handleText from "@/utils/classes/format/text";
import sanitizar from "@/utils/classes/sanitizer/sanitizer";
import handleDate from "@/utils/classes/format/time";
import { useObserver } from "@/contexts/observer.context";
import api from "@/utils/classes/api";
import toast from "react-hot-toast";
import axios from "axios";
import { profileImageUrl } from "@/lib/profile.utils";

interface props {
  aboutCliente: Cliente
}
const ClienteInfoSection: React.FC<props> = ({ aboutCliente }) => {

  console.log(aboutCliente)
  const { observer, setObserver } = useObserver()
  const [imageTmp, setImageTmp] = useState<string>()
  const imageRef = useRef<HTMLInputElement>(null)

  const [clientePertence, setClientePertence] = useState<boolean>()

  function check() {
    const data = JSON.parse(localStorage.getItem("usuario") ?? "")
    if (data.idLoja === aboutCliente.idLoja) {
      setClientePertence(true)
    }
  }

  useEffect(() => {
    check()
  }, [])
  function editarCliente() {
    setObserver({
      tipo: "abrirPopClienteEditar",
      data: aboutCliente
    })
  }


  async function uploadFile(event: any) {
    const tmp = event.target.files[0]
    if (tmp) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        setImageTmp(result);
      };
      reader.readAsDataURL(tmp);
    }
    const formData = new FormData()

    formData.append("file", tmp)
    
    const [response, error] = await api.formData(`/avatar/usuario/${aboutCliente.id}`, formData, "POST")
    if (error) {
      return toast.error(error.message)
    }
  }


  return (

    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-full flex-grow xl:flex-shrink-0 xl:w-[412px] xl:max-w-[412px] bg-white rounded-lg">

      <div className="flex items-center gap-4">
        <IconImage rounded="100%" icon="/icons/arrow_3.svg" onClick={() => window.history.back()} />
        <h2 className="text-[#334568] text-[16px] font-semibold">Página do Cliente</h2>
      </div>

      <div className="flex items-start text-[#293856] flex-col gap-1">
        <input type="file" accept="*.png.*.jpeg" onChange={uploadFile} className="hidden" ref={imageRef} />
        <button className={"hover:brightness-75 "} disabled={!clientePertence} onClick={() => { if (imageRef.current) imageRef.current?.click() }}>
          {imageTmp
            ?
            <AvatarBig user={{ nome: aboutCliente.nome, icon: imageTmp }} />
            :
            <AvatarBig user={{
              nome: aboutCliente.nome,
              icon: aboutCliente.urlAvatar || ''
            }} />
          }
        </button>

        <h1 className="text-[28px] font-bold mt-4">{aboutCliente.nome}</h1>

        <div className="flex text-[16px] items-center gap-3">
          <img src="/icons/zap.svg" className="w-4" alt="" />
          {sanitizar.telefone(aboutCliente.whatsapp, false)}
        </div>
        <div className="flex text-[16px] items-center gap-3">
          <img src="/icons/email.svg" className="w-4" alt="" />
          {aboutCliente.email}
        </div>

      </div>

      <div className="flex *:text-[14px] flex-col  gap-2 text-[#6C7788]">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] text-[#293856] font-bold">Detalhes do Cliente</h2>
          <button onClick={editarCliente} className="hover:brightness-75">
            <img src="/icons/lapis.svg" alt="" />
          </button>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="w-[41%]">Genêro</span>
          <b className="text-[#293856] w-full font-medium">{aboutCliente.genero[0].toUpperCase() === "M" ? "Masculino" : "Feminino"}</b>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="w-[41%]">Nascimento</span>
          <b className="text-[#293856] w-full font-medium">{handleDate.formatISODate(aboutCliente.dataNascimento)}</b>
        </div>

        <div className="flex justify-between  items-center gap-2">
          <span className="w-[41%]">{aboutCliente.documentoFiscal.length > 11 ? "CNPJ" : "CPF"}</span>
          <b className="text-[#293856] w-full font-medium">{sanitizar.cpfcnpj(aboutCliente.documentoFiscal)}</b>
        </div>

        <div className="flex justify-start items-center gap-2">
          <span className="w-[41%]">Endereço</span>
          <b className="text-[#293856] w-full text-left font-medium">
            {`${aboutCliente.enderecoCliente.endereco}, ${aboutCliente.enderecoCliente.numero}
                ${aboutCliente.enderecoCliente.bairro}, ${aboutCliente.enderecoCliente.municipio} - ${aboutCliente.enderecoCliente.uf.toUpperCase()}`}</b>
        </div>
      </div>


      <div className="flex  flex-col gap-2 text-[#6C7788]">
        <div className="flex flex-col">
          <h2 className="text-[18px] text-[#293856] font-bold">Dados de Cadastro</h2>
          <h3 className="text-[#6C7788] text-[14px] font-normal">Cadastro em {handleDate.formatISODate(aboutCliente.criadoEm, "dd 'de' MMMM','yyyy")}</h3>
        </div>
        {aboutCliente.usuarioCriador ? (
          <div className="flex gap-2 items-center">
            <Avatar user={{ nome: aboutCliente.usuarioCriador.nome ?? "—", icon: profileImageUrl(aboutCliente.usuarioCriador.id) }} />
            <div className="flex flex-col">
              <b>{aboutCliente.usuarioCriador.nome ?? "—"}</b>
              {aboutCliente.usuarioCriador.perfil ? handleText.capitalizeFirstLetter(aboutCliente.usuarioCriador.perfil) : "—"}
            </div>
          </div>
        ) : (
          <div className="text-[#6C7788] text-[14px]">Cadastrado automaticamente</div>
        )}
      </div>

      {aboutCliente.observacoes &&
        <div className="flex  flex-col gap-2 text-[#6C7788]">
          <h2 className="text-[18px] text-[#293856] font-bold">Observações</h2>
          <div className="flex flex-col gap-2 p-4 bg-[#F2F4F7] rounded-lg text-[14px] whitespace-pre-wrap">
            {aboutCliente.observacoes}
            <div className="flex gap-2 w-full">
              <b className="text-[#293856]">
                {aboutCliente.usuarioCriador?.nome ?? "—"}
              </b>
              <span>
                °
              </span>
              {handleDate.formatISODate(aboutCliente.atualizadoEm, "dd 'de' MMMM','yyyy")}
            </div>
          </div>
        </div>

      }
    </div>
  )
}

export default ClienteInfoSection