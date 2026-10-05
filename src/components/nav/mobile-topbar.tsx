'use client';
import { TenantLogo } from './TenantLogo';

import Link from 'next/link';
import HomeIcon from './icons/home-icon';
import ServiceIcon from './icons/service-icon';
import ChatIcon from './icons/chat-icon';
import CustomerIcon from './icons/customer-icon';
import ConfigIcon from './icons/config-icon';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export const MobileTopBar = () => {
  return (
    <nav className="text-secondary-foreground z-10 sticky top-0 left-0 w-full bg-[hsl(var(--secondary))] px-4 py-5 flex items-center justify-between">
      <Link href={'/app/dashboard'} className="flex flex-col gap-0">
        <TenantLogo dark />
        <span className="font-normal text-[0.6rem]">Seu sistema n1 em gestão veicular.</span>
      </Link>

      {/* <Link href={"/app/settings/store"}>

                <div className="w-10 h-10 rounded-full border border-white font-semibold text-[.85rem] flex items-center justify-center text-primary-foreground bg-[hsl(var(--primary))] relative">
                    AC
                    <span className="block bg-[#24AE6C] w-[.518rem] h-[.518rem] rounded-full absolute bottom-0.5 right-0"></span>
                </div>

            </Link> */}
    </nav>
  );
};
