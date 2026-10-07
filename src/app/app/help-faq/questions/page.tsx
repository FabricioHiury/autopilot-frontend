'use client';
import { supportLabel, tagLabel } from '@/lib/presentation-labels';

import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import { PageTitle } from '@/components/commons/page-title';
import Pagination from '@/components/commons/pagination/Pagination';
import { Input } from '@/components/ui/input';
import { AppServices } from '@/services/app.services';
import { relativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/class-name.utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import NoData from '@/components/commons/estados/NoData';

interface FaqItem {
  id: string;
  title: string;
  category: string;
  status: string;
  resumo: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Page() {
  const router = useRouter();
  const api = useMemo(() => new AppServices(), []);

  const categories = useMemo(
    () => [
      { value: 'todas', label: 'Todas' },
      { value: 'Integração', label: 'Integração' },
      { value: 'Chat', label: 'Conversa' },
      { value: 'Atendimentos', label: 'Atendimentos' },
      { value: 'Conta', label: 'Conta' },
      { value: 'Assinatura', label: 'Assinatura' },
      { value: 'Outros', label: 'Outros' },
    ],
    [],
  );

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [category, setCategory] = useState('todas');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  const handleChangeCategory = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleChangeSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    let isMounted = true;
    try {
      const [data, error] = await api.faq.list({
        page: page,
        limit: limit,
        search: debouncedSearch,
        tags: category === 'todas' ? undefined : [category],
      });

      if (!isMounted) return;

      setLoading(false);

      if (error) {
        console.error(error);
        setFaqs([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }

      const list = (data as FaqItem[]) ?? [];
      setFaqs(list);

      const computedTotal = Array.isArray(data) ? data.length : list.length;
      setTotal(computedTotal);
      setTotalPages(Math.max(1, Math.ceil(computedTotal / Math.max(1, limit))));
    } catch (err) {
      if (!isMounted) return;
      console.error(err);
      setLoading(false);
      setFaqs([]);
      setTotal(0);
      setTotalPages(1);
    }
    return () => {
      isMounted = false;
    };
  }, [api.faq, page, limit, debouncedSearch, category]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchFaqs();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchFaqs]);

  const categoryButtons = useMemo(
    () =>
      categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleChangeCategory(cat.value)}
          className={cn(
            "block text-[#95a3b2] text-sm font-semibold font-['BR Sonoma'] leading-tight pb-1 border-b-2 border-transparent transition-all hover:border-[#434d56]",
            cat.value === category ? 'text-[#434d56] border-[hsl(var(--primary))]' : '',
          )}
          type="button"
        >
          {cat.label}
        </button>
      )),
    [categories, category, handleChangeCategory],
  );

  return (
    <div className="min-h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center p-8 bg-white">
          <PageTitle title="FAQs" />
          <div className="flex items-center gap-2">
            <ModalNotificacoes />
          </div>
        </div>

        <div className="bg-[url(/images/fundo-faq.png)] bg-slate-600 bg-cover bg-center p-8 py-[3.75rem] flex flex-col gap-0.5">
          <p className="text-[#ad161c] text-xs font-medium leading-3 tracking-wide uppercase">
            Central de ajuda AutoPilot
          </p>
          <h2 className="text-white text-4xl font-bold leading-10">Dúvidas frequentes</h2>
          <p className="text-[#e3ebf3] text-base font-normal leading-tight">
            Confira os artigos respondendo as principais dúvidas!
          </p>
        </div>

        <div className="p-8 bg-white h-5 flex justify-between items-center">
          <div className="flex items-center gap-6">{categoryButtons}</div>
          <div>
            <SearchFaq value={search} onChange={handleChangeSearch} />
          </div>
        </div>

        {loading && <LoadingGlobal />}
        {!loading && faqs.length === 0 && <NoData label="Nenhum item encontrado" />}

        {!loading && faqs.length > 0 && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="min-h-20 p-3 bg-white rounded-xl flex-col justify-start items-start gap-2 inline-flex"
              >
                <div className="px-2 py-1 bg-[#edf2f7] rounded-xl justify-center items-center gap-2.5 inline-flex">
                  <div className="text-[#24292e] text-xs font-semibold leading-none capitalize">
                    {supportLabel(faq.category)}
                  </div>
                </div>
                <div className="self-stretch justify-between items-center inline-flex">
                  <div className="text-[#434d56] text-xs font-normal leading-none">
                    {relativeTime(new Date(faq.createdAt))}
                  </div>
                  <div className="w-5 h-5 pl-0.5 pr-1 py-px justify-center items-center flex">
                    <Link href={`/app/help-faq/questions/${faq.id}`}>
                      <svg
                        width="15"
                        height="18"
                        viewBox="0 0 15 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.5483 3.22232C10.5483 2.35401 11.2522 1.6501 12.1205 1.6501C12.9888 1.6501 13.6927 2.35401 13.6927 3.22232C13.6927 4.09063 12.9888 4.79454 12.1205 4.79454C11.2522 4.79454 10.5483 4.09063 10.5483 3.22232ZM12.1205 0.350098C10.5342 0.350098 9.24826 1.63604 9.24826 3.22232C9.24826 3.39912 9.26424 3.57219 9.29482 3.74016L5.08107 6.68979C5.05632 6.70712 5.03314 6.72586 5.01158 6.74582C4.52221 6.3589 3.90388 6.12793 3.2316 6.12793C1.64531 6.12793 0.359375 7.41387 0.359375 9.00015C0.359375 10.5864 1.64531 11.8724 3.2316 11.8724C3.90391 11.8724 4.52227 11.6414 5.01164 11.2544C5.03319 11.2744 5.05634 11.2931 5.08107 11.3104L9.29484 14.26C9.26424 14.428 9.24826 14.6011 9.24826 14.778C9.24826 16.3643 10.5342 17.6502 12.1205 17.6502C13.7068 17.6502 14.9927 16.3643 14.9927 14.778C14.9927 13.1917 13.7068 11.9058 12.1205 11.9058C11.1844 11.9058 10.3528 12.3536 9.82847 13.0467L5.82657 10.2454L5.82208 10.2423C6.00266 9.86637 6.10382 9.44507 6.10382 9.00015C6.10382 8.5552 6.00264 8.13388 5.82204 7.75794L5.82657 7.75479L9.82841 4.9535C10.3528 5.64667 11.1843 6.09454 12.1205 6.09454C13.7068 6.09454 14.9927 4.8086 14.9927 3.22232C14.9927 1.63604 13.7068 0.350098 12.1205 0.350098ZM3.2316 7.42793C2.36328 7.42793 1.65938 8.13184 1.65938 9.00015C1.65938 9.86847 2.36328 10.5724 3.2316 10.5724C4.09991 10.5724 4.80382 9.86847 4.80382 9.00015C4.80382 8.13184 4.09991 7.42793 3.2316 7.42793ZM12.1205 13.2058C11.2522 13.2058 10.5483 13.9097 10.5483 14.778C10.5483 15.6463 11.2522 16.3502 12.1205 16.3502C12.9888 16.3502 13.6927 15.6463 13.6927 14.778C13.6927 13.9097 12.9888 13.2058 12.1205 13.2058Z"
                          fill="hsl(var(--primary))"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="self-stretch h-20 flex-col justify-start items-start gap-1 flex">
                  <div className="self-stretch text-[#24292e] text-xl font-semibold leading-tight">
                    {faq.title}
                  </div>
                  {/* <div className="self-stretch text-[#657380] text-sm font-normal leading-tight line-clamp-2">{faq.resumo}</div> */}
                  <div className="flex flex-wrap gap-1">
                    {faq.tags.map((tag, idx) => (
                      <div
                        key={`${faq.id}-tag-${idx}-${tag}`}
                        className="px-2 py-1 bg-[#edf2f7] rounded-xl justify-center items-center gap-2.5 inline-flex"
                      >
                        <div className="text-[#24292e] text-xs font-semibold leading-none">
                          {tagLabel(tag)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-8 pt-3 pb-4 bg-white">
        <Pagination
          background="bg-white"
          totalPages={totalPages}
          setLimitItens={setLimit}
          limitItens={limit}
          limitNumberPages={2}
          setPage={setPage}
          label="Dúvidas frequentes"
          page={page}
          total={total}
          currentLength={faqs.length}
        />
      </div>
    </div>
  );
}

const SearchFaq = memo(function SearchFaq({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const classNames = cn('px-9 bg-white text-zinc-700 min-w-[20rem]', className);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleChange}
        placeholder="Qual a sua dúvida?"
        className={classNames}
        aria-label="Pesquisar dúvidas"
      />
      <div className="absolute top-2.5 left-3" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="hsl(var(--secondary))"
          viewBox="0 0 256 256"
        >
          <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z"></path>
        </svg>
      </div>
    </div>
  );
});
