'use client';

import ImageModal from '@/components/commons/modais/image-modal';
import { cn } from '@/lib/class-name.utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safeUrl } from '../utils/safeUrl';

export interface AnexoImageChatProps {
  src: string;
  idContainer: string;
  data: string;
  gallery?: { src: string; data?: string }[];
  currentIndex?: number;
}

export function AnexoImageChat({
  src,
  idContainer,
  data,
  gallery,
  currentIndex,
}: AnexoImageChatProps) {
  const [openModal, setOpenModal] = useState(false);
  const [idx, setIdx] = useState<number>(currentIndex ?? 0);
  const touchStartXRef = useRef<number | null>(null);
  const [thumbOk, setThumbOk] = useState<boolean>(true);
  const [modalImgError, setModalImgError] = useState<boolean>(false);
  const dataExtenso = useMemo(
    () => (data ? format(new Date(data), "EEEE, dd 'de' LLLL 'de' yyyy", { locale: ptBR }) : ''),
    [data],
  );

  const images: { src: string; data?: string }[] = useMemo(() => {
    if (Array.isArray(gallery) && gallery.length > 0)
      return gallery.map((i) => ({ src: safeUrl(i.src), data: i.data }));
    return [{ src: safeUrl(src), data }];
  }, [gallery, src, data]);

  useEffect(() => {
    if (typeof currentIndex === 'number') setIdx(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const testUrl = safeUrl(src);
    const img = new Image();
    img.onload = () => setThumbOk(true);
    img.onerror = () => setThumbOk(false);
    img.src = testUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const canPrev = images.length > 1 && idx > 0;
  const canNext = images.length > 1 && idx < images.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setIdx((v) => Math.max(0, v - 1));
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setIdx((v) => Math.min(images.length - 1, v + 1));
  }, [canNext, images.length]);

  useEffect(() => {
    if (!openModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openModal, goPrev, goNext]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current == null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartXRef.current;
    const threshold = 40; // px
    if (deltaX > threshold) {
      goPrev();
    } else if (deltaX < -threshold) {
      goNext();
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        className={cn(
          'group relative block p-4 bg-[#EBEEF2] rounded-xl w-full h-[10rem] overflow-hidden border border-gray-200/50',
        )}
        onClick={() => thumbOk && setOpenModal(true)}
        style={
          thumbOk
            ? {
                backgroundImage: `url(${safeUrl(src)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
        aria-label="Abrir imagem anexada"
        title={thumbOk ? 'Ver imagem' : 'Imagem indisponível'}
      >
        {thumbOk ? (
          <>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Ver
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#485b7f] gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M240,56V168a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V56A16,16,0,0,1,32,40H224A16,16,0,0,1,240,56Zm-16,0H32V168H224ZM64,152H192a8,8,0,0,0,5.66-13.66L160,100.69l-38.34,38.35a8,8,0,0,1-11.32,0L80,108.69,58.34,130.34A8,8,0,0,0,64,152Z" />
            </svg>
            <span className="text-xs font-semibold">Imagem indisponível</span>
          </div>
        )}
      </button>
      {openModal && typeof window !== 'undefined' && (
        <ImageModal idSelector={idContainer} onClose={() => setOpenModal(false)}>
          <div
            className="w-full h-full relative select-none flex items-center justify-center bg-black"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {!modalImgError ? (
              <img
                src={images[idx]?.src || safeUrl(src)}
                alt="Imagem anexada"
                className="max-w-full max-h-[95vh] object-contain"
                draggable={false}
                onError={() => setModalImgError(true)}
              />
            ) : (
              <div className="w-full h-[60vh] min-h-[20rem] flex flex-col items-center justify-center text-white/90 bg-black/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                >
                  <path d="M240,56V168a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V56A16,16,0,0,1,32,40H224A16,16,0,0,1,240,56Zm-16,0H32V168H224ZM64,152H192a8,8,0,0,0,5.66-13.66L160,100.69l-38.34,38.35a8,8,0,0,1-11.32,0L80,108.69,58.34,130.34A8,8,0,0,0,64,152Z" />
                </svg>
                <span className="text-sm font-semibold mt-2">
                  Não foi possível carregar a imagem
                </span>
                <a
                  href={images[idx]?.src || safeUrl(src)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 px-3 py-1.5 rounded bg-white/90 text-[#283855] text-xs font-semibold"
                >
                  Abrir original
                </a>
              </div>
            )}

            <div className="absolute w-full flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent top-0 left-0 right-0 z-10">
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                {images[idx]?.data
                  ? format(new Date(images[idx]?.data as string), "EEEE, dd 'de' LLLL 'de' yyyy", {
                      locale: ptBR,
                    })
                  : dataExtenso}
              </span>
              {images.length > 1 && (
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {idx + 1}/{images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Imagem anterior"
                  onClick={goPrev}
                  disabled={!canPrev}
                  className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 text-white hover:bg-black/80 transition z-10 backdrop-blur-sm',
                    !canPrev && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                  >
                    <path d="M160,216a8,8,0,0,1-5.66-2.34l-80-80a8,8,0,0,1,0-11.32l80-80A8,8,0,0,1,165.66,53.66L91.31,128l74.35,74.34A8,8,0,0,1,160,216Z" />
                  </svg>
                </button>
                <button
                  aria-label="Próxima imagem"
                  onClick={goNext}
                  disabled={!canNext}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 text-white hover:bg-black/80 transition z-10 backdrop-blur-sm',
                    !canNext && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                  >
                    <path d="M101.66,216a8,8,0,0,1-5.66-13.66L170.34,128,96,53.66A8,8,0,1,1,106.34,42.34l80,80a8,8,0,0,1,0,11.32l-80,80A8,8,0,0,1,101.66,216Z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </ImageModal>
      )}
    </div>
  );
}

export default AnexoImageChat;
