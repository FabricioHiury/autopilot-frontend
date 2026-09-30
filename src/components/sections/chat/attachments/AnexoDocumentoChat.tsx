'use client'

import { formatSizeFile } from '@/lib/files.utils';
import { useEffect, useState } from 'react';
import { safeUrl } from '../utils/safeUrl';
import { fetchFileMetadata } from '@/lib/file-metadata.utils';

export interface AnexoDocumentoChatProps {
  src: string;
  nome?: string;
  titulo?: string; // título preferido vindo do texto da mensagem
}

export function AnexoDocumentoChat({ src, titulo }: AnexoDocumentoChatProps) {
  const [nome, setNome] = useState(titulo || 'documento');
  const [tamanho, setTamanho] = useState(0);
  const sanitizedSrc = safeUrl(src);

  const loadFileMetadata = async () => {
    const metadata = await fetchFileMetadata(src, "documento");
    setNome(metadata.nome);
    setTamanho(metadata.tamanho);
  };

  useEffect(() => {
    if (sanitizedSrc !== '#') {
      loadFileMetadata();
    }
  }, [sanitizedSrc, titulo]);

  const handleAbrir = () => {
    if (typeof window !== 'undefined' && sanitizedSrc !== '#') {
      window.open(sanitizedSrc, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-col gap-2 items-stretch justify-between bg-white rounded-xl w-full border border-[#e5eaf2] shadow-sm">
        <div className="flex gap-3 items-center justify-start p-4">
          <div className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="34" height="34" viewBox="0 0 32 32">
              <path fill="#788795" d="M18.7,2.7h-10.7c-.7,0-1.4.3-1.9.8-.5.5-.8,1.2-.8,1.9v21.3c0,.7.3,1.4.8,1.9.5.5,1.2.8,1.9.8h16c.7,0,1.4-.3,1.9-.8.5-.5.8-1.2.8-1.9V10.7L18.7,2.7ZM18.7,12h-1.3v-6.7l6.7,6.7h-5.3Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 w-full min-w-0">
            <span className="text-[#1b263a] text-sm font-semibold leading-tight truncate">{nome}</span>
            <span className="text-[#485b7f] text-xs font-medium leading-none">{formatSizeFile(tamanho)}</span>
          </div>
        </div>
        <div className="w-full border-t border-[#e5eaf2]">
          <button onClick={handleAbrir} className="w-full py-2.5 text-[#025787] text-sm font-semibold hover:bg-[#f4f6fa]">
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnexoDocumentoChat;


