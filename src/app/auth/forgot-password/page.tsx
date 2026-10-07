'use client';
import WrapperFormAuth from '@/components/cards/WrapperFormAuth';
import BackgroundCar from '@/components/sections/cadastro/BackgroundCar';
import FormRecuperaConta from '@/components/sections/forgot-password/FormRecuperaConta';
import Link from 'next/link';
import { memo, useMemo } from 'react';

function RecoverPassPage() {
  const staticHeader = useMemo(
    () => (
      <div className="flex flex-col gap-3 lg:gap-4">
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-[#485B80] hover:text-[#1B263A] transition-all duration-200 w-fit group"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[13px] lg:text-[14px] font-semibold">Voltar ao login</span>
        </Link>
        <div className="flex flex-col gap-2 lg:gap-3">
          <h1 className="leading-tight text-[24px] lg:text-[36px] text-[#1B263A] font-bold">
            Recupere sua conta
          </h1>
          <h2 className="text-[14px] lg:text-[17px] text-[#485B80] font-normal leading-relaxed">
            Informe seu e-mail cadastrado para receber um endereço de recuperação e voltar a acessar
            sua conta com segurança.
          </h2>
        </div>
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
            <FormRecuperaConta />
          </div>
        </div>
      </WrapperFormAuth>
      <div className="hidden lg:block lg:w-1/2">{staticBackground}</div>
    </>
  );
}

export default memo(RecoverPassPage);
