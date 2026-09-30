'use client'

import { cn } from '@/lib/class-name.utils';
import { useState } from 'react';

export function PixMessageCard({ code, tone = 'light' }: { code: string; tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={cn('w-full rounded-lg p-3 flex flex-col gap-2', isDark ? 'bg-[#2e3c5a] text-white' : 'bg-white text-[#1b263a]')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', isDark ? 'bg-[#1f2a44]' : 'bg-[#eef2f7]')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2Zm2 0h6a2 2 0 0 1 2 2v6h2V5H9v2Z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#1b263a]')}>PIX Copia e Cola</span>
            <span className={cn('text-xs', isDark ? 'text-[#cdd6ea]' : 'text-[#7F8999]')}>Use para pagar via seu app bancário</span>
          </div>
        </div>
        <button onClick={copy} className={cn('px-2.5 py-1.5 text-xs rounded-md font-semibold transition-colors flex items-center gap-1', isDark ? 'bg-white text-[#1b263a] hover:bg-[#e9edf4]' : 'bg-[#293856] text-white hover:bg-[#1f2a44]')}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className={cn('text-xs font-mono whitespace-pre-wrap break-all rounded-md p-2', isDark ? 'bg-[#24324f]/60 text-white' : 'bg-[#f3f5f9] text-[#1b263a]')}>
        {code}
      </div>
    </div>
  );
}

export default PixMessageCard;


