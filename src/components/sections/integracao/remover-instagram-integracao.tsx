'use client';
import Link from 'next/link';

export function RemoverInstagramIntegracao() {
  return (
    <div className="flex flex-col gap-0 ">
      <b className="text-[16px] pb-4">Sua conta está integrada ao Instagram</b>

      <div className="flex w-full justify-between items-center gap-4 border border-[#D9D9D9] rounded-[0.5rem] p-4">
        <div className="flex-1">
          <p className="text-xs">
            Para remover a integração revogue o acesso da AutoPilot nas configurações da sua conta
            no Instagram.
          </p>
        </div>
        <Link
          target="_blank"
          href="https://www.instagram.com/accounts/manage_access"
          className="text-primary-foreground bg-[hsl(var(--primary))] rounded-full p-3 px-4 flex items-center justify-center font-semibold text-sm"
        >
          Configurações do Instagram
        </Link>
      </div>
    </div>
  );
}
