'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import IconUpload from './icons/icon-upload';
import IconExcluir from './icons/icon-excluir';
import { relativeTime } from '@/lib/relative-time';
import IconArrowNext from '@/components/icons/icon-next-arrow';
import api from '@/utils/classes/api';
import LoadingGlobal from '@/components/commons/estados/LoadingGlobal';
import ImageModal from '@/components/commons/modais/image-modal';
import { AppServices } from '@/services/app.services';
import { AlertDialog } from '@/components/commons/modais/alert-dialog';

interface UploadArquivosAtandimentoProps {
  dealId: string;
}

type Files = {
  file: File | null;
  status: 'enviando' | 'enviado';
  data: Date;
  attachmentId: string;
  url: string;
  type?: string;
  name?: string;
};

type FileType = 'image' | 'pdf' | 'excel' | 'docx' | 'audio' | 'other';

function getFileTypeFromName(fileName: string): FileType {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
  const excelExtensions = ['xls', 'xlsx'];
  const docxExtensions = ['doc', 'docx'];

  if (imageExtensions.includes(extension || '')) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (excelExtensions.includes(extension || '')) return 'excel';
  if (docxExtensions.includes(extension || '')) return 'docx';
  if (audioExtensions.includes(extension || '')) return 'audio';

  return 'other';
}

function isFileTypeAllowed(fileName: string): boolean {
  const fileType = getFileTypeFromName(fileName);
  return ['image', 'pdf', 'excel', 'docx', 'audio'].includes(fileType);
}

function getFileIcon(fileName: string, type?: string): string {
  const fileType = getFileTypeFromName(fileName);
  const isImage = type?.includes('image') || fileType === 'image';

  if (isImage) return '';

  switch (fileType) {
    case 'pdf':
      return '/images/pdf-back.png';
    case 'excel':
    case 'docx':
    case 'audio':
    default:
      return '/images/default.png';
  }
}

