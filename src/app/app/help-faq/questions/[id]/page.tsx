'use client';

import Loading from '@/components/commons/estados/LoadingGlobal';
import LexicalView from '@/components/lex/LexicalView';
import ShareIcon from '@/components/sections/deals/icons/icon-compartilhar';
import GoBack from '@/components/sections/go-back-page';
import time from '@/utils/classes/format/time';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { AppServices } from '@/services/app.services';
import { ModalNotificacoes } from '@/components/commons/modais/modal-notificacoes';
import Link from 'next/link';
import { PageTitle } from '@/components/commons/page-title';

type FAQItem = {
  id: string;
  title: string;
  category: string;
  status: 'publicado' | 'rascunho' | 'archived';
  resumo: string;
  views: number;
  createdAt: string;
  content: string;
  updatedAt: string;
  tags: string[];
};

export default function Page() {
  const [item, setItem] = useState<FAQItem | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const api = useMemo(() => new AppServices(), []);
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    const raw = params.id as string;
    return raw;
  }, [params.id]);

  const loadFaqData = useCallback(async () => {
    if (id === null) {
      toast.error('FAQ não encontrada');
      router.push('/app/help-faq/questions');
      setLoading(false);
      return;
    }

    let isMounted = true;
    try {
      const [data, error] = await api.faq.get(id);
      if (!isMounted) return;

      if (error) {
        toast.error('FAQ não encontrada');
        router.push('/app/help-faq/questions');
        setLoading(false);
        return;
      }

      setItem(data);
    } catch {
      if (isMounted) {
        toast.error('Falha ao carregar a FAQ');
      }
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [api, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadFaqData();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFaqData]);

  return (
    <>
      <div className="flex flex-col items-start h-full justify-start pb-20 md:pb-4">
        <div className="flex flex-col gap-3 w-full p-9 bg-white">
          <GoBack />
          <div className="flex justify-between items-center">
            <PageTitle title="Ajuda & FAQs" />
            <div className="flex items-center gap-3">
              <ModalNotificacoes />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-12 md:px-28 w-full">
          <Content item={item} loading={loading} />
        </div>

        <div className="flex flex-col p-12 md:px-28 w-full">
          <div className="px-4 py-3 bg-[#1b2841] rounded-xl justify-between items-center inline-flex">
            <div className="flex-col justify-start items-start gap-0.5 inline-flex">
              <div className="self-stretch text-white text-base font-semibold font-['BR Sonoma'] leading-tight">
                Ainda tem dúvidas?
              </div>
              <div className="self-stretch text-[#e3ebf3] text-sm font-normal font-['BR Sonoma'] leading-tight">
                Acesse a{' '}
                <Link
                  href={'/app/help-faq/new-ticket'}
                  className="text-[hsl(var(--primary))] text-sm font-normal font-['BR Sonoma'] underline leading-tight"
                >
                  criação de tickets
                </Link>{' '}
                para mais ter sua dúvida respondida pela nossa equipe!
              </div>
            </div>
            <div className="h-10 bg-white rounded-lg justify-start items-center flex">
              <Link
                href={'/app/help-faq/new-ticket'}
                className="h-10 p-3 rounded-tl-lg rounded-bl-lg justify-start items-center flex"
              >
                <span className="grow shrink basis-0 text-[#24292e] text-xs font-semibold leading-none">
                  Criar Novo Ticket
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DotSeparator() {
  return <div className="w-1 mx-2 aspect-square bg-[#C5C2D1] rounded-full" />;
}

function getReadingTime(value: string): string {
  const length = value.length;
  const readingSpeedPerMinute = 1500;
  const readingSpeedPerHour = 1600 * 60;

  if (length > readingSpeedPerHour) {
    const hours = Math.floor(length / readingSpeedPerHour);
    return `${hours} hora${hours > 1 ? 's' : ''} de leitura`;
  }

  const minutes = Math.floor(length / readingSpeedPerMinute);
  return `${minutes === 0 ? 1 : minutes} minuto${minutes > 1 ? 's' : ''} de leitura`;
}

function Content({ item, loading }: { item?: FAQItem; loading: boolean }) {
  const [text, setText] = useState('');

  const handleShare = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;

      const url = window.location.toString();

      if (navigator.share) {
        await navigator.share({ url });
        toast.success('Link copiado');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado');
        return;
      }

      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Link copiado');
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  }, []);

  if (loading || !item) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex gap-3 font-semibold text-[#434D56] items-center">
        <Link href="/backoffice/app/faq" className="text-[#434D56] hover:underline">
          Dúvidas Frequentes
        </Link>
        <span className="text-[#434D56]">{` > `}</span>
        <span>{item.title}</span>
      </div>

      <div className="flex gap-2 items-center mt-2 text-[14px]">
        <div className="p-1 px-2 bg-[#E3EBF3] text-[#24292E] text-[14px] font-semibold rounded-xl shadow-sm">
          {item.category}
        </div>
        <DotSeparator />
        <span className="text-[#434D56]">{getReadingTime(text)}</span>
        <DotSeparator />
        <span className="text-[#434D56] mr-2">
          {time.formatRelativeDate(new Date(item.updatedAt))}
        </span>
        <button onClick={handleShare} aria-label="Compartilhar link da FAQ" type="button">
          <ShareIcon fill="rgba(153,28,28)" />
        </button>
      </div>

      <div className="flex flex-col gap-0 mt-8">
        <h1 className="text-[36px] text-[#24292E] font-semibold leading-6">{item.title}</h1>
        <div className="w-full h-[1px] bg-slate-300 my-7" />
        <LexicalView setText={setText} editorState={item.content} />
      </div>
    </>
  );
}
