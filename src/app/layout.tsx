import type { Metadata } from 'next';
import localFont from 'next/font/local';
import 'boxicons/css/boxicons.min.css';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';

const brSonoma = localFont({
  src: [
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-Light-BF654c452608e0f.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-LightItalic-BF654c45266aa83.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-Regular-BF654c45266c042.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-RegularItalic-BF654c452681c11.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-Medium-BF654c45266edd1.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-MediumItalic-BF654c45267d45f.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-SemiBold-BF654c45268c340.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-SemiBoldItalic-BF654c452696350.otf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-Bold-BF654c4526823f5.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BR_Sonoma/BRSonoma-BoldItalic-BF654c4525c9c27.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

export const metadata: Metadata = {
  title: 'AutoPilot CRM',
  description: 'AutoPilot CRM - O CRM Inteligente para Concessionárias e Revendas de Veículos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={`${brSonoma.className} bg-[hsl(var(--secondary))] overflow-y-auto`}>
        <div className="fixed z-[2147483647] w-screen top-0 left-0 h-screen pointer-events-none">
          <Toaster
            position="top-right"
            gutter={8}
            containerStyle={{ zIndex: 2147483647 }}
            toastOptions={{
              style: { zIndex: 2147483647 },
            }}
          />
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
