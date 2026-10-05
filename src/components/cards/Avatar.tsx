'use client';
import { UserType } from '@/types/customer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Spinner from '../loading/Spinner';

interface AvatarProps {
  user: UserType;
  cover?: string;
  width?: string;
  onClick?: () => void;
  textSize?: string;
}

function randomColor(texto: string) {
  const first = texto?.[0] ?? 'A';
  const ascii = first.charCodeAt(0);
  const r = Math.floor((ascii * 3) % 128);
  const g = Math.floor((ascii * 3) % 128);
  const b = (ascii * 9) % 256;
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  return hex;
}

const Avatar: React.FC<AvatarProps> = ({
  user = { name: '', icon: '' },
  cover = '',
  width = 'w-12',
  textSize = 'text-[22px]',
  onClick,
}) => {
  const [validImage, setValidImage] = useState<boolean>(Boolean(user.icon));
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!loaded) {
          setValidImage(false);
          setLoaded(true);
        }
      },
      Math.random() * 700 + 500,
    );
    return () => clearTimeout(timeout);
  }, [loaded]);

  const bgColor = useMemo(() => randomColor(user.name || 'A'), [user.name]);

  const handleImgLoad = useCallback(() => setLoaded(true), []);
  const handleImgError = useCallback(() => {
    setValidImage(false);
    setLoaded(true);
  }, []);

  const initialLetter = (user.name || '?').charAt(0).toUpperCase();

  return (
    <div className={`group flex items-center justify-center flex-shrink-0 aspect-square ${width}`}>
      <button
        type="button"
        title={user.name}
        aria-label={user.name}
        onClick={onClick}
        className="flex-shrink-0 w-full h-full bg-none bg-transparent outline-0 relative overflow-hidden border-2 border-[#F2F4F7] rounded-full"
      >
        {!loaded && (
          <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full bg-[rgba(0,0,0,.2)]">
            <Spinner color="black" width="20px" />
          </div>
        )}

        {cover !== '' && (
          <div className="flex items-center absolute top-0 left-0 text-[#F2F4F7] text-[12px] font-semibold w-full h-full justify-center bg-[rgba(0,0,0,.4)]">
            {cover}
          </div>
        )}

        {validImage ? (
          <img
            className="object-cover w-[200%]"
            src={user.icon ?? ''}
            onLoad={handleImgLoad}
            onError={handleImgError}
            alt={user.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span
            className={`text-white h-full w-full text-center flex justify-center items-center ${textSize}`}
            style={{ background: bgColor }}
          >
            {initialLetter}
          </span>
        )}
      </button>
    </div>
  );
};

export default Avatar;
