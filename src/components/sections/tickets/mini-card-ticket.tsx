import { relativeTime } from '@/lib/relative-time';
import { supportLabel } from '@/lib/presentation-labels';
import { Ticket, TicketListItem } from '@/types/support';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { ConteudoModalTicket } from './conteudo-modal-ticket';
import { useState } from 'react';
import { AppServices } from '@/services/app.services';

interface MiniCardTicketProps {
  ticket: TicketListItem;
}

export function MiniCardTicketLoja({ ticket }: MiniCardTicketProps) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [tick, setTick] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTick = async () => {
    setOpenModal(true);
    setLoading(true);
    const [data, error] = await new AppServices().support.get(ticket.id);
    setTick(data);
    setLoading(false);
  };
  return (
    <>
      <ConteudoModalTicket
        onRedirect={() => (window.location.href = '/app/help-faq/tickets/' + tick!.id)}
        loading={loading}
        tick={tick}
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

      <div className="w-full h-56 p-4 bg-[#f4f7fa] rounded-xl flex-col justify-start items-start gap-2 inline-flex">
        <div className="self-stretch justify-between items-center inline-flex">
          <div className="rounded-xl justify-center items-center gap-1 flex">
            <div className="w-2 h-2 bg-[#aa4f22] rounded-sm" />
            <div className="text-[#657380] text-xs font-semibold font-['BR Sonoma'] leading-none">
              {supportLabel(ticket.priority)}
            </div>
          </div>
          <div className="text-[#95a3b2] text-xs font-normal font-['BR Sonoma'] leading-none">
            Chamado #{ticket.id}
          </div>
        </div>
        <div className="self-stretch justify-between items-center inline-flex">
          <div className="h-5 justify-start items-center gap-2 flex">
            <div className="h-5 justify-start items-start flex">
              <div className="h-5 px-2 py-1 bg-[#586e9d] rounded-xl justify-center items-center gap-2.5 flex">
                <div className="text-white text-xs font-semibold font-['BR Sonoma'] leading-none">
                  {supportLabel(ticket.status)}
                </div>
              </div>
            </div>
            <div className="grow shrink basis-0 text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-3">
              {relativeTime(new Date(ticket.createdAt))}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg border border-[#b1bcd3] justify-center items-center flex">
            <div className="w-8 h-8 justify-center items-center flex">
              {ticket.status === 'open' ? (
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.6802 8.5001L5.78727 10.3746C3.91687 12.2268 2.98168 13.1529 3.24349 13.9519C3.266 14.0206 3.29395 14.0874 3.32708 14.1518C3.71249 14.9001 5.03506 14.9001 7.6802 14.9001C10.3253 14.9001 11.6479 14.9001 12.0333 14.1518C12.0664 14.0874 12.0944 14.0206 12.1169 13.9519C12.3787 13.1529 11.4435 12.2268 9.57312 10.3746L7.6802 8.5001ZM7.6802 8.5001L9.57312 6.62558C11.4435 4.77338 12.3787 3.84728 12.1169 3.04825C12.0944 2.97957 12.0664 2.91275 12.0333 2.84843C11.6479 2.1001 10.3253 2.1001 7.6802 2.1001C5.03506 2.1001 3.71249 2.1001 3.32708 2.84843C3.29395 2.91275 3.266 2.97957 3.24349 3.04825C2.98168 3.84728 3.91687 4.77338 5.78727 6.62558L7.6802 8.5001Z"
                    stroke="#586E9D"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M6.40039 4.34009H8.96039"
                    stroke="#586E9D"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.2002 11.7002H8.0002"
                    stroke="#586E9D"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <CheckCircledIcon />
              )}
            </div>
          </div>
        </div>
        <div className="self-stretch h-20 flex-col justify-start items-start gap-2 flex">
          <div className="self-stretch h-12 flex-col justify-start items-start gap-1 flex">
            <div className="self-stretch justify-start items-center gap-3 inline-flex">
              <div className="grow shrink basis-0 h-4 justify-between items-center flex">
                <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                  <div className="self-stretch text-[#24292e] text-sm font-medium font-['BR Sonoma'] leading-tight">
                    {ticket.user.name}
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch text-[#657380] text-xs font-normal font-['BR Sonoma'] leading-none">
              {ticket.message}
            </div>
          </div>
          <div className="self-stretch justify-between items-center inline-flex">
            <div className="justify-start items-start flex">
              <div className="px-2 py-0.5 bg-[#e3ebf3] rounded-xl justify-center items-center gap-0.5 flex">
                <div className="text-[#434d56] text-xs font-semibold font-['BR Sonoma'] leading-none capitalize">
                  {supportLabel(ticket.category)}
                </div>
              </div>
            </div>
            <div className="justify-start items-center gap-2.5 flex">
              <div className="justify-start items-center gap-0.5 flex">
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.0965 12.5405L10.7078 7.16924C11.3815 6.52436 11.3815 5.4788 10.7078 4.83392C10.0341 4.18904 8.9418 4.18904 8.2681 4.83392L2.69747 10.1662C1.41744 11.3915 1.41744 13.378 2.69747 14.6033C3.9775 15.8286 6.05285 15.8286 7.33288 14.6033L12.9848 9.19317C14.8712 7.38751 14.8712 4.45996 12.9848 2.6543C11.0985 0.848633 8.04007 0.848633 6.1537 2.6543L1.59961 7.01355"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.04"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">
                  0
                </div>
              </div>
              <div className="justify-start items-center gap-0.5 flex">
                <div className="justify-start items-center gap-0.5 flex">
                  <svg
                    width="16"
                    height="17"
                    viewBox="0 0 16 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.69507 14.5085L9.14256 14.7733L8.69507 14.5085ZM9.04201 13.9223L8.59452 13.6574L9.04201 13.9223ZM6.95718 13.9223L6.50969 14.1872L6.50969 14.1872L6.95718 13.9223ZM7.30412 14.5085L7.75161 14.2436L7.75161 14.2436L7.30412 14.5085ZM1.84319 11.0049L2.32361 10.8059H2.32361L1.84319 11.0049ZM5.30494 12.9749L5.29598 13.4948L5.30494 12.9749ZM3.57502 12.7368L3.37603 13.2172H3.37603L3.57502 12.7368ZM14.156 11.0049L14.6364 11.2039V11.2039L14.156 11.0049ZM10.6943 12.9749L10.6853 12.4549L10.6943 12.9749ZM12.4242 12.7368L12.6232 13.2172H12.6232L12.4242 12.7368ZM12.8716 2.57189L12.5999 3.01527V3.01527L12.8716 2.57189ZM13.9281 3.62835L14.3714 3.35665V3.35665L13.9281 3.62835ZM3.12761 2.57189L2.85591 2.12852V2.12852L3.12761 2.57189ZM2.07116 3.62835L1.62779 3.35665H1.62779L2.07116 3.62835ZM6.3374 13.1146L6.59883 12.6651L6.59883 12.6651L6.3374 13.1146ZM9.14256 14.7733L9.4895 14.1872L8.59452 13.6574L8.24758 14.2436L9.14256 14.7733ZM6.50969 14.1872L6.85664 14.7733L7.75161 14.2436L7.40467 13.6574L6.50969 14.1872ZM8.24758 14.2436C8.1397 14.4259 7.85949 14.4259 7.75161 14.2436L6.85664 14.7733C7.36721 15.6359 8.63198 15.6359 9.14256 14.7733L8.24758 14.2436ZM7.03961 2.62034H8.95961V1.58034H7.03961V2.62034ZM13.8796 7.54034V8.18034H14.9196V7.54034H13.8796ZM2.11961 8.18034V7.54034H1.07961V8.18034H2.11961ZM1.07961 8.18034C1.07961 8.91873 1.07933 9.49857 1.11126 9.96664C1.14352 10.4394 1.21037 10.836 1.36278 11.2039L2.32361 10.8059C2.23244 10.5858 2.17749 10.3156 2.14885 9.89584C2.11989 9.47139 2.11961 8.93296 2.11961 8.18034H1.07961ZM5.3139 12.4549C4.51041 12.4411 4.09631 12.3898 3.77402 12.2563L3.37603 13.2172C3.89893 13.4338 4.4926 13.481 5.29598 13.4948L5.3139 12.4549ZM1.36278 11.2039C1.74034 12.1154 2.46452 12.8396 3.37603 13.2172L3.77402 12.2563C3.11734 11.9843 2.59562 11.4626 2.32361 10.8059L1.36278 11.2039ZM13.8796 8.18034C13.8796 8.93296 13.8793 9.47139 13.8504 9.89584C13.8217 10.3156 13.7668 10.5858 13.6756 10.8059L14.6364 11.2039C14.7889 10.836 14.8557 10.4394 14.888 9.96664C14.9199 9.49857 14.9196 8.91873 14.9196 8.18034H13.8796ZM10.7032 13.4948C11.5066 13.481 12.1003 13.4338 12.6232 13.2172L12.2252 12.2563C11.9029 12.3898 11.4888 12.4411 10.6853 12.4549L10.7032 13.4948ZM13.6756 10.8059C13.4036 11.4626 12.8819 11.9843 12.2252 12.2563L12.6232 13.2172C13.5347 12.8396 14.2589 12.1154 14.6364 11.2039L13.6756 10.8059ZM8.95961 2.62034C10.0172 2.62034 10.7738 2.62089 11.3634 2.67695C11.9453 2.73228 12.3106 2.83797 12.5999 3.01527L13.1433 2.12852C12.6631 1.83426 12.1199 1.70418 11.4619 1.64162C10.8116 1.57979 9.99704 1.58034 8.95961 1.58034V2.62034ZM14.9196 7.54034C14.9196 6.50291 14.9202 5.68833 14.8583 5.03806C14.7958 4.38006 14.6657 3.83683 14.3714 3.35665L13.4847 3.90005C13.662 4.18936 13.7677 4.55463 13.823 5.1365C13.8791 5.72612 13.8796 6.48278 13.8796 7.54034H14.9196ZM12.5999 3.01527C12.9605 3.23625 13.2637 3.53944 13.4847 3.90005L14.3714 3.35665C14.0647 2.8561 13.6439 2.43526 13.1433 2.12852L12.5999 3.01527ZM7.03961 1.58034C6.00218 1.58034 5.18759 1.57979 4.53733 1.64162C3.87933 1.70418 3.3361 1.83426 2.85591 2.12852L3.39931 3.01527C3.68863 2.83797 4.0539 2.73228 4.63577 2.67695C5.22538 2.62089 5.98204 2.62034 7.03961 2.62034V1.58034ZM2.11961 7.54034C2.11961 6.48278 2.12016 5.72612 2.17622 5.1365C2.23154 4.55463 2.33724 4.18936 2.51453 3.90005L1.62779 3.35665C1.33353 3.83683 1.20345 4.38006 1.14089 5.03806C1.07906 5.68833 1.07961 6.50291 1.07961 7.54034H2.11961ZM2.85591 2.12852C2.35537 2.43526 1.93452 2.8561 1.62779 3.35665L2.51453 3.90005C2.73551 3.53944 3.0387 3.23625 3.39931 3.01527L2.85591 2.12852ZM7.40467 13.6574C7.27511 13.4386 7.15995 13.2429 7.04765 13.0888C6.92896 12.926 6.7911 12.777 6.59883 12.6651L6.07596 13.5641C6.09982 13.578 6.1373 13.6055 6.20719 13.7014C6.28348 13.8061 6.37014 13.9514 6.50969 14.1872L7.40467 13.6574ZM5.29598 13.4948C5.57774 13.4997 5.75357 13.5032 5.88697 13.518C6.01074 13.5317 6.05381 13.5513 6.07596 13.5641L6.59883 12.6651C6.40486 12.5523 6.20381 12.5067 6.00143 12.4843C5.8087 12.463 5.57635 12.4595 5.3139 12.4549L5.29598 13.4948ZM9.4895 14.1872C9.62905 13.9514 9.71572 13.8061 9.792 13.7014C9.86189 13.6055 9.89937 13.578 9.92323 13.5641L9.40036 12.6651C9.2081 12.777 9.07023 12.926 8.95154 13.0888C8.83924 13.2429 8.72408 13.4386 8.59452 13.6574L9.4895 14.1872ZM10.6853 12.4549C10.4228 12.4595 10.1905 12.463 9.99776 12.4843C9.79538 12.5067 9.59434 12.5523 9.40036 12.6651L9.92323 13.5641C9.94538 13.5513 9.98846 13.5317 10.1122 13.518C10.2456 13.5032 10.4214 13.4997 10.7032 13.4948L10.6853 12.4549Z"
                      fill="hsl(var(--primary))"
                    />
                    <path
                      d="M5.43945 7.85962H5.44521M7.99369 7.85962H7.99945M10.5537 7.85962H10.5595"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1.04"
                      strokeLinecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div className="text-center text-[#434d56] text-xs font-medium font-['BR Sonoma'] leading-none">
                    0
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch pt-2 border-t border-[#d7e0ea] justify-between items-center inline-flex">
          <button
            className="p-2 w-full rounded-tl-lg bg-[#1b2841] rounded-lg text-white justify-center items-center flex"
            onClick={loadTick}
          >
            Visualizar chamado
          </button>
        </div>
      </div>
    </>
  );
}
