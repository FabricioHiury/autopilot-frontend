'use client';
import CardStatus from '@/components/cards/CardStatus';
import AvatarCanal from '@/components/commons/avatar-canal';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import CenterModal from '@/components/commons/modais/center-modal';
import { PageTitle } from '@/components/commons/page-title';
import { FacebookIntegracao } from '@/components/sections/integracao/facebook-integracao';
import InstagramIntegracao from '@/components/sections/integracao/instagram-integracao';
import OlxIntegracao from '@/components/sections/integracao/olx-integracao';
import { RemoverFacebookIntegracao } from '@/components/sections/integracao/remover-facebook-integracao';
import { RemoverInstagramIntegracao } from '@/components/sections/integracao/remover-instagram-integracao';
import { RemoverOlxIntegracao } from '@/components/sections/integracao/remover-olx-integracao';
import { RemoverWhatsAppIntegracao } from '@/components/sections/integracao/remover-whatsapp-integracao';
import WhatsappIntegracao from '@/components/sections/integracao/whatsapp-integracao';
import { getUserStorageId } from '@/lib/user.utils';
import api from '@/utils/classes/api';
import handleText from '@/utils/classes/format/text';
import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type CanalStatus = {
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'other';
  status: string;
  message: string;
};

export default function PageAcessoWrapper() {
  const validPages = ['whatsapp', 'instagram', 'facebook', 'olx'];
  const queryParams = useSearchParams();
  const params = useParams();
  const page =
    params.channel && !Array.isArray(params.channel) && validPages.includes(params.channel)
      ? params.channel
      : null;
  if (!page) {
    notFound();
  }
  const [isWindow, setIsWindow] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listaStatus, setListaStatus] = useState<CanalStatus[]>([]);

  async function pegarStatus() {
    const [response, error] = await api.get(`/integrations/status`);
    if (error) {
      setLoadError(error.message);
      return toast.error(error.message);
    }

    setLoadError(null);
    setListaStatus(response.data.statusIntegrations);
  }

  function checkStatus() {
    const canalNaLista = listaStatus.find((obj: any) => obj.channel === page);
    return canalNaLista && ['ok', 'connected', 'open'].includes(canalNaLista.status.toLowerCase())
      ? true
      : false;
  }

  useEffect(() => {
    pegarStatus();
    setIsWindow(true);
  }, []);

  useEffect(() => {
    if ((queryParams.get('success') || queryParams.get('sucesso')) === 'true') {
      setModalOpen(true);
    }
    const callbackError = queryParams.get('error') || queryParams.get('erro');
    if (callbackError)
      toast.error(
        callbackError === 'cancelado'
          ? 'Conexão cancelada.'
          : 'Não foi possível concluir a integração. Tente novamente.',
      );
  }, [queryParams]);

  const renderIntegracao = () => {
    if (page === 'whatsapp') return <WhatsappIntegracao />;
    if (loadError)
      return (
        <div role="alert">
          {loadError}
          <button className="text-primary underline ml-3" onClick={pegarStatus}>
            Tentar novamente
          </button>
        </div>
      );

    if (page && listaStatus.length > 0 && !checkStatus()) {
      switch (page) {
        case 'whatsapp':
          return <WhatsappIntegracao />;
        case 'instagram':
          return <InstagramIntegracao />;
        case 'facebook':
          return <FacebookIntegracao />;
        case 'olx':
          return <OlxIntegracao />;
        default:
          return null;
      }
    }

    if (page && listaStatus.length > 0 && checkStatus()) {
      switch (page) {
        case 'whatsapp':
          return <RemoverWhatsAppIntegracao />;
        case 'instagram':
          return <RemoverInstagramIntegracao />;
        case 'facebook':
          return <RemoverFacebookIntegracao />;
        case 'olx':
          return <RemoverOlxIntegracao />;
        default:
          return null;
      }
    }

    return <LoadingGlobal />;
  };

  return (
    <>
      <div className="h-full min-h-full w-full bg-[#F4F7FA] p-12">
        <div className="flex lg:flex-row flex-col justify-between w-full gap-2 lg:gap-32 items-center">
          <div>
            <PageTitle title={'Integração ao ' + handleText.capitalizeFirstLetter(page)} />
            <div className="h-3  justify-start items-start gap-2 inline-flex">
              <Link
                href={'/app/settings/integrations'}
                className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3"
              >
                Integrações
              </Link>
              <div className="text-[#657380] text-[10px] font-medium font-['BR Sonoma'] leading-3">
                {'>'}
              </div>
              <div className="text-[hsl(var(--primary))] text-[10px] font-medium font-['BR Sonoma'] leading-3">
                Integração com o {handleText.capitalizeFirstLetter(page)}
              </div>
            </div>
          </div>

          <div className="block lg:w-1/2 w-full h-1.5 rounded-full bg-[#DDE6F2]">
            <div className="w-[7rem] h-1.5 rounded-full bg-[hsl(var(--primary))]"></div>
          </div>
        </div>
        <div className="flex flex-col-reverse lg:flex-row w-full gap-12 mt-6">
          <div className="flex flex-col flex-grow gap-2">{renderIntegracao()}</div>
          <div className="lg:w-[352px] h-[156px] bg-white rounded-lg flex flex-col items-center justify-center gap-2">
            {listaStatus.length === 0 && (
              <div className="font-semibold opacity-50 animate-pulse">Verificando...</div>
            )}
            {listaStatus.length > 0 && (
              <>
                <div className="flex gap-1 items-center">
                  <div className="bg-[#E3EBF3] w-[4.5rem] aspect-square p-4 overflow-hidden rounded-full">
                    {isWindow && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/avatar/user/${getUserStorageId()}`}
                        alt=""
                        className="object-contain overflow-hidden rounded-full w-full"
                      />
                    )}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.954 6.67734L3.04492 6.67734L6.45117 2.96143"
                      stroke="#434D56"
                      strokeWidth="1.11477"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.04599 9.15454L12.9551 9.15454L9.54883 12.8704"
                      stroke="#434D56"
                      strokeWidth="1.11477"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="bg-[#E3EBF3] p-2 rounded-full">
                    <AvatarCanal channel={page} padrao={2} size={2.6} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isWindow && (
                    <b className="text-[20px] font-semibold text-black">
                      {JSON.parse(localStorage.getItem('user') ?? '{}').name}
                    </b>
                  )}
                  <CardStatus status={checkStatus()} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CenterModal
          onClose={() => {
            setModalOpen(false);
          }}
          idSelector="content-container"
        >
          <div className="flex flex-col items-center p-4 px-6 ">
            <div className="bg-[#E3EBF3] p-2 rounded-full">
              <AvatarCanal channel={page} size={3} />
            </div>
            <b className="text-[#24292E] text-[18px] pt-4">Integração realizada!</b>
            <div className="flex flex-col w-full max-w-[323px] mt-2">
              <div className="h-[1px] w-full bg-[rgba(0,0,0,.2)]"></div>
              <span className="text-[#788590] text-[14px] mt-4 text-center">
                Sua conta {page} foi vinculada com sucesso! Agora você pode gerenciar e responder
                suas mensagens diretamente pelo painel. Obrigado por escolher o AutoPilot para
                integrar suas comunicações.
              </span>
              <Link
                href="/app/settings/integrations"
                className="bg-[hsl(var(--secondary))] text-center text-secondary-foreground p-3 font-semibold text-[14px] mt-4 rounded-lg"
              >
                Retornar para as integrações
              </Link>
            </div>
          </div>
        </CenterModal>
      )}
    </>
  );
}
