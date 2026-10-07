import { presentationLabel } from '@/lib/presentation-labels';
import ButtonDefault from '@/components/inputs/buttons/ButtonDefault';
import AvatarList from '../customers/AvatarList';
import CardGeneric from './CardGeneric';
import CardHistorico from '@/components/cards/CardHistorico';
import { Deal } from '@/types/customer-details';
import handleDate from '@/utils/classes/format/time';
import { useRouter } from 'next/navigation';
import CenterModal from '@/components/commons/modais/center-modal';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/class-name.utils';
import { profileImageUrl } from '@/lib/profile.utils';
import { navigateToDeal } from '@/utils/navigation/deal-navigation';

interface props {
  deal: Deal;
}
const CardsHistorico: React.FC<props> = ({ deal }) => {
  console.log(deal);
  const assignees = deal.dealAssignee.map((obj) => {
    return {
      name: obj.employee.name,
      icon: process.env.NEXT_PUBLIC_API_URL + '/avatar/user' + obj.employee.userId,
    };
  });

  const router = useRouter();

  const [currentImagem, setCurrentImagem] = useState<string>('');
  const [modal, setModal] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const myObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        for (let entry of entries) {
          setWidth(entry.target.clientWidth - 1);
        }
      },
    );
    const myElement = document.getElementById('refImage') as Element;
    myObserver.observe(myElement);

    return () => {
      myObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 w-full mt-2" id="refImage">
        <CardGeneric>
          <div className="flex w-full flex-wrap gap-2 justify-between">
            <div className="flex flex-col">
              <h3 className="text-[hsl(var(--secondary))] font-semibold text-[18px]">
                {assignees
                  .map((obj) => {
                    return obj.name;
                  })
                  .join(' - ')}
              </h3>
              <h4 className="text-[#485B80] text-[12px]">
                Atendimento iniciado em{' '}
                {handleDate.formatISODate(deal.createdAt, "dd 'de' MMMM 'às' HH':'ss ")}
              </h4>
            </div>
            <div className="flex gap-5">
              <AvatarList users={assignees} total={10} />
              <ButtonDefault
                onClick={() => navigateToDeal(deal.id)}
                width="195px"
                background="hsl(var(--secondary))"
                label="Ver página do Atendimento"
              />
            </div>
          </div>
        </CardGeneric>

        <div className="flex xl:flex-nowrap flex-wrap flex-row gap-4">
          <CardGeneric title="Tarefas" flexLevel="flex-[2]">
            {deal.dealTask.length > 0 && (
              <div className="">
                <AvatarList
                  users={deal.dealTask.map((obj) => {
                    return {
                      name: obj.employee.name,
                      icon: profileImageUrl(obj.employee.userId),
                    };
                  })}
                  total={10}
                />
              </div>
            )}
            <div className=" flex flex-row gap-2 items-center">
              <h3 className="text-[hsl(var(--secondary))] text-[24px] font-bold">
                {deal.dealTask.filter((obj) => obj.completed).length}/{deal.dealTask.length}
              </h3>
              <div className="rounded-2xl text-[#FEFEFE] flex items-center justify-center w-[36px] h-[21px] flex-shrink-0 font-semibold flex-grow-0 bg-[hsl(var(--primary))] px-1 py-[2px] text-[12px]">
                {deal.dealTask.length > 0
                  ? (deal.dealTask.filter((obj) => obj.completed).length / deal.dealTask.length) *
                      100 +
                    '%'
                  : '0%'}
              </div>
            </div>
          </CardGeneric>
          <div className="flex xl:flex-row flex-col gap-4 w-full flex-wrap">
            <CardGeneric title="Mensagens" flexLevel="flex-[1]">
              <h3 className="text-[hsl(var(--secondary))] text-[28px] font-semibold">
                {deal.chat.length}
              </h3>
            </CardGeneric>
            <CardGeneric title="Comentarios" flexLevel="flex-[1]">
              <h3 className="text-[hsl(var(--secondary))] text-[28px] font-semibold">
                {deal.chat.length}
              </h3>
            </CardGeneric>

            <CardGeneric title="Visitas" flexLevel="flex-[1]">
              <CardVisita />
            </CardGeneric>
          </div>
        </div>
        {deal.attachments.length > 0 && (
          <>
            <h3 className="text-[18px] text-[hsl(var(--secondary))] font-semibold mt-2">
              Alguns arquivos enviados neste atendimento
            </h3>
            <div
              style={{ width: width + 'px' }}
              className="duration-0 transition-none flex flex-grow-0 flex-shrink gap-3 overflow-x-auto p-2 scroll-padrao"
            >
              {deal.attachments.map((obj, i) => {
                return (
                  <div
                    className="w-[190px] h-[140px] relative flex group items-center overflow-clip rounded-lg"
                    key={i}
                  >
                    <button
                      onClick={() => {
                        setCurrentImagem(obj.file.url);
                        setModal(true);
                      }}
                      className="absolute top-0 left-0  w-full h-full z-10"
                    ></button>
                    <object
                      data={obj.file.url}
                      className="object-cover w-full absolute top-0 left-0 overflow-hidden"
                    />
                    {obj.file.type.includes('application') && (
                      <div className="absolute right-0 ">
                        <div className="bg-[hsl(var(--secondary))] rounded-sm rounded-r-none text-[12px] text-secondary-foreground px-8 py-1">
                          {obj.file.type.replace('application/', '').toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <h3 className="text-[18px] font-semibold text-[hsl(var(--secondary))] mt-3">
          Histórico de Atividades e Interações
        </h3>
        <div className="flex flex-col gap-8 p-4 pt-2">
          {deal.dealActivityLogs.map((obj: any, i: number) => {
            return (
              <CardHistorico
                key={i}
                icon="/icons/note.svg"
                createdAt={handleDate.formatRelativeDate(new Date(obj.createdAt))}
              >
                {obj.message}
                {i < deal.dealActivityLogs.length - 1 && (
                  <div className="bg-[#DDE6F2] top-[50px] left-[23px] absolute w-[2px] h-full"></div>
                )}
              </CardHistorico>
            );
          })}
        </div>
      </div>
      {modal && (
        <CenterModal
          onClose={() => {
            setModal(false);
          }}
          idSelector="content-container"
        >
          <div className="flex flex-col w-[55vw] h-[75vh]">
            <object data={currentImagem} className="h-full w-full" />
          </div>
        </CenterModal>
      )}
    </>
  );
  function CardVisita() {
    if (deal.dealVisit.length === 0) {
      return (
        <div
          className={cn(
            'w-full  flex flex-col items-center justify-center text-[#657380] gap-2',
            '',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={22}
            height={22}
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
          </svg>
          <div className="text-sm font-normal leading-3 text-center">Nenhuma visita agendada</div>
        </div>
      );
    }
    const visita = deal.dealVisit[0]!;
    return (
      <div className="flex flex-col justify-start items-start  gap-1 text-slate-700 font-semibold text-[12px]">
        Tipo de visita: {presentationLabel(visita.type)}
        <div className="p-1 bg-slate-200 px-2 rounded-lg inline-flex justify-start items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none">
            <path
              stroke="#485B80"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="m4.378 11.543-.874 1.577M9.623 11.543l.874 1.577M7 12.246A5.245 5.245 0 1 0 7 1.755a5.245 5.245 0 0 0 0 10.49Z"
            />
            <path
              stroke="#485B80"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M1.93 5.602A2.623 2.623 0 1 1 5.61 1.94M7 1.755V.881M7 4.378V7M7 7l1.854 1.855M12.07 5.602A2.622 2.622 0 1 0 8.392 1.94"
            />
          </svg>
          <div className="justify-start text-slate-600 text-xs font-semibold">
            {handleDate.formatISODate(visita.data, "dd'/'MM'/'yy")} - {visita.hourStart}
          </div>
        </div>
      </div>
    );
  }
};

export default CardsHistorico;
