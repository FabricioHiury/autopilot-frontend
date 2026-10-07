'use client';
import { supportLabel } from '@/lib/presentation-labels';

import ButtonAdd from '@/components/commons/buttons/button-add';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import InputPesquisarBlue from '@/components/commons/inputs/input-pesquisar-blue';
import SelectSweet from '@/components/commons/inputs/select-lego';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import { IconDelete, IconDeleteModern } from '@/components/icons/icon-delete';
import { IconEdit } from '@/components/icons/icon-edit';
import DropBlock from '@/components/lego/drop-block';
import FocusBlock from '@/components/lego/focus-block';
import IconActionsRed from '@/components/nav/icons/actions-icon';
import { ModalFaq } from '@/components/sections/ModalFaq';
import { SubTitle, Title } from '@/components/sections/Text';
import GoBackPage from '@/components/sections/go-back-page';
import { cn } from '@/lib/class-name.utils';
import { apiAdmin } from '@/utils/classes/api';
import handleDate from '@/utils/classes/format/time';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type FAQItem = {
  id: string;
  title: string;
  category: string;
  status: 'published' | 'draft';
  resumo: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

const optionsStatus = [
  {
    value: 'active',
    label: 'Em aberto',
  },
  {
    value: 'inactive',
    label: 'Em resolução',
  },
  {
    value: 'todos',
    label: 'Resolvido',
  },
];
const optionsCategoria = [
  { value: 'todas', label: 'Todas' },
  { value: 'anuncios', label: 'Anúncios' },
  { value: 'contas', label: 'Contas' },
  { value: 'estoque', label: 'Estoque' },
];

const optionsTipo = [
  { value: 'todos', label: 'Todos' },
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'feedback', label: 'Avaliação' },
  { value: 'duvidas', label: 'Dúvidas' },
];

