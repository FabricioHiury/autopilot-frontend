import { UserType } from '@/types/customer';
import { useEffect, useState } from 'react';
import Spinner from '../loading/Spinner';

interface props {
  user: UserType;
  size?: string;
  rounded?: string;
}

function randomColor(texto: string) {
  const codigoAscii = texto.charCodeAt(0);
  const r = Math.floor((codigoAscii * 3) % 128);
  const g = Math.floor((codigoAscii * 3) % 128);
  const b = (codigoAscii * 9) % 256;
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  return hex;
}

const AvatarBig: React.FC<props> = ({
  user = { name: '', icon: '' },
  size = '164px',
  rounded = '16px',
}) => {
  const [validImagem, setValidImagem] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!loaded) {
          setValidImagem(false);
          setLoaded(true);
        }
      },
      Math.random() * 700 + 500,
    );

    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <>
      <div
        className="group flex relative items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: size, height: size, borderRadius: rounded }}
      >
        {!loaded && (
          <div className="absolute top-0 flex justify-center items-center left-0 w-full h-full bg-[rgba(0,0,0,.2)]">
            <Spinner color="black" width="24px" />
          </div>
        )}
        {validImagem ? (
          <img
            className="object-cover w-[200%]"
            src={user.icon ?? ''}
            onLoad={() => setLoaded(true)}
            onError={() => setValidImagem(false)}
            alt=""
          />
        ) : (
          <span
            className={' text-white h-full w-full text-center flex justify-center items-center '}
            style={{
              background: randomColor(user.name),
              fontSize: parseInt(size.replace('px', '')) / 3 + 'px',
            }}
          >
            {user.name[0]}
          </span>
        )}
      </div>
    </>
  );
};

export default AvatarBig;
