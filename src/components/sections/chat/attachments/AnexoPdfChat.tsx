'use client';

import PdfModal from '@/components/commons/modais/pdf-modal';
import { fetchFileMetadata } from '@/lib/file-metadata.utils';
import { formatSizeFile } from '@/lib/files.utils';
import { useEffect, useState } from 'react';

export interface AnexoPdfChatProps {
  src: string;
  idContainer: string;
}

export function AnexoPdfChat({ src, idContainer }: AnexoPdfChatProps) {
  const [openModal, setOpenModal] = useState(false);
  const [name, setNome] = useState('Documento.pdf');
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

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.open(src, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className=" flex flex-col gap-2 items-center justify-between bg-[#ebeef2] rounded-xl w-full">
        <div className="flex gap-2 items-center justify-start p-4 w-full">
          <div>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.0229 19.5733C10.7775 19.5733 10.6122 19.5973 10.5269 19.6213V21.192C10.6282 21.216 10.7549 21.2227 10.9295 21.2227C11.5682 21.2227 11.9615 20.9 11.9615 20.3547C11.9615 19.8667 11.6229 19.5733 11.0229 19.5733ZM15.6722 19.5893C15.4055 19.5893 15.2322 19.6133 15.1295 19.6373V23.1173C15.2322 23.1413 15.3975 23.1413 15.5469 23.1413C16.6362 23.1493 17.3455 22.5493 17.3455 21.28C17.3535 20.1733 16.7069 19.5893 15.6722 19.5893Z"
                fill="#FF3A3A"
              />
              <path
                d="M18.6668 2.66666H8.00016C7.29292 2.66666 6.61464 2.94761 6.11454 3.4477C5.61445 3.9478 5.3335 4.62608 5.3335 5.33332V26.6667C5.3335 27.3739 5.61445 28.0522 6.11454 28.5523C6.61464 29.0524 7.29292 29.3333 8.00016 29.3333H24.0002C24.7074 29.3333 25.3857 29.0524 25.8858 28.5523C26.3859 28.0522 26.6668 27.3739 26.6668 26.6667V10.6667L18.6668 2.66666ZM12.6642 21.5867C12.2522 21.9733 11.6442 22.1467 10.9362 22.1467C10.7989 22.1481 10.6617 22.1401 10.5255 22.1227V24.024H9.3335V18.776C9.87144 18.6957 10.415 18.6592 10.9588 18.6667C11.7015 18.6667 12.2295 18.808 12.5855 19.092C12.9242 19.3613 13.1535 19.8027 13.1535 20.3227C13.1522 20.8453 12.9788 21.2867 12.6642 21.5867ZM17.7402 23.3933C17.1802 23.8587 16.3282 24.08 15.2868 24.08C14.6628 24.08 14.2215 24.04 13.9215 24V18.7773C14.4596 18.6988 15.003 18.6618 15.5468 18.6667C16.5562 18.6667 17.2122 18.848 17.7242 19.2347C18.2775 19.6453 18.6242 20.3 18.6242 21.24C18.6242 22.2573 18.2522 22.96 17.7402 23.3933ZM22.6668 19.6933H20.6242V20.908H22.5335V21.8867H20.6242V24.0253H19.4162V18.7067H22.6668V19.6933ZM18.6668 12H17.3335V5.33332L24.0002 12H18.6668Z"
                fill="#FF3A3A"
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
        <div className="grid grid-cols-2 divide-x divide-gray-300 w-full border-t border-gray-300">
          <button
            onClick={handleDownload}
            className="py-2 text-[#025787] text-sm font-medium leading-tight"
          >
            Download
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="py-2 text-[#025787] text-sm font-medium leading-tight"
          >
            Ver
          </button>
        </div>
      </div>
      {openModal && typeof window !== 'undefined' && (
        <PdfModal idSelector={idContainer} onClose={() => setOpenModal(false)} src={src} />
      )}
    </div>
  );
}

export default AnexoPdfChat;