export default function PageFaq() {
  const router = useRouter();

  const [filtros, setFiltros] = useState({
    status: '',
    category: '',
    type: '',
    search: '',
  });
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  function upFiltro(value: any, obj: string) {
    setFiltros((old) => ({
      ...old,
      [obj]: value,
    }));
  }
  async function load() {
    setLoading(true);
    const [r, e] = await apiAdmin.get(
      '/faq' +
        apiAdmin.query.searchInMemoryQuerys({
          page: 1,
          limit: 10,
          search: filtros.search,
          tags: '',
        }),
    );
    console.log(r);
    if (e) {
      setLoading(false);
      setFaqs([]);
      return;
    }
    setFaqs(Array.isArray(r.data) ? r.data : []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, [filtros]);

  return (
    <div className=" flex flex-col items-start h-full justify-start">
      <div className="p-9 flex flex-col gap-3 w-full bg-white">
        <GoBackPage />
        <div className="flex justify-between items-center">
          <Title label="FAQs" />
          <div className="flex items-center gap-3">
            {/* <ConfigIconAnimation/> */}
            {/* <BellFillAnimation/> */}
            <ModalNotificacoes />
            <ButtonAdd
              onClick={() => {
                router.push('/backoffice/app/faq/publish');
              }}
              title="Criar nova FAQ"
            />
          </div>
        </div>
      </div>

      <div className="px-9 pt-2 pb-6 flex justify-between w-full flex-wrap items-center gap-4 bg-white rounded-b-xl">
        <SubTitle label="Perguntas publicadas" />
        <div className="flex items-center gap-2 xl:flex-nowrap flex-wrap flex-grow">
          <SelectSweet
            placeholder="Situação"
            options={optionsStatus}
            value={filtros.status}
            setValue={(v) => upFiltro(v, 'status')}
          />
          <SelectSweet
            placeholder="Categoria"
            options={optionsCategoria}
            value={filtros.category}
            setValue={(v) => upFiltro(v, 'category')}
          />
          <SelectSweet
            placeholder="Tipos"
            options={optionsTipo}
            value={filtros.type}
            setValue={(v) => upFiltro(v, 'type')}
          />
          <InputPesquisarBlue
            onChange={(event) => {
              upFiltro(event, 'search');
            }}
            value={filtros.search}
            placeholder="Procurar por palavra chave"
            classNameBar="bg-white"
          />
        </div>
      </div>

      <div className="px-9 mt-6 w-full h-full">
        <Lista itens={faqs} loading={loading} onReload={() => load()} />
      </div>
    </div>
  );
}

function Tag({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <div
      className={'flex justify-center font-semibold items-center  p-1 px-3 rounded-lg'}
      style={{ background: bg, color: color }}
    >
      {label}
    </div>
  );
}

function ItemLista({ item, onReload }: { item: FAQItem; onReload: VoidFunction }) {
  const [deletePop, setDeletePop] = useState<boolean>(false);
  const [viewMenu, setViewMenu] = useState<boolean>(false);
  const actionsMenu = [
    {
      label: 'Visualizar',
      icon: null,
      action: (item: FAQItem) => {
        window.location.href = '/backoffice/app/faq/post/' + item.id;
      },
    },
    {
      label: 'Editar',
      icon: IconEdit,
      action: (item: FAQItem) => {
        window.location.href = '/backoffice/app/faq/publish?id=' + item.id;
      },
    },
    {
      label: 'Excluir',
      icon: IconDelete,
      action: (item: FAQItem) => {
        deleteF(item);
      },
    },
  ];
  async function deleteF(item: FAQItem) {
    apiAdmin.delete('/faq/' + item.id);
    setDeletePop(true);
    setTimeout(() => {
      onReload();
    }, 500);
  }
  return (
    <>
      <ModalFaq
        onClick={() => {}}
        icon={<IconDeleteModern />}
        onClose={() => setDeletePop(false)}
        visible={deletePop}
        text="Organize os artigos de ajuda disponíveis para as equipes das concessionárias."
        title="Publicação Excluida com sucesso"
        textBtn=""
      />

      <div className="flex justify-start font-medium py-[6px] w-full content-start items-center">
        <div className="flex flex-col flex-[3]">
          <b className="text-[14px]">{item.title}</b>
          <span>aifjaoijsaoidjasd</span>
        </div>
        <div className="flex justify-center  flex-[3]">
          <Tag label={supportLabel(item.category)} bg="#E3EBF3" color="#24292E" />
        </div>

        <div className="flex  justify-center flex-[3]">
          <Tag label={supportLabel(item.status)} bg="#B03C03" color="white" />
        </div>

        <div className="flex justify-center flex-[3]">
          {handleDate.formatISODate(item.createdAt)}
        </div>

        <div className="flex  justify-center flex-[3]">{item.views}</div>

        <FocusBlock
          className="flex justify-center relative flex-[1]"
          viewObject={viewMenu}
          onDisable={() => setViewMenu(false)}
        >
          <button onClick={() => setViewMenu(true)}>
            <IconActionsRed />
          </button>
          <DropBlock
            className="flex flex-col top-[100%] overflow-hidden z-10  rounded-lg absolute bg-white left-[-100%] shadow-lg"
            isDrop={viewMenu}
          >
            {actionsMenu.map((obj, i) => {
              const IconComponent = obj.icon;
              return (
                <button
                  onClick={() => {
                    setViewMenu(false);
                    obj.action(item);
                  }}
                  className={cn(
                    'flex gap-1 p-2 hover:bg-slate-200 bg-white ease-in-out duration-300 px-6',
                    i == 0 ? '' : 'border-t border-slate-300',
                  )}
                  key={i}
                >
                  {IconComponent && <IconComponent size={16} fill="rgb(239,68,68)" />}

                  {obj.label}
                </button>
              );
            })}
          </DropBlock>
        </FocusBlock>
      </div>
    </>
  );
}

function Lista({
  itens,
  loading,
  onReload,
}: {
  itens: FAQItem[];
  loading: boolean;
  onReload: VoidFunction;
}) {
  if (loading)
    return (
      <>
        <LoadingGlobal />
      </>
    );

  const itemsArray = Array.isArray(itens) ? itens : [];

  if (itemsArray.length === 0)
    return (
      <span className="text-[14px] w-full text-center flex justify-center p-32">
        Nenhuma pergunta encontrada...
      </span>
    );

  return (
    <FlexTable
      headers={[
        { label: 'Pergunta frequente', level: 3 },
        { label: 'Categoria', level: 3 },
        { label: 'Situação', level: 3 },
        { label: 'Data publicação', level: 3 },
        { label: 'Visitas', level: 3 },
        { label: 'Ações', level: 1 },
      ]}
    >
      {itemsArray.map((item, indexL) => {
        return <ItemLista onReload={onReload} item={item} key={indexL} />;
      })}
    </FlexTable>
  );
}

function FlexTable({
  headers,
  children,
}: {
  headers: { label: string; level: number }[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col overflow-y-auto h-full w-full')}>
      <div className="bg-[#E3EBF3] flex rounded-xl text-[12px] px-5">
        {headers.map((obj, i) => {
          return (
            <div
              key={i}
              style={{ flex: obj.level }}
              className={cn(
                'flex items-center text-[#24292E] text-center py-2 px-0',
                i === 0 ? '' : 'justify-center',
              )}
            >
              {obj.label}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col justify-start items-start bg-white mt-3 rounded-xl px-5 w-full text-[#24292E] text-[12px]">
        {children}
      </div>
    </div>
  );
}
