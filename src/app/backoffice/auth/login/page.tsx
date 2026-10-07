'use client';
import WrapperFormAuth from '@/components/cards/WrapperFormAuth';
import BackgroundCar from '@/components/sections/cadastro/BackgroundCar';
import BackofficeFormLogin from '@/components/sections/login/BackofficeFormLogin';

export default function SignUpPage() {
  return (
    <>
      <WrapperFormAuth>
        <div className="flex flex-col gap-2">
          <h1 className="leading-tight text-[22px] lg:text-[32px] text-[#1B263A] font-bold">
            Administração AutoPilot CRM
          </h1>
          <h2 className="text-[16px] text-[hsl(var(--secondary))] font-semibold">
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
            himenaeos.
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <BackofficeFormLogin />
        </div>
      </WrapperFormAuth>
      <BackgroundCar />
    </>
  );
}
