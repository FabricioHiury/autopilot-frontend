import { ReactNode } from 'react';

interface props {
  children: ReactNode;
}

const ScrollAreaDefault: React.FC<props> = ({ children }) => {
  return (
    <>
      <main className="w-full h-full bg-[#F2F4F7] rounded-none overflow-hidden pb-20 md:pb-0 md:rounded-[1.25rem]">
        <div className="relative scroll-padrao w-full h-full flex-grow overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </>
  );
};

export default ScrollAreaDefault;
