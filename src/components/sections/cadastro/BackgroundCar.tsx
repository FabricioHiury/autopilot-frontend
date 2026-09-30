import CarImage from "@/components/cards/CarImage";
import { memo } from "react";

function BackgroundCar() {
  return (
    <>
      <div className="lg:h-screen flex w-full justify-center items-center relative h-[440px] flex-grow np:min-h-screen  np:h-full bg-gradient-to-t from-[#0A0F18] to-[#232529] overflow-hidden" >
        <div className="absolute top-[20%] left-0 w-full h-full flex justify-end">
          <div className="flex flex-col gap-2 absolute w-[70%] lg:w-[50%] mr-4 h-full z-20">
            <div className="flex flex-row gap-2 items-center">
              <img src="/images/trofeu.png" alt="" />
              <h1 className="text-[16px] lg:text-[28px] font-semibold text-white" >Seu piloto de gestão nº 1</h1>
            </div>
            <h2 className="text-[#C8CCD2] font-normal text-[10px] lg:text-[14px]"> <b className="font-semibold">Sistema de gestão de estoque</b> , finanças, anúncios e atendimentos para lojas de venda e revenda de veículos novos e seminovos.</h2>
          </div>
        </div>
        <img src="/icons/cadMenu_vector2.svg" className="absolute w-[40%] left-0 top-[30%] lg:top-[12%] object-contain z-10 brightness-0" alt="" />
        <img src="/images/logo_autopilot.svg" className="absolute z-50 left-6 top-6" alt="" />
        <div className="absolute flex flex-row items-center justify-center top-[18%] lg:top-0 left-[-10%] w-full h-full">
          <CarImage />
        </div>
      </div>
    </>
  )
}

export default memo(BackgroundCar);