'use client';
import { supportLabel } from '@/lib/presentation-labels';

import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import NoData from '@/components/commons/estados/NoData';
import InputPesquisar from '@/components/commons/inputs/input-pesquisar';
import SelectComLabel from '@/components/commons/inputs/select-com-label';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import { PageTitle } from '@/components/commons/page-title';
import Pagination from '@/components/commons/pagination/Pagination';
import CalendarSelect from '@/components/inputs/select/CalendarSelect';
import { MiniCardTicketLoja } from '@/components/sections/tickets/mini-card-ticket';
import GoBackPage from '@/components/sections/go-back-page';
import { AppServices } from '@/services/app.services';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TicketListItem } from '@/types/support';
import { DateRange } from 'react-day-picker';

type Period = { from?: Date | null; to?: Date | null };
type FilterState = {
  status?: string;
  category?: string;
  priority?: string;
  search: string;
  period: Period;
};

const STATUS_OPTIONS = [
  { label: 'Em aberto', value: 'open' },
  { label: 'Em Resolução', value: 'at resolution' },
  { label: 'Resolvido', value: 'closed' },
];

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Page() {
  const api = useMemo(() => new AppServices(), []);

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    status: undefined,
    category: undefined,
    priority: undefined,
    search: '',
    period: { from: undefined, to: undefined },
  });

  const debouncedSearch = useDebouncedValue(filter.search, 400);

  const isFilterEmpty = useMemo(() => {
    const { search, status, priority, category, period } = filter;
    const noDates = !period?.from && !period?.to;
    return (search ?? '') === '' && !status && !priority && !category && noDates;
  }, [filter]);

  const setFilterItem = useCallback(
    (value: string | undefined, key: 'status' | 'category' | 'priority' | 'search') => {
      setFilter((prev) => ({
        ...prev,
        [key]: value ?? '',
      }));
      setPage(1);
    },
    [],
  );

  const countTicketsByCategory = useCallback(
    (cat: string) => tickets.filter((t) => t.category === cat).length,
    [tickets],
  );

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let mounted = true;
    try {
      const [data, error] = await api.support.list({
        page: page,
        itemsPage: limit,
        search: debouncedSearch,
        status: filter.status as 'open' | 'at resolution' | 'closed' | undefined,
        priority: filter.priority as 'normal' | 'urgent' | undefined,
        category: filter.category,
        dataStart: filter.period.from ? new Date(filter.period.from) : undefined,
        dataEnd: filter.period.to ? new Date(filter.period.to) : undefined,
      });

      if (!mounted) return;
      if (error || !data) {
        console.error(error);
        setTickets([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      setTickets(data.tickets);
      setTotalPages(data.totalPages ?? 1);
      setPage(data.page ?? page);
    } catch (err) {
      if (!mounted) return;
      console.error(err);
      setTickets([]);
      setTotalPages(1);
    } finally {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [api.support, page, limit, debouncedSearch, filter]);

  const fetchPriorities = useCallback(async () => {
    const [data, error] = await api.support.listPriorities();
    if (error) {
      console.error(error);
      return;
    }
    setPriorities(data);
  }, [api.support]);

  const fetchCategories = useCallback(async () => {
    const [data, error] = await api.support.listCategories();
    if (error) {
      console.error(error);
      return;
    }
    setCategories(data);
  }, [api.support]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchTickets();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTickets]);

  useEffect(() => {
    fetchCategories();
    fetchPriorities();
  }, [fetchCategories, fetchPriorities]);

  return (
    <div className="flex flex-col items-start h-full justify-start pb-20 md:pb-4">
      <div className="flex flex-col gap-3 w-full p-9 bg-white">
        <GoBackPage />
        <div className="flex justify-between items-center">
          <PageTitle title="Chamados de ajuda" />
          <div className="flex items-center gap-3">
            <ModalNotificacoes />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full h-full px-4">
        <div>
          <div className="flex flex-col pt-6 pb-4 w-full gap-4">
            <div className="flex items-center flex-wrap gap-4 w-full justify-between">
              <div className="flex items-center gap-4 mr-12">
                <b className="text-neutral-950 text-[18px] font-medium">Chamados</b>
                {!isFilterEmpty && (
                  <button
                    className="text-[#485B80] font-medium text-xs"
                    onClick={() =>
                      setFilter({
                        status: undefined,
                        category: undefined,
                        priority: undefined,
                        search: '',
                        period: { from: undefined, to: undefined },
                      })
                    }
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <SelectComLabel
                  label=""
                  className="w-[8.5rem]"
                  placeholder="Prioridade "
                  options={priorities.map((v) => ({ label: supportLabel(v), value: v }))}
                  value={filter.priority}
                  onChange={(v: any) => setFilterItem(v, 'priority')}
                />
                <SelectComLabel
                  label=""
                  className="w-[8.5rem]"
                  placeholder="Situação "
                  options={STATUS_OPTIONS}
                  value={filter.status}
                  onChange={(v: any) => setFilterItem(v, 'status')}
                />
                <SelectComLabel
                  label=""
                  className="w-[8.5rem]"
                  placeholder="Categoria "
                  options={categories.map((v) => ({ label: supportLabel(v), value: v }))}
                  value={filter.category}
                  onChange={(v: any) => setFilterItem(v, 'category')}
                />

                <CalendarSelect
                  default={1}
                  range={filter.period as DateRange}
                  setRange={(value) => {
                    setFilter((prev) => ({
                      ...prev,
                      period: value ?? { from: null, to: null },
                    }));
                    setPage(1);
                  }}
                />

                <div className="min-w-[300px] grid">
                  <InputPesquisar
                    className="grow"
                    placeholder="Pesquisar"
                    value={filter.search}
                    onChange={(v) => setFilterItem(v, 'search')}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-3 bg-[#e3ebf3] rounded-lg">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className="flex items-center gap-1.5"
                  onClick={() => setFilterItem(cat, 'category')}
                >
                  <div className="text-[#24292e] text-xs font-normal font-['BR Sonoma'] leading-none capitalize">
                    {cat}
                  </div>
                  <div className="px-2 py-0.5 bg-[hsl(var(--primary))] rounded-full">
                    <div className="text-right text-[#fefefe] text-xs font-medium font-['BR Sonoma'] leading-none">
                      {countTicketsByCategory(cat)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <TicketList loading={loading} tickets={tickets} />

          <div className="w-full py-4">
            <div className="w-full px-4 py-3 bg-[#1b2841] rounded-xl justify-between items-center inline-flex">
              <div className="flex-col justify-start items-start gap-1 inline-flex">
                <div className="self-stretch text-white text-base font-semibold font-['BR Sonoma'] leading-tight">
                  Ainda tem dúvidas?
                </div>
                <div className="self-stretch">
                  <span className="text-[#e3ebf3] text-sm font-normal font-['BR Sonoma'] leading-tight">
                    Acesse a{' '}
                  </span>
                  <Link
                    href={'/app/help-faq/new-ticket'}
                    className="text-[hsl(var(--primary))] text-sm font-normal font-['BR Sonoma'] underline leading-tight"
                  >
                    criação de chamados
                  </Link>
                  <span className="text-[#e3ebf3] text-sm font-normal font-['BR Sonoma'] leading-tight">
                    {' '}
                    para mais ter sua dúvida respondida pela nossa equipe!
                  </span>
                </div>
              </div>
              <Link
                href={'/app/help-faq/new-ticket'}
                className="bg-white rounded-lg flex p-3 text-[#24292e] text-xs font-semibold"
              >
                Criar Novo Chamado
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 pt-3 pb-4 bg-white">
        <Pagination
          background="bg-white"
          totalPages={totalPages}
          setLimitItens={setLimit}
          limitItens={limit}
          label="Chamados"
          limitNumberPages={2}
          setPage={setPage}
          page={page}
          total={tickets.length}
          currentLength={tickets.length}
        />
      </div>
    </div>
  );
}

function TicketList({ loading, tickets }: { loading: boolean; tickets: TicketListItem[] }) {
  if (loading) return <LoadingGlobal />;
  if (!loading && tickets.length === 0) return <NoData label="Nenhuma informação para exibir" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full p-4 bg-white rounded-xl">
      {tickets.map((ticket) => (
        <MiniCardTicketLoja key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
