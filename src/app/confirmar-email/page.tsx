'use client'
import api from "@/utils/classes/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ConfirmarEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      toast.error('Token de confirmação não encontrado');
      router.replace('/autenticacao/login');
      return;
    }

    const storageKey = `confirmed-email-${token}`;
    if (sessionStorage.getItem(storageKey) === 'true') {
      router.replace('/autenticacao/login');
      return;
    }

    const confirmarEmail = async () => {
      try {
        const [response, error] = await api.post('/loja/confirmar-email', { token });
        if (error) {
          toast.error(error.message);
          router.replace('/autenticacao/login');
          return;
        }

        toast.success('Email confirmado com sucesso! Você já pode fazer login.');
        sessionStorage.setItem(storageKey, 'true');
        router.replace('/autenticacao/login');
      } catch (err) {
        toast.error('Erro ao confirmar email. Por favor, tente novamente.');
        router.replace('/autenticacao/login');
      } finally {
        setIsLoading(false);
      }
    };

    confirmarEmail();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F2F4F7] p-6">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <Image src="/images/logo_autopilot_dark.svg" alt="AutoPilot CRM Logo" fill className="object-contain" />
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1B263A] border-r-transparent"></div>
            <p className="text-sm text-[#1B263A]/80">Confirmando seu email...</p>
          </div>
        )}
      </div>
    </main>
  );
}
