import { PopWrapperRef } from '@/types/customer';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

const PopWrapper = forwardRef<PopWrapperRef, Props>(({ children }, ref) => {
  const [visible, setVisible] = useState<boolean>(false);

  function show() {
    setVisible(true);
  }
  function drop() {
    setVisible(false);
  }
  useImperativeHandle(ref, () => ({
    show,
    drop,
  }));

  return (
    <>
      <div
        className={
          'z-30 border-none outline-none transition-all duration-500 fixed w-screen h-screen top-0 left-0 flex justify-end items-center ' +
          (visible ? 'bg-[rgba(0,0,0,.2)]' : 'invisible')
        }
      >
        <div
          className={
            'z-50 flex flex-col gap-3 lg:p-[32px] pb-32 p-6 transition-all duration-500 scroll-padrao bg-white min-h-full max-h-full rounded-lg overflow-y-auto ' +
            (visible ? '' : ' translate-x-[100%]')
          }
        >
          {children}
        </div>
        <button
          className="z-10 absolute w-full h-full"
          onClick={() => {
            setVisible(false);
          }}
        ></button>
      </div>
    </>
  );
});

export default PopWrapper;
