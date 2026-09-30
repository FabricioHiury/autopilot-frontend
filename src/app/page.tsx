'use client';
import api, { apiAdmin } from '@/utils/classes/api';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import packageInfo from '../../package.json';

export default function SplashScreen() {
  const router = useRouter();
  const [_, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const validateAndRedirect = async () => {
      const currentPath = window.location.pathname;
      try {
        const isBackofficePath = window.location.pathname.includes('backoffice');

        if (isBackofficePath) {
          const backofficeToken = localStorage.getItem('token-backoffice');
          const cookieToken = Cookies.get('secure_token_backoffice');

          if (!backofficeToken && !cookieToken) {
            router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard')}`);
            return;
          }

          try {
            const [backofficeResponse, backofficeError] = await apiAdmin.post('/auth/validate');

            if (backofficeResponse?.authenticated) {
              if (backofficeResponse.token) {
                const expiryDays = 1;
                localStorage.setItem('token-backoffice', backofficeResponse.token);
                Cookies.set('secure_token_backoffice', backofficeResponse.token, {
                  expires: expiryDays,
                  secure: true,
                  sameSite: 'strict'
                });
              }

              const targetPath = backofficeResponse.redirect || (currentPath !== '/' ? currentPath : '/backoffice/app/dashboard');
              router.push(targetPath);
            } else {
              if (backofficeError && backofficeError.status === 401) {
                localStorage.removeItem('token-backoffice');
                localStorage.removeItem('usuario-backoffice');
                Cookies.remove('secure_token_backoffice');
                router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard')}`);
              } else {
                router.push(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard');
              }
            }
          } catch (error) {
            console.error("Erro na validação, prosseguindo com token existente:", error);
            router.push(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard');
          }
        } else {
          const appToken = localStorage.getItem('token');
          const cookieToken = Cookies.get('secure_token');

          if (!appToken && !cookieToken) {
            router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/app/dashboard')}`);
            return;
          }

          try {
            const [appResponse, appError] = await api.post('/auth/validate');

            if (appResponse?.authenticated) {
              if (appResponse.token) {
                const expiryDays = 1;
                localStorage.setItem('token', appResponse.token);
                Cookies.set('secure_token', appResponse.token, {
                  expires: expiryDays,
                  secure: true,
                  sameSite: 'strict'
                });
              }

              const targetPath = appResponse.redirect || (currentPath !== '/' ? currentPath : '/app/dashboard');
              router.push(targetPath);
            } else {
              if (appError && appError.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                Cookies.remove('secure_token');
                router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/app/dashboard')}`);
              } else {
                router.push(currentPath !== '/' ? currentPath : '/app/dashboard');
              }
            }
          } catch (error) {
            console.error("Erro na validação, prosseguindo com token existente:", error);
            router.push(currentPath !== '/' ? currentPath : '/app/dashboard');
          }
        }
      } catch (error) {
        console.error('Erro geral:', error);
        const isBackofficePath = window.location.pathname.includes('backoffice');

        if (isBackofficePath) {
          const hasToken = localStorage.getItem('token-backoffice') || Cookies.get('secure_token_backoffice');
          if (hasToken) {
            router.push(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard');
          } else {
            router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/backoffice/app/dashboard')}`);
          }
        } else {
          const hasToken = localStorage.getItem('token') || Cookies.get('secure_token');
          if (hasToken) {
            router.push(currentPath !== '/' ? currentPath : '/app/dashboard');
          } else {
            router.push(`/autenticacao/login?redirect=${encodeURIComponent(currentPath !== '/' ? currentPath : '/app/dashboard')}`);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      validateAndRedirect();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isClient, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F1522] p-6">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="w-64 h-64 relative animate-pulse">
          <Image
            src={'/images/logo_autopilot.svg'}
            alt="AutoPilot Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="text-white/60 text-xs font-mono">v{packageInfo.version}</span>
      </div>
    </main>
  );
}