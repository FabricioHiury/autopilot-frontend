import IconBgImageUpload from '../icons/icon-bg-image-upload';
import IconCamera from '../icons/icon-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { profileImageUrl } from '@/lib/profile.utils';

export interface UploadImageProps {
  userId: string;
  file?: File;
  setFile: (file: File | undefined) => void;
  label: string;
  avatar?: string;
  onUpload: (id: string, file: File) => void;
}

export default function UploadImage({
  userId,
  file,
  setFile,
  label,
  avatar,
  onUpload,
}: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isValidImage, setIsValidImage] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const loadInitialImage = useCallback(() => {
    if (avatar && avatar.trim() !== '') {
      setImageSrc(avatar);
      setIsValidImage(true);
      setIsLoaded(false);
    } else if (userId && userId.trim() !== '') {
      const profileUrl = profileImageUrl(userId);
      setImageSrc(profileUrl);
      setIsValidImage(true);
      setIsLoaded(false);
    } else {
      setIsValidImage(false);
      setImageSrc(undefined);
    }
  }, [avatar, userId]);

  useEffect(() => {
    if (userId !== '' || (avatar && avatar.trim() !== '')) {
      loadInitialImage();
    }
  }, [userId, avatar, loadInitialImage]);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setIsValidImage(true);
    setIsLoaded(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const tmp = event.target.files?.[0];

      if (tmp) {
        const objectUrl = URL.createObjectURL(tmp);
        setImageSrc(objectUrl);
        setIsValidImage(true);
        setIsLoaded(false);
        setFile(tmp);

        event.target.value = '';

        if (userId && userId.trim() !== '') {
          setIsUploading(true);
          onUpload(userId, tmp);
          setTimeout(() => setIsUploading(false), 2000);
        }
      } else {
        setFile(undefined);
      }
    },
    [setFile, userId, onUpload],
  );

  const onImgLoad = useCallback(() => {
    setIsLoaded(true);
    setIsValidImage(true);
  }, []);

  const onImgError = useCallback(() => {
    setIsLoaded(false);
    setIsValidImage(false);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="relative w-[4rem] rounded-full h-[4rem] flex-grow-0 flex-shrink-0"
        onClick={openFilePicker}
        aria-label="Selecionar foto de perfil"
      >
        {isValidImage ? (
          <div className="w-full h-full relative">
            <img
              src={imageSrc}
              className="h-full object-contain rounded-full"
              onLoad={onImgLoad}
              onError={onImgError}
              alt="Foto de perfil"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#F2F4F7] z-[2] border border-white w-[4rem] h-[4rem] rounded-full flex items-center justify-center relative shrink-0">
            <IconBgImageUpload />
            <div className="bg-[#E3EBF3] border border-white w-[1.375rem] h-[1.375rem] rounded-full flex items-center justify-center absolute -bottom-[0.375rem] right-0">
              <IconCamera />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFileChange}
          className="absolute hidden"
          tabIndex={-1}
        />
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-[#24292e] text-lg font-semibold leading-snug hidden md:block">{label}</p>
        <p className="text-[#24292e] text-lg font-semibold leading-snug md:hidden">
          Adicionar foto
        </p>
        <div className="w-full flex items-center gap-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2.58203 9C2.58203 9.8618 2.75178 10.7152 3.08157 11.5114C3.41137 12.3076 3.89476 13.031 4.50414 13.6404C5.11353 14.2498 5.83697 14.7332 6.63317 15.063C7.42937 15.3928 8.28273 15.5625 9.14453 15.5625C10.0063 15.5625 10.8597 15.3928 11.6559 15.063C12.4521 14.7332 13.1755 14.2498 13.7849 13.6404C14.3943 13.031 14.8777 12.3076 15.2075 11.5114C15.5373 10.7152 15.707 9.8618 15.707 9C15.707 8.1382 15.5373 7.28484 15.2075 6.48864C14.8777 5.69244 14.3943 4.969 13.7849 4.35961C13.1755 3.75023 12.4521 3.26684 11.6559 2.93704C10.8597 2.60724 10.0063 2.4375 9.14453 2.4375C8.28273 2.4375 7.42937 2.60724 6.63317 2.93704C5.83697 3.26684 5.11353 3.75023 4.50414 4.35961C3.89476 4.969 3.41137 5.69244 3.08157 6.48864C2.75178 7.28484 2.58203 8.1382 2.58203 9Z"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.14453 6.8125V9.72917"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.14453 11.9165V11.9238"
              stroke="#657380"
              strokeWidth="1.3125"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="w-full text-[#657380] text-[0.625rem] font-normal leading-3">
            A resolução mínima indicada da imagem é de 120 x 56 pixels
          </p>
        </div>
      </div>
    </div>
  );
}
