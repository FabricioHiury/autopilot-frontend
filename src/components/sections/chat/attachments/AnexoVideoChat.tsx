'use client';

import ImageModal from '@/components/commons/modais/image-modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export interface AnexoVideoChatProps {
  src: string;
  idContainer?: string;
  data?: string;
}

export function AnexoVideoChat({ src, idContainer, data }: AnexoVideoChatProps) {
  const [openModal, setOpenModal] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const dataExtenso = data
    ? format(new Date(data), "EEEE, dd 'de' LLLL 'de' yyyy", { locale: ptBR })
    : '';

  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        className="relative p-4 bg-[#EBEEF2] rounded-xl w-full h-[10rem] flex items-center justify-center overflow-hidden group"
        onClick={() => setOpenModal(true)}
      >
        <video
          src={src}
          className={`absolute inset-0 w-full h-full object-cover ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={(e) => {
            e.currentTarget.currentTime = 0;
            setThumbnailLoaded(true);
          }}
          muted
          playsInline
        />

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 bg-white/80 rounded-full p-3 group-hover:bg-white transition-colors">
          <svg
            className="w-8 h-8 text-[hsl(var(--secondary))]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4.5 3.4a1 1 0 011.5-.87l10 5.76a1 1 0 010 1.74l-10 5.76A1 1 0 014.5 15V3.4z" />
          </svg>
        </div>
      </button>

      {openModal && typeof window !== 'undefined' && (
        <ImageModal idSelector={idContainer} onClose={() => setOpenModal(false)}>
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video src={src} controls autoPlay className="max-w-full max-h-[95vh] object-contain">
              Seu navegador não suporta o elemento <code>video</code>.
            </video>
            <div className="absolute w-full flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent top-0 left-0 right-0 z-10">
              {dataExtenso && (
                <span className="text-white text-sm font-semibold drop-shadow-lg">
                  {dataExtenso}
                </span>
              )}
            </div>
          </div>
        </ImageModal>
      )}
    </div>
  );
}

export default AnexoVideoChat;
