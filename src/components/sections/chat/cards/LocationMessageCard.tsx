'use client';

import { cn } from '@/lib/class-name.utils';
import { safeUrl } from '../utils/safeUrl';

export type LocationInfo = {
  isLocation: boolean;
  lat?: string;
  lng?: string;
  mapUrl?: string;
};

export function LocationMessageCard({
  info,
  tone = 'light',
}: {
  info: LocationInfo;
  tone?: 'light' | 'dark';
}) {
  const isDark = tone === 'dark';
  const title = 'Localização compartilhada';

  const mapUrl = safeUrl(info.mapUrl);

  const openMap = () => {
    if (mapUrl === '#') return;
    if (typeof window !== 'undefined') {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    }
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
              <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-[#1b263a]')}>
              {title}
            </span>
            {info.lat && info.lng && (
              <span className={cn('text-xs', isDark ? 'text-[#cdd6ea]' : 'text-[#7F8999]')}>
                Lat: {info.lat} • Lng: {info.lng}
              </span>
            )}
          </div>
        </div>
        {mapUrl !== '#' && (
          <button
            onClick={openMap}
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-md font-semibold transition-colors',
              isDark
                ? 'bg-white text-[#1b263a] hover:bg-[#e9edf4]'
                : 'bg-[hsl(var(--secondary))] text-white hover:bg-[#1f2a44]',
            )}
          >
            Abrir mapa
          </button>
        )}
      </div>
      {info.lat && info.lng && (
        <div className="w-full overflow-hidden rounded-md ring-1 ring-black/5">
          <iframe
            title="Mapa da localização compartilhada"
            src={`https://www.google.com/maps?q=${encodeURIComponent(info.lat || '')},${encodeURIComponent(info.lng || '')}&z=15&output=embed`}
            width="100%"
            height="220"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
      {mapUrl !== '#' && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('text-xs underline', isDark ? 'text-white/90' : 'text-[#1b263a]')}
        >
          {mapUrl}
        </a>
      )}
    </div>
  );
}

export default LocationMessageCard;
