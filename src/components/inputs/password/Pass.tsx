import { cn } from '@/lib/class-name.utils';
import { useState, memo, useCallback } from 'react';

interface props {
  placeholder: string;
  label: string;
  icon?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Pass: React.FC<props> = ({
  placeholder = 'Insira sua senha',
  label = 'Insira sua senha',
  icon,
  onChange,
}) => {
  const [showPass, setShowPass] = useState(false);

  const changeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event);
    },
    [onChange],
  );

  const toggleShow = useCallback(() => {
    setShowPass((old) => !old);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-0 relative w-full">
        <span className="text-[12px] text-[#485B80] font-semibold">{label}</span>
        <div className="relative w-full flex items-center">
          {icon && <img src="/icons/cad.svg" alt="" className="w-3 absolute left-[16px]" />}
          <input
            className={cn(
              'px-[16px] py-[8px] w-full text-[#485B80] text-[14px] placeholder:text-[#95A3B2] rounded-md border focus:border-[#485B80] outline-none',
              icon ? 'pl-[34px]' : 'pl-[10px]',
            )}
            type={showPass ? 'text' : 'password'}
            onChange={changeEvent}
            placeholder={placeholder}
          />
          <img
            onClick={toggleShow}
            className="w-[17px] right-[15px] absolute object-contain cursor-pointer"
            src={'/icons/eye-' + (showPass ? 'open' : 'closed') + '.svg'}
            alt=""
          />
        </div>
      </div>
    </>
  );
};

export default memo(Pass);
