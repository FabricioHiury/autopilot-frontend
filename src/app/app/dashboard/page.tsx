'use client';

import ButtonCircle from '@/components/commons/buttons/button-circle/button-circle';
import Image from 'next/image';
import ButtonMessageIcon from '@/components/commons/buttons/button-circle/icons/button-message-icon';
import CardBanner from '@/components/sections/dashboard/card-banner';
import SectionLastServices from '@/components/sections/dashboard/section-last-services';
import SectionHighlights from '@/components/sections/dashboard/section-highlights';
import SectionOverview, { ItemOverview } from '@/components/sections/dashboard/section-overview';
import api from '@/utils/classes/api';
import toast from 'react-hot-toast';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import { PageTitle } from '@/components/commons/page-title';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { ChartServiceOrigin } from '@/components/sections/dashboard/chart-service-origin';
import {
  CardMessageProps,
  SectionMessages,
} from '@/components/sections/dashboard/section-messages';
import { ModalNovoAtendimento } from '@/components/sections/deals/modal-novo-atendimento';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import { useAppAuth } from '@/contexts/auth-app-context';
import { StorePermission } from '@/types/permissions';

export default function DashboardPage() {
  const date = new Date();
  const formatedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });

  const [permitir, setPermitir] = useState<boolean>(false);
  const [heightSize, setHeightSize] = useState<number>(130);
  const [messages, setMessages] = useState<CardMessageProps[]>();
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [access, setAcesso] = useState<any>(null);

  const [overviewItems, setOverviewItems] = useState<ItemOverview[]>();
  const [mesagesOpen, setMessagesOpen] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const appContext = useAppAuth();
  const [carregando, setCarregando] = useState<boolean>(true);

  const validarPermissao = async () => {
    const access = await appContext.fetchPermissions();
    if (!access) {
      setPermitir(false);
      setCarregando(false);
      return;
    }
    setAcesso(access);
    setPermitir(access.permissions.includes(StorePermission.STORE_VIEW_DASHBOARD));
    setCarregando(false);
  };

  async function loadChat() {
    const [response, error] = await api.get(`/chats?limit=6`);
    if (error || !response) {
      toast.error(error?.message || 'Não foi possível carregar os chats.');
      return;
    }
    setMessages(response.data.chats);
  }

  const fethOverView = async () => {
    const [response, error] = await api.get('/store/dashboard/overview');
    if (error) {
      return toast.error(error.message);
    }

    if (!response || !response.data) {
      console.error('Invalid API response');
      setOverviewItems([]);
      return;
    }

    const { data } = response;

    if (!data.topPerformers) {
      console.error('Missing topPerformers in API response');
      setOverviewItems([]);
      return;
    }

    const { topPerformers } = data;
    const dataItems: ItemOverview[] = [];

    if (topPerformers.salesperson) {
      if (topPerformers.salesperson.moreSales) {
        dataItems.push({
          id: topPerformers.salesperson.moreSales.id,
          employeeId: topPerformers.salesperson.moreSales.id,
          name: topPerformers.salesperson.moreSales.name,
          value: topPerformers.salesperson.moreSales.limit,
          percent: topPerformers.salesperson.moreSales.variation,
          label: 'Mais Vendas',
        });
      }

      if (topPerformers.salesperson.moreDeals) {
        dataItems.push({
          id: topPerformers.salesperson.moreDeals.id,
          employeeId: topPerformers.salesperson.moreDeals.id,
          name: topPerformers.salesperson.moreDeals.name,
          value: topPerformers.salesperson.moreDeals.limit,
          percent: topPerformers.salesperson.moreDeals.variation,
          label: 'Total Atendimentos',
        });
      }

      if (topPerformers.salesperson.morePurchases) {
        dataItems.push({
          id: topPerformers.salesperson.morePurchases.id,
          employeeId: topPerformers.salesperson.morePurchases.id,
          name: topPerformers.salesperson.morePurchases.name,
          value: topPerformers.salesperson.morePurchases.limit,
          percent: topPerformers.salesperson.morePurchases.variation,
          label: 'Mais Compras',
        });
      }
    }

    if (topPerformers.preSalesperson) {
      if (topPerformers.preSalesperson.moreSuccesses) {
        dataItems.push({
          id: topPerformers.preSalesperson.moreSuccesses.id,
          employeeId: topPerformers.preSalesperson.moreSuccesses.id,
          name: topPerformers.preSalesperson.moreSuccesses.name,
          value: topPerformers.preSalesperson.moreSuccesses.limit,
          percent: topPerformers.preSalesperson.moreSuccesses.variation,
          label: 'Mais Sucessos',
        });
      }

      if (topPerformers.preSalesperson.moreDeals) {
        dataItems.push({
          id: topPerformers.preSalesperson.moreDeals.id,
          employeeId: topPerformers.preSalesperson.moreDeals.id,
          name: topPerformers.preSalesperson.moreDeals.name,
          value: topPerformers.preSalesperson.moreDeals.limit,
          percent: topPerformers.preSalesperson.moreDeals.variation,
          label: 'Novos Atendimentos',
        });
      }
    }

    setOverviewItems(dataItems.length > 0 ? dataItems : []);
  };

  useEffect(() => {
    setIsClient(true);
    validarPermissao();
  }, []);

  useEffect(() => {
    if (permitir) {
      loadChat();
      fethOverView();
    }
  }, [permitir]);

  useEffect(() => {
    if (isClient && permitir) {
      const myObserver = new ResizeObserver(
        (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
          for (let entry of entries) {
            setHeightSize(entry.target.clientHeight);
          }
        },
      );
      const myElement = document.getElementById('refSize') as Element;
      myObserver.observe(myElement);

      return () => {
        myObserver.disconnect();
      };
    }
  }, [permitir, isClient]);

  const handleMessagesClick = () => {
    setMessagesOpen(!mesagesOpen);
  };

  if (carregando) {
    return (
      <div className="w-full h-[calc(100vh-200px)] md:h-full flex items-center justify-center">
        <LoadingGlobal />
      </div>
    );
  }

  if (!permitir) {
    return (
      <div className="w-full h-[calc(100vh-200px)] md:h-full flex items-center justify-center">
        <NoData label="Você não tem permissão para acessar essa página." />
      </div>
    );
  }

  return (
    <main className="bg-[#F2F4F7]">
      <div className="bg-white px-4 pt-6 md:px-10 md:pt-10 pb-[2.25rem] md:pb-[1.125rem]">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="w-full flex gap-4 items-start justify-between">
            <div className="flex flex-col gap-0.5 md:gap-2">
              <PageTitle title="Dashboard" />

              <div className="flex items-center gap-0.5">
                <Image
                  src="/icons/calendar.svg"
                  width={15}
                  height={15}
                  alt="Calendário"
                  className="w-[.75rem] h-[.75rem] md:w-[.95rem] md:h-[.95rem]"
                />
                <span className="text-[#6C778E] text-xs md:text-sm">{formatedDate}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="md:hidden">
                <ButtonCircle
                  icon={<ButtonMessageIcon />}
                  alert
                  onClick={handleMessagesClick}
                  aria-selected={mesagesOpen}
                />
              </span>
              <ModalNotificacoes />
            </div>
          </div>

          <ModalNovoAtendimento />
        </div>
      </div>

      {!mesagesOpen && (
        <div className="relative">
          {/* div para o efeito de background */}
          <div
            className="block absolute bg-white rounded-b-3xl w-full"
            style={{ height: `${heightSize}px` }}
          ></div>

          {/* grid para o conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-[repeat(12,1fr)] md:grid-rows-auto gap-5 relative px-4 md:px-10">
            <div className="md:col-span-8 pb-[2rem] flex flex-col gap-5" id="refSize">
              <section className="flex flex-col">
                <div className="flex items-center gap-1 md:gap-2">
                  <h2 className="block font-bold text-[1.375rem] md:text-[2.375rem] leading-[1.375rem] md:leading-[2.375rem]">
                    Seja bem vindo ao AutoPilot!
                  </h2>
                  <Image
                    src="/icons/emoji_hand.svg"
                    width={30}
                    height={30}
                    alt="Saudação"
                    className="w-[1.375rem] h-[1.375rem] md:w-[2.375rem] md:h-[2.375rem]"
                  />
                </div>
                <p className="block text-[1rem] md:text-[1.125rem] text-[#6C778E]">
                  Veja o que está acontecendo essa semana!
                </p>
              </section>

              <SectionHighlights />
            </div>

            <div className="md:col-span-8 md:col-start-1 md:row-start-2 ">
              <SectionLastServices />
            </div>

            <div className="md:col-span-6 md:col-start-1 md:row-start-3 pt-3">
              <ChartServiceOrigin />
            </div>

            <div className="md:hidden pb-4">
              <SectionOverview items={overviewItems} />
            </div>

            <div className="md:col-span-2 md:col-start-7 md:row-start-3 pt-3 ">
              <CardBanner />
            </div>

            <div className="hidden md:flex flex-col gap-7 md:col-span-4 md:row-span-4 md:col-start-9 md:row-start-1">
              <SectionMessages totalMessages={totalMessages} messages={messages} />
              <SectionOverview items={overviewItems} />
            </div>
          </div>
        </div>
      )}

      {mesagesOpen && (
        <div className="w-full h-full relative min-h-screen px-4 pt-6 pb-[12rem]">
          <SectionMessages
            totalMessages={totalMessages}
            messages={messages}
            onOpenClose={handleMessagesClick}
          />
        </div>
      )}
    </main>
  );
}
