'use client'
import AvatarUser from "@/components/commons/avatar-user";
import LoadingGlobal from "@/components/commons/estados/LoadingGlobal";
import NoData from "@/components/commons/estados/NoData";
import SelectSweet from "@/components/commons/inputs/select-lego";
import { PageTitle } from "@/components/commons/page-title";
import IconEnviar from "@/components/icons/icon-enviar";
import Spinner from "@/components/loading/Spinner";
import GoBackPage from "@/components/sections/go-back-page";
import { ApiApp } from "@/lib/api-app";
import { relativeTime } from "@/lib/relative-time";
import { profileImageUrl } from "@/lib/profile.utils";
import { TicketItemListaType } from "@/utils/types/ticket-type";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const status = [
  { label: "Em aberto", value: "aberto" },
  { label: "Em resolução", value: "em resolução" },
  { label: "Fechado", value: "fechado" },
];

export default function Page() {

  const path = useParams();
  const idTicket = path.idTicket as string;
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const apiApp = new ApiApp();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [responder, setResponder] = useState<boolean>(false);
  const [resposta, setResposta] = useState<string>("");
  const [loadingEnvio, setLoadingEnvio] = useState<boolean>(false);

  const fetchTicket = async () => {
    const [data, error] = await apiApp.suporte.pegar(idTicket);
    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    setTicket(data);
    setLoading(false);
  }

  async function atualizarStatus(v: string) {
    const [data, error] = await apiApp.suporte.alterarStatus(idTicket, v)
    console.log(data, error?.message)
  }

  const handleEnviarResposta = async () => {
    if (!resposta || resposta.trim() === "") {
      return;
    }

    setLoadingEnvio(true);
    const [data, error] = await apiApp.suporte.responder(idTicket, { resposta });

    if (error) {
      console.error(error);
      toast.error("Erro ao enviar resposta");
      setLoadingEnvio(false);
      return;
    }

    toast.success("Resposta enviada com sucesso");
    setLoadingEnvio(false);
    setResponder(false);
    fetchTicket();

  }

  const pegarUsuario = async () => {
    const storedUser = localStorage.getItem('usuario');
    if (!storedUser) {
      return;
    }
    const user = JSON.parse(storedUser) as {
      id: string;
      nome: string;
      perfil: string;
    }
    setUser(user);
  }

  const renderMensagem = (mensagem: any) => {
    return (
      <div className="p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
        <div className="self-stretch justify-center items-center gap-6 inline-flex">
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
            <div className="text-[#434d56] text-sm font-semibold font-['BR Sonoma'] leading-tight">Resposta</div>
            <div className="justify-start items-start flex">
              <div className="px-2 py-1 bg-[#e3ebf3] rounded-xl justify-center items-center gap-2.5 flex">
                <div className="text-[#24292e] text-xs font-semibold font-['BR Sonoma'] leading-none">{mensagem.usuario.nome}</div>
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-2 flex">
            <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">{relativeTime(new Date(mensagem.criadoEm))}</div>
          </div>
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 13L10 7L16 13" stroke="#D33632" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="self-stretch flex-col justify-start items-start gap-4 flex">
          <div className="self-stretch text-[#485b7f] text-sm font-medium font-['BR Sonoma'] leading-tight">{mensagem.resposta}</div>
          {false && <div className="self-stretch h-28 flex-col justify-start items-start gap-4 flex">
            <div className="justify-start items-center gap-3 inline-flex">
              <div className="text-[#434d56] text-sm font-semibold font-['BR Sonoma'] leading-tight">Documentos anexados</div>
              <div className="justify-start items-start flex">
                <div className="px-2 py-0.5 bg-[#586e9d] rounded-xl justify-center items-center gap-0.5 flex">
                  <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none">02</div>
                </div>
              </div>
            </div>
            <div className="justify-start items-center gap-4 inline-flex">
              <div className="flex-col justify-start items-start gap-2.5 inline-flex">
                <div className="w-80 h-16 p-2 bg-[#edf2f7] rounded-lg justify-center items-center gap-3 inline-flex">
                  <div data-svg-wrapper>
                    <svg width="72" height="56" viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="72" height="56" rx="4" fill="#DDE6F2" />
                      <g clip-path="url(#clip0_4600_53842)">
                        <mask id="mask0_4600_53842" maskUnits="userSpaceOnUse" x="27" y="14" width="21" height="28">
                          <path d="M47.9992 14.2856H27.4277V41.7142H47.9992V14.2856Z" fill="white" />
                        </mask>
                        <g mask="url(#mask0_4600_53842)">
                          <path d="M27.9414 17.0286C27.9414 15.7978 28.9392 14.8 30.17 14.8H39.2141L47.4843 23.0702V38.9715C47.4843 40.2023 46.4865 41.2001 45.2557 41.2001H30.17C28.9392 41.2001 27.9414 40.2023 27.9414 38.9715V17.0286Z" fill="white" stroke="#C8D2E1" strokeWidth="1.02857" />
                          <path d="M39.084 14.9714V21.1429C39.084 22.279 40.005 23.2 41.1411 23.2H47.3126" stroke="#C8D2E1" strokeWidth="1.02857" strokeLinecap="round" />
                        </g>
                        <path d="M39.4286 27.3142H25.3714C24.614 27.3142 24 27.9282 24 28.6856V36.9142C24 37.6716 24.614 38.2856 25.3714 38.2856H39.4286C40.186 38.2856 40.8 37.6716 40.8 36.9142V28.6856C40.8 27.9282 40.186 27.3142 39.4286 27.3142Z" fill="#485B80" />
                        <path d="M26.25 35.1999V30.2129H28.2175C28.5958 30.2129 28.918 30.2851 29.1842 30.4296C29.4505 30.5725 29.6534 30.7713 29.793 31.0262C29.9342 31.2795 30.0049 31.5717 30.0049 31.9028C30.0049 32.234 29.9335 32.5262 29.7906 32.7795C29.6477 33.0327 29.4407 33.23 29.1696 33.3712C28.9002 33.5124 28.5739 33.583 28.1907 33.583H26.9367V32.7381H28.0203C28.2232 32.7381 28.3904 32.7032 28.5219 32.6334C28.655 32.5619 28.7541 32.4637 28.819 32.3387C28.8855 32.2121 28.9188 32.0668 28.9188 31.9028C28.9188 31.7373 28.8855 31.5928 28.819 31.4694C28.7541 31.3444 28.655 31.2478 28.5219 31.1796C28.3888 31.1098 28.22 31.0749 28.0154 31.0749H27.3044V35.1999H26.25ZM32.3205 35.1999H30.5526V30.2129H32.3351C32.8367 30.2129 33.2685 30.3127 33.6305 30.5124C33.9925 30.7105 34.2709 30.9954 34.4658 31.3671C34.6622 31.7389 34.7604 32.1837 34.7604 32.7016C34.7604 33.221 34.6622 33.6675 34.4658 34.0408C34.2709 34.4142 33.9909 34.7007 33.6256 34.9004C33.262 35.1001 32.8269 35.1999 32.3205 35.1999ZM31.607 34.2965H32.2766C32.5883 34.2965 32.8505 34.2413 33.0632 34.1309C33.2774 34.0189 33.4381 33.846 33.5453 33.6123C33.654 33.3769 33.7084 33.0733 33.7084 32.7016C33.7084 32.3331 33.654 32.0319 33.5453 31.7981C33.4381 31.5644 33.2782 31.3923 33.0656 31.2819C32.8529 31.1715 32.5907 31.1163 32.279 31.1163H31.607V34.2965ZM35.4043 35.1999V30.2129H38.7062V31.0822H36.4587V32.2705H38.4871V33.1399H36.4587V35.1999H35.4043Z" fill="white" />
                      </g>
                      <defs>
                        <clipPath id="clip0_4600_53842">
                          <rect width="24" height="27.4286" fill="white" transform="translate(24 14.2856)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="grow shrink basis-0 h-9 justify-center items-center gap-2 flex">
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
                      <div className="self-stretch h-9 flex-col justify-start items-start gap-0.5 flex">
                        <div className="self-stretch justify-between items-center inline-flex">
                          <div className="justify-start items-center gap-2 flex">
                            <div className="text-[#6b7687] text-xs font-semibold font-['BR Sonoma'] leading-none">845 kb</div>
                            <div className="w-1 h-1 bg-[#7f8999] rounded-full" />
                            <div className="text-[#7f8999] text-xs font-medium font-['BR Sonoma'] leading-none">Enviado há 2 dias</div>
                          </div>
                          <div data-svg-wrapper className="relative">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3.5 4.08341H2.91667V11.6667C2.91667 11.9762 3.03958 12.2729 3.25838 12.4917C3.47717 12.7105 3.77391 12.8334 4.08333 12.8334H9.91667C10.2261 12.8334 10.5228 12.7105 10.7416 12.4917C10.9604 12.2729 11.0833 11.9762 11.0833 11.6667V4.08341H3.5ZM9.69383 2.33341L8.75 1.16675H5.25L4.30617 2.33341H1.75V3.50008H12.25V2.33341H9.69383Z" fill="#85A3DC" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-44 justify-start items-center inline-flex">
                          <div className="text-[#283855] text-sm font-semibold font-['BR Sonoma'] leading-tight">Extrato_Conta_Nubank.pdf</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchTicket();
    pegarUsuario();
  }, []);


  if (loading) {
    return <div className="flex flex-col h-full w-full items-center justify-center"><LoadingGlobal /></div>;
  }

  if (!loading && !ticket) {
    return <div className="flex flex-col h-full w-full items-center justify-center"><NoData label="Ticket não encontrado" /></div>;
  }

  return (
    <div className="flex flex-col h-full relative overflow-y-auto">
      <div className="flex flex-col gap-3 w-full p-9">
        <GoBackPage />
        <div className="flex justify-between items-center">
          <PageTitle title={`Ticket #${idTicket}`} />
          <div className="flex items-center gap-3">
            {/* <ButtonConfiguracoes
                              onClick={() =>
                                  router.push("/app/configuracoes/dados-da-loja")
                              }
                          />
                          <ModalNotificacoes /> */}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full flex-1 bg-white p-9 py-6 pb-20 md:pb-6">
        <div className="bg-[#EDF2F7] rounded-2xl p-4 w-full overflow-x-hidden flex flex-col gap-4">

          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-8">

              <div>
                <div className="h-3.5 rounded-xl justify-center items-center gap-1 inline-flex">
                  <div className="w-2 h-2 bg-[#aa4f22] rounded-sm" />
                  <div className="text-[#657380] text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">{ticket.prioridade}</div>
                </div>
                <div className="text-[#24292e] text-xl font-semibold font-['BR Sonoma'] leading-normal">{ticket.titulo}</div>

              </div>


              <SelectSweet value={ticket.status} options={status}
                placeholder="Status" setValue={(v) => {
                  setTicket((old: TicketItemListaType) => {
                    return {
                      ...old,
                      status: v
                    }
                  })
                  atualizarStatus(v)
                }} />

            </div>

            <div className="h-5 justify-start items-center gap-2 inline-flex">

              <div className="px-2 py-1 bg-[#586e9d] rounded-xl justify-center items-center gap-2.5 flex">
                <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">{ticket.status}</div>
              </div>
            </div>
          </div>

          <div className="h-16 p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
            <div className="self-stretch justify-center items-center gap-6 inline-flex">
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-3 flex">
                <div className="text-[#434d56] text-base font-semibold font-['BR Sonoma'] leading-tight">{ticket.usuario.nome}</div>
                <div className="justify-start items-start flex">
                  <div className="px-2 py-0.5 bg-[#e3ebf3] rounded-xl justify-center items-center gap-0.5 flex">
                    <div className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">{ticket.categoria}</div>
                  </div>
                </div>
                <div className="w-44 text-[#95a3b2] text-xs font-normal font-['BR Sonoma'] leading-none">{`Ticket #${ticket.id}`}</div>
              </div>
              <div className="justify-start items-center gap-2 flex">
                <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">{relativeTime(new Date(ticket.criadoEm))}</div>
              </div>
              {!responder && <button onClick={() => setResponder(true)} className="bg-[#1b2841] rounded-lg justify-center items-center flex">
                <div data-svg-wrapper>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="path-1-inside-1_4600_53808" fill="white">
                      <path d="M0 0H32V32H0V0Z" />
                    </mask>
                    <path d="M31.5 0V32H32.5V0H31.5Z" fill="#2A3E65" mask="url(#path-1-inside-1_4600_53808)" />
                    <path d="M13.9993 17.3333L10.666 14M10.666 14L13.9993 10.6666M10.666 14H14.9327C17.1729 14 18.293 14 19.1486 14.4359C19.9013 14.8194 20.5132 15.4313 20.8967 16.184C21.3327 17.0396 21.3327 18.1597 21.3327 20.4V21.3333" stroke="#D33632" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="p-2 rounded-tl-lg rounded-bl-lg justify-center items-center flex">
                  <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none">Responder</div>
                </div>
              </button>}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-[#d7e0ea] flex-col justify-start items-start gap-4 inline-flex">
            <div className="self-stretch justify-center items-center gap-6 inline-flex">
              <div className="grow shrink basis-0 justify-start items-center gap-3 flex">
                <div className="text-[#434d56] text-sm font-semibold font-['BR Sonoma'] leading-tight">Mensagem</div>
                <div className="justify-start items-start flex">
                  <div className="px-2 py-1 bg-[#e3ebf3] rounded-xl justify-center items-center gap-2.5 flex">
                    <div className="text-[#24292e] text-xs font-semibold font-['BR Sonoma'] leading-none">{ticket.usuario.nome}</div>
                  </div>
                </div>
              </div>
              <div className="justify-start items-center gap-2 flex">
                <div className="text-right text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">{relativeTime(new Date(ticket.criadoEm))}</div>
              </div>
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 13L10 7L16 13" stroke="#D33632" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="self-stretch flex-col justify-start items-start gap-4 flex">
              <div className="self-stretch text-[#485b7f] text-lg font-semibold font-['BR Sonoma'] leading-snug">{ticket.assunto}</div>
              <div className="self-stretch text-[#485b7f] text-sm font-medium font-['BR Sonoma'] leading-tight">{ticket.mensagem}</div>
            </div>
          </div>

          {ticket.respostas.map((resposta: any) => renderMensagem(resposta))}

          {/* {ticket ? ( JSON.stringify(ticket) ) : <NoData label="Nenhuma informação para exibir" />} */}
        </div>
      </div>

      {responder && <div className="w-full sticky bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-20 md:pb-6 border-t border-gray-200 flex flex-col gap-3">
        <div className="text-[#657380]">Respondendo <span className="font-semibold">AutoPilot</span></div>

        <div className="flex gap-3 items-start">
          <AvatarUser name={user ? user.nome : " "} src={user && profileImageUrl(user.id)} />
          <textarea
            className="w-full h-20"
            placeholder="Digite sua resposta..."
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 items-stretch">
          <div className="bg-[#EDF2F7] flex items-center gap-2 p-2 rounded-[0.5rem]">

            <button>
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.37111 15.5212L13.3852 8.80719C14.2274 8.00109 14.2274 6.69414 13.3852 5.88804C12.5431 5.08195 11.1777 5.08194 10.3356 5.88804L3.37233 12.5534C1.77228 14.085 1.77228 16.5682 3.37233 18.0998C4.97237 19.6314 7.56655 19.6314 9.16659 18.0998L16.2315 11.3371C18.5895 9.08003 18.5895 5.42059 16.2315 3.16351C13.8736 0.906434 10.0506 0.906434 7.69261 3.16351L2 8.61258" stroke="#24292E" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

          </div>

          <button
            disabled={loadingEnvio}
            onClick={handleEnviarResposta}
            className="bg-[#293856] rounded-[0.5rem] h-10 px-3 text-white font-semibold text-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loadingEnvio ?
              <Spinner color="white" width="20px" />
              :
              <>
                Adicionar Resposta
                <IconEnviar />
              </>
            }
          </button>
        </div>

      </div>}
    </div>
  )
}
