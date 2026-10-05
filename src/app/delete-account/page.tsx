'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    setIsLoading(true);

    // Mock: Simular envio de email
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  if (emailSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F2F4F7] p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-24 h-24">
                <Image
                  src="/images/logo_autopilot_dark.svg"
                  alt="AutoPilot CRM Logo"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold text-[#1B263A]">E-mail enviado!</h1>
                <p className="text-[#485B80]">
                  Enviamos um e-mail para <strong>{email}</strong> com as instruções para excluir
                  sua conta.
                </p>
                <p className="text-sm text-[#485B80]">
                  Por favor, verifique sua caixa de entrada e siga os passos indicados.
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-[#1B263A] text-white px-6 py-3 rounded-lg hover:bg-[#2a3441] transition-colors font-medium"
                >
                  Ir para Login
                </button>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full text-[#1B263A] hover:text-[hsl(var(--primary))] transition-colors font-medium"
                >
                  Enviar novamente
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="text-[#485B80] hover:text-[#1B263A] transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F2F4F7] p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-24 h-24">
              <Image
                src="/images/logo_autopilot_dark.svg"
                alt="AutoPilot CRM Logo"
                fill
                className="object-contain"
              />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-[#1B263A]">Excluir Conta</h1>
              <p className="text-[#485B80] text-sm">
                Lamentamos que você deseje nos deixar. Digite seu e-mail para continuar.
              </p>
            </div>

            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Esta ação é permanente e todos os seus dados serão
                  removidos.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1B263A] mb-2">
                  E-mail da conta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent text-[#1B263A] placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-[hsl(var(--primary))] text-primary-foreground px-6 py-3 rounded-lg hover:bg-[#b82d29] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Processando...
                  </>
                ) : (
                  'Solicitar Exclusão'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-[#485B80] hover:text-[#1B263A] transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Cancelar
          </button>
        </div>
      </div>
    </main>
  );
}
