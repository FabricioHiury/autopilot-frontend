'use client';
import WrapperFormAuth from '@/components/cards/WrapperFormAuth';
import BackgroundCar from '@/components/sections/cadastro/BackgroundCar';
import FormLogin from '@/components/sections/login/FormLogin';
import { memo, useMemo } from 'react';

function SignUpPage() {
  const staticHeader = useMemo(
    () => (
      <div className="flex flex-col gap-2 lg:gap-3">
        <h1 className="leading-tight text-[24px] lg:text-[36px] text-[#1B263A] font-bold">
          Entre na sua conta
        </h1>
        <h2 className="text-[14px] lg:text-[17px] text-[#485B80] font-normal leading-relaxed">
          Acesse sua conta para utilizar as ferramentas do AutoPilot CRM e aproveitar todas as
          funcionalidades disponíveis.
        </h2>
      </div>
    ),
    [],
  );

  const staticBackground = useMemo(() => <BackgroundCar />, []);

  return (
    <>
      <WrapperFormAuth>
        <div className="min-h-full flex flex-col justify-center">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/images/logo_autopilot_dark.svg" alt="AutoPilot CRM Logo" className="h-12" />
          </div>
          {staticHeader}
          <div className="flex flex-col gap-4">
            <FormLogin />
          </div>
        </div>
      </WrapperFormAuth>
      <div className="hidden lg:block lg:w-1/2">{staticBackground}</div>
    </>
  );
}

export default memo(SignUpPage);
