'use client';

import { cn } from '@/lib/class-name.utils';
import { safeUrl } from '../utils/safeUrl';
import { useMemo, useState } from 'react';

export function LinkMessageCard({ url, tone = 'light' }: { url: string; tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark';
  const href = safeUrl(url);

  const hostname = (() => {
    try {
      return new URL(href).hostname;
    } catch {
      return '';
    }
  })();

  const faviconCandidates = useMemo(() => {
    if (!hostname) return [] as string[];
    let origin = '';
    try {
      origin = new URL(href).origin;
    } catch {
      /* noop */
    }
    return [
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
      `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`,
      origin ? `${origin}/favicon.ico` : '',
    ].filter(Boolean);
  }, [href, hostname]);

  const [faviconIndex, setFaviconIndex] = useState(0);
  const [useFallbackIcon, setUseFallbackIcon] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'w-full rounded-xl p-3 flex items-center gap-3 border shadow-sm transition-colors',
        isDark
          ? 'bg-[#2c3b5b] text-white border-[#22304d] hover:bg-[#25334f]'
          : 'bg-white text-[#1b263a] border-[#e5eaf2] hover:bg-[#f7f9fc]',
      )}
      title={href}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-md flex items-center justify-center overflow-hidden',
          isDark ? 'bg-[#1f2a44]' : 'bg-[#eef2f7]',
        )}
      >
        {!useFallbackIcon && faviconCandidates.length > 0 ? (
          <img
            src={faviconCandidates[faviconIndex]}
            alt={hostname ? `${hostname} favicon` : 'favicon'}
            className="w-5 h-5 rounded-sm"
            referrerPolicy="no-referrer"
            onError={() => {
              if (faviconIndex < faviconCandidates.length - 1) {
                setFaviconIndex((currentIndex) => currentIndex + 1);
              } else {
                setUseFallbackIcon(true);
              }
            }}
          />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12a5 5 0 0 1 1.46-3.54l3.1-3.1a5 5 0 0 1 7.07 7.07l-.7.7a1 1 0 0 1-1.41-1.41l.7-.7a3 3 0 0 0-4.24-4.24l-3.1 3.1A3 3 0 0 0 5.9 12a1 1 0 0 1-2 0Zm16.2 0a5 5 0 0 1-1.46 3.54l-3.1 3.1a5 5 0 0 1-7.07-7.07l.7-.7a1 1 0 1 1 1.41 1.41l-.7.7a3 3 0 1 0 4.24 4.24l3.1-3.1A3 3 0 0 0 18.1 12a1 1 0 0 1 2 0Z" />
          </svg>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={cn('text-sm font-semibold truncate', isDark ? 'text-white' : 'text-[#1b263a]')}
        >
          {hostname || href}
        </span>
        <span className={cn('text-xs truncate', isDark ? 'text-[#cdd6ea]' : 'text-[#7F8999]')}>
          {href}
        </span>
      </div>
      <div className="ml-auto">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn(isDark ? 'text-white' : 'text-[#1b263a]')}
        >
          <path d="M14 3h7v7h-2V6.41l-7.29 7.3-1.42-1.42L17.59 5H14V3z" />
        </svg>
      </div>
    </a>
  );
}

export default LinkMessageCard;
