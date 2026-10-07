'use client';

import { userMessage } from '@/lib/user-messages';
import { useCallback, useEffect, useRef, useState } from 'react';
import ImageModal from '@/components/commons/modais/image-modal';
import { formatSizeFile } from '@/lib/files.utils';
import { fetchFileMetadata } from '@/lib/file-metadata.utils';

export function AnexoDocumento({ src }: { src: string }) {
  const [name, setNome] = useState('documento');
  const [size, setTamanho] = useState(0);

  const loadFileMetadata = async () => {
    const metadata = await fetchFileMetadata(src, 'documento');
    setNome(metadata.name);
    setTamanho(metadata.size);
  };

  useEffect(() => {
    if (src) {
      loadFileMetadata();
    }
  }, [src]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-col gap-2 items-center justify-between bg-[#ebeef2] rounded-xl w-full">
        <div className="flex gap-2 items-center justify-start p-4 w-full">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <path
                fill="#788795"
                d="M18.7,2.7h-10.7c-.7,0-1.4.3-1.9.8-.5.5-.8,1.2-.8,1.9v21.3c0,.7.3,1.4.8,1.9.5.5,1.2.8,1.9.8h16c.7,0,1.4-.3,1.9-.8.5-.5.8-1.2.8-1.9V10.7L18.7,2.7ZM18.7,12h-1.3v-6.7l6.7,6.7h-5.3Z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1 w-full truncate">
            <span className="text-[#1b263a] text-sm font-semibold leading-tight truncate w-full">
              {name}
            </span>
            <span className="text-[#485b7f] text-xs font-medium leading-none">
              {formatSizeFile(size)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnexoImage({ src, idContainer }: { src: string; idContainer: string }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        className="block p-4 bg-[#EBEEF2] rounded-xl w-full h-[10rem]"
        onClick={() => setOpenModal(true)}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {openModal && typeof window !== 'undefined' && (
        <ImageModal idSelector={idContainer} onClose={() => setOpenModal(false)}>
          <div className="w-full relative">
            <img src={src} alt="Imagem anexada" className="w-full h-full object-contain" />
          </div>
        </ImageModal>
      )}
    </div>
  );
}

type AnexoAudioProps = {
  src: string;
  boostGain?: number;
  crossOrigin?: 'anonymous' | 'use-credentials';
  className?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

export function AnexoAudio({
  src,
  boostGain = 1.8,
  crossOrigin = 'anonymous',
  className,
}: AnexoAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const isBoostActiveRef = useRef(false);

  const canAttemptBoost = useCallback(() => {
    const el = audioRef.current;
    if (!el) return false;

    const url = new URL(el.currentSrc || el.src, window.location.href);
    const sameOrigin = url.origin === window.location.origin;

    if (sameOrigin) return true;
    return !!el.crossOrigin;
  }, []);

  const ensureBoost = useCallback(async () => {
    if (isBoostActiveRef.current) return;
    if (boostGain <= 1) return;

    const el = audioRef.current;
    if (!el) return;
    if (!canAttemptBoost()) return;

    try {
      const Ctx = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctx();

      const source = ctx.createMediaElementSource(el);
      const gain = ctx.createGain();
      gain.gain.value = boostGain;

      source.connect(gain).connect(ctx.destination);

      el.muted = true;

      audioCtxRef.current = ctx;
      sourceRef.current = source;
      gainRef.current = gain;
      isBoostActiveRef.current = true;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch (e) {
      isBoostActiveRef.current = false;
      try {
        audioCtxRef.current?.close();
      } catch {}
      audioCtxRef.current = null;
      sourceRef.current = null;
      gainRef.current = null;
      if (audioRef.current) audioRef.current.muted = false;
    }
  }, [boostGain, canAttemptBoost]);

  const teardownBoost = useCallback(async () => {
    if (!isBoostActiveRef.current) return;
    isBoostActiveRef.current = false;

    try {
      await audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
    sourceRef.current = null;
    gainRef.current = null;

    if (audioRef.current) audioRef.current.muted = false;
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const d = el.duration;
    setDuration(Number.isFinite(d) ? d : 0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback(() => {
    const code = audioRef.current?.error?.code;
    const message =
      code === 2
        ? 'Erro de conexão ao carregar o áudio.'
        : code === 3
          ? 'Não foi possível reproduzir este formato de áudio.'
          : code === 4
            ? 'Formato de áudio não suportado.'
            : 'Não foi possível reproduzir o áudio.';
    setError(message);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    setError(null);

    await ensureBoost();

    if (audioCtxRef.current?.state === 'suspended') {
      try {
        await audioCtxRef.current.resume();
      } catch {}
    }

    try {
      await el.play();
      setIsPlaying(true);
    } catch (err: any) {
      await teardownBoost();
      setError(
        err?.message ? userMessage(err.message) : 'A reprodução foi bloqueada pelo navegador.',
      );
      setIsPlaying(false);
    }
  }, [ensureBoost, isPlaying, teardownBoost]);

  const handleSeek = useCallback(
    (newTime: number) => {
      const el = audioRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(newTime, duration || 0));
      el.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        togglePlay();
      }
    },
    [togglePlay],
  );

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);

    return () => {
      teardownBoost();
    };
  }, [src, teardownBoost]);

  return (
    <div
      className={`p-4 bg-gray-200 rounded-xl flex flex-col gap-2 w-full max-w-sm ${className ?? ''}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin={crossOrigin}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
      />

      <div className="flex items-center justify-between flex-wrap w-full">
        <button
          onClick={togglePlay}
          onKeyDown={handleKeyDown}
          className="bg-white text-[#283855] rounded-full w-10 h-10 flex items-center justify-center"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          title={isPlaying ? 'Pause' : 'Play'}
          type="button"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              aria-hidden="true"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              aria-hidden="true"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
            </svg>
          )}
        </button>

        <div className="flex-1 mx-3 min-w-[160px]">
          <AudioSpectrum
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            activeColor="hsl(var(--primary))"
            inactiveColor="#7F8999"
            height={30}
          />
        </div>

        <div className="text-sm text-gray-700 min-w-[60px] text-right">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface AudioSpectrumProps {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
  activeColor?: string;
  inactiveColor?: string;
  width?: number;
  height?: number;
}

export function AudioSpectrum({
  currentTime,
  duration,
  onSeek,
  activeColor = 'hsl(var(--primary))',
  inactiveColor = '#7F8999',
  width = 200,
  height = 32,
}: AudioSpectrumProps) {
  const barsCount = 48;
  const barWidth = 4;
  const barGap = 2;
  const fraction = duration > 0 ? currentTime / duration : 0;

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newFraction = clickX / rect.width;
    onSeek(newFraction * duration);
  }

  const bars = Array.from({ length: barsCount }, (_, i) => {
    const barThreshold = (i + 1) / barsCount;
    const isActive = fraction >= barThreshold;
    return (
      <rect
        key={i}
        x={i * (barWidth + barGap)}
        y={0}
        width={barWidth}
        height={height}
        fill={isActive ? activeColor : inactiveColor}
        rx={1}
        ry={1}
      />
    );
  });

  const totalWidth = barsCount * barWidth + (barsCount - 1) * barGap;

  return (
    <svg
      width={totalWidth}
      height={height}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {bars}
    </svg>
  );
}

interface AnexoVideoProps {
  src: string;
}

export const AnexoVideo: React.FC<AnexoVideoProps> = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoaded = () => setIsLoading(false);
  const handleVideoError = () => {
    setIsLoading(false);
    console.error('Erro ao carregar o vídeo:', src);
  };

  return (
    <div className="w-full max-w-[300px] rounded-lg overflow-hidden bg-[#EBEEF2] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[hsl(var(--secondary))] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full h-auto"
        src={src}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        preload="metadata"
      >
        Seu navegador não suporta a reprodução de vídeos.
      </video>
    </div>
  );
};
