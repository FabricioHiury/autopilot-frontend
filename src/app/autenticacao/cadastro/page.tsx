'use client'
import WrapperFormAuth from "@/components/cards/WrapperFormAuth";
import LayoutFlag from "@/components/sections/cadastro/LayoutFlag";
import SignUpForm from "@/components/sections/cadastro/SignUpForm";
import Link from "next/link";
import { memo, useMemo } from "react";

function SignUpPage() {
  const staticHeader = useMemo(() => (
    <div className="flex flex-col gap-3 lg:gap-4">
      <Link href="/autenticacao/login" className="flex items-center gap-2 text-[#485B80] hover:text-[#1B263A] transition-all duration-200 w-fit group">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-1 transition-transform">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        <span className="text-[13px] lg:text-[14px] font-semibold">Voltar ao login</span>
      </Link>
      <div className="flex flex-col gap-2 lg:gap-3">
        <h1 className="leading-tight text-[22px] lg:text-[36px] text-[#1B263A] font-bold">
          Crie sua conta gratuita
        </h1>
        <p className="text-[13px] lg:text-[16px] text-[#485B80] font-normal leading-relaxed">
          Preencha os dados abaixo e comece a usar todas as ferramentas do AutoPilot CRM.
        </p>
      </div>
    </div>
  ), []);

  const staticBackground = useMemo(() => (
    <LayoutFlag />
  ), []);

  return (
    <>
      <WrapperFormAuth>
        <div className="lg:hidden flex justify-center mb-6">
          <img src="/images/logo_autopilot_dark.svg" alt="AutoPilot CRM Logo" className="h-12" />
        </div>
        {staticHeader}
        <SignUpForm />
      </WrapperFormAuth>
      {staticBackground}
    </>
  );
}

export default memo(SignUpPage);
