'use client';

import { BackofficeSidebar } from '@/components/nav/backoficce-sidebar';
import { BackofficeMobileNav } from '@/components/nav/backofice-mobile-nav';
import { MobileTopBar } from '@/components/nav/mobile-topbar';
import SucessMessage from '@/components/sections/ModalInfo';
import SucessMessageMiddle from '@/components/sections/dashboard/ModalInfoMiddel';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { Suspense, useState } from 'react';

import { ObserverContext, type Observer } from '@/contexts/observer.context';

export default function BackofficeAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [observer, setObserver] = useState<Observer>({
    type: '',
    data: {},
  });

  return (
    <SidebarProvider>
      <ObserverContext.Provider value={{ observer, setObserver }}>
        <BackofficeAppContent>{children}</BackofficeAppContent>
      </ObserverContext.Provider>
    </SidebarProvider>
  );
}

function BackofficeAppContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <div className="bg-white md:bg-[hsl(var(--secondary))] w-screen h-screen overflow-hidden relative flex flex-col md:flex-row">
      <div
        className={`hidden md:block max-h-screen transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'min-w-[300px]'}`}
      >
        <BackofficeSidebar />
      </div>

      <button
        onClick={toggleCollapsed}
        className="hidden md:block absolute top-12 z-[100] bg-[hsl(var(--secondary))] border border-[#2A3E65] text-secondary-foreground hover:text-[hsl(var(--primary))] transition-all duration-200 p-1.5 rounded-lg hover:bg-[#222D4280] shadow-lg"
        style={{
          left: isCollapsed ? '90px' : '310px',
          transform: 'translateX(-50%)',
        }}
        aria-label={isCollapsed ? 'Expandir menu' : 'Retrair menu'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={isCollapsed ? 'M7 4L13 10L7 16' : 'M13 4L7 10L13 16'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="block md:hidden">
        <MobileTopBar dashboardHref="/backoffice/app/dashboard" />
      </div>

      <div className="block md:hidden z-50">
        <BackofficeMobileNav />
      </div>

      <Suspense>
        <div className="w-full md:m-3 ml-0 overflow-hidden bg-[#F2F4F7] rounded-none md:rounded-[1.25rem] transition-all duration-300 flex-1">
          <div id="content-container" className="relative w-full h-full overflow-hidden">
            <div className="w-full h-full pb-[6rem] md:pb-0 overflow-y-auto scrollbar">
              {children}
              <SucessMessage />
              <SucessMessageMiddle />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
