'use client';
import { BtnStrong } from '@/components/commons/buttons/buttons';
import InputPesquisarBlue from '@/components/commons/inputs/input-pesquisar-blue';
import SelectSweet from '@/components/commons/inputs/select-lego';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import SideModal from '@/components/commons/modais/side-modal';
import { ModalTitle } from '@/components/commons/modal-title';
import CalendarSelect from '@/components/inputs/select/CalendarSelect';
import { BellFillAnimation } from '@/components/nav/icons/bell-icon';
import { ConfigIconAnimation } from '@/components/nav/icons/config-icon';
import { Title } from '@/components/sections/Text';
import { ConteudoModalTicket } from '@/components/sections/tickets/conteudo-modal-ticket';
import GoBackPage from '@/components/sections/go-back-page';
import { AppServices } from '@/services/app.services';
import { relativeTime } from '@/lib/relative-time';
import handleDate from '@/utils/classes/format/time';
import { Ticket, TicketListItem } from '@/types/support';
import { SVGProps, useEffect, useState } from 'react';

const status = [
  { label: 'Ativo', value: 'anuncios' },
  { label: 'Inativo', value: 'contas' },
  { label: 'Todos', value: 'estoque' },
];

export default function Page() {
  const api = new AppServices();

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    category: undefined,
    search: '',
    dataStart: undefined,
    dataEnd: undefined,
    period: {
      from: undefined,
      to: undefined,
    },
  });

  function upFiltros(value: any, obj: string) {
    setFiltros((old) => ({
      ...old,
      [obj]: value,
    }));
  }

  const fetchTickets = async () => {
    const [data, error] = await api.support.list({
      page: 1,
      itemsPage: 10,
    });
    if (error || !data) {
      console.error(error);
      return;
    }
    console.log(data.tickets);
    setTickets(data.tickets);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [filtros]);

  return (
    <>
      <div className="p-9 flex flex-col items-start justify-start">
        <div className="flex flex-col gap-3 w-full">
          <GoBackPage />
          <div className="flex justify-between items-center">
            <Title label="Tickets de Ajuda" />
            <div className="flex items-center gap-3">
              <ModalNotificacoes />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-white p-9 py-7 w-full h-full">
        <div className="flex items-center flex-wrap gap-4">
          <b className="text-neutral-950 mr-36 text-[18px] font-medium">Tickets</b>

          <SelectSweet
            value={filtros.category}
            options={status}
            placeholder="Categoria"
            setValue={(v) => upFiltros(v, 'category')}
          />

          <CalendarSelect range={filtros.period} setRange={(v) => upFiltros(v, 'period')} />

          <InputPesquisarBlue
            placeholder="Procurar por palavra-chave"
            value={filtros.search}
            onChange={(v) => upFiltros(v, 'search')}
          />
        </div>
        <Organize tickets={tickets} />
      </div>
    </>
  );
}

