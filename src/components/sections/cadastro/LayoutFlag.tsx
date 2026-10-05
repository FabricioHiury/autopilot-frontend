import { memo } from 'react';

function LayoutFlag() {
  return (
    <div className="hidden lg:flex lg:h-screen lg:w-1/2 justify-center items-center relative bg-gradient-to-t from-[#0A0F18] to-[#232529] overflow-hidden pointer-events-none z-0">
      <img
        src="/images/city.png"
        className="absolute opacity-40 object-cover w-full h-full"
        alt=""
      />
      <img src="/icons/cadMenu_vector2.svg" className="absolute right-[49%] w-[60%]" alt="" />
      <img src="/icons/cadMenu_vector.svg" className="absolute left-[49%] w-[60%]" alt="" />
    </div>
  );
}

export default memo(LayoutFlag);
