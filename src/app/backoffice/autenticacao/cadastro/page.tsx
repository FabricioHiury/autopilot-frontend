'use client'
import WrapperFormAuth from "@/components/cards/WrapperFormAuth";
import LayoutFlag from "@/components/sections/cadastro/LayoutFlag";
import SignUpForm from "@/components/sections/cadastro/SignUpForm";

export default function SignUpPage() {
  return (
    <>
        <WrapperFormAuth>
          <div className="flex flex-col gap-2">
            <h1 className="leading-tight text-[22px] lg:text-[32px] text-[#1B263A] font-bold">Crie uma conta para começar a usar as nossas ferramentas</h1>
            <h2 className="text-[16px] text-[#293856] font-semibold">Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</h2>
          </div>
          <div className="flex flex-col gap-4">
            <SignUpForm/>
          </div>
        </WrapperFormAuth>
      <LayoutFlag/>
    </>
   );
}