function Organize({ tickets }: { tickets: TicketListItem[] }) {
  const tipos = [
    { label: 'Aberto', value: 'open' },
    { label: 'Resolução', value: 'at resolution' },
    { label: 'Fechado', value: 'closed' },
  ];

  const [openModal, setOpenModal] = useState<boolean[]>(
    tipos.map((_, i) => {
      return false;
    }),
  );
  const [tick, setTick] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const close = (i: number) => {
    setOpenModal((old: boolean[]) => {
      const x = [...old];
      x[i] = false;
      return x;
    });
  };

  const open = (i: number) => {
    setOpenModal((old: boolean[]) => {
      const x = [...old];
      x[i] = true;
      return x;
    });
  };

  const loadTick = async (id: string) => {
    setLoading(true);
    const [data, error] = await new AppServices().support.get(id);
    setTick(data);
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-start justify-start gap-4 mt-6 overflow-x-auto grow scroll-padrao pb-6">
        {tipos.map((obj, i) => {
          return (
            <div className="flex flex-col w-[252px]" key={i}>
              <div className="flex gap-2 rounded-2xl p-3 px-4 bg-[#E3EBF3] text-neutral-950 text-[14px]">
                {obj.label}
                <b className="rounded-full text-primary-foreground text-[11px] font-semibold flex items-center bg-[hsl(var(--primary))] px-3">
                  {tickets.filter((obj2) => obj2.status === obj.value).length}
                </b>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {tickets.map((obj2, j) => {
                  if (obj.value === obj2.status)
                    return (
                      <Card
                        onClick={() => {
                          loadTick(obj2.id);
                          open(i);
                        }}
                        ticket={obj2}
                        key={j}
                      />
                    );
                })}
              </div>
              <ConteudoModalTicket
                onRedirect={() => (window.location.href = '/backoffice/app/tickets/' + tick!.id)}
                loading={loading}
                tick={tick}
                open={openModal[i]}
                onClose={() => close(i)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function Card({ onClick, ticket }: { onClick: VoidFunction; ticket: TicketListItem }) {
  const smallText = (text: string) => {
    if (text.length > 75) {
      text = text.slice(0, 75);
      text += '...';
    }
    return text;
  };

  return (
    <>
      <div className="flex flex-col w-[252px] flex-shrink-0 p-4 rounded-2xl bg-[#F4F7FA]">
        <b className="text-[#95A3B2] text-[10px]">Ticket #{ticket.id}</b>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <div className="rounded-full text-white text-[11px] font-semibold bg-[#586E9D] px-2 p-1">
              {ticket.status}
            </div>
            <span className="text-[#434D56] text-[11px]">
              {relativeTime(new Date(ticket.updatedAt))}
            </span>
          </div>
          <div className="flex items-center border border-[#B1BCD3] rounded-lg p-2 aspect-square">
            <Timer />
          </div>
        </div>
        <div className="flex flex-col mt-1 gap-[2px]">
          <b className="text-[14px] font-medium">{ticket.user.name}</b>
          <span className="text-[12px] text-[#657380]">{smallText(ticket.message[0])}</span>
          <div className="flex mt-2 items-center justify-between">
            <div className="rounded-full text-[#434D56] text-[11px] font-semibold bg-[#E3EBF3] px-2 p-1">
              Dúvidas
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#434D56]">
              <div className="flex items-center gap-[2px]">
                <Clip />1
              </div>
              <div className="flex items-center gap-[2px]">
                <Ballon />4
              </div>
            </div>
          </div>
          <div className="my-2 h-[1px] w-full bg-neutral-300"></div>
          <BtnStrong label="Visualizar Ticket" padding="p-[6px]" onClick={onClick} />
        </div>
      </div>
    </>
  );
}

const Timer = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={11}
    height={15}
    viewBox="0 0 11 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5.67922 7.64829L3.78629 9.52281C1.9159 11.375 0.980701 12.3011 1.24252 13.1001C1.26502 13.1688 1.29297 13.2356 1.3261 13.3C1.71151 14.0483 3.03408 14.0483 5.67922 14.0483C8.32436 14.0483 9.64692 14.0483 10.0323 13.3C10.0655 13.2356 10.0934 13.1688 10.1159 13.1001C10.3777 12.3011 9.44254 11.375 7.57214 9.52281L5.67922 7.64829ZM5.67922 7.64829L7.57215 5.77377C9.44254 3.92157 10.3777 2.99547 10.1159 2.19644C10.0934 2.12776 10.0655 2.06094 10.0323 1.99662C9.64692 1.24829 8.32436 1.24829 5.67922 1.24829C3.03408 1.24829 1.71151 1.24829 1.3261 1.99662C1.29297 2.06094 1.26502 2.12776 1.24252 2.19644C0.980701 2.99547 1.9159 3.92157 3.78629 5.77377L5.67922 7.64829Z"
      stroke="#586E9D"
      strokeWidth={1.3}
    />
  </svg>
);

const Clip = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.09845 12.6887L10.7097 7.31743C11.3834 6.67255 11.3834 5.62699 10.7097 4.98212C10.036 4.33724 8.94375 4.33724 8.27005 4.98211L2.69942 10.3144C1.41939 11.5397 1.41939 13.5262 2.69942 14.7515C3.97946 15.9768 6.0548 15.9768 7.33484 14.7515L12.9868 9.34137C14.8732 7.53571 14.8732 4.60815 12.9868 2.80249C11.1004 0.996827 8.04202 0.996827 6.15565 2.80249L1.60156 7.16174"
      stroke="hsl(var(--primary))"
      strokeWidth="1.04"
      strokeLinecap="round"
    />
  </svg>
);

const Ballon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.69702 14.6564L9.14451 14.9213L8.69702 14.6564ZM9.04396 14.0703L8.59648 13.8054L9.04396 14.0703ZM6.95913 14.0703L6.51165 14.3351L6.51165 14.3351L6.95913 14.0703ZM7.30608 14.6564L7.75357 14.3915L7.75356 14.3915L7.30608 14.6564ZM1.84515 11.1529L2.32557 10.9539H2.32557L1.84515 11.1529ZM5.30689 13.1228L5.29793 13.6427L5.30689 13.1228ZM3.57698 12.8847L3.37798 13.3651H3.37798L3.57698 12.8847ZM14.158 11.1529L14.6384 11.3519V11.3519L14.158 11.1529ZM10.6962 13.1228L10.6872 12.6029L10.6962 13.1228ZM12.4261 12.8847L12.6251 13.3651H12.6251L12.4261 12.8847ZM12.8736 2.71984L12.6019 3.16322V3.16322L12.8736 2.71984ZM13.93 3.7763L14.3734 3.5046V3.5046L13.93 3.7763ZM3.12957 2.71984L2.85787 2.27647V2.27647L3.12957 2.71984ZM2.07311 3.7763L1.62974 3.5046H1.62974L2.07311 3.7763ZM6.33935 13.2626L6.60079 12.8131L6.60078 12.8131L6.33935 13.2626ZM9.14451 14.9213L9.49145 14.3351L8.59648 13.8054L8.24953 14.3915L9.14451 14.9213ZM6.51165 14.3351L6.85859 14.9213L7.75356 14.3915L7.40662 13.8054L6.51165 14.3351ZM8.24953 14.3915C8.14166 14.5738 7.86144 14.5738 7.75357 14.3915L6.85859 14.9213C7.36917 15.7839 8.63393 15.7839 9.14451 14.9213L8.24953 14.3915ZM7.04156 2.76829H8.96156V1.72829H7.04156V2.76829ZM13.8816 7.68829V8.32829H14.9216V7.68829H13.8816ZM2.12156 8.32829V7.68829H1.08156V8.32829H2.12156ZM1.08156 8.32829C1.08156 9.06668 1.08128 9.64652 1.11322 10.1146C1.14547 10.5873 1.21232 10.9839 1.36473 11.3519L2.32557 10.9539C2.23439 10.7338 2.17945 10.4636 2.1508 10.0438C2.12184 9.61934 2.12156 9.08091 2.12156 8.32829H1.08156ZM5.31585 12.6029C4.51237 12.5891 4.09826 12.5378 3.77597 12.4043L3.37798 13.3651C3.90088 13.5817 4.49456 13.6289 5.29793 13.6427L5.31585 12.6029ZM1.36473 11.3519C1.74229 12.2634 2.46648 12.9876 3.37798 13.3651L3.77597 12.4043C3.1193 12.1323 2.59757 11.6106 2.32557 10.9539L1.36473 11.3519ZM13.8816 8.32829C13.8816 9.08091 13.8813 9.61934 13.8523 10.0438C13.8237 10.4636 13.7687 10.7338 13.6776 10.9539L14.6384 11.3519C14.7908 10.9839 14.8577 10.5873 14.8899 10.1146C14.9218 9.64652 14.9216 9.06668 14.9216 8.32829H13.8816ZM10.7052 13.6427C11.5085 13.6289 12.1022 13.5817 12.6251 13.3651L12.2272 12.4043C11.9049 12.5378 11.4907 12.5891 10.6872 12.6029L10.7052 13.6427ZM13.6776 10.9539C13.4056 11.6106 12.8838 12.1323 12.2272 12.4043L12.6251 13.3651C13.5366 12.9876 14.2608 12.2634 14.6384 11.3519L13.6776 10.9539ZM8.96156 2.76829C10.0191 2.76829 10.7758 2.76884 11.3654 2.8249C11.9473 2.88023 12.3125 2.98592 12.6019 3.16322L13.1453 2.27647C12.6651 1.98221 12.1218 1.85213 11.4638 1.78957C10.8136 1.72774 9.99899 1.72829 8.96156 1.72829V2.76829ZM14.9216 7.68829C14.9216 6.65086 14.9221 5.83627 14.8603 5.18601C14.7977 4.52801 14.6676 3.98478 14.3734 3.5046L13.4866 4.04799C13.6639 4.33731 13.7696 4.70258 13.825 5.28445C13.881 5.87407 13.8816 6.63072 13.8816 7.68829H14.9216ZM12.6019 3.16322C12.9625 3.3842 13.2657 3.68739 13.4866 4.048L14.3734 3.5046C14.0666 3.00405 13.6458 2.58321 13.1453 2.27647L12.6019 3.16322ZM7.04156 1.72829C6.00413 1.72829 5.18955 1.72774 4.53928 1.78957C3.88128 1.85213 3.33805 1.98221 2.85787 2.27647L3.40127 3.16322C3.69058 2.98592 4.05585 2.88023 4.63772 2.8249C5.22734 2.76884 5.984 2.76829 7.04156 2.76829V1.72829ZM2.12156 7.68829C2.12156 6.63072 2.12211 5.87407 2.17817 5.28445C2.2335 4.70258 2.33919 4.33731 2.51649 4.04799L1.62974 3.5046C1.33548 3.98478 1.2054 4.52801 1.14284 5.18601C1.08101 5.83627 1.08156 6.65086 1.08156 7.68829H2.12156ZM2.85787 2.27647C2.35732 2.5832 1.93648 3.00405 1.62974 3.5046L2.51649 4.04799C2.73747 3.68739 3.04066 3.3842 3.40127 3.16322L2.85787 2.27647ZM7.40662 13.8054C7.27707 13.5865 7.1619 13.3909 7.04961 13.2368C6.93091 13.0739 6.79305 12.9249 6.60079 12.8131L6.07791 13.7121C6.10178 13.726 6.13925 13.7535 6.20914 13.8493C6.28543 13.954 6.3721 14.0994 6.51165 14.3351L7.40662 13.8054ZM5.29793 13.6427C5.5797 13.6476 5.75552 13.6512 5.88893 13.6659C6.01269 13.6796 6.05576 13.6992 6.07791 13.7121L6.60078 12.8131C6.40681 12.7003 6.20576 12.6547 6.00339 12.6322C5.81065 12.6109 5.57831 12.6074 5.31585 12.6029L5.29793 13.6427ZM9.49145 14.3351C9.631 14.0994 9.71767 13.954 9.79395 13.8493C9.86384 13.7535 9.90132 13.726 9.92518 13.7121L9.40231 12.8131C9.21005 12.9249 9.07219 13.0739 8.95349 13.2368C8.84119 13.3909 8.72603 13.5865 8.59648 13.8054L9.49145 14.3351ZM10.6872 12.6029C10.4248 12.6074 10.1924 12.6109 9.99971 12.6322C9.79733 12.6547 9.59629 12.7003 9.40231 12.8131L9.92518 13.7121C9.94734 13.6992 9.99041 13.6796 10.1142 13.6659C10.2476 13.6512 10.4234 13.6476 10.7052 13.6427L10.6872 12.6029Z"
      fill="hsl(var(--primary))"
    />
    <path
      d="M5.44141 8.0083H5.44717M7.99565 8.0083H8.00141M10.5556 8.0083H10.5614"
      stroke="hsl(var(--primary))"
      strokeWidth="1.04"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
