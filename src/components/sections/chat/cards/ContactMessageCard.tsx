'use client';

import { cn } from '@/lib/class-name.utils';
import { useState } from 'react';

export type ContactInfo = {
  isContact: boolean;
  name?: string;
  phone?: string;
};

export function ContactMessageCard({
  info,
  tone = 'light',
  onOpenNovoChat,
  atendimentoId = null,
}: {
  info: ContactInfo;
  tone?: 'light' | 'dark';
  onOpenNovoChat?: (payload: {
    name?: string;
    whatsapp?: string;
    atendimentoId?: number | null;
  }) => void;
  atendimentoId?: number | null;
}) {
  const isDark = tone === 'dark';
  const [copied, setCopied] = useState(false);

  const formatPhone = (p?: string) =>
    p ? p.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4') : '';

  const copyPhone = async () => {
    if (!info.phone) return;
    try {
      await navigator.clipboard.writeText(info.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div
      className={cn(
        'w-full rounded-xl p-3 flex flex-col gap-3 border shadow-sm',
        isDark
          ? 'bg-[#2c3b5b] text-white border-[#22304d]'
          : 'bg-white text-[#1b263a] border-[#e5eaf2]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-md flex items-center justify-center',
              isDark ? 'bg-[#1f2a44]' : 'bg-[#eef2f7]',
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className={cn(
                'text-[11px] font-medium tracking-wide',
                isDark ? 'text-[#cdd6ea]/80' : 'text-[#7F8999]',
              )}
            >
              Contato compartilhado
            </span>
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#1b263a]')}>
              {info.name || 'Contato'}
            </span>
            {info.phone && (
              <span className={cn('text-xs', isDark ? 'text-[#cdd6ea]' : 'text-[#7F8999]')}>
                {formatPhone(info.phone)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {info.phone && (
          <>
            <button
              onClick={copyPhone}
              className={cn(
                'px-2.5 py-1.5 text-xs rounded-md font-semibold transition-colors border',
                isDark
                  ? 'border-white/20 text-white hover:bg-white hover:text-[#1b263a]'
                  : 'border-[#d7deea] text-[#1b263a] hover:bg-[#e9edf4]',
              )}
              aria-label="Copiar telefone"
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={() =>
                onOpenNovoChat &&
                onOpenNovoChat({ name: info.name, whatsapp: info.phone, atendimentoId })
              }
              className={cn(
                'px-2.5 py-1.5 text-xs rounded-md font-semibold transition-colors',
                isDark
                  ? 'bg-white text-[#1b263a] hover:bg-[#e9edf4]'
                  : 'bg-[hsl(var(--secondary))] text-white hover:bg-[#1f2a44]',
              )}
            >
              Iniciar conversa
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ContactMessageCard;
