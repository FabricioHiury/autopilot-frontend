'use client';
import WrapperFormAuth from '@/components/cards/WrapperFormAuth';
import BackgroundCar from '@/components/sections/cadastro/BackgroundCar';
import FormRecupera from '@/components/sections/reset-password/FormRecupera';

export default function RecoverPassPage() {
  return (
    <>
      <WrapperFormAuth>
        <div className="flex flex-col gap-2">
          <h1 className="leading-tight text-[22px] lg:text-[32px] text-[#1B263A] font-bold">
            Redefina sua senha
          </h1>
          <h2 className="text-[16px] text-[hsl(var(--secondary))] font-semibold">
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
            himenaeos.
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <FormRecupera />
        </div>
      </WrapperFormAuth>
      <BackgroundCar />
    </>
  );
}
