import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface props {
  totalPages: number;
  limitNumberPages: number;
  limitItens: number;
  setLimitItens: Function;
  total: number;
  padding?: string;
  background?: string;
  label?: string;
  setPage: Function;
  page: number;
  currentLength: number;
}

const Pagination: React.FC<props> = ({
  totalPages = 1,
  limitNumberPages = 4,
  setLimitItens,
  limitItens,
  total = 7,
  padding,
  background,
  setPage,
  page,
  currentLength,
  label = 'Clientes',
}) => {
  const params = useSearchParams();

  function increaseLimit() {
    if (limitItens >= 10) {
      return;
    }
    setLimitItens((old: number) => (old += 1));
  }
  function decreaseLimit() {
    if (limitItens <= 1) {
      return;
    }
    setLimitItens((old: number) => (old -= 1));
  }

  async function prev() {
    if (page <= 1) {
      return;
    }
    setPage((old: number) => old - 1);
  }
  async function next() {
    if (page >= totalPages) {
      return;
    }
    setPage((old: number) => old + 1);
  }

  return (
    <div
      className={
        'flex flex-row items-center justify-between relative w-full ' + padding + ' ' + background
      }
    >
      <div className="z-10 hidden lg:flex items-center text-[#7F8999] text-sm gap-1">
        Mostrando <b className="text-[#485B80] font-semibold">{currentLength}</b> de{' '}
        <b className="text-[#485B80] font-semibold">{total}</b> {label}
      </div>

      <div className="z-10 flex flex-row items-center gap-4">
        <button
          className="border border-[#DDE6F2] w-8 h-10 rounded-lg flex items-center justify-center rotate-180"
          onClick={prev}
        >
          <img src="/icons/arrow_2.svg" alt="" />
        </button>
        <div className="flex items-center gap-4">
          {Array.from({ length: totalPages }).map((_, index) => {
            if (index > page - limitNumberPages && index < page + limitNumberPages) {
              return (
                <button
                  key={index}
                  className={
                    'border-none outline-none bg-transparent text-[16px] font-semibold' +
                    ' ' +
                    (index + 1 == page ? 'text-[hsl(var(--primary))]' : 'text-[#C8CCD2]')
                  }
                  onClick={() => {
                    setPage(index + 1);
                  }}
                >
                  {index + 1}
                </button>
              );
            }
          })}
        </div>
        <button
          className="border border-[#DDE6F2] rounded-lg w-8 h-10 flex items-center justify-center"
          onClick={next}
        >
          <img src="/icons/arrow_2.svg" alt="" />
        </button>
      </div>

      <div className=" z-10 flex items-center text-[hsl(var(--primary))] text-[14px] gap-4">
        <p className="hidden lg:block">Resultados por pagina</p>
        <div className="flex border-2 items-center gap-3 border-[#DDE6F2] p-1 lg:px-3 px-4 rounded-xl select-none">
          <b>{limitItens}</b>
          <div className="flex flex-col">
            <button className="border-0 outline-none" onClick={increaseLimit}>
              <img src="/icons/arrow_2.svg" className="w-4 lg:w-auto rotate-[270deg]" alt="" />
            </button>

            <button className="border-0 outline-none" onClick={decreaseLimit}>
              <img src="/icons/arrow_2.svg" className="w-4 lg:w-auto rotate-[90deg]" alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