export default function UploadArquivosAtandimento({ dealId }: UploadArquivosAtandimentoProps) {
  const [files, setFiles] = useState<Files[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<Set<string>>(new Set());
  const [totalPages, setTotalPaginas] = useState<number>(0);
  const [page, setPagina] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const apiApp = new AppServices();
  const [alertDialog, setAlertDialog] = useState<{
    message: string;
    variant: 'info' | 'error' | 'success' | 'warning';
  } | null>(null);

  const tempIdAnexo = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  async function uploadFile(file: File, attachmentId: string) {
    const form = new FormData();
    form.append('file', file);
    const [response, error] = await api.uploadFile(`/deals/${dealId}/attachment`, form, 'POST');

    if (error) {
      setError(error.message);
      setTimeout(() => {
        setFiles((old) => old.filter((f) => f.attachmentId !== attachmentId));
        setError(null);
      }, 5000);
      return;
    }

    changeStatus(
      attachmentId,
      response.data as {
        url: string;
        attachmentId: string;
        fileId: number;
        data: string;
        nameOriginal: string;
      },
    );
  }

  function changeStatus(
    idAnexoTemp: string,
    data: {
      url: string;
      attachmentId: string;
      fileId: number;
      data: string;
      nameOriginal: string;
    },
  ) {
    setFiles((old) => {
      return old.map((objFile) => {
        if (objFile.attachmentId === idAnexoTemp) {
          objFile.status = 'enviado';
          ((objFile.url = data.url), (objFile.attachmentId = data.attachmentId));
          objFile.name = data.nameOriginal;
        }
        return objFile;
      });
    });
  }

  function excluir(i: number) {
    setFiles((old) => {
      return old.filter((obj, index) => index !== i);
    });
  }

  async function excluirAnexo(attachmentId: string, index: number) {
    setExcluindo((prev) => new Set(prev).add(attachmentId));

    const [response, error] = await api.delete(`/deals/${dealId}/attachment/${attachmentId}`);

    setExcluindo((prev) => {
      const newSet = new Set(prev);
      newSet.delete(attachmentId);
      return newSet;
    });

    if (error) {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (response && response.success) {
      setSuccess(response.message || 'Anexo deletado com sucesso');
      setTimeout(() => setSuccess(null), 3000);
      excluir(index);
    }
  }

  function nextPage() {
    if (page < totalPages) {
      setPagina((old) => {
        return (old += 1);
      });
    }
  }
  function prevPage() {
    if (page > 1) {
      setPagina((old) => {
        return (old -= 1);
      });
    }
  }

  async function listarArquivos() {
    setLoading(true);
    const [data, error] = await apiApp.deal.listAttachments({
      dealId,
      page,
      limit: 4,
    });

    setLoading(false);
    if (error) {
      setAlertDialog({ message: error.message, variant: 'error' });
      return;
    }

    if (!data) {
      return;
    }

    setTotalPaginas(data.totalPages);
    setFiles(
      data.attachments.length > 0
        ? data.attachments.map((obj) => {
            return {
              file: null,
              status: 'enviado',
              data: new Date(obj.data),
              attachmentId: obj.attachmentId,
              url: obj.url,
              type: obj.type,
              name: obj.nameOriginal || obj.name,
            };
          })
        : [],
    );
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (!isFileTypeAllowed(file.name)) {
        setError(
          `Tipo de arquivo não permitido: ${file.name}. Apenas imagens, PDF, Excel, Word e áudio são aceitos.`,
        );
        setTimeout(() => setError(null), 5000);
        return;
      }

      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const attachmentId = tempIdAnexo();

        const result = e.target?.result as string;
        uploadFile(file, attachmentId);
        setFiles((old) => {
          return [
            ...old,
            {
              attachmentId,
              file: file,
              name: file.name,
              status: 'enviando',
              data: new Date(),
              url: result,
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  useEffect(() => {
    listarArquivos();
  }, [page]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col gap-7">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <span className="font-medium">Erro no envio:</span> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <span className="font-medium">Sucesso:</span> {success}
        </div>
      )}
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-[0.5rem]  data-[active=true]:border-red-600 cursor-pointer"
        data-active={isDragActive}
      >
        <input {...getInputProps()} />
        <div className="px-4 py-6 min-h-32 w-full flex flex-col items-center justify-center text-center gap-4 text-[#485B80]">
          <div className="bg-[#EBEEF2] h-12 w-12 rounded-full flex items-center justify-center">
            <IconUpload />
          </div>

          <div>
            <p className="font-semibold text-sm">
              {isDragActive ? 'Solte os arquivos aqui ...' : 'Solte seus arquivos aqui ou navegue'}
            </p>
            <span className="text-xs">Aceitos: Imagens, PDF, Excel, Word e Áudio (máx. 10 MB)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {loading ? (
          <LoadingGlobal />
        ) : (
          files.map((obj, i) => {
            if (obj.file && obj.status === 'enviando')
              return (
                <ArquivoEnviando src={obj.url} file={obj.file} key={new Date().toISOString()} />
              );
            if (obj.status === 'enviado')
              return (
                <ArquivoEnviado
                  key={obj.attachmentId || new Date().toISOString()}
                  onExcluir={() => excluirAnexo(obj.attachmentId, i)}
                  dealId={dealId}
                  attachmentId={obj.attachmentId}
                  src={obj.url}
                  name={obj.name || 'Sem nome'}
                  size={obj.file ? obj.file.size : 0}
                  data={obj.data}
                  type={obj.type}
                  excluindo={excluindo.has(obj.attachmentId)}
                />
              );
          })
        )}
      </div>

      <div className="w-full flex items-center justify-between text-sm">
        <span className="text-[#7F8999]">
          {totalPages === 0 ? 'Nenhum anexo' : `Página ${page} de ${totalPages}`}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={prevPage} disabled={page <= 1}>
            <IconArrowNext
              color="#7F8999"
              className="rotate-180 transition-colors hover:stroke-red-600"
            />
          </button>
          <button onClick={nextPage} disabled={page >= totalPages}>
            <IconArrowNext color="#7F8999" className="transition-colors hover:stroke-red-600" />
          </button>
        </div>
      </div>

      {alertDialog && (
        <AlertDialog
          message={alertDialog.message}
          variant={alertDialog.variant}
          onClose={() => setAlertDialog(null)}
        />
      )}
    </div>
  );
}

export interface ArquivoProps {
  name: string;
  size: number;
  data?: Date;
  src: string;
  attachmentId: string;
  dealId: string;
  onExcluir: Function;
  type?: string;
  excluindo?: boolean;
}

export function ArquivoEnviando({ file, src }: { file: File; src: string }) {
  const tamanhoArquivo = (file.size / 1024).toFixed(0);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgresso((oldProgresso) => {
        if (oldProgresso >= 100) {
          clearInterval(interval);
          return 100;
        }
        return oldProgresso + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full grid grid-cols-[4.5rem,1fr] items-center gap-3 overflow-hidden">
      <div className="h-14 w-[4.5rem] bg-[#DDE6F2] rounded-[0.25rem] flex items-center justify-center overflow-hidden">
        {(() => {
          const fileType = getFileTypeFromName(file.name);
          const isImage = fileType === 'image';

          if (isImage) {
            return (
              <img
                src={src}
                className="w-full h-full object-cover rounded-[0.25rem]"
                alt="Arquivo"
              />
            );
          }

          return <img width={24} height={28} src={getFileIcon(file.name)} alt="Documento" />;
        })()}
      </div>
      <div className="w-full truncate">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6C7788] text-xs">
            <span className="font-semibold">Enviando</span>
            <svg
              width="4"
              height="5"
              viewBox="0 0 4 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="2.5" r="2" fill="#7F8999" />
            </svg>
            <span>{tamanhoArquivo}kb</span>
          </div>
        </div>

        <p className="truncate font-semibold text-sm text-[hsl(var(--secondary))]">{file.name}</p>

        <div className="bg-[#DDE6F2] w-full h-1.5 mt-2 rounded-full overflow-hidden">
          <div
            className="bg-[hsl(var(--primary))] h-1.5 rounded-full"
            style={{ width: `${progresso}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function ArquivoEnviado({
  name,
  size,
  data,
  src,
  attachmentId,
  dealId,
  onExcluir,
  type,
  excluindo,
}: ArquivoProps) {
  const tamanhoArquivo = (size / 1024).toFixed(0);
  const [verImagem, setVerImagem] = useState(false);

  function excluir() {
    onExcluir();
  }

  const acaoClick = () => {
    const fileType = getFileTypeFromName(name);
    const isImage = type?.includes('image') || fileType === 'image';

    if (isImage) {
      setVerImagem(true);
      return;
    }

    if (src && src !== '') {
      window.open(src, '_blank');
    }
  };

  return (
    <div
      className={`w-full grid grid-cols-[4.5rem,1fr] items-center gap-3 overflow-hidden ${excluindo ? 'opacity-60' : ''}`}
    >
      <button
        onClick={acaoClick}
        className="h-14 w-[4.5rem] bg-[#DDE6F2] rounded-[0.25rem] flex items-center justify-center overflow-hidden"
        disabled={excluindo}
      >
        {(() => {
          const fileType = getFileTypeFromName(name);
          const isImage = type?.includes('image') || fileType === 'image';

          if (isImage) {
            return (
              <img
                src={src}
                className="w-full h-full object-cover rounded-[0.25rem]"
                alt="Arquivo"
              />
            );
          }

          return <img width={24} height={28} src={getFileIcon(name, type)} alt="Documento" />;
        })()}
      </button>
      <div className="w-full truncate">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6C7788] text-xs">
            {excluindo ? (
              <span className="font-semibold text-red-600">Excluindo...</span>
            ) : (
              <>
                {size > 0 && (
                  <>
                    <span className="font-semibold">{tamanhoArquivo}kb</span>
                    <svg
                      width="4"
                      height="5"
                      viewBox="0 0 4 5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="2" cy="2.5" r="2" fill="#7F8999" />
                    </svg>
                  </>
                )}
                <span>Enviado {data && relativeTime(data)}</span>
              </>
            )}
          </div>
          <button
            onClick={excluir}
            disabled={excluindo}
            className={excluindo ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {excluindo ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
            ) : (
              <IconExcluir />
            )}
          </button>
        </div>

        <p className="truncate font-semibold text-sm text-[hsl(var(--secondary))]">{name}</p>
      </div>

      {verImagem && typeof window !== 'undefined' && (
        <ImageModal
          idSelector={'content-container'}
          onClose={() => {
            setVerImagem(false);
          }}
        >
          <div className="w-full relative">
            <img src={src} alt="Imagem anexada" className="w-full h-full object-contain" />
          </div>
        </ImageModal>
      )}
    </div>
  );
}
