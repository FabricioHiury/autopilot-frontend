'use client';

import { cn } from '@/lib/class-name.utils';

export type CallInfo = {
  isCall: boolean;
  isVideo?: boolean;
  missed?: boolean;
  ended?: boolean;
  accepted?: boolean;
  received?: boolean;
  duration?: string;
  dateTime?: string;
};

export function CallMessageCard({
  info,
  tone = 'light',
}: {
  info: CallInfo;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';

  const title = info.isVideo ? 'Chamada de vídeo' : 'Chamada de voz';
  let subtitle = '';
  if (info.missed) {
    subtitle = 'Perdida';
  } else if (info.ended) {
    subtitle = `Finalizada${info.duration ? ` • ${info.duration}` : ''}`;
  } else if (info.received) {
    subtitle = 'Recebida';
  } else if (info.accepted) {
    subtitle = 'Iniciada';
  }

  if (info.dateTime) {
    subtitle = subtitle ? `${subtitle} • ${info.dateTime}` : info.dateTime;
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg p-3 flex flex-col gap-2',
        isDark ? 'bg-[#2e3c5a] text-white' : 'bg-white text-[#1b263a]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center',
              isDark ? 'bg-[#1f2a44]' : 'bg-[#eef2f7]',
            )}
          >
            {info.isVideo ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7a2 2 0 0 0-2-2H5C3.343 5 2 6.343 2 8v8c0 1.657 1.343 3 3 3h10a2 2 0 0 0 2-2v-3.5l5 3.5V7l-5 3.5z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#1b263a]')}>
              {title}
            </span>
            {subtitle && (
              <span className={cn('text-xs', isDark ? 'text-[#cdd6ea]' : 'text-[#7F8999]')}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallMessageCard;
